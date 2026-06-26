import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getGamification } from '@/lib/academy/gamification'
import { getDueCount } from '@/lib/academy/fsrs'

/**
 * The learner shell — the customer-side equivalent of the client portal layout. Gives
 * every authenticated academy page a consistent, premium "learning product" chrome
 * (electric blue, progress-forward) so a learner always knows they're in the Academy.
 * Renders the habit widget (streak + level + XP) in the header on every academy page.
 */
const NAV = [
  { href: '/academy/dashboard', label: 'My Learning', key: 'dashboard' },
  { href: '/academy/review', label: 'Review', key: 'review' },
  { href: '/academy/leagues', label: 'Leagues', key: 'leagues' },
  { href: '/academy/community', label: 'Community', key: 'community' },
  { href: '/academy/refer', label: 'Invite', key: 'refer' },
  { href: '/academy/catalog', label: 'Catalog', key: 'catalog' },
  { href: '/academy/evidence', label: 'Certificates', key: 'evidence' },
  { href: '/academy/resources', label: 'Tools', key: 'resources' },
] as const

const ACCENT = '#3D6BFF'

function Flame({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 2c1 3-1.5 4.5-1.5 7A2.5 2.5 0 0 0 13 11c.8-.6 1-1.6 1-1.6 1.6 1.2 3 3.2 3 5.6a5 5 0 1 1-10 0c0-2.6 1.8-4.2 3-6 .8-1.2 1.5-3.5 1.5-7Z"
        fill={active ? '#F5A623' : '#52525B'}
      />
    </svg>
  )
}

async function HabitWidget() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const g = await getGamification(user.id)

  return (
    <Link
      href="/academy/dashboard"
      aria-label={`${g.streak.current}-day streak · level ${g.xp.level}`}
      className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-3 pr-3.5 transition-colors hover:border-white/20"
    >
      <span className="flex items-center gap-1" title="Day streak">
        <Flame active={g.streak.activeToday} />
        <span className="font-mono text-[13px] font-semibold tabular-nums text-[#f2efe9]">{g.streak.current}</span>
      </span>
      <span className="hidden h-5 w-px bg-white/10 sm:block" aria-hidden />
      <span className="hidden flex-col gap-0.5 sm:flex" title={`${g.xp.intoLevel}/${150} XP to next level`}>
        <span className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#8a8b96]">
          <span>Lv {g.xp.level}</span>
          <span className="tabular-nums">{g.xp.total} XP</span>
        </span>
        <span className="block h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full rounded-full" style={{ width: `${g.xp.pct}%`, background: ACCENT }} />
        </span>
      </span>
    </Link>
  )
}

/** The academy nav links — shared by the desktop bar and the mobile row (DRY). */
function NavLinks({ active, dueCount }: { active?: string; dueCount: number }) {
  return (
    <>
      {NAV.map((item) => {
        const on = active === item.key
        const badge = item.key === 'review' && dueCount > 0 ? dueCount : null
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={on ? 'page' : undefined}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors ${
              on
                ? 'bg-[color-mix(in_srgb,var(--ac-accent)_14%,transparent)] text-[var(--ac-ink)]'
                : 'text-[color:var(--ac-ink-soft)] hover:bg-white/[0.04] hover:text-[var(--ac-ink)]'
            }`}
          >
            {item.label}
            {badge ? (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ac-accent)] px-1 text-[10px] font-semibold leading-none text-white">
                {badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </>
  )
}

export async function AcademyShell({
  children,
  active,
  signedIn = true,
}: {
  children: React.ReactNode
  active?: string
  signedIn?: boolean
}) {
  let dueCount = 0
  if (signedIn) {
    try {
      const supabase = await createSupabaseServerClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) dueCount = await getDueCount(user.id)
    } catch {
      dueCount = 0
    }
  }

  return (
    <div className="min-h-screen bg-[var(--ac-bg)] text-[var(--ac-ink)]">
      <header className="sticky top-0 z-40 border-b border-[color:var(--ac-rule)] bg-[color-mix(in_srgb,var(--ac-bg)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
          <Link href="/academy/dashboard" className="group flex items-center gap-2.5 shrink-0">
            <span
              className="grid h-7 w-7 place-items-center rounded-[8px] bg-[var(--ac-accent)] text-[13px] font-bold text-white"
              aria-hidden
            >
              ◆
            </span>
            <span className="leading-tight">
              <span
                className="block text-[15px] font-semibold tracking-tight"
                style={{ fontFamily: 'var(--ac-font-display)' }}
              >
                Sage Academy
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--ac-ink-faint)]">
                Learn · build · ship
              </span>
            </span>
          </Link>

          <nav aria-label="Academy" className="ml-2 hidden items-center gap-1 md:flex">
            <NavLinks active={active} dueCount={dueCount} />
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            {signedIn ? (
              <>
                <HabitWidget />
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-full border border-[color:var(--ac-rule)] px-3.5 py-1.5 text-[12px] font-medium text-[color:var(--ac-ink-soft)] transition-colors hover:border-[color:var(--ac-rule-strong)] hover:text-[var(--ac-ink)]"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login?audience=academy&next=/academy/dashboard"
                className="rounded-full bg-[var(--ac-accent)] px-3.5 py-1.5 text-[12px] font-semibold text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* mobile nav — the desktop bar is md+ only; this scrollable row keeps
            every destination reachable on a phone without JS. */}
        <nav
          aria-label="Academy menu"
          className="flex gap-1 overflow-x-auto border-t border-[color:var(--ac-rule)] px-3 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <NavLinks active={active} dueCount={dueCount} />
        </nav>
      </header>

      <main>{children}</main>
    </div>
  )
}
