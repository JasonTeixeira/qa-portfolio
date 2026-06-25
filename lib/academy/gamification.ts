import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * Phase 1 habit core — streaks (+freeze), XP/levels, daily goal.
 * All WRITES go through the service role (anti-cheat: a learner must never be
 * able to set their own XP/streak). See docs/academy/BUILD_AND_TEST_PLAN.md.
 */

export const XP_REWARDS = { lesson: 20, lab: 30, quiz: 15, review: 10 } as const
export type XpSource = keyof typeof XP_REWARDS

const XP_PER_LEVEL = 150

export function levelForXp(totalXp: number): number {
  return Math.floor(Math.max(0, totalXp) / XP_PER_LEVEL) + 1
}

/** ISO date (YYYY-MM-DD) for `now` in the given IANA timezone. */
function dateInTz(now: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  } catch {
    return now.toISOString().slice(0, 10)
  }
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

export interface GamificationState {
  streak: { current: number; longest: number; freezes: number; activeToday: boolean }
  xp: { total: number; weekly: number; level: number; intoLevel: number; toNext: number; pct: number }
  dailyGoal: { goalXp: number; todayXp: number; met: boolean }
  awarded?: { xp: number; leveledUp: boolean; streakIncreased: boolean; freezeUsed: boolean; goalJustMet: boolean }
}

function xpView(total: number, weekly: number) {
  const level = levelForXp(total)
  const intoLevel = total - (level - 1) * XP_PER_LEVEL
  return { total, weekly, level, intoLevel, toNext: XP_PER_LEVEL - intoLevel, pct: Math.round((intoLevel / XP_PER_LEVEL) * 100) }
}

function isoWeekStart(today: string): string {
  const d = new Date(today + 'T00:00:00Z')
  const dow = (d.getUTCDay() + 6) % 7 // Mon=0
  d.setUTCDate(d.getUTCDate() - dow)
  return d.toISOString().slice(0, 10)
}

/**
 * Award XP for a completed action AND advance the streak + daily goal.
 * Idempotent-ish per day for the streak (multiple actions in a day don't
 * inflate the streak); XP accrues per action. Service-role only.
 */
export async function recordActivityAndAward(
  userId: string,
  source: XpSource,
  now: Date = new Date(),
): Promise<GamificationState> {
  const sb = supabaseAdmin()
  const xpGain = XP_REWARDS[source]

  // ---- streak ----
  const { data: sRow } = await sb.from('academy_streaks').select('*').eq('user_id', userId).maybeSingle()
  const tz = sRow?.timezone ?? 'UTC'
  const today = dateInTz(now, tz)
  let current = sRow?.current_length ?? 0
  let longest = sRow?.longest_length ?? 0
  let freezes = sRow?.freezes_available ?? 2
  const freezeDates: string[] = sRow?.freeze_used_dates ?? []
  let freezeUsed = false
  const prevActive = sRow?.last_active_date as string | null | undefined
  const activeTodayAlready = prevActive === today

  if (!activeTodayAlready) {
    if (!prevActive) {
      current = 1
    } else {
      const gap = daysBetween(prevActive, today)
      if (gap === 1) {
        current += 1
      } else if (gap === 2 && freezes > 0) {
        current += 1
        freezes -= 1
        freezeUsed = true
        const missed = new Date(Date.parse(today) - 86_400_000).toISOString().slice(0, 10)
        freezeDates.push(missed)
      } else {
        current = 1
      }
    }
    longest = Math.max(longest, current)
  }
  const streakIncreased = !activeTodayAlready

  await sb.from('academy_streaks').upsert(
    {
      user_id: userId,
      current_length: current,
      longest_length: longest,
      last_active_date: today,
      timezone: tz,
      freezes_available: freezes,
      freeze_used_dates: freezeDates,
      updated_at: now.toISOString(),
    },
    { onConflict: 'user_id' },
  )

  // ---- xp / level ----
  const { data: xRow } = await sb.from('academy_xp').select('*').eq('user_id', userId).maybeSingle()
  const prevTotal = xRow?.total_xp ?? 0
  const weekStart = isoWeekStart(today)
  const weekly = (xRow?.week_start === weekStart ? (xRow?.weekly_xp ?? 0) : 0) + xpGain
  const total = prevTotal + xpGain
  const leveledUp = levelForXp(total) > levelForXp(prevTotal)
  await sb.from('academy_xp').upsert(
    { user_id: userId, total_xp: total, weekly_xp: weekly, week_start: weekStart, level: levelForXp(total), updated_at: now.toISOString() },
    { onConflict: 'user_id' },
  )

  // ---- daily goal ----
  const { data: gRow } = await sb.from('academy_daily_goals').select('*').eq('user_id', userId).maybeSingle()
  const goalXp = gRow?.goal_xp ?? 30
  const todayXp = (gRow?.today_date === today ? (gRow?.today_xp ?? 0) : 0) + xpGain
  const wasMet = gRow?.last_met_date === today
  const goalJustMet = !wasMet && todayXp >= goalXp
  await sb.from('academy_daily_goals').upsert(
    {
      user_id: userId,
      goal_xp: goalXp,
      today_date: today,
      today_xp: todayXp,
      last_met_date: goalJustMet || wasMet ? today : (gRow?.last_met_date ?? null),
      updated_at: now.toISOString(),
    },
    { onConflict: 'user_id' },
  )

  return {
    streak: { current, longest, freezes, activeToday: true },
    xp: xpView(total, weekly),
    dailyGoal: { goalXp, todayXp, met: goalJustMet || wasMet },
    awarded: { xp: xpGain, leveledUp, streakIncreased, freezeUsed, goalJustMet },
  }
}

/** Read-only snapshot for display (header widget, dashboard). Service-role read. */
export async function getGamification(userId: string): Promise<GamificationState> {
  const sb = supabaseAdmin()
  const today = dateInTz(new Date(), 'UTC')
  const [{ data: s }, { data: x }, { data: g }] = await Promise.all([
    sb.from('academy_streaks').select('*').eq('user_id', userId).maybeSingle(),
    sb.from('academy_xp').select('*').eq('user_id', userId).maybeSingle(),
    sb.from('academy_daily_goals').select('*').eq('user_id', userId).maybeSingle(),
  ])
  const weekStart = isoWeekStart(today)
  return {
    streak: {
      current: s?.current_length ?? 0,
      longest: s?.longest_length ?? 0,
      freezes: s?.freezes_available ?? 0,
      activeToday: s?.last_active_date === today,
    },
    xp: xpView(x?.total_xp ?? 0, x?.week_start === weekStart ? (x?.weekly_xp ?? 0) : 0),
    dailyGoal: {
      goalXp: g?.goal_xp ?? 30,
      todayXp: g?.today_date === today ? (g?.today_xp ?? 0) : 0,
      met: g?.last_met_date === today,
    },
  }
}
