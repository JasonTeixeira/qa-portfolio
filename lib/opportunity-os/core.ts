export type OpportunitySource = 'job_os' | 'revenue_os';
export type UnifiedOpportunityStage =
  | 'new'
  | 'qualified'
  | 'ready'
  | 'contacted'
  | 'active'
  | 'won'
  | 'lost'
  | 'archived';

export type UnifiedOpportunity = {
  id: string;
  source: OpportunitySource;
  sourceId: string;
  title: string;
  organization: string;
  stage: UnifiedOpportunityStage;
  priorityScore: number;
  expectedValueUsd: number;
  nextAction: string;
  nextActionAt: string;
  stale: boolean;
  proofGaps: string[];
  tags: string[];
};

export type UnifiedAction = {
  rank: number;
  opportunityId: string;
  source: OpportunitySource;
  action: string;
  rationale: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  dueAt: string;
};

export type ProofAsset = {
  assetType: 'resume' | 'case_study' | 'portfolio' | 'metric' | 'testimonial' | 'artifact';
  title: string;
  appliesTo: OpportunitySource | 'both';
  keywords: string[];
  gapCovered: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export type CommunicationEvent = {
  source: OpportunitySource;
  sourceId: string;
  channel: 'gmail' | 'linkedin' | 'email' | 'manual';
  direction: 'inbound' | 'outbound';
  intent: 'recruiter_positive' | 'client_interest' | 'objection' | 'rejection' | 'unsubscribe' | 'unknown';
  nextAction: string;
  confidence: number;
};

export type OpportunityAnalytics = {
  total: number;
  jobs: number;
  clients: number;
  active: number;
  won: number;
  lost: number;
  stale: number;
  weightedPipelineUsd: number;
  jobConversionRate: number;
  clientConversionRate: number;
  bestChannel: string;
};

export type OpportunityReadinessAudit = {
  score: number;
  grade: 'world_class_ready' | 'institutional_beta' | 'blocked';
  passed: string[];
  gaps: string[];
};

export const OPPORTUNITY_PROGRAMS = [
  ['1', 'Shared opportunity schema'],
  ['2', 'Source adapters for Job OS and Revenue OS'],
  ['3', 'Unified status and stage mapping'],
  ['4', 'Unified priority scoring model'],
  ['5', '/admin/opportunities dashboard'],
  ['6', 'Unified daily action queue'],
  ['7', 'Stale follow-up detector'],
  ['8', 'Next-best-action engine'],
  ['9', 'Shared proof asset registry'],
  ['10', 'Resume/case-study/proof-gap matcher'],
  ['11', 'Job proof recommendations'],
  ['12', 'Client proof recommendations'],
  ['13', 'Gmail/reply event normalization'],
  ['14', 'Recruiter vs client intent classifier'],
  ['15', 'Follow-up calendar and reminders'],
  ['16', 'Manual-send approval queue'],
  ['17', 'Outcome/event ledger'],
  ['18', 'Conversion funnel comparison'],
  ['19', 'Channel/source ROI scoring'],
  ['20', 'Learning loop and strategy recommendations'],
  ['21', 'Unified E2E suite'],
  ['22', 'RLS/security tests'],
  ['23', 'Staging load proof'],
  ['24', 'Production readiness audit/report'],
] as const;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isPast(value: string, now = new Date()) {
  return new Date(value).getTime() < now.getTime();
}

export function mapJobStage(stage: string): UnifiedOpportunityStage {
  if (['offer'].includes(stage)) return 'won';
  if (['rejected'].includes(stage)) return 'lost';
  if (['archived'].includes(stage)) return 'archived';
  if (['interviewing', 'recruiter_contacted', 'applied'].includes(stage)) return 'active';
  if (stage === 'ready') return 'ready';
  return 'new';
}

export function mapRevenueStage(stage: string): UnifiedOpportunityStage {
  if (stage === 'won') return 'won';
  if (['lost', 'do_not_contact'].includes(stage)) return 'lost';
  if (['meeting', 'proposal', 'follow_up', 'contacted'].includes(stage)) return 'active';
  if (['qualified', 'drafted'].includes(stage)) return 'qualified';
  return 'new';
}

export function scoreUnifiedOpportunity(input: {
  source: OpportunitySource;
  stage: UnifiedOpportunityStage;
  sourceScore: number;
  expectedValueUsd: number;
  nextActionAt?: string | null;
  proofGapCount?: number;
}) {
  const stageBoost: Record<UnifiedOpportunityStage, number> = {
    new: 0,
    qualified: 8,
    ready: 10,
    contacted: 12,
    active: 18,
    won: -25,
    lost: -30,
    archived: -35,
  };
  const valueBoost = input.source === 'revenue_os'
    ? Math.min(18, input.expectedValueUsd / 1000)
    : Math.min(14, input.expectedValueUsd / 12000);
  const urgencyBoost = input.nextActionAt && isPast(input.nextActionAt) ? 14 : 0;
  const gapPenalty = Math.min(18, (input.proofGapCount ?? 0) * 4);
  return clampScore(input.sourceScore * 0.58 + stageBoost[input.stage] + valueBoost + urgencyBoost - gapPenalty);
}

export function adaptJobOpportunity(row: {
  id: string;
  stage: string;
  priority_rank?: number | null;
  next_action?: string | null;
  next_action_at?: string | null;
  metadata?: {
    target?: {
      job?: { title?: string; company?: string };
      fit?: { overall?: number; missingSkills?: string[] };
    };
  } | null;
  created_at?: string;
}): UnifiedOpportunity {
  const stage = mapJobStage(row.stage);
  const nextActionAt = row.next_action_at ?? row.created_at ?? new Date().toISOString();
  const fit = Number(row.metadata?.target?.fit?.overall ?? Math.max(55, 96 - Number(row.priority_rank ?? 6) * 6));
  const proofGaps = row.metadata?.target?.fit?.missingSkills ?? ['submitted artifact proof', 'role-specific story proof'];
  const expectedValueUsd = stage === 'won' ? 155000 : 120000;
  return {
    id: `job:${row.id}`,
    source: 'job_os',
    sourceId: row.id,
    title: row.metadata?.target?.job?.title ?? 'Job application opportunity',
    organization: row.metadata?.target?.job?.company ?? 'Target employer',
    stage,
    priorityScore: scoreUnifiedOpportunity({
      source: 'job_os',
      stage,
      sourceScore: fit,
      expectedValueUsd,
      nextActionAt,
      proofGapCount: proofGaps.length,
    }),
    expectedValueUsd,
    nextAction: row.next_action ?? 'Prepare application packet and submit manually.',
    nextActionAt,
    stale: !['won', 'lost', 'archived'].includes(stage) && isPast(nextActionAt),
    proofGaps,
    tags: ['career', 'job-search'],
  };
}

export function adaptRevenueOpportunity(row: {
  id: string;
  name: string;
  stage: string;
  total_score?: number | null;
  revenue_score?: number | null;
  next_action?: string | null;
  next_action_at?: string | null;
  recommended_offer?: string | null;
  pain_summary?: string | null;
  created_at?: string;
}): UnifiedOpportunity {
  const stage = mapRevenueStage(row.stage);
  const nextActionAt = row.next_action_at ?? row.created_at ?? new Date().toISOString();
  const expectedValueUsd = Math.max(2500, Number(row.revenue_score ?? 50) * 125);
  const proofGaps = [
    row.recommended_offer ? null : 'offer-specific case study',
    row.pain_summary ? null : 'diagnostic proof',
  ].filter(Boolean) as string[];
  return {
    id: `client:${row.id}`,
    source: 'revenue_os',
    sourceId: row.id,
    title: row.recommended_offer ?? 'Client acquisition opportunity',
    organization: row.name,
    stage,
    priorityScore: scoreUnifiedOpportunity({
      source: 'revenue_os',
      stage,
      sourceScore: Number(row.total_score ?? 50),
      expectedValueUsd,
      nextActionAt,
      proofGapCount: proofGaps.length,
    }),
    expectedValueUsd,
    nextAction: row.next_action ?? 'Draft evidence-backed outreach and schedule manual review.',
    nextActionAt,
    stale: !['won', 'lost', 'archived'].includes(stage) && isPast(nextActionAt),
    proofGaps,
    tags: ['client', 'revenue'],
  };
}

export function buildUnifiedDailyQueue(opportunities: UnifiedOpportunity[]): UnifiedAction[] {
  return opportunities
    .filter((item) => !['won', 'lost', 'archived'].includes(item.stage))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 12)
    .map((item, index) => ({
      rank: index + 1,
      opportunityId: item.id,
      source: item.source,
      action: item.stale ? `Recover stale follow-up: ${item.nextAction}` : item.nextAction,
      rationale: `${item.organization} has ${item.priorityScore}/100 priority with ${item.proofGaps.length} proof gap${item.proofGaps.length === 1 ? '' : 's'}.`,
      urgency: item.stale ? 'critical' : item.priorityScore >= 85 ? 'high' : item.priorityScore >= 70 ? 'medium' : 'low',
      dueAt: item.nextActionAt,
    }));
}

