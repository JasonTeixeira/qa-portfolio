import Link from 'next/link'

const MONO = '"JetBrains Mono", monospace'

type FooterLink = {
  label: string
  href: string
}

// Real routes only — verified to exist. No Legal/Terms/Privacy (deferred).
const LINKS: FooterLink[] = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Why proof', href: '/academy/why-proof' },
  { label: 'Proof, not paper', href: '/academy/proof-not-paper' },
  { label: 'Help', href: '/academy/help' },
  { label: 'Contact', href: 'mailto:contact@sageideas.dev' },
]

type AcademyFooterProps = {
  tagline?: string
}

export function AcademyFooter({
  tagline = 'learn by building · proof over paper',
}: AcademyFooterProps) {
  return (
    <footer style={{ borderTop: '1px solid #1E1E24' }}>
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '30px clamp(20px, 4vw, 48px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 11, color: '#9598A2' }}>
          Sage Academy · {tagline}
        </span>

        <nav
          aria-label="Academy footer"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'clamp(12px, 2vw, 22px)',
          }}
        >
          {LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: '#9598A2',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <span style={{ fontFamily: MONO, fontSize: 11, color: '#4A4A54' }}>
          © 2026 Sage Ideas LLC
        </span>
      </div>
    </footer>
  )
}
