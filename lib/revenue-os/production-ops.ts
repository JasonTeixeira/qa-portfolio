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

export function buildRevenueOpsHealth(input: {
  dbOk: boolean;
  queueDepth: number;
  deadLetters: number;
  emailProviderConfigured: boolean;
  llmProviderConfigured: boolean;
  leadConnectorsConfigured: boolean;
  gmailConfigured: boolean;
  storageOk: boolean;
}) {
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
      status: input.emailProviderConfigured ? 'ok' : 'degraded',
      detail: input.emailProviderConfigured ? 'provider key configured' : 'manual review only; provider key missing',
    },
    {
      key: 'llm',
      label: 'LLM provider',
      status: input.llmProviderConfigured ? 'ok' : 'degraded',
      detail: input.llmProviderConfigured ? 'LLM provider configured' : 'local/deterministic drafting only',
    },
    {
      key: 'lead_connectors',
      label: 'Lead connectors',
      status: input.leadConnectorsConfigured ? 'ok' : 'degraded',
      detail: input.leadConnectorsConfigured ? 'live connector credentials configured' : 'sample/import connectors only',
    },
    {
      key: 'gmail',
      label: 'Gmail sync',
      status: input.gmailConfigured ? 'ok' : 'degraded',
      detail: input.gmailConfigured ? 'Gmail sync configured' : 'manual reply ingest only',
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
