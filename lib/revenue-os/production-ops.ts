export type RevenueOpsCheckStatus = 'ok' | 'degraded' | 'fail';

export type RevenueOpsCheck = {
  key: string;
  label: string;
  status: RevenueOpsCheckStatus;
  latencyMs?: number;
  detail: string;
};

export type RevenueOpsGate = {
  key: string;
  label: string;
  required: boolean;
  passed: boolean;
  evidence: string;
};

export type RevenueProviderHealth = {
  configured: boolean;
  liveVerified: boolean;
};

export function buildRevenueOpsHealth(input: {
  dbOk: boolean;
  queueDepth: number;
  deadLetters: number;
  emailProviderConfigured: boolean | RevenueProviderHealth;
  llmProviderConfigured: boolean | RevenueProviderHealth;
  leadConnectorsConfigured: boolean | RevenueProviderHealth;
  gmailConfigured: boolean | RevenueProviderHealth;
  workerSchedulerLive?: boolean;
  storageOk: boolean;
}) {
  const providerStatus = (value: boolean | RevenueProviderHealth) => {
    const configured = typeof value === 'boolean' ? value : value.configured;
    const liveVerified = typeof value === 'boolean' ? value : value.liveVerified;
    return { configured, liveVerified };
  };
  const email = providerStatus(input.emailProviderConfigured);
  const llm = providerStatus(input.llmProviderConfigured);
  const leadConnectors = providerStatus(input.leadConnectorsConfigured);
  const gmail = providerStatus(input.gmailConfigured);
  const checks: RevenueOpsCheck[] = [
    {
      key: 'db',
      label: 'Database',
      status: input.dbOk ? 'ok' : 'fail',
      detail: input.dbOk ? 'Supabase reachable' : 'Supabase check failed',
    },
    {
      key: 'queues',
      label: 'Worker queues',
      status: input.deadLetters > 0 ? 'degraded' : 'ok',
      detail: `${input.queueDepth} queued, ${input.deadLetters} dead-lettered`,
    },
    {
      key: 'email',
      label: 'Email provider',
      status: email.liveVerified ? 'ok' : email.configured ? 'degraded' : 'degraded',
      detail: email.liveVerified
        ? 'provider live probe verified'
        : email.configured
          ? 'provider key configured; live probe missing'
          : 'manual review only; provider key missing',
    },
    {
      key: 'llm',
      label: 'LLM provider',
      status: llm.liveVerified ? 'ok' : llm.configured ? 'degraded' : 'degraded',
      detail: llm.liveVerified
        ? 'LLM live probe verified'
        : llm.configured
          ? 'LLM provider configured; live probe missing'
          : 'local/deterministic drafting only',
    },
    {
      key: 'lead_connectors',
      label: 'Lead connectors',
      status: leadConnectors.liveVerified ? 'ok' : leadConnectors.configured ? 'degraded' : 'degraded',
      detail: leadConnectors.liveVerified
        ? 'live connector probe verified'
        : leadConnectors.configured
          ? 'connector credentials configured; live probe missing'
          : 'sample/import connectors only',
    },
    {
      key: 'gmail',
      label: 'Gmail sync',
      status: gmail.liveVerified ? 'ok' : gmail.configured ? 'degraded' : 'degraded',
      detail: gmail.liveVerified
        ? 'Gmail sync live probe verified'
        : gmail.configured
          ? 'Gmail credentials configured; live stream proof missing'
          : 'manual reply ingest only',
    },
    {
      key: 'worker_scheduler',
      label: 'Worker scheduler',
      status: input.workerSchedulerLive ? 'ok' : 'degraded',
      detail: input.workerSchedulerLive ? 'recent worker runtime execution recorded' : 'continuous worker runtime not recently proven',
    },
    {
      key: 'storage',
      label: 'Storage',
      status: input.storageOk ? 'ok' : 'fail',
      detail: input.storageOk ? 'artifact storage available' : 'artifact storage unavailable',
    },
  ];
  const failures = checks.filter((check) => check.status === 'fail').length;
  const degraded = checks.filter((check) => check.status === 'degraded').length;
  const status: RevenueOpsCheckStatus = failures > 0 ? 'fail' : degraded > 0 ? 'degraded' : 'ok';
  const score = Math.max(0, Math.min(100, 100 - failures * 25 - degraded * 7));

  return {
    status,
    ok: status !== 'fail',
    score,
    checks,
    alerts: checks
      .filter((check) => check.status !== 'ok')
      .map((check) => `${check.label}: ${check.detail}`),
  };
}

export function buildRevenueCiProof(input: {
  lint: boolean;
  typecheck: boolean;
  unit: boolean;
  rls: boolean;
  build: boolean;
  focusedE2e: boolean;
  productionVerify: boolean;
  auditHigh: boolean;
}) {
  const gates: RevenueOpsGate[] = [
    { key: 'lint', label: 'Lint', required: true, passed: input.lint, evidence: 'npm run lint' },
    { key: 'typecheck', label: 'Typecheck', required: true, passed: input.typecheck, evidence: 'npm run typecheck' },
    { key: 'unit', label: 'Unit tests', required: true, passed: input.unit, evidence: 'npm run test:unit' },
    { key: 'rls', label: 'RLS tests', required: true, passed: input.rls, evidence: 'npm run test:rls' },
    { key: 'build', label: 'Production build', required: true, passed: input.build, evidence: 'npm run build' },
    { key: 'focused_e2e', label: 'Revenue OS focused E2E', required: true, passed: input.focusedE2e, evidence: 'Playwright admin acquisition grep' },
    { key: 'production_verify', label: 'Production smoke', required: true, passed: input.productionVerify, evidence: 'npm run verify:prod' },
    { key: 'audit_high', label: 'High severity audit', required: true, passed: input.auditHigh, evidence: 'npm audit --audit-level=high' },
  ];
  const failedRequired = gates.filter((gate) => gate.required && !gate.passed);

  return {
    ready: failedRequired.length === 0,
    score: Math.round((gates.filter((gate) => gate.passed).length / gates.length) * 100),
    gates,
    failedRequired,
  };
}

