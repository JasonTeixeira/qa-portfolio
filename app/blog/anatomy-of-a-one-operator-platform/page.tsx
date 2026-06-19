import type { Metadata } from 'next'
import { TeardownContent } from './teardown-content'

const SITE = 'https://www.sageideas.dev'
const PATH = '/blog/anatomy-of-a-one-operator-platform'

export const metadata: Metadata = {
  title: 'Anatomy of a One-Operator Platform',
  description:
    'How one person shipped Nexural — a 185-table institutional trading platform with real-time execution, a Discord-native AI bot, and idempotent Stripe billing. The architecture had to be right before anything else could exist.',
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: {
    type: 'article',
    title: 'Anatomy of a One-Operator Platform',
    description:
      '185 database tables. 69 API endpoints. Built and run by one person. A build-record teardown of the Nexural trading platform.',
    url: `${SITE}${PATH}`,
    images: [{ url: '/og?title=Anatomy+of+a+One-Operator+Platform&subtitle=185+tables.+69+endpoints.+One+operator.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anatomy of a One-Operator Platform',
    images: ['/og?title=Anatomy+of+a+One-Operator+Platform&subtitle=185+tables.+69+endpoints.+One+operator.'],
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Anatomy of a One-Operator Platform',
  description:
    'A build-record teardown of Nexural — a 185-table institutional trading platform built and operated by one person.',
  author: { '@type': 'Person', name: 'Jason Teixeira' },
  publisher: { '@type': 'Organization', name: 'Sage Ideas' },
  mainEntityOfPage: `${SITE}${PATH}`,
}

export default function AnatomyOfAOneOperatorPlatformPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <TeardownContent />
    </>
  )
}
