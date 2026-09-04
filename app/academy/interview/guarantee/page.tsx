import type { Metadata } from 'next'
import Link from 'next/link'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: `${t('How Interview Mastery works — our honest promise')} — Sage Academy`,
    description: t(
      'Exactly what Interview Mastery gives you, how the scoring works, and what it will never claim — in plain language. Voice mocks, a consistent rubric, a debrief and a drill every session, added to your membership. Cancel anytime.'
    ),
    alternates: localizedAlternates('/academy/interview/guarantee', locale),
  }
}

const TERMS = [
  {
    glyph: '01',
    title: 'What you get',
    body: 'Voice-first mock interviews across all four tracks — intern through senior — that adapt, interrupt, and pressure-test the way a real loop does. Every session is scored against a consistent rubric and ends with a debrief and a specific drill to run before the next one. It is added to your Sage Academy membership; there is nothing extra to install.',
  },
  {
    glyph: '02',
    title: 'How the scoring works',
    body: 'The same rubric grades every session, so your readiness score means the same thing this week as it did last week. Scores are capped by your weakest dimension and verdicts use real committee language, including "no hire." The scoring is transparent on purpose: you can see exactly which dimension moved and which one held you back.',
  },
  {
    glyph: '03',
    title: 'What it does not promise',
    body: 'A job. Hiring involves luck, timing, and people we do not control, so we will never claim to land you one. We promise the thing we can measure and you can verify: structured reps and an honest, consistent read on how your interview performance is trending over time.',
  },
  {
    glyph: '04',
    title: 'Cancel anytime',
    body: 'No lock-in and no long-term contract. Interview Mastery rides on your membership, so if it is not helping you can cancel from your account settings whenever you like and keep access through the end of the period you already paid for.',
  },
]

const mono = { fontFamily: 'var(--font-mono), monospace' } as const

export default async function InterviewGuaranteePage() {
  const t = await getT()
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
          {`Interview Mastery · ${t('plain-language, 2 minute read')}`}
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
          {t('How Interview Mastery works — our honest promise.')}
        </h1>
        <p style={{ margin: '18px 0 0', color: '#9C9CA6', fontSize: 17, maxWidth: '58ch' }}>
          {t('No hype and no fine print. Here is exactly what you get, how the scoring stays honest, and what we will never claim.')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 44 }}>
          {TERMS.map((term) => (
            <div
              key={term.glyph}
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
              <span style={{ ...mono, fontSize: 13, color: '#E0A93E', paddingTop: 2 }}>{term.glyph}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 600, fontSize: 20, letterSpacing: '-0.015em' }}>
                  {t(term.title)}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14.5, color: '#9C9CA6', maxWidth: '62ch' }}>{t(term.body)}</p>
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
            {t('The one line to remember')}
          </div>
          <p style={{ margin: 0, fontSize: 14.5, color: '#B6B6C0', maxWidth: '66ch' }}>
            {t(
              'We cannot promise a job, and we will not pretend to. What we can promise is the reps and an honest, consistent read on your interview performance — scored against the same bar every time, added to your membership, cancel anytime.'
            )}
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
            {t('Explore')} Interview Mastery
          </Link>
          <Link href="/academy/help" style={{ ...mono, fontSize: 11, color: '#9598A2', textDecoration: 'none' }}>
            {t('questions? talk to us →')}
          </Link>
        </div>
      </main>
    </div>
  )
}
