import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/server'

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

/**
 * First published lesson to drop a new learner into — the guaranteed first win.
 * Prefers the beginner on-ramp course when it's published, then falls back to the
 * lowest-sort published course, then the catalog. Never dead-ends.
 */
export async function recommendedFirstLessonHref(): Promise<string> {
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
  if (!course) return '/academy/catalog'
  const { data: lesson } = await sb
    .from('academy_lessons')
    .select('slug')
    .eq('course_slug', course.slug)
    .eq('status', 'published')
    .order('module_sort', { ascending: true })
    .order('sort', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!lesson) return `/academy/course/${course.slug}`
  return `/academy/learn/${course.slug}/${lesson.slug}`
}
