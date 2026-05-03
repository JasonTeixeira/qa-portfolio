import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { careTiersBySlug } from '@/data/services/tiers'
import { CarePageContent } from '../_care/care-page-content'

const SITE = 'https://sageideas.dev'
const SLUG = 'site-care'

export async function generateMetadata(): Promise<Metadata> {
  const care = careTiersBySlug[SLUG]
  if (!care) return { title: 'Not Found' }

  const title = `${care.name} — ${care.price}/mo | Sage Ideas`
  const description = care.description
  const ogTitle = encodeURIComponent(care.name)
  const ogSubtitle = encodeURIComponent(care.tagline)

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/services/${care.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE}/services/${care.slug}`,
      images: [{ url: `/og?title=${ogTitle}&subtitle=${ogSubtitle}` }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`/og?title=${ogTitle}&subtitle=${ogSubtitle}`],
    },
  }
}

export default function SiteCarePage() {
  const care = careTiersBySlug[SLUG]
  if (!care) notFound()

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: care.name,
    description: care.description,
    serviceType: care.capability,
    provider: {
      '@type': 'Organization',
      name: 'Sage Ideas LLC',
      url: SITE,
    },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    offers: {
      '@type': 'Offer',
      price: (care.priceCents / 100).toFixed(2),
      priceCurrency: 'USD',
      url: `${SITE}/services/${care.slug}`,
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: (care.priceCents / 100).toFixed(2),
        priceCurrency: 'USD',
        unitCode: 'MON',
        billingDuration: 'P1M',
      },
    },
    url: `${SITE}/services/${care.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <CarePageContent care={care} />
    </>
  )
}
