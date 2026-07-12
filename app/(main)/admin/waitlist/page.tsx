import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/topbar'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Academy Waitlist', robots: { index: false, follow: false } }

const CAP = 1000

type Row = { email: string; ref_code: string; referred_by: string | null; created_at: string }

function fmt(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return ts
  }
}

export default async function AdminWaitlistPage() {
  const { profile } = await requireAdmin()
  const sb = supabaseAdmin()

  const { data, error } = await sb
    .from('academy_waitlist')
    .select('email, ref_code, referred_by, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)

  const rows = (data ?? []) as Row[]
  const total = rows.length
  const spotsLeft = Math.max(0, CAP - total)

  // Referral leaderboard: count how many each ref_code brought in.
  const codeToEmail = new Map(rows.map((r) => [r.ref_code, r.email]))
  const refCounts = new Map<string, number>()
  for (const r of rows) {
    if (r.referred_by) refCounts.set(r.referred_by, (refCounts.get(r.referred_by) ?? 0) + 1)
  }
  const leaderboard = [...refCounts.entries()]
    .map(([code, count]) => ({ email: codeToEmail.get(code) ?? code, code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const referredTotal = rows.filter((r) => r.referred_by).length
  const recent = rows.slice(0, 50)

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#fafafa]">
      <AdminTopbar crumbs={[{ label: 'Academy Waitlist' }]} email={profile.email} fullName={profile.full_name} />
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-8" data-testid="admin-waitlist">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#3D5AFE]">Founding waitlist</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sage Academy — waitlist</h1>
          <p className="mt-1 text-sm text-[#a1a1aa]">Live, from Supabase. {error ? 'Could not load rows.' : 'Every row is a real signup.'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total signups', value: total.toLocaleString() },
            { label: 'Founding spots left', value: spotsLeft.toLocaleString() },
            { label: 'Joined via referral', value: referredTotal.toLocaleString() },
            { label: 'Cohort cap', value: CAP.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[#27272a] bg-[#101012] p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#71717a]">{s.label}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>

        <a
          href="/api/admin/waitlist/export"
          className="inline-flex items-center gap-2 rounded-full border border-[#3f3f46] px-4 py-2 text-sm font-medium hover:border-[#3D5AFE]"
        >
          Export CSV ↓
        </a>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Recent signups */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#a1a1aa]">Recent signups</h2>
            <div className="overflow-hidden rounded-xl border border-[#27272a]">
              <table className="w-full text-sm">
                <thead className="bg-[#101012] text-left text-[11px] uppercase tracking-wide text-[#71717a]">
                  <tr><th className="px-4 py-2.5">Email</th><th className="px-4 py-2.5">When</th><th className="px-4 py-2.5">Ref</th></tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-[#71717a]">No signups yet.</td></tr>
                  ) : recent.map((r) => (
                    <tr key={r.email} className="border-t border-[#1c1c1f]">
                      <td className="px-4 py-2.5">{r.email}</td>
                      <td className="px-4 py-2.5 text-[#a1a1aa]">{fmt(r.created_at)}</td>
                      <td className="px-4 py-2.5 text-[#71717a]">{r.referred_by ? 'referred' : 'direct'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Referral leaderboard */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#a1a1aa]">Top referrers</h2>
            <div className="overflow-hidden rounded-xl border border-[#27272a]">
              <table className="w-full text-sm">
                <thead className="bg-[#101012] text-left text-[11px] uppercase tracking-wide text-[#71717a]">
                  <tr><th className="px-4 py-2.5">Email</th><th className="px-4 py-2.5 text-right">Referrals</th></tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr><td colSpan={2} className="px-4 py-6 text-center text-[#71717a]">No referrals yet.</td></tr>
                  ) : leaderboard.map((l) => (
                    <tr key={l.code} className="border-t border-[#1c1c1f]">
                      <td className="px-4 py-2.5">{l.email}</td>
                      <td className="px-4 py-2.5 text-right font-bold tabular-nums text-[#3D5AFE]">{l.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
