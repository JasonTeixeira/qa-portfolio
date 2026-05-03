import type { Metadata } from 'next'
import { HowItWorksContent } from './how-it-works-content'

export const metadata: Metadata = {
  title: 'How it works — Sage Ideas',
  description:
    'Visual pipelines for every Sage Ideas service. See exactly how each engagement runs from the free intro chat through scope, build, handoff, and optional Care.',
  openGraph: {
    images: [
      '/og?title=How+It+Works&subtitle=Visual+pipelines+for+every+service+%E2%80%94+from+intro+chat+to+handoff.',
    ],
  },
}

export default function HowItWorksPage() {
  return <HowItWorksContent />
}
