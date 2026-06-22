import type { Metadata } from 'next'
import { RouteFinderHeroExperiment } from '@/components/cro/RouteFinderHeroExperiment'
import { ServicesEl } from './services-el'
import { JsonLd } from '@/components/json-ld'
import { buildCollectionPage } from '@/lib/seo/jsonld'
import { tiers } from '@/data/services/tiers'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'AI Engineering & Studio Services',
  description:
    'Fixed-scope, fixed-price studio engagements — AI reliability audits, RAG & agent ops, automation pipelines, and full-stack product builds. No hourly billing, no surprise change orders.',
  alternates: { canonical: `${SITE}/services` },
  openGraph: {
    title: 'AI Engineering & Studio Services',
    description: 'Engineering, QA, AI, and automation engagements. Fixed scope. Custom welcome.',
    images: [{ url: '/og?title=Services&subtitle=Engineering%2C+AI%2C+automation%2C+and+retainers.' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og?title=Services&subtitle=Engineering%2C+AI%2C+automation%2C+and+retainers.'],
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
