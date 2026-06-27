/**
 * Pure quest logic — NO 'server-only', NO DB. Unit-testable in isolation.
 * The DB-touching layer (getDailyQuests, getWeeklyQuests) lives in quests.ts and
 * imports from here so the tested logic IS the prod logic.
 *
 * Quests are CONTENT-AGNOSTIC engagement nudges evaluated against a window
 * snapshot of the learner's REAL activity. A daily quest reads today's window,
 * a weekly quest reads this-week's window. Progress is honest: it is always a
 * pure function of the snapshot — never client-claimed (see ANTI-CHEAT).
 */

export type QuestScope = 'daily' | 'weekly'

/**
 * The metrics a quest target can be measured against. Each maps to a counter on
 * the activity snapshot so the catalog stays decoupled from any one DB shape.
 */
export type QuestMetric =
  | 'lessonsToday'
  | 'xpToday'
  | 'reviewsToday'
  | 'lessonsThisWeek'
  | 'labsThisWeek'
  | 'streakDays'

export interface Quest {
  key: string
  label: string
  /** The count the learner must reach for this quest to be done. */
  target: number
  scope: QuestScope
  metric: QuestMetric
}

/** A quest with its computed progress (the shape the UI consumes). */
export interface QuestProgress {
  key: string
  label: string
  target: number
  /** Clamped to [0, target] so a progress bar never overflows. */
  progress: number
  done: boolean
}

/**
 * A window snapshot of the learner's real activity. `daily` quests read the
 * *Today fields; `weekly` quests read the *ThisWeek + streak fields. streakDays
 * is the current streak length (a running window, not a per-window count).
 */
export interface QuestActivity {
  lessonsToday: number
  xpToday: number
  reviewsToday: number
  lessonsThisWeek: number
  labsThisWeek: number
  streakDays: number
}

// ── catalogs ─────────────────────────────────────────────────────────────────
// Keyed + ordered. Content-agnostic: every target is an engagement count, never
// a specific course/lesson, so quests stay meaningful as the catalog evolves.

export const DAILY_QUESTS: readonly Quest[] = [
  { key: 'daily-lesson', label: 'Complete 1 lesson', target: 1, scope: 'daily', metric: 'lessonsToday' },
  { key: 'daily-xp', label: 'Earn 20 XP today', target: 20, scope: 'daily', metric: 'xpToday' },
  { key: 'daily-review', label: 'Do a review', target: 1, scope: 'daily', metric: 'reviewsToday' },
]

export const WEEKLY_QUESTS: readonly Quest[] = [
  { key: 'weekly-lessons', label: 'Complete 3 lessons', target: 3, scope: 'weekly', metric: 'lessonsThisWeek' },
  { key: 'weekly-lab', label: 'Verify a lab', target: 1, scope: 'weekly', metric: 'labsThisWeek' },
  { key: 'weekly-streak', label: 'Keep your streak 5 days', target: 5, scope: 'weekly', metric: 'streakDays' },
]

/** Read the metric a quest measures off the activity snapshot. */
function metricValue(metric: QuestMetric, activity: QuestActivity): number {
  return Math.max(0, activity[metric] ?? 0)
}

/**
 * Deterministic per-quest progress for one scope. progress is clamped to the
 * quest's target; done is `raw >= target`. Pure function of (scope, activity).
 */
export function computeQuests(scope: QuestScope, activity: QuestActivity): QuestProgress[] {
  const catalog = scope === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS
  return catalog.map((q) => {
    const raw = metricValue(q.metric, activity)
    const progress = Math.min(raw, q.target)
    return {
      key: q.key,
      label: q.label,
      target: q.target,
      progress,
      done: raw >= q.target,
    }
  })
}

/**
 * A small surprise XP bonus, DETERMINISTICALLY derived from a numeric seed. Pure
 * function of its argument only (no Date.now/Math.random) so it is unit-testable
 * and reproducible server-side. The caller passes a per-event seed (derived from
 * the event id/timestamp). Weighted small: most events get 0, a few get more.
 *
 *   seed % 4 → 0: 0 XP (50%), 1: 5 XP, 2: 0 XP, 3: 15 XP — with 10 XP on a
 *   rarer bucket so the ladder is 0 / 5 / 10 / 15 and skews toward 0.
 */
export function variableXpBonus(seed: number): number {
  // Normalize to a non-negative integer bucket; non-finite seeds yield no bonus.
  if (!Number.isFinite(seed)) return 0
  const bucket = Math.abs(Math.trunc(seed)) % 8
  // Weighted ladder: 8 buckets → mostly 0, occasionally small. Pure + total.
  switch (bucket) {
    case 1:
      return 5
    case 3:
      return 10
    case 5:
      return 5
    case 7:
      return 15
    default:
      return 0 // buckets 0, 2, 4, 6 → no bonus (50% of seeds)
  }
}
