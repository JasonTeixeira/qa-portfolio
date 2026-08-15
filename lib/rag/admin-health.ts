export type RagCorpusHealthInput = {
  sources: number;
  documents: number;
  chunks: number;
  embeddedChunks: number;
  blockedDiscordCandidates: number;
  newestIngestionRun?: {
    run_key: string;
    status: string;
    started_at: string;
    finished_at?: string | null;
    failures?: number | null;
  } | null;
  latestEvalRun?: {
    run_key: string;
    status: string;
    total_questions: number;
    passed: number;
    failed: number;
    metrics?: Record<string, unknown> | null;
    finished_at?: string | null;
  } | null;
};

export type RagCorpusHealth = RagCorpusHealthInput & {
  missingDocuments: number;
  missingChunks: number;
  missingEmbeddings: number;
  embeddingCoverage: number;
  documentCoverage: number;
  chunkCoverage: number;
  evalPassRate: number | null;
  status: 'healthy' | 'watch' | 'critical';
  issues: string[];
};

export type RagEvalDrilldownRow = {
  id: string;
  evalKey: string;
  question: string;
  passed: boolean;
  score: number;
  retrievalHitRate: number;
  citationCoverage: number;
  faithfulness: number;
  missingSources: string[];
  missingRequiredTerms: string[];
  traceId: string | null;
  answerId: string | null;
  retrievalLogId: string | null;
  suggestedFix: string;
  severity: 'pass' | 'watch' | 'critical';
};

export function summarizeRagCorpusHealth(input: RagCorpusHealthInput): RagCorpusHealth {
  const missingDocuments = Math.max(0, input.sources - input.documents);
  const missingChunks = Math.max(0, input.documents - input.chunks);
  const missingEmbeddings = Math.max(0, input.chunks - input.embeddedChunks);
  const embeddingCoverage = input.chunks ? round4(input.embeddedChunks / input.chunks) : 0;
  const documentCoverage = input.sources ? round4(input.documents / input.sources) : 0;
  const chunkCoverage = input.documents ? round4(Math.min(input.chunks, input.documents) / input.documents) : 0;
  const evalPassRate = input.latestEvalRun && input.latestEvalRun.total_questions
    ? round4(input.latestEvalRun.passed / input.latestEvalRun.total_questions)
    : null;
  const issues = [
    input.sources === 0 ? 'No RAG sources are registered.' : null,
    missingDocuments > 0 ? `${missingDocuments} sources have no document row.` : null,
    missingChunks > 0 ? `${missingChunks} documents have no chunk coverage.` : null,
    missingEmbeddings > 0 ? `${missingEmbeddings} chunks are missing local embeddings.` : null,
    input.blockedDiscordCandidates > 0 ? `${input.blockedDiscordCandidates} Discord candidates are blocked before approval.` : null,
    input.newestIngestionRun?.status === 'failed' ? `Latest ingestion run failed: ${input.newestIngestionRun.run_key}.` : null,
    input.latestEvalRun?.status === 'failed' ? `Latest eval run failed: ${input.latestEvalRun.run_key}.` : null,
    evalPassRate !== null && evalPassRate < 0.95 ? `Eval pass rate is below 95%: ${Math.round(evalPassRate * 100)}%.` : null,
  ].filter((issue): issue is string => Boolean(issue));

  const status = issues.some((issue) => /No RAG sources|failed|missing local embeddings|no chunk/i.test(issue))
    ? 'critical'
    : issues.length
      ? 'watch'
      : 'healthy';

  return {
    ...input,
    missingDocuments,
    missingChunks,
    missingEmbeddings,
    embeddingCoverage,
    documentCoverage,
    chunkCoverage,
    evalPassRate,
    status,
    issues,
  };
}

export function buildRagEvalDrilldownRow(row: {
  id: string;
  passed: boolean;
  score?: number | string | null;
  citation_coverage?: number | string | null;
  faithfulness?: number | string | null;
  metadata?: Record<string, any> | null;
  answer_id?: string | null;
  retrieval_log_id?: string | null;
  rag_eval_questions?: { eval_key?: string | null; question?: string | null } | Array<{ eval_key?: string | null; question?: string | null }> | null;
}): RagEvalDrilldownRow {
  const metadata = row.metadata ?? {};
  const metrics = metadata.metrics ?? {};
  const question = Array.isArray(row.rag_eval_questions) ? row.rag_eval_questions[0] : row.rag_eval_questions;
  const missingSources = stringArray(metadata.missing_sources);
  const missingRequiredTerms = stringArray(metadata.missing_required_terms);
  const retrievalHitRate = toNumber(metrics.retrieval_hit_rate ?? metadata.retrieval_hit_rate, row.passed ? 1 : 0);
  const citationCoverage = toNumber(row.citation_coverage, 0);
  const faithfulness = toNumber(row.faithfulness, 0);
  const score = toNumber(row.score, 0);
  const traceId = typeof metadata.observability?.traceId === 'string' ? metadata.observability.traceId : null;
  const suggestedFix = suggestEvalFix({
    passed: row.passed,
    missingSources,
    missingRequiredTerms,
    retrievalHitRate,
    citationCoverage,
    faithfulness,
  });
  return {
    id: row.id,
    evalKey: question?.eval_key ?? String(metadata.eval_key ?? 'unknown_eval'),
    question: question?.question ?? 'Unknown eval question',
    passed: row.passed,
    score,
    retrievalHitRate,
    citationCoverage,
    faithfulness,
    missingSources,
    missingRequiredTerms,
    traceId,
    answerId: row.answer_id ?? null,
    retrievalLogId: row.retrieval_log_id ?? null,
    suggestedFix,
    severity: row.passed ? 'pass' : score < 0.5 || retrievalHitRate === 0 ? 'critical' : 'watch',
  };
}

export function suggestEvalFix(input: {
  passed: boolean;
  missingSources: string[];
  missingRequiredTerms: string[];
  retrievalHitRate: number;
  citationCoverage: number;
  faithfulness: number;
}): string {
  if (input.passed) return 'No action needed. Keep this eval in regression coverage.';
  if (input.retrievalHitRate === 0 || input.missingSources.length) {
    return `Add or approve a better source for: ${input.missingSources.join(', ') || 'the expected source'}.`;
  }
  if (input.citationCoverage < 0.85) return 'Improve citation coverage by prioritizing the expected source in retrieval/reranking.';
  if (input.faithfulness < 0.9) return 'Tighten the answer prompt/refusal policy so unsupported claims are removed.';
  if (input.missingRequiredTerms.length) {
    return `Improve answer usefulness; missing terms: ${input.missingRequiredTerms.join(', ')}.`;
  }
  return 'Inspect retrieval trace and add a targeted golden source or prompt rule.';
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? round4(parsed) : fallback;
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}