export function buildRevenueRunbookIndex() {
  return [
    {
      key: 'failed_workers',
      title: 'Failed workers and dead letters',
      trigger: 'deadLetters > 0 or queue age exceeds SLA',
      firstActions: ['inspect revenue_worker_dead_letters', 'check connector credentials', 'requeue only after root cause is fixed'],
    },
    {
      key: 'bad_connector_credentials',
      title: 'Bad connector credentials',
      trigger: 'connector health degraded or provider 401/403',
      firstActions: ['disable live connector', 'rotate provider key', 'run sample import before re-enabling'],
    },
    {
      key: 'high_bounce_rate',
      title: 'High bounce or complaint rate',
      trigger: 'bounce or complaint threshold exceeded',
      firstActions: ['stop active sequences', 'add suppression events', 'lower daily cap and review source quality'],
    },
    {
      key: 'migration_failure',
      title: 'Migration failure',
      trigger: 'db push fails or remote drift detected',
      firstActions: ['stop deploy', 'capture migration status', 'repair migration history before retry'],
    },
    {
      key: 'tenant_incident',
      title: 'Tenant incident',
      trigger: 'cross-tenant access concern or client data request',
      firstActions: ['freeze affected tenant operations', 'export audit logs', 'open privacy/governance workflow'],
    },
  ];
}

export function buildRevenueLoadSmokePlan(input: {
  leads: number;
  queuedJobs: number;
  tenants: number;
  sequenceCapsEnforced: boolean;
  dashboardP95Ms: number;
  exportP95Ms: number;
}) {
  const checks = [
    { label: 'lead volume', passed: input.leads >= 1000, detail: `${input.leads}/1000 leads` },
    { label: 'worker queue volume', passed: input.queuedJobs >= 10_000, detail: `${input.queuedJobs}/10000 jobs` },
    { label: 'tenant count', passed: input.tenants >= 5, detail: `${input.tenants}/5 tenants` },
    { label: 'sequence caps', passed: input.sequenceCapsEnforced, detail: input.sequenceCapsEnforced ? 'caps enforced' : 'caps missing' },
    { label: 'dashboard p95', passed: input.dashboardP95Ms <= 1500, detail: `${input.dashboardP95Ms}ms` },
    { label: 'export p95', passed: input.exportP95Ms <= 3000, detail: `${input.exportP95Ms}ms` },
  ];

  return {
    passed: checks.every((check) => check.passed),
    checks,
    score: Math.round((checks.filter((check) => check.passed).length / checks.length) * 100),
  };
}

export type RevenueCiEvidence = {
  lint?: boolean;
  typecheck?: boolean;
  unit?: boolean;
  rls?: boolean;
  build?: boolean;
  focusedE2e?: boolean;
  productionVerify?: boolean;
  auditHigh?: boolean;
  source?: string;
};

export function buildRevenueCiProofFromEvidence(input: {
  evidence?: RevenueCiEvidence | null;
}) {
  const evidence = input.evidence ?? {};
  const proof = buildRevenueCiProof({
    lint: evidence.lint === true,
    typecheck: evidence.typecheck === true,
    unit: evidence.unit === true,
    rls: evidence.rls === true,
    build: evidence.build === true,
    focusedE2e: evidence.focusedE2e === true,
    productionVerify: evidence.productionVerify === true,
    auditHigh: evidence.auditHigh === true,
  });
  return {
    ...proof,
    gates: proof.gates.map((gate) => ({
      ...gate,
      evidence: evidence.source
        ? `${gate.evidence}; source=${evidence.source}`
        : `${gate.evidence}; missing captured artifact`,
    })),
  };
}

export type RevenueLoadEvidence = {
  tenants?: number;
  leads?: number;
  queuedJobs?: number;
  sequenceCapsEnforced?: boolean;
  dashboardP95Ms?: number;
  apiP95Ms?: number;
  exportP95Ms?: number;
  source?: string;
};

export function buildRevenueLoadProofFromEvidence(input: {
  evidence?: RevenueLoadEvidence | null;
}) {
  const evidence = input.evidence ?? {};
  const missingLatencyMs = 999_999;
  const load = buildRevenueLoadSmokePlan({
    leads: Number(evidence.leads ?? 0),
    queuedJobs: Number(evidence.queuedJobs ?? 0),
    tenants: Number(evidence.tenants ?? 0),
    sequenceCapsEnforced: evidence.sequenceCapsEnforced === true,
    dashboardP95Ms: Number(evidence.dashboardP95Ms ?? missingLatencyMs),
    exportP95Ms: Number(evidence.exportP95Ms ?? missingLatencyMs),
  });
  const apiP95Ms = Number(evidence.apiP95Ms ?? missingLatencyMs);
  return {
    ...load,
    passed: load.passed && apiP95Ms <= 750,
    checks: [
      ...load.checks,
      {
        label: 'api p95',
        passed: apiP95Ms <= 750,
        detail: Number.isFinite(apiP95Ms) ? `${apiP95Ms}ms` : 'missing captured artifact',
      },
    ],
    source: evidence.source ?? null,
  };
}
