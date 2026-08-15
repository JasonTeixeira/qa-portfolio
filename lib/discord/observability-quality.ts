import { supabaseAdmin } from '@/lib/supabase/server';

export const DISCORD_OBSERVABILITY_QUALITY_VERSION = 'discord-observability-quality-v1';

export const DEEPSEEK_PRICING_USD_PER_1M_TOKENS = {
  input: 0.27,
  output: 1.1,
} as const;

type Json = Record<string, unknown>;

export type DiscordObservabilityQualityInput = {
  ragAnswers: Array<{
    id?: string;
    model?: string | null;
    metadata?: Json | null;
  }>;
  retrievalLogs: Array<{
    id?: string;
    metadata?: Json | null;
  }>;
  jobRuns: Array<{
    status: string;
    duration_ms?: number | null;
    metadata?: Json | null;
  }>;
  openDeadLetters: number;
  ragEvalRuns: Array<{
    total_questions?: number | null;
    passed?: number | null;
    failed?: number | null;
    metrics?: Json | null;
  }>;
  ragEvalResults: Array<{
    passed?: boolean | null;
    score?: number | string | null;
    citation_coverage?: number | string | null;
    faithfulness?: number | string | null;
    metadata?: Json | null;
  }>;
  contentDrafts: Array<{
    quality_score?: number | null;
    status?: string | null;
    metadata?: Json | null;
  }>;
  contentEvaluations: Array<{
    score?: number | null;
    passed?: boolean | null;
    metadata?: Json | null;
  }>;
  premiumReviews: Array<{
    response_quality_score?: number | null;
    status?: string | null;
    sla_due_at?: string | null;
    completed_at?: string | null;
  }>;
};

export type DiscordObservabilityQualityRollup = {
  version: typeof DISCORD_OBSERVABILITY_QUALITY_VERSION;
  window: {
    startedAt: string;
    finishedAt: string;
    hours: number;
  };
  traceCoverage: number;
  trace: {
    tracedArtifacts: number;
    totalTraceableArtifacts: number;
    providerBreakdown: Record<string, number>;
  };
  cost: {
    provider: 'deepseek';
    estimatedUsd: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    pricedAnswers: number;
    pricingUsdPer1MTokens: typeof DEEPSEEK_PRICING_USD_PER_1M_TOKENS;
  };
  quality: {
    ragEvalPassRate: number;
    avgRagEvalScore: number;
    avgCitationCoverage: number;
    avgFaithfulness: number;
    avgContentQuality: number;
    contentPassRate: number;
    avgPremiumQuality: number;
    premiumSlaOverdue: number;
  };
  jobs: {
    totalRuns: number;
    succeeded: number;
    failed: number;
    deadLettered: number;
    successRate: number;
    openDeadLetters: number;
    avgDurationMs: number;
  };
  healthScore: number;
  status: 'healthy' | 'watch' | 'critical';
  alerts: string[];
};

export function estimateDeepSeekCostUsd(input: {
  promptTokens: number;
  completionTokens: number;
  pricing?: typeof DEEPSEEK_PRICING_USD_PER_1M_TOKENS;
}): number {
  const pricing = input.pricing ?? DEEPSEEK_PRICING_USD_PER_1M_TOKENS;
  const prompt = Math.max(0, input.promptTokens);
  const completion = Math.max(0, input.completionTokens);
  return round6((prompt / 1_000_000) * pricing.input + (completion / 1_000_000) * pricing.output);
}

