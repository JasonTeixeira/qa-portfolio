import type { ClusterKey } from '@/lib/blog-schema'

export type AcademyTrack = {
  slug: string
  label: string
  title: string
  description: string
  status: 'forming' | 'open-soon'
  outcome: string
  audience: string
  format: string
  cta: string
  lessons: string[]
}

export const academyTrackByCluster: Record<ClusterKey, string> = {
  'testing-qa': 'premium-conversion-sites',
  'ai-engineering': 'ai-automation-systems',
  'fintech-trading': 'ai-native-product-building',
  'cloud-infra': 'ai-native-product-building',
  'solo-studio': 'content-engine',
  'product-systems': 'ai-native-product-building',
}

export const academyTracks: AcademyTrack[] = [
  {
    slug: 'ai-native-product-building',
    label: 'Track 01',
    title: 'AI-Native Product Building',
    description:
      'How to turn an idea into a real product surface, data model, workflow, and launch path.',
    status: 'forming',
    outcome: 'Leave with a scoped product plan, build sequence, first data model, and launch checklist.',
    audience: 'Founders and builders turning a real offer into a product, not another brainstorm doc.',
    format: '4 modules, build notes, templates, and teardown examples from the studio record.',
    cta: 'Join the product track',
    lessons: ['Offer to product map', 'Stack decisions', 'AI feature boundaries', 'Launch checklist'],
  },
  {
    slug: 'premium-conversion-sites',
    label: 'Track 02',
    title: 'Premium Conversion Sites',
    description:
      'The system behind a site that feels expensive, explains the offer, and turns attention into qualified demand.',
    status: 'forming',
    outcome: 'Leave with a homepage architecture, proof ladder, CTA map, and motion rules that support conversion.',
    audience: 'Operators who need a premium site that sells clearly without fake agency theatre.',
    format: '4 modules with page teardown videos, wireframe patterns, and copy checklists.',
    cta: 'Join the conversion track',
    lessons: ['Hero architecture', 'Proof ladders', 'Motion with purpose', 'CTA routing'],
  },
  {
    slug: 'content-engine',
    label: 'Track 03',
    title: 'Content Engine For Builders',
    description:
      'A practical operating loop for turning real builds, teardown notes, and founder thinking into compounding content.',
    status: 'open-soon',
    outcome: 'Leave with topic clusters, a weekly publishing loop, repurposing rules, and a source-first content queue.',
    audience: 'Builders who want authority from real work instead of generic founder posts.',
    format: '5 modules, editorial templates, calendar system, and distribution checklists.',
    cta: 'Join the content track',
    lessons: ['Pillar design', 'Build logs', 'Newsletter cadence', 'Repurposing system'],
  },
  {
    slug: 'ai-automation-systems',
    label: 'Track 04',
    title: 'AI Automation Systems',
    description:
      'How to find useful automation opportunities, ship them safely, and measure the business result.',
    status: 'open-soon',
    outcome: 'Leave with an automation audit, agent boundary spec, human-in-loop design, and measurement plan.',
    audience: 'Operators who want useful AI workflows without giving a model the keys to the business.',
    format: '4 modules with workflow maps, risk gates, and implementation examples.',
    cta: 'Join the automation track',
    lessons: ['Opportunity audits', 'Human-in-loop design', 'Tool boundaries', 'Measurement'],
  },
]

export function getAcademyTrack(slug: string): AcademyTrack | undefined {
  return academyTracks.find((track) => track.slug === slug)
}

export function getAcademyTrackForCluster(cluster: ClusterKey): AcademyTrack {
  return getAcademyTrack(academyTrackByCluster[cluster]) ?? academyTracks[0]
}

/**
 * Reverse of `academyTrackByCluster`: which blog clusters feed a given track.
 * Single source of truth so hub→track and track→hub cross-links stay symmetric.
 */
export function clustersForTrack(trackSlug: string): ClusterKey[] {
  return (Object.entries(academyTrackByCluster) as [ClusterKey, string][])
    .filter(([, track]) => track === trackSlug)
    .map(([cluster]) => cluster)
}

export const academyPrinciples = [
  'Operator-led: lessons come from real builds, not theory slides.',
  'Proof-backed: every claim needs an artifact, example, or constraint.',
  'System-first: product, brand, content, AI, and analytics are taught together.',
  'Premium without theater: clear thinking, strong craft, no fake guru posture.',
] as const
