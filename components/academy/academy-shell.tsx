import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getGamification } from '@/lib/academy/gamification'
import { getDueCount } from '@/lib/academy/fsrs'
import { CommandPalette } from '@/components/academy/search/CommandPalette'
import { AiTutorPanel } from '@/components/academy/tutor/AiTutorPanel'
import { Icon, type IconName } from '@/components/academy/ui/Icon'

/**
 * The learner shell — the customer-side equivalent of the client portal layout. Gives
 * every authenticated academy page a consistent, premium "learning product" chrome
 * (electric blue, progress-forward) so a learner always knows they're in the Academy.
 * Renders the habit widget (streak + level + XP) in the header on every academy page.
 *
 * One canonical nav contract: the SAME five destinations render in the desktop top bar
 * (≥ md) and in the persistent mobile bottom tab bar (< md). Active key fixed so exactly
 * one destination lights per page. Secondary surfaces (leagues, community) nest in Profile.
 */
type NavItem = { href: string; label: string; key: string; icon: IconName }

const NAV: readonly NavItem[] = [
  { href: '/academy/dashboard', label: 'Home', key: 'home', icon: 'compass' },
  { href: '/academy/catalog', label: 'Courses', key: 'courses', icon: 'book' },
  { href: '/academy/progress', label: 'My Path', key: 'path', icon: 'target' },
  { href: '/academy/review', label: 'Practice', key: 'practice', icon: 'refresh' },
  { href: '/academy/profile', label: 'Profile', key: 'profile', icon: 'users' },
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

/** Whether a nav item carries a "due" review badge. */
function dueBadgeFor(key: string, dueCount: number): number | null {
  return key === 'practice' && dueCount > 0 ? dueCount : null
}

/** The desktop top-bar nav links (≥ md). */
function NavLinks({ active, dueCount }: { active?: string; dueCount: number }) {
  return (
    <>
      {NAV.map((item) => {
        const on = active === item.key
        const badge = dueBadgeFor(item.key, dueCount)
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
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ac-accent-strong)] px-1 text-[10px] font-semibold leading-none text-white">
                {badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </>
  )
}

/**
 * The persistent mobile bottom tab bar (< md). Same five destinations as the desktop
 * bar, thumb-reachable, ≥44px tap targets, safe-area padding, current destination
 * highlighted with aria-current. Icon + label, no hover-only affordances.
 */
function MobileTabBar({ active, dueCount }: { active?: string; dueCount: number }) {
  return (
    <nav
      aria-label="Academy"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--ac-rule)] bg-[color-mix(in_srgb,var(--ac-bg)_94%,transparent)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV.map((item) => {
          const on = active === item.key
          const badge = dueBadgeFor(item.key, dueCount)
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={on ? 'page' : undefined}
                className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors ${
                  on ? 'text-[var(--ac-ink)]' : 'text-[color:var(--ac-ink-faint)]'
                }`}
              >
                <span className="relative inline-flex">
                  <Icon name={item.icon} size={22} style={on ? { color: 'var(--ac-accent-text)' } : undefined} />
                  {badge ? (
                    <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ac-accent-strong)] px-1 text-[9px] font-semibold leading-none text-white">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span className="whitespace-nowrap tracking-tight">{item.label}</span>
                {on ? (
                  <span
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full"
                    style={{ background: 'var(--ac-accent)' }}
                    aria-hidden
                  />
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
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
              className="grid h-7 w-7 place-items-center rounded-[8px] bg-[var(--ac-accent-strong)] text-white"
              aria-hidden
            >
              {/* Real Sage brand mark (monochrome, inherits currentColor) */}
              <svg viewBox="0 0 64 64" width={17} height={17} fill="currentColor" aria-hidden focusable="false">
                <path d="M16 18c0-5 4-9 9-9h14c5 0 9 4 9 9v3a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-2c0-1.7-1.3-3-3-3H27c-1.7 0-3 1.3-3 3v6c0 1.7 1.3 3 3 3h11c5 0 9 4 9 9v9c0 5-4 9-9 9H25c-5 0-9-4-9-9v-3a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v2c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3v-6c0-1.7-1.3-3-3-3H28c-5 0-9-4-9-9z" />
              </svg>
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
            <CommandPalette />
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
                className="rounded-full bg-[var(--ac-accent-strong)] px-3.5 py-1.5 text-[12px] font-semibold text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

      </header>

      {/* On mobile the top bar simplifies to brand + search (above); primary nav
          lives in the fixed bottom tab bar. Pad the bottom so content clears it. */}
      <main className="pb-[calc(64px+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</main>

      <MobileTabBar active={active} dueCount={dueCount} />

      {/* Persistent master-tutor — available on every academy page. */}
      <AiTutorPanel />
    </div>
  )
}
