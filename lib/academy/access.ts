import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getActiveMembership, type AcademyMembership } from '@/lib/academy/membership'

/**
 * Whether the membership gate is enforced. Ships OFF so the academy stays open
 * during pre-launch; flip ACADEMY_GATE_ENABLED=true (with prices + keys live)
 * to turn the paywall on. When off, isLessonUnlocked() always returns true.
 */
export function isGateEnabled(): boolean {
  return process.env.ACADEMY_GATE_ENABLED === 'true'
}

export type AcademyAccess = {
  signedIn: boolean
  userId: string | null
  email: string | null
  /** Active all-access membership, if any. */
  membership: AcademyMembership | null
  /** True if the learner can open any non-free lesson (member, track-enrolled, or admin). */
  hasFullAccess: boolean
  isAdmin: boolean
}

/**
 * Resolve the current learner's academy access. Full access is granted by an
 * active all-access membership, OR any active per-track enrollment, OR an
 * admin/owner role. Reads are RLS-scoped to the signed-in user.
 */
export async function getAcademyAccess(): Promise<AcademyAccess> {
  const empty: AcademyAccess = {
    signedIn: false, userId: null, email: null, membership: null, hasFullAccess: false, isAdmin: false,
  }
  try {
    const sb = await createSupabaseServerClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return empty

    const email = user.email ?? null

    const [membership, enrollment, adminRow] = await Promise.all([
      getActiveMembership(sb, user.id),
      // Any active per-track enrollment also grants access (keyed by email).
      email
        ? sb.from('academy_enrollments').select('id').eq('email', email).eq('status', 'active').limit(1).maybeSingle()
        : Promise.resolve({ data: null }),
      sb.from('app_users').select('role').eq('id', user.id).maybeSingle(),
    ])

    const isAdmin = ['admin', 'owner'].includes((adminRow?.data?.role as string) ?? '')
    const hasFullAccess = !!membership || !!enrollment?.data || isAdmin

    return { signedIn: true, userId: user.id, email, membership, hasFullAccess, isAdmin }
  } catch {
    return empty
  }
}

/**
 * Should this specific lesson be readable? Free-preview lessons are always open.
 * When the gate is off, everything is open. Otherwise, non-free lessons require
 * full access.
 */
export function isLessonUnlocked(isFreePreview: boolean, access: AcademyAccess): boolean {
  if (!isGateEnabled()) return true
  if (isFreePreview) return true
  return access.hasFullAccess
}
