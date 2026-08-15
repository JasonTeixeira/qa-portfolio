'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { saveOnboarding, recordFirstWin, type OnboardingInput } from '@/lib/academy/onboarding'

/**
 * Persist the learner's onboarding, record their GUARANTEED first win (a real
 * in-progress lesson row that lights up the goal's first milestone), then route to
 * the first-win celebration. The win screen — not a raw lesson — is the destination,
 * so the learner SUCCEEDS at something real inside their first minute before any
 * long lesson. If no lesson exists to start, we fall through to the lesson/catalog
 * href instead of fabricating a win.
 */
export async function completeOnboarding(input: OnboardingInput): Promise<void> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/onboarding')

  await saveOnboarding(user.id, {
    goal: String(input.goal).slice(0, 60),
    motivation: input.motivation ? String(input.motivation).slice(0, 200) : null,
    calibrationLevel: String(input.calibrationLevel).slice(0, 40),
    dailyGoalXp: [20, 40, 60].includes(Number(input.dailyGoalXp)) ? Number(input.dailyGoalXp) : 40,
  })

  const result = await recordFirstWin(user.id)
  if (result.kind === 'fallback') redirect(result.href)
  redirect('/academy/onboarding/win')
}
