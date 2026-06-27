/**
 * Pure ranking logic for the ⌘K academy command palette — NO 'server-only',
 * NO DB. Deterministic relevance ordering over a flat, pre-built item list so
 * the server action stays a thin shell. Unit-testable in isolation.
 *
 * Relevance tiers (case-insensitive, higher wins):
 *   4  exact title match              ("python" === "Python")
 *   3  title starts with the query    ("py" → "Python Basics")
 *   2  word-boundary match in title   ("basics" → "Python Basics")
 *   1  substring match in title       ("yth" → "Python")
 *   0  substring match in subtitle    (title misses, subtitle catches)
 * Items below tier 0 (no match anywhere) are dropped. Empty/whitespace
 * query → [] (the palette shows its honest empty state, never the whole catalog).
 */

export type SearchItemKind = 'course' | 'lesson' | 'topic'

export type SearchItem = {
  kind: SearchItemKind
  title: string
  href: string
  subtitle?: string
}

export type RankedSearchItem = SearchItem & {
  /** 0–4 relevance tier (see module doc). Exposed for UI grouping/debug. */
  score: number
}

const TIER_EXACT = 4
const TIER_PREFIX = 3
const TIER_WORD = 2
const TIER_SUBSTRING = 1
const TIER_SUBTITLE = 0

/** Lowercase + collapse whitespace so "  Py  thon" and "py thon" compare equal-ish. */
function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** True when `query` matches at a word boundary inside `haystack` (already normalized). */
function matchesWordBoundary(haystack: string, query: string): boolean {
  return haystack === query || haystack.startsWith(`${query} `) || haystack.includes(` ${query}`)
}

/** Relevance tier for one item, or null when nothing matches. */
function scoreItem(item: SearchItem, query: string): number | null {
  const title = normalize(item.title)
  if (title === query) return TIER_EXACT
  if (title.startsWith(query)) return TIER_PREFIX
  if (matchesWordBoundary(title, query)) return TIER_WORD
  if (title.includes(query)) return TIER_SUBSTRING
  if (item.subtitle && normalize(item.subtitle).includes(query)) return TIER_SUBTITLE
  return null
}

/**
 * Rank `items` by relevance to `query`. Deterministic: ties break by original
 * input order (stable sort), so the same inputs always yield the same output.
 * Empty/whitespace query → [].
 */
export function rankAcademySearch(query: string, items: readonly SearchItem[]): RankedSearchItem[] {
  const q = normalize(query)
  if (!q) return []

  const ranked: RankedSearchItem[] = []
  for (const item of items) {
    const score = scoreItem(item, q)
    if (score !== null) ranked.push({ ...item, score })
  }

  // Stable sort by descending score; ties preserve input order (index tiebreak).
  return ranked
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.score - a.item.score || a.index - b.index)
    .map(({ item }) => item)
}
