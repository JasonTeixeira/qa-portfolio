import { AdminTopbar } from '@/components/admin/topbar';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { formatCurrency, formatRelative } from '@/lib/utils';
import { updateLeadDisposition } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Leads' };

const STATUSES = ['new', 'reviewed', 'qualified', 'nurture', 'won', 'lost', 'spam'] as const;
type LeadStatus = (typeof STATUSES)[number];

const SOURCE_TONE: Record<string, string> = {
  contact: 'border-[#3D5AFE]/35 bg-[#3D5AFE]/10 text-[#9daeff]',
  newsletter: 'border-[#7C3AED]/35 bg-[#7C3AED]/10 text-[#c4a8ff]',
  seo_audit: 'border-[#FF2D9B]/35 bg-[#FF2D9B]/10 text-[#ff9ad0]',
  checkout: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
};

const STATUS_TONE: Record<LeadStatus, string> = {
  new: 'border-[#3D5AFE]/35 text-[#9daeff]',
  reviewed: 'border-[#8A8A94]/35 text-[#c7c7cf]',
  qualified: 'border-emerald-400/35 text-emerald-200',
  nurture: 'border-[#7C3AED]/35 text-[#c4a8ff]',
  won: 'border-cyan-300/35 text-cyan-100',
  lost: 'border-rose-400/35 text-rose-200',
  spam: 'border-zinc-600 text-zinc-400',
};

type LeadRow = {
  id: string;
  created_at: string;
  source: string;
  email: string | null;
  name: string | null;
  detail: string;
  inquiry_type: string | null;
  budget: string | null;
  amount_cents: number | null;
  metadata: Record<string, unknown>;
  status: LeadStatus | null;
  score: number | null;
  owner_notes: string | null;
};

function metadataScore(metadata: Record<string, unknown>) {
  const value = metadata.lead_score;
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function scoreTone(score: number) {
  if (score >= 80) return 'text-emerald-200';
  if (score >= 50) return 'text-[#9daeff]';
  if (score >= 25) return 'text-amber-200';
  return 'text-[var(--sage-ink-faint)]';
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = STATUSES.includes(params.status as LeadStatus) ? (params.status as LeadStatus) : undefined;
  const source = (params.source ?? '').trim();
  const q = (params.q ?? '').trim();

  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  let query = sb
    .from('leads')
    .select('id, created_at, source, email, name, detail, inquiry_type, budget, amount_cents, metadata, status, score, owner_notes')
    .order('created_at', { ascending: false })
    .limit(250);

  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);
  if (q) query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%,detail.ilike.%${q}%`);

  const { data, error } = await query;
  const leads = ((data ?? []) as LeadRow[]).map((lead) => ({
    ...lead,
    effectiveScore: lead.score && lead.score > 0 ? lead.score : metadataScore(lead.metadata ?? {}),
  }));

  const sources = [...new Set(leads.map((lead) => lead.source))].sort();

  return (
    <>
      <AdminTopbar crumbs={[{ label: 'Leads' }]} email={profile.email} fullName={profile.full_name} />
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8da0ff]">
              Program E · proof and close
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#fafafa]">Leads inbox</h1>
            <p className="mt-1 text-sm text-[#a1a1aa]">
              Review conversion events, route-finder diagnostics, audit requests, checkout leads, and newsletter signups.
            </p>
          </div>
          <form className="flex flex-wrap items-center gap-2" action="/admin/leads">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search leads..."
              className="rounded-lg border border-[#27272a] bg-[#0f0f12] px-3 py-1.5 text-xs text-[#fafafa] placeholder:text-[#52525b] focus:border-[#3D5AFE]/70 focus:outline-none"
            />
            <select
              name="status"
              defaultValue={status ?? ''}
              className="rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-xs text-[#fafafa]"
            >
              <option value="">All statuses</option>
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              name="source"
              defaultValue={source}
              className="rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-1.5 text-xs text-[#fafafa]"
            >
              <option value="">All sources</option>
              {sources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-[#27272a] px-3 py-1.5 text-xs text-[#a1a1aa] hover:border-[#3D5AFE] hover:text-[#9daeff]"
            >
              Filter
            </button>
          </form>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-100">
            Unable to load leads: {error.message}
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-10 text-center text-sm text-[#a1a1aa]">
            No leads match this view.
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <article key={lead.id} className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
                <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                          SOURCE_TONE[lead.source] ?? 'border-[#52525b]/40 text-[#a1a1aa]'
                        }`}
                      >
                        {lead.source}
                      </span>
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                          STATUS_TONE[lead.status ?? 'new']
                        }`}
                      >
                        {lead.status ?? 'new'}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#71717a]">
                        {formatRelative(lead.created_at)}
                      </span>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-[#fafafa]">
                      {lead.name || lead.email || 'Unnamed lead'}
                    </h2>
                    <p className="mt-1 text-sm text-[#a1a1aa]">{lead.email ?? 'No email captured'}</p>
                    {lead.detail ? (
                      <p className="mt-4 max-w-3xl text-sm leading-6 text-[#d4d4d8]">{lead.detail}</p>
                    ) : null}
                    <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-widest text-[#52525b]">Inquiry</dt>
                        <dd className="mt-1 text-sm text-[#fafafa]">{lead.inquiry_type ?? '-'}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-widest text-[#52525b]">Budget</dt>
                        <dd className="mt-1 text-sm text-[#fafafa]">{lead.budget ?? '-'}</dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] uppercase tracking-widest text-[#52525b]">Amount</dt>
                        <dd className="mt-1 text-sm text-[#fafafa]">
                          {lead.amount_cents ? formatCurrency(lead.amount_cents / 100) : '-'}
                        </dd>
                      </div>
                    </dl>
                    <details className="mt-5">
                      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-widest text-[#8da0ff]">
                        Metadata
                      </summary>
                      <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-[#27272a] bg-[#09090b] p-4 text-xs leading-6 text-[#a1a1aa]">
                        {JSON.stringify(lead.metadata ?? {}, null, 2)}
                      </pre>
                    </details>
                  </div>

                  <form action={updateLeadDisposition} className="rounded-lg border border-[#27272a] bg-[#09090b] p-4">
                    <input type="hidden" name="id" value={lead.id} />
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[#52525b]">Lead score</p>
                        <p className={`mt-2 text-4xl font-semibold tabular-nums ${scoreTone(lead.effectiveScore)}`}>
                          {lead.effectiveScore}
                        </p>
                      </div>
                      <label className="min-w-32">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#52525b]">Status</span>
                        <select
                          name="status"
                          defaultValue={lead.status ?? 'new'}
                          className="mt-2 w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-2.5 py-2 text-xs text-[#fafafa]"
                        >
                          {STATUSES.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="mt-4 block">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#52525b]">Owner notes</span>
                      <textarea
                        name="owner_notes"
                        defaultValue={lead.owner_notes ?? ''}
                        rows={4}
                        className="mt-2 w-full rounded-lg border border-[#27272a] bg-[#0f0f12] px-3 py-2 text-xs leading-5 text-[#fafafa] placeholder:text-[#52525b]"
                        placeholder="Next action, context, or disqualification reason"
                      />
                    </label>
                    <button
                      type="submit"
                      className="mt-4 w-full rounded-lg bg-[#3D5AFE] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5670ff]"
                    >
                      Save lead
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
