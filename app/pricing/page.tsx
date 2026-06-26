import type { Metadata } from 'next'
import { pricingFaq } from '@/data/services/pricing-faq'
import { PricingEl } from './pricing-el'
import { JsonLd } from '@/components/json-ld'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'
import { RouteFinderHeroExperiment } from '@/components/cro/RouteFinderHeroExperiment'

const SITE = 'https://www.sageideas.dev'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: pricingFaq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
    { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${SITE}/pricing` },
  ],
}

export const metadata: Metadata = {
  title: 'Pricing for AI Systems, Conversion Sites, and Build Sprints | Sage Ideas',
  description:
    'Fixed-scope pricing for audits, conversion sites, AI workflow builds, prototype-led sales systems, and ongoing care. Book the call when the route is clear.',
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: 'Pricing for AI Systems and Conversion Builds',
    description: 'See the route, understand the scope, and book the build call.',
    images: [{ url: '/og?title=Pricing&subtitle=Fixed%20scope%20for%20AI%20systems%20and%20conversion%20builds.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Pricing&subtitle=Fixed%20scope%20for%20AI%20systems%20and%20conversion%20builds.'],
  },
}

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[faqSchema, breadcrumbSchema]} />
      <PageViewTracker event="pricing_view" />
      <div className="px-5 pt-4 sm:px-8 lg:px-12">
        <RouteFinderHeroExperiment surface="pricing" />
      </div>
      <PricingEl />
    </>
  )
}
