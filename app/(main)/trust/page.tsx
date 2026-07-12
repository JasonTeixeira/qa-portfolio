import type { Metadata } from 'next'
import { TrustContent } from './trust-content'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/trust' },
  title: 'Trust and Proof for Sage Ideas Builds',
  description:
    'See how Sage Ideas backs business builds with public work, clear scope, testing standards, data handling, references, and written engagement terms.',
  openGraph: {
    title: 'Trust and Proof for Sage Ideas Builds',
    description: 'What gets tested, documented, and put in writing before you buy.',
    images: ['/og?title=Trust%20and%20Proof&subtitle=What%20gets%20tested%2C%20documented%2C%20and%20put%20in%20writing.'],
  },
}

export default function TrustPage() {
  return <TrustContent />
}
