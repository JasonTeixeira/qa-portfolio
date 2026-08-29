import type { Metadata } from 'next'
import Link from 'next/link'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  const locale = await getLocale()
  return {
    title: t('The ship-proof guarantee, without the fine-print games — Sage Academy'),
    description: t(
      "Exactly what a Sage Academy membership promises, what it never promises, and how refunds work — in plain language. Ship real, code-verifiable proof in your first 14 days, or you don’t pay."
    ),
    alternates: localizedAlternates('/academy/guarantee', locale),
  }
}

const TERMS = [
  {
    glyph: '01',
    title: 'The promise',
    body: 'Try a full lesson free before you pay a cent — no card, no trial countdown. Then, in your first 14 days as a member, if you haven’t shipped a single piece of real, code-verifiable proof — a passing lab, a built project, a certificate that resolves at a public link — email us and get every dollar back. One line is enough; there is no form-maze.',
  },
  {
    glyph: '02',
    title: 'What "shipped proof" means',
    body: 'Our proof is verified by code, not self-reported. Labs run against real checks you can’t fake your way past. Certificates resolve at a public /verify link anyone — a hiring manager, a client — can open and confirm. That verifiable output is the thing we put money behind, because it’s the thing that actually moves your career.',
  },
  {
    glyph: '03',
    title: 'Plain refunds',
    body: 'First 14 days after you upgrade: full refund, any reason, even if you already shipped. Monthly ($25/mo): cancel anytime — access runs to the end of the cycle you paid for, nothing clawed back. Annual ($250/yr): prorated refund of unused months any time in the first 90 days. Refunds land on the original card within 5 business days.',
  },
  {
    glyph: '04',
    title: 'No lock-in, no dark patterns',
    body: 'Cancel from your account in two clicks — no “call to retain,” no hidden downgrade path. Your certificates keep resolving at their public links after you leave; proof you earned stays yours. We’d rather you stay because the loop is working than because leaving is annoying.',
  },
]

const mono = { fontFamily: 'var(--font-mono), monospace' } as const

export default async function GuaranteePage() {
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
          {t('The ship-proof guarantee, without the fine-print games.')}
        </h1>
        <p style={{ margin: '18px 0 0', color: '#9C9CA6', fontSize: 17, maxWidth: '60ch' }}>
          {t('We sell verifiable skill, not a certificate you frame and forget. Our proof is honest enough that we can put money on it. Here is exactly what a membership promises, what it doesn’t, and how refunds work.')}
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
            {t('A job, or a paper credential that impresses on its own. Hiring involves luck, timing, and people we don’t control — and the industry is drowning in certificates that mean nothing. We promise the thing we can measure and you can show: real, code-verifiable proof that you can build — or you don’t pay.')}
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
