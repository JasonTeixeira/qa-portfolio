export const DISCORD_SCALE_READINESS_VERSION = 'discord-scale-readiness-v1';

export type DiscordScaleScenarioKey =
  | 'members_100'
  | 'members_500'
  | 'members_1000'
  | 'members_5000'
  | 'message_burst'
  | 'command_burst'
  | 'repeated_cron'
  | 'discord_429'
  | 'supabase_latency'
  | 'deepseek_failure'
  | 'embedding_backlog';

export type DiscordScaleScenario = {
  key: DiscordScaleScenarioKey;
  label: string;
  members: number;
  messagesPerMinute: number;
  commandsPerMinute: number;
  cronTriggersPerHour: number;
  externalFailureRate: number;
  embeddingBacklog: number;
};

export type DiscordScaleScenarioResult = DiscordScaleScenario & {
  estimatedWritesPerMinute: number;
  estimatedJobRunsPerHour: number;
  estimatedP95LatencyMs: number;
  riskScore: number;
  passed: boolean;
  risks: string[];
  controls: string[];
};

export type DashboardPerformanceSnapshot = {
  rowsScanned: number;
  queryCount: number;
  elapsedMs: number;
};

export type DashboardPerformanceAssessment = DashboardPerformanceSnapshot & {
  estimatedP95Ms: number;
  passed: boolean;
  risks: string[];
};

export type FailureModeAssessment = {
  key: string;
  passed: boolean;
  expectedControl: string;
  evidence: string;
};

export const DISCORD_SCALE_SCENARIOS: DiscordScaleScenario[] = [
  {
    key: 'members_100',
    label: '100 member normal day',
    members: 100,
    messagesPerMinute: 8,
    commandsPerMinute: 2,
    cronTriggersPerHour: 4,
    externalFailureRate: 0,
    embeddingBacklog: 25,
  },
  {
    key: 'members_500',
    label: '500 member active day',
    members: 500,
    messagesPerMinute: 35,
    commandsPerMinute: 8,
    cronTriggersPerHour: 8,
    externalFailureRate: 0.01,
    embeddingBacklog: 150,
  },
  {
    key: 'members_1000',
    label: '1,000 member active day',
    members: 1000,
    messagesPerMinute: 75,
    commandsPerMinute: 16,
    cronTriggersPerHour: 12,
    externalFailureRate: 0.02,
    embeddingBacklog: 300,
  },
  {
    key: 'members_5000',
    label: '5,000 member scale target',
    members: 5000,
    messagesPerMinute: 275,
    commandsPerMinute: 55,
    cronTriggersPerHour: 18,
    externalFailureRate: 0.03,
    embeddingBacklog: 1000,
  },
  {
    key: 'message_burst',
    label: 'High message burst',
    members: 1000,
    messagesPerMinute: 450,
    commandsPerMinute: 20,
    cronTriggersPerHour: 8,
    externalFailureRate: 0.01,
    embeddingBacklog: 500,
  },
  {
    key: 'command_burst',
    label: 'High command burst',
    members: 1000,
    messagesPerMinute: 120,
    commandsPerMinute: 120,
    cronTriggersPerHour: 8,
    externalFailureRate: 0.01,
    embeddingBacklog: 300,
  },
  {
    key: 'repeated_cron',
    label: 'Repeated cron trigger',
    members: 500,
    messagesPerMinute: 25,
    commandsPerMinute: 8,
    cronTriggersPerHour: 60,
    externalFailureRate: 0,
    embeddingBacklog: 120,
  },
  {
    key: 'discord_429',
    label: 'Discord API 429',
    members: 1000,
    messagesPerMinute: 80,
    commandsPerMinute: 40,
    cronTriggersPerHour: 10,
    externalFailureRate: 0.12,
    embeddingBacklog: 250,
  },
  {
    key: 'supabase_latency',
    label: 'Supabase latency/failure',
    members: 1000,
    messagesPerMinute: 70,
    commandsPerMinute: 20,
    cronTriggersPerHour: 10,
    externalFailureRate: 0.08,
    embeddingBacklog: 350,
  },
  {
    key: 'deepseek_failure',
    label: 'DeepSeek failure',
    members: 1000,
    messagesPerMinute: 70,
    commandsPerMinute: 18,
    cronTriggersPerHour: 10,
    externalFailureRate: 0.1,
    embeddingBacklog: 300,
  },
  {
    key: 'embedding_backlog',
    label: 'Embedding backlog',
    members: 5000,
    messagesPerMinute: 200,
    commandsPerMinute: 35,
    cronTriggersPerHour: 12,
    externalFailureRate: 0.02,
    embeddingBacklog: 2500,
  },
];

