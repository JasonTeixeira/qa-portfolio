export type Intent = 'informational' | 'navigational' | 'commercial' | 'transactional'

export type Cluster =
  | 'testing-qa'
  | 'ai-engineering'
  | 'fintech-trading'
  | 'cloud-infra'
  | 'solo-studio'
  | 'product-systems'
  | 'compare'
  | 'money-page'

export interface KeywordEntry {
  term: string
  monthlyVolume: number
  difficulty: number
  intent: Intent
  assignedUrl: string
  cluster: Cluster
  isPrimary: boolean
  lastRefreshed: string
  source: 'seed' | 'gsc' | 'keyword-planner' | 'ahrefs' | 'dataforseo'
  gscSnapshot?: {
    impressions28d: number
    clicks28d: number
    avgPosition: number
  }
}

const REFRESHED = '2026-06-16'

export const keywordMap: KeywordEntry[] = [
  {
    term: 'AI development studio',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'commercial',
    assignedUrl: '/',
    cluster: 'money-page',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'AI app development services',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'commercial',
    assignedUrl: '/services/ai-development',
    cluster: 'ai-engineering',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'programmatic SEO agency for B2B',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'commercial',
    assignedUrl: '/services/content-care',
    cluster: 'money-page',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'fintech software development',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'commercial',
    assignedUrl: '/services/fintech',
    cluster: 'fintech-trading',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'trading system development',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'commercial',
    assignedUrl: '/services/trading-systems',
    cluster: 'fintech-trading',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'cloud infrastructure consulting',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'commercial',
    assignedUrl: '/services/cloud-infrastructure',
    cluster: 'cloud-infra',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'QA automation consulting',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'commercial',
    assignedUrl: '/services/enterprise-qa',
    cluster: 'testing-qa',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'solo software studio',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'commercial',
    assignedUrl: '/studio',
    cluster: 'solo-studio',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'learn product marketing and AI apps',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'informational',
    assignedUrl: '/academy',
    cluster: 'product-systems',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'AI feature evaluation',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'informational',
    assignedUrl: '/blog/how-to-evaluate-ai-features-before-you-ship-them',
    cluster: 'ai-engineering',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'AI agent boundaries',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'informational',
    assignedUrl: '/blog/the-ai-agent-boundary-problem',
    cluster: 'ai-engineering',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
  {
    term: 'RAG evaluation',
    monthlyVolume: 0,
    difficulty: -1,
    intent: 'informational',
    assignedUrl: '/blog/rag-evaluation-without-the-benchmark-theater',
    cluster: 'ai-engineering',
    isPrimary: true,
    lastRefreshed: REFRESHED,
    source: 'seed',
  },
]

export function getKeywordsByCluster(cluster: Cluster): KeywordEntry[] {
  return keywordMap.filter((entry) => entry.cluster === cluster)
}

export function getKeywordsByUrl(url: string): KeywordEntry[] {
  return keywordMap.filter((entry) => entry.assignedUrl === url)
}

export function getPrimaryKeyword(url: string): KeywordEntry | undefined {
  return keywordMap.find((entry) => entry.assignedUrl === url && entry.isPrimary)
}
