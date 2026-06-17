import Link from 'next/link';
import {
  BarChart3,
  Building2,
  CalendarClock,
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
import { LEAD_GENERATION_RESOURCES, OFFER_LABELS } from '@/lib/acquisition/resources';
import type { AcquisitionOffer, AcquisitionPriority, AcquisitionStage } from '@/lib/acquisition/types';
import {
  draftOutreachMessage,
  enrichAcquisitionAccount,
  generateWebsiteAudit,
  bulkImportAcquisitionAccounts,
  importAcquisitionAccount,
  recordOutreachOutcome,
  rescoreAcquisitionAccount,
  scheduleAcquisitionFollowUp,
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
  created_at: string;
  acquisition_accounts: { name: string } | null;
};

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

export default async function AdminAcquisitionPage() {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  const [accountsRes, campaignsRes, metricsRes, contactsRes, outreachRes, auditsRes, draftMessagesRes, queueRes] =
    await Promise.all([
      sb
        .from('acquisition_accounts')
        .select(
          'id, name, website_url, industry, location, stage, priority, total_score, fit_score, urgency_score, revenue_score, recommended_offer, pain_summary, next_action, next_action_at, created_at, updated_at',
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
        .select('messages_drafted, messages_sent, replies, meetings_booked, proposals_created, deals_won, estimated_pipeline_value')
        .order('metric_date', { ascending: false })
        .limit(30),
      sb.from('acquisition_contacts').select('id', { count: 'exact', head: true }),
      sb
        .from('acquisition_outreach_messages')
        .select('id', { count: 'exact', head: true })
        .in('status', ['draft', 'ready', 'queued']),
      sb.from('acquisition_website_audits').select('id', { count: 'exact', head: true }),
      sb
        .from('acquisition_outreach_messages')
        .select('id, account_id, status, channel, subject, body, personalization_notes, created_at, acquisition_accounts(name)')
        .in('status', ['draft', 'ready', 'queued'])
        .order('created_at', { ascending: false })
        .limit(12),
      sb
        .from('acquisition_accounts')
        .select('id, name, stage, priority, next_action, next_action_at, total_score')
        .not('stage', 'in', '("won","lost","do_not_contact")')
        .order('next_action_at', { ascending: true, nullsFirst: false })
        .order('total_score', { ascending: false })
        .limit(10),
    ]);

  const accounts = (accountsRes.data ?? []) as AccountRow[];
  const campaigns = (campaignsRes.data ?? []) as CampaignRow[];
  const metricRows = (metricsRes.data ?? []) as MetricRow[];
  const draftMessages = (draftMessagesRes.data ?? []) as unknown as OutreachRow[];
  const queue = (queueRes.data ?? []) as QueueRow[];
  const metrics = metricRows.reduce(
    (acc, row) => ({
      drafted: acc.drafted + Number(row.messages_drafted ?? 0),
      sent: acc.sent + Number(row.messages_sent ?? 0),
      replies: acc.replies + Number(row.replies ?? 0),
      meetings: acc.meetings + Number(row.meetings_booked ?? 0),
      proposals: acc.proposals + Number(row.proposals_created ?? 0),
      won: acc.won + Number(row.deals_won ?? 0),
      pipeline: acc.pipeline + Number(row.estimated_pipeline_value ?? 0),
    }),
    { drafted: 0, sent: 0, replies: 0, meetings: 0, proposals: 0, won: 0, pipeline: 0 },
  );

  const urgentCount = accounts.filter((account) => account.priority === 'urgent').length;
  const qualifiedCount = accounts.filter((account) =>
    ['qualified', 'drafted', 'contacted', 'follow_up', 'meeting', 'proposal'].includes(account.stage),
  ).length;
  const replyRate = metrics.sent > 0 ? Math.round((metrics.replies / metrics.sent) * 100) : 0;
  const coreResources = LEAD_GENERATION_RESOURCES.filter((resource) => resource.priority === 'core');

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

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Target accounts"
            value={String(accounts.length)}
            hint={`${urgentCount} urgent`}
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
            hint={`${auditsRes.count ?? 0} audits stored`}
            icon={MailCheck}
          />
          <StatCard
            label="Reply rate"
            value={`${replyRate}%`}
            hint={`${metrics.replies} replies / ${metrics.sent} sent`}
            icon={BarChart3}
          />
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

        <section className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
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
                {accounts.map((account) => {
                  const offer = account.recommended_offer as AcquisitionOffer | null;
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
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
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
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#fafafa]">Daily operating queue</h2>
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

        <section className="rounded-xl border border-[#27272a] bg-[#0f0f12]">
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
              {draftMessages.map((message) => (
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
                    </div>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-[#27272a] bg-[#09090B] p-3 text-xs leading-relaxed text-[#d4d4d8]">
                      {message.body}
                    </pre>
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
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
