/**
 * Pure badge logic — NO 'server-only', NO DB. Unit-testable in isolation.
 * The DB-touching layer (getEarnedBadges, reconcileBadges) lives in badges.ts and
 * imports from here, so the tested logic IS the prod logic.
 *
 * Badges are content-agnostic collectible achievements. Each is a deterministic
 * predicate over the learner's REAL stats — they are SERVER-VERIFIED and written
 * via the service role, never client-claimed (anti-cheat parity with the evidence
 * spine + the goal milestones in goal-logic.ts).
 */

import type { GoalStats } from '@/lib/academy/goal-logic'

/**
 * The stat snapshot every badge check is evaluated against: the getLearnerStats
 * shape PLUS the learner's all-time longest streak (so "comeback"-style badges can
 * compare current vs. peak engagement).
 */
export interface BadgeStats extends GoalStats {
  longestStreak: number
}

export interface Badge {
  key: string
  label: string
  blurb: string
  /** A short emoji/glyph shown on the shelf + in the celebration. */
  icon: string
  /** Deterministic predicate — true once the learner has genuinely earned it. */
  check: (s: BadgeStats) => boolean
}

/** A badge with its earned timestamp (the shape the shelf consumes). */
export interface EarnedBadge {
  key: string
  label: string
  blurb: string
  icon: string
  earnedAt: string
}

/**
 * The collectible badge catalog, in display order. Content-agnostic: every check
 * is derived from platform-engagement facts, so the set stays meaningful
 * regardless of catalog changes.
 */
export const BADGE_CATALOG: readonly Badge[] = [
  {
    key: 'first_lesson',
    label: 'First Steps',
    blurb: 'Completed your very first lesson.',
    icon: '✦',
    check: (s) => s.lessonsCompleted >= 1,
  },
  {
    key: 'five_lessons',
    label: 'Getting Traction',
    blurb: 'Completed five lessons.',
    icon: '✧',
    check: (s) => s.lessonsCompleted >= 5,
  },
  {
    key: 'first_course',
    label: 'Course Closer',
    blurb: 'Finished your first full course.',
    icon: '◆',
    check: (s) => s.coursesFinished >= 1,
  },
  {
    key: 'three_courses',
    label: 'Curriculum Crusher',
    blurb: 'Finished three full courses.',
    icon: '◈',
    check: (s) => s.coursesFinished >= 3,
  },
  {
    key: 'first_cert',
    label: 'Certified',
    blurb: 'Earned your first certificate.',
    icon: '❖',
    check: (s) => s.certificates >= 1,
  },
  {
    key: 'three_certs',
    label: 'Triple Crown',
    blurb: 'Earned three certificates.',
    icon: '⬗',
    check: (s) => s.certificates >= 3,
  },
  {
    key: 'first_project',
    label: 'Shipped It',
    blurb: 'Shipped your first portfolio project.',
    icon: '▲',
    check: (s) => s.projects >= 1,
  },
  {
    key: 'streak_3',
    label: 'Warming Up',
    blurb: 'Kept a three-day streak.',
    icon: '◐',
    check: (s) => s.currentStreak >= 3 || s.longestStreak >= 3,
  },
  {
    key: 'streak_7',
    label: 'On a Roll',
    blurb: 'Reached a seven-day streak.',
    icon: '◑',
    check: (s) => s.currentStreak >= 7 || s.longestStreak >= 7,
  },
  {
    key: 'streak_30',
    label: 'Unbroken',
    blurb: 'Sustained a thirty-day streak.',
    icon: '●',
    check: (s) => s.currentStreak >= 30 || s.longestStreak >= 30,
  },
  {
    key: 'hundred_xp',
    label: 'Century',
    blurb: 'Banked real momentum — a hundred lessons-worth of work is within reach.',
    icon: '⬢',
    // XP is awarded per lesson; 100 XP ≈ 10 completed lessons of base activity.
    check: (s) => s.lessonsCompleted >= 10,
  },
  {
    key: 'comeback',
    label: 'Comeback',
    blurb: 'Returned after a lapse — your best streak is behind you, but you came back.',
    icon: '↺',
    // Earned once a peak streak exists that the learner has since fallen from.
    check: (s) => s.longestStreak > s.currentStreak && s.longestStreak >= 3,
  },
] as const satisfies readonly Badge[]

/** Look up a badge by key (undefined for unknown keys). */
export function getBadge(badgeKey: string): Badge | undefined {
  return BADGE_CATALOG.find((b) => b.key === badgeKey)
}

/**
 * The capstone of the collection: the LAST badge in display order — the catalog's
 * intended pinnacle (today: 'Unbroken', the thirty-day streak). This is the only
 * honest "100%" the system actually backs: collecting the whole set culminates in
 * holding this badge. It invents NO reward beyond the real final badge itself.
 * Returns undefined only for an empty catalog.
 */
export function capstoneBadge(): Badge | undefined {
  return BADGE_CATALOG.length > 0 ? BADGE_CATALOG[BADGE_CATALOG.length - 1] : undefined
}

/** The keys of every badge whose deterministic check passes for these stats. */
export function earnedBadgeKeys(stats: BadgeStats): string[] {
  return BADGE_CATALOG.filter((b) => b.check(stats)).map((b) => b.key)
}

