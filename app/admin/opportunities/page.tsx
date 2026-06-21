import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Gauge,
  Layers3,
  MailCheck,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { AdminTopbar } from '@/components/admin/topbar';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  OPPORTUNITY_PROGRAMS,
  adaptJobOpportunity,
  adaptRevenueOpportunity,
  buildOpportunityAnalytics,
  buildOpportunityOsRun,
  buildProofAssets,
  buildUnifiedDailyQueue,
} from '@/lib/opportunity-os/core';
import { runOpportunityOsUnifiedProof } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Opportunity OS' };

type JobApplicationRow = Parameters<typeof adaptJobOpportunity>[0];
type RevenueAccountRow = Parameters<typeof adaptRevenueOpportunity>[0];

type ReadinessRow = {
  score: number;
  grade: string;
  passed: string[] | null;
  gaps: string[] | null;
  program_count: number;
  created_at: string;
};

type LoadProofRow = {
  opportunities: number;
  actions: number;
  p95_dashboard_ms: number;
  p95_adapter_ms: number;
  status: string;
  created_at: string;
};

async function countTable(table: string) {
  const sb = supabaseAdmin();
  const { count } = await sb.from(table).select('id', { count: 'exact', head: true });
  return count ?? 0;
}

async function getOpportunityData() {
  const sb = supabaseAdmin();
  const [
    jobRows,
    revenueRows,
    latestAudit,
    latestLoad,
    unifiedCount,
    proofAssetCount,
    communicationCount,
    outcomeCount,
  ] = await Promise.all([
    sb
      .from('job_os_applications')
      .select('id, stage, priority_rank, next_action, next_action_at, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    sb
      .from('acquisition_accounts')
      .select('id, name, stage, total_score, revenue_score, next_action, next_action_at, recommended_offer, pain_summary, created_at')
      .order('updated_at', { ascending: false })
      .limit(8),
    sb
      .from('opportunity_readiness_audits')
      .select('score, grade, passed, gaps, program_count, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from('opportunity_load_proofs')
      .select('opportunities, actions, p95_dashboard_ms, p95_adapter_ms, status, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    countTable('opportunity_unified_items'),
    countTable('opportunity_proof_assets'),
    countTable('opportunity_communication_events'),
    countTable('opportunity_outcome_events'),
  ]);

  const opportunities = [
    ...((jobRows.data ?? []) as JobApplicationRow[]).map(adaptJobOpportunity),
    ...((revenueRows.data ?? []) as RevenueAccountRow[]).map(adaptRevenueOpportunity),
  ];
  const fallback = buildOpportunityOsRun();
  const unified = opportunities.length ? opportunities : fallback.opportunities;
  return {
    opportunities: unified,
    dailyQueue: buildUnifiedDailyQueue(unified),
    proofAssets: buildProofAssets(unified),
    analytics: buildOpportunityAnalytics(unified),
    readiness: latestAudit.data as ReadinessRow | null,
    loadProof: latestLoad.data as LoadProofRow | null,
    counts: {
      unified: unifiedCount,
      proofAssets: proofAssetCount,
      communications: communicationCount,
      outcomes: outcomeCount,
    },
  };
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-lg border border-[#27272a] bg-[#101012] p-4">
      <div className="text-[10px] font-mono uppercase text-[#71717a]">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-[#fafafa]">{value}</div>
      <div className="mt-1 text-xs text-[#a1a1aa]">{detail}</div>
    </div>
  );
}

export default async function OpportunitiesPage() {
  const actor = await requireAdmin();
  const data = await getOpportunityData();
  const readinessScore = data.readiness?.score ?? buildOpportunityOsRun().readiness.score;
  const readinessGrade = data.readiness?.grade ?? 'institutional_beta';

  return (
    <div className="min-h-screen bg-[#09090B] text-[#fafafa]">
      <AdminTopbar
        email={actor.profile.email}
        fullName={actor.profile.full_name}
        crumbs={[{ label: 'Opportunity OS' }]}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6" data-testid="opportunity-os-dashboard">
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="opportunity-os-command-center">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#67e8f9]">
                  <Radar className="h-4 w-4" />
                  unified cockpit
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#fafafa]">Opportunity Command Center</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a1a1aa]">
                  One operating surface for job applications, client leads, proof gaps, follow-ups, outcomes, and next-best actions.
                </p>
              </div>
              <form action={runOpportunityOsUnifiedProof} className="flex min-w-[260px] flex-col gap-2" data-testid="opportunity-os-proof-form">
                <input
                  name="runKey"
                  aria-label="Opportunity OS proof run key"
                  defaultValue={`opportunity-proof-${Date.now()}`}
                  className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]"
                />
                <button
                  type="submit"
                  data-testid="opportunity-os-run-proof"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#67e8f9]/40 bg-[#67e8f9]/10 px-3 py-2 text-xs font-semibold text-[#cffafe] hover:bg-[#67e8f9]/15"
                >
                  <Sparkles className="h-4 w-4" />
                  Run 24-program proof
                </button>
              </form>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Unified score" value={`${readinessScore}/100`} detail={readinessGrade.replaceAll('_', ' ')} />
              <Metric label="Pipeline value" value={`$${data.analytics.weightedPipelineUsd.toLocaleString()}`} detail="weighted by priority" />
              <Metric label="Daily actions" value={data.dailyQueue.length} detail={`${data.analytics.stale} stale follow-ups`} />
              <Metric label="Proof records" value={data.counts.unified} detail="materialized unified rows" />
            </div>
          </div>

          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="opportunity-os-readiness">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#fafafa]">Institutional proof</h2>
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {[
                ['Programs', data.readiness?.program_count ?? OPPORTUNITY_PROGRAMS.length],
                ['Proof assets', data.counts.proofAssets],
                ['Comms', data.counts.communications],
                ['Outcomes', data.counts.outcomes],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase text-[#71717a]">{label}</div>
                  <div className="mt-1 text-lg font-semibold text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase text-[#71717a]">Load proof</div>
              <div className="mt-2 text-sm text-[#fafafa]">
                {data.loadProof
                  ? `${data.loadProof.status} · ${data.loadProof.opportunities} opportunities · ${data.loadProof.p95_dashboard_ms}ms dashboard p95`
                  : 'No materialized load proof yet.'}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]" data-testid="opportunity-os-daily-queue">
          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <Target className="h-4 w-4 text-[#67e8f9]" />
              Unified daily queue
            </div>
            <div className="space-y-3">
              {data.dailyQueue.slice(0, 8).map((item) => (
                <div key={`${item.rank}-${item.opportunityId}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-[#fafafa]">#{item.rank} {item.source === 'job_os' ? 'Job' : 'Client'}</div>
                    <span className="rounded-md border border-[#3f3f46] px-2 py-1 text-[10px] font-mono uppercase text-[#a1a1aa]">{item.urgency}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#d4d4d8]">{item.action}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#71717a]">{item.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="opportunity-os-opportunities">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <Layers3 className="h-4 w-4 text-[#67e8f9]" />
              Unified opportunities
            </div>
            <div className="grid gap-3">
              {data.opportunities.slice(0, 10).map((item) => (
                <div key={item.id} className="grid gap-3 rounded-lg border border-[#27272a] bg-[#09090B] p-3 md:grid-cols-[1fr_120px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#fafafa]">{item.organization}</span>
                      <span className="rounded-md border border-[#3f3f46] px-2 py-0.5 text-[10px] font-mono uppercase text-[#a1a1aa]">{item.source}</span>
                      {item.stale ? <span className="rounded-md border border-amber-400/40 px-2 py-0.5 text-[10px] font-mono uppercase text-amber-200">stale</span> : null}
                    </div>
                    <div className="mt-1 text-xs text-[#d4d4d8]">{item.title}</div>
                    <div className="mt-2 text-[11px] text-[#71717a]">{item.nextAction}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-[#fafafa]">{item.priorityScore}</div>
                      <div className="text-[10px] font-mono uppercase text-[#71717a]">{item.stage}</div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[#71717a]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="opportunity-os-proof-engine">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <BriefcaseBusiness className="h-4 w-4 text-[#67e8f9]" />
              Cross-system proof engine
            </div>
            <div className="space-y-3">
              {data.proofAssets.map((asset) => (
                <div key={asset.title} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{asset.title}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase text-[#71717a]">{asset.assetType} · {asset.appliesTo} · {asset.priority}</div>
                  <div className="mt-2 text-xs text-[#a1a1aa]">{asset.gapCovered}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="opportunity-os-communication-loop">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <MailCheck className="h-4 w-4 text-[#67e8f9]" />
              Communication loop
            </div>
            <div className="space-y-3 text-xs text-[#d4d4d8]">
              <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">Gmail/reply normalization maps recruiter and client messages into one intent model.</div>
              <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">Manual-send approvals remain separate from sending for jobs and clients.</div>
              <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">Follow-up calendar is driven by the unified daily queue and stale detector.</div>
            </div>
          </div>

          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="opportunity-os-analytics">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <Gauge className="h-4 w-4 text-[#67e8f9]" />
              Unified analytics
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['Jobs', data.analytics.jobs],
                ['Clients', data.analytics.clients],
                ['Active', data.analytics.active],
                ['Won', data.analytics.won],
                ['Job conv.', `${data.analytics.jobConversionRate}%`],
                ['Client conv.', `${data.analytics.clientConversionRate}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase text-[#71717a]">{label}</div>
                  <div className="mt-1 text-lg font-semibold text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="opportunity-os-programs">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            24-program unification map
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {OPPORTUNITY_PROGRAMS.map(([id, label]) => (
              <div key={id} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#67e8f9]">
                  <Clock3 className="h-3 w-3" />
                  Program {id}
                </div>
                <div className="mt-2 text-xs font-medium leading-5 text-[#fafafa]">{label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
