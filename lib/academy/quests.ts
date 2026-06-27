import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { dateInTz, isoWeekStart } from '@/lib/academy/gamification-logic'
import { awardBonusXp } from '@/lib/academy/gamification'
import {
  computeQuests,
  dailyBonus,
  resolveDailyBonus,
  type BonusState,
  type QuestActivity,
  type QuestProgress,
} from '@/lib/academy/quest-logic'
import { emitAcademyEvent } from '@/lib/academy/events'

// Re-export the pure surface so server importers have one entry point.
export {
  DAILY_QUESTS,
  WEEKLY_QUESTS,
  computeQuests,
  variableXpBonus,
  dailyBonus,
  resolveDailyBonus,
  bonusSeedFromString,
} from '@/lib/academy/quest-logic'
export type {
  Quest,
  QuestProgress,
  QuestScope,
  QuestMetric,
  QuestActivity,
  DailyBonus,
  BonusState,
} from '@/lib/academy/quest-logic'

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

/**
 * Today's variable-ratio surprise bonus, resolved against the learner's REAL
 * activity. The bonus *spec* is a pure function of (userId, UTC date) so it
 * varies per day/learner yet is reproducible + verifiable server-side; the
 * reward amount and collected flag are pure functions of the real activity
 * snapshot — the learner never claims a raw number. Read-only.
 *
 * The same `dailyBonus(userId, today)` derivation is what the XP award path
 * re-derives to verify a multiplier/flat payout, so the panel can never show a
 * reward the server wouldn't actually grant.
 */
export async function getDailyBonus(userId: string): Promise<BonusState> {
  const activity = await getActivity(userId)
  const today = dateInTz(new Date(), 'UTC')
  const state = resolveDailyBonus(dailyBonus(userId, today), activity)
  // "Banked" is true ONLY when a real claim row exists (XP actually credited) —
  // the panel never says "banked" for a payout that didn't happen. Pre-claim it
  // shows as the armed incentive; the claim is written by awardDailyBonusIfEarned.
  const sb = supabaseAdmin()
  const { data: claim } = await sb
    .from('academy_daily_bonus_claims')
    .select('awarded_xp')
    .eq('user_id', userId)
    .eq('claim_date', today)
    .maybeSingle()
  if (claim) return { ...state, collected: true, rewardXp: claim.awarded_xp }
  return { ...state, collected: false }
}

/**
 * Credit today's variable-reward bonus IF it's genuinely earned, exactly once.
 * Called from the activity award paths (lesson/review) AFTER the base XP is
 * recorded, so the fresh activity snapshot reflects the just-completed action.
 * Re-derives the deterministic bonus server-side and gates the payout on the
 * learner's REAL activity — never a client claim. Idempotent: the (user, day) PK
 * + ignore-duplicates upsert pays at most once per UTC day even under concurrency.
 * Returns the XP credited (0 if not earned or already claimed today).
 */
export async function awardDailyBonusIfEarned(userId: string): Promise<number> {
  const today = dateInTz(new Date(), 'UTC')
  const activity = await getActivity(userId)
  const spec = dailyBonus(userId, today)
  const state = resolveDailyBonus(spec, activity)
  if (!state.collected || state.rewardXp <= 0) return 0
  const sb = supabaseAdmin()
  const { data: inserted, error } = await sb
    .from('academy_daily_bonus_claims')
    .upsert(
      { user_id: userId, claim_date: today, awarded_xp: state.rewardXp, bonus_kind: spec.kind },
      { onConflict: 'user_id,claim_date', ignoreDuplicates: true },
    )
    .select('user_id')
    .maybeSingle()
  if (error) {
    console.error('[academy/quests] awardDailyBonusIfEarned claim failed', error)
    return 0
  }
  if (!inserted) return 0 // already claimed today
  await awardBonusXp(userId, state.rewardXp)
  // STAGE 2 instrumentation (best-effort): one bonus_claimed when a bonus is actually credited.
  await emitAcademyEvent(userId, 'bonus_claimed', { awardedXp: state.rewardXp, bonusKind: spec.kind })
  return state.rewardXp
}
