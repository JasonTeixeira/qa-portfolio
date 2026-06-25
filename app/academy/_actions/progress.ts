'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { recordActivityAndAward } from '@/lib/academy/gamification'
import { ensureReviewCardsForCompleted } from '@/lib/academy/fsrs'

/**
 * Mark a lesson complete for the current learner (idempotent upsert, RLS-scoped).
 * Awards a certificate (server-verified, service-role) when the whole course is done.
 */
export async function markLessonComplete(
  courseSlug: string,
  lessonSlug: string,
): Promise<{ ok: boolean; signedIn: boolean }> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { ok: false, signedIn: false }

  // First-completion check so XP/streak award exactly once per lesson (anti-cheat).
  const { data: existing } = await sb
    .from('academy_progress')
    .select('status')
    .eq('user_id', user.id)
    .eq('lesson_slug', lessonSlug)
    .maybeSingle()
  const alreadyDone = existing?.status === 'completed'

  const now = new Date().toISOString()
  const { error } = await sb.from('academy_progress').upsert(
    {
      user_id: user.id,
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      status: 'completed',
      completed_at: now,
      updated_at: now,
    },
    { onConflict: 'user_id,lesson_slug' },
  )
  if (error) {
    console.error('[academy/progress] markLessonComplete upsert failed', error)
    return { ok: false, signedIn: true }
  }

  if (!alreadyDone) {
    await maybeAwardCertificate(user.id, courseSlug, user.email ?? null)
    // Habit core: award XP + advance streak + daily goal (best-effort, never block).
    try {
      await recordActivityAndAward(user.id, 'lesson')
      await ensureReviewCardsForCompleted(user.id) // seed an FSRS review card for the lesson
    } catch (err) {
      console.error('[academy/progress] gamification award failed', err)
    }
  }

  revalidatePath('/academy/preview')
  revalidatePath('/academy/dashboard')
  revalidatePath('/academy/learn', 'layout')
  return { ok: true, signedIn: true }
}

/** Issues a certificate (once) when every published lesson in the course is complete. Server-verified. */
async function maybeAwardCertificate(userId: string, courseSlug: string, email: string | null) {
  try {
    const admin = supabaseAdmin()
    const { count: total } = await admin
      .from('academy_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_slug', courseSlug)
      .eq('status', 'published')
    if (!total) return

    const { count: done } = await admin
      .from('academy_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('course_slug', courseSlug)
      .eq('status', 'completed')
    if ((done ?? 0) < total) return

    const code = `SAGE-${courseSlug.replace(/[^a-z]/g, '').slice(0, 4).toUpperCase() || 'CRSE'}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    await admin.from('academy_certificates').upsert(
      {
        user_id: userId,
        course_slug: courseSlug,
        cert_code: code,
        recipient_name: email ? email.split('@')[0] : null,
      },
      { onConflict: 'user_id,course_slug', ignoreDuplicates: true },
    )
  } catch (err) {
    // certificate is best-effort; never block completion — but surface the failure
    console.error('[academy/progress] maybeAwardCertificate failed', err)
  }
}
