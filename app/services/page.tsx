import type { Metadata } from 'next'
import { RouteFinderHeroExperiment } from '@/components/cro/RouteFinderHeroExperiment'
import { ServicesEl } from './services-el'
import { JsonLd } from '@/components/json-ld'
import { buildCollectionPage } from '@/lib/seo/jsonld'
import { tiers } from '@/data/services/tiers'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'AI Systems, Lead Engines, and Conversion Website Services | Sage Ideas',
  description:
    'Build the system around the business outcome: more leads, qualified quote requests, automated intake, AI support, and conversion websites with working demos.',
  alternates: { canonical: `${SITE}/services` },
  openGraph: {
    title: 'AI Systems, Lead Engines, and Conversion Website Services',
    description: 'See the outcome, open the proof, then scope the build.',
    images: [{ url: '/og?title=Services&subtitle=AI%20systems%2C%20lead%20engines%2C%20and%20conversion%20websites.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Services&subtitle=AI%20systems%2C%20lead%20engines%2C%20and%20conversion%20websites.'],
  },
}

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          buildCollectionPage({
            name: 'AI Engineering & Studio Services',
            description:
              'Fixed-scope, fixed-price studio engagements — AI reliability audits, RAG & agent ops, automation, and full-stack product builds.',
            url: `${SITE}/services`,
            itemUrls: tiers.map((t) => `${SITE}/services/${t.slug}`),
          }),
        ]}
      />
      <div className="px-5 pt-6 sm:px-8 lg:px-12">
        <RouteFinderHeroExperiment surface="services" />
      </div>
      <ServicesEl />
    </>
  )
}
