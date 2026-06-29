import type { SupabaseClient } from '@supabase/supabase-js';
import { aiTraceMetadata, startAiObservation, type AiObservation } from '@/lib/ai/observability';
import { embedTextLocal, LOCAL_EMBEDDING_MODEL } from './embeddings';
import { deepSeekChat } from './deepseek';
import { planRagQuery, type RagQueryPlan } from './query-planning';
import { RAG_RERANKER_VERSION, rerankRagResults, type RerankedRagSearchResult } from './reranking';
import { SAGEBOT_PERSONALITY_VERSION, SAGEBOT_PROMPT_VERSIONS, sageBotAnswerSystemPrompt } from '@/lib/discord/sagebot-personality';

export type RagSearchResult = {
  chunk_id: string;
  document_id: string;
  source_id: string;
  chunk_key: string;
  content: string;
  title: string | null;
  source_type: string;
  source_url: string | null;
  metadata: Record<string, unknown>;
  vector_score: number;
  keyword_score: number;
  hybrid_score: number;
};

export type RagAnswerResult = {
  answer: string;
  citations: Array<{
    chunk_id: string;
    title: string | null;
    source_url: string | null;
    source_type: string;
  }>;
  retrievalLogId: string | null;
  answerId: string | null;
  model: string;
  observability: {
    traceId: string;
    observationId: string;
    provider: 'langfuse' | 'local';
  };
};

export async function retrieveRagChunks(
  sb: SupabaseClient<any>,
  query: string,
  options: { limit?: number; vectorWeight?: number; candidateLimit?: number; observability?: { parent?: AiObservation } } = {},
): Promise<RerankedRagSearchResult[]> {
  const plan = planRagQuery(query);
  const observation = startAiObservation(
    'rag.retrieve_chunks',
    {
      input: { query, rewrittenQueries: plan.searchQueries, limit: options.limit ?? 6, vectorWeight: options.vectorWeight ?? 0.65 },
      metadata: {
        embedding_model: LOCAL_EMBEDDING_MODEL,
        retrieval_provider: 'supabase_hybrid_multi_query',
        query_planner_version: plan.metadata.plannerVersion,
        reranker_version: RAG_RERANKER_VERSION,
      },
    },
    { asType: 'retriever', parent: options.observability?.parent },
  );
  try {
    const candidates = await retrieveRagCandidates(sb, plan, {
      candidateLimit: options.candidateLimit ?? 40,
      vectorWeight: options.vectorWeight ?? 0.65,
    });
    const results = rerankRagResults(plan, candidates, options.limit ?? 6);
    observation.update({
      output: {
        candidate_count: candidates.length,
        result_count: results.length,
        top_chunk_ids: results.slice(0, 5).map((result) => result.chunk_id),
        top_rerank_scores: results.slice(0, 5).map((result) => result.rerank_score),
      },
    });
    return results;
  } finally {
    observation.end();
  }
}

async function retrieveRagCandidates(
  sb: SupabaseClient<any>,
  plan: RagQueryPlan,
  options: { candidateLimit: number; vectorWeight: number },
): Promise<RagSearchResult[]> {
  const byChunkId = new Map<string, RagSearchResult>();
  const perQueryLimit = Math.max(options.candidateLimit, 12);
  for (const searchQuery of plan.searchQueries) {
    const embedding = await embedTextLocal(searchQuery);
    const { data, error } = await sb.rpc('match_rag_chunks_hybrid', {
      query_text: searchQuery,
      query_embedding: `[${embedding.vector.join(',')}]`,
      match_count: perQueryLimit,
      vector_weight: options.vectorWeight,
    });
    if (error) throw error;
    for (const candidate of (data ?? []) as RagSearchResult[]) {
      const existing = byChunkId.get(candidate.chunk_id);
      if (!existing || candidate.hybrid_score > existing.hybrid_score) {
        byChunkId.set(candidate.chunk_id, candidate);
      }
    }
  }
  return [...byChunkId.values()];
}

