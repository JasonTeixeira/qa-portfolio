import type { Metadata } from 'next'
import { FounderAnimations } from './founder-animations'

export const metadata: Metadata = {
  title: 'Founder',
  description:
    'Jason Teixeira — founder and principal of Sage Ideas. Fintech engineer, full-stack practitioner, and the person behind every studio engagement.',
  openGraph: {
    title: 'Founder — Jason Teixeira',
    description: 'The person behind every Sage Ideas engagement.',
    images: ['/og?title=Founder&subtitle=The+person+behind+the+studio.'],
  },
}

const capabilities = [
  'Full-stack TypeScript (Next.js, React, Node.js) and Python (FastAPI, data pipelines, ML)',
  'Production systems design: data modeling, API architecture, real-time systems, billing integrations',
  'Infrastructure as Code: Terraform on AWS, GitHub OIDC, CI/CD pipeline design',
  'Quality engineering: test strategy, framework selection, CI gate design — 13 frameworks deployed',
  'AI-native product development: LLM integration, ML feature engineering, automation pipelines',
  'Brand, content, and site systems: identity work, copy systems, marketing infrastructure',
  'Domain depth in fintech, developer tooling, trades tech, and edtech',
]

const principles = [
  'The person who scopes the work is the person who builds it. No bait-and-switch teams.',
  'Fixed scope and fixed price up front, with the artifacts and timelines spelled out before we start.',
  'Custom engagements and retainers are always available — productized tiers are starting points, not ceilings.',
  'Every deliverable is documented and handed off so it survives without me on the next call.',
  'Direct communication. No agency theater, no status calls that should have been emails.',
]

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <FounderAnimations capabilities={capabilities} principles={principles} />
    </div>
  )
}
