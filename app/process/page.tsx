import type { Metadata } from 'next'
import { ProcessContent } from './process-content'

export const metadata: Metadata = {
  title: 'Process — Sage Ideas',
  description:
    'The Sage Ideas methodology: Discover → Architect → Build → Operate. Four steps, no surprises. Every engagement follows the same production-grade process.',
  alternates: { canonical: 'https://sageideas.dev/process' },
  openGraph: {
    url: 'https://sageideas.dev/process',
    images: ['/og?title=Four+Steps.+No+Surprises.&subtitle=The+Sage+Ideas+methodology.'],
  },
}

export default function ProcessPage() {
  return <ProcessContent />
}
