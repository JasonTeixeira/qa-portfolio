import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, Minus, X } from 'lucide-react'
import { comparisons } from '@/data/compare/comparisons'
import { Section, Surface, Hairline, MonoLabel, CtaLink, StatDisplay } from '@/components/el'

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = comparisons.find((x) => x.slug === slug)
  if (!c) return {}
  return {
    alternates: { canonical: `https://www.sageideas.dev/compare/${c.slug}` },
    title: `Sage Ideas vs ${c.competitorShort} — honest comparison`,
    description: c.tagline,
    openGraph: {
      title: `Sage Ideas vs ${c.competitorShort} | Sage Ideas`,
      description: c.tagline,
      images: [
        `/og?title=${encodeURIComponent(`vs ${c.competitorShort}.`)}&subtitle=${encodeURIComponent('Honest tradeoffs.')}`,
      ],
    },
  }
}

function EdgeIcon({ edge, side }: { edge: 'sage' | 'competitor' | 'tie'; side: 'sage' | 'competitor' }) {
  if (edge === 'tie') return <Minus className="h-3.5 w-3.5 text-[var(--sage-ink-faint)]" aria-hidden />
  if (edge === side) return <Check className="h-3.5 w-3.5 text-[#0ED3CF]" aria-hidden />
  return <X className="h-3.5 w-3.5 text-[var(--sage-ink-faint)]" aria-hidden />
}

export default async function CompareDetailPage({ params }: Props) {
  const { slug } = await params
  const c = comparisons.find((x) => x.slug === slug)
  if (!c) notFound()

  const sageWins = c.rows.filter((r) => r.edge === 'sage').length
  const compWins = c.rows.filter((r) => r.edge === 'competitor').length
  const ties = c.rows.filter((r) => r.edge === 'tie').length

  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* Back nav */}
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] hover:text-[var(--sage-ink)] transition-colors mb-8 [font-family:var(--font-mono),ui-monospace,monospace]"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          All comparisons
        </Link>

        {/* Hero header */}
        <header className="mb-12 border-t border-[var(--sage-border)] pt-8">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">01</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">// comparison</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <h1
            className="text-[var(--sage-ink)] font-normal text-[clamp(2rem,1rem+3.5vw,4rem)]"
            style={HEADING_STYLE}
          >
            Sage Ideas{' '}
            <span className="text-[var(--sage-ink-faint)]">vs</span>{' '}
            <em className="not-italic text-[#0ED3CF]">{c.competitorShort}.</em>
          </h1>
          <p className="mt-4 text-base text-[var(--sage-ink-muted)] leading-relaxed">{c.tagline}</p>
          <p className="mt-3 text-sm text-[var(--sage-ink-faint)] leading-relaxed max-w-2xl">{c.intro}</p>
        </header>

        {/* Tally strip */}
        <section aria-label="Comparison tally" className="mb-10">
          <StatDisplay
            stats={[
              { value: String(sageWins), label: 'Sage wins' },
              { value: String(ties), label: 'Tied / depends' },
              { value: String(compWins), label: `${c.competitorShort} wins` },
            ]}
            columns={3}
          />
        </section>

        {/* Comparison table */}
        <section aria-label="Side by side comparison" className="mb-12">
          <div className="mb-7 flex items-center gap-4">
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">// side by side</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <div className="overflow-hidden rounded-[3px] border border-[var(--sage-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--sage-surface-1)] border-b border-[var(--sage-border)]">
                  <th className="text-left p-4 w-1/3">
                    <MonoLabel tone="faint">Dimension</MonoLabel>
                  </th>
                  <th className="text-left p-4">
                    <MonoLabel tone="accent">Sage Ideas</MonoLabel>
                  </th>
                  <th className="text-left p-4">
                    <MonoLabel tone="muted">{c.competitorShort}</MonoLabel>
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row, i) => (
                  <tr
                    key={row.dimension}
                    className={[
                      i % 2 === 0 ? 'bg-[var(--sage-bg)]' : 'bg-[var(--sage-surface-1)]',
                      'border-b border-[var(--sage-border)]',
                    ].join(' ')}
                  >
                    <td className="p-4 align-top text-[var(--sage-ink)] text-sm">{row.dimension}</td>
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-2">
                        <EdgeIcon edge={row.edge} side="sage" />
                        <span className="text-[var(--sage-ink-muted)] text-sm">{row.sage}</span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-2">
                        <EdgeIcon edge={row.edge} side="competitor" />
                        <span className="text-[var(--sage-ink-muted)] text-sm">{row.competitor}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When to pick each */}
        <section aria-label="When to pick each option" className="grid gap-px sm:grid-cols-2 mb-12 rounded-[3px] overflow-hidden border border-[var(--sage-border)] bg-[var(--sage-border)]">
          <div className="bg-[var(--sage-surface-1)] p-6">
            <MonoLabel tone="muted" as="p" className="mb-3">
              Pick {c.competitorShort.toLowerCase()} when
            </MonoLabel>
            <p className="text-sm text-[var(--sage-ink-muted)] leading-relaxed">{c.whenTheyWin}</p>
          </div>
          <div className="bg-[#0ED3CF]/[0.04] border-l border-[var(--sage-border)] p-6">
            <MonoLabel tone="accent" as="p" className="mb-3">
              Pick Sage Ideas when
            </MonoLabel>
            <p className="text-sm text-[var(--sage-ink)] leading-relaxed">{c.whenWeWin}</p>
          </div>
        </section>

        {/* CTA */}
        <section
          aria-label="Next step"
          className="rounded-[3px] border border-[#0ED3CF]/30 bg-[#0ED3CF]/[0.04] p-8"
        >
          <div className="mb-7 flex items-center gap-4">
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">// still not sure?</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <h3 className="text-xl text-[var(--sage-ink)] mb-2" style={HEADING_STYLE}>
            Still not sure which fits?
          </h3>
          <p className="text-sm text-[var(--sage-ink-muted)] leading-relaxed mb-6">
            Take the AI Readiness Score for a personalized recommendation, or book a 30-minute
            call. We will tell you honestly whether we are the right partner.
          </p>
          <div className="flex flex-wrap gap-3">
            <CtaLink href={`/services/${c.ctaSlug}`} variant="solid" event={`cta_compare_${slug}`}>
              See the engagement
            </CtaLink>
            <CtaLink href="/lab/ai-readiness" variant="ghost" arrow={false}>
              Take the readiness score
            </CtaLink>
          </div>
        </section>
      </div>
    </div>
  )
}
