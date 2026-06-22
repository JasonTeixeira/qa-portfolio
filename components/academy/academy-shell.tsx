import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

/**
 * The learner shell — the customer-side equivalent of the client portal layout. Gives
 * every authenticated academy page a consistent, premium "learning product" chrome that
 * is visually distinct from the studio (green accent, progress-forward), so a customer
 * always knows they're in the Academy, not the Studio.
 */
const NAV = [
  { href: '/academy/dashboard', label: 'My Learning', key: 'dashboard' },
  { href: '/academy/my-courses', label: 'My Courses', key: 'courses' },
  { href: '/academy/catalog', label: 'Catalog', key: 'catalog' },
  { href: '/academy/evidence', label: 'Certificates', key: 'evidence' },
  { href: '/academy/resources', label: 'Tools', key: 'resources' },
] as const

const ACCENT = '#18b663'

export function AcademyShell({
  children,
  active,
  signedIn = true,
}: {
  children: React.ReactNode
  active?: string
  signedIn?: boolean
}) {
  return (
    <div className="min-h-screen bg-[#0b0d0c] text-[#f2efe9]">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0b0d0c]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
          <Link href="/academy/dashboard" className="group flex items-center gap-2.5 shrink-0">
            <span
              className="grid h-7 w-7 place-items-center rounded-[8px] text-[13px] font-bold text-[#04130c]"
              style={{ background: ACCENT, boxShadow: `0 0 18px ${ACCENT}55` }}
              aria-hidden
            >
              ◆
            </span>
            <span className="leading-tight">
              <span className="block text-[14px] font-semibold tracking-tight">Sage Academy</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a8b96]">
                Learn · build · ship
              </span>
            </span>
          </Link>

          <nav aria-label="Academy" className="ml-2 hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const on = active === item.key
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={on ? 'page' : undefined}
                  className={`rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors ${
                    on
                      ? 'bg-[#18b663]/12 text-white'
                      : 'text-[#c4c5cd] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-[#8a8b96] transition-colors hover:text-[#c4c5cd] sm:block"
            >
              ← Studio
            </Link>
            {signedIn ? (
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-white/10 px-3.5 py-1.5 text-[12px] font-medium text-[#c4c5cd] transition-colors hover:border-white/25 hover:text-white"
                >
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/login?audience=academy&next=/academy/dashboard"
                className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-[#04130c]"
                style={{ background: ACCENT }}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
