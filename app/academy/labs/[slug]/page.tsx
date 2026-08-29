import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AcademyNav, AcademyFooter } from '@/components/academy/landing/AcademyChrome'
import { LABS, labBySlug, LAB_TRACKS } from '@/data/academy/labs'
import { getT } from '@/lib/i18n/t'
import { getLocale } from '@/lib/i18n/server'
import { localizedAlternates } from '@/lib/i18n/alternates'

const INK = '#F2EFE9'
const DIM = '#B6B6C0'
const FAINT = '#5A5A64'
const LINE = '#1E1E24'
const BLUE = '#3D5AFE'
const GREEN = '#18B663'
const ACCENT_INK = '#8FA0FF'

const mono = { fontFamily: 'var(--font-mono), monospace' } as const
const serif = { fontFamily: 'var(--font-serif), Georgia, serif' } as const

const DIFFICULTY_LABEL = ['', 'Starter', 'Applied', 'Working', 'Advanced', 'Senior'] as const
const CHECK_KIND: Record<string, string> = { test: 'automated test', output: 'checked output', artifact: 'artifact', review: 'reviewed' }

export function generateStaticParams() {
  return LABS.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lab = labBySlug(slug)
  const locale = await getLocale()
  if (!lab) return { title: 'Lab — Sage Academy' }
  return {
    title: `${lab.title} — Sage Labs`,
    description: lab.whatYouBuild,
    alternates: localizedAlternates(`/academy/labs/${slug}`, locale),
    openGraph: {
      title: lab.title,
      description: lab.tagline,
      images: [`/og?title=${encodeURIComponent(lab.title)}&subtitle=Sage+Labs`],
    },
  }
}

export default async function LabDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lab = labBySlug(slug)
  if (!lab) notFound()
  const t = await getT()
  const track = LAB_TRACKS[lab.track]

  const kicker: React.CSSProperties = { ...mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: ACCENT_INK }
  const h2: React.CSSProperties = { ...serif, margin: '10px 0 0', fontWeight: 600, fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.08, letterSpacing: '-0.02em' }
  const sectionWrap: React.CSSProperties = { borderTop: `1px solid ${LINE}` }
  const inner: React.CSSProperties = { maxWidth: 820, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(20px, 4vw, 48px)' }

  return (
    <>
      <AcademyNav />
      <div style={{ background: '#0B0B0E', color: INK, fontFamily: 'var(--font-sans), sans-serif', overflowX: 'clip' }}>
        <main>
          {/* Header / work order */}
          <header style={{ ...inner, backgroundImage: 'radial-gradient(90% 60% at 20% -10%, rgba(61,90,254,0.10) 0%, transparent 60%)' }}>
            <div style={{ ...mono, fontSize: 12, color: FAINT }}>
              <Link href="/academy/labs" style={{ color: ACCENT_INK, textDecoration: 'none' }}>{t('The Labs')}</Link> / {track.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
              <span style={{ ...mono, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: track.tint }}>{track.label}</span>
              <span aria-hidden style={{ color: FAINT }}>·</span>
              <span style={{ ...mono, fontSize: 11, color: DIM }}>{DIFFICULTY_LABEL[lab.difficulty]}</span>
              <span aria-hidden style={{ color: FAINT }}>·</span>
              <span style={{ ...mono, fontSize: 11, color: DIM }}>~{lab.hours}h</span>
            </div>
            <h1 style={{ ...serif, margin: '16px 0 0', fontWeight: 600, fontSize: 'clamp(34px, 5vw, 60px)', lineHeight: 1.0, letterSpacing: '-0.028em', textWrap: 'balance' }}>
              {lab.title}
            </h1>
            <p style={{ margin: '20px 0 0', fontSize: 18, lineHeight: 1.6, color: DIM, textWrap: 'pretty' }}>{lab.whatYouBuild}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
              <Link href="/academy/signup" style={{ display: 'inline-flex', background: BLUE, color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: '14px 26px', borderRadius: 24, boxShadow: '0 0 22px rgba(61,90,254,0.3)' }}>
                {lab.interactive ? t('Open the build') : t('Start this build')}
              </Link>
            </div>
          </header>

          {/* What it proves */}
          <section style={sectionWrap}>
            <div style={inner}>
              <div style={kicker}>{t('What it proves')}</div>
              <h2 style={h2}>{t('The line you can defend in an interview.')}</h2>
              <div style={{ marginTop: 22, padding: '16px 18px', borderRadius: 12, border: '1px solid rgba(24,182,99,0.25)', background: 'rgba(24,182,99,0.05)' }}>
                <div style={{ ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: GREEN, marginBottom: 8 }}>{t('Résumé line')}</div>
                <div style={{ fontSize: 16, lineHeight: 1.6, color: '#CFE9DA' }}>{lab.resumeLine}</div>
              </div>
              <ul style={{ margin: '22px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lab.proves.map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, fontSize: 15, color: DIM, lineHeight: 1.55 }}>
                    <span style={{ color: GREEN, flexShrink: 0 }} aria-hidden>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* The spec */}
          <section style={sectionWrap}>
            <div style={inner}>
              <div style={kicker}>{t('The brief')}</div>
              <h2 style={h2}>{t('What you build, step by step.')}</h2>
              <ol style={{ margin: '24px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {lab.spec.map((s, i) => (
                  <li key={i} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                    <span style={{ ...mono, fontSize: 12, color: track.tint, flexShrink: 0, minWidth: 24 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: 15.5, color: INK, lineHeight: 1.6 }}>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Acceptance checks — the proof */}
          <section style={sectionWrap}>
            <div style={inner}>
              <div style={kicker}>{t('The proof')}</div>
              <h2 style={h2}>{t('It’s done when these pass.')}</h2>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {lab.acceptanceChecks.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', border: `1px solid ${LINE}`, borderRadius: 12, background: '#0E0E12', padding: '16px 18px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, marginTop: 6, flexShrink: 0 }} aria-hidden />
                    <div>
                      <div style={{ fontSize: 15, color: INK, lineHeight: 1.5 }}>{c.label}</div>
                      <div style={{ ...mono, fontSize: 10.5, color: FAINT, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{CHECK_KIND[c.kind] || c.kind}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Meta: stack, phases, prerequisites, artifact */}
          <section style={sectionWrap}>
            <div style={{ ...inner, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 28 }}>
              <div>
                <div style={{ ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: FAINT }}>{t('Stack')}</div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {lab.stack.map((s) => (
                    <span key={s} style={{ ...mono, fontSize: 11.5, color: DIM, border: `1px solid ${LINE}`, borderRadius: 8, padding: '5px 10px' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: FAINT }}>{t('Sage Method')}</div>
                <div style={{ ...mono, marginTop: 12, fontSize: 12.5, color: ACCENT_INK }}>{lab.phases.join(' → ')}</div>
              </div>
              <div>
                <div style={{ ...mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: FAINT }}>{t('You keep')}</div>
                <div style={{ marginTop: 10, fontSize: 14, color: DIM, lineHeight: 1.5 }}>{lab.artifact}</div>
              </div>
            </div>
          </section>

          {/* CTA back */}
          <section style={{ ...sectionWrap, background: '#0D0D11' }}>
            <div style={{ ...inner, textAlign: 'center' }}>
              <Link href="/academy/labs" style={{ ...mono, fontSize: 13, color: ACCENT_INK, textDecoration: 'none' }}>{t('← Back to all builds')}</Link>
            </div>
          </section>
        </main>
      </div>
      <AcademyFooter />
    </>
  )
}
