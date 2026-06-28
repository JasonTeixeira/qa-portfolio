/**
 * Pure near-miss / next-reward logic — NO 'server-only', NO DB. Unit-testable in
 * isolation. The DB-touching layer (getNextRewards) lives in rewards.ts and imports
 * from here, so the tested logic IS the prod logic.
 *
 * The growth mandate: the engagement mechanisms are BUILT but read as STATIC
 * INVENTORY. This module turns "what you have" into "what you're ONE step from" —
 * the closest unearned badge, the XP to the next level, and the league gap to the
 * rank above. Every output is a deterministic function of the learner's REAL stats
 * (server-verified upstream), never a fabricated nudge.
 */

import type { BadgeStats } from '@/lib/academy/badges-logic'
import { BADGE_CATALOG } from '@/lib/academy/badges-logic'
import { XP_PER_LEVEL } from '@/lib/academy/gamification-logic'

/** The stat snapshot the near-miss engine reasons over: badge stats + longest streak. */
export type RewardStats = BadgeStats

/** The closest unearned badge, with a human "what unlocks it" line. */
export interface NextBadge {
  key: string
  label: string
  /** e.g. 'Ship 1 more project', 'Finish 2 more courses', '1 lesson to go'. */
  remainingLabel: string
  /** 0–100 toward the badge's threshold (for a literal progress bar). */
  pct: number
  /** Units still needed (>=1). Drives the remainingLabel + the pct. */
  remaining: number
}

/** The XP gap to overtake the learner one rank above in the weekly league. */
export interface NextRank {
  gapXp: number
  /** Display handle/label of the rank directly above (the one to overtake). */
  aheadOfRankLabel: string
}

export interface NextRewards {
  /** The closest unearned badge + its near-miss line (null = every badge earned). */
  nextBadge: NextBadge | null
  /** XP still needed to reach the next level (>=0). */
  xpToNextLevel: number
  /** 0–100 progress through the current level. */
  levelPct: number
  /** XP gap to the rank above in the weekly league (null if #1 / no league). */
  nextRank: NextRank | null
}

export interface ComputeNextRewardsInput {
  /** getLearnerStats shape PLUS longestStreak (the badge-stat snapshot). */
  stats: RewardStats
  /** Keys the learner has already earned (so we only chase what's left). */
  earnedBadgeKeys: string[]
  /** All-time XP total — drives level math. */
  totalXp: number
  /** Current level (1-based). */
  level: number
  /** This week's league roster, sorted by weeklyXp DESC. Optional. */
  leagueStandings?: ReadonlyArray<{ userId: string; weeklyXp: number; handle?: string }>
  /** The learner's id — used to locate them in the standings. */
  currentUserId?: string
}

/**
 * Per-badge "distance to threshold" descriptor. We map each catalog badge to the
 * single stat that gates it and how far the learner is from clearing it, so the
 * nearest unearned badge can be picked deterministically and rendered honestly.
 *
 * `remaining` is the count still needed (>=1 for an unearned badge). `total` is
 * the threshold (for the progress %). `noun` is the pluralisable unit; `verb`
 * shapes the call-to-action ('Ship', 'Finish', 'Earn', 'Reach', 'Complete').
 */
interface BadgeDistance {
  key: string
  remaining: number
  total: number
  current: number
}

/** How many of `metric` the learner has, vs a target — clamped to non-negative. */
function gap(current: number, target: number): { remaining: number; current: number; total: number } {
  return { remaining: Math.max(0, target - current), current, total: target }
}

/**
 * The threshold each catalog badge gates on, mapped from the learner's stats.
 * Mirrors the predicates in BADGE_CATALOG — kept in lockstep by key so the
 * near-miss copy never claims a different bar than the badge actually checks.
 * Streak badges read against the BEST of current/longest (matching the catalog
 * `||` checks) so a lapsed learner still sees how close their peak got them.
 */
function badgeDistance(key: string, s: RewardStats): BadgeDistance | null {
  const bestStreak = Math.max(s.currentStreak, s.longestStreak)
  const map: Record<string, { remaining: number; current: number; total: number }> = {
    first_lesson: gap(s.lessonsCompleted, 1),
    five_lessons: gap(s.lessonsCompleted, 5),
    first_course: gap(s.coursesFinished, 1),
    three_courses: gap(s.coursesFinished, 3),
    first_cert: gap(s.certificates, 1),
    three_certs: gap(s.certificates, 3),
    first_project: gap(s.projects, 1),
    streak_3: gap(bestStreak, 3),
    streak_7: gap(bestStreak, 7),
    streak_30: gap(bestStreak, 30),
    hundred_xp: gap(s.lessonsCompleted, 10),
  }
  const d = map[key]
  if (!d) return null // 'comeback' (and any future relative badge) has no linear threshold
  return { key, ...d }
}

