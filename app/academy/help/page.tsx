import type { Metadata } from 'next'
import { AcademyNav } from '@/components/academy/marketing/AcademyNav'
import { AcademyFooter } from '@/components/academy/marketing/AcademyFooter'
import { HelpContent } from './HelpContent'

const DISPLAY = 'Fraunces, Georgia, serif'
const MONO = '"JetBrains Mono", monospace'

export const metadata: Metadata = {
  title: 'Help · Sage Academy',
  description:
    'Answers grounded in how Sage Academy actually works — streak freezes, proof-based unlocks, verifiable certificates, exporting your work, and billing.',
}

export default function HelpPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(120% 80% at 50% -10%, rgba(255,255,255,0.035) 0%, transparent 55%) #0B0B0E',
        color: '#F2EFE9',
        fontFamily: '"Hanken Grotesk", sans-serif',
        fontSize: 15,
        lineHeight: 1.6,
        overflowX: 'hidden',
      }}
    >
      {/* Nav */}
      <AcademyNav />

      <main
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: 'clamp(48px, 7vw, 80px) clamp(20px, 4vw, 48px) 88px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: '#8FA0FF',
              marginBottom: 14,
            }}
          >
            Help center
          </div>
          <h1
            style={{
              margin: '0 auto',
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 'clamp(30px, 4vw, 44px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              maxWidth: '18ch',
              textWrap: 'balance',
            }}
          >
            How can we help?
          </h1>
        </div>

        <HelpContent />
      </main>

      <AcademyFooter />
    </div>
  )
}
