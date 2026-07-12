'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { gradeReview as gradeReviewLib, type ReviewGrade } from '@/lib/academy/fsrs'

/** Grade the current learner's review card (FSRS schedules the next interval). */
export async function gradeReview(cardId: string, grade: ReviewGrade) {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { ok: false as const }
  return gradeReviewLib(user.id, cardId, grade)
}
