import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ensureReviewCardsForCompleted, getDueReviews } from '@/lib/academy/fsrs'
import { AcademyShell } from '@/components/academy/academy-shell'
import { ReviewSession } from '@/components/academy/review/ReviewSession'

export const metadata: Metadata = {
  title: 'Review — Sage Academy',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null // middleware gates this; defensive

  await ensureReviewCardsForCompleted(user.id)
  const due = await getDueReviews(user.id)

  return (
    <AcademyShell active="review">
      <ReviewSession initialCards={due} />
    </AcademyShell>
  )
}
