import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isOnboarded } from '@/lib/academy/onboarding'
import { getLearnerGoal } from '@/lib/academy/goals'
import { OnboardingFlow } from '@/components/academy/onboarding/OnboardingFlow'

export const metadata: Metadata = {
  title: 'Get started — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/onboarding')
  if (await isOnboarded(user.id)) redirect('/academy/dashboard')

  const goalKey = await getLearnerGoal(user.id)

  return <OnboardingFlow initialGoalKey={goalKey} />
}
