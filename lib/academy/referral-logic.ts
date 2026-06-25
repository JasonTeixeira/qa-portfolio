/**
 * Pure referral logic — NO 'server-only', NO DB. Unit-testable.
 * Two-sided "give-get": when an invitee converts, BOTH sides earn status/access
 * rewards (bonus XP + streak freezes) — never discounts (per the growth spec).
 */

export const REFERRAL_REWARDS = {
  referrerXp: 100, // bonus XP per converted invite
  referrerFreezes: 1, // a streak freeze per converted invite (loss-aversion currency)
  inviteeXp: 50, // welcome bonus on joining via a code
  inviteeFreezes: 1,
} as const

export const CODE_LEN = 6
export const CODE_MAX = 12

/** Deterministic, friendly code from the user's uuid — stable, no randomness needed. */
export function proposeReferralCode(userId: string): string {
  const hex = userId.replace(/[^a-fA-F0-9]/g, '').toUpperCase()
  const base = hex.slice(0, CODE_LEN)
  return base.length >= CODE_LEN ? base : (base + '000000').slice(0, CODE_LEN)
}

/** Ordered uniqueness candidates: base, base2, base3, … (clamped). */
export function referralCodeCandidates(base: string, max = 60): string[] {
  const out = [base]
  for (let i = 2; i <= max; i++) out.push(`${base}${i}`.slice(0, CODE_MAX))
  return out
}

/** Normalize a code from a URL/param for lookup (uppercase, alnum, bounded). */
export function normalizeCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_MAX)
}

export type AttributionReason = 'ok' | 'unknown_code' | 'self_referral' | 'already_attributed'

/** Whether an invitee may be attributed to a referrer. */
export function attributionCheck(
  referrerId: string | null,
  inviteeId: string,
  alreadyAttributed: boolean,
): { ok: boolean; reason: AttributionReason } {
  if (!referrerId) return { ok: false, reason: 'unknown_code' }
  if (referrerId === inviteeId) return { ok: false, reason: 'self_referral' }
  if (alreadyAttributed) return { ok: false, reason: 'already_attributed' }
  return { ok: true, reason: 'ok' }
}

/** An invitee converts (both sides get rewarded) once they've genuinely engaged. */
export const CONVERSION_LESSON_THRESHOLD = 1

export function qualifiesForConversion(lessonsCompleted: number): boolean {
  return lessonsCompleted >= CONVERSION_LESSON_THRESHOLD
}

export interface ReferralSummary {
  invited: number
  converted: number
  pending: number
  xpEarned: number
  freezesEarned: number
}

/** Roll up a referrer's referrals into display stats. */
export function summarize(referrals: { status: string }[]): ReferralSummary {
  const converted = referrals.filter((r) => r.status === 'converted').length
  const pending = referrals.filter((r) => r.status === 'pending').length
  return {
    invited: referrals.length,
    converted,
    pending,
    xpEarned: converted * REFERRAL_REWARDS.referrerXp,
    freezesEarned: converted * REFERRAL_REWARDS.referrerFreezes,
  }
}
