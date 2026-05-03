import type { Metadata } from 'next'
import { tiersOrdered } from '@/data/services/tiers'
import { PricingContent } from './pricing-content'

const SITE = 'https://sageideas.dev'

export const metadata: Metadata = {
  title: 'Pricing — Sage Ideas',
  description:
    'Nine productized tiers, fixed pricing, Stripe checkout. Sage Audit $1,500 · Ship $4,900 · Automate $9,900 · SEO Sprint $3,500 · Content Engine $6,500/mo · Brand Sprint $8,500 · Scale $4,900/mo · Build from $25,000 · Operate $7,500/mo.',
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: 'Pricing — Sage Ideas',
    description: 'Nine productized tiers. Fixed price. No asterisks.',
    images: [{ url: '/og?title=Pricing&subtitle=Nine+tiers.+Fixed+price.+No+asterisks.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Pricing&subtitle=Nine+tiers.+Fixed+price.+No+asterisks.'],
  },
}

export default function PricingPage() {
  return <PricingContent tiers={tiersOrdered} />
}
