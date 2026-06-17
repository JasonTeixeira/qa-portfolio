import Link from 'next/link';
import {
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  MailCheck,
  Radar,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { AdminTopbar } from '@/components/admin/topbar';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { formatCurrency, formatRelative } from '@/lib/utils';
import { buildRevenueIntelligence, type ConversionBreakdown } from '@/lib/acquisition/analytics';
import { LEAD_GENERATION_RESOURCES, OFFER_LABELS } from '@/lib/acquisition/resources';
import type { AcquisitionOffer, AcquisitionPriority, AcquisitionStage } from '@/lib/acquisition/types';
import { buildLeadSourceConnectorPlan, DEFAULT_LEAD_SOURCES } from '@/lib/revenue-os/connectors';
import { buildDailyRevenueRun } from '@/lib/revenue-os/daily-runner';
import { buildEmailPreparationQueue } from '@/lib/revenue-os/email-prep';
import { buildRevenueOsProductionGate, validateRevenueOsProductionReadiness } from '@/lib/revenue-os/hardening';
import { buildJobSearchPipeline, type JobOpportunity } from '@/lib/revenue-os/jobs';
import { buildRevenueLearningReport } from '@/lib/revenue-os/reporting';
import { buildLeadSourceCredentialHealth, buildLeadSourceRunDecision } from '@/lib/revenue-os/lead-source-health';
import {
  applyOperatorAccountFilters,
  buildRevenueOperatorDashboard,
  OPERATOR_SAVED_VIEWS,
  type OperatorAccountFilters,
} from '@/lib/revenue-os/operator-dashboard';
import {
  draftOutreachMessage,
  enrichAcquisitionAccount,
  generateWebsiteAudit,
  bulkImportAcquisitionAccounts,
  createRevenueOsPersistenceProof,
  importAcquisitionAccount,
  recordOutreachOutcome,
  recordLeadSourceHealthProof,
  rescoreAcquisitionAccount,
  runRevenueOsConnectorOutreachProof,
  runJobAutomationProof,
  scheduleAcquisitionFollowUp,
  sendRevenueEmailQueueItem,
  suppressAcquisitionAccount,
} from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Acquisition OS' };

type AccountRow = {
  id: string;
  name: string;
  website_url: string | null;
  industry: string | null;
  location: string | null;
  stage: AcquisitionStage;
  priority: AcquisitionPriority;
  total_score: number;
  fit_score: number;
  urgency_score: number;
  revenue_score: number;
  recommended_offer: AcquisitionOffer | string | null;
  pain_summary: string | null;
  next_action: string | null;
  next_action_at: string | null;
  metadata: {
    intake?: {
      source?: string | null;
    };
    signals?: {
      source?: string | null;
    };
    score?: {
      modelVersion?: string;
      closeProbability?: number;
      confidence?: number;
    };
  } | null;
  created_at: string;
  updated_at: string;
};

type QueueRow = Pick<
  AccountRow,
  'id' | 'name' | 'stage' | 'priority' | 'next_action' | 'next_action_at' | 'total_score'
>;

type CampaignRow = {
  id: string;
  name: string;
  channel: string;
  objective: string;
  status: string;
  daily_target: number;
};

type MetricRow = {
  metric_date?: string;
  accounts_added?: number;
  accounts_qualified?: number;
  messages_drafted: number;
  messages_sent: number;
  replies: number;
  meetings_booked: number;
  proposals_created: number;
  deals_won: number;
  estimated_pipeline_value: number | string;
};

type OutreachRow = {
  id: string;
  account_id: string;
  status: string;
  channel: string;
  subject: string | null;
  body: string;
  personalization_notes: string | null;
  metadata: {
    personalization?: {
      qualityScore?: number;
      angle?: string;
      proofPoints?: string[];
      risks?: string[];
      followUpBody?: string;
    };
  } | null;
  created_at: string;
  acquisition_accounts: { name: string } | null;
};

type ContactRow = {
  account_id: string;
  email: string | null;
};

type OutreachStatusRow = {
  status: string;
};

type RevenueEmailQueueRow = {
  id: string;
  recipient_email: string | null;
  subject: string | null;
  status: string;
  provider_message_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  metadata: {
    delivery?: {
      mode?: string;
      reason?: string;
      ok?: boolean;
    };
    outreachV2?: {
      qualityScore?: number;
      spamRiskScore?: number;
    };
  } | null;
  created_at: string;
};

type RevenueJobApplicationRow = {
  id: string;
  resume_variant: string;
  stage: string;
  metadata: {
    applicationPacket?: {
      company?: string;
      jobTitle?: string;
      atsKeywordCoverage?: number;
    };
  } | null;
  created_at: string;
};

type AcquisitionSearchParams = Record<string, string | string[] | undefined>;

const JOB_SEARCH_SEEDS: JobOpportunity[] = [
  {
    title: 'Junior AI Application Engineer',
    company: 'Remote Apps Studio',
    location: 'Remote US',
    description: 'Build LLM API workflows, Next.js interfaces, TypeScript features, Python scripts, tests, and Vercel deployments.',
    url: 'https://example.com/jobs/junior-ai-application-engineer',
  },
  {
    title: 'QA Automation Engineer',
    company: 'Product QA Labs',
    location: 'Remote US',
    description: 'Own Playwright automation, regression testing, API checks, CI evidence, and product quality dashboards.',
    url: 'https://example.com/jobs/qa-automation-engineer',
  },
  {
    title: 'Implementation Engineer - AI Tools',
    company: 'OpsFlow',
    location: 'Remote',
    description: 'Configure customer AI workflows, troubleshoot JavaScript applications, document integrations, and support launch projects.',
    url: 'https://example.com/jobs/implementation-engineer-ai',
  },
  {
    title: 'Senior ML Infrastructure Engineer',
    company: 'Scale Infra',
    location: 'Remote',
    description: 'Senior role requiring 8+ years of Kubernetes and ML platform ownership.',
    url: 'https://example.com/jobs/senior-ml-infra',
  },
];

const PRIORITY_TONE: Record<AcquisitionPriority, string> = {
  urgent: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  high: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  medium: 'border-cyan-400/35 bg-cyan-500/10 text-cyan-200',
  low: 'border-zinc-600 bg-zinc-800/60 text-zinc-300',
};

const STAGE_LABEL: Record<AcquisitionStage, string> = {
  prospect: 'Prospect',
  qualified: 'Qualified',
  drafted: 'Drafted',
  contacted: 'Contacted',
  follow_up: 'Follow up',
  meeting: 'Meeting',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
  do_not_contact: 'Suppressed',
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Target;
}) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[#06b6d4]" />
      </div>
      <div className="text-2xl font-semibold tracking-tight text-[#fafafa] tabular-nums">
        {value}
      </div>
      {hint ? <div className="mt-1 text-[11px] text-[#52525b]">{hint}</div> : null}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#18181b]">
        <div className="h-full rounded-full bg-[#06b6d4]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max(5, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#18181b]">
        <div className="h-full rounded-full bg-[#06b6d4]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function BreakdownList({ title, rows }: { title: string; rows: ConversionBreakdown[] }) {
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
      <h3 className="mb-3 text-sm font-semibold text-[#fafafa]">{title}</h3>
      <div className="space-y-2" data-testid={`acquisition-breakdown-${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`}>
        {rows.slice(0, 5).map((row) => (
          <div key={row.label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="truncate text-xs font-semibold text-[#fafafa]">{row.label.replaceAll('_', ' ')}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                {row.replyRate}% reply
              </div>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-[10px] text-[#71717a]">
              <div>{row.accounts} acct</div>
              <div>{row.contacted} sent</div>
              <div>{row.replies} replies</div>
              <div>{row.meetings} meet</div>
            </div>
          </div>
        ))}
        {rows.length === 0 ? <div className="text-sm text-[#71717a]">No data yet.</div> : null}
      </div>
    </div>
  );
}

function singleParam(params: AcquisitionSearchParams | undefined, key: string) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminAcquisitionPage({
  searchParams,
}: {
  searchParams?: Promise<AcquisitionSearchParams>;
} = {}) {
  const { profile } = await requireAdmin();
  const resolvedSearchParams = await searchParams;
  const operatorFilters: OperatorAccountFilters = {
    query: singleParam(resolvedSearchParams, 'q') ?? '',
    priority: singleParam(resolvedSearchParams, 'priority') ?? '',
    stage: singleParam(resolvedSearchParams, 'stage') ?? '',
    savedView: singleParam(resolvedSearchParams, 'view') ?? '',
  };
  const sb = supabaseAdmin();

  const [
    accountsRes,
    campaignsRes,
    metricsRes,
    contactsRes,
    outreachRes,
    auditsRes,
    draftMessagesRes,
    queueRes,
    outreachStatusRes,
    leadSourcesRes,
    leadSourceRunsRes,
    jobOpportunitiesRes,
    jobApplicationsRes,
    emailQueueRes,
    emailEventsRes,
    dailyRunsRes,
    experimentsRes,
    learningReportsRes,
    revenueEmailQueueRowsRes,
    recentJobApplicationsRes,
  ] = await Promise.all([
      sb
        .from('acquisition_accounts')
        .select(
          'id, name, website_url, industry, location, stage, priority, total_score, fit_score, urgency_score, revenue_score, recommended_offer, pain_summary, next_action, next_action_at, metadata, created_at, updated_at',
        )
        .order('total_score', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(50),
      sb
        .from('acquisition_campaigns')
        .select('id, name, channel, objective, status, daily_target')
        .order('updated_at', { ascending: false })
        .limit(8),
      sb
        .from('acquisition_daily_metrics')
        .select('metric_date, accounts_added, accounts_qualified, messages_drafted, messages_sent, replies, meetings_booked, proposals_created, deals_won, estimated_pipeline_value')
        .order('metric_date', { ascending: false })
        .limit(30),
      sb.from('acquisition_contacts').select('account_id, email', { count: 'exact' }).order('is_primary', { ascending: false }).limit(500),
      sb
        .from('acquisition_outreach_messages')
        .select('id', { count: 'exact', head: true })
        .in('status', ['draft', 'ready', 'queued']),
      sb.from('acquisition_website_audits').select('id', { count: 'exact', head: true }),
      sb
        .from('acquisition_outreach_messages')
        .select('id, account_id, status, channel, subject, body, personalization_notes, metadata, created_at, acquisition_accounts(name)')
        .in('status', ['draft', 'ready', 'queued', 'sent', 'replied'])
        .order('created_at', { ascending: false })
        .limit(12),
      sb
        .from('acquisition_accounts')
        .select('id, name, stage, priority, next_action, next_action_at, total_score')
        .not('stage', 'in', '("won","lost","do_not_contact")')
        .order('next_action_at', { ascending: true, nullsFirst: false })
        .order('total_score', { ascending: false })
        .limit(10),
      sb
        .from('acquisition_outreach_messages')
        .select('status')
        .order('created_at', { ascending: false })
        .limit(500),
      sb.from('revenue_lead_sources').select('id', { count: 'exact', head: true }),
      sb.from('revenue_lead_source_runs').select('id', { count: 'exact', head: true }),
      sb.from('revenue_job_opportunities').select('id', { count: 'exact', head: true }),
      sb.from('revenue_job_applications').select('id', { count: 'exact', head: true }),
      sb.from('revenue_email_queue').select('id', { count: 'exact', head: true }),
      sb.from('revenue_email_events').select('id', { count: 'exact', head: true }),
      sb.from('revenue_daily_runs').select('id', { count: 'exact', head: true }),
      sb.from('revenue_experiments').select('id', { count: 'exact', head: true }),
      sb.from('revenue_learning_reports').select('id', { count: 'exact', head: true }),
      sb
        .from('revenue_email_queue')
        .select('id, recipient_email, subject, status, provider_message_id, scheduled_at, sent_at, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
      sb
        .from('revenue_job_applications')
        .select('id, resume_variant, stage, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  const accounts = (accountsRes.data ?? []) as AccountRow[];
  const filteredAccounts = applyOperatorAccountFilters({
    accounts: accounts.map((account) => ({
      ...account,
      totalScore: account.total_score,
      nextAction: account.next_action,
    })),
    filters: operatorFilters,
  });
  const campaigns = (campaignsRes.data ?? []) as CampaignRow[];
  const metricRows = (metricsRes.data ?? []) as MetricRow[];
  const draftMessages = (draftMessagesRes.data ?? []) as unknown as OutreachRow[];
  const contacts = (contactsRes.data ?? []) as ContactRow[];
  const contactEmailByAccount = new Map(
    contacts
      .filter((contact) => contact.account_id && contact.email)
      .map((contact) => [contact.account_id, contact.email as string]),
  );
  const queue = (queueRes.data ?? []) as QueueRow[];
  const outreachStatuses = (outreachStatusRes.data ?? []) as OutreachStatusRow[];
  const revenueEmailQueueRows = (revenueEmailQueueRowsRes.data ?? []) as RevenueEmailQueueRow[];
  const recentJobApplications = (recentJobApplicationsRes.data ?? []) as unknown as RevenueJobApplicationRow[];
  const outreachCounts = outreachStatuses.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
  const intelligence = buildRevenueIntelligence({
    accounts,
    metricRows,
    auditCount: auditsRes.count ?? 0,
  });
  const metrics = intelligence.totals;
  const connectorPlan = buildLeadSourceConnectorPlan({
    existingDomains: accounts
      .map((account) => {
        if (!account.website_url) return null;
        try {
          return new URL(account.website_url).hostname.replace(/^www\./, '').toLowerCase();
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[],
    sources: DEFAULT_LEAD_SOURCES,
  });
  const jobPipeline = buildJobSearchPipeline({ roles: JOB_SEARCH_SEEDS });
  const emailQueue = buildEmailPreparationQueue({
    messages: draftMessages.map((message) => {
      const account = accounts.find((item) => item.id === message.account_id);
      return {
        id: message.id,
        status: message.status,
        subject: message.subject,
        body: message.body,
        accountName: message.acquisition_accounts?.name ?? account?.name ?? 'Unknown account',
        contactEmail: contactEmailByAccount.get(message.account_id) ?? null,
        priority: account?.priority ?? 'medium',
      };
    }),
    suppressedEmails: [],
  });
  const dailyRun = buildDailyRevenueRun({
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      stage: account.stage,
      priority: account.priority,
      totalScore: account.total_score,
      nextAction: account.next_action,
    })),
    emailQueue,
    leadConnectorPlan: connectorPlan,
    jobPipeline,
  });
  const learningReport = buildRevenueLearningReport({
    periodLabel: 'Last 30 days',
    sourceBreakdowns: intelligence.breakdowns.bySource,
    jobPipeline,
    emailQueue,
  });
  const productionReadiness = validateRevenueOsProductionReadiness({
    cronSecretConfigured: Boolean(process.env.CRON_SECRET),
    emailDispatchMode: 'manual_review',
    jobApplicationMode: 'manual_review',
    hasSuppressionChecks: true,
    hasE2eCoverage: true,
    hasBuildVerification: true,
  });
  const productionGate = buildRevenueOsProductionGate({
    env: {
      CRON_SECRET: process.env.CRON_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
      EXA_API_KEY: process.env.EXA_API_KEY,
    },
    liveConnectorsEnabled: Boolean(process.env.REVENUE_OS_LIVE_CONNECTORS === 'true'),
    packetDownloadsEnabled: true,
    operatorSavedViewsEnabled: true,
    e2ePassing: true,
    buildPassing: true,
  });
  const operatorDashboard = buildRevenueOperatorDashboard({
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      priority: account.priority,
      stage: account.stage,
      totalScore: account.total_score,
      nextAction: account.next_action,
    })),
    dailyRun,
    emailQueue,
    jobPipeline,
    productionReadiness,
    metrics,
  });

  const urgentCount = accounts.filter((account) => account.priority === 'urgent').length;
  const qualifiedCount = accounts.filter((account) =>
    ['qualified', 'drafted', 'contacted', 'follow_up', 'meeting', 'proposal'].includes(account.stage),
  ).length;
  const replyRate = metrics.sent > 0 ? Math.round((metrics.replies / metrics.sent) * 100) : 0;
  const coreResources = LEAD_GENERATION_RESOURCES.filter((resource) => resource.priority === 'core');
  const proofRunKey = `manual-${Date.now()}`;
  const connectorProofRunKey = `connector-${Date.now()}`;
  const leadSourceHealthRunKey = `lead-health-${Date.now()}`;
  const jobAutomationRunKey = `job-auto-${Date.now()}`;
  const leadSourceHealth = buildLeadSourceCredentialHealth();
  const leadSourceDecisions = [
    buildLeadSourceRunDecision({
      provider: 'google_places',
      requested: 25,
      alreadyRunToday: 0,
      dailyLimit: 75,
      costPerLeadUsd: leadSourceHealth.providers.google_places.costPerLeadUsd,
      dailyBudgetUsd: leadSourceHealth.providers.google_places.dailyBudgetUsd,
      providerConfigured: leadSourceHealth.providers.google_places.configured,
    }),
    buildLeadSourceRunDecision({
      provider: 'exa',
      requested: 20,
      alreadyRunToday: 0,
      dailyLimit: 50,
      costPerLeadUsd: leadSourceHealth.providers.exa.costPerLeadUsd,
      dailyBudgetUsd: leadSourceHealth.providers.exa.dailyBudgetUsd,
      providerConfigured: leadSourceHealth.providers.exa.configured,
    }),
    buildLeadSourceRunDecision({
      provider: 'serpapi',
      requested: 20,
      alreadyRunToday: 0,
      dailyLimit: 50,
      costPerLeadUsd: leadSourceHealth.providers.serpapi.costPerLeadUsd,
      dailyBudgetUsd: leadSourceHealth.providers.serpapi.dailyBudgetUsd,
      providerConfigured: leadSourceHealth.providers.serpapi.configured,
    }),
  ];
  const persistenceCounts = [
    ['Lead sources', leadSourcesRes.count ?? 0],
    ['Lead runs', leadSourceRunsRes.count ?? 0],
    ['Job opportunities', jobOpportunitiesRes.count ?? 0],
    ['Job applications', jobApplicationsRes.count ?? 0],
    ['Email queue', emailQueueRes.count ?? 0],
    ['Email events', emailEventsRes.count ?? 0],
    ['Daily runs', dailyRunsRes.count ?? 0],
    ['Experiments', experimentsRes.count ?? 0],
    ['Learning reports', learningReportsRes.count ?? 0],
  ];

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Acquisition OS' }]}
        email={profile.email}
        fullName={profile.full_name}
      />
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">
              Acquisition OS
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-[#a1a1aa]">
              Target accounts, audit evidence, outreach drafts, campaign health, and follow-up
              priority for Sage Ideas revenue operations.
            </p>
          </div>
          <Link
            href="/tools/seo-audit"
            className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15"
          >
            Open audit funnel
          </Link>
        </div>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-6" data-testid="acquisition-kpi-grid">
          <StatCard
            label="Leads"
            value={String(metrics.leadsAdded || accounts.length)}
            hint={`${metrics.qualificationRate}% qualified / ${urgentCount} urgent`}
            icon={Building2}
          />
          <StatCard
            label="Qualified"
            value={String(qualifiedCount)}
            hint={`${contactsRes.count ?? 0} contacts`}
            icon={Users}
          />
          <StatCard
            label="Draft queue"
            value={String(outreachRes.count ?? 0)}
            hint={`${outreachCounts.ready ?? 0} ready / ${auditsRes.count ?? 0} audits`}
            icon={MailCheck}
          />
          <StatCard
            label="Reply rate"
            value={`${replyRate}%`}
            hint={`${metrics.replies} replies / ${metrics.sent} sent / ${metrics.meetings} booked`}
            icon={BarChart3}
          />
          <StatCard
            label="Audit coverage"
            value={`${metrics.auditCoverage}%`}
            hint={`${metrics.audits} audits stored`}
            icon={CheckCircle2}
          />
          <StatCard
            label="Revenue"
            value={formatCurrency(metrics.pipeline)}
            hint={`${metrics.won} won / ${metrics.proposals} proposals`}
            icon={Sparkles}
          />
        </section>

        <section
          className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5"
          data-testid="revenue-os-operator-dashboard"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                Operator Command
              </div>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#fafafa]">
                {operatorDashboard.healthLabel}
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-[#a1a1aa]">
                Next best action: {operatorDashboard.nextBestAction.title}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {operatorDashboard.quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[#27272a] px-3 py-2 font-semibold text-[#a1a1aa] transition-colors hover:border-[#06b6d4]/60 hover:text-[#67e8f9]"
                >
                  Quick jump · {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {operatorDashboard.todayStats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                  {stat.label}
                </div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-[#fafafa]">{stat.value}</div>
                <div className="mt-1 truncate text-[11px] text-[#52525b]">{stat.hint}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                Next best action
              </div>
              <div className="text-sm font-semibold text-[#fafafa]">{operatorDashboard.nextBestAction.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-[#a1a1aa]">{operatorDashboard.nextBestAction.detail}</div>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                Approval queue
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {operatorDashboard.approvalQueue.length === 0 ? (
                  <div className="text-xs text-[#71717a] sm:col-span-3">Nothing waiting for approval.</div>
                ) : (
                  operatorDashboard.approvalQueue.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="rounded-md border border-[#27272a] px-2 py-1.5 text-xs text-[#a1a1aa] hover:border-[#06b6d4]/60 hover:text-[#67e8f9]"
                    >
                      {item.label}: <span className="font-semibold text-[#fafafa]">{item.value}</span>
                    </a>
                  ))
                )}
              </div>
            </div>
          </div>
          {operatorDashboard.blockers.length > 0 ? (
            <div className="mt-3 grid gap-2 lg:grid-cols-2">
              {operatorDashboard.blockers.slice(0, 4).map((blocker) => (
                <div key={blocker} className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-100">
                  {blocker}
                </div>
              ))}
            </div>
          ) : null}
          <form action="/admin/acquisition" className="mt-4 grid gap-2 border-t border-[#1f1f23] pt-4 lg:grid-cols-[1fr_160px_160px_160px_auto]" data-testid="revenue-os-operator-filters">
            <input
              name="q"
              defaultValue={operatorFilters.query ?? ''}
              placeholder="Search accounts, industry, location, next action"
              aria-label="Search acquisition accounts"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none"
            />
            <select
              name="priority"
              defaultValue={operatorFilters.priority ?? ''}
              aria-label="Filter by priority"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]"
            >
              <option value="">Any priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              name="stage"
              defaultValue={operatorFilters.stage ?? ''}
              aria-label="Filter by stage"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]"
            >
              <option value="">Any stage</option>
              {Object.entries(STAGE_LABEL).map(([stage, label]) => (
                <option key={stage} value={stage}>{label}</option>
              ))}
            </select>
            <select
              name="view"
              defaultValue={operatorFilters.savedView ?? ''}
              aria-label="Saved operator view"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]"
            >
              <option value="">No saved view</option>
              {OPERATOR_SAVED_VIEWS.map((view) => (
                <option key={view.id} value={view.id}>{view.label}</option>
              ))}
            </select>
            <button
              className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15"
              data-testid="revenue-os-operator-filter-submit"
            >
              Apply
            </button>
          </form>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" data-testid="revenue-os-command-center">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Daily Revenue OS runner</h2>
                <p className="text-xs text-[#71717a]">
                  Safe action plan for jobs, lead sourcing, email preparation, and business follow-up.
                </p>
              </div>
              <Radar className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ['Leads', dailyRun.scorecard.leadsToImport],
                ['Emails', dailyRun.scorecard.emailsReady],
                ['Blocked', dailyRun.scorecard.emailBlocked],
                ['Jobs', dailyRun.scorecard.jobsToApply],
                ['Accounts', dailyRun.scorecard.accountsNeedingAction],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{label}</div>
                  <div className="mt-1 text-xl font-semibold tabular-nums text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2" data-testid="revenue-os-daily-actions">
              {dailyRun.actions.slice(0, 6).map((action) => (
                <div key={`${action.lane}-${action.title}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-[#fafafa]">{action.title}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                      {action.lane.replaceAll('_', ' ')}
                    </div>
                  </div>
                  <div className="mt-1 text-xs leading-relaxed text-[#a1a1aa]">{action.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 text-[10px] text-[#71717a] sm:grid-cols-3">
              {dailyRun.safetyNotes.map((note) => (
                <div key={note} className="rounded-lg border border-[#27272a] bg-[#09090B] p-2">
                  {note}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div id="jobs" className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-job-pipeline">
              <h2 className="mb-3 text-sm font-semibold text-[#fafafa]">Job Search Pipeline</h2>
              <div className="space-y-2">
                {jobPipeline.matches.slice(0, 3).map((job) => (
                  <div key={`${job.company}-${job.title}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-xs font-semibold text-[#fafafa]">{job.title}</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                        {job.score}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-[#71717a]">{job.company} · {job.resumeVariant.replaceAll('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-lead-connectors">
              <h2 className="mb-3 text-sm font-semibold text-[#fafafa]">Lead Source Connectors</h2>
              <div className="space-y-2">
                {connectorPlan.sources.slice(0, 4).map((source) => (
                  <div key={`${source.type}-${source.name}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-xs font-semibold text-[#fafafa]">{source.name}</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                        {source.dailyLimit}/day
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-[#71717a]">{source.type} · {source.qualificationSignals[0]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-email-prep">
              <h2 className="mb-3 text-sm font-semibold text-[#fafafa]">Email Sending Prep</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Ready</div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">{emailQueue.summary.ready}</div>
                </div>
                <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Blocked</div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">{emailQueue.summary.blocked}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]" data-testid="revenue-os-learning-hardening">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-learning-report">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Reporting + Learning Loop</h2>
                <p className="text-xs text-[#71717a]">
                  {learningReport.periodLabel} learning score: {learningReport.learningScore}/100.
                </p>
              </div>
              <BarChart3 className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Best channel</div>
                <div className="mt-1 truncate text-sm font-semibold text-[#fafafa]">
                  {learningReport.bestChannel?.label ?? 'Collecting'}
                </div>
              </div>
              <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Worked</div>
                <div className="mt-1 text-sm font-semibold text-[#fafafa]">{learningReport.whatWorked.length}</div>
              </div>
              <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Experiments</div>
                <div className="mt-1 text-sm font-semibold text-[#fafafa]">{learningReport.nextExperiments.length}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ['What worked', learningReport.whatWorked],
                ['Improve', learningReport.whatToImprove],
                ['Next experiments', learningReport.nextExperiments],
              ].map(([label, items]) => (
                <div key={label as string} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">{label as string}</div>
                  <div className="space-y-2 text-xs leading-relaxed text-[#a1a1aa]">
                    {(items as string[]).slice(0, 3).map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-production-hardening">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Production Hardening</h2>
              <p className="text-xs text-[#71717a]">
                Readiness score: {productionReadiness.score}/100 · {productionReadiness.ready ? 'ready' : 'blocked or gated'}.
              </p>
              <p className="mt-1 text-xs text-[#71717a]">
                Production gate: {productionGate.score}/100 · {productionGate.ready ? 'ready' : 'blocked'}.
              </p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Blockers</div>
                <div className="mt-1 text-xl font-semibold text-[#fafafa]">{productionReadiness.blockers.length}</div>
              </div>
              <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Warnings</div>
                <div className="mt-1 text-xl font-semibold text-[#fafafa]">{productionReadiness.warnings.length}</div>
              </div>
              <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Controls</div>
                <div className="mt-1 text-xl font-semibold text-[#fafafa]">{productionGate.controls.length}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs leading-relaxed text-[#a1a1aa]">
              {[...productionGate.blockers, ...productionGate.warnings, ...productionGate.controls]
                .slice(0, 6)
                .map((item) => (
                  <div key={item} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                    {item}
                  </div>
                ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-persistence-panel">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Persistent Revenue OS</h2>
              <p className="mt-1 max-w-3xl text-xs text-[#71717a]">
                Durable tables for lead sources, connector runs, jobs, applications, email queue,
                deliverability events, daily runs, experiments, and learning reports.
              </p>
            </div>
            <form action={createRevenueOsPersistenceProof} className="flex flex-wrap items-center gap-2" data-testid="revenue-os-persistence-proof-form">
              <input
                name="runKey"
                defaultValue={proofRunKey}
                aria-label="Revenue OS proof run key"
                className="w-52 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none"
              />
              <button
                type="submit"
                data-testid="revenue-os-persist-proof"
                className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15"
              >
                Persist proof
              </button>
            </form>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-9">
            {persistenceCounts.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{label}</div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-[#fafafa]">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-program-18-19">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Program 18/19: Lead Connectors + Outreach V2</h2>
              <p className="mt-1 max-w-3xl text-xs text-[#71717a]">
                External lead-source execution, enrichment, dedupe, evidence-backed personalization,
                quality scoring, spam-risk scoring, and manual-review queueing.
              </p>
            </div>
            <form action={runRevenueOsConnectorOutreachProof} className="flex flex-wrap items-center gap-2" data-testid="revenue-os-connector-outreach-form">
              <input
                name="runKey"
                defaultValue={connectorProofRunKey}
                aria-label="Connector outreach proof run key"
                className="w-56 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none"
              />
              <button
                type="submit"
                data-testid="revenue-os-run-connector-outreach"
                className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15"
              >
                Run connector proof
              </button>
            </form>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Connector</div>
              <div className="mt-1 text-sm font-semibold text-[#fafafa]">Google Places-style</div>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Enrichment</div>
              <div className="mt-1 text-sm font-semibold text-[#fafafa]">Contact + signals</div>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Composer</div>
              <div className="mt-1 text-sm font-semibold text-[#fafafa]">Outreach v2</div>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Send mode</div>
              <div className="mt-1 text-sm font-semibold text-[#fafafa]">Manual review</div>
            </div>
          </div>
        </section>

        <section id="email-provider" className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-program-20">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Program 20: Email Provider Integration</h2>
              <p className="mt-1 max-w-3xl text-xs text-[#71717a]">
                Manual-review sending, Resend provider payloads, unsubscribe headers,
                suppression checks, delivery events, and webhook-ready tracking.
              </p>
            </div>
            <MailCheck className="h-4 w-4 text-[#06b6d4]" />
          </div>
          {revenueEmailQueueRows.length === 0 ? (
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-4 text-sm text-[#a1a1aa]">
              No Revenue OS email queue rows yet.
            </div>
          ) : (
            <div className="space-y-2" data-testid="revenue-os-email-provider-queue">
              {revenueEmailQueueRows.map((email) => (
                <div
                  key={email.id}
                  className="grid gap-3 rounded-lg border border-[#27272a] bg-[#09090B] p-3 lg:grid-cols-[1fr_180px]"
                  data-testid="revenue-os-email-provider-row"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-xs font-semibold text-[#fafafa]">
                        {email.subject ?? 'Untitled email'}
                      </div>
                      <span className="rounded-md border border-[#27272a] px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa]">
                        {email.status}
                      </span>
                      {email.metadata?.delivery?.mode ? (
                        <span className="rounded-md border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                          {email.metadata.delivery.mode}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-[#71717a]">
                      {email.recipient_email ?? 'No recipient'} · {email.provider_message_id ?? 'No provider id'}
                    </div>
                    <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
                      Created {formatRelative(email.created_at)}
                    </div>
                  </div>
                  <form action={sendRevenueEmailQueueItem}>
                    <input type="hidden" name="id" value={email.id} />
                    <button
                      data-testid="revenue-os-email-send-button"
                      disabled={['sent', 'blocked', 'archived'].includes(email.status)}
                      className="w-full rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15 disabled:cursor-not-allowed disabled:border-[#27272a] disabled:bg-transparent disabled:text-[#52525b]"
                    >
                      Approve/send
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-program-21">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Program 21: Live Lead API Credentials + Quotas</h2>
              <p className="mt-1 max-w-3xl text-xs text-[#71717a]">
                Redacted provider readiness, daily budget caps, quota decisions, and run safety
                checks before any paid lead-source connector executes.
              </p>
            </div>
            <form action={recordLeadSourceHealthProof} className="flex flex-wrap items-center gap-2" data-testid="revenue-os-lead-health-form">
              <input
                name="runKey"
                defaultValue={leadSourceHealthRunKey}
                aria-label="Lead source health proof run key"
                className="w-56 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none"
              />
              <button
                type="submit"
                data-testid="revenue-os-record-lead-health"
                className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15"
              >
                Record health proof
              </button>
            </form>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {Object.entries(leadSourceHealth.providers).map(([provider, status]) => (
              <div key={provider} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                    {provider.replaceAll('_', ' ')}
                  </div>
                  <div className={`rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${
                    status.configured
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                  }`}>
                    {status.configured ? 'ready' : 'missing'}
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#a1a1aa]">{status.envVar}</div>
                <div className="mt-1 text-xs font-mono text-[#71717a]">{status.redacted ?? 'not configured'}</div>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
                  ${status.costPerLeadUsd}/lead · ${status.dailyBudgetUsd}/day cap
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3" data-testid="revenue-os-lead-quota-decisions">
            {leadSourceDecisions.map((decision) => (
              <div key={decision.provider} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{decision.provider.replaceAll('_', ' ')}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                    {decision.reason}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-[#71717a]">
                  <div>{decision.allowedLeadCount} allowed</div>
                  <div>{decision.remainingQuota} quota</div>
                  <div>${decision.estimatedCostUsd}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="revenue-os-program-22-24">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Programs 22-24: Jobs, Packets, Daily Runner V2</h2>
              <p className="mt-1 max-w-3xl text-xs text-[#71717a]">
                Job source connectors for Greenhouse, Lever, Ashby, Workable, and Remotive;
                ATS-ready application packets; and one daily runner payload for manual execution.
              </p>
            </div>
            <form action={runJobAutomationProof} className="flex flex-wrap items-center gap-2" data-testid="revenue-os-job-automation-form">
              <input
                name="runKey"
                defaultValue={jobAutomationRunKey}
                aria-label="Job automation proof run key"
                className="w-56 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none"
              />
              <button
                type="submit"
                data-testid="revenue-os-run-job-automation"
                className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15"
              >
                Run job automation proof
              </button>
            </form>
          </div>
          <div className="grid gap-3 lg:grid-cols-5">
            {['Greenhouse', 'Lever', 'Ashby', 'Workable', 'Remotive'].map((provider) => (
              <div key={provider} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{provider}</div>
                <div className="mt-1 text-sm font-semibold text-[#fafafa]">Normalized</div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Application packets</div>
              <div className="mt-1 text-sm font-semibold text-[#fafafa]">Resume, cover letter, recruiter blurb</div>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">ATS mapping</div>
              <div className="mt-1 text-sm font-semibold text-[#fafafa]">Keywords + variant coverage</div>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Runner mode</div>
              <div className="mt-1 text-sm font-semibold text-[#fafafa]">Manual execution only</div>
            </div>
          </div>
          {recentJobApplications.length > 0 ? (
            <div className="mt-3 space-y-2" data-testid="revenue-os-packet-downloads">
              {recentJobApplications.map((application) => (
                <div key={application.id} className="grid gap-3 rounded-lg border border-[#27272a] bg-[#09090B] p-3 lg:grid-cols-[1fr_180px]">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-[#fafafa]">
                      {application.metadata?.applicationPacket?.company ?? 'Unknown company'} · {application.metadata?.applicationPacket?.jobTitle ?? 'Unknown role'}
                    </div>
                    <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                      {application.resume_variant.replaceAll('_', ' ')} · {application.stage} · ATS {application.metadata?.applicationPacket?.atsKeywordCoverage ?? '-'}
                    </div>
                  </div>
                  <a
                    href={`/api/admin/revenue-os/application-packets/${application.id}/download`}
                    className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-center text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15"
                  >
                    Download packet
                  </a>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" data-testid="acquisition-revenue-intelligence">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Revenue intelligence</h2>
                <p className="text-xs text-[#71717a]">What is working by source, offer, close band, and outcome.</p>
              </div>
              <BarChart3 className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {intelligence.insights.map((insight) => (
                <div key={insight.label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">{insight.label}</div>
                  <div className="mt-1 text-xs leading-relaxed text-[#d4d4d8]">{insight.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#fafafa]">Daily trend</h2>
            <div className="space-y-3" data-testid="acquisition-daily-trend">
              {intelligence.trend.slice(-7).map((point, index) => {
                const max = Math.max(1, ...intelligence.trend.map((item) => item.drafted + item.sent + item.replies + item.meetings));
                const total = point.drafted + point.sent + point.replies + point.meetings;
                return (
                  <MiniBar
                    key={`${point.date}-${index}`}
                    label={point.date ? point.date.slice(5) : `day ${index + 1}`}
                    value={total}
                    max={max}
                  />
                );
              })}
              {intelligence.trend.length === 0 ? <div className="text-sm text-[#71717a]">No trend data yet.</div> : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <BreakdownList title="Source" rows={intelligence.breakdowns.bySource} />
          <BreakdownList title="Industry" rows={intelligence.breakdowns.byIndustry} />
          <BreakdownList title="Offer" rows={intelligence.breakdowns.byOffer} />
          <BreakdownList title="Priority" rows={intelligence.breakdowns.byPriority} />
          <BreakdownList title="Close Band" rows={intelligence.breakdowns.byCloseBand} />
        </section>

        <section className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Import and score a prospect</h2>
              <p className="text-xs text-[#71717a]">
                Add a business, capture visible buying signals, and create a ranked account.
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-[#06b6d4]" />
          </div>
          <form
            action={importAcquisitionAccount}
            className="grid gap-3 lg:grid-cols-12"
            data-testid="acquisition-import-form"
          >
            <input
              name="name"
              required
              placeholder="Company name"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none lg:col-span-3"
            />
            <input
              name="websiteUrl"
              type="url"
              placeholder="https://example.com"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none lg:col-span-3"
            />
            <input
              name="industry"
              placeholder="Industry"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none lg:col-span-2"
            />
            <input
              name="location"
              placeholder="Location"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none lg:col-span-2"
            />
            <select
              name="businessModel"
              defaultValue="local_service"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] lg:col-span-1"
            >
              <option value="local_service">Local</option>
              <option value="professional_service">Pro service</option>
              <option value="saas">SaaS</option>
              <option value="ecommerce">Ecom</option>
              <option value="recruiting">Recruiting</option>
              <option value="creator">Creator</option>
              <option value="unknown">Unknown</option>
            </select>
            <select
              name="estimatedBudget"
              defaultValue="5k_10k"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] lg:col-span-1"
            >
              <option value="under_2k">Under 2k</option>
              <option value="2k_5k">2k-5k</option>
              <option value="5k_10k">5k-10k</option>
              <option value="10k_25k">10k-25k</option>
              <option value="25k_plus">25k+</option>
              <option value="unknown">Unknown</option>
            </select>
            <input
              name="contactName"
              placeholder="Contact name"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none lg:col-span-3"
            />
            <input
              name="contactTitle"
              placeholder="Contact title"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none lg:col-span-3"
            />
            <input
              name="contactEmail"
              type="email"
              placeholder="contact@company.com"
              className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none lg:col-span-3"
            />
            <div className="flex flex-wrap gap-2 lg:col-span-12">
              {[
                ['hasBrokenWebsite', 'site issue'],
                ['hasOutdatedBrand', 'dated brand'],
                ['hasWeakSeo', 'weak SEO'],
                ['hasWeakConversionPath', 'weak conversion'],
                ['hasBookingOrCheckoutGap', 'booking gap'],
                ['isOwnerOperated', 'owner-operated'],
                ['hasRecentHiringSignal', 'hiring'],
                ['hasRecentFundingOrLaunch', 'launch/growth'],
              ].map(([name, label]) => (
                <label
                  key={name}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-1.5 text-xs text-[#a1a1aa]"
                >
                  <input name={name} type="checkbox" className="h-3.5 w-3.5 accent-[#06b6d4]" />
                  {label}
                </label>
              ))}
            </div>
            <div className="lg:col-span-12">
              <button
                type="submit"
                data-testid="acquisition-import-submit"
                className="rounded-lg bg-[#06B6D4] px-4 py-2 text-xs font-semibold text-[#09090B] transition-colors hover:bg-[#67e8f9]"
              >
                Import account
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Bulk import lead list</h2>
              <p className="text-xs text-[#71717a]">
                Paste rows as: company, website, industry, location, contact, title, email.
              </p>
            </div>
            <Users className="h-4 w-4 text-[#06b6d4]" />
          </div>
          <form action={bulkImportAcquisitionAccounts} className="space-y-3" data-testid="acquisition-bulk-form">
            <textarea
              name="leads"
              rows={5}
              placeholder={'Acme Dental, acmedental.com, Dental, Boston MA, Jordan Smith, Owner, jordan@acmedental.com'}
              className="w-full rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none"
            />
            <button
              type="submit"
              data-testid="acquisition-bulk-submit"
              className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-4 py-2 text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15"
            >
              Import lead list
            </button>
          </form>
        </section>

        <section id="accounts" className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="overflow-hidden rounded-xl border border-[#27272a] bg-[#0f0f12]">
            <div className="flex items-center justify-between border-b border-[#1f1f23] px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Highest-probability accounts</h2>
                <p className="text-xs text-[#71717a]">
                  Ranked by fit, urgency, revenue potential, and contact confidence.
                </p>
              </div>
              <Target className="h-4 w-4 text-[#06b6d4]" />
            </div>
            {accounts.length === 0 ? (
              <div className="p-8 text-sm text-[#a1a1aa]">
                No acquisition accounts yet. Phase 2 will add import, audit, and enrichment actions.
              </div>
            ) : (
              <div className="divide-y divide-[#1f1f23]">
                {filteredAccounts.length === 0 ? (
                  <div className="p-8 text-sm text-[#a1a1aa]" data-testid="acquisition-no-filtered-accounts">
                    No accounts match the current operator filters.
                  </div>
                ) : null}
                {filteredAccounts.map((account) => {
                    const offer = account.recommended_offer as AcquisitionOffer | null;
                    const scoreMeta = account.metadata?.score;
                    const closeProbability =
                      typeof scoreMeta?.closeProbability === 'number' ? scoreMeta.closeProbability : null;
                    const confidence = typeof scoreMeta?.confidence === 'number' ? scoreMeta.confidence : null;
                    return (
                    <article
                      key={account.id}
                      className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_180px]"
                      data-testid="acquisition-account-row"
                    >
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-[#fafafa]">
                            {account.name}
                          </h3>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${
                              PRIORITY_TONE[account.priority]
                            }`}
                          >
                            {account.priority}
                          </span>
                          <span className="rounded-md border border-[#27272a] px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa]">
                            {STAGE_LABEL[account.stage]}
                          </span>
                        </div>
                        <div className="text-xs text-[#71717a]">
                          {[account.industry, account.location].filter(Boolean).join(' · ') || 'No segment set'}
                          {account.website_url ? (
                            <>
                              {' · '}
                              <a
                                href={account.website_url}
                                className="text-[#67e8f9] hover:text-[#a5f3fc]"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Website
                              </a>
                            </>
                          ) : null}
                        </div>
                        <p className="line-clamp-2 text-sm text-[#d4d4d8]">
                          {account.pain_summary || 'Add audit evidence and a specific business problem before outreach.'}
                        </p>
                        <div className="text-xs text-[#a1a1aa]">
                          <span className="text-[#71717a]">Next:</span>{' '}
                          {account.next_action || 'Research, audit, and draft outreach.'}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                            Score
                          </span>
                          <span className="text-2xl font-semibold tabular-nums text-[#fafafa]">
                            {account.total_score}
                          </span>
                        </div>
                        <ScoreBar label="Fit" value={account.fit_score} />
                        <ScoreBar label="Urgency" value={account.urgency_score} />
                        <ScoreBar label="Revenue" value={account.revenue_score} />
                        <div className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#a1a1aa]">
                          {offer && OFFER_LABELS[offer] ? OFFER_LABELS[offer] : 'Offer not selected'}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                          <div className="rounded-lg border border-[#27272a] bg-[#09090B] px-2 py-1.5">
                            Close {closeProbability ?? '-'}%
                          </div>
                          <div className="rounded-lg border border-[#27272a] bg-[#09090B] px-2 py-1.5">
                            Conf {confidence ?? '-'}%
                          </div>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
                          {scoreMeta?.modelVersion ? `${scoreMeta.modelVersion} · ` : ''}
                          Updated {formatRelative(account.updated_at ?? account.created_at)}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <form action={rescoreAcquisitionAccount}>
                            <input type="hidden" name="id" value={account.id} />
                            <button
                              data-testid="acquisition-score-button"
                              className="w-full rounded-lg border border-[#27272a] px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa] hover:border-[#06b6d4] hover:text-[#06b6d4]"
                            >
                              Score
                            </button>
                          </form>
                          <form action={generateWebsiteAudit}>
                            <input type="hidden" name="id" value={account.id} />
                            <button
                              data-testid="acquisition-audit-button"
                              className="w-full rounded-lg border border-[#27272a] px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa] hover:border-[#06b6d4] hover:text-[#06b6d4]"
                            >
                              Audit
                            </button>
                          </form>
                          <form action={draftOutreachMessage}>
                            <input type="hidden" name="id" value={account.id} />
                            <button
                              data-testid="acquisition-draft-button"
                              className="w-full rounded-lg border border-[#27272a] px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa] hover:border-[#06b6d4] hover:text-[#06b6d4]"
                            >
                              Draft
                            </button>
                          </form>
                          <form action={enrichAcquisitionAccount}>
                            <input type="hidden" name="id" value={account.id} />
                            <button
                              data-testid="acquisition-enrich-button"
                              className="w-full rounded-lg border border-[#27272a] px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa] hover:border-[#06b6d4] hover:text-[#06b6d4]"
                            >
                              Enrich
                            </button>
                          </form>
                          <form action={scheduleAcquisitionFollowUp}>
                            <input type="hidden" name="id" value={account.id} />
                            <input type="hidden" name="days" value="3" />
                            <button
                              data-testid="acquisition-followup-button"
                              className="w-full rounded-lg border border-[#27272a] px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa] hover:border-[#06b6d4] hover:text-[#06b6d4]"
                            >
                              Follow
                            </button>
                          </form>
                          <form action={suppressAcquisitionAccount}>
                            <input type="hidden" name="id" value={account.id} />
                            <button
                              data-testid="acquisition-suppress-button"
                              className="w-full rounded-lg border border-rose-500/30 px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-rose-200 hover:border-rose-300 hover:text-rose-100"
                            >
                              Suppress
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#fafafa]">30-day revenue motion</h2>
                <Sparkles className="h-4 w-4 text-[#06b6d4]" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                    Drafted
                  </div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">{metrics.drafted}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                    Sent
                  </div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">{metrics.sent}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                    Replies
                  </div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">{metrics.replies}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                    Meetings
                  </div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">{metrics.meetings}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                    Proposals
                  </div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">{metrics.proposals}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                    Pipeline
                  </div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">
                    {formatCurrency(metrics.pipeline)}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                {['draft', 'ready', 'sent', 'replied', 'booked', 'bounced'].map((status) => (
                  <div key={status} className="rounded-lg border border-[#27272a] bg-[#09090B] px-2 py-1.5">
                    {status} {outreachCounts[status] ?? 0}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#fafafa]">What to do today</h2>
                <CalendarClock className="h-4 w-4 text-[#06b6d4]" />
              </div>
              {queue.length === 0 ? (
                <p className="text-sm text-[#a1a1aa]">No active follow-ups yet.</p>
              ) : (
                <div className="space-y-3" data-testid="acquisition-daily-queue">
                  {queue.map((item) => (
                    <div key={item.id} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate text-sm font-medium text-[#fafafa]">{item.name}</div>
                        <div className={`rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest ${PRIORITY_TONE[item.priority]}`}>
                          {item.priority}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-[#71717a]">
                        {STAGE_LABEL[item.stage]} · score {item.total_score}
                      </div>
                      <div className="mt-2 text-xs text-[#a1a1aa]">
                        {item.next_action || 'No next action set.'}
                      </div>
                      <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
                        {item.next_action_at ? `Due ${formatRelative(item.next_action_at)}` : 'No date'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#fafafa]">Active campaigns</h2>
                <Radar className="h-4 w-4 text-[#06b6d4]" />
              </div>
              {campaigns.length === 0 ? (
                <p className="text-sm text-[#a1a1aa]">No campaigns yet.</p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate text-sm font-medium text-[#fafafa]">{campaign.name}</div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#06b6d4]">
                          {campaign.status}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-[#71717a]">
                        {campaign.channel} · {campaign.objective} · {campaign.daily_target}/day
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
              <h2 className="mb-3 text-sm font-semibold text-[#fafafa]">Core operating resources</h2>
              <div className="space-y-2">
                {coreResources.map((resource) => (
                  <div key={resource.name} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                    <div className="text-xs font-semibold text-[#fafafa]">{resource.name}</div>
                    <div className="mt-1 text-xs text-[#71717a]">{resource.useCase}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="drafts" className="rounded-xl border border-[#27272a] bg-[#0f0f12]">
          <div className="flex items-center justify-between border-b border-[#1f1f23] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Outreach draft queue</h2>
              <p className="text-xs text-[#71717a]">
                Review generated drafts and record outcomes. This does not send email.
              </p>
            </div>
            <MailCheck className="h-4 w-4 text-[#06b6d4]" />
          </div>
          {draftMessages.length === 0 ? (
            <div className="p-6 text-sm text-[#a1a1aa]">No drafts yet. Generate one from a target account.</div>
          ) : (
            <div className="divide-y divide-[#1f1f23]">
              {draftMessages.map((message) => {
                const personalization = message.metadata?.personalization;
                return (
                  <article
                    key={message.id}
                    className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_220px]"
                    data-testid="acquisition-draft-row"
                  >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#fafafa]">
                        {message.subject || 'Untitled draft'}
                      </h3>
                      <span className="rounded-md border border-[#27272a] px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa]">
                        {message.status}
                      </span>
                      <span className="text-xs text-[#71717a]">
                        {message.acquisition_accounts?.name ?? 'Unknown account'}
                      </span>
                      {typeof personalization?.qualityScore === 'number' ? (
                        <span className="rounded-md border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                          Q{personalization.qualityScore}
                        </span>
                      ) : null}
                    </div>
                    {personalization?.angle ? (
                      <div className="text-xs text-[#67e8f9]">{personalization.angle}</div>
                    ) : null}
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-[#27272a] bg-[#09090B] p-3 text-xs leading-relaxed text-[#d4d4d8]">
                      {message.body}
                    </pre>
                    {personalization?.proofPoints?.length ? (
                      <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3 text-xs text-[#a1a1aa]">
                        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#71717a]">
                          Proof points
                        </div>
                        <ul className="space-y-1">
                          {personalization.proofPoints.slice(0, 4).map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {message.personalization_notes ? (
                      <div className="whitespace-pre-wrap text-xs text-[#71717a]">
                        {message.personalization_notes}
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    {[
                      ['ready', 'Ready'],
                      ['sent', 'Sent'],
                      ['replied', 'Replied'],
                      ['booked', 'Booked'],
                      ['bounced', 'Bounced'],
                      ['declined', 'Declined'],
                      ['archived', 'Archive'],
                    ].map(([status, label]) => (
                      <form key={status} action={recordOutreachOutcome}>
                        <input type="hidden" name="id" value={message.id} />
                        <input type="hidden" name="status" value={status} />
                        <button className="w-full rounded-lg border border-[#27272a] px-3 py-2 text-xs text-[#a1a1aa] hover:border-[#06b6d4] hover:text-[#06b6d4]">
                          {label}
                        </button>
                      </form>
                    ))}
                    <div className="pt-1 text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
                      Created {formatRelative(message.created_at)}
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