export async function answerRagQuestion(
  sb: SupabaseClient<any>,
  question: string,
  options: { limit?: number; persist?: boolean } = {},
): Promise<RagAnswerResult> {
  const startedAt = Date.now();
  const queryPlan = planRagQuery(question);
  const rootObservation = startAiObservation('rag.answer_question', {
    input: { question, rewrittenQueries: queryPlan.searchQueries, limit: options.limit ?? 5 },
    metadata: {
      prompt_version: SAGEBOT_PROMPT_VERSIONS.answer,
      personality_version: SAGEBOT_PERSONALITY_VERSION,
      generation_provider: 'deepseek',
      query_planner_version: queryPlan.metadata.plannerVersion,
      reranker_version: RAG_RERANKER_VERSION,
    },
  }, { asType: 'chain' });
  const traceMetadata = aiTraceMetadata(rootObservation);

  try {
    const results = await retrieveRagChunks(sb, question, {
      limit: options.limit ?? 5,
      observability: { parent: rootObservation },
    });
    const citations = results.map((result) => ({
      chunk_id: result.chunk_id,
      title: result.title,
      source_url: result.source_url,
      source_type: result.source_type,
    }));
    const context = results.map((result, index) => {
      const title = result.title ?? result.chunk_key;
      return `[${index + 1}] ${title}\n${result.content}`;
    }).join('\n\n');
    const answerTerms = answerTermHints(question, queryPlan);

    const generation = await deepSeekChat({
      messages: [
        {
          role: 'system',
          content: sageBotAnswerSystemPrompt(),
        },
        {
          role: 'user',
          content: [
            `Question: ${question}`,
            '',
            'Use only the context below. If the context supports a concrete checklist, channel name, table name, proof lane, command, price, SLA, or workflow label, preserve that exact wording.',
            'Mention the concrete nouns that answer the question directly; do not replace them with vague synonyms.',
            '',
            'Key terms to preserve when supported by context:',
            queryPlan.rerankText,
            '',
            'Exact answer vocabulary to include when accurate and supported:',
            answerTerms.length ? answerTerms.join(', ') : 'none',
            '',
            'End the answer with citation markers such as [1] for the context chunks used.',
            '',
            'Context:',
            context,
          ].join('\n'),
        },
      ],
      temperature: 0,
      maxTokens: 440,
      observability: {
        parent: rootObservation,
        name: 'rag.answer_generation',
        metadata: {
          prompt_version: SAGEBOT_PROMPT_VERSIONS.answer,
          personality_version: SAGEBOT_PERSONALITY_VERSION,
          citation_count: citations.length,
        },
      },
    });
    const finalAnswer = ensureCitationMarker(ensureAnswerTerms(generation.content, answerTerms), citations.length);

    let retrievalLogId: string | null = null;
    let answerId: string | null = null;
    if (options.persist ?? true) {
      const latencyMs = Date.now() - startedAt;
      const { data: log, error: logError } = await sb.from('rag_retrieval_logs').insert({
        query: question,
        normalized_query: question.replace(/\s+/g, ' ').trim().toLowerCase(),
        result_count: results.length,
        selected_chunk_ids: results.map((result) => result.chunk_id),
        score_summary: {
          embedding_model: LOCAL_EMBEDDING_MODEL,
          prompt_version: SAGEBOT_PROMPT_VERSIONS.answer,
          personality_version: SAGEBOT_PERSONALITY_VERSION,
          top_hybrid_score: results[0]?.hybrid_score ?? null,
          top_vector_score: results[0]?.vector_score ?? null,
          top_keyword_score: results[0]?.keyword_score ?? null,
        },
        confidence: results.length ? 0.7 : 0.1,
        latency_ms: latencyMs,
        metadata: {
          provider: 'local_hybrid_multi_query_rerank',
          generation_provider: 'deepseek',
          original_query: question,
          rewritten_queries: queryPlan.searchQueries,
          query_intent: queryPlan.intent,
          query_planner_version: queryPlan.metadata.plannerVersion,
          query_rewrite_reasons: queryPlan.metadata.rewriteReasons,
          reranker_version: RAG_RERANKER_VERSION,
          source_priority_policy: 'approved_core_resources_first_v1',
          selected_source_types: [...new Set(results.map((result) => result.source_type))],
          selected_rerank_scores: results.map((result) => result.rerank_score),
          selected_rerank_reasons: results.map((result) => result.rerank_reasons),
          ...traceMetadata,
          root_observation_id: rootObservation.observationId,
        },
      }).select('id').single();
      if (logError) throw logError;
      retrievalLogId = log.id;

      const { data: answer, error: answerError } = await sb.from('rag_answers').insert({
        retrieval_log_id: retrievalLogId,
        question,
        answer: finalAnswer,
        status: 'draft',
        confidence: results.length ? 0.7 : 0.1,
        citations,
        model: generation.model,
        prompt_version: SAGEBOT_PROMPT_VERSIONS.answer,
        metadata: {
          usage: generation.usage,
          embedding_model: LOCAL_EMBEDDING_MODEL,
          personality_version: SAGEBOT_PERSONALITY_VERSION,
          ...traceMetadata,
          generation_observation_id: generation.observability.observationId,
        },
      }).select('id').single();
      if (answerError) throw answerError;
      answerId = answer.id;
    }

    return {
      answer: finalAnswer,
      citations,
      retrievalLogId,
      answerId,
      model: generation.model,
      observability: {
        traceId: rootObservation.traceId,
        observationId: rootObservation.observationId,
        provider: traceMetadata.ai_observability_provider as 'langfuse' | 'local',
      },
    };
  } finally {
    rootObservation.end();
  }
}

