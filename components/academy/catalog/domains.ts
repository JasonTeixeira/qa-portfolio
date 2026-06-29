import type { TopicKey } from '@/lib/academy/topics'
import type { CourseItem } from '@/data/academy/learn-catalog'

/**
 * The catalog's curriculum spine. The six topic domains, rendered in a deliberate
 * learning order so a first-time learner reads top-to-bottom from where to start.
 * Each domain gets a one-line "what this is" so the grouping teaches, not just sorts.
 *
 * Order is intentional: Foundations first (course 00 leads), then the build-up
 * through Engineering, Data, AI Engineering, then Ship-it, then Growth.
 */
export const DOMAIN_ORDER: readonly TopicKey[] = [
  'foundations',
  'engineering',
  'data',
  'ai-engineering',
  'ship-it',
  'growth',
]

/** One-line orientation per domain — what the learner gets here, in plain language. */
export const DOMAIN_BLURB: Record<TopicKey, string> = {
  foundations: 'Start here. The bedrock — Python, the terminal, how programs are built.',
  engineering: 'Write software that lasts: structure, tooling, and engineering craft.',
  data: 'Model, query, and move data — the substrate everything intelligent runs on.',
  'ai-engineering': 'Build with models: APIs, prompting, retrieval, and agents.',
  'ship-it': 'Take it to production — full-stack apps, auth, payments, deploys.',
  growth: 'Get it in front of people and keep it running as a real product.',
}

export type DomainGroup = {
  key: TopicKey
  /** Domain label, from TOPICS (e.g. "Foundations"). Passed in to avoid a second import path. */
  blurb: string
  courses: CourseItem[]
}

/**
 * Group the (already DB-sorted-by-`sort`) course list into the six domains in
 * curriculum order. Grouping is stable, so each domain keeps its incoming
 * `sort` order — the foundation course (course 00) leads its domain.
 * Empty domains are dropped so the page never shows a hollow header.
 */
export function groupByDomain(courses: readonly CourseItem[]): TopicKey[] {
  const seen = new Set<TopicKey>()
  for (const c of courses) seen.add(c.topic)
  // Known domains first, in curriculum order…
  const ordered = DOMAIN_ORDER.filter((k) => seen.has(k))
  // …then any unexpected topic, so nothing silently disappears.
  for (const k of seen) {
    if (!ordered.includes(k)) ordered.push(k)
  }
  return ordered
}