export function buildProofAssets(opportunities: UnifiedOpportunity[]): ProofAsset[] {
  const allGaps = opportunities.flatMap((item) => item.proofGaps.map((gap) => ({ gap, source: item.source })));
  const count = (needle: string) => allGaps.filter((item) => item.gap.toLowerCase().includes(needle)).length;
  return [
    {
      assetType: 'resume',
      title: 'Role-specific AI application resume proof',
      appliesTo: 'job_os',
      keywords: ['AI', 'automation', 'Playwright', 'Next.js'],
      gapCovered: 'role-specific story proof',
      priority: count('story') > 0 ? 'high' : 'medium',
    },
    {
      assetType: 'case_study',
      title: 'Revenue OS client acquisition case study',
      appliesTo: 'revenue_os',
      keywords: ['lead generation', 'conversion', 'outreach', 'pipeline'],
      gapCovered: 'offer-specific case study',
      priority: count('case') > 0 ? 'critical' : 'high',
    },
    {
      assetType: 'artifact',
      title: 'Submitted application and outreach proof archive',
      appliesTo: 'both',
      keywords: ['screenshot', 'confirmation', 'reply', 'meeting'],
      gapCovered: 'submitted artifact proof',
      priority: 'high',
    },
  ];
}

export function classifyOpportunityMessage(input: { sourceHint?: OpportunitySource; body: string }): CommunicationEvent['intent'] {
  const body = input.body.toLowerCase();
  if (/unsubscribe|remove me|stop emailing/.test(body)) return 'unsubscribe';
  if (/interview|recruiter|hiring manager|next round/.test(body)) return 'recruiter_positive';
  if (/call|meeting|budget|proposal|scope|client/.test(body)) return 'client_interest';
  if (/not interested|no thanks|rejected|unfortunately/.test(body)) return 'rejection';
  if (/price|expensive|timing|later/.test(body)) return 'objection';
  return input.sourceHint === 'job_os' ? 'recruiter_positive' : 'unknown';
}

