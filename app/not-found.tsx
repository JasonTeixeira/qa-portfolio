import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — this page failed its check',
  description: 'This page either moved, never shipped, or failed its own check.',
  robots: { index: false, follow: false },
}

/**
 * Sitewide 404, reskinned to the Sage Academy "This page failed its check"
 * design: a ghosted Fraunces numeral, a curl-trace terminal card, and two
 * honest exits — home and the real Field Notes index. Self-contained (exact
 * academy palette + root font vars) so it renders correctly regardless of the
 * surrounding layout's token scope.
 */
const BG = '#0B0B0E'
const SURFACE = '#111115'
const TEXT = '#F2EFE9'
const MUTED = '#9598A2'
const LINE = '#1E1E24'
const ACCENT = '#3D5AFE'
const GREEN = '#18B663'
const RED = '#E5484D'
const MONO = 'var(--font-mono), ui-monospace, monospace'
const SERIF = 'var(--font-serif), Georgia, serif'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BG,
        color: TEXT,
        padding: '6rem 1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
        {/* Ghosted numeral behind the headline */}
        <div style={{ position: 'relative', marginBottom: '0.25rem' }}>
          <span
            aria-hidden
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(6rem, 4rem + 14vw, 11rem)',
              fontWeight: 600,
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: 'rgba(255,255,255,0.035)',
              userSelect: 'none',
              display: 'block',
            }}
          >
            404
          </span>
          <h1
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(1.9rem, 1.2rem + 3vw, 3rem)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              margin: 0,
              marginTop: 'clamp(-3.5rem, -2rem - 4vw, -2.25rem)',
            }}
          >
            This page failed its check.
          </h1>
        </div>

        {/* curl-trace terminal card */}
        <div
          style={{
            marginTop: '2rem',
            textAlign: 'left',
            background: SURFACE,
            border: `1px solid ${LINE}`,
            borderRadius: 14,
            padding: '1.1rem 1.25rem',
            fontFamily: MONO,
            fontSize: 12.5,
            lineHeight: 1.9,
          }}
        >
          <div style={{ color: MUTED }}>
            <span style={{ color: TEXT }}>$</span> curl sageideas.dev/this-page
          </div>
          <div style={{ color: RED }}>✗ 404 — resource not in the ledger</div>
          <div style={{ color: MUTED, opacity: 0.65 }}># defended omission: it either moved, or never shipped</div>
          <div style={{ color: GREEN }}>hint: the suspect edge is probably the URL</div>
        </div>

        {/* Two honest exits */}
        <div style={{ marginTop: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              background: ACCENT,
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              padding: '0.7rem 1.4rem',
              borderRadius: 999,
              textDecoration: 'none',
            }}
          >
            Back to safety →
          </Link>
          <Link
            href="/field-notes"
            style={{
              background: 'transparent',
              color: TEXT,
              fontWeight: 500,
              fontSize: 14,
              padding: '0.7rem 1.4rem',
              borderRadius: 999,
              border: `1px solid ${LINE}`,
              textDecoration: 'none',
            }}
          >
            Read a field note instead
          </Link>
        </div>

        <p style={{ marginTop: '1.75rem', fontFamily: MONO, fontSize: 11, color: MUTED, opacity: 0.7, lineHeight: 1.7 }}>
          every 404 here points at a broken link — if a real one brought you here, the URL is the suspect.
        </p>
      </div>
    </main>
  )
}
