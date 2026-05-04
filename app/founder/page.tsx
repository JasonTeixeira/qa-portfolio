import type { Metadata } from 'next'
import { FounderAnimations } from './founder-animations'
import { JsonLd } from '@/components/json-ld'

const SITE = 'https://www.sageideas.dev'

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Jason Teixeira',
  url: `${SITE}/founder`,
  image: `${SITE}/images/headshot.jpg`,
  jobTitle: 'Founder & Principal Engineer',
  worksFor: {
    '@type': 'Organization',
    name: 'Sage Ideas LLC',
    url: SITE,
  },
  description:
    'Founder and principal engineer of Sage Ideas — a studio that builds, automates, and operates B2B systems end-to-end.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Orlando',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  knowsAbout: [
    'Full-Stack TypeScript Engineering',
    'Cloud Infrastructure (AWS, Terraform)',
    'CI/CD and Quality Engineering',
    'AI-Native Product Development',
    'Stripe and SaaS Billing',
    'Programmatic SEO',
    'Fintech Systems',
  ],
  sameAs: [
    'https://github.com/JasonTeixeira',
    'https://linkedin.com/in/jason-teixeira',
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
    { '@type': 'ListItem', position: 2, name: 'Founder', item: `${SITE}/founder` },
  ],
}

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/founder' },
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
      <JsonLd data={[personSchema, breadcrumbSchema]} />
      <FounderAnimations capabilities={capabilities} principles={principles} />
    </div>
  )
}