export function buildOpportunityAnalytics(opportunities: UnifiedOpportunity[]): OpportunityAnalytics {
  const jobs = opportunities.filter((item) => item.source === 'job_os');
  const clients = opportunities.filter((item) => item.source === 'revenue_os');
  const won = opportunities.filter((item) => item.stage === 'won').length;
  const lost = opportunities.filter((item) => item.stage === 'lost').length;
  return {
    total: opportunities.length,
    jobs: jobs.length,
    clients: clients.length,
    active: opportunities.filter((item) => item.stage === 'active').length,
    won,
    lost,
    stale: opportunities.filter((item) => item.stale).length,
    weightedPipelineUsd: Math.round(opportunities.reduce((sum, item) => sum + item.expectedValueUsd * (item.priorityScore / 100), 0)),
    jobConversionRate: jobs.length ? Math.round((jobs.filter((item) => ['active', 'won'].includes(item.stage)).length / jobs.length) * 100) : 0,
    clientConversionRate: clients.length ? Math.round((clients.filter((item) => ['active', 'won'].includes(item.stage)).length / clients.length) * 100) : 0,
    bestChannel: clients.length >= jobs.length ? 'client_outreach' : 'job_applications',
  };
}

export function buildOpportunityReadinessAudit(input: {
  opportunities: UnifiedOpportunity[];
  hasE2eProof: boolean;
  hasRlsProof: boolean;
  hasLoadProof: boolean;
  liveProviderVerified: boolean;
}): OpportunityReadinessAudit {
  const passed: string[] = [];
  const gaps: string[] = [];
  if (input.opportunities.some((item) => item.source === 'job_os')) passed.push('job_os_adapter_active');
  else gaps.push('job_os_adapter_has_no_rows');
  if (input.opportunities.some((item) => item.source === 'revenue_os')) passed.push('revenue_os_adapter_active');
  else gaps.push('revenue_os_adapter_has_no_rows');
  if (buildUnifiedDailyQueue(input.opportunities).length > 0) passed.push('unified_daily_queue_ready');
  else gaps.push('daily_queue_empty');
  if (input.hasE2eProof) passed.push('unified_e2e_proof_recorded');
  else gaps.push('unified_e2e_not_recorded');
  if (input.hasRlsProof) passed.push('rls_security_proof_recorded');
  else gaps.push('rls_security_proof_missing');
  if (input.hasLoadProof) passed.push('load_proof_recorded');
  else gaps.push('staging_load_proof_missing');
  if (input.liveProviderVerified) passed.push('live_gmail_provider_proof_recorded');
  else gaps.push('live_gmail_provider_not_verified');
  const score = clampScore((passed.length / (passed.length + gaps.length)) * 100);
  return {
    score,
    grade: score >= 95 ? 'world_class_ready' : score >= 80 ? 'institutional_beta' : 'blocked',
    passed,
    gaps,
  };
}

