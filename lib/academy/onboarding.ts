import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getLearnerGoal, getLearnerStats } from '@/lib/academy/goals'
import {
  buildFirstWinSummary,
  firstWinHref,
  type FirstWinSummary,
} from '@/lib/academy/first-win-logic'

/**
 * Onboarding (Phase 1, dim 2) — the "understand the game" first run. Stores the
 * learner's goal + calibration + daily-goal commitment, then drops them into the
 * first real lesson (the aha). Content-agnostic: the recommended first lesson is
 * resolved from whatever published content exists.
 */

export interface OnboardingInput {
  goal: string
  motivation?: string | null
  calibrationLevel: string
  dailyGoalXp: number
}

export async function isOnboarded(userId: string): Promise<boolean> {
  const sb = supabaseAdmin()
  const { data } = await sb.from('academy_onboarding').select('completed_at').eq('user_id', userId).maybeSingle()
  return Boolean(data?.completed_at)
}

export async function saveOnboarding(userId: string, input: OnboardingInput): Promise<void> {
  const sb = supabaseAdmin()
  const now = new Date().toISOString()
  await sb.from('academy_onboarding').upsert(
    {
      user_id: userId,
      goal: input.goal,
      motivation: input.motivation ?? null,
      calibration_level: input.calibrationLevel,
      daily_goal_xp: input.dailyGoalXp,
      completed_at: now,
      updated_at: now,
    },
    { onConflict: 'user_id' },
  )
  // Apply the chosen daily goal.
  await sb
    .from('academy_daily_goals')
    .upsert({ user_id: userId, goal_xp: input.dailyGoalXp, updated_at: now }, { onConflict: 'user_id' })
}

/** The beginner on-ramp we steer first-time learners into for a guaranteed first win. */
const FIRST_WIN_COURSE_SLUG = 'programming-fundamentals'

/** A resolved first-published-lesson target, or a non-lesson fallback href. */
type ResolvedFirstLesson =
  | { kind: 'lesson'; courseSlug: string; lessonSlug: string; href: string }
  | { kind: 'fallback'; href: string }

/**
 * Resolve the first published lesson a new learner should land in. Prefers the
 * beginner on-ramp course when published, then the lowest-sort published course,
 * then the catalog. Never dead-ends. Returns the slugs so callers can record a real
 * first-win progress row against the exact lesson.
 */
async function resolveFirstLesson(): Promise<ResolvedFirstLesson> {
  const sb = supabaseAdmin()
  // Prefer the beginner on-ramp; fall back to the first published course by sort.
  const { data: preferred } = await sb
    .from('academy_courses')
    .select('slug')
    .eq('status', 'published')
    .eq('slug', FIRST_WIN_COURSE_SLUG)
    .maybeSingle()
  const course =
    preferred ??
    (
      await sb
        .from('academy_courses')
        .select('slug')
        .eq('status', 'published')
        .order('sort', { ascending: true })
        .limit(1)
        .maybeSingle()
    ).data
  if (!course) return { kind: 'fallback', href: '/academy/catalog' }
  const { data: lesson } = await sb
    .from('academy_lessons')
    .select('slug')
    .eq('course_slug', course.slug)
    .eq('status', 'published')
    .order('module_sort', { ascending: true })
    .order('sort', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!lesson) return { kind: 'fallback', href: `/academy/course/${course.slug}` }
  return {
    kind: 'lesson',
    courseSlug: course.slug,
    lessonSlug: lesson.slug,
    href: firstWinHref(course.slug, lesson.slug),
  }
}

/**
 * First published lesson to drop a new learner into — the guaranteed first win.
 * Thin wrapper over resolveFirstLesson for callers that only need the href.
 */
export async function recommendedFirstLessonHref(): Promise<string> {
  return (await resolveFirstLesson()).href
}

/** The outcome of the first-win interaction: a genuine summary or a no-lesson fallback. */
export type FirstWinResult =
  | { kind: 'won'; summary: FirstWinSummary }
  | { kind: 'fallback'; href: string }

/**
 * The GUARANTEED first win. Records a REAL `academy_progress` row (status
 * 'in_progress') for the learner's recommended first lesson, then returns a summary
 * derived from their real stats. This is the genuine, sub-60-second win:
 *
 *   - The row truly exists in the DB (idempotent upsert, RLS-equivalent: keyed to
 *     the authenticated userId via service role) → getLearnerStats.startedAnyLesson
 *     becomes true → the goal's `start-lesson` milestone is computed as DONE.
 *   - No XP/streak is awarded here: starting is not finishing, so we don't fake the
 *     habit counters. The win is "you've taken the first real step toward your goal",
 *     which is exactly what the recorded state proves.
 *   - If no lesson exists to start (empty catalog), we DON'T fabricate a win — we
 *     return a fallback href so the screen degrades honestly.
 *
 * Idempotent: re-running never double-records and never overwrites a 'completed' row
 * (we only upsert when there is no existing row for the lesson).
 */
export async function recordFirstWin(userId: string): Promise<FirstWinResult> {
  const target = await resolveFirstLesson()
  if (target.kind !== 'lesson') return { kind: 'fallback', href: target.href }

  const sb = supabaseAdmin()
  // Only seed an 'in_progress' row when none exists — never clobber real progress
  // (a returning learner who already completed/started this lesson keeps their row).
  const { data: existing } = await sb
    .from('academy_progress')
    .select('status')
    .eq('user_id', userId)
    .eq('lesson_slug', target.lessonSlug)
    .maybeSingle()
  if (!existing) {
    const now = new Date().toISOString()
    const { error } = await sb.from('academy_progress').upsert(
      {
        user_id: userId,
        course_slug: target.courseSlug,
        lesson_slug: target.lessonSlug,
        status: 'in_progress',
        updated_at: now,
      },
      { onConflict: 'user_id,lesson_slug' },
    )
    if (error) {
      // Don't fake the win: if the row didn't record, send them to the lesson plainly.
      console.error('[academy/onboarding] recordFirstWin upsert failed', error)
      return { kind: 'fallback', href: target.href }
    }
  }

  // Build the summary from REAL post-write state (goal + stats read fresh).
  const goalKey = (await getLearnerGoal(userId)) ?? 'explore'
  const stats = await getLearnerStats(userId)
  const summary = buildFirstWinSummary(goalKey, stats, {
    courseSlug: target.courseSlug,
    lessonSlug: target.lessonSlug,
    href: target.href,
  })
  return { kind: 'won', summary }
}
