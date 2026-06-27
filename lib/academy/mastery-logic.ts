/**
 * Pure mastery-derivation logic — NO 'server-only', NO DB. Unit-testable.
 *
 * The mastery map is the "you are here" read across a learner's skills. It is a
 * pure function of the evidence the spine already produced: a per-unit
 * resolved score (from resolveScore) plus a derived unit state (from
 * deriveUnitState). It NEVER reads academy_progress directly and never invents
 * data — an absence of evidence is an honest 'learning'/'locked', not a guess.
 *
 * Mastery level is intentionally coarser than the 12-cap score: learners read a
 * heat-map by level, not by a raw number. The thresholds mirror the cap ladder
 * in caps-logic.ts (82 = the "broken case" rung, 90 = the spacing rung).
 */

import type { UnitState } from './evidence-events-logic'

/** Coarse mastery bucket per unit/skill, ascending in earned evidence. */
export type MasteryLevel = 'locked' | 'learning' | 'proven' | 'mastered'

export const MASTERY_LEVELS: readonly MasteryLevel[] = [
  'locked',
  'learning',
  'proven',
  'mastered',
] as const

/** Score at/above which a unit reads as fully mastered. */
export const MASTERED_THRESHOLD = 90
/** Score at/above which a unit reads as proven (the §5 "broken case" rung). */
export const PROVEN_THRESHOLD = 82

/** One unit's raw inputs, sourced server-side from the evidence spine. */
export type MasteryUnitInput = {
  courseSlug: string
  lessonSlug: string
  /** Human label for the skill cell (falls back to lessonSlug when absent). */
  label?: string
  /** Topic the course belongs to — groups the heat-map. */
  topicKey: string
  /** Resolved score (min of binding caps) from resolveScore. */
  score: number
  /** Derived unit state from deriveUnitState. */
  state: UnitState
}

/** One placed cell in the heat-map. */
export type MasteryUnit = {
  courseSlug: string
  lessonSlug: string
  label: string
  topicKey: string
  score: number
  state: UnitState
  level: MasteryLevel
}

/**
 * Bucket a single unit into a mastery level — deterministic, no IO.
 *
 *  - 'locked'   : the unit is gated (state 'locked'); prerequisites not met.
 *  - 'mastered' : score >= 90 (the spacing rung — durable, spaced evidence).
 *  - 'proven'   : the unit is genuinely 'complete', OR score >= 82 (a real
 *                 verified+broken-case build), even if not yet fully spaced.
 *  - 'learning' : everything else — evidence is accumulating but not yet proven.
 */
export function deriveMasteryLevel(input: { score: number; state: UnitState }): MasteryLevel {
  const { score, state } = input
  if (state === 'locked') return 'locked'
  if (score >= MASTERED_THRESHOLD) return 'mastered'
  if (state === 'complete' || score >= PROVEN_THRESHOLD) return 'proven'
  return 'learning'
}

/** Resolve every unit to a placed cell, preserving input order. */
export function deriveMasteryUnits(inputs: readonly MasteryUnitInput[]): MasteryUnit[] {
  return inputs.map((u) => ({
    courseSlug: u.courseSlug,
    lessonSlug: u.lessonSlug,
    label: u.label?.trim() || u.lessonSlug,
    topicKey: u.topicKey,
    score: u.score,
    state: u.state,
    level: deriveMasteryLevel({ score: u.score, state: u.state }),
  }))
}

/** Per-level tallies for a set of units. */
export type MasteryCounts = Record<MasteryLevel, number>

export function emptyCounts(): MasteryCounts {
  return { locked: 0, learning: 0, proven: 0, mastered: 0 }
}

/** A topic-level rollup over its units. */
export type MasteryTopicRollup = {
  topicKey: string
  units: MasteryUnit[]
  total: number
  counts: MasteryCounts
  /**
   * Average resolved score across NON-LOCKED units (locked units carry no
   * earned score, so folding them in would understate live progress). 0 when
   * the topic has no unlocked units yet.
   */
  avgScore: number
}

function countLevels(units: readonly MasteryUnit[]): MasteryCounts {
  const counts = emptyCounts()
  for (const u of units) counts[u.level] += 1
  return counts
}

function avgNonLockedScore(units: readonly MasteryUnit[]): number {
  const scored = units.filter((u) => u.level !== 'locked')
  if (scored.length === 0) return 0
  const sum = scored.reduce((acc, u) => acc + u.score, 0)
  return Math.round(sum / scored.length)
}

/**
 * Group placed units by topic into a stable, sorted rollup. Topics are ordered
 * by the supplied `topicOrder` first, then any remaining topics alphabetically,
 * so the heat-map renders deterministically regardless of input order.
 */
export function rollupByTopic(
  units: readonly MasteryUnit[],
  topicOrder: readonly string[] = [],
): MasteryTopicRollup[] {
  const byTopic = new Map<string, MasteryUnit[]>()
  for (const u of units) {
    const list = byTopic.get(u.topicKey)
    if (list) list.push(u)
    else byTopic.set(u.topicKey, [u])
  }

  const orderIndex = new Map(topicOrder.map((t, i) => [t, i]))
  const keys = [...byTopic.keys()].sort((a, b) => {
    const ai = orderIndex.has(a) ? orderIndex.get(a)! : Number.POSITIVE_INFINITY
    const bi = orderIndex.has(b) ? orderIndex.get(b)! : Number.POSITIVE_INFINITY
    if (ai !== bi) return ai - bi
    return a.localeCompare(b)
  })

  return keys.map((topicKey) => {
    const topicUnits = byTopic.get(topicKey)!
    return {
      topicKey,
      units: topicUnits,
      total: topicUnits.length,
      counts: countLevels(topicUnits),
      avgScore: avgNonLockedScore(topicUnits),
    }
  })
}

/** The whole map: topic rollups + a flat overall tally. */
export type MasteryMap = {
  topics: MasteryTopicRollup[]
  totalUnits: number
  counts: MasteryCounts
  /** True when the learner has produced zero evidence anywhere (honest empty). */
  isCollecting: boolean
}

/** Assemble the full mastery map from placed units. Pure. */
export function buildMasteryMap(
  units: readonly MasteryUnit[],
  topicOrder: readonly string[] = [],
): MasteryMap {
  const topics = rollupByTopic(units, topicOrder)
  const counts = countLevels(units)
  // "Collecting" = nothing unlocked yet (only locked cells, or no cells at all).
  const hasEvidence = units.some((u) => u.level !== 'locked')
  return {
    topics,
    totalUnits: units.length,
    counts,
    isCollecting: !hasEvidence,
  }
}
