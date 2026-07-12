import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { AdminTopbar } from '@/components/admin/topbar';
import { AuditRow } from '@/components/admin/audit-row';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Audit log' };

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    actor?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? '1'));
  const actor = (params.actor ?? '').trim();
  const action = (params.action ?? '').trim();
  const fromDate = (params.from ?? '').trim();
  const toDate = (params.to ?? '').trim();

  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  let query = sb
    .from('audit_log')
    .select(
      'id, actor_id, actor_email, action, entity_type, entity_id, before, after, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (actor) query = query.ilike('actor_email', `%${actor}%`);
  if (action) query = query.ilike('action', `%${action}%`);
  if (fromDate) query = query.gte('created_at', new Date(fromDate).toISOString());
  if (toDate) query = query.lte('created_at', new Date(toDate).toISOString());

  const { data, count } = await query;
  const rows = (data ?? []) as {
    id: string;
    actor_id: string | null;
    actor_email: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    before: unknown;
    after: unknown;
    created_at: string;
  }[];

  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean) as string[])];
  const actorMap = new Map<string, string>();
  if (actorIds.length) {
    const { data: profs } = await sb
      .from('profiles')
      .select('id, full_name, email')
      .in('id', actorIds);
    for (const p of profs ?? []) actorMap.set(p.id, p.full_name || p.email);
  }

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const queryString = (overrides: Record<string, string | number>) => {
    const sp = new URLSearchParams();
    if (actor) sp.set('actor', actor);
    if (action) sp.set('action', action);
    if (fromDate) sp.set('from', fromDate);
    if (toDate) sp.set('to', toDate);
    sp.set('page', String(overrides.page ?? page));
    return `?${sp.toString()}`;
  };

  return (
    <>
      <AdminTopbar
        crumbs={[{ label: 'Audit log' }]}
        email={profile.email}
        fullName={profile.full_name}
      />
      <div className="px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Audit log</h1>
          <p className="text-sm text-[#a1a1aa] mt-1">
            Every privileged action. {count ?? 0} entries.
          </p>
        </div>

        <form
          action="/admin/audit-log"
          className="flex flex-wrap items-end gap-2 mb-4 rounded-xl border border-[#27272a] bg-[#0f0f12] p-3"
        >
          <label className="space-y-1">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
              Actor (email)
            </span>
            <input
              type="text"
              name="actor"
              defaultValue={actor}
              className="rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-xs text-[#fafafa]"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
              Action
            </span>
            <input
              type="text"
              name="action"
              defaultValue={action}
              className="rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-xs text-[#fafafa]"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
              From
            </span>
            <input
              type="date"
              name="from"
              defaultValue={fromDate}
              className="rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-xs text-[#fafafa]"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
              To
            </span>
            <input
              type="date"
              name="to"
              defaultValue={toDate}
              className="rounded-lg border border-[#27272a] bg-[#131316] px-2.5 py-1.5 text-xs text-[#fafafa]"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[#06b6d4] px-3 py-1.5 text-xs font-semibold text-[#09090B] hover:bg-[#0891B2]"
          >
            Apply
          </button>
          <Link
            href="/admin/audit-log"
            className="rounded-lg border border-[#27272a] px-3 py-1.5 text-xs text-[#a1a1aa] hover:border-[#06b6d4] hover:text-[#06b6d4]"
          >
            Clear
          </Link>
        </form>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-10 text-center text-sm text-[#a1a1aa]">
            No audit entries match.
          </div>
        ) : (
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-[#52525b] border-b border-[#1f1f23]">
              <div className="col-span-3">Timestamp</div>
              <div className="col-span-3">Actor</div>
              <div className="col-span-2">Action</div>
              <div className="col-span-3">Entity</div>
              <div className="col-span-1 text-right">Diff</div>
            </div>
            <div className="divide-y divide-[#1f1f23]">
              {rows.map((r) => (
                <AuditRow
                  key={r.id}
                  row={r}
                  actorLabel={
                    r.actor_id && actorMap.get(r.actor_id)
                      ? actorMap.get(r.actor_id)!
                      : r.actor_email ?? 'system'
                  }
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-[#71717a]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/audit-log${queryString({ page: page - 1 })}`}
                className="rounded-lg border border-[#27272a] px-3 py-1.5 hover:border-[#06b6d4] hover:text-[#06b6d4]"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/audit-log${queryString({ page: page + 1 })}`}
                className="rounded-lg border border-[#27272a] px-3 py-1.5 hover:border-[#06b6d4] hover:text-[#06b6d4]"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