export function buildDiscordObservabilityQualityRollup(
  input: DiscordObservabilityQualityInput,
  options: { now?: Date; windowHours?: number } = {},
): DiscordObservabilityQualityRollup {
  const now = options.now ?? new Date();
  const windowHours = Math.max(1, Math.round(options.windowHours ?? 24));
  const startedAt = new Date(now.getTime() - windowHours * 60 * 60 * 1000);
  const traceArtifacts = [
    ...input.ragAnswers.map((row) => row.metadata),
    ...input.retrievalLogs.map((row) => row.metadata),
    ...input.jobRuns.map((row) => row.metadata),
    ...input.contentDrafts.map((row) => row.metadata),
  ];
  const totalTraceableArtifacts = traceArtifacts.length;
  const traced = traceArtifacts.filter(hasAiTrace);
  const providerBreakdown = traced.reduce<Record<string, number>>((acc, metadata) => {
    const provider = String(metadata?.ai_observability_provider ?? 'unknown');
    acc[provider] = (acc[provider] ?? 0) + 1;
    return acc;
  }, {});

  const usageRows = input.ragAnswers
    .map((answer) => extractUsage(answer.metadata))
    .filter((usage) => usage.totalTokens > 0 || usage.promptTokens > 0 || usage.completionTokens > 0);
  const promptTokens = sum(usageRows.map((usage) => usage.promptTokens));
  const completionTokens = sum(usageRows.map((usage) => usage.completionTokens));
  const totalTokens = sum(usageRows.map((usage) => usage.totalTokens || usage.promptTokens + usage.completionTokens));
  const estimatedUsd = estimateDeepSeekCostUsd({ promptTokens, completionTokens });

  const jobCounts = countJobStatuses(input.jobRuns);
  const totalTerminalJobs = jobCounts.succeeded + jobCounts.failed + jobCounts.deadLettered + jobCounts.canceled;
  const successRate = totalTerminalJobs ? round4(jobCounts.succeeded / totalTerminalJobs) : 1;
  const avgDurationMs = avg(input.jobRuns.map((run) => Number(run.duration_ms ?? 0)).filter((value) => value > 0));
  const latestEvalSummary = summarizeRagEvals(input.ragEvalRuns, input.ragEvalResults);
  const contentScores = [
    ...input.contentDrafts.map((draft) => Number(draft.quality_score ?? 0)).filter((score) => score > 0),
    ...input.contentEvaluations.map((evaluation) => Number(evaluation.score ?? 0)).filter((score) => score > 0),
  ];
  const contentPassRows = input.contentEvaluations.filter((evaluation) => typeof evaluation.passed === 'boolean');
  const premiumScores = input.premiumReviews.map((review) => Number(review.response_quality_score ?? 0)).filter((score) => score > 0);
  const premiumSlaOverdue = input.premiumReviews.filter((review) => {
    if (!review.sla_due_at || review.completed_at) return false;
    return new Date(review.sla_due_at).getTime() < now.getTime();
  }).length;

  const traceCoverage = totalTraceableArtifacts ? round4(traced.length / totalTraceableArtifacts) : 1;
  const avgContentQuality = avg(contentScores);
  const avgPremiumQuality = avg(premiumScores);
  const contentPassRate = contentPassRows.length
    ? round4(contentPassRows.filter((evaluation) => evaluation.passed).length / contentPassRows.length)
    : (avgContentQuality >= 80 ? 1 : 0);
  const alerts = buildAlerts({
    traceCoverage,
    estimatedUsd,
    successRate,
    openDeadLetters: input.openDeadLetters,
    avgRagEvalScore: latestEvalSummary.avgScore,
    ragEvalPassRate: latestEvalSummary.passRate,
    avgContentQuality,
    avgPremiumQuality,
    premiumSlaOverdue,
  });
  const healthScore = scoreObservabilityHealth({
    traceCoverage,
    jobSuccessRate: successRate,
    openDeadLetters: input.openDeadLetters,
    ragEvalPassRate: latestEvalSummary.passRate,
    avgRagEvalScore: latestEvalSummary.avgScore,
    avgContentQuality,
    avgPremiumQuality,
    premiumSlaOverdue,
  });

  return {
    version: DISCORD_OBSERVABILITY_QUALITY_VERSION,
    window: {
      startedAt: startedAt.toISOString(),
      finishedAt: now.toISOString(),
      hours: windowHours,
    },
    traceCoverage,
    trace: {
      tracedArtifacts: traced.length,
      totalTraceableArtifacts,
      providerBreakdown,
    },
    cost: {
      provider: 'deepseek',
      estimatedUsd,
      promptTokens,
      completionTokens,
      totalTokens,
      pricedAnswers: usageRows.length,
      pricingUsdPer1MTokens: DEEPSEEK_PRICING_USD_PER_1M_TOKENS,
    },
    quality: {
      ragEvalPassRate: latestEvalSummary.passRate,
      avgRagEvalScore: latestEvalSummary.avgScore,
      avgCitationCoverage: latestEvalSummary.avgCitationCoverage,
      avgFaithfulness: latestEvalSummary.avgFaithfulness,
      avgContentQuality,
      contentPassRate,
      avgPremiumQuality,
      premiumSlaOverdue,
    },
    jobs: {
      totalRuns: input.jobRuns.length,
      succeeded: jobCounts.succeeded,
      failed: jobCounts.failed,
      deadLettered: jobCounts.deadLettered,
      successRate,
      openDeadLetters: input.openDeadLetters,
      avgDurationMs,
    },
    healthScore,
    status: healthScore >= 90 ? 'healthy' : healthScore >= 72 ? 'watch' : 'critical',
    alerts,
  };
}

