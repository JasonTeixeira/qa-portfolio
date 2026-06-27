/**
 * Pure first-win logic — NO 'server-only', NO DB. Unit-testable in isolation.
 * The DB-touching layer (recordFirstWin, in onboarding.ts) imports from here so
 * the tested logic IS the prod logic.
 *
 * The "first win" is the single highest-leverage retention lever: the new learner
 * must DO something real and succeed inside their first minute, BEFORE sinking into
 * a long lesson. We make that win genuine by recording a real `academy_progress`
 * row (status 'in_progress') for the lesson they're about to open. That row is what
 * `getLearnerStats.startedAnyLesson` (rows.length > 0) reads, which in turn flips the
 * goal's first milestone (`start-lesson`) to done via computeGoalProgress. No fake
 * XP, no fake completion — the milestone is true because the state is true.
 */

import { computeGoalProgress, type GoalStats, type GoalProgress } from '@/lib/academy/goal-logic'

/** The milestone key the first-win interaction is designed to satisfy. */
export const FIRST_WIN_MILESTONE_KEY = 'start-lesson'

/** A lesson reference the first win is anchored to. */
export interface FirstWinTarget {
  courseSlug: string
  lessonSlug: string
  /** Deep link into the exact lesson — the dominant next-step CTA. */
  href: string
}

/**
 * Build the deep-link href for a resolved first-win target. Pure so the routing
 * convention is tested once and reused by both the recorder and any caller that
 * only has the slugs.
 */
export function firstWinHref(courseSlug: string, lessonSlug: string): string {
  return `/academy/learn/${courseSlug}/${lessonSlug}`
}

/** The data the first-win celebration screen renders, derived from REAL stats. */
export interface FirstWinSummary {
  /** True once the learner has a real started/completed lesson row (the genuine win). */
  won: boolean
  goalKey: string
  goalLabel: string
  /** The milestone that the first win lit up (label for the celebration copy). */
  milestoneLabel: string
  /** Full goal progress so the screen can show the milestone genuinely checked. */
  progress: GoalProgress
  /** The single dominant next step into the real lesson. */
  nextHref: string
}

/**
 * Build the celebration summary from the learner's chosen goal, their REAL stats,
 * and the resolved first-win target. The `won` flag is derived from actual stats
 * (startedAnyLesson || lessonsCompleted >= 1) — never asserted by the UI — so the
 * congratulation can't be theatre: if the row didn't record, won is false and the
 * screen degrades to a plain "open your first lesson" CTA instead of lying.
 */
export function buildFirstWinSummary(
  goalKey: string,
  stats: GoalStats,
  target: FirstWinTarget,
): FirstWinSummary {
  const progress = computeGoalProgress(goalKey, stats)
  const milestone = progress.milestones.find((m) => m.key === FIRST_WIN_MILESTONE_KEY)
  const won = stats.startedAnyLesson || stats.lessonsCompleted >= 1
  return {
    won,
    goalKey: progress.goalKey,
    goalLabel: progress.label,
    milestoneLabel: milestone?.label ?? 'Start your first lesson',
    progress,
    nextHref: target.href,
  }
}
