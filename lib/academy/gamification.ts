import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/server'
import { addLeagueXp } from '@/lib/academy/leagues'
import {
  XP_REWARDS,
  levelForXp,
  xpView,
  dateInTz,
  isoWeekStart,
  computeStreakTransition,
  type XpSource,
  type GamificationState,
} from '@/lib/academy/gamification-logic'

// Re-export the pure surface so existing server importers are unaffected.
export {
  XP_REWARDS,
  levelForXp,
  pickCelebration,
  STREAK_MILESTONES,
} from '@/lib/academy/gamification-logic'
export type { XpSource, GamificationState, Celebration } from '@/lib/academy/gamification-logic'

/**
 * Award XP for a completed action AND advance the streak + daily goal.
 * Streak math is delegated to the pure, unit-tested computeStreakTransition.
 * Service-role only (anti-cheat).
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
  const freezeDates: string[] = sRow?.freeze_used_dates ?? []
  const t = computeStreakTransition(
    {
      current: sRow?.current_length ?? 0,
      lastActive: (sRow?.last_active_date as string | null) ?? null,
      freezes: sRow?.freezes_available ?? 2,
    },
    today,
  )
  const longest = Math.max(sRow?.longest_length ?? 0, t.current)
  if (t.freezeUsed) {
    freezeDates.push(new Date(Date.parse(today) - 86_400_000).toISOString().slice(0, 10))
  }
  await sb.from('academy_streaks').upsert(
    {
      user_id: userId,
      current_length: t.current,
      longest_length: longest,
      last_active_date: today,
      timezone: tz,
      freezes_available: t.freezes,
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

  // ---- league XP (best-effort; never block the core award) ----
  try {
    await addLeagueXp(userId, xpGain)
  } catch (err) {
    console.error('[academy/gamification] addLeagueXp failed', err)
  }

  return {
    streak: { current: t.current, longest, freezes: t.freezes, activeToday: true },
    xp: xpView(total, weekly),
    dailyGoal: { goalXp, todayXp, met: goalJustMet || wasMet },
    awarded: { xp: xpGain, leveledUp, streakIncreased: t.increased, freezeUsed: t.freezeUsed, goalJustMet },
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

/**
 * Award bonus XP OUTSIDE the activity loop (referral rewards, etc.) — bumps
 * total/weekly XP + level + league standing, with no streak/daily-goal side
 * effects. Service-role only.
 */
export async function awardBonusXp(userId: string, amount: number): Promise<void> {
  if (!Number.isFinite(amount) || amount <= 0) return
  const sb = supabaseAdmin()
  const now = new Date()
  const weekStart = isoWeekStart(dateInTz(now, 'UTC'))
  const { data: x } = await sb.from('academy_xp').select('*').eq('user_id', userId).maybeSingle()
  const total = (x?.total_xp ?? 0) + amount
  const weekly = (x?.week_start === weekStart ? (x?.weekly_xp ?? 0) : 0) + amount
  // NOTE: read-modify-write; safe under the first-completion guard, but two truly
  // concurrent bonus awards could lose one. TODO: atomic SQL increment before scale.
  const { error } = await sb.from('academy_xp').upsert(
    { user_id: userId, total_xp: total, weekly_xp: weekly, week_start: weekStart, level: levelForXp(total), updated_at: now.toISOString() },
    { onConflict: 'user_id' },
  )
  if (error) console.error('[academy/gamification] awardBonusXp upsert failed', error)
  try {
    await addLeagueXp(userId, amount)
  } catch (err) {
    console.error('[academy/gamification] awardBonusXp league bump failed', err)
  }
}

/** Grant streak freezes (the referral reward currency). Service-role only. */
export async function grantFreezes(userId: string, count: number): Promise<void> {
  if (!Number.isInteger(count) || count <= 0) return
  const sb = supabaseAdmin()
  const { data: s } = await sb
    .from('academy_streaks')
    .select('freezes_available, timezone')
    .eq('user_id', userId)
    .maybeSingle()
  // Partial upsert is intentional — it must NOT reset current_length/longest on an
  // existing learner. All NOT-NULL streak columns have DB defaults, so a fresh
  // insert is safe.
  const { error } = await sb.from('academy_streaks').upsert(
    {
      user_id: userId,
      freezes_available: (s?.freezes_available ?? 2) + count,
      timezone: s?.timezone ?? 'UTC',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) console.error('[academy/gamification] grantFreezes upsert failed', error)
}