/** The pluralised unit + verb used to render a badge's remaining line. */
function remainingCopy(key: string, remaining: number): string {
  const n = remaining
  const plural = (word: string) => (n === 1 ? word : `${word}s`)
  switch (key) {
    case 'first_lesson':
    case 'five_lessons':
    case 'hundred_xp':
      return `Finish ${n} more ${plural('lesson')}`
    case 'first_course':
    case 'three_courses':
      return `Finish ${n} more ${plural('course')}`
    case 'first_cert':
    case 'three_certs':
      return `Earn ${n} more ${plural('certificate')}`
    case 'first_project':
      return `Ship ${n} more ${plural('project')}`
    case 'streak_3':
    case 'streak_7':
    case 'streak_30':
      return n === 1 ? '1 more day on your streak' : `${n} more days on your streak`
    default:
      return n === 1 ? '1 step to go' : `${n} steps to go`
  }
}

/** Render a NextBadge from the catalog entry + its computed distance. */
export function renderNextBadge(d: BadgeDistance): NextBadge {
  const badge = BADGE_CATALOG.find((b) => b.key === d.key)
  const label = badge?.label ?? d.key
  const pct = d.total > 0 ? Math.max(0, Math.min(100, Math.round((d.current / d.total) * 100))) : 0
  return {
    key: d.key,
    label,
    remainingLabel: remainingCopy(d.key, d.remaining),
    pct,
    remaining: d.remaining,
  }
}

/**
 * Pick the unearned catalog badge the learner is NEAREST to reaching. Distance =
 * units still needed; ties break by catalog order (the first such badge in
 * BADGE_CATALOG wins, since we iterate in catalog order). Badges with no linear
 * threshold (e.g. 'comeback') are skipped. Returns null when nothing is left.
 */
function pickNextBadge(stats: RewardStats, earned: ReadonlySet<string>): NextBadge | null {
  let best: BadgeDistance | null = null
  for (const badge of BADGE_CATALOG) {
    if (earned.has(badge.key)) continue
    const d = badgeDistance(badge.key, stats)
    if (!d || d.remaining <= 0) continue // unreachable-by-counting, or already cleared
    // Strictly-less keeps catalog order on ties (first encountered wins).
    if (best === null || d.remaining < best.remaining) best = d
  }
  return best ? renderNextBadge(best) : null
}

/** XP still needed to reach the next level, given the all-time total. >= 0. */
function xpToNextLevel(totalXp: number): number {
  const safe = Math.max(0, totalXp)
  const intoLevel = safe % XP_PER_LEVEL
  return intoLevel === 0 && safe > 0 ? XP_PER_LEVEL : XP_PER_LEVEL - intoLevel
}

/** 0–100 progress through the current level. */
function levelPctFor(totalXp: number): number {
  const safe = Math.max(0, totalXp)
  const intoLevel = safe % XP_PER_LEVEL
  return Math.round((intoLevel / XP_PER_LEVEL) * 100)
}

/**
 * XP gap to overtake the learner one rank above in the weekly league. Standings
 * must be sorted by weeklyXp DESC. Returns null when the learner is #1, absent
 * from the roster, or there's no league. gapXp is the XP that, once earned, puts
 * the learner strictly above the person ahead (their lead + 1), so it never reads
 * "0 to overtake" while still behind.
 */
function computeNextRank(
  standings: ReadonlyArray<{ userId: string; weeklyXp: number; handle?: string }> | undefined,
  currentUserId: string | undefined,
): NextRank | null {
  if (!standings || standings.length === 0 || !currentUserId) return null
  const idx = standings.findIndex((m) => m.userId === currentUserId)
  if (idx <= 0) return null // not found (-1) or already #1 (0)
  const me = standings[idx]
  const ahead = standings[idx - 1]
  const lead = Math.max(0, ahead.weeklyXp - me.weeklyXp)
  return {
    gapXp: lead + 1, // +1 → strictly overtake, never a misleading "0 to pass"
    aheadOfRankLabel: ahead.handle ?? `Rank ${idx}`,
  }
}

/**
 * The near-miss engine. Pure + deterministic: same input → same output, no clock,
 * no randomness. Surfaces the single closest reward in each lane (badge, level,
 * league) so the dashboard/profile can PULL the learner forward instead of merely
 * reporting static inventory.
 */
export function computeNextRewards(input: ComputeNextRewardsInput): NextRewards {
  const earned = new Set(input.earnedBadgeKeys)
  return {
    nextBadge: pickNextBadge(input.stats, earned),
    xpToNextLevel: xpToNextLevel(input.totalXp),
    levelPct: levelPctFor(input.totalXp),
    nextRank: computeNextRank(input.leagueStandings, input.currentUserId),
  }
}