/**
 * Aggregate collection progress over the WHOLE catalog: how many badges the
 * learner holds, the catalog size, and how many remain. Pure + deterministic.
 * Derived from the same `check` predicates the shelf renders, so the "finish the
 * set" pull can never claim a count the badges don't back. `remaining` is clamped
 * to >= 0 so an over-counted earned set can't read as negative.
 */
export interface CollectionProgress {
  earned: number
  total: number
  remaining: number
  /** 0–100 of the set collected (0 when the catalog is empty). */
  pct: number
}

export function collectionProgress(stats: BadgeStats): CollectionProgress {
  const total = BADGE_CATALOG.length
  const earned = earnedBadgeKeys(stats).length
  const remaining = Math.max(0, total - earned)
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0
  return { earned, total, remaining, pct }
}

/**
 * Per-badge "distance to threshold". Mirrors the BADGE_CATALOG predicates by key
 * so the chain copy never claims a different bar than the badge actually checks.
 * Streak badges read against the BEST of current/longest (matching the catalog
 * `||` checks). Relative badges (e.g. 'comeback') have no linear threshold and are
 * omitted here — they can't be teased as "N steps away".
 *
 * NOTE: kept co-located with the catalog (the natural owner of these checks). The
 * server near-miss engine in reward-logic.ts mirrors this same mapping for its
 * single-badge hero; both stay in lockstep with the catalog by key.
 */
interface CatalogDistance {
  total: number
  current: number
}

function catalogDistance(key: string, s: BadgeStats): CatalogDistance | null {
  const bestStreak = Math.max(s.currentStreak, s.longestStreak)
  const map: Record<string, CatalogDistance> = {
    first_lesson: { current: s.lessonsCompleted, total: 1 },
    five_lessons: { current: s.lessonsCompleted, total: 5 },
    first_course: { current: s.coursesFinished, total: 1 },
    three_courses: { current: s.coursesFinished, total: 3 },
    first_cert: { current: s.certificates, total: 1 },
    three_certs: { current: s.certificates, total: 3 },
    first_project: { current: s.projects, total: 1 },
    streak_3: { current: bestStreak, total: 3 },
    streak_7: { current: bestStreak, total: 7 },
    streak_30: { current: bestStreak, total: 30 },
    hundred_xp: { current: s.lessonsCompleted, total: 10 },
  }
  return map[key] ?? null
}

/** The pluralised "what unlocks it" line for a badge that is `remaining` units away. */
function nextBadgeCopy(key: string, remaining: number): string {
  const n = remaining
  const plural = (word: string) => (n === 1 ? word : `${word}s`)
  switch (key) {
    case 'first_lesson':
    case 'five_lessons':
    case 'hundred_xp':
      return `${n} ${plural('lesson')} to`
    case 'first_course':
    case 'three_courses':
      return `${n} ${plural('course')} to`
    case 'first_cert':
    case 'three_certs':
      return `${n} ${plural('certificate')} to`
    case 'first_project':
      return `${n} ${plural('project')} to`
    case 'streak_3':
    case 'streak_7':
    case 'streak_30':
      return n === 1 ? '1 day to' : `${n} days to`
    default:
      return n === 1 ? '1 step to' : `${n} steps to`
  }
}

/**
 * One rung of the next-badge chain: a countable unearned badge with how far off it
 * is. `teaser` reads "2 lessons to" so the shelf can render "then 2 lessons to
 * Certified" — completing one hook re-arms the next.
 */
export interface NextBadgeStep {
  key: string
  label: string
  icon: string
  /** Units still needed (>= 1). */
  remaining: number
  /** 0–100 toward this badge's threshold. */
  pct: number
  /** Verb-free lead-in, e.g. '2 lessons to' (pair with the label: "… to Certified"). */
  teaser: string
}

/**
 * The ordered chain of the learner's NEAREST unearned badges (closest first),
 * ties broken by catalog order. Pure + deterministic — no clock, no randomness.
 * Badges with no linear threshold (e.g. 'comeback') are skipped. Caller passes the
 * server-verified earned keys; this only DISPLAYS distance, never claims a badge.
 *
 * @param limit max rungs to return (default 3: the hero + a short "then…" trail).
 */
export function nextBadges(stats: BadgeStats, earnedKeys: readonly string[], limit = 3): NextBadgeStep[] {
  const earned = new Set(earnedKeys)
  const steps: NextBadgeStep[] = []
  for (const badge of BADGE_CATALOG) {
    if (earned.has(badge.key)) continue
    const d = catalogDistance(badge.key, stats)
    if (!d) continue // relative badge (no countable threshold)
    const remaining = Math.max(0, d.total - d.current)
    if (remaining <= 0) continue // unearned by the row, but countably already cleared — skip
    steps.push({
      key: badge.key,
      label: badge.label,
      icon: badge.icon,
      remaining,
      pct: d.total > 0 ? Math.max(0, Math.min(100, Math.round((d.current / d.total) * 100))) : 0,
      teaser: nextBadgeCopy(badge.key, remaining),
    })
  }
  // Ascending by distance; ties keep catalog order (stable sort over catalog-ordered input).
  steps.sort((a, b) => a.remaining - b.remaining)
  return steps.slice(0, Math.max(0, limit))
}
