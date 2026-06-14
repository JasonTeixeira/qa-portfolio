import type { Metadata } from 'next'
import { ServicesEl } from './services-el'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Thirty-plus engagements from Sage Ideas: productized engineering and QA tiers, AI reliability audits, RAG and agent ops, automation pipelines, customer-facing AI products, productized retainers, diagnostic on-ramps, and a 90-day done-for-you bundle. Fixed scope, transparent pricing, custom welcome.',
  alternates: { canonical: `${SITE}/services` },
  openGraph: {
    title: 'Services',
    description: 'Engineering, QA, AI, and automation engagements. Fixed scope. Custom welcome.',
    images: [{ url: '/og?title=Services&subtitle=Engineering%2C+AI%2C+automation%2C+and+retainers.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Services&subtitle=Engineering%2C+AI%2C+automation%2C+and+retainers.'],
  },
}

export default function ServicesPage() {
  return <ServicesEl />
}
