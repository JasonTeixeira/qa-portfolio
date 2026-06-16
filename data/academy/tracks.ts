export type AcademyTrack = {
  slug: string
  label: string
  title: string
  description: string
  status: 'forming' | 'open-soon'
  lessons: string[]
}

export const academyTracks: AcademyTrack[] = [
  {
    slug: 'ai-native-product-building',
    label: 'Track 01',
    title: 'AI-Native Product Building',
    description:
      'How to turn an idea into a real product surface, data model, workflow, and launch path.',
    status: 'forming',
    lessons: ['Offer to product map', 'Stack decisions', 'AI feature boundaries', 'Launch checklist'],
  },
  {
    slug: 'premium-conversion-sites',
    label: 'Track 02',
    title: 'Premium Conversion Sites',
    description:
      'The system behind a site that feels expensive, explains the offer, and turns attention into qualified demand.',
    status: 'forming',
    lessons: ['Hero architecture', 'Proof ladders', 'Motion with purpose', 'CTA routing'],
  },
  {
    slug: 'content-engine',
    label: 'Track 03',
    title: 'Content Engine For Builders',
    description:
      'A practical operating loop for turning real builds, teardown notes, and founder thinking into compounding content.',
    status: 'open-soon',
    lessons: ['Pillar design', 'Build logs', 'Newsletter cadence', 'Repurposing system'],
  },
  {
    slug: 'ai-automation-systems',
    label: 'Track 04',
    title: 'AI Automation Systems',
    description:
      'How to find useful automation opportunities, ship them safely, and measure the business result.',
    status: 'open-soon',
    lessons: ['Opportunity audits', 'Human-in-loop design', 'Tool boundaries', 'Measurement'],
  },
]

export const academyPrinciples = [
  'Operator-led: lessons come from real builds, not theory slides.',
  'Proof-backed: every claim needs an artifact, example, or constraint.',
  'System-first: product, brand, content, AI, and analytics are taught together.',
  'Premium without theater: clear thinking, strong craft, no fake guru posture.',
] as const
