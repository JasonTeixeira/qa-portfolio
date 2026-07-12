import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Minus } from 'lucide-react'
import {
  ConversionMap,
  MotionProofStrip,
  SystemHeroPanel,
} from '@/components/living/LivingPageSystem'
import { comparisons } from '@/data/compare/comparisons'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/compare' },
  title: 'Compare Sage Ideas — vs in-house, Big-4, and AI platforms',
  description:
    'Honest comparisons between Sage Ideas Studio and the alternatives most teams actually consider: in-house hires, Big-4 consultancies, and off-the-shelf AI platforms.',
  openGraph: {
    title: 'Compare Sage Ideas | Sage Ideas',
    description:
      'How a boutique studio compares to in-house hires, Big-4 firms, and AI platforms.',
    images: ['/og?title=Compare+Sage.&subtitle=Honest+tradeoffs.'],
  },
}

export default function CompareIndexPage() {
  return (
    <main className="min-h-screen bg-[var(--sage-bg)] text-[var(--sage-ink)]">
      <section className="border-b border-[var(--sage-border)] px-5 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-24 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                Compare · honest tradeoffs
              </p>
              <h1
                className="max-w-[11ch] text-[clamp(3.2rem,_1.2rem_+_8vw,_7.6rem)] font-extrabold"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.98,
                }}
              >
                Sage Ideas vs the alternatives.
              </h1>
              <p className="mt-8 max-w-[58ch] text-lg leading-[1.6] text-[var(--sage-ink-muted)] sm:text-xl">
                We are not the right fit for everyone. These pages compare the studio
                against the alternatives buyers actually consider, including where the
                other side wins.
              </p>
            </div>
            <SystemHeroPanel
              eyebrow="decision graph"
              title="Compare Sage Ideas"
              nodes={['Sage', 'Hire', 'Platform', 'Fit']}
              stats={[
                { label: 'comparisons', value: String(comparisons.length).padStart(2, '0') },
                { label: 'posture', value: 'honest' },
                { label: 'route', value: 'fit' },
              ]}
            />
          </div>

          <div className="mt-12">
            <MotionProofStrip
              items={[
                { label: 'comparison pages', value: String(comparisons.length) },
                { label: 'buyer mode', value: 'research' },
                { label: 'sales posture', value: 'clear' },
                { label: 'next action', value: 'route' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--sage-border)] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              Decision paths
            </p>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)] sm:block">
              No strawmen
            </p>
          </div>
          <div className="grid gap-px bg-[var(--sage-border)] lg:grid-cols-3">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="group flex min-h-[430px] flex-col bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)]"
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                  vs
                </span>
                <h2 className="mt-6 text-2xl font-semibold leading-tight text-[var(--sage-ink)]">
                  {c.competitorShort}
                </h2>
                <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">{c.tagline}</p>
              </div>

              <div className="my-8 overflow-hidden border border-[var(--sage-border)]">
                {c.rows.slice(0, 3).map((row) => (
                  <div
                    key={row.dimension}
                    className="flex items-center justify-between gap-3 border-b border-[var(--sage-border)] bg-[var(--sage-bg)] px-3 py-2 text-xs last:border-b-0"
                  >
                    <span className="min-w-0 flex-1 truncate text-[var(--sage-ink-muted)]">{row.dimension}</span>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      {row.edge === 'sage' ? (
                        <Check className="h-3.5 w-3.5 text-[var(--sage-accent-readable)]" />
                      ) : row.edge === 'tie' ? (
                        <Minus className="h-3.5 w-3.5 text-[var(--sage-ink-faint)]" />
                      ) : (
                        <Minus className="h-3.5 w-3.5 text-[#FF2D9B]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--sage-accent-readable)]">
                Read full comparison
                <ArrowRight className="h-3.5 w-3.5 transition-all group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <ConversionMap
            steps={[
              { label: 'Compare', detail: 'Read the actual alternative instead of a strawman.' },
              { label: 'Fit', detail: 'See where Sage wins and where another option is better.' },
              { label: 'Route', detail: 'Move into the matching service page only when the shape fits.' },
              { label: 'Decide', detail: 'Book a call with the comparison context already handled.' },
            ]}
          />
        </div>
      </section>
    </main>
  )
}
