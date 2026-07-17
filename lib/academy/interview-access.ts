import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Stripe subscription statuses that grant the interview add-on. Same set the academy
 * membership uses (active + trialing + a grace window for past_due).
 */
const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due'])

/**
 * Whether the Interview Mastery gate is enforced. Ships OFF (flag absent) so the add-on
 * stays dark during pre-launch — exactly like ACADEMY_GATE_ENABLED. When off,
 * getInterviewAccess() returns no-access for everyone. Flip INTERVIEW_GATE_ENABLED=true
 * only once the Stripe price IDs + webhook are live.
 */
export function isInterviewGateEnabled(): boolean {
  return process.env.INTERVIEW_GATE_ENABLED === 'true'
}

/** The current learner's Interview Mastery entitlement (mirrors AcademyMembership). */
export type InterviewSubscription = {
  status: string
  planInterval: 'monthly' | 'yearly'
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  autoPauseAt: string | null
}

export type InterviewAccess = {
  signedIn: boolean
  userId: string | null
  email: string | null
  /** True when the gate is enforced. When false, hasAccess is false for everyone (dark launch). */
  gateEnabled: boolean
  /** The active add-on subscription, if any. */
  subscription: InterviewSubscription | null
  /** True if the learner may use the interview product (active add-on, or an admin). */
  hasAccess: boolean
  isAdmin: boolean
}

/**
 * Resolve the current learner's Interview Mastery access. Access is granted by an active
 * interview_subscriptions row (written by the Stripe webhook), OR an admin/owner role.
 * Reads are RLS-scoped to the signed-in user. Never throws — any failure resolves to
 * no-access so a broken read can never accidentally unlock the paywall.
 *
 * While the gate is OFF (default), hasAccess is always false — the add-on is not yet
 * purchasable, so nobody is entitled. This is the honest pre-launch state.
 */
export async function getInterviewAccess(): Promise<InterviewAccess> {
  const gateEnabled = isInterviewGateEnabled()
  const empty: InterviewAccess = {
    signedIn: false,
    userId: null,
    email: null,
    gateEnabled,
    subscription: null,
    hasAccess: false,
    isAdmin: false,
  }

  try {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return empty

    const email = user.email ?? null

    const [subRow, adminRow] = await Promise.all([
      sb
        .from('interview_subscriptions')
        .select('status, plan_interval, current_period_end, cancel_at_period_end, auto_pause_at')
        .eq('user_id', user.id)
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle(),
      sb.from('app_users').select('role').eq('id', user.id).maybeSingle(),
    ])

    const subscription = normalizeSubscription(subRow?.data)
    const isAdmin = ['admin', 'owner'].includes((adminRow?.data?.role as string) ?? '')

    // When the gate is off, nobody is entitled (the add-on isn't purchasable yet). When on,
    // an active add-on OR an admin role unlocks the product.
    const hasAccess = gateEnabled && (!!subscription || isAdmin)

    return { signedIn: true, userId: user.id, email, gateEnabled, subscription, hasAccess, isAdmin }
  } catch (err) {
    console.error('[academy/interview-access] getInterviewAccess failed', err)
    return empty
  }
}

/** Narrow a raw subscription row to an active InterviewSubscription, or null. */
function normalizeSubscription(
  data:
    | {
        status: string | null
        plan_interval: string | null
        current_period_end: string | null
        cancel_at_period_end: boolean | null
        auto_pause_at: string | null
      }
    | null
    | undefined,
): InterviewSubscription | null {
  if (!data || !data.status) return null
  if (!ACTIVE_STATUSES.has(data.status)) return null
  // A canceled-but-still-paid period stays active until current_period_end.
  if (data.current_period_end && new Date(data.current_period_end).getTime() < Date.now()) return null

  return {
    status: data.status,
    planInterval: data.plan_interval === 'yearly' ? 'yearly' : 'monthly',
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    autoPauseAt: data.auto_pause_at,
  }
}
