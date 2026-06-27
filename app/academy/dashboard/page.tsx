import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLearnerDashboard } from '@/lib/academy/learner'
import { getGamification } from '@/lib/academy/gamification'
import type { GamificationState } from '@/lib/academy/gamification-logic'
import { getLearnerGoal, getLearnerStats } from '@/lib/academy/goals'
import { computeGoalProgress, type GoalProgress } from '@/lib/academy/goal-logic'
import { getMyProfile } from '@/lib/academy/profiles'
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
  let journey: GoalProgress | null = null
  let displayName: string | null = null
  if (dash.signedIn) {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (user) {
      // Independent reads — fetch in parallel to avoid a request waterfall.
      const [g, goalKey, stats, profile] = await Promise.all([
        getGamification(user.id),
        getLearnerGoal(user.id),
        getLearnerStats(user.id),
        getMyProfile(user.id),
      ])
      game = g
      // A real display name (when set) takes precedence over the email-derived name.
      displayName = profile?.displayName?.trim() || null
      // Only compute the journey once the learner has actually chosen a goal.
      journey = goalKey ? computeGoalProgress(goalKey, stats) : null
    }
  }

  // The next-milestone CTA continues their journey — their resume point, else catalog.
  const nextHref = dash.continueTo
    ? `/academy/learn/${dash.continueTo.courseSlug}/${dash.continueTo.lessonSlug}`
    : '/academy/catalog'

  return (
    <AcademyShell active="home" signedIn={dash.signedIn}>
      <Dashboard
        dash={dash}
        game={game}
        journey={journey}
        journeyNextHref={nextHref}
        displayName={displayName}
      />
    </AcademyShell>
  )
}
