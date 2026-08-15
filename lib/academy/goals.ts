import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import type { GoalStats } from '@/lib/academy/goal-logic'

// Re-export the pure surface so existing server importers are unaffected.
export {
  GOAL_CATALOG,
  getGoal,
  computeGoalProgress,
} from '@/lib/academy/goal-logic'
export type { Goal, Milestone, GoalStats, GoalProgress, MilestoneProgress } from '@/lib/academy/goal-logic'

/** The learner's chosen goal key, or null if they haven't set one. Service-role read. */
export async function getLearnerGoal(userId: string): Promise<string | null> {
  try {
    const admin = supabaseAdmin()
    const { data } = await admin
      .from('academy_goals')
      .select('goal_key')
      .eq('user_id', userId)
      .maybeSingle()
    return (data?.goal_key as string | undefined) ?? null
  } catch (err) {
    console.error('[academy/goals] getLearnerGoal failed', err)
    return null
  }
}

/**
 * Roll the learner's engagement into the stat snapshot the goal milestones check
 * against. A course is "finished" when its completed-lesson count >= the course's
 * published lesson total (academy_courses.lessons). Service-role read.
 */
export async function getLearnerStats(userId: string): Promise<GoalStats> {
  const empty: GoalStats = {
    lessonsCompleted: 0,
    coursesFinished: 0,
    certificates: 0,
    projects: 0,
    currentStreak: 0,
    startedAnyLesson: false,
  }
  try {
    const admin = supabaseAdmin()
    const [{ data: progress }, { count: certCount }, { count: projectCount }, { data: streak }] =
      await Promise.all([
        admin.from('academy_progress').select('course_slug, status').eq('user_id', userId),
        admin.from('academy_certificates').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        admin.from('academy_artifacts').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        admin.from('academy_streaks').select('current_length').eq('user_id', userId).maybeSingle(),
      ])

    const rows = progress ?? []
    const lessonsCompleted = rows.filter((r) => r.status === 'completed').length

    // completed lessons per course → finished when >= the course's published total
    const doneByCourse = new Map<string, number>()
    for (const r of rows) {
      if (r.status === 'completed') doneByCourse.set(r.course_slug, (doneByCourse.get(r.course_slug) ?? 0) + 1)
    }
    const slugs = [...doneByCourse.keys()]
    const courseMeta = slugs.length
      ? (await admin.from('academy_courses').select('slug, lessons').in('slug', slugs)).data ?? []
      : []
    const totalBySlug = new Map(courseMeta.map((c) => [c.slug as string, (c.lessons as number) ?? 0]))
    let coursesFinished = 0
    for (const [slug, done] of doneByCourse) {
      const total = totalBySlug.get(slug) ?? 0
      if (total > 0 && done >= total) coursesFinished += 1
    }

    return {
      lessonsCompleted,
      coursesFinished,
      certificates: certCount ?? 0,
      projects: projectCount ?? 0,
      currentStreak: streak?.current_length ?? 0,
      startedAnyLesson: rows.length > 0,
    }
  } catch (err) {
    console.error('[academy/goals] getLearnerStats failed', err)
    return empty
  }
}
