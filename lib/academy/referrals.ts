import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { awardBonusXp, grantFreezes } from '@/lib/academy/gamification'
import {
  proposeReferralCode,
  referralCodeCandidates,
  normalizeCode,
  attributionCheck,
  qualifiesForConversion,
  summarize,
  REFERRAL_REWARDS,
  type AttributionReason,
  type ReferralSummary,
} from '@/lib/academy/referral-logic'

/** Create-on-first-use stable referral code for a learner (unique). */
export async function ensureReferralCode(userId: string): Promise<string> {
  const admin = supabaseAdmin()
  const { data: existing } = await admin
    .from('academy_referral_codes')
    .select('code')
    .eq('user_id', userId)
    .maybeSingle()
  if (existing) return existing.code as string

  for (const candidate of referralCodeCandidates(proposeReferralCode(userId))) {
    const { data, error } = await admin
      .from('academy_referral_codes')
      .insert({ user_id: userId, code: candidate })
      .select('code')
      .single()
    if (!error && data) return data.code as string
    if (error && error.code !== '23505') break // 23505 = code collision → next candidate
  }
  const fallback = normalizeCode(userId).slice(0, 10)
  const { data } = await admin
    .from('academy_referral_codes')
    .upsert({ user_id: userId, code: fallback }, { onConflict: 'user_id' })
    .select('code')
    .single()
  return (data?.code as string) ?? fallback
}

async function referrerForCode(rawCode: string): Promise<string | null> {
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('academy_referral_codes')
    .select('user_id')
    .eq('code', normalizeCode(rawCode))
    .maybeSingle()
  return (data?.user_id as string | null) ?? null
}

/**
 * Attribute a new learner to a referrer's code (called at signup). Records a
 * pending referral and pays the invitee their welcome bonus immediately (the
 * "give" half). Idempotent + guarded against self-referral / double-attribution.
 */
export async function attributeReferral(
  inviteeId: string,
  rawCode: string,
): Promise<{ ok: boolean; reason: AttributionReason }> {
  const admin = supabaseAdmin()
  const referrerId = await referrerForCode(rawCode)
  const { data: existing } = await admin
    .from('academy_referrals')
    .select('id')
    .eq('invitee_id', inviteeId)
    .maybeSingle()

  const check = attributionCheck(referrerId, inviteeId, Boolean(existing))
  if (!check.ok) return check

  const { error } = await admin.from('academy_referrals').insert({
    referrer_id: referrerId,
    invitee_id: inviteeId,
    code: normalizeCode(rawCode),
    status: 'pending',
  })
  if (error) {
    if (error.code === '23505') return { ok: false, reason: 'already_attributed' }
    console.error('[academy/referrals] attribute failed', error)
    return { ok: false, reason: 'unknown_code' }
  }

  // Invitee welcome bonus (immediate — the "give" side of give-get).
  await awardBonusXp(inviteeId, REFERRAL_REWARDS.inviteeXp)
  await grantFreezes(inviteeId, REFERRAL_REWARDS.inviteeFreezes)
  return { ok: true, reason: 'ok' }
}

/**
 * Convert a pending referral once the invitee genuinely engages (≥1 lesson),
 * paying the referrer (the "get" side). Idempotent: the reward is granted at
 * most once via an atomic reward_granted flip. Call on lesson completion.
 */
export async function maybeConvertReferral(inviteeId: string): Promise<boolean> {
  const admin = supabaseAdmin()
  const { data: ref } = await admin
    .from('academy_referrals')
    .select('id, referrer_id, reward_granted')
    .eq('invitee_id', inviteeId)
    .maybeSingle()
  if (!ref || ref.reward_granted) return false

  const { count } = await admin
    .from('academy_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', inviteeId)
    .eq('status', 'completed')
  if (!qualifiesForConversion(count ?? 0)) return false

  // Atomic claim: only the first caller flips reward_granted false→true.
  const { data: claimed } = await admin
    .from('academy_referrals')
    .update({ status: 'converted', reward_granted: true, converted_at: new Date().toISOString() })
    .eq('id', ref.id)
    .eq('reward_granted', false)
    .select('id')
  if (!claimed || claimed.length === 0) return false

  try {
    await awardBonusXp(ref.referrer_id as string, REFERRAL_REWARDS.referrerXp)
    await grantFreezes(ref.referrer_id as string, REFERRAL_REWARDS.referrerFreezes)
    return true
  } catch (err) {
    // Reward grant failed AFTER the claim — release the claim so it retries on the
    // invitee's next lesson rather than silently losing the referrer's reward.
    console.error('[academy/referrals] reward grant failed, releasing claim', err)
    await admin
      .from('academy_referrals')
      .update({ status: 'pending', reward_granted: false, converted_at: null })
      .eq('id', ref.id)
    return false
  }
}

export async function getReferralSummary(userId: string): Promise<{ code: string; summary: ReferralSummary }> {
  const code = await ensureReferralCode(userId)
  const admin = supabaseAdmin()
  const { data } = await admin.from('academy_referrals').select('status').eq('referrer_id', userId)
  return { code, summary: summarize(data ?? []) }
}
