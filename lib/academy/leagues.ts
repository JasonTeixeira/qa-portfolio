import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { dateInTz, isoWeekStart, levelForXp } from '@/lib/academy/gamification-logic'
import {
  rankMembers,
  movementForRank,
  seedTierForLevel,
  tierMeta,
  PROMOTE_ZONE,
  RELEGATE_ZONE,
  TOP_TIER,
  type Movement,
} from '@/lib/academy/leagues-logic'
import { rolloverLeague } from '@/lib/academy/leagues-rollover'

export interface StandingRow {
  rank: number
  handle: string
  weeklyXp: number
  isYou: boolean
  movement: Movement
}

export interface LeagueStandings {
  tier: number
  tierName: string
  color: string
  weekStart: string
  total: number
  rows: StandingRow[]
  you: StandingRow
  promoteZone: number
  relegateZone: number
  topTier: boolean
  bottomTier: boolean
}

/** Non-identifying display handle (no PII) until public profiles ship in Phase 2. */
function displayHandle(userId: string): string {
  return `Learner ${userId.slice(0, 4).toUpperCase()}`
}

function currentWeekStart(): string {
  return isoWeekStart(dateInTz(new Date(), 'UTC'))
}

function prevWeekStart(): string {
  const d = new Date(currentWeekStart() + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 7)
  return d.toISOString().slice(0, 10)
}

export interface RolloverSummary {
  week: string
  leagues: number
  promoted: number
  relegated: number
  held: number
  seated: number
}

/**
 * Weekly rollover (run by the Monday cron): rank every finished-week league,
 * promote/relegate by final standings, and seat each learner into this week's
 * league at their new tier with a fresh 0-XP slate. Idempotent — re-running
 * won't double-seat (unique on week_start,user_id).
 */
export async function runWeeklyLeagueRollover(): Promise<RolloverSummary> {
  const admin = supabaseAdmin()
  const finishedWeek = prevWeekStart()
  const currentWeek = currentWeekStart()

  const { data: leagues } = await admin
    .from('academy_leagues')
    .select('id, tier')
    .eq('week_start', finishedWeek)

  let promoted = 0
  let relegated = 0
  let held = 0
  let seated = 0

  for (const lg of leagues ?? []) {
    const { data: members } = await admin
      .from('academy_league_members')
      .select('user_id, weekly_xp, joined_at')
      .eq('league_id', lg.id)
    const ranked = rankMembers(
      (members ?? []).map((m) => ({
        userId: m.user_id as string,
        weeklyXp: (m.weekly_xp as number) ?? 0,
        joinedAt: m.joined_at as string,
      })),
    )
    const outcomes = rolloverLeague(lg.tier as number, ranked)
    for (const o of outcomes) {
      if (o.movement === 'promote') promoted++
      else if (o.movement === 'relegate') relegated++
      else held++
      const newLeagueId = await findOrCreateLeague(currentWeek, o.toTier)
      const { error } = await admin.from('academy_league_members').upsert(
        { league_id: newLeagueId, user_id: o.userId, week_start: currentWeek, weekly_xp: 0 },
        { onConflict: 'week_start,user_id', ignoreDuplicates: true },
      )
      if (!error) seated++
    }
  }

  return { week: finishedWeek, leagues: (leagues ?? []).length, promoted, relegated, held, seated }
}

/**
 * Ensure the learner is seated in this week's league for their engagement tier.
 * Idempotent: once seated for the week, the seat is stable. Service-role only.
 */
export async function getOrAssignCurrentLeague(
  userId: string,
): Promise<{ leagueId: string; tier: number; weekStart: string }> {
  const admin = supabaseAdmin()
  const week = currentWeekStart()

  // Already seated this week?
  const { data: existing } = await admin
    .from('academy_league_members')
    .select('league_id, academy_leagues!inner(tier)')
    .eq('user_id', userId)
    .eq('week_start', week)
    .maybeSingle()
  if (existing) {
    const tier = (existing.academy_leagues as unknown as { tier: number }).tier
    return { leagueId: existing.league_id as string, tier, weekStart: week }
  }

  // Seed tier from the learner's level.
  const { data: xp } = await admin.from('academy_xp').select('total_xp').eq('user_id', userId).maybeSingle()
  const tier = seedTierForLevel(levelForXp(xp?.total_xp ?? 0))

  // Find or create the league bucket for (week, tier).
  const leagueId = await findOrCreateLeague(week, tier)

  await admin
    .from('academy_league_members')
    .upsert(
      { league_id: leagueId, user_id: userId, week_start: week, weekly_xp: 0 },
      { onConflict: 'week_start,user_id', ignoreDuplicates: true },
    )

  return { leagueId, tier, weekStart: week }
}

