import {
  BarChart3,
  CheckCircle2,
  Compass,
  Gauge,
  Link2,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import { AdminTopbar } from '@/components/admin/topbar';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { buildTrafficOsRun, TRAFFIC_PROGRAMS } from '@/lib/traffic-os/core';
import { activateTrafficToRevenuePipeline, runTrafficOsProof } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Traffic OS' };

type TrafficAuditRow = {
  score: number;
  grade: string;
  program_count: number;
  gaps: string[] | null;
  created_at: string;
};

type TrafficReportRow = {
  visits: number;
  conversions: number;
  conversion_rate: number | string;
  weighted_pipeline_usd: number;
  discord_joins: number;
  best_channel: string | null;
  weakest_channel: string | null;
  created_at: string;
};

async function countTable(table: string) {
  const sb = supabaseAdmin();
  const { count } = await sb.from(table).select('id', { count: 'exact', head: true });
  return count ?? 0;
}

async function getTrafficData() {
  const sb = supabaseAdmin();
  const run = buildTrafficOsRun();
  const [
    latestAudit,
    latestReport,
    sourceCount,
    campaignCount,
    assetCount,
    eventCount,
    conversionCount,
    discordInviteCount,
    liveProofCount,
    launchCount,
    feedCount,
  ] = await Promise.all([
    sb
      .from('traffic_readiness_audits')
      .select('score, grade, program_count, gaps, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from('traffic_weekly_reports')
      .select('visits, conversions, conversion_rate, weighted_pipeline_usd, discord_joins, best_channel, weakest_channel, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    countTable('traffic_sources'),
    countTable('traffic_campaigns'),
    countTable('traffic_content_assets'),
    countTable('traffic_events'),
    countTable('traffic_conversions'),
    countTable('traffic_discord_invites'),
    countTable('traffic_live_analytics_proofs'),
    countTable('traffic_campaign_launches'),
    countTable('traffic_revenue_feed_events'),
  ]);
  return {
    run,
    latestAudit: latestAudit.data as TrafficAuditRow | null,
    latestReport: latestReport.data as TrafficReportRow | null,
    counts: { sourceCount, campaignCount, assetCount, eventCount, conversionCount, discordInviteCount, liveProofCount, launchCount, feedCount },
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

export default async function TrafficPage() {
  const actor = await requireAdmin();
  const { run, latestAudit, latestReport, counts } = await getTrafficData();
  const score = latestAudit?.score ?? run.readiness.score;
  const report = latestReport ?? {
    visits: run.analytics.visits,
    conversions: run.analytics.conversions,
    conversion_rate: run.analytics.conversionRate,
    weighted_pipeline_usd: run.analytics.weightedPipelineUsd,
    discord_joins: run.analytics.discordJoins,
    best_channel: run.analytics.bestChannel,
    weakest_channel: run.analytics.weakestChannel,
    created_at: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#fafafa]">
      <AdminTopbar email={actor.profile.email} fullName={actor.profile.full_name} crumbs={[{ label: 'Traffic OS' }]} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6" data-testid="traffic-os-dashboard">
        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="traffic-os-command-center">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#67e8f9]">
                  <Megaphone className="h-4 w-4" />
                  top-of-funnel engine
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#fafafa]">Traffic Operating System</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a1a1aa]">
                  Drives qualified visits, tool users, Discord joins, subscribers, and client demand into Revenue OS.
                </p>
              </div>
              <form action={runTrafficOsProof} className="flex min-w-[260px] flex-col gap-2" data-testid="traffic-os-proof-form">
                <input
                  name="runKey"
                  aria-label="Traffic OS proof run key"
                  defaultValue={`traffic-proof-${Date.now()}`}
                  className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]"
                />
                <button
                  type="submit"
                  data-testid="traffic-os-run-proof"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#67e8f9]/40 bg-[#67e8f9]/10 px-3 py-2 text-xs font-semibold text-[#cffafe] hover:bg-[#67e8f9]/15"
                >
                  <Sparkles className="h-4 w-4" />
                  Run 32-program proof
                </button>
              </form>
              <form action={activateTrafficToRevenuePipeline} className="flex min-w-[260px] flex-col gap-2" data-testid="traffic-os-activation-form">
                <input
                  name="runKey"
                  aria-label="Traffic OS activation run key"
                  defaultValue={`traffic-activation-${Date.now()}`}
                  className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]"
                />
                <button
                  type="submit"
                  data-testid="traffic-os-activate-pipeline"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/15"
                >
                  <Sparkles className="h-4 w-4" />
                  Activate traffic → revenue
                </button>
              </form>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Traffic score" value={`${score}/100`} detail={(latestAudit?.grade ?? run.readiness.grade).replaceAll('_', ' ')} />
              <Metric label="Visits" value={Number(report.visits).toLocaleString()} detail={`${report.conversions} conversions`} />
              <Metric label="Pipeline value" value={`$${Number(report.weighted_pipeline_usd).toLocaleString()}`} detail={`${report.conversion_rate}% conversion rate`} />
              <Metric label="Discord joins" value={report.discord_joins} detail={`best channel: ${report.best_channel}`} />
            </div>
          </div>

          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="traffic-os-proof">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#fafafa]">Proof records</h2>
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {[
                ['Sources', counts.sourceCount],
                ['Campaigns', counts.campaignCount],
                ['Assets', counts.assetCount],
                ['Events', counts.eventCount],
                ['Conversions', counts.conversionCount],
                ['Invites', counts.discordInviteCount],
                ['Live proofs', counts.liveProofCount],
                ['Launches', counts.launchCount],
                ['Revenue feed', counts.feedCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase text-[#71717a]">{label}</div>
                  <div className="mt-1 text-lg font-semibold text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="traffic-os-live-activation">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
            <Gauge className="h-4 w-4 text-emerald-300" />
            Live activation loop
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase text-[#71717a]">Analytics connectors</div>
              <div className="mt-1 text-lg font-semibold text-[#fafafa]">{counts.liveProofCount}</div>
              <div className="mt-1 text-xs text-[#a1a1aa]">GA4, GSC, Discord, PostHog proof rows</div>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase text-[#71717a]">Campaign launches</div>
              <div className="mt-1 text-lg font-semibold text-[#fafafa]">{counts.launchCount}</div>
              <div className="mt-1 text-xs text-[#a1a1aa]">Manual-review launch records</div>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
              <div className="text-[10px] font-mono uppercase text-[#71717a]">Revenue OS feed</div>
              <div className="mt-1 text-lg font-semibold text-[#fafafa]">{counts.feedCount}</div>
              <div className="mt-1 text-xs text-[#a1a1aa]">Traffic-qualified acquisition accounts</div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]" data-testid="traffic-os-actions">
          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <Target className="h-4 w-4 text-[#67e8f9]" />
              Next-best traffic actions
            </div>
            <div className="space-y-3">
              {run.actions.map((action) => (
                <div key={action.rank} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-[#fafafa]">#{action.rank} {action.channel}</div>
                    <span className="rounded-md border border-[#3f3f46] px-2 py-1 text-[10px] font-mono uppercase text-[#a1a1aa]">{action.urgency}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#d4d4d8]">{action.action}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#71717a]">{action.expectedImpact}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="traffic-os-campaigns">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <Compass className="h-4 w-4 text-[#67e8f9]" />
              Campaign engine
            </div>
            <div className="grid gap-3">
              {run.campaigns.map((campaign) => (
                <div key={campaign.key} className="grid gap-3 rounded-lg border border-[#27272a] bg-[#09090B] p-3 md:grid-cols-[1fr_160px]">
                  <div>
                    <div className="text-xs font-semibold text-[#fafafa]">{campaign.name}</div>
                    <div className="mt-1 text-[11px] font-mono uppercase text-[#71717a]">{campaign.primaryChannel} · {campaign.intent}</div>
                    <div className="mt-2 text-xs text-[#a1a1aa]">{campaign.landingPage}?utm_campaign={campaign.utmCampaign}</div>
                  </div>
                  <div className="text-right text-xs text-[#d4d4d8]">
                    <div>{campaign.targetVisits.toLocaleString()} visits</div>
                    <div>{campaign.targetConversions.toLocaleString()} conversions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="traffic-os-content-engine">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <Search className="h-4 w-4 text-[#67e8f9]" />
              SEO + content engine
            </div>
            <div className="space-y-3">
              {run.keywords.map((keyword) => (
                <div key={keyword.keyword} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{keyword.keyword}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase text-[#71717a]">{keyword.monthlySearches} searches · value {keyword.businessValue}</div>
                  <div className="mt-2 text-xs text-[#a1a1aa]">{keyword.targetUrl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="traffic-os-distribution">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <MousePointerClick className="h-4 w-4 text-[#67e8f9]" />
              Distribution queue
            </div>
            <div className="space-y-3">
              {run.distributionPosts.slice(0, 5).map((post) => (
                <div key={`${post.assetKey}-${post.channel}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{post.channel}</div>
                  <div className="mt-1 text-xs text-[#d4d4d8]">{post.postAngle}</div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-mono uppercase text-[#71717a]">
                    <Link2 className="h-3 w-3" />
                    {post.expectedClicks} expected clicks
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="traffic-os-discord">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
              <MessageCircle className="h-4 w-4 text-[#67e8f9]" />
              Discord growth
            </div>
            <div className="space-y-3">
              {run.discordInvites.map((invite) => (
                <div key={invite.inviteCode} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{invite.serverKey}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase text-[#71717a]">{invite.inviteCode}</div>
                  <div className="mt-2 text-xs text-[#d4d4d8]">{invite.joins} joins · {invite.activated} activated · {invite.retained7d} retained</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="traffic-os-analytics">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
            <BarChart3 className="h-4 w-4 text-[#67e8f9]" />
            Traffic intelligence
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Best channel', report.best_channel ?? run.analytics.bestChannel],
              ['Weakest channel', report.weakest_channel ?? run.analytics.weakestChannel],
              ['Assets', run.assets.length],
              ['Programs', latestAudit?.program_count ?? TRAFFIC_PROGRAMS.length],
              ['Load', run.loadProof.status],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase text-[#71717a]">{label}</div>
                <div className="mt-1 text-sm font-semibold text-[#fafafa]">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#27272a] bg-[#101012] p-5" data-testid="traffic-os-programs">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#fafafa]">
            <Gauge className="h-4 w-4 text-emerald-300" />
            32-program traffic map
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {TRAFFIC_PROGRAMS.map(([id, label]) => (
              <div key={id} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="text-[10px] font-mono uppercase text-[#67e8f9]">Program {id}</div>
                <div className="mt-2 text-xs font-medium leading-5 text-[#fafafa]">{label}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
