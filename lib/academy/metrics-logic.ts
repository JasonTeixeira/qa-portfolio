/**
 * Pure measurement math for the academy admin — NO 'server-only', NO DB.
 * Unit-testable in isolation. Three honest aggregate surfaces:
 *   1. CURR  — Current-User Retention Rate (returned/active learners).
 *   2. Evidence funnel — drop-off across the proof pipeline's key events.
 *   3. Aggregate gain — Hake's normalized g across pre/post pairs.
 *
 * Honesty invariant (shared with efficacy-logic): below MIN_AGGREGATE_N we
 * NEVER publish a rate or a mean — we return null and the UI says "collecting".
 * A small, noisy n is worse than no number.
 */

import { hakeG, MIN_AGGREGATE_N } from '@/lib/academy/efficacy-logic'

export { MIN_AGGREGATE_N }

/**
 * Current-User Retention Rate = retained / active.
 *
 * `activeUserIds` = the cohort that was active in the baseline window.
 * `retainedUserIds` = the subset still active in the later window.
 * Returns null when the active cohort is below MIN_AGGREGATE_N (too small to
 * publish). Retained is intersected with active and de-duped, so a stray id in
 * `retainedUserIds` that isn't in `activeUserIds` can't push the rate above 1.
 */
export function currRate(activeUserIds: string[], retainedUserIds: string[]): number | null {
  const active = new Set(activeUserIds)
  const activeN = active.size
  if (activeN < MIN_AGGREGATE_N) return null
  let retained = 0
  for (const id of new Set(retainedUserIds)) {
    if (active.has(id)) retained += 1
  }
  return round3(retained / activeN)
}

/** One stage of the evidence funnel: an event type, its count, and % vs the first stage. */
export interface FunnelStage {
  stage: string
  count: number
  pct: number
}

/**
 * The proof pipeline, in pedagogical order. Percentages are computed against the
 * FIRST stage (diagnostic_completed) — the standard "% of entrants who reached
 * stage X" funnel read, which surfaces where learners drop off.
 */
export const FUNNEL_STAGES = [
  'diagnostic_completed',
  'retrieval_attempted',
  'sprint_artifact_created',
  'lab_verified',
  'lesson_completed',
  'transfer_attempted',
] as const

export type FunnelStageName = (typeof FUNNEL_STAGES)[number]

/**
 * Ordered funnel across the key proof events. `pct` is each stage's count as a
 * share of the first stage's count (0–1), or 0 when the first stage is empty
 * (no entrants → no meaningful ratio, never a divide-by-zero).
 */
export function evidenceFunnel(eventCounts: Record<string, number>): FunnelStage[] {
  const first = Math.max(0, eventCounts[FUNNEL_STAGES[0]] ?? 0)
  return FUNNEL_STAGES.map((stage) => {
    const count = Math.max(0, eventCounts[stage] ?? 0)
    const pct = first === 0 ? 0 : round3(count / first)
    return { stage, count, pct }
  })
}

/** Aggregate Hake's g across pre/post pairs. `meanG` is null below MIN_AGGREGATE_N. */
export interface AggregateGain {
  n: number
  meanG: number | null
}

/**
 * Mean normalized gain across learners. Reuses the canonical Hake formula so the
 * admin number is identical to the public one. Pairs where g is undefined
 * (pre = 100, no headroom) are excluded from n — they can't contribute a gain.
 * Returns meanG = null until n ≥ MIN_AGGREGATE_N.
 */
export function aggregateGain(pairs: { pre: number; post: number }[]): AggregateGain {
  const gs: number[] = []
  for (const { pre, post } of pairs) {
    const g = hakeG(pre, post)
    if (g !== null) gs.push(g)
  }
  const n = gs.length
  if (n < MIN_AGGREGATE_N) return { n, meanG: null }
  const meanG = round2(gs.reduce((a, b) => a + b, 0) / n)
  return { n, meanG }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}
