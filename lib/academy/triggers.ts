import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { dateInTz, daysBetween } from '@/lib/academy/gamification-logic'
import { computeTriggers, type Trigger, type TriggerState } from '@/lib/academy/trigger-logic'

// Re-export the pure surface so server importers have one entry point.
export { computeTriggers } from '@/lib/academy/trigger-logic'
export type { Trigger, TriggerKind, TriggerTone, TriggerState } from '@/lib/academy/trigger-logic'

/** The most triggers we surface at once — keep the banner row calm, never a wall. */
const MAX_SURFACED = 2

const EMPTY_STATE: TriggerState = {
  streakActiveToday: false,
  currentStreak: 0,
  hoursUntilReset: null,
  reviewsDue: 0,
  lessonsToCert: null,
  dailyGoalPct: 0,
  lapsedDays: 0,
  startedAnyLesson: false,
}

const MS_PER_HOUR = 60 * 60 * 1000

/**
 * Whole hours from `now` until the next UTC day boundary — i.e. when a streak that
 * hasn't been kept alive today will reset. Streak windows are UTC (see dateInTz
 * usage below), so the reset is UTC midnight. Always returns >= 1 so the nudge copy
 * never reads "0h"; the final partial hour still rounds up to "1h left".
 */
function hoursUntilUtcMidnight(now: Date): number {
  const nextMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  )
  const hours = Math.ceil((nextMidnight - now.getTime()) / MS_PER_HOUR)
  return Math.max(1, hours)
}

/**
 * Build the real trigger state for a learner from service-role reads, run the pure
 * computeTriggers, and return the top 1-2 (highest-priority first).
 *
 * All windows are computed in UTC to match the gamification/quest helpers:
 *  - "active today" = academy_streaks.last_active_date == today (UTC)
 *  - "lapsed days"  = whole days between last_active_date and today
 *
 * Sources (all anti-cheat service-role reads, never client-claimed):
 *  - academy_streaks       → current_length, last_active_date
 *  - academy_reviews       → count of cards with fsrs_due_at <= now
 *  - academy_daily_goals   → goal_xp / today_xp (only when today_date == today)
 *  - academy_progress (+ academy_courses) → nearest in-progress course's
 *    lessons-to-finish and whether any lesson has been started
 *
 * Failures degrade to no triggers — a nudge engine must never break the page.
 */
export async function getTriggers(userId: string, resumeHref: string): Promise<Trigger[]> {
  const state = await buildTriggerState(userId)
  return computeTriggers(state, resumeHref).slice(0, MAX_SURFACED)
}

async function buildTriggerState(userId: string): Promise<TriggerState> {
  try {
    const admin = supabaseAdmin()
    const now = new Date()
    const today = dateInTz(now, 'UTC')
    const nowIso = now.toISOString()

    const [{ data: streak }, { count: reviewsDue }, { data: goal }, { data: progress }] =
      await Promise.all([
        admin
          .from('academy_streaks')
          .select('current_length, last_active_date')
          .eq('user_id', userId)
          .maybeSingle(),
        admin
          .from('academy_reviews')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .lte('fsrs_due_at', nowIso),
        admin
          .from('academy_daily_goals')
          .select('goal_xp, today_xp, today_date')
          .eq('user_id', userId)
          .maybeSingle(),
        admin
          .from('academy_progress')
          .select('course_slug, status')
          .eq('user_id', userId),
      ])

    const lastActive = (streak?.last_active_date as string | null) ?? null
    const currentStreak = streak?.current_length ?? 0
    const streakActiveToday = lastActive === today
    // Only meaningful when a streak is alive AND not yet secured today — that's the
    // window where the reset countdown creates honest urgency.
    const hoursUntilReset =
      currentStreak >= 1 && !streakActiveToday ? hoursUntilUtcMidnight(now) : null
    // Whole days away (never negative); 0 when there's no recorded activity yet.
    const lapsedDays = lastActive ? Math.max(0, daysBetween(lastActive, today)) : 0

    // today_xp/goal_xp only count when the stored day is the current day.
    const goalXp = goal?.goal_xp ?? 0
    const todayXp = goal?.today_date === today ? (goal?.today_xp ?? 0) : 0
    const dailyGoalPct = goalXp > 0 ? Math.min(100, Math.round((todayXp / goalXp) * 100)) : 0

    const rows = progress ?? []
    const startedAnyLesson = rows.length > 0
    const lessonsToCert = await nearestLessonsToCert(admin, rows)

    return {
      streakActiveToday,
      currentStreak,
      hoursUntilReset,
      reviewsDue: reviewsDue ?? 0,
      lessonsToCert,
      dailyGoalPct,
      lapsedDays,
      startedAnyLesson,
    }
  } catch (err) {
    console.error('[academy/triggers] buildTriggerState failed', err)
    return EMPTY_STATE
  }
}

/**
 * Lessons left to finish the nearest in-progress course (the one closest to a
 * certificate). Returns null when no course is partway done — only courses with
 * at least one completed lesson and at least one remaining lesson qualify, so the
 * "near-cert" nudge never fires for an untouched or already-finished course.
 */
async function nearestLessonsToCert(
  admin: ReturnType<typeof supabaseAdmin>,
  rows: { course_slug: string; status: string }[],
): Promise<number | null> {
  const doneByCourse = new Map<string, number>()
  for (const r of rows) {
    if (r.status === 'completed') doneByCourse.set(r.course_slug, (doneByCourse.get(r.course_slug) ?? 0) + 1)
  }
  const slugs = [...doneByCourse.keys()]
  if (slugs.length === 0) return null

  const { data: courseMeta } = await admin.from('academy_courses').select('slug, lessons').in('slug', slugs)
  const totalBySlug = new Map((courseMeta ?? []).map((c) => [c.slug as string, (c.lessons as number) ?? 0]))

  let nearest: number | null = null
  for (const [slug, done] of doneByCourse) {
    const total = totalBySlug.get(slug) ?? 0
    const remaining = total - done
    // Only in-progress courses: some lessons done, some still remaining.
    if (total > 0 && remaining > 0 && (nearest === null || remaining < nearest)) {
      nearest = remaining
    }
  }
  return nearest
}
