import type { Metadata } from 'next'
import { HowItWorksContent } from './how-it-works-content'
import { JsonLd } from '@/components/json-ld'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'How It Works — The Studio Process',
  description:
    'Visual pipelines for every Sage Ideas service. See exactly how each engagement runs from the free intro chat through scope, build, handoff, and optional Care.',
  alternates: { canonical: `${SITE}/how-it-works` },
  openGraph: {
    title: 'How It Works — The Studio Process',
    description: 'How each Sage Ideas engagement runs — from intro chat to scope, build, and handoff.',
    url: `${SITE}/how-it-works`,
    images: [
      '/og?title=How+It+Works&subtitle=Visual+pipelines+for+every+service+%E2%80%94+from+intro+chat+to+handoff.',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works — The Studio Process',
    description: 'How each Sage Ideas engagement runs — from intro chat to scope, build, and handoff.',
    images: ['/og?title=How+It+Works&subtitle=Visual+pipelines+for+every+service+%E2%80%94+from+intro+chat+to+handoff.'],
  },
}

const HOW_TO_STEPS = [
  { name: 'Free intro chat', text: 'A 30-minute working conversation — not a sales call. We pressure-test the problem and whether it’s a fit.' },
  { name: 'Scope', text: 'Written deliverables, constraints, acceptance criteria, and a fixed price — before any work begins. No surprise change orders.' },
  { name: 'Build', text: 'The person who scoped it writes the code. Tested, reviewed, and built to production standard with visible progress.' },
  { name: 'Verify', text: 'Tests, evals, and acceptance criteria are proven against the scope — not asserted. You see the evidence.' },
  { name: 'Handoff', text: 'Documented, deployed, and transferred — with an optional Care retainer to keep it running.' },
]

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How a Sage Ideas engagement works',
          description: 'The studio process from free intro chat through scope, build, verify, and handoff.',
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