async function findOrCreateLeague(week: string, tier: number): Promise<string> {
  const admin = supabaseAdmin()
  const find = async () =>
    admin
      .from('academy_leagues')
      .select('id')
      .eq('week_start', week)
      .eq('tier', tier)
      .eq('instance', 0)
      .maybeSingle()

  const { data: found } = await find()
  if (found) return found.id as string

  const { data: created, error } = await admin
    .from('academy_leagues')
    .insert({ week_start: week, tier, instance: 0 })
    .select('id')
    .single()
  if (!error && created) return created.id as string

  // Lost a race on the unique(week,tier,instance) constraint — re-fetch.
  const { data: again } = await find()
  if (again) return again.id as string
  throw new Error('league: failed to find or create league bucket')
}

/**
 * Add league XP to the learner's current-week membership. Called whenever XP is
 * awarded (gamification.recordActivityAndAward) so the membership row is the
 * canonical weekly figure — which makes weekly rollover exact and timing-proof.
 */
export async function addLeagueXp(userId: string, delta: number): Promise<void> {
  if (!Number.isFinite(delta) || delta <= 0) return
  const admin = supabaseAdmin()
  const { leagueId } = await getOrAssignCurrentLeague(userId)
  // TODO(scale): read-modify-write — two truly concurrent XP awards for one user
  // can lose a delta. Replace with an atomic `weekly_xp = weekly_xp + delta` via a
  // Postgres RPC before the user base reaches concurrent-activity volume.
  const { data: row } = await admin
    .from('academy_league_members')
    .select('weekly_xp')
    .eq('league_id', leagueId)
    .eq('user_id', userId)
    .maybeSingle()
  const next = (row?.weekly_xp ?? 0) + delta
  const { error } = await admin
    .from('academy_league_members')
    .update({ weekly_xp: next })
    .eq('league_id', leagueId)
    .eq('user_id', userId)
  if (error) console.error('[academy/leagues] addLeagueXp update failed', error)
}

/** Live standings for the learner's current league — ranked by this week's league XP. */
export async function getLeagueStandings(userId: string): Promise<LeagueStandings> {
  const admin = supabaseAdmin()
  const { leagueId, tier, weekStart } = await getOrAssignCurrentLeague(userId)

  const { data: members } = await admin
    .from('academy_league_members')
    .select('user_id, joined_at, weekly_xp')
    .eq('league_id', leagueId)
  const roster = members ?? []

  const ranked = rankMembers(
    roster.map((m) => ({
      userId: m.user_id as string,
      weeklyXp: (m.weekly_xp as number) ?? 0,
      joinedAt: m.joined_at as string,
    })),
  )
  const total = ranked.length
  const rows: StandingRow[] = ranked.map((r) => ({
    rank: r.rank,
    handle: r.userId === userId ? 'You' : displayHandle(r.userId),
    weeklyXp: r.weeklyXp,
    isYou: r.userId === userId,
    movement: movementForRank(r.rank, total, tier),
  }))

  const meta = tierMeta(tier)
  const you = rows.find((r) => r.isYou) ?? {
    rank: total + 1,
    handle: 'You',
    weeklyXp: 0,
    isYou: true,
    movement: 'hold' as Movement,
  }

  return {
    tier,
    tierName: meta.name,
    color: meta.color,
    weekStart,
    total,
    rows,
    you,
    promoteZone: PROMOTE_ZONE,
    relegateZone: RELEGATE_ZONE,
    topTier: tier >= TOP_TIER,
    bottomTier: tier <= 0,
  }
}