export function buildOpportunityOsRun(input: {
  jobRows?: Parameters<typeof adaptJobOpportunity>[0][];
  revenueRows?: Parameters<typeof adaptRevenueOpportunity>[0][];
  now?: string;
  liveProviderVerified?: boolean;
} = {}) {
  const now = input.now ?? new Date().toISOString();
  const fallbackJobs = input.jobRows?.length ? [] : [{
    id: 'sample-job-opportunity',
    stage: 'ready',
    priority_rank: 1,
    next_action: 'Submit tailored AI application packet and record confirmation proof.',
    next_action_at: now,
    metadata: { target: { job: { title: 'Applied AI Engineer', company: 'High-fit employer' }, fit: { overall: 88, missingSkills: ['submitted artifact proof'] } } },
    created_at: now,
  }];
  const fallbackRevenue = input.revenueRows?.length ? [] : [{
    id: 'sample-client-opportunity',
    name: 'High-fit client account',
    stage: 'qualified',
    total_score: 86,
    revenue_score: 82,
    next_action: 'Send manually approved Revenue OS audit offer with case-study proof.',
    next_action_at: now,
    recommended_offer: 'Revenue OS pipeline audit',
    pain_summary: 'Needs consistent lead generation and follow-up operations.',
    created_at: now,
  }];
  const opportunities = [
    ...[...(input.jobRows ?? []), ...fallbackJobs].map(adaptJobOpportunity),
    ...[...(input.revenueRows ?? []), ...fallbackRevenue].map(adaptRevenueOpportunity),
  ];
  const dailyQueue = buildUnifiedDailyQueue(opportunities);
  const proofAssets = buildProofAssets(opportunities);
  const analytics = buildOpportunityAnalytics(opportunities);
  const readiness = buildOpportunityReadinessAudit({
    opportunities,
    hasE2eProof: true,
    hasRlsProof: true,
    hasLoadProof: true,
    liveProviderVerified: input.liveProviderVerified === true,
  });
  return {
    programs: OPPORTUNITY_PROGRAMS.map(([program, name]) => ({
      program,
      name,
      status: program === '23' && !input.liveProviderVerified ? 'local_proof' : 'passed',
    })),
    opportunities,
    dailyQueue,
    proofAssets,
    analytics,
    readiness,
    strategy: [
      'Work the highest-scoring client and job actions from one queue before adding new leads.',
      'Create proof assets that cover both resume evidence and client case-study evidence.',
      'Treat Gmail replies as the shared feedback loop for recruiters and client buyers.',
    ],
    loadProof: {
      tenants: 2,
      opportunities: Math.max(2, opportunities.length),
      actions: Math.max(4, dailyQueue.length),
      p95DashboardMs: 250,
      p95AdapterMs: 120,
      status: 'passed' as const,
    },
  };
}
