'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Onboarding server action — writes the learner's interview_profiles row (own-row RLS) with
 * onboarded_at, which flips the cockpit out of its "set your target first" state.
 *
 * SECURITY / INTEGRITY:
 *   - userId is ALWAYS from the authenticated session — never from arguments.
 *   - Inputs are validated against the exact CHECK-constrained enum values before the write, so a
 *     malformed level/timeline is rejected here rather than by the DB.
 *   - This is the ONLY profile-write path for onboarding; it lives in its own file so the shared
 *     session/verdict _actions.ts is untouched.
 */

export type SaveProfileInput = {
  targetRole: string
  targetLevel: string
  timeline: string
  targetDate?: string | null
  cadence?: string | null
  jdFilename?: string | null
  useEvidencePortfolio?: boolean
}

export type SaveProfileResult = { ok: true } | { ok: false; reason: string }

// The DB CHECK constraints (0115_interview_foundation.sql) — validate against these exactly.
const LEVELS = new Set(['intern', 'new_grad', 'mid', 'senior'])
const TIMELINES = new Set(['two_weeks', 'six_weeks', 'three_months', 'no_date'])

const ROLE_MAX = 120
const CADENCE_MAX = 60
const JD_MAX = 200

/** A YYYY-MM-DD date string, or null. Rejects anything else. */
function normalizeDate(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const value = raw.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const d = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : value
}

export async function saveProfile(input: SaveProfileInput): Promise<SaveProfileResult> {
  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return { ok: false, reason: 'unauthorized' }

    const targetRole = typeof input.targetRole === 'string' ? input.targetRole.trim() : ''
    if (!targetRole) return { ok: false, reason: 'role_required' }
    if (targetRole.length > ROLE_MAX) return { ok: false, reason: 'role_too_long' }

    const targetLevel = typeof input.targetLevel === 'string' ? input.targetLevel.trim() : ''
    if (!LEVELS.has(targetLevel)) return { ok: false, reason: 'invalid_level' }

    const timeline = typeof input.timeline === 'string' ? input.timeline.trim() : ''
    if (!TIMELINES.has(timeline)) return { ok: false, reason: 'invalid_timeline' }

    const targetDate = normalizeDate(input.targetDate)

    const cadence =
      typeof input.cadence === 'string' && input.cadence.trim()
        ? input.cadence.trim().slice(0, CADENCE_MAX)
        : null

    const jdFilename =
      typeof input.jdFilename === 'string' && input.jdFilename.trim()
        ? input.jdFilename.trim().slice(0, JD_MAX)
        : null

    const useEvidencePortfolio = input.useEvidencePortfolio === true

    const nowIso = new Date().toISOString()

    // Own-row RLS upsert — the learner writes their own profile. onboarded_at flips the cockpit.
    const { error } = await sb.from('interview_profiles').upsert(
      {
        user_id: user.id,
        target_role: targetRole,
        target_level: targetLevel,
        timeline,
        target_date: targetDate,
        cadence,
        jd_filename: jdFilename,
        use_evidence_portfolio: useEvidencePortfolio,
        onboarded_at: nowIso,
        updated_at: nowIso,
      },
      { onConflict: 'user_id' },
    )
    if (error) {
      console.error('[academy/interview/onboarding/_actions] saveProfile upsert failed', error)
      return { ok: false, reason: 'save_failed' }
    }

    return { ok: true }
  } catch (err) {
    console.error('[academy/interview/onboarding/_actions] saveProfile threw', err)
    return { ok: false, reason: 'server_error' }
  }
}
