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
  title: 'Pricing — AI Engineering & Studio Retainers',
  description:
    'Fixed-scope, fixed-price tiers — from a $750 audit to full builds and retainers. AI reliability audits, RAG & agent ops, automation, and product engineering. No hourly billing.',
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: 'Pricing — AI Engineering & Studio Retainers',
    description: 'Engineering, QA, AI, automation, retainers, and bundles. Fixed price.',
    images: [{ url: '/og?title=Pricing&subtitle=Engineering%2C+AI%2C+automation%2C+retainers.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Pricing&subtitle=Engineering%2C+AI%2C+automation%2C+retainers.'],
  },
}

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[faqSchema, breadcrumbSchema]} />
      <PageViewTracker event="pricing_view" />
      <div className="px-5 pt-28 sm:px-8 lg:px-12">
        <RouteFinderHeroExperiment surface="pricing" />
      </div>
      <PricingEl />
    </>
  )
}
