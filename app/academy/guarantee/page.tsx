import type { Metadata } from 'next'
import Link from 'next/link'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: t('Billing & cancellation — Sage Academy'),
    description: t(
      'Exactly what a Sage Academy membership includes, how the 7-day free trial and cancellation work, and how plan changes are prorated — in plain language.'
    ),
    alternates: localizedAlternates('/academy/guarantee', locale),
  }
}

const TERMS = [
  {
    glyph: '01',
    title: 'What a membership includes',
    body: 'One price, everything in the academy: every course as it ships, the full Labs workshop of buildable projects, every proof and eval, spaced recall, leagues, and certificates that resolve at a public /verify link anyone can open. New courses are added at no extra charge while you’re a member.',
  },
  {
    glyph: '02',
    title: 'Try before you pay',
    body: 'You can read a full lesson free — no card, no account required. When you’re ready, every plan starts with a 7-day free trial: full access, and we remind you before it renews. If it isn’t for you, cancel during the trial and you’re never charged.',
  },
  {
    glyph: '03',
    title: 'Cancel anytime — no lock-in',
    body: 'Cancel from your account in two clicks — no “call to retain,” no hidden downgrade path. When you cancel, access runs to the end of the billing period you already paid for; there is no partial-period refund. Your certificates keep resolving at their public links after you leave — proof you earned stays yours.',
  },
  {
    glyph: '04',
    title: 'Plan changes are prorated',
    body: 'Upgrade from monthly to annual anytime and the unused days on your current period are credited automatically — you never pay for the same week twice. Team seats are per-person and reassignable by an admin at no cost.',
  },
]

const mono = { fontFamily: 'var(--font-mono), monospace' } as const

export default async function BillingPage() {
  const t = await getT()
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0B0E',
        backgroundImage: 'radial-gradient(110% 70% at 50% -8%, rgba(61,90,254,0.07) 0%, transparent 55%)',
        color: '#F2EFE9',
        fontFamily: 'var(--font-sans), sans-serif',
      }}
    >
      <main style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(16px, 3vw, 32px) 80px' }}>
        <div style={{ ...mono, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8FA0FF' }}>
          {t('Membership · plain-language policy · 2 minute read')}
        </div>
        <h1
          style={{
            margin: '14px 0 0',
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontWeight: 600,
            fontSize: 'clamp(32px, 4.4vw, 52px)',
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            maxWidth: '20ch',
          }}
        >
          {t('Billing & cancellation, without the fine-print games.')}
        </h1>
        <p style={{ margin: '18px 0 0', color: '#9C9CA6', fontSize: 17, maxWidth: '60ch' }}>
          {t('We sell verifiable skill, not a certificate you frame and forget. Here is exactly what a membership includes, how the free trial and cancellation work, and how plan changes are handled — in plain language.')}
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
              <span style={{ ...mono, fontSize: 13, color: '#8FA0FF', paddingTop: 2 }}>{term.glyph}</span>
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
            border: '1px solid rgba(61,90,254,0.35)',
            borderRadius: 16,
            background: 'linear-gradient(165deg, #0E1020, #111115)',
            padding: 26,
            marginTop: 16,
          }}
        >
          <div style={{ ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8FA0FF', marginBottom: 10 }}>
            {t('What we will never promise')}
          </div>
          <p style={{ margin: 0, fontSize: 14.5, color: '#B6B6C0', maxWidth: '66ch' }}>
            {t('A job, or a money-back guarantee. Hiring involves luck, timing, and people we don’t control, and we don’t offer refunds — so we don’t pretend to. What we do offer is honest: a free lesson before you pay, a 7-day trial, cancel anytime with no lock-in, and real, code-verifiable proof of what you can build.')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
          <Link
            href="/academy/pricing"
            style={{
              display: 'inline-flex',
              color: '#0B0B0E',
              background: 'linear-gradient(135deg, #6E86FF, #3D5AFE)',
              textDecoration: 'none',
              fontSize: 14.5,
              fontWeight: 700,
              padding: '13px 26px',
              borderRadius: 24,
              boxShadow: '0 0 22px rgba(61,90,254,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            {t('See plans')}
          </Link>
          <Link href="/academy/how-we-audit" style={{ ...mono, fontSize: 11, color: '#8FA0FF', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {t('how we hold our own courses to this bar →')}
          </Link>
          <Link href="/academy/help" style={{ ...mono, fontSize: 11, color: '#9598A2', textDecoration: 'none' }}>
            {t('questions? talk to us →')}
          </Link>
        </div>
      </main>
    </div>
  )
}
