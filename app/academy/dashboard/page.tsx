import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLearnerDashboard } from '@/lib/academy/learner'
import { getGamification } from '@/lib/academy/gamification'
import type { GamificationState } from '@/lib/academy/gamification-logic'
import { Dashboard } from '@/components/academy/dashboard/Dashboard'
import { AcademyShell } from '@/components/academy/academy-shell'

export const metadata: Metadata = {
  title: 'My Learning — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const dash = await getLearnerDashboard()

  let game: GamificationState | null = null
  if (dash.signedIn) {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (user) game = await getGamification(user.id)
  }

  return (
    <AcademyShell active="dashboard" signedIn={dash.signedIn}>
      <Dashboard dash={dash} game={game} />
    </AcademyShell>
  )
}
