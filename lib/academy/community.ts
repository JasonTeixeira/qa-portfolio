import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { dateInTz, levelForXp } from '@/lib/academy/gamification-logic'
import { ensureProfile } from '@/lib/academy/profiles'
import { bumpFriendStreak, friendStreakAlive, friendRequestCheck, type FriendReason } from '@/lib/academy/community-logic'

// ---------------------------------------------------------------- friends

export interface FriendView {
  friendshipId: string
  userId: string
  handle: string
  displayName: string
  friendStreak: number
  alive: boolean
  theirStreak: number
  level: number
}

export interface PendingRequest {
  friendshipId: string
  handle: string
  displayName: string
}

function displayFor(profile: { handle?: string; display_name?: string | null } | undefined, userId: string): {
  handle: string
  displayName: string
} {
  const handle = profile?.handle ?? `learner-${userId.slice(0, 8)}`
  return { handle, displayName: profile?.display_name || handle }
}

async function profileMap(ids: string[]) {
  const admin = supabaseAdmin()
  const { data } = await admin.from('academy_profiles').select('user_id, handle, display_name').in('user_id', ids)
  return new Map((data ?? []).map((p) => [p.user_id as string, p]))
}

async function resolveByHandle(handle: string): Promise<string | null> {
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('academy_profiles')
    .select('user_id')
    .eq('handle', handle.trim().toLowerCase())
    .maybeSingle()
  return (data?.user_id as string | null) ?? null
}

/** Send a friend request to a learner by their handle. */
export async function sendFriendRequest(userId: string, handle: string): Promise<{ ok: boolean; reason: FriendReason }> {
  const admin = supabaseAdmin()
  const targetId = await resolveByHandle(handle)

  // Already linked in either direction?
  let alreadyLinked = false
  if (targetId) {
    const { data } = await admin
      .from('academy_friendships')
      .select('id')
      .or(
        `and(requester_id.eq.${userId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${userId})`,
      )
      .maybeSingle()
    alreadyLinked = Boolean(data)
  }

  const check = friendRequestCheck(userId, targetId, alreadyLinked)
  if (!check.ok) return check

  const { error } = await admin
    .from('academy_friendships')
    .insert({ requester_id: userId, addressee_id: targetId, status: 'pending' })
  if (error) {
    if (error.code === '23505') return { ok: false, reason: 'exists' }
    console.error('[academy/community] sendFriendRequest failed', error)
    return { ok: false, reason: 'not_found' }
  }
  return { ok: true, reason: 'ok' }
}

/** Accept a pending request (only the addressee may). */
export async function acceptFriendRequest(userId: string, friendshipId: string): Promise<boolean> {
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('academy_friendships')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .eq('addressee_id', userId)
    .eq('status', 'pending')
    .select('id')
  return Boolean(data && data.length > 0)
}

export async function listIncomingRequests(userId: string): Promise<PendingRequest[]> {
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('academy_friendships')
    .select('id, requester_id')
    .eq('addressee_id', userId)
    .eq('status', 'pending')
  const rows = data ?? []
  const profiles = await profileMap(rows.map((r) => r.requester_id as string))
  return rows.map((r) => {
    const d = displayFor(profiles.get(r.requester_id as string), r.requester_id as string)
    return { friendshipId: r.id as string, ...d }
  })
}

export async function listFriends(userId: string): Promise<FriendView[]> {
  const admin = supabaseAdmin()
  const today = dateInTz(new Date(), 'UTC')
  const { data } = await admin
    .from('academy_friendships')
    .select('id, requester_id, addressee_id, friend_streak, last_both_active')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
  const rows = data ?? []
  const friendIds = rows.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id) as string)
  if (friendIds.length === 0) return []

  const [profiles, { data: streaks }, { data: xps }] = await Promise.all([
    profileMap(friendIds),
    admin.from('academy_streaks').select('user_id, current_length').in('user_id', friendIds),
    admin.from('academy_xp').select('user_id, total_xp').in('user_id', friendIds),
  ])
  const streakOf = new Map((streaks ?? []).map((s) => [s.user_id as string, s.current_length as number]))
  const xpOf = new Map((xps ?? []).map((x) => [x.user_id as string, x.total_xp as number]))

  return rows.map((r) => {
    const fid = (r.requester_id === userId ? r.addressee_id : r.requester_id) as string
    const d = displayFor(profiles.get(fid), fid)
    return {
      friendshipId: r.id as string,
      userId: fid,
      ...d,
      friendStreak: (r.friend_streak as number) ?? 0,
      alive: friendStreakAlive((r.last_both_active as string | null) ?? null, today),
      theirStreak: streakOf.get(fid) ?? 0,
      level: levelForXp(xpOf.get(fid) ?? 0),
    }
  })
}

