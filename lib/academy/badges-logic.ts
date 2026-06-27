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

/** The keys of every badge whose deterministic check passes for these stats. */
export function earnedBadgeKeys(stats: BadgeStats): string[] {
  return BADGE_CATALOG.filter((b) => b.check(stats)).map((b) => b.key)
}
