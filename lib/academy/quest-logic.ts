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

// ── variable-ratio daily bonus ───────────────────────────────────────────────
// The Hooked-model "variable reward". A surprise the learner CAN'T predict
// (different every day, different per learner) but the server CAN reproduce and
// verify — because it is a *pure function of (userId + UTC date)*, never of
// Math.random and never client-claimed. The payout is bounded and small; the
// learner only collects it by doing the real activity the bonus targets.

/**
 * Deterministic 32-bit string hash (FNV-1a). Pure, total, no Date/Math.random —
 * same string always yields the same non-negative integer. This is the seed
 * source for the daily bonus, so "today's surprise" is reproducible server-side.
 */
export function bonusSeedFromString(input: string): number {
  let h = 0x811c9dc5 // FNV offset basis
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    // FNV prime multiply via shifts to stay in 32-bit unsigned space.
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h >>> 0
}

/** The kinds of surprise a daily bonus can be. */
export type BonusKind = 'multiplier' | 'flat'

/**
 * Today's surprise reward spec. `metric`/`target` say which real activity
 * "arms" the bonus; `multiplier` (for kind 'multiplier') or `flatXp` (for
 * kind 'flat') say what it pays once armed. `seed` is carried so the server can
 * re-derive + verify the same spec when it awards.
 */
export interface DailyBonus {
  seed: number
  kind: BonusKind
  /** The activity counter that unlocks the bonus (always a daily metric). */
  metric: QuestMetric
  /** Count of `metric` needed to arm the bonus (always ≥ 1). */
  target: number
  /** XP multiplier applied to base lesson XP, for kind 'multiplier' (2 or 3). */
  multiplier: number
  /** Flat surprise XP, for kind 'flat'. */
  flatXp: number
  /** Human label, e.g. "2× XP on your next lesson". */
  label: string
}

/** Base lesson XP the multiplier bonus is reckoned against (kept in sync with XP_REWARDS.lesson). */
export const BONUS_BASE_LESSON_XP = 20

/**
 * Derive today's variable-ratio bonus, deterministically, from the learner id
 * and a UTC date string (YYYY-MM-DD). Pure — same (userId, utcDate) always
 * yields the same DailyBonus; different dates or users vary it. Never random.
 *
 * The seed is split into two independent buckets:
 *  - `kindBucket` (seed % 5): 3 of 5 days → multiplier, 2 of 5 → flat. Skews
 *    toward the multiplier so most "surprise" days reward finishing a lesson.
 *  - `tierBucket` ((seed >>> 3) % 4): controls the size (2×/3×, or 10/15 XP).
 */
export function dailyBonus(userId: string, utcDate: string): DailyBonus {
  const seed = bonusSeedFromString(`${userId}:${utcDate}`)
  const kindBucket = seed % 5
  const tierBucket = (seed >>> 3) % 4

  if (kindBucket < 3) {
    // Multiplier day: arm by completing the next lesson today.
    const multiplier = tierBucket === 0 ? 3 : 2 // 3× is the rarer tier (1 in 4)
    return {
      seed,
      kind: 'multiplier',
      metric: 'lessonsToday',
      target: 1,
      multiplier,
      flatXp: 0,
      label: `${multiplier}× XP on your next lesson`,
    }
  }

  // Flat day: arm by doing a review today.
  const flatXp = tierBucket >= 2 ? 15 : 10
  return {
    seed,
    kind: 'flat',
    metric: 'reviewsToday',
    target: 1,
    multiplier: 1,
    flatXp,
    label: `+${flatXp} surprise XP for a review`,
  }
}

/** A daily bonus with its honest, activity-derived collection state (UI shape). */
export interface BonusState {
  label: string
  kind: BonusKind
  /** XP the learner will collect once armed (server-verified amount). */
  rewardXp: number
  /** Real progress toward arming the bonus, clamped to [0, target]. */
  progress: number
  target: number
  /** True once the real activity meets target — the "collect" moment. */
  collected: boolean
  metric: QuestMetric
}

/**
 * Resolve a DailyBonus against the learner's REAL activity snapshot. The reward
 * XP and the collected flag are pure functions of (bonus, activity) — the
 * learner never claims a raw number; the server derives the exact same value.
 * For a multiplier bonus the surplus over base lesson XP is what the bonus is
 * worth (e.g. a 2× bonus on a 20-XP lesson is +20 surplus).
 */
export function resolveDailyBonus(bonus: DailyBonus, activity: QuestActivity): BonusState {
  const raw = metricValue(bonus.metric, activity)
  const progress = Math.min(raw, bonus.target)
  const collected = raw >= bonus.target
  const rewardXp =
    bonus.kind === 'multiplier'
      ? BONUS_BASE_LESSON_XP * (bonus.multiplier - 1) // surplus over the normal lesson award
      : bonus.flatXp
  return {
    label: bonus.label,
    kind: bonus.kind,
    rewardXp,
    progress,
    target: bonus.target,
    collected,
    metric: bonus.metric,
  }
}

/**
 * Derive a SHORT prize headline from a resolved BonusState — purely from its
 * own honest fields, no fabrication. A multiplier bonus reads as its multiplier
 * (e.g. "2×"); a flat bonus reads as its XP (e.g. "+15 XP"). The multiplier is
 * recovered from the server-verified surplus reward (rewardXp = base × (m − 1)),
 * so the headline can never claim a multiplier the award path wouldn't grant.
 * Pure + total: any non-multiplier or unrecoverable shape falls back to XP.
 */
export function bonusHeadline(bonus: BonusState): string {
  if (bonus.kind === 'multiplier' && bonus.rewardXp > 0) {
    const multiplier = bonus.rewardXp / BONUS_BASE_LESSON_XP + 1
    if (Number.isInteger(multiplier) && multiplier >= 2) return `${multiplier}×`
  }
  return `+${Math.max(0, bonus.rewardXp)} XP`
}

/**
 * The honest "this changes daily" tease line. The daily bonus is a deterministic
 * function of (learner, UTC date), so it genuinely differs every day and resets
 * at UTC midnight — but the learner can't predict tomorrow's value (that's the
 * variable-ratio hook). This copy states only what's true: it varies daily and
 * resets; it never names a specific future value. Pure constant — kept here so
 * the claim and the UI share one source of truth.
 */
export const BONUS_VARIES_TEASE = 'A new surprise every day · resets at midnight UTC'
