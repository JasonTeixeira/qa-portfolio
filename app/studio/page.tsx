import type { Metadata } from 'next'
import { StudioAnimations } from './studio-animations'

export const metadata: Metadata = {
  alternates: { canonical: 'https://sageideas.dev/studio' },
  title: 'Studio',
  description:
    'Sage Ideas is an AI-native software studio founded by Jason Teixeira in Orlando, FL. Two degrees, nine certifications, five years in fintech, and six live products.',
  openGraph: {
    title: 'The Studio — Sage Ideas',
    description: 'How Sage Ideas works, what we build, and why the studio is small by design.',
    images: ['/og?title=The+Studio&subtitle=Built+on+purpose.'],
  },
}

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <StudioAnimations />
    </div>
  )
}
