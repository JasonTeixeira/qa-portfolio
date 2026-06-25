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

/** First published lesson to drop a new learner into. Falls back gracefully. */
export async function recommendedFirstLessonHref(): Promise<string> {
  const sb = supabaseAdmin()
  const { data: course } = await sb
    .from('academy_courses')
    .select('slug')
    .eq('status', 'published')
    .order('sort', { ascending: true })
    .limit(1)
    .maybeSingle()
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
