import type { Metadata } from 'next'
import { ProcessContent } from './process-content'
import { JsonLd } from '@/components/json-ld'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'Process — From Business Leak to Working System',
  description:
    'How Sage Ideas turns a business leak into a visible prototype, scoped build, tested system, and handoff path.',
  alternates: { canonical: `${SITE}/process` },
  openGraph: {
    title: 'Process — From Business Leak to Working System',
    description: 'Diagnose the leak, show the workflow, build the system, and prove the route.',
    url: `${SITE}/process`,
    images: ['/og?title=From+business+leak+to+working+system&subtitle=Diagnose.+Prototype.+Build.+Prove.'],
  },
}

export default function ProcessPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Sage Ideas business system build process',
          provider: { '@type': 'Organization', name: 'Sage Ideas', url: SITE },
          url: `${SITE}/process`,
          description: metadata.description,
          areaServed: 'US',
          serviceType: 'Interactive business system design and build',
        }}
      />
      <ProcessContent />
    </>
  )
}
