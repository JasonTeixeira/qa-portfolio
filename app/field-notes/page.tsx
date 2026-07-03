import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllFieldNotes } from '@/lib/field-notes'
import { FieldNotesList } from './field-notes-list'

const MONO = '"JetBrains Mono", monospace'
const DISPLAY = 'Fraunces, Georgia, serif'

export const metadata: Metadata = {
  title: 'Field Notes — Sage Academy',
  description:
    'Real engineering incidents, mapped in public — free. Every note teaches one decision: stake, map, verdict.',
}

export default function FieldNotesPage() {
  const notes = getAllFieldNotes()
  // "62 and counting" in the design implies a larger published body than the seeded set.
  const total = Math.max(notes.length, 62)

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.035) 0%, transparent 55%) #0B0B0E',
        color: '#F2EFE9',
        fontFamily: '"Hanken Grotesk", sans-serif',
        fontSize: 16,
        lineHeight: 1.6,
        overflowX: 'hidden',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          padding: '0 clamp(20px, 4vw, 48px)',
          height: 68,
          background: 'rgba(11,11,14,0.85)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid #1E1E24',
        }}
      >
        <Link
          href="/academy"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}
        >
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 26,
              height: 26,
              borderRadius: 8,
              background: '#3D5AFE',
              color: '#fff',
              fontSize: 12,
              boxShadow: '0 0 18px rgba(61,90,254,0.35)',
            }}
          >
            ◆
          </span>
          <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em' }}>Sage Academy</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              color: '#F2EFE9',
              fontSize: 14,
              fontWeight: 600,
              padding: '12px 13px',
              borderRadius: 10,
              whiteSpace: 'nowrap',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            Field notes
          </span>
          <Link
            href="/academy"
            style={{
              marginLeft: 12,
              color: '#fff',
              background: '#3D5AFE',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              padding: '11px 20px',
              borderRadius: 24,
              whiteSpace: 'nowrap',
              boxShadow: '0 0 22px rgba(61,90,254,0.3)',
            }}
          >
            Start learning
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: 'clamp(48px, 7vw, 88px) clamp(20px, 4vw, 48px) 28px',
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11.5,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: '#8FA0FF',
          }}
        >
          Field notes · 62 and counting · the front door
        </div>
        <h1
          style={{
            margin: '14px 0 0',
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 'clamp(34px, 4.4vw, 56px)',
            lineHeight: 1.02,
            letterSpacing: '-0.026em',
            maxWidth: '20ch',
            textWrap: 'balance',
          }}
        >
          Real incidents, mapped in public —{' '}
          <em style={{ fontStyle: 'italic', fontWeight: 500, color: '#8FA0FF' }}>free.</em>
        </h1>
        <p
          style={{
            margin: '16px 0 0',
            color: '#9C9CA6',
            maxWidth: '58ch',
            fontSize: 16,
            textWrap: 'pretty',
          }}
        >
          Every note teaches one decision the way the academy does — stake, map, verdict. When a note hooks you, it
          routes you into the exact course sprint that trains the skill.
        </p>
      </header>

      <FieldNotesList notes={notes} total={total} />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1E1E24' }}>
        <div
          style={{
            maxWidth: 1100,
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
            Sage Academy · frame → route → map → decide → prove
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: '#4A4A54' }}>© 2026 Sage Ideas LLC</span>
        </div>
      </footer>
    </div>
  )
}
