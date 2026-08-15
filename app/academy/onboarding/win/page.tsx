import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getLearnerGoal, getLearnerStats } from '@/lib/academy/goals'
import { recommendedFirstLessonHref } from '@/lib/academy/onboarding'
import { buildFirstWinSummary } from '@/lib/academy/first-win-logic'
import { FirstWinScreen } from '@/components/academy/onboarding/FirstWinScreen'

export const metadata: Metadata = {
  title: 'Your first win — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * The first-win celebration. Renders a summary built from the learner's REAL stats —
 * the `start-lesson` milestone shows done only because a genuine in_progress row was
 * recorded by completeOnboarding. We re-read state here (rather than trust query
 * params) so the screen can never show a win the DB doesn't actually back.
 */
export default async function FirstWinPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?audience=academy&next=/academy/onboarding')

  const [goalKey, stats, nextHref] = await Promise.all([
    getLearnerGoal(user.id),
    getLearnerStats(user.id),
    recommendedFirstLessonHref(),
  ])

  // If the learner somehow reached this screen without a recorded start, send them to
  // the lesson — honest degradation, never a fake congratulation.
  if (!stats.startedAnyLesson && stats.lessonsCompleted === 0) redirect(nextHref)

  const summary = buildFirstWinSummary(goalKey ?? 'explore', stats, {
    // courseSlug/lessonSlug aren't needed by the screen; nextHref is the resolved deep link.
    courseSlug: '',
    lessonSlug: '',
    href: nextHref,
  })

  return <FirstWinScreen summary={summary} />
}
