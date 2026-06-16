import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tiers, tiersBySlug } from '@/data/services/tiers'
import {
  extendedTiers,
  extendedTiersBySlug,
  type ExtendedTier,
} from '@/data/services/extended'
import { FlagshipPageContent } from './flagship-page-content'
import { ServiceDetail } from '@/components/el/services'
import { getServiceTier } from '@/data/services/tier-classification'
import { StickyCta } from '@/components/sticky-cta'
import { ServiceViewTracker } from '@/components/analytics/service-view-tracker'
import { DynamicRouteDeepening } from '@/components/living/DynamicRouteDeepening'

type Params = { slug: string }

const SITE = 'https://www.sageideas.dev'

export function generateStaticParams(): Params[] {
  return [
    ...tiers.map((tier) => ({ slug: tier.slug })),
    ...extendedTiers.map((tier) => ({ slug: tier.slug })),
  ]
}

function resolveTier(slug: string) {
  return tiersBySlug[slug] ?? extendedTiersBySlug[slug]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const tier = resolveTier(slug)
  if (!tier) return { title: 'Not Found' }

  // NOTE: layout title template appends ' — Sage Ideas' automatically
  const title = `${tier.name} — ${tier.price}`
  const description = tier.description
  const ogTitle = encodeURIComponent(tier.name)
  const ogSubtitle = encodeURIComponent(tier.tagline)

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/services/${tier.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE}/services/${tier.slug}`,
      images: [{ url: `/og?title=${ogTitle}&subtitle=${ogSubtitle}` }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/og?title=${ogTitle}&subtitle=${ogSubtitle}`],
    },
  }
}

export default async function TierPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const tier = resolveTier(slug)
  if (!tier) notFound()

  // Schema.org Service JSON-LD
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: tier.name,
    description: tier.schemaSummary ?? tier.description,
    serviceType: tier.capability,
    provider: {
      '@type': 'Organization',
      name: 'Sage Ideas LLC',
      url: SITE,
    },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    offers: {
      '@type': 'Offer',
      price: tier.priceCents > 0 ? (tier.priceCents / 100).toFixed(2) : undefined,
      priceCurrency: 'USD',
      url: `${SITE}/services/${tier.slug}`,
      availability: 'https://schema.org/InStock',
      ...(tier.cadence === 'monthly'
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: (tier.priceCents / 100).toFixed(2),
              priceCurrency: 'USD',
              unitCode: 'MON',
              billingDuration: 'P1M',
            },
          }
        : {}),
    },
    url: `${SITE}/services/${tier.slug}`,
  }

  // FAQPage JSON-LD if there are FAQs
  const faqSchema =
    tier.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: tier.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        }
      : null
  const serviceTier = getServiceTier(tier)
  const architectureSteps =
    tier.phases.length > 0
      ? tier.phases.slice(0, 4).map((phase) => ({
          label: phase.title,
          detail: phase.description,
        }))
      : tier.deliverables.slice(0, 4).map((deliverable) => ({
          label: deliverable,
          detail: 'A concrete artifact that moves from strategy into production ownership.',
        }))
  const conversionSteps = [
    {
      label: 'Diagnose',
      detail: `Confirm the real ${tier.capability.toLowerCase()} constraint, current surface, and business goal before writing code.`,
    },
    {
      label: 'Design the system',
      detail: 'Turn the offer into screens, data, workflows, ownership boundaries, and a measurable delivery plan.',
    },
    {
      label: 'Ship the artifact',
      detail: `Deliver ${tier.shortName} as working code, docs, dashboards, or launch assets your team can actually use.`,
    },
    {
      label: 'Route the next move',
      detail: 'Decide whether the work becomes a one-time delivery, a care plan, or a larger product build.',
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ServiceViewTracker slug={tier.slug} />
      {serviceTier === 'flagship' ? (
        <FlagshipPageContent tier={tier as ExtendedTier} />
      ) : (
        <ServiceDetail tier={tier} />
      )}
      <DynamicRouteDeepening
        eyebrow={`${tier.capability} system`}
        title="From offer to operating system."
        body={`${tier.name} is presented as a real engagement, not a generic service page: the surface, backend shape, delivery artifacts, and conversion path are all visible before the first call.`}
        nodes={[tier.shortName, tier.capability, tier.mode, tier.cadence]}
        stats={[
          { label: 'price', value: tier.price },
          { label: 'timeline', value: tier.timeline },
          { label: 'tier', value: serviceTier },
        ]}
        architectureTitle="Scope ⇄ Ship"
        architectureBody="The page now exposes how the engagement moves from buyer pain to production artifact, then into measurement and next-step routing."
        architectureSteps={architectureSteps}
        conversionSteps={conversionSteps}
        assets={[
          {
            label: 'Service proof visual',
            detail: 'Add a real screenshot, deliverable preview, or dashboard capture from a shipped engagement when approved.',
          },
          {
            label: 'Founder/operator photo',
            detail: 'Use the real founder photo to reinforce principal-led delivery. No generated replacement.',
          },
          {
            label: 'Client quote or logo',
            detail: 'Add only permissioned testimonials or logos tied to this service category.',
          },
        ]}
        cta={{ label: `Scope ${tier.shortName}`, href: `/contact?engagement=${tier.slug}` }}
      />
      <StickyCta
        pitch={`Want to scope ${tier.name}?`}
        ctaLabel="Book a 30-min call"
        ctaHref={`/contact?engagement=${tier.slug}`}
      />
    </>
  )
}
