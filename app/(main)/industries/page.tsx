import type { Metadata } from 'next'
import Link from 'next/link'
import { verticals } from '@/data/industries/verticals'
import {
  ConversionMap,
  LivingDiagram,
  LivingHero,
  LivingPageShell,
  LivingSection,
  LivingCTA,
} from '@/components/living/LivingPageSystem'
import { JsonLd } from '@/components/json-ld'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Industries — Business Systems by Market',
  description:
    'Find the Sage Ideas system closest to your market: lead follow-up, quote qualification, intake automation, AI support, and conversion dashboards.',
  alternates: { canonical: `${SITE}/industries` },
  openGraph: {
    title: 'Industries — Business Systems by Market',
    description:
      'Find the interactive system closest to your market and open a working proof before the build call.',
    images: [{ url: '/og?title=Business+systems+by+market&subtitle=Open+the+demo+closest+to+your+buyer' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Business+systems+by+market&subtitle=Open+the+demo+closest+to+your+buyer'],
  },
}

export default function IndustriesPage() {
  return (
    <LivingPageShell>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Sage Ideas industries and buyer routes',
          description: metadata.description,
          url: `${SITE}/industries`,
          hasPart: verticals.map((vertical) => `${SITE}/industries/${vertical.slug}`),
        }}
      />
      <LivingHero
        eyebrow="Industries / working systems"
        title={
          <>
            Find the system closest to your market.
          </>
        }
        lede="Open the route that matches your buyer: more leads, quote requests, intake, support, or conversion. The goal is simple: show what your business could become before you book."
        panel={
          <LivingDiagram
            eyebrow="vertical graph"
            title="Market routing"
            nodes={verticals.slice(0, 4).map((v) => v.shortName)}
            stats={[
              { label: 'verticals', value: String(verticals.length).padStart(2, '0') },
              { label: 'model', value: 'demo' },
              { label: 'proof', value: 'click' },
            ]}
          />
        }
        proof={[
          { label: 'core verticals', value: String(verticals.length) },
          { label: 'entry point', value: 'demo' },
          { label: 'delivery model', value: 'build' },
          { label: 'next step', value: 'call' },
        ]}
        primaryCta={{ label: 'Open the showcase', href: '/showcase' }}
        secondaryCta={{ label: 'Book the build call', href: '/book?source=industries' }}
      />

      <LivingSection
        eyebrow="where the demos point"
        title="Pick the buyer context."
        lede="Every market loses revenue in a different place. Start with the closest route, then open the demo or book the build conversation."
      >
        <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2 lg:grid-cols-3">
          {verticals.map((vertical, index) => (
            <Link
              key={vertical.slug}
              href={`/industries/${vertical.slug}`}
              className={`group flex min-h-[360px] flex-col bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)] sm:p-7 ${index === 0 ? 'lg:col-span-2' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                  {vertical.shortName}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                  /{vertical.slug}
                </p>
              </div>
              <h2
                className="mt-8 text-3xl font-extrabold leading-none text-[var(--sage-ink)]"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
              >
                {vertical.name}
              </h2>
              <p className="mt-4 text-sm font-semibold text-[var(--sage-accent-readable)]">
                {vertical.tagline}
              </p>
              <p className="mt-5 flex-1 text-sm leading-6 text-[var(--sage-ink-muted)]">
                {vertical.intro.length > 250
                  ? `${vertical.intro.slice(0, 250).trimEnd()}...`
                  : vertical.intro}
              </p>
              <span className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--sage-accent-readable)]">
                View route
                <span aria-hidden className="transition-transform group-hover:translate-x-1">-&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="how buyers move"
        title="Each industry page should answer one question."
        lede="Can Sage Ideas understand this market well enough to show a useful working system before asking for the sale?"
      >
        <ConversionMap
          steps={[
            {
              label: 'Name the leak',
              detail: 'Show the specific missed revenue, slow follow-up, unclear intake, or support bottleneck.',
            },
            {
              label: 'Show the system',
              detail: 'Route the buyer to a visual workflow they can understand without technical explanation.',
            },
            {
              label: 'Open proof',
              detail: 'Use a live demo, screenshot, or prototype packet instead of asking them to imagine it.',
            },
            {
              label: 'Book the build',
              detail: 'Move serious visitors into a scoped conversation with the right source attached.',
            },
          ]}
        />
      </LivingSection>

      <LivingSection
        eyebrow="fit check"
        title="Do not see your exact market?"
        lede="If your business has traffic, leads, support, intake, or manual follow-up, there is probably a system worth showing before the build call."
        className="border-b-0"
      >
        <div className="flex flex-wrap gap-3">
          <LivingCTA href="/book?source=industries">Book the build call</LivingCTA>
          <LivingCTA href="/contact?source=industries" variant="secondary">Send the context</LivingCTA>
        </div>
      </LivingSection>
    </LivingPageShell>
  )
}
