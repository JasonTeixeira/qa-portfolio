import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tiers, tiersBySlug } from '@/data/services/tiers'
import { TierPageContent } from './tier-page-content'

type Params = { slug: string }

const SITE = 'https://www.sageideas.dev'

export function generateStaticParams(): Params[] {
  return tiers.map((tier) => ({ slug: tier.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const tier = tiersBySlug[slug]
  if (!tier) return { title: 'Not Found' }

  const title = `${tier.name} — ${tier.price} | Sage Ideas`
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
  const tier = tiersBySlug[slug]
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
      <TierPageContent tier={tier} />
    </>
  )
}
