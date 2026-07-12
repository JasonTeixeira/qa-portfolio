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
    'Founder and principal engineer of Sage Ideas, a studio that builds working business systems, interactive demos, revenue dashboards, and AI workflows buyers can inspect before the build call.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Orlando',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  knowsAbout: [
    'Interactive Business Prototypes',
    'Revenue Operations Dashboards',
    'AI-Native Product Development',
    'Website Conversion Systems',
    'Lead Follow-up Automation',
    'Full-Stack TypeScript Engineering',
    'Cloud Infrastructure',
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
  title: 'Founder — Jason Teixeira, Sage Ideas',
  description:
    'Meet Jason Teixeira, the founder and builder behind Sage Ideas. Direct product, AI, brand, and engineering work for business systems buyers can click before they buy.',
  openGraph: {
    title: 'Founder — Jason Teixeira, Sage Ideas',
    description: 'The founder and builder behind every Sage Ideas business system.',
    url: 'https://www.sageideas.dev/founder',
    images: ['/og?title=Founder&subtitle=The+person+behind+the+studio.'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Founder — Jason Teixeira, Sage Ideas',
    description: 'The founder and builder behind every Sage Ideas business system.',
    images: ['/og?title=Founder&subtitle=The+person+behind+the+studio.'],
  },
}

const capabilities = [
  'Interactive systems buyers can open before the sales call',
  'Revenue dashboards, lead routing, quote engines, intake flows, and AI support workflows',
  'Full-stack implementation with TypeScript, Next.js, APIs, data models, and deployment gates',
  'AI-native product work: LLM workflows, retrieval, evaluation, automation, and human approval loops',
  'Conversion-first site systems: offer, copy, proof, CTAs, analytics, and follow-up paths',
  'Business-facing handoff: documented scope, source-aware booking routes, and proof assets',
  'Domain depth across fintech, local services, SaaS, healthcare, support, and education',
]

const principles = [
  'Show the system before asking a buyer to trust the pitch.',
  'The person who scopes the work is the person who builds it. No handoff chain.',
  'Use plain business outcomes first, then prove the engineering underneath.',
  'Every deliverable should be inspectable: route, screen, workflow, evidence, and next action.',
  'Direct communication, written scope, clear source paths, and no vague agency theater.',
]

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <JsonLd data={[personSchema, breadcrumbSchema]} />
      <FounderAnimations capabilities={capabilities} principles={principles} />
    </div>
  )
}