export async function loadDiscordObservabilityQualityRollup(options: {
  windowHours?: number;
  persist?: boolean;
  rollupKey?: string;
  now?: Date;
} = {}): Promise<DiscordObservabilityQualityRollup & { rollupId?: string | null }> {
  const sb = supabaseAdmin();
  const now = options.now ?? new Date();
  const windowHours = Math.max(1, Math.round(options.windowHours ?? 24));
  const since = new Date(now.getTime() - windowHours * 60 * 60 * 1000).toISOString();
  const [
    ragAnswersRes,
    retrievalLogsRes,
    jobRunsRes,
    openDeadLettersRes,
    ragEvalRunsRes,
    ragEvalResultsRes,
    contentDraftsRes,
    contentEvaluationsRes,
    premiumReviewsRes,
  ] = await Promise.all([
    sb.from('rag_answers').select('id, model, metadata, created_at').gte('created_at', since).limit(500),
    sb.from('rag_retrieval_logs').select('id, metadata, created_at').gte('created_at', since).limit(500),
    sb.from('discord_job_runs').select('status, duration_ms, metadata, created_at').gte('created_at', since).limit(500),
    sb.from('discord_job_dead_letters').select('id', { count: 'exact', head: true }).is('resolved_at', null),
    sb.from('rag_eval_runs').select('total_questions, passed, failed, metrics, finished_at, started_at').gte('started_at', since).order('started_at', { ascending: false }).limit(20),
    sb.from('rag_eval_results').select('passed, score, citation_coverage, faithfulness, metadata, created_at').gte('created_at', since).limit(500),
    sb.from('discord_content_drafts').select('quality_score, status, metadata, created_at').gte('created_at', since).limit(500),
    sb.from('discord_content_draft_evaluations').select('score, passed, metadata, created_at').gte('created_at', since).limit(500),
    sb.from('discord_premium_review_requests').select('response_quality_score, status, sla_due_at, completed_at, created_at').gte('created_at', since).limit(500),
  ]);
  for (const result of [
    ragAnswersRes,
    retrievalLogsRes,
    jobRunsRes,
    openDeadLettersRes,
    ragEvalRunsRes,
    ragEvalResultsRes,
    contentDraftsRes,
    contentEvaluationsRes,
    premiumReviewsRes,
  ]) {
    if (result.error) throw new Error(result.error.message);
  }
  const rollup = buildDiscordObservabilityQualityRollup({
    ragAnswers: (ragAnswersRes.data ?? []) as DiscordObservabilityQualityInput['ragAnswers'],
    retrievalLogs: (retrievalLogsRes.data ?? []) as DiscordObservabilityQualityInput['retrievalLogs'],
    jobRuns: (jobRunsRes.data ?? []) as DiscordObservabilityQualityInput['jobRuns'],
    openDeadLetters: openDeadLettersRes.count ?? 0,
    ragEvalRuns: (ragEvalRunsRes.data ?? []) as DiscordObservabilityQualityInput['ragEvalRuns'],
    ragEvalResults: (ragEvalResultsRes.data ?? []) as DiscordObservabilityQualityInput['ragEvalResults'],
    contentDrafts: (contentDraftsRes.data ?? []) as DiscordObservabilityQualityInput['contentDrafts'],
    contentEvaluations: (contentEvaluationsRes.data ?? []) as DiscordObservabilityQualityInput['contentEvaluations'],
    premiumReviews: (premiumReviewsRes.data ?? []) as DiscordObservabilityQualityInput['premiumReviews'],
  }, { now, windowHours });

  if (!options.persist) return rollup;
  const rollupKey = options.rollupKey ?? `discord-observability:${rollup.window.startedAt}:${rollup.window.finishedAt}`;
  const { data, error } = await sb.from('discord_observability_rollups').upsert({
    rollup_key: rollupKey,
    window_start: rollup.window.startedAt,
    window_end: rollup.window.finishedAt,
    trace_coverage: rollup.traceCoverage,
    estimated_deepseek_cost_usd: rollup.cost.estimatedUsd,
    total_prompt_tokens: rollup.cost.promptTokens,
    total_completion_tokens: rollup.cost.completionTokens,
    total_tokens: rollup.cost.totalTokens,
    rag_answer_count: rollup.cost.pricedAnswers,
    rag_eval_pass_rate: rollup.quality.ragEvalPassRate,
    avg_rag_eval_score: rollup.quality.avgRagEvalScore,
    avg_content_quality: rollup.quality.avgContentQuality,
    avg_premium_quality: rollup.quality.avgPremiumQuality,
    job_success_rate: rollup.jobs.successRate,
    open_dead_letters: rollup.jobs.openDeadLetters,
    health_score: rollup.healthScore,
    status: rollup.status,
    alerts: rollup.alerts,
    metrics: {
      version: rollup.version,
      trace: rollup.trace,
      cost: rollup.cost,
      quality: rollup.quality,
      jobs: rollup.jobs,
    },
  }, { onConflict: 'rollup_key' }).select('id').single();
  if (error) throw new Error(error.message);
  return { ...rollup, rollupId: String(data.id) };
}

