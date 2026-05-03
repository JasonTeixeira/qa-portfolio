import type { Metadata } from 'next'
import { verticals } from '@/data/industries/verticals'
import { IndustriesIndexContent } from './industries-index-content'

const SITE = 'https://sageideas.dev'

export const metadata: Metadata = {
  title: 'Industries — Sage Ideas',
  description:
    'Sage Ideas industry expertise: fintech, SaaS, ecommerce, healthcare, and AI startups. Productized engagements tuned to the operational realities of each vertical.',
  alternates: { canonical: `${SITE}/industries` },
  openGraph: {
    title: 'Industries — Sage Ideas',
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
  return <IndustriesIndexContent verticals={verticals} />
}
