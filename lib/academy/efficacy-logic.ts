/**
 * Pure efficacy math — NO 'server-only', NO DB. Unit-testable.
 * Hake's normalized gain g = (post − pre) / (100 − pre): the share of the
 * available improvement a learner actually captured. The academy's credibility
 * metric — honest, standard, and impossible to fake at the aggregate level.
 */

export const MIN_AGGREGATE_N = 5 // below this, we say "collecting data", never publish a number

/** Normalized gain for one learner. Returns null when undefined (pre = 100, no headroom). */
export function hakeG(pre: number, post: number): number | null {
  const p = clampScore(pre)
  const q = clampScore(post)
  if (p >= 100) return q >= 100 ? 1 : null // no room to improve
  return round2((q - p) / (100 - p))
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, n))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export type GainBand = 'high' | 'medium' | 'low' | 'negative'

/** Hake's conventional bands: high ≥0.7, medium 0.3–0.7, low >0 to 0.3, else negative. */
export function gainBand(g: number): GainBand {
  if (g >= 0.7) return 'high'
  if (g >= 0.3) return 'medium'
  if (g > 0) return 'low'
  return 'negative'
}

export interface PrePost {
  pre: number
  post: number
}

export type AggregateEfficacy =
  | { status: 'collecting'; n: number; needed: number }
  | { status: 'published'; n: number; meanG: number; band: GainBand; avgPre: number; avgPost: number }

/**
 * Aggregate efficacy across learners. Below MIN_AGGREGATE_N we refuse to publish
 * a number — an honest "still collecting" state instead of a misleading mean.
 */
export function aggregateEfficacy(pairs: PrePost[]): AggregateEfficacy {
  const valid = pairs.filter((p) => hakeG(p.pre, p.post) !== null)
  const n = valid.length
  if (n < MIN_AGGREGATE_N) return { status: 'collecting', n, needed: MIN_AGGREGATE_N }

  const gs = valid.map((p) => hakeG(p.pre, p.post) as number)
  const meanG = round2(gs.reduce((a, b) => a + b, 0) / n)
  const avgPre = round2(valid.reduce((a, b) => a + b.pre, 0) / n)
  const avgPost = round2(valid.reduce((a, b) => a + b.post, 0) / n)
  return { status: 'published', n, meanG, band: gainBand(meanG), avgPre, avgPost }
}
