import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ConversionMap,
  LivingDiagram,
  LivingHero,
  LivingPageShell,
  LivingSection,
  LivingCTA,
} from '@/components/living/LivingPageSystem'
import { getLegacyServiceAlias } from '@/data/services/legacy-aliases'

const SITE = 'https://www.sageideas.dev'

export function legacyServiceAliasMetadata(slug: string): Metadata {
  const service = getLegacyServiceAlias(slug)

  if (!service) {
    return {
      title: 'Service',
      alternates: { canonical: `${SITE}/services` },
    }
  }

  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: `${SITE}/services/${service.slug}` },
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      images: [
        {
          url: `/og?title=${encodeURIComponent(service.title)}&subtitle=${encodeURIComponent(service.eyebrow)}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [
        `/og?title=${encodeURIComponent(service.title)}&subtitle=${encodeURIComponent(service.eyebrow)}`,
      ],
    },
  }
}

export function LegacyServiceAliasPage({ slug }: { slug: string }) {
  const service = getLegacyServiceAlias(slug)

  if (!service) {
    return (
      <LivingPageShell>
        <LivingHero
          eyebrow="Service"
          title="Service not found."
          lede="This legacy service route does not have a current offer map. Start from the full services catalog."
          primaryCta={{ label: 'View services', href: '/services' }}
          panel={<LivingDiagram eyebrow="route missing" title="Fallback" />}
        />
      </LivingPageShell>
    )
  }

  return (
    <LivingPageShell>
      <LivingHero
        eyebrow={service.eyebrow}
        title={service.title}
        lede={service.description}
        panel={
          <LivingDiagram
            eyebrow="service graph"
            title={service.title}
            nodes={service.nodes}
            stats={[
              { label: 'entry', value: 'SEO' },
              { label: 'surface', value: 'Living' },
              { label: 'route', value: 'fit' },
            ]}
          />
        }
        proof={service.proof}
        primaryCta={{ label: 'Book a fit call', href: service.primaryHref ?? '/book' }}
        secondaryCta={{ label: 'View all services', href: service.secondaryHref ?? '/services' }}
      />

      <LivingSection
        eyebrow="outcomes"
        title="What this route should clarify."
        lede="These older SEO entry points now behave like premium routing pages: they name the problem, show the system, and move qualified buyers into the right current offer."
      >
        <ConversionMap
          steps={service.outcomes.map((outcome, index) => ({
            label: ['Diagnose', 'Design', 'Build', 'Operate'][index] ?? `Step ${index + 1}`,
            detail: outcome,
          }))}
        />
      </LivingSection>

      <LivingSection
        eyebrow="capabilities"
        title="The system underneath."
        lede="No decorative agency filler. Each card maps to an implementation surface that can be scoped, shipped, tested, and operated."
      >
        <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-3">
          {service.capabilities.map((capability, index) => (
            <article
              key={capability.title}
              className="min-h-[280px] bg-[var(--sage-surface-1)] p-6"
            >
              <p className="font-mono text-xs text-[var(--sage-accent-readable)]">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-8 text-2xl font-semibold leading-tight text-[var(--sage-ink)]">
                {capability.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">
                {capability.description}
              </p>
            </article>
          ))}
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="next routes"
        title="Keep moving through the system."
        lede="The right next page depends on buyer intent: service fit, proof, or a direct call."
      >
        <div className="grid gap-px bg-[var(--sage-border)] md:grid-cols-3">
          {service.resources.map((resource) => (
            <Link
              key={resource.href}
              href={resource.href}
              className="group min-h-[220px] bg-[var(--sage-surface-1)] p-6 transition-colors hover:bg-[var(--sage-surface-2)]"
            >
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                {resource.type}
              </p>
              <h2 className="mt-8 text-2xl font-semibold text-[var(--sage-ink)]">
                {resource.label}
              </h2>
              <span className="mt-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--sage-accent-readable)]">
                Open route
                <span aria-hidden className="transition-transform group-hover:translate-x-1">-&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </LivingSection>

      <LivingSection
        eyebrow="fit check"
        title="Bring the hard version."
        lede="If the route is close but not exact, send the context. We will tell you plainly whether this is a Sage Ideas fit."
        className="border-b-0"
      >
        <div className="flex flex-wrap gap-3">
          <LivingCTA href={service.primaryHref ?? '/book'}>Book a strategy call</LivingCTA>
          <LivingCTA href="/compare" variant="secondary">Compare the alternatives</LivingCTA>
        </div>
      </LivingSection>
    </LivingPageShell>
  )
}
