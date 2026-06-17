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

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Industries',
  description:
    'Sage Ideas industry expertise: fintech, SaaS, ecommerce, healthcare, and AI startups. Productized engagements tuned to the operational realities of each vertical.',
  alternates: { canonical: `${SITE}/industries` },
  openGraph: {
    title: 'Industries',
    description:
      'Sage Ideas industry expertise: fintech, SaaS, ecommerce, healthcare, AI startups.',
    images: [{ url: '/og?title=Industries&subtitle=Five+verticals.+Operator-grade+execution.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Industries&subtitle=Five+verticals.+Operator-grade+execution.'],
  },
}

export default function IndustriesPage() {
  return (
    <LivingPageShell>
      <LivingHero
        eyebrow="Industries / operator-grade systems"
        title={
          <>
            Vertical depth without the agency theater.
          </>
        }
        lede="Sage Ideas goes deepest where the work has real operational edge: fintech, SaaS, e-commerce, healthcare, and AI-native teams. Each vertical routes into the same product, AI, brand, and growth system."
        panel={
          <LivingDiagram
            eyebrow="vertical graph"
            title="Industry routing"
            nodes={verticals.slice(0, 4).map((v) => v.shortName)}
            stats={[
              { label: 'verticals', value: String(verticals.length).padStart(2, '0') },
              { label: 'model', value: 'systems' },
              { label: 'proof', value: 'shipped' },
            ]}
          />
        }
        proof={[
          { label: 'core verticals', value: String(verticals.length) },
          { label: 'entry point', value: 'audit' },
          { label: 'delivery model', value: 'build' },
          { label: 'positioning', value: 'honest' },
        ]}
        primaryCta={{ label: 'Book a fit call', href: '/book' }}
        secondaryCta={{ label: 'Compare services', href: '/services' }}
      />

      <LivingSection
        eyebrow="where we go deep"
        title="Pick the operating context."
        lede="The work is not one-size-fits-all. Money-moving products, multi-tenant SaaS, DTC storefronts, healthcare workflows, and AI-native startups all break in different places."
      >
        <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-2 xl:grid-cols-5">
          {verticals.map((vertical) => (
            <Link
              key={vertical.slug}
              href={`/industries/${vertical.slug}`}
              className="group flex min-h-[360px] flex-col bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)]"
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
                View system
                <span aria-hidden className="transition-transform group-hover:translate-x-1">-&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="how the page should convert"
        title="Industry pages are routing surfaces."
        lede="Each vertical exists to clarify the problem, prove we understand the failure modes, and move the visitor into the right engagement without fake proof or generic claims."
      >
        <ConversionMap
          steps={[
            {
              label: 'Name the context',
              detail: 'Show the industry-specific problem before pitching the service catalog.',
            },
            {
              label: 'Expose the failure modes',
              detail: 'Use concrete risks: webhooks, tenant boundaries, checkout friction, PHI, eval drift.',
            },
            {
              label: 'Route the offer',
              detail: 'Move buyers to Audit, Build, Operate, SEO, or Academy based on their actual constraint.',
            },
            {
              label: 'Capture intent',
              detail: 'Book a fit call when the problem is complex, or send the reader deeper into services.',
            },
          ]}
        />
      </LivingSection>

      <LivingSection
        eyebrow="fit check"
        title="Industry not listed?"
        lede="That does not automatically disqualify the project. The real question is whether the work needs a product-minded operator who can connect software, AI, brand, and growth."
        className="border-b-0"
      >
        <div className="flex flex-wrap gap-3">
          <LivingCTA href="/book">Book a strategy call</LivingCTA>
          <LivingCTA href="/contact" variant="secondary">Send the context</LivingCTA>
        </div>
      </LivingSection>
    </LivingPageShell>
  )
}
