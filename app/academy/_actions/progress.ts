'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { recordActivityAndAward, pickCelebration, type Celebration } from '@/lib/academy/gamification'
import { ensureReviewCardsForCompleted } from '@/lib/academy/fsrs'
import { maybeConvertReferral } from '@/lib/academy/referrals'
import { updateFriendStreaks } from '@/lib/academy/community'
import { recordEvidenceEvent } from '@/lib/academy/evidence-events'
import { reconcileBadges } from '@/lib/academy/badges'
import { awardDailyBonusIfEarned } from '@/lib/academy/quests'

/**
 * Mark a lesson complete for the current learner (idempotent upsert, RLS-scoped).
 * Awards a certificate (server-verified, service-role) when the whole course is done.
 */
export async function markLessonComplete(
  courseSlug: string,
  lessonSlug: string,
): Promise<{ ok: boolean; signedIn: boolean; celebration?: Celebration | null }> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { ok: false, signedIn: false }

  // First-completion check so XP/streak award exactly once per lesson (anti-cheat).
  // TODO(scale): read-before-write — two sub-second concurrent calls (double-click)
  // can both see alreadyDone=false and double-award XP. Referral conversion is already
  // race-safe (atomic claim); make this atomic via a Postgres fn before scale.
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

  let celebration: Celebration | null = null
  if (!alreadyDone) {
    await maybeAwardCertificate(user.id, courseSlug, user.email ?? null)
    // Habit core: award XP + advance streak + daily goal (best-effort, never block).
    try {
      const state = await recordActivityAndAward(user.id, 'lesson')
      celebration = pickCelebration(state)
      await awardDailyBonusIfEarned(user.id) // credit the variable daily bonus if this lesson earned it (idempotent)
      await ensureReviewCardsForCompleted(user.id) // seed an FSRS review card for the lesson
      await maybeConvertReferral(user.id) // convert a pending referral once the invitee engages
      await updateFriendStreaks(user.id) // advance friend streaks for both-active pairs
      await reconcileBadges(user.id) // server-verified collectible badges (anti-cheat: derived from real stats)
    } catch (err) {
      console.error('[academy/progress] gamification award failed', err)
    }

    // Tier-0 evidence spine (best-effort, never block completion). userId is the
    // authenticated session id; payload is built server-side from verified facts.
    // unitId = lessonSlug (one lesson = one unit). The lab_verified /
    // sprint_artifact_created events are NOT emitted here — they are server-verified
    // in verifyLab (app/academy/_actions/evidence.ts) so the client cannot forge them.
    try {
      await recordEvidenceEvent({
        userId: user.id,
        courseSlug,
        lessonSlug,
        unitId: lessonSlug,
        type: 'lesson_completed',
        payload: { spacingScheduled: true }, // FSRS review cards are created above, so spacing is genuinely scheduled
      })
    } catch (err) {
      console.error('[academy/progress] evidence record failed', err)
    }
  }

  revalidatePath('/academy/preview')
  revalidatePath('/academy/dashboard')
  revalidatePath('/academy/learn', 'layout')
  return { ok: true, signedIn: true, celebration }
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