export function evaluateDiscordScaleScenario(scenario: DiscordScaleScenario): DiscordScaleScenarioResult {
  const estimatedWritesPerMinute = Math.round(
    scenario.messagesPerMinute * 2.4
      + scenario.commandsPerMinute * 3.2
      + scenario.cronTriggersPerHour / 6
      + Math.min(200, scenario.embeddingBacklog / 20),
  );
  const estimatedJobRunsPerHour = Math.round(
    scenario.cronTriggersPerHour
      + scenario.commandsPerMinute * 3
      + Math.min(120, scenario.embeddingBacklog / 10),
  );
  const estimatedP95LatencyMs = Math.round(
    250
      + scenario.messagesPerMinute * 2.2
      + scenario.commandsPerMinute * 6
      + Math.min(1500, scenario.embeddingBacklog * 0.35)
      + scenario.externalFailureRate * 3000,
  );
  const risks = [
    estimatedWritesPerMinute > 900 ? 'write_pressure' : null,
    estimatedJobRunsPerHour > 650 ? 'job_queue_pressure' : null,
    estimatedP95LatencyMs > 2200 ? 'latency_pressure' : null,
    scenario.externalFailureRate >= 0.08 ? 'external_provider_failure_pressure' : null,
    scenario.embeddingBacklog > 1500 ? 'embedding_backlog_pressure' : null,
  ].filter(Boolean) as string[];
  const controls = [
    'idempotent_job_runs',
    'retry_backoff_and_dead_letters',
    'admin_dashboard_failure_visibility',
    'no_live_discord_load_spam',
    scenario.externalFailureRate > 0 ? 'provider_failure_isolation' : null,
    scenario.embeddingBacklog > 0 ? 'embedding_backlog_triage' : null,
  ].filter(Boolean) as string[];
  const riskScore = Math.min(100, risks.length * 22 + Math.max(0, estimatedP95LatencyMs - 1200) / 50);
  return {
    ...scenario,
    estimatedWritesPerMinute,
    estimatedJobRunsPerHour,
    estimatedP95LatencyMs,
    riskScore: Math.round(riskScore),
    passed: risks.length <= 2 && estimatedP95LatencyMs <= 3000,
    risks,
    controls,
  };
}

export function assessDiscordDashboardPerformance(snapshot: DashboardPerformanceSnapshot): DashboardPerformanceAssessment {
  const estimatedP95Ms = Math.round(snapshot.elapsedMs * 1.8 + snapshot.queryCount * 12 + snapshot.rowsScanned * 0.04);
  const risks = [
    snapshot.queryCount > 35 ? 'too_many_dashboard_queries' : null,
    snapshot.rowsScanned > 25_000 ? 'dashboard_rows_scanned_high' : null,
    estimatedP95Ms > 2500 ? 'dashboard_p95_latency_high' : null,
  ].filter(Boolean) as string[];
  return {
    ...snapshot,
    estimatedP95Ms,
    passed: risks.length === 0,
    risks,
  };
}

export function requiredDiscordFailureModeAssessments(input: {
  duplicateJobSafe: boolean;
  failedPublishDeadLettered: boolean;
  failedRoleSyncVisible: boolean;
  failedModelCallVisible: boolean;
  failedRagSyncVisible: boolean;
  deadLetterReplayQueued: boolean;
  rateLimitBackoffPresent: boolean;
}): FailureModeAssessment[] {
  return [
    {
      key: 'duplicate_job',
      passed: input.duplicateJobSafe,
      expectedControl: 'Unique job_key/idempotency_key plus duplicate detection.',
      evidence: 'startDiscordDurableJobRun returns duplicate=true on repeated idempotency key.',
    },
    {
      key: 'failed_publish',
      passed: input.failedPublishDeadLettered,
      expectedControl: 'Publish side effects dead-letter instead of silently retrying duplicate Discord posts.',
      evidence: 'daily_publish failure creates discord_job_dead_letters row.',
    },
    {
      key: 'failed_role_sync',
      passed: input.failedRoleSyncVisible,
      expectedControl: 'Role sync failure has durable event or dead-letter visibility.',
      evidence: 'Failure mode registered in Phase 19 runbook and durable job registry controls.',
    },
    {
      key: 'failed_model_call',
      passed: input.failedModelCallVisible,
      expectedControl: 'Model failure blocks auto-posting and becomes an admin-visible failed job.',
      evidence: 'DeepSeek failure scenario evaluated with provider_failure_isolation control.',
    },
    {
      key: 'failed_rag_sync',
      passed: input.failedRagSyncVisible,
      expectedControl: 'RAG sync is a durable job with retry and dead-letter controls.',
      evidence: 'rag_sync/rag_chunk_embed/rag_eval registry entries present.',
    },
    {
      key: 'dead_letter_replay',
      passed: input.deadLetterReplayQueued,
      expectedControl: 'Retryable dead letter queues a new run and resolves original dead letter.',
      evidence: 'retryDiscordDurableDeadLetter returns retry run key.',
    },
    {
      key: 'discord_rate_limit',
      passed: input.rateLimitBackoffPresent,
      expectedControl: 'Discord 429 retry_after is honored by publish smokes and rate limits protect interactions.',
      evidence: 'Phase 19 checks retry/backoff wiring instead of spamming live Discord.',
    },
  ];
}

export function summarizeDiscordScaleReadiness(input: {
  scenarios: DiscordScaleScenarioResult[];
  dashboard: DashboardPerformanceAssessment;
  failureModes: FailureModeAssessment[];
  runbooksPresent: boolean;
}): {
  ok: boolean;
  score: number;
  failures: string[];
} {
  const failures = [
    ...input.scenarios.filter((scenario) => !scenario.passed).map((scenario) => `scenario:${scenario.key}`),
    input.dashboard.passed ? null : 'dashboard_performance',
    ...input.failureModes.filter((mode) => !mode.passed).map((mode) => `failure:${mode.key}`),
    input.runbooksPresent ? null : 'runbooks_missing',
  ].filter(Boolean) as string[];
  const totalChecks = input.scenarios.length + 1 + input.failureModes.length + 1;
  const passedChecks = totalChecks - failures.length;
  return {
    ok: failures.length === 0,
    score: Math.round((passedChecks / totalChecks) * 100),
    failures,
  };
}
