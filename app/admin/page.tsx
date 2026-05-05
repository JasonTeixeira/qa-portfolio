import Link from 'next/link';
import { approveProfile, signOut } from '@/app/auth/actions';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin · Sage Ideas',
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const { profile } = await requireAdmin();
  const sb = supabaseAdmin();

  const { data: pending } = await sb
    .from('profiles')
    .select('id, email, full_name, company, role_in_company, created_at')
    .eq('approval_status', 'pending')
    .neq('app_role', 'admin')
    .order('created_at', { ascending: true });

  const { count: clientCount } = await sb
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('approval_status', 'approved')
    .neq('app_role', 'admin');

  const pendingList = pending ?? [];

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA]">
      <header className="border-b border-[#27272A] bg-[#0A0A0C]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#06B6D4]">
              Admin cockpit
            </div>
            <h1 className="text-xl font-semibold tracking-tight mt-1">Welcome, {profile.full_name || profile.email}.</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/portal/home"
              className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA] hover:text-[#FAFAFA]"
            >
              Portal view →
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-[#27272A] px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <p className="text-sm text-[#A1A1AA] max-w-2xl">
          Phase 29 will populate this with full pipeline, client, and activity views. Until then,
          the only thing wired here is the access-approval queue.
        </p>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#71717A]">
              Pending approvals
            </h2>
            <div className="text-xs font-mono text-[#52525B]">
              {pendingList.length} pending · {clientCount ?? 0} approved
            </div>
          </div>

          {pendingList.length === 0 ? (
            <div className="rounded-xl border border-[#27272A] bg-[#0F0F12] p-6 text-sm text-[#A1A1AA]">
              No pending requests. New signups land here for one-click approval.
            </div>
          ) : (
            <ul className="space-y-3">
              {pendingList.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-[#27272A] bg-[#0F0F12] p-5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#FAFAFA] truncate">
                      {p.full_name || p.email}
                    </div>
                    <div className="text-xs text-[#71717A] truncate">
                      {p.email}
                      {p.company ? ` · ${p.company}` : ''}
                      {p.role_in_company ? ` · ${p.role_in_company}` : ''}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#52525B] mt-1">
                      Requested {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <form action={approveProfile}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-[#06B6D4] px-4 py-2 text-xs font-semibold text-[#09090B] hover:bg-[#0891B2] transition-colors"
                    >
                      Approve
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
