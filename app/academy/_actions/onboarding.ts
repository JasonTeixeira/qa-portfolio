'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { saveOnboarding, recommendedFirstLessonHref, type OnboardingInput } from '@/lib/academy/onboarding'

/** Persist the learner's onboarding and drop them into their first lesson (the aha). */
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

  redirect(await recommendedFirstLessonHref())
}
