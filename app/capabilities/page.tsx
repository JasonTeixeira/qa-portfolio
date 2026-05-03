import type { Metadata } from 'next'
import { CapabilitiesContent } from './capabilities-content'

const SITE = 'https://sageideas.dev'

export const metadata: Metadata = {
  title: 'Capabilities — Sage Ideas',
  description:
    'Nine productized service tiers across eight capability areas. Strategy, web, automation, SEO, content, brand, product, and platform — delivered as audits, sprints, builds, or operate engagements.',
  alternates: { canonical: `${SITE}/capabilities` },
  openGraph: {
    title: 'Capabilities — Sage Ideas',
    description:
      'Nine productized tiers across eight capabilities. Pick your service line, pick your mode.',
    images: [
      {
        url: '/og?title=Capabilities&subtitle=8+capabilities+%C2%B7+4+modes+%C2%B7+9+tiers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Capabilities&subtitle=8+capabilities+%C2%B7+4+modes+%C2%B7+9+tiers'],
  },
}

export default function CapabilitiesPage() {
  return <CapabilitiesContent />
}