/**
 * Bump friend streaks for every accepted pair that's both-active today. Called
 * on lesson completion (best-effort). Uses the pure bumpFriendStreak transition.
 */
export async function updateFriendStreaks(userId: string): Promise<void> {
  const admin = supabaseAdmin()
  const { data: me } = await admin
    .from('academy_streaks')
    .select('timezone, last_active_date')
    .eq('user_id', userId)
    .maybeSingle()
  const tz = (me?.timezone as string) ?? 'UTC'
  const today = dateInTz(new Date(), tz)
  if (me?.last_active_date !== today) return // not active today → no shared day to record

  const { data: fr } = await admin
    .from('academy_friendships')
    .select('id, requester_id, addressee_id, friend_streak, last_both_active')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
  const rows = fr ?? []
  if (rows.length === 0) return

  const friendIds = rows.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id) as string)
  const { data: friendStreaks } = await admin
    .from('academy_streaks')
    .select('user_id, last_active_date, timezone')
    .in('user_id', friendIds)
  // Evaluate each friend's "active today" in THEIR OWN timezone (last_active_date is
  // stored per-learner-tz), so a cross-timezone pair isn't mis-scored near midnight.
  const now = new Date()
  const activeToday = new Map(
    (friendStreaks ?? []).map((s) => [
      s.user_id as string,
      s.last_active_date === dateInTz(now, (s.timezone as string) ?? 'UTC'),
    ]),
  )

  for (const r of rows) {
    const fid = (r.requester_id === userId ? r.addressee_id : r.requester_id) as string
    if (!activeToday.get(fid)) continue
    const next = bumpFriendStreak(
      { streak: (r.friend_streak as number) ?? 0, lastBothActive: (r.last_both_active as string | null) ?? null },
      today,
    )
    if (!next.increased) continue
    await admin
      .from('academy_friendships')
      .update({ friend_streak: next.streak, last_both_active: next.lastBothActive })
      .eq('id', r.id)
  }
}

// ---------------------------------------------------------------- cohorts

export interface CohortView {
  slug: string
  name: string
  description: string | null
  memberCount: number
  isMember: boolean
}

export async function listCohorts(userId: string): Promise<CohortView[]> {
  const admin = supabaseAdmin()
  const [{ data: cohorts }, { data: mine }] = await Promise.all([
    admin.from('academy_cohorts').select('id, slug, name, description').order('created_at'),
    admin.from('academy_cohort_members').select('cohort_id').eq('user_id', userId),
  ])
  const mineSet = new Set((mine ?? []).map((m) => m.cohort_id as string))
  const counts = await Promise.all(
    (cohorts ?? []).map((c) =>
      admin
        .from('academy_cohort_members')
        .select('id', { count: 'exact', head: true })
        .eq('cohort_id', c.id as string)
        .then((r) => r.count ?? 0),
    ),
  )
  return (cohorts ?? []).map((c, i) => ({
    slug: c.slug as string,
    name: c.name as string,
    description: (c.description as string | null) ?? null,
    memberCount: counts[i],
    isMember: mineSet.has(c.id as string),
  }))
}

export async function joinCohort(userId: string, slug: string): Promise<boolean> {
  const admin = supabaseAdmin()
  const { data: cohort } = await admin.from('academy_cohorts').select('id').eq('slug', slug).maybeSingle()
  if (!cohort) return false
  const { error } = await admin
    .from('academy_cohort_members')
    .upsert({ cohort_id: cohort.id as string, user_id: userId }, { onConflict: 'cohort_id,user_id', ignoreDuplicates: true })
  return !error
}

/** Ensure the learner has a profile/handle so friends can find + display them. */
export async function ensureCommunityProfile(userId: string, email: string | null): Promise<string> {
  const p = await ensureProfile(userId, email ?? userId)
  return p.handle
}
