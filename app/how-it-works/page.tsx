import type { Metadata } from 'next'
import { HowItWorksContent } from './how-it-works-content'
import { JsonLd } from '@/components/json-ld'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'How It Works — The Mastery Loop',
  description:
    'Every Sage Academy course is an instance of the loop senior engineers run on autopilot: frame, route, map, decide, prove, review, repair, space, transfer, package.',
  alternates: { canonical: `${SITE}/how-it-works` },
  openGraph: {
    title: 'How It Works — The Mastery Loop',
    description: 'Ten moves, each one visible, each one ending in something a reviewer can inspect.',
    url: `${SITE}/how-it-works`,
    images: [
      '/og?title=Frame+it.+Map+it.+Prove+it.&subtitle=The+mastery+loop',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How It Works — The Mastery Loop',
    description: 'Ten moves, each one visible, each one ending in something a reviewer can inspect.',
    images: ['/og?title=Frame+it.+Map+it.+Prove+it.&subtitle=The+mastery+loop'],
  },
}

const HOW_TO_STEPS = [
  { name: 'Frame', text: 'Turn a messy stake into a precise, falsifiable question. Most engineers debug the wrong problem beautifully — framing is the skill that stops that.' },
  { name: 'Route', text: 'Choose where to look first: cheapest disproof wins. Two paths get ruled out on paper before you touch anything.' },
  { name: 'Map', text: 'Draw the system with directions, owners, and defended omissions. The failure becomes a location, not a vibe.' },
  { name: 'Decide', text: 'Commit in writing: options, costs, and the constraint that forced your hand. A memo, not a hunch.' },
  { name: 'Prove', text: "A concrete check a skeptic can run. The starter fails; your fix passes; the output can't be faked." },
  { name: 'Review', text: 'Your artifact is read the way a staff engineer reads it — your score is capped by the weakest claim.' },
  { name: 'Repair', text: 'Broken cases are the curriculum. One repair lifts the cap — and teaches more than ten passing runs.' },
  { name: 'Space', text: "Recall prompts arrive on the forgetting curve's schedule, not yours. Six minutes, then back to work." },
  { name: 'Transfer', text: "The same move, applied in a new domain. That's the moment knowledge becomes judgment." },
  { name: 'Package', text: 'The artifact joins your ledger: claim, artifact, verdict. Shareable, verifiable, yours.' },
]

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'The Sage Academy mastery loop',
          description: 'The ten-move loop every course runs: frame, route, map, decide, prove, review, repair, space, transfer, package.',
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
