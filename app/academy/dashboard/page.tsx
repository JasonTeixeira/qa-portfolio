import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLearnerDashboard } from '@/lib/academy/learner'
import { getGamification } from '@/lib/academy/gamification'
import type { GamificationState } from '@/lib/academy/gamification-logic'
import { getLearnerGoal, getLearnerStats } from '@/lib/academy/goals'
import { computeGoalProgress, type GoalProgress } from '@/lib/academy/goal-logic'
import { getMyProfile } from '@/lib/academy/profiles'
import { getDailyQuests, getWeeklyQuests } from '@/lib/academy/quests'
import type { QuestProgress } from '@/lib/academy/quest-logic'
import { getTriggers } from '@/lib/academy/triggers'
import type { Trigger } from '@/lib/academy/trigger-logic'
import { getNextRewards } from '@/lib/academy/rewards'
import type { NextRewards } from '@/lib/academy/reward-logic'
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
  let dailyQuests: QuestProgress[] = []
  let weeklyQuests: QuestProgress[] = []
  let triggers: Trigger[] = []
  let rewards: NextRewards | null = null

  // The resume point — their continue-to lesson, else the catalog. Both the
  // journey CTA and the trigger nudges send the learner here.
  const nextHref = dash.continueTo
    ? `/academy/learn/${dash.continueTo.courseSlug}/${dash.continueTo.lessonSlug}`
    : '/academy/catalog'

  if (dash.signedIn) {
    const sb = await createSupabaseServerClient()
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (user) {
      // Independent reads — fetch in parallel to avoid a request waterfall.
      const [g, goalKey, stats, profile, daily, weekly, trig, rew] = await Promise.all([
        getGamification(user.id),
        getLearnerGoal(user.id),
        getLearnerStats(user.id),
        getMyProfile(user.id),
        getDailyQuests(user.id),
        getWeeklyQuests(user.id),
        getTriggers(user.id, nextHref),
        getNextRewards(user.id),
      ])
      game = g
      rewards = rew
      // A real display name (when set) takes precedence over the email-derived name.
      displayName = profile?.displayName?.trim() || null
      // Only compute the journey once the learner has actually chosen a goal.
      journey = goalKey ? computeGoalProgress(goalKey, stats) : null
      dailyQuests = daily
      weeklyQuests = weekly
      triggers = trig
    }
  }

  return (
    <AcademyShell active="home" signedIn={dash.signedIn}>
      <Dashboard
        dash={dash}
        game={game}
        journey={journey}
        journeyNextHref={nextHref}
        displayName={displayName}
        dailyQuests={dailyQuests}
        weeklyQuests={weeklyQuests}
        triggers={triggers}
        rewards={rewards}
        nextHref={nextHref}
      />
    </AcademyShell>
  )
}
