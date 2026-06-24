import type { SupabaseClient } from '@supabase/supabase-js';
import { aiTraceMetadata, startAiObservation, type AiObservation } from '@/lib/ai/observability';
import { embedTextLocal, LOCAL_EMBEDDING_MODEL } from './embeddings';
import { deepSeekChat } from './deepseek';

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
  options: { limit?: number; vectorWeight?: number; observability?: { parent?: AiObservation } } = {},
): Promise<RagSearchResult[]> {
  const observation = startAiObservation(
    'rag.retrieve_chunks',
    {
      input: { query, limit: options.limit ?? 6, vectorWeight: options.vectorWeight ?? 0.65 },
      metadata: { embedding_model: LOCAL_EMBEDDING_MODEL, retrieval_provider: 'supabase_hybrid' },
    },
    { asType: 'retriever', parent: options.observability?.parent },
  );
  try {
    const embedding = await embedTextLocal(query);
    const { data, error } = await sb.rpc('match_rag_chunks_hybrid', {
      query_text: query,
      query_embedding: `[${embedding.vector.join(',')}]`,
      match_count: options.limit ?? 6,
      vector_weight: options.vectorWeight ?? 0.65,
    });
    if (error) {
      observation.update({ level: 'ERROR', statusMessage: error.message });
      throw error;
    }
    const results = (data ?? []) as RagSearchResult[];
    observation.update({
      output: {
        result_count: results.length,
        top_chunk_ids: results.slice(0, 5).map((result) => result.chunk_id),
      },
    });
    return results;
  } finally {
    observation.end();
  }
}

export async function answerRagQuestion(
  sb: SupabaseClient<any>,
  question: string,
  options: { limit?: number; persist?: boolean } = {},
): Promise<RagAnswerResult> {
  const startedAt = Date.now();
  const rootObservation = startAiObservation('rag.answer_question', {
    input: { question, limit: options.limit ?? 5 },
    metadata: { prompt_version: 'rag_answer_v1', generation_provider: 'deepseek' },
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
          provider: 'local_hybrid',
          generation_provider: 'deepseek',
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
