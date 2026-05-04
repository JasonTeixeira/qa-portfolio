import type { Metadata } from 'next'
import { tiersOrdered } from '@/data/services/tiers'
import { pricingFaq } from '@/data/services/pricing-faq'
import { PricingContent } from './pricing-content'
import { JsonLd } from '@/components/json-ld'

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
  title: 'Pricing',
  description:
    'Nine productized tiers, fixed pricing, Stripe checkout. Sage Audit $1,500 · Ship $4,900 · Automate $9,900 · SEO Sprint $3,500 · Content Engine $6,500/mo · Brand Sprint $8,500 · Scale $4,900/mo · Build from $25,000 · Operate $7,500/mo.',
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: 'Pricing',
    description: 'Nine productized tiers. Fixed price. No asterisks.',
    images: [{ url: '/og?title=Pricing&subtitle=Nine+tiers.+Fixed+price.+No+asterisks.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Pricing&subtitle=Nine+tiers.+Fixed+price.+No+asterisks.'],
  },
}

export default function PricingPage() {
  return (
    <>
      <JsonLd data={[faqSchema, breadcrumbSchema]} />
      <PricingContent tiers={tiersOrdered} />
    </>
  )
}
