import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { dateInTz, isoWeekStart } from '@/lib/academy/gamification-logic'
import {
  computeQuests,
  type QuestActivity,
  type QuestProgress,
} from '@/lib/academy/quest-logic'

// Re-export the pure surface so server importers have one entry point.
export {
  DAILY_QUESTS,
  WEEKLY_QUESTS,
  computeQuests,
  variableXpBonus,
} from '@/lib/academy/quest-logic'
export type { Quest, QuestProgress, QuestScope, QuestMetric, QuestActivity } from '@/lib/academy/quest-logic'

const EMPTY_ACTIVITY: QuestActivity = {
  lessonsToday: 0,
  xpToday: 0,
  reviewsToday: 0,
  lessonsThisWeek: 0,
  labsThisWeek: 0,
  streakDays: 0,
}

/** Count rows in `events` whose event_type is in `types`. */
function countOf(events: { event_type: string }[], types: readonly string[]): number {
  return events.filter((e) => types.includes(e.event_type)).length
}

/**
 * Build the real activity snapshot the quest catalogs are evaluated against.
 *
 * Windows are computed in UTC to match the gamification helpers:
 *  - today's start = midnight UTC of the current date
 *  - this-week's start = ISO week start (Monday) midnight UTC
 *
 * Sources (all service-role reads, anti-cheat — never client-claimed):
 *  - academy_evidence_events → lesson/review/lab counts in each window
 *  - academy_xp              → today's earned XP (academy_daily_goals.today_xp,
 *    reset per-day by the award path) — read here off daily_goals
 *  - academy_streaks         → current streak length
 */
async function getActivity(userId: string): Promise<QuestActivity> {
  try {
    const admin = supabaseAdmin()
    const now = new Date()
    const today = dateInTz(now, 'UTC') // YYYY-MM-DD
    const todayStartIso = `${today}T00:00:00.000Z`
    const weekStartIso = `${isoWeekStart(today)}T00:00:00.000Z`

    const [{ data: weekEvents }, { data: goalRow }, { data: streakRow }] = await Promise.all([
      // One read for the whole week window; today is a sub-window of it.
      admin
        .from('academy_evidence_events')
        .select('event_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', weekStartIso),
      admin
        .from('academy_daily_goals')
        .select('today_date, today_xp')
        .eq('user_id', userId)
        .maybeSingle(),
      admin
        .from('academy_streaks')
        .select('current_length')
        .eq('user_id', userId)
        .maybeSingle(),
    ])

    const week = (weekEvents ?? []) as { event_type: string; created_at: string }[]
    const todayEvents = week.filter((e) => (e.created_at ?? '') >= todayStartIso)

    // today_xp is only meaningful when the stored day matches the current day.
    const xpToday = goalRow?.today_date === today ? (goalRow?.today_xp ?? 0) : 0

    return {
      lessonsToday: countOf(todayEvents, ['lesson_completed']),
      xpToday,
      reviewsToday: countOf(todayEvents, ['retrieval_attempted', 'repair_completed']),
      lessonsThisWeek: countOf(week, ['lesson_completed']),
      labsThisWeek: countOf(week, ['lab_verified']),
      streakDays: streakRow?.current_length ?? 0,
    }
  } catch (err) {
    console.error('[academy/quests] getActivity failed', err)
    return EMPTY_ACTIVITY
  }
}

/** Today's quests with honest, server-derived progress. Read-only. */
export async function getDailyQuests(userId: string): Promise<QuestProgress[]> {
  const activity = await getActivity(userId)
  return computeQuests('daily', activity)
}

/** This week's quests with honest, server-derived progress. Read-only. */
export async function getWeeklyQuests(userId: string): Promise<QuestProgress[]> {
  const activity = await getActivity(userId)
  return computeQuests('weekly', activity)
}
