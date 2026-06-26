'use server'

import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { recordEvidenceEvent } from '@/lib/academy/evidence-events'
import type { EvidenceEventType } from '@/lib/academy/evidence-events-logic'
import type { LessonBlock } from '@/data/academy/sample-course'

/**
 * Learner-triggered evidence events from the sprint sections (Tier-2 Slice 2).
 *
 * @security Only the events a learner genuinely performs by interacting with a
 * sprint section may be emitted from the client:
 *   - diagnostic_completed / retrieval_attempted → the pretest reveal (recall-first)
 *   - transfer_attempted → engaging the transfer section
 * `lab_verified` and `sprint_artifact_created` come from the server lab path
 * (a real verified artifact), and grader/admin events (explainBackGraded,
 * externalOutcome, …) must NEVER be client-triggered — they would forge mastery.
 * userId is taken from the authenticated session (never from the client) and the
 * payload is built server-side (empty), per the recordEvidenceEvent caller contract.
 */
const LEARNER_ALLOWED: readonly EvidenceEventType[] = [
  'diagnostic_completed',
  'retrieval_attempted',
  'transfer_attempted',
]

export async function recordSprintEvidence(
  courseSlug: string,
  lessonSlug: string,
  eventType: string,
): Promise<{ ok: boolean }> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { ok: false }

  // Allowlist: reject anything that isn't a genuine learner-performed action.
  if (!LEARNER_ALLOWED.includes(eventType as EvidenceEventType)) return { ok: false }

  // Best-effort, never throw to the client. userId is server-derived; payload
  // is server-built (empty); unitId = lessonSlug (one lesson = one unit).
  try {
    await recordEvidenceEvent({
      userId: user.id,
      courseSlug,
      lessonSlug,
      unitId: lessonSlug,
      type: eventType as EvidenceEventType,
      payload: {},
    })
    return { ok: true }
  } catch (err) {
    console.error('[academy/evidence] recordSprintEvidence failed', err)
    return { ok: false }
  }
}

/**
 * Server-side lab verification — the anti-cheat write of record for a passing lab.
 *
 * @security The lab `check` string (expected stdout substring) lives in the
 * lesson content server-side. The client may submit its Pyodide stdout, but the
 * PASS/FAIL decision is re-run HERE against the server-held `check` — the client
 * can no longer forge a verified lab by passing a boolean flag. userId is taken
 * from the authenticated session (never from the client); payload is empty.
 *
 * Decoupled from lesson completion: it records the verified-lab fact regardless
 * of whether the lesson is already marked complete, so a late lab pass is never
 * dropped by completion-ordering.
 */
export async function verifyLab(
  courseSlug: string,
  lessonSlug: string,
  submittedOutput: string,
): Promise<{ ok: boolean; verified: boolean }> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { ok: false, verified: false }

  try {
    // Load the lesson's blocks server-side and pull the lab block's `check`.
    const admin = supabaseAdmin()
    const { data: lesson } = await admin
      .from('academy_lessons')
      .select('blocks')
      .eq('course_slug', courseSlug)
      .eq('slug', lessonSlug)
      .eq('status', 'published')
      .maybeSingle()

    const blocks = (lesson?.blocks ?? []) as LessonBlock[]
    const labBlock = blocks.find((b): b is Extract<LessonBlock, { type: 'lab' }> => b.type === 'lab')
    const check = labBlock?.check?.trim()

    // Re-run the SAME comparison the client does, but on trusted server state.
    const verified = !!check && submittedOutput.toLowerCase().includes(check.toLowerCase())

    if (verified) {
      // A passing lab means the learner built AND verified a real artifact, so
      // both events are genuinely earned. unitId = lessonSlug (one lesson = one unit).
      await recordEvidenceEvent({
        userId: user.id,
        courseSlug,
        lessonSlug,
        unitId: lessonSlug,
        type: 'lab_verified',
        payload: {},
      })
      await recordEvidenceEvent({
        userId: user.id,
        courseSlug,
        lessonSlug,
        unitId: lessonSlug,
        type: 'sprint_artifact_created',
        payload: {},
      })
    }

    return { ok: true, verified }
  } catch (err) {
    console.error('[academy/evidence] verifyLab failed', err)
    return { ok: false, verified: false }
  }
}
