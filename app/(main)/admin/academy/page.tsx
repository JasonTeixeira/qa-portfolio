import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/admin/topbar';
import { Badge } from '@/components/portal/ui/badge';
import { Card, CardContent } from '@/components/portal/ui/card';
import { academyTracks } from '@/data/academy/tracks';
import { academyProducts } from '@/data/academy/products';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Academy Commerce', robots: { index: false, follow: false } };

type EnrollmentStatus = 'active' | 'refunded' | 'revoked';
type Filter = 'all' | EnrollmentStatus;

type EnrollmentRow = {
  id: string;
  created_at: string;
  updated_at: string;
  track_slug: string;
  product_name: string;
  email: string;
  name: string | null;
  status: EnrollmentStatus;
  amount_cents: number | null;
  currency: string | null;
  stripe_checkout_session_id: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  access_starts_at: string;
  access_expires_at: string | null;
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'revoked', label: 'Revoked' },
];

export default async function AdminAcademyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filter = (FILTERS.find((item) => item.value === sp.status)?.value ?? 'all') as Filter;
  const query = typeof sp.q === 'string' ? sp.q.trim().slice(0, 120) : '';

  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  let enrollmentsQuery = sb
    .from('academy_enrollments')
    .select(
      'id, created_at, updated_at, track_slug, product_name, email, name, status, amount_cents, currency, stripe_checkout_session_id, stripe_customer_id, stripe_payment_intent_id, access_starts_at, access_expires_at',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (filter !== 'all') enrollmentsQuery = enrollmentsQuery.eq('status', filter);
  if (query) {
    enrollmentsQuery = enrollmentsQuery.or(
      `email.ilike.%${escapeSupabaseLike(query)}%,name.ilike.%${escapeSupabaseLike(query)}%,track_slug.ilike.%${escapeSupabaseLike(query)}%`,
    );
  }

  const [{ data, error }, activeCount, refundedCount, revokedCount] = await Promise.all([
    enrollmentsQuery,
    countByStatus('active'),
    countByStatus('refunded'),
    countByStatus('revoked'),
  ]);

  const enrollments = (data ?? []) as EnrollmentRow[];
  const activeRevenueCents = enrollments
    .filter((row) => row.status === 'active')
    .reduce((sum, row) => sum + (row.amount_cents ?? 0), 0);
  const byTrack = new Map<string, number>();
  for (const row of enrollments) byTrack.set(row.track_slug, (byTrack.get(row.track_slug) ?? 0) + 1);

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Academy' }]}
        email={profile.email}
        fullName={profile.full_name}
      />
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 lg:px-8" data-testid="admin-academy">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#3D5AFE]">
              Commerce control plane
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#fafafa]">
              Academy enrollments
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#a1a1aa]">
              Stripe checkout fulfillment, buyer access, and enrollment revenue in one admin
              surface.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/api/admin/academy/enrollments/export"
              className="rounded-lg border border-[#3D5AFE]/50 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[#8EA0FF] transition hover:border-[#3D5AFE] hover:text-[#fafafa]"
            >
              Export CSV
            </Link>
            <Link
              href="/academy"
              className="rounded-lg border border-[#27272a] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[#a1a1aa] transition hover:border-[#3D5AFE] hover:text-[#fafafa]"
            >
              View academy
            </Link>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Active" value={String(activeCount)} tone="emerald" />
          <Stat label="Refunded" value={String(refundedCount)} tone="amber" />
          <Stat label="Revoked" value={String(revokedCount)} tone="rose" />
          <Stat label="Visible revenue" value={formatMoney(activeRevenueCents, 'usd')} tone="violet" />
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-[#fafafa]">Track readiness</h2>
                <Badge tone="violet">{academyProducts.length} tracks</Badge>
              </div>
              <div className="space-y-3">
                {academyProducts.map((product) => (
                  <div
                    key={product.trackSlug}
                    className="rounded-lg border border-[#27272a] bg-[#09090B] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[#fafafa]">
                          {product.name.replace(' — Founding Access', '')}
                        </div>
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#71717a]">
                          {product.priceLabel} · {product.stripeEnvVar}
                        </div>
                      </div>
                      <Badge tone={product.status === 'checkout_ready' ? 'emerald' : 'amber'}>
                        {product.status === 'checkout_ready' ? 'checkout ready' : 'early access'}
                      </Badge>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#18181b]">
                      <div
                        className="h-full rounded-full bg-[#3D5AFE]"
                        style={{ width: `${Math.min(100, (byTrack.get(product.trackSlug) ?? 0) * 20)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-[#fafafa]">Fulfillment checklist</h2>
                <Badge tone="cyan">Program 9</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Stripe prices', 'Vercel env vars point checkout to the academy products.'],
                  ['Webhook', 'checkout.session.completed creates an enrollment record.'],
                  ['Email', 'Confirmation email sends after the enrollment upsert.'],
                  ['Access', 'My Courses reads active enrollments by purchase email.'],
                ].map(([label, detail]) => (
                  <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#8EA0FF]">
                      {label}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#a1a1aa]">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-[#3D5AFE]/30 bg-[#3D5AFE]/10 p-3 text-xs leading-5 text-[#b8c2ff]">
                Final end-to-end proof still requires one completed checkout session. Created or
                expired sessions prove checkout can start; only a paid session proves webhook,
                enrollment, and email together.
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium text-[#fafafa]">
                  Enrollments ({enrollments.length})
                </h2>
                {error ? <p className="mt-1 text-xs text-[#f43f5e]">{error.message}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <FilterTabs current={filter} />
                <form action="/admin/academy" className="flex items-center gap-2">
                  {filter !== 'all' ? <input type="hidden" name="status" value={filter} /> : null}
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder="email, name, track"
                    className="w-48 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa] placeholder:text-[#52525b] focus:border-[#3D5AFE]/60 focus:outline-none"
                  />
                </form>
              </div>
            </div>

            {enrollments.length === 0 ? (
              <p className="rounded-lg border border-[#27272a] bg-[#09090B] p-4 text-sm text-[#71717a]">
                No academy enrollments match this view yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-[#27272a]">
                <div className="grid grid-cols-12 gap-2 border-b border-[#27272a] bg-[#09090B] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-[#71717a]">
                  <div className="col-span-3">Buyer</div>
                  <div className="col-span-3">Track</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Created</div>
                </div>
                <div className="divide-y divide-[#1f1f23]">
                  {enrollments.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-12 gap-2 px-3 py-3 text-xs"
                      data-testid="academy-enrollment-row"
                    >
                      <div className="col-span-3 min-w-0">
                        <div className="truncate font-medium text-[#fafafa]">{row.email}</div>
                        <div className="mt-1 truncate text-[#71717a]">{row.name ?? 'No name'}</div>
                      </div>
                      <div className="col-span-3 min-w-0">
                        <div className="truncate text-[#a1a1aa]">{trackTitle(row.track_slug)}</div>
                        <div className="mt-1 truncate font-mono text-[10px] text-[#52525b]">
                          {row.stripe_checkout_session_id}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                      </div>
                      <div className="col-span-2 tabular-nums text-[#fafafa]">
                        {formatMoney(row.amount_cents, row.currency)}
                      </div>
                      <div className="col-span-2 text-[#71717a]">{formatDate(row.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

async function countByStatus(status: EnrollmentStatus) {
  const { count } = await supabaseAdmin()
    .from('academy_enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('status', status);
  return count ?? 0;
}

function FilterTabs({ current }: { current: Filter }) {
  return (
    <div className="flex flex-wrap gap-1">
      {FILTERS.map((filter) => (
        <Link
          key={filter.value}
          href={filter.value === 'all' ? '/admin/academy' : `/admin/academy?status=${filter.value}`}
          className={
            filter.value === current
              ? 'rounded-md border border-[#3D5AFE]/50 bg-[#3D5AFE]/10 px-2.5 py-1 text-xs text-[#8EA0FF]'
              : 'rounded-md border border-[#27272a] px-2.5 py-1 text-xs text-[#a1a1aa] hover:border-[#3D5AFE]/50 hover:text-[#fafafa]'
          }
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'emerald' | 'amber' | 'rose' | 'violet';
}) {
  const colors = {
    emerald: 'text-[#10b981]',
    amber: 'text-[#f59e0b]',
    rose: 'text-[#f43f5e]',
    violet: 'text-[#8EA0FF]',
  };
  return (
    <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717a]">{label}</div>
      <div className={`mt-3 text-2xl font-semibold tabular-nums ${colors[tone]}`}>{value}</div>
    </div>
  );
}

function statusTone(status: EnrollmentStatus) {
  if (status === 'active') return 'emerald';
  if (status === 'refunded') return 'amber';
  return 'rose';
}

function formatMoney(cents: number | null | undefined, currency: string | null | undefined) {
  if (typeof cents !== 'number') return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency ?? 'usd').toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function trackTitle(slug: string) {
  return academyTracks.find((track) => track.slug === slug)?.title ?? slug;
}

function escapeSupabaseLike(value: string) {
  return value.replaceAll('%', '\\%').replaceAll('_', '\\_').replaceAll(',', '');
}
