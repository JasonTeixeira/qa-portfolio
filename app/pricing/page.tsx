import type { Metadata } from 'next'
import { tiers } from '@/data/services/tiers'
import { PricingContent } from './pricing-content'

export const metadata: Metadata = {
  title: 'Pricing — Sage Ideas',
  description:
    'Six productized tiers, fixed pricing, Stripe checkout. Sage Audit $1,500 · Ship $4,900 · Automate $9,900 · Scale $4,900/mo · Build from $25,000 · Operate $7,500/mo.',
  openGraph: {
    title: 'Pricing — Sage Ideas',
    description: 'Fixed price. No asterisks.',
    images: [{ url: '/og?title=Pricing&subtitle=Fixed+price.+No+asterisks.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Pricing&subtitle=Fixed+price.+No+asterisks.'],
  },
}

export default function PricingPage() {
  return <PricingContent tiers={tiers} />
}
