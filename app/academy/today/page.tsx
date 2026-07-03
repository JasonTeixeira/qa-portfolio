import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ensureReviewCardsForCompleted, getDueReviews } from '@/lib/academy/fsrs'
import { getGamification } from '@/lib/academy/gamification'
import { AcademyShell } from '@/components/academy/academy-shell'
import { ReviewSession } from '@/components/academy/review/ReviewSession'

export const metadata: Metadata = {
  title: 'Daily Rep — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Daily Rep — the streak-shield framing of the FSRS recall flow. Same due-card
 * queue and scheduler as /academy/review, but presented as today's six-minute
 * rep that shields the streak: a gold "{N}-day streak · at stake" pill (real
 * academy_streaks.current_length) and streak-shield footer copy. Real data only
 * — no fabricated streak, no fabricated cards.
 */
export default async function DailyRepPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null // middleware gates this; defensive

  await ensureReviewCardsForCompleted(user.id)
  const [due, gamification] = await Promise.all([
    getDueReviews(user.id),
    getGamification(user.id),
  ])
  const streakDays = gamification.streak.current > 0 ? gamification.streak.current : null

  return (
    <AcademyShell active="practice">
      <ReviewSession initialCards={due} variant="daily" streakDays={streakDays} />
    </AcademyShell>
  )
}
