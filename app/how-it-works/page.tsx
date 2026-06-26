import type { Metadata } from 'next'
import { HowItWorksContent } from './how-it-works-content'
import { JsonLd } from '@/components/json-ld'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'How It Works — See the Build Before You Buy',
  description:
    'See how Sage Ideas turns a buyer problem into a clickable concept, scoped build, tested system, and clear handoff.',
  alternates: { canonical: `${SITE}/how-it-works` },
  openGraph: {
    title: 'How It Works — See the Build Before You Buy',
    description: 'How a Sage Ideas engagement moves from buyer problem to clickable proof and tested build.',
    url: `${SITE}/how-it-works`,
    images: [
      '/og?title=See+the+build+before+you+buy&subtitle=Problem.+Prototype.+Build.+Proof.',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works — See the Build Before You Buy',
    description: 'How a Sage Ideas engagement moves from buyer problem to clickable proof and tested build.',
    images: ['/og?title=See+the+build+before+you+buy&subtitle=Problem.+Prototype.+Build.+Proof.'],
  },
}

const HOW_TO_STEPS = [
  { name: 'Build call', text: 'A 30-minute working conversation around the leak, the buyer path, and what a useful concept should show.' },
  { name: 'Visual concept', text: 'A clickable or diagrammed route that makes the future state obvious before the full build starts.' },
  { name: 'Scoped build', text: 'Written deliverables, constraints, acceptance criteria, and a fixed build path before implementation.' },
  { name: 'Verification', text: 'Screenshots, route checks, accessibility checks, and proof artifacts captured against the scope.' },
  { name: 'Handoff', text: 'Documented, deployed, transferred, and optionally operated as an improvement loop.' },
]

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How a Sage Ideas build works',
          description: 'The process from buyer problem through visual concept, scoped build, verification, and handoff.',
          step: HOW_TO_STEPS.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.name,
            text: s.text,
            url: `${SITE}/how-it-works#step-${i + 1}`,
          })),
        }}
      />
      <HowItWorksContent />
    </>
  )
}
