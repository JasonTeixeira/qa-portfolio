import type { ClusterKey } from '@/lib/blog-schema'

export interface HubMeta {
  key: ClusterKey
  slug: string
  title: string
  headline: string
  description: string
  keywords: string[]
  moneyPageLink: { href: string; label: string }
  gaps: string[]
}

export const CLUSTERS: Record<ClusterKey, HubMeta> = {
  'testing-qa': {
    key: 'testing-qa',
    slug: 'testing-qa',
    title: 'Testing & QA',
    headline: 'Production testing without the cargo cult.',
    description:
      'Field notes on API testing, flaky tests, automation frameworks, OWASP checks, and quality systems that survive production.',
    keywords: ['QA automation', 'API testing', 'test strategy', 'software quality'],
    moneyPageLink: { href: '/services/enterprise-qa', label: 'Build a production QA system' },
    gaps: ['Contract testing teardown', 'Visual regression playbook', 'QA metrics dashboard guide'],
  },
  'ai-engineering': {
    key: 'ai-engineering',
    slug: 'ai-engineering',
    title: 'AI Engineering',
    headline: 'AI systems that have to survive contact with users.',
    description:
      'Practical writing on agents, AI apps, automation, evaluation, and production workflows from a solo AI-native studio.',
    keywords: ['AI engineering', 'AI agents', 'AI automation', 'LLM evaluation'],
    moneyPageLink: { href: '/services/ai-development', label: 'Scope an AI system' },
    gaps: ['RAG evaluation guide', 'Agent failure-mode checklist', 'AI workflow ROI calculator'],
  },
  'fintech-trading': {
    key: 'fintech-trading',
    slug: 'fintech-trading',
    title: 'Fintech & Trading Systems',
    headline: 'Trading software where the math has receipts.',
    description:
      'Architecture notes on Nexural, AlphaStream, backtesting, risk math, feature engineering, and fintech platform trade-offs.',
    keywords: ['fintech software', 'trading systems', 'backtesting engine', 'risk analytics'],
    moneyPageLink: { href: '/services/trading-systems', label: 'Build a trading system' },
    gaps: ['Live-data architecture', 'Broker integration checklist', 'Strategy evaluation framework'],
  },
  'cloud-infra': {
    key: 'cloud-infra',
    slug: 'cloud-infra',
    title: 'Cloud & Infrastructure',
    headline: 'Boring infrastructure that makes ambitious products possible.',
    description:
      'Deep dives on AWS, Supabase, Terraform, Docker, monitoring, CI/CD, and production infrastructure patterns.',
    keywords: ['cloud infrastructure', 'AWS Terraform', 'Supabase production', 'CI/CD'],
    moneyPageLink: { href: '/services/cloud-infrastructure', label: 'Harden the infrastructure' },
    gaps: ['Incident drill template', 'Cost audit checklist', 'Zero-downtime migration guide'],
  },
  'solo-studio': {
    key: 'solo-studio',
    slug: 'solo-studio',
    title: 'Solo Studio Operating System',
    headline: 'How one operator builds like a small team.',
    description:
      'Writing on solo engineering, building in public, career leverage, LLC operations, documentation, and durable personal systems.',
    keywords: ['solo engineer', 'one-person studio', 'building in public', 'technical founder'],
    moneyPageLink: { href: '/studio', label: 'See the studio model' },
    gaps: ['Solo studio weekly operating rhythm', 'Founder content system', 'Proposal-to-delivery workflow'],
  },
  'product-systems': {
    key: 'product-systems',
    slug: 'product-systems',
    title: 'Product Systems',
    headline: 'The product, the brand, and the system underneath.',
    description:
      'Architecture, product strategy, documentation, and launch notes for building software that feels coherent end to end.',
    keywords: ['product systems', 'software architecture', 'product engineering', 'technical content'],
    moneyPageLink: { href: '/services/studio-engagement', label: 'Build the whole system' },
    gaps: ['Product analytics setup', 'Launch checklist', 'Content-to-product feedback loops'],
  },
}

export const clusterList = Object.values(CLUSTERS)

export function getClusterBySlug(slug: string): HubMeta | undefined {
  return clusterList.find((cluster) => cluster.slug === slug)
}
