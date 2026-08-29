import Link from 'next/link'

type ActiveLink = 'method' | 'courses' | 'projects' | 'why-proof' | 'pricing'

type AcademyNavProps = {
  active?: ActiveLink
}

type NavLink = {
  key: ActiveLink
  label: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { key: 'method', label: 'The method', href: '/academy/method' },
  { key: 'courses', label: 'Courses', href: '/academy/catalog' },
  { key: 'projects', label: 'Projects', href: '/academy/projects' },
  { key: 'why-proof', label: 'Why proof', href: '/academy/proof-not-paper' },
  { key: 'pricing', label: 'Pricing', href: '/academy/pricing' },
]

const LINE = '#1E1E24'
const TEXT = '#F2EFE9'
const MUTED = '#9598A2'
const ACCENT = '#3D5AFE'

/**
 * Shared top navigation for Sage Academy marketing pages.
 * Server component — links only, no client state.
 * Matches the inline-style visual language used across the marketing surface.
 */
export function AcademyNav({ active }: AcademyNavProps) {
  return (
    <>
      {/* Scoped focus-visible ring for all interactive nav elements.
          Inline styles cannot express :focus-visible, so a minimal <style>
          block is required. Accent #3D5AFE at 3:1+ against #0B0B0E satisfies
          SC 2.4.11 Focus Appearance (non-text contrast ≥ 3:1). */}
      <style>{`
        nav[aria-label="Sage Academy"] a:focus-visible,
        nav[aria-label="Sage Academy"] button:focus-visible {
          outline: 2px solid #3D5AFE;
          outline-offset: 3px;
          border-radius: 4px;
        }
      `}</style>
      <nav
        aria-label="Sage Academy"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          padding: '12px clamp(16px, 3vw, 28px)',
          borderBottom: `1px solid ${LINE}`,
        }}
      >
      {/* Logo */}
      <Link
        href="/academy"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        {/* ◆ is a decorative brand glyph — hidden from assistive technology */}
        <span
          aria-hidden="true"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 24,
            height: 24,
            borderRadius: 7,
            background: ACCENT,
            color: '#fff',
            fontSize: 11,
          }}
        >
          ◆
        </span>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Sage Academy</span>
      </Link>

      {/* Middle links — hidden below a narrow min-width, no JS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(14px, 2.4vw, 26px)',
          flexWrap: 'wrap',
        }}
      >
        {NAV_LINKS.map((link) => {
          const isActive = active === link.key
          return (
            <Link
              key={link.key}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              style={{
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? TEXT : MUTED,
                borderBottom: isActive
                  ? `1px solid ${ACCENT}`
                  : '1px solid transparent',
                paddingBottom: 2,
                whiteSpace: 'nowrap',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Right-side CTAs */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <Link
          href="/login?audience=academy"
          style={{
            color: MUTED,
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          Log in
        </Link>
        <Link
          href="/academy/signup"
          style={{
            color: '#fff',
            background: ACCENT,
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: 600,
            padding: '10px 18px',
            borderRadius: 22,
            whiteSpace: 'nowrap',
          }}
        >
          Start learning
        </Link>
      </div>
    </nav>
    </>
  )
}
