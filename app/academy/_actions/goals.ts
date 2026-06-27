'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { GOAL_CATALOG } from '@/lib/academy/goal-logic'

export type SetGoalResult = { ok: true } | { ok: false; error: string }

/**
 * Persist the learner's chosen goal (the commitment device). Written via the USER
 * client so RLS forces user_id = auth.uid() — a learner can only set their OWN goal.
 * targetDate is optional (ISO YYYY-MM-DD); anything malformed is dropped.
 */
export async function setLearnerGoal(goalKey: string, targetDate?: string): Promise<SetGoalResult> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/onboarding')

  if (!GOAL_CATALOG.some((g) => g.key === goalKey)) {
    return { ok: false, error: 'Unknown goal.' }
  }

  const target = targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate) ? targetDate : null

  const { error } = await sb.from('academy_goals').upsert(
    {
      user_id: user.id,
      goal_key: goalKey,
      target_date: target,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) {
    console.error('[academy/goals] setLearnerGoal upsert failed', error)
    return { ok: false, error: 'Could not save your goal. Try again.' }
  }

  revalidatePath('/academy/dashboard')
  revalidatePath('/academy/onboarding')
  return { ok: true }
}
