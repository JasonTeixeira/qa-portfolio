import type { SupabaseClient } from '@supabase/supabase-js';
import { aiTraceMetadata, startAiObservation, type AiObservation } from '@/lib/ai/observability';
import { embedTextLocal, LOCAL_EMBEDDING_MODEL } from './embeddings';
import { deepSeekChat } from './deepseek';
import { planRagQuery, type RagQueryPlan } from './query-planning';
import { RAG_RERANKER_VERSION, rerankRagResults, type RerankedRagSearchResult } from './reranking';

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
      candidateLimit: options.candidateLimit ?? 20,
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
      prompt_version: 'rag_answer_v1',
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

    const generation = await deepSeekChat({
      messages: [
        {
          role: 'system',
          content: [
            'You answer only from the provided RAG context.',
            'If the context is insufficient, say what is missing.',
            'Keep the answer concise and include citation numbers like [1].',
          ].join(' '),
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nContext:\n${context}`,
        },
      ],
      temperature: 0.1,
      maxTokens: 320,
      observability: {
        parent: rootObservation,
        name: 'rag.answer_generation',
        metadata: { prompt_version: 'rag_answer_v1', citation_count: citations.length },
      },
    });

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
        answer: generation.content,
        status: 'draft',
        confidence: results.length ? 0.7 : 0.1,
        citations,
        model: generation.model,
        prompt_version: 'rag_answer_v1',
        metadata: {
          usage: generation.usage,
          embedding_model: LOCAL_EMBEDDING_MODEL,
          ...traceMetadata,
          generation_observation_id: generation.observability.observationId,
        },
      }).select('id').single();
      if (answerError) throw answerError;
      answerId = answer.id;
    }

    return {
      answer: generation.content,
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
