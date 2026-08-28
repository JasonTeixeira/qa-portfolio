import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The loop-ready guarantee, without the fine-print games — Interview Mastery',
  description:
    'Exactly what Interview Mastery promises, what it never promises, and how refunds work — in plain language. Follow your plan for 14 days and your readiness score rises, or you don’t pay.',
  alternates: { canonical: 'https://www.sageideas.dev/academy/interview/guarantee' },
}

const TERMS = [
  {
    glyph: '01',
    title: 'The promise',
    body: 'Follow your plan for 14 days — the sessions it schedules, at the level you chose in onboarding — and your readiness score will rise. If it doesn’t, Interview Mastery is free until it does, one month at a time, automatically. No form, no support ticket; the same scoring engine that grades you triggers the credit.',
  },
  {
    glyph: '02',
    title: 'What "following the plan" means',
    body: 'Completing at least 80% of scheduled sessions in the window. Skipped weeks pause the clock rather than void the guarantee — life happens. Deliberately tanking sessions to farm free months voids it; the transcripts make this obvious, and we read them when a claim looks odd.',
  },
  {
    glyph: '03',
    title: 'Plain refunds',
    body: 'First 14 days after purchase: full refund, any reason, even if your score went up. Annual plans: prorated refund of unused months any time in the first 90 days. Refunds land on the original card within 5 business days.',
  },
  {
    glyph: '04',
    title: 'The plateau clause',
    body: 'The guarantee doesn’t expire after your first two weeks. Any time you’re active and your readiness stays flat for two consecutive weeks while following the plan, the next month is credited. Plateaus are our problem to fix, not yours to pay for.',
  },
]

const mono = { fontFamily: 'var(--font-mono), monospace' } as const

export default function InterviewGuaranteePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0E',
        backgroundImage: 'radial-gradient(110% 70% at 50% -8%, rgba(224,169,62,0.06) 0%, transparent 55%)',
        color: '#F2EFE9',
        fontFamily: 'var(--font-sans), sans-serif',
      }}
    >
      <main style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(16px, 3vw, 32px) 80px' }}>
        <div style={{ ...mono, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#E0A93E' }}>
          Interview Mastery · plain-language policy · 2 minute read
        </div>
        <h1
          style={{
            margin: '14px 0 0',
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontWeight: 600,
            fontSize: 'clamp(32px, 4.4vw, 52px)',
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            maxWidth: '18ch',
          }}
        >
          The loop-ready guarantee, without the fine-print games.
        </h1>
        <p style={{ margin: '18px 0 0', color: '#9C9CA6', fontSize: 17, maxWidth: '58ch' }}>
          Our scoring is honest enough that we can put money on it. Here is exactly what we promise,
          what we don’t, and how refunds work.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 44 }}>
          {TERMS.map((t) => (
            <div
              key={t.glyph}
              style={{
                border: '1px solid #1E1E24',
                borderRadius: 16,
                background: '#111115',
                padding: 26,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 18,
              }}
            >
              <span style={{ ...mono, fontSize: 13, color: '#E0A93E', paddingTop: 2 }}>{t.glyph}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 600, fontSize: 20, letterSpacing: '-0.015em' }}>
                  {t.title}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14.5, color: '#9C9CA6', maxWidth: '62ch' }}>{t.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            border: '1px solid rgba(224,169,62,0.35)',
            borderRadius: 16,
            background: 'linear-gradient(165deg, #17150E, #111115)',
            padding: 26,
            marginTop: 16,
          }}
        >
          <div style={{ ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#E0A93E', marginBottom: 10 }}>
            What we will never promise
          </div>
          <p style={{ margin: 0, fontSize: 14.5, color: '#B6B6C0', maxWidth: '66ch' }}>
            A job. Hiring involves luck, timing, and people we don’t control. We promise the thing we
            can measure and you can verify: that your interview performance, scored against a
            consistent bar, gets better — or you don’t pay.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
          <Link
            href="/interview"
            style={{
              display: 'inline-flex',
              color: '#0B0B0E',
              background: 'linear-gradient(135deg, #F0C36A, #D99A2B)',
              textDecoration: 'none',
              fontSize: 14.5,
              fontWeight: 700,
              padding: '13px 26px',
              borderRadius: 24,
              boxShadow: '0 0 22px rgba(224,169,62,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            Explore Interview Mastery
          </Link>
          <Link href="/academy/help" style={{ ...mono, fontSize: 11, color: '#9598A2', textDecoration: 'none' }}>
            questions? talk to us →
          </Link>
        </div>
      </main>
    </div>
  )
}