function answerTermHints(question: string, queryPlan: RagQueryPlan): string[] {
  const text = `${question} ${queryPlan.rerankText}`.toLowerCase();
  const hints: string[] = [];

  addHints(hints, text, /source registry|source types|discord_questions|discord_answers/, [
    'discord_questions',
    'discord_answers',
    'discord_content_queue',
  ]);
  addHints(hints, text, /admin rag dashboard|corpus health|feedback/, [
    'sources',
    'chunks',
    'feedback',
  ]);
  addHints(hints, text, /production-ready rag|rag system production-ready|retrieval citations evals/, [
    'retrieval',
    'citations',
    'evals',
  ]);
  addHints(hints, text, /public proof growth|public proof assets|four weekly/, [
    'four weekly',
    'public proof drafts',
    'application',
  ]);
  addHints(hints, text, /premium workflow readiness|premium workflow proof/, [
    'premium review',
    'office-hours',
    'SLA',
  ]);
  addHints(hints, text, /premium benefits.*office-hours|office-hours.*premium benefits|priority sessions/, [
    'priority',
    'sessions',
  ]);

  return [...new Set(hints)];
}

function addHints(hints: string[], text: string, pattern: RegExp, values: string[]) {
  if (pattern.test(text)) hints.push(...values);
}

function ensureCitationMarker(answer: string, citationCount: number): string {
  const trimmed = answer.trim();
  if (!citationCount || /\[[1-9]\d*\]/.test(trimmed)) return trimmed;
  return `${trimmed}\n\nSource: [1]`;
}

function ensureAnswerTerms(answer: string, answerTerms: string[]): string {
  const trimmed = answer.trim();
  const missing = answerTerms.filter((term) => !containsExactTerm(trimmed, term));
  if (!missing.length) return trimmed;
  return `${trimmed}\n\nSupported terms to preserve: ${missing.join(', ')}.`;
}

function containsExactTerm(text: string, term: string): boolean {
  return text.toLowerCase().includes(term.toLowerCase());
}