function hasAiTrace(metadata: Json | null | undefined): metadata is Json {
  return Boolean(metadata && (typeof metadata.ai_trace_id === 'string' || typeof metadata.langfuse_trace_id === 'string'));
}

function extractUsage(metadata: Json | null | undefined): { promptTokens: number; completionTokens: number; totalTokens: number } {
  const usage = metadata?.usage;
  if (!usage || typeof usage !== 'object') return { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  const record = usage as Json;
  return {
    promptTokens: Number(record.prompt_tokens ?? record.promptTokens ?? 0),
    completionTokens: Number(record.completion_tokens ?? record.completionTokens ?? 0),
    totalTokens: Number(record.total_tokens ?? record.totalTokens ?? 0),
  };
}

function summarizeRagEvals(
  runs: DiscordObservabilityQualityInput['ragEvalRuns'],
  results: DiscordObservabilityQualityInput['ragEvalResults'],
) {
  const latest = runs[0];
  const passRate = latest && Number(latest.total_questions ?? 0) > 0
    ? round4(Number(latest.passed ?? 0) / Number(latest.total_questions ?? 0))
    : (results.length ? round4(results.filter((result) => result.passed).length / results.length) : 1);
  const scores = results.map((result) => Number(result.score ?? 0)).filter((score) => score > 0);
  const citation = results.map((result) => Number(result.citation_coverage ?? 0)).filter((score) => score > 0);
  const faithfulness = results.map((result) => Number(result.faithfulness ?? 0)).filter((score) => score > 0);
  const metrics = latest?.metrics ?? {};
  return {
    passRate,
    avgScore: scores.length ? avg(scores) : Number(metrics.avgScore ?? metrics.avg_score ?? passRate),
    avgCitationCoverage: citation.length ? avg(citation) : Number(metrics.citationCoverage ?? metrics.citation_coverage ?? 0),
    avgFaithfulness: faithfulness.length ? avg(faithfulness) : Number(metrics.faithfulness ?? 0),
  };
}

function countJobStatuses(runs: DiscordObservabilityQualityInput['jobRuns']) {
  return {
    succeeded: runs.filter((run) => run.status === 'succeeded').length,
    failed: runs.filter((run) => run.status === 'failed').length,
    deadLettered: runs.filter((run) => run.status === 'dead_lettered').length,
    canceled: runs.filter((run) => run.status === 'canceled').length,
  };
}

function buildAlerts(input: {
  traceCoverage: number;
  estimatedUsd: number;
  successRate: number;
  openDeadLetters: number;
  ragEvalPassRate: number;
  avgRagEvalScore: number;
  avgContentQuality: number;
  avgPremiumQuality: number;
  premiumSlaOverdue: number;
}): string[] {
  return [
    input.traceCoverage < 0.8 ? 'Trace coverage below 80% for recent Discord/RAG artifacts.' : null,
    input.estimatedUsd > 5 ? 'Estimated DeepSeek spend exceeds the starter daily watch threshold.' : null,
    input.successRate < 0.9 ? 'Durable Discord job success rate is below 90%.' : null,
    input.openDeadLetters > 0 ? 'Open Discord job dead letters need operator review.' : null,
    input.ragEvalPassRate < 0.8 || input.avgRagEvalScore < 0.75 ? 'RAG eval quality is below Phase 17 target.' : null,
    input.avgContentQuality > 0 && input.avgContentQuality < 80 ? 'Average content draft quality is below approval target.' : null,
    input.avgPremiumQuality > 0 && input.avgPremiumQuality < 80 ? 'Average premium response quality is below premium promise target.' : null,
    input.premiumSlaOverdue > 0 ? 'Premium review SLA has overdue items.' : null,
  ].filter(Boolean) as string[];
}

function scoreObservabilityHealth(input: {
  traceCoverage: number;
  jobSuccessRate: number;
  openDeadLetters: number;
  ragEvalPassRate: number;
  avgRagEvalScore: number;
  avgContentQuality: number;
  avgPremiumQuality: number;
  premiumSlaOverdue: number;
}): number {
  let score = 100;
  if (input.traceCoverage < 0.95) score -= Math.round((0.95 - input.traceCoverage) * 25);
  if (input.jobSuccessRate < 0.98) score -= Math.round((0.98 - input.jobSuccessRate) * 30);
  if (input.openDeadLetters > 0) score -= Math.min(20, input.openDeadLetters * 5);
  if (input.ragEvalPassRate < 0.9) score -= Math.round((0.9 - input.ragEvalPassRate) * 20);
  if (input.avgRagEvalScore < 0.85) score -= Math.round((0.85 - input.avgRagEvalScore) * 20);
  if (input.avgContentQuality > 0 && input.avgContentQuality < 85) score -= Math.round((85 - input.avgContentQuality) / 3);
  if (input.avgPremiumQuality > 0 && input.avgPremiumQuality < 85) score -= Math.round((85 - input.avgPremiumQuality) / 3);
  if (input.premiumSlaOverdue > 0) score -= Math.min(15, input.premiumSlaOverdue * 5);
  return Math.max(0, Math.min(100, score));
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return round4(sum(values) / values.length);
}

function round4(value: number): number {
  return Number(value.toFixed(4));
}

function round6(value: number): number {
  return Number(value.toFixed(6));
}
