'use server'

import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import {
  recordEvidenceEvent,
  getUnitEvents,
} from '@/lib/academy/evidence-events'
import { hasOpenRepair } from '@/lib/academy/evidence-events-logic'
import {
  buildTeachbackGradingMessages,
  parseGradingVerdict,
  looksLikeInjection,
} from '@/lib/academy/grader-logic'
import { deepSeekChat } from '@/lib/rag/deepseek'
import type { LessonBlock } from '@/data/academy/sample-course'

/**
 * AI-guide-as-grader (the keystone). A learner explains a concept back; the AI
 * grader judges it. On a GENUINE pass we emit the trusted `explainBackGraded`
 * evidence (lifting the explain-back cap, 84) and close any open repair; on a
 * fail we open a repair (state → repair_required → the repair queue).
 *
 * @security
 *  - userId is taken from the authenticated session — NEVER from client input.
 *  - The teachback prompt is loaded server-side from the published lesson; the
 *    client never supplies the grading target.
 *  - `explainBackGraded` is a grader-only payload key (lifts a cap), so it is
 *    written with { trusted: true } — and ONLY after a real LLM pass. If grading
 *    is unavailable (no key) we never emit it; we tell the learner honestly that
 *    grading is warming up.
 *  - Best-effort: a grading/IO failure never throws to the client.
 */

const MIN_EXPLANATION_CHARS = 20
const MAX_EXPLANATION_CHARS = 4000
const GRADER_MAX_TOKENS = 300

/** Per-user-per-unit grading throttle: at most this many grade attempts in the recent window. */
const GRADE_RATE_LIMIT = 8
const GRADE_RATE_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

/**
 * Count recent grade-related evidence events for this user+unit, used as a
 * lightweight per-user rate limit (no dedicated table). Fails OPEN: any
 * unexpected query error returns 0 so a DB blip never locks out a legit learner.
 */
async function countRecentGradeAttempts(
  userId: string,
  lessonSlug: string,
): Promise<number> {
  try {
    const admin = supabaseAdmin()
    const since = new Date(Date.now() - GRADE_RATE_WINDOW_MS).toISOString()
    const { count, error } = await admin
      .from('academy_evidence_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('lesson_slug', lessonSlug)
      .eq('unit_id', lessonSlug)
      .in('event_type', ['retrieval_attempted', 'repair_created', 'repair_completed'])
      .gte('created_at', since)
    if (error) {
      console.error('[academy/grader] rate-limit count query error', error)
      return 0 // fail open
    }
    return count ?? 0
  } catch (err) {
    console.error('[academy/grader] rate-limit count threw', err)
    return 0 // fail open
  }
}

export type GradeTeachbackResult = {
  /** False when there is no session OR grading is unavailable (no LLM key). */
  available: boolean
  passed: boolean
  feedback: string
}

/** Pull the teachback block's prompts from the published lesson, joined into one concept prompt. */
async function loadTeachbackPrompt(
  courseSlug: string,
  lessonSlug: string,
): Promise<string | null> {
  const admin = supabaseAdmin()
  const { data: lesson } = await admin
    .from('academy_lessons')
    .select('blocks')
    .eq('course_slug', courseSlug)
    .eq('slug', lessonSlug)
    .eq('status', 'published')
    .maybeSingle()

  const blocks = (lesson?.blocks ?? []) as LessonBlock[]
  const teachback = blocks.find(
    (b): b is Extract<LessonBlock, { type: 'teachback' }> => b.type === 'teachback',
  )
  const prompts = (teachback?.prompts ?? []).filter(Boolean)
  if (prompts.length === 0) return null
  return prompts.join('\n')
}

export async function gradeTeachback(
  courseSlug: string,
  lessonSlug: string,
  explanation: string,
): Promise<GradeTeachbackResult> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { available: false, passed: false, feedback: '' }

  // Cheap client-side-mirrored guard: don't spend an LLM call on a non-answer.
  const trimmed = explanation.trim()
  if (trimmed.length < MIN_EXPLANATION_CHARS) {
    return {
      available: true,
      passed: false,
      feedback: 'Write a bit more — explain the idea in your own words with a concrete example and one edge case.',
    }
  }

  // Bound the input: an over-long explanation is rejected before any LLM call.
  if (trimmed.length > MAX_EXPLANATION_CHARS) {
    return {
      available: true,
      passed: false,
      feedback: 'Explanation is too long — aim for clarity over length.',
    }
  }

  // Prompt-injection guard: reject crafted "ignore previous instructions" style
  // input before the LLM ever sees it (also saves cost). Emit nothing.
  if (looksLikeInjection(trimmed)) {
    return {
      available: true,
      passed: false,
      feedback: 'Please explain the concept in your own words.',
    }
  }

  // Per-user-per-unit rate limit (no dedicated table): count recent grade-related
  // evidence events. Over the threshold → throttle without calling the LLM or
  // emitting anything. Fails open on a query error (see countRecentGradeAttempts).
  const recentAttempts = await countRecentGradeAttempts(user.id, lessonSlug)
  if (recentAttempts >= GRADE_RATE_LIMIT) {
    return {
      available: true,
      passed: false,
      feedback: "You're grading quickly — take a moment and try again shortly.",
    }
  }

  // Honest degrade: with no LLM key we cannot grade, so we never emit the
  // (cap-lifting) explainBackGraded evidence. Say so plainly.
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    return {
      available: false,
      passed: false,
      feedback: 'Grading is warming up — your explanation was saved.',
    }
  }

  try {
    const conceptPrompt = await loadTeachbackPrompt(courseSlug, lessonSlug)
    if (!conceptPrompt) {
      // No teachback target on this lesson — nothing to grade against.
      return { available: false, passed: false, feedback: 'Grading is warming up — your explanation was saved.' }
    }

    const result = await deepSeekChat({
      messages: buildTeachbackGradingMessages(conceptPrompt, trimmed),
      temperature: 0,
      maxTokens: GRADER_MAX_TOKENS,
    })
    const verdict = parseGradingVerdict(result.content)

    if (verdict.passed) {
      // A genuine pass earns the trusted explain-back signal (lifts the 84 cap).
      // unitId = lessonSlug (one lesson = one unit).
      await recordEvidenceEvent(
        {
          userId: user.id,
          courseSlug,
          lessonSlug,
          unitId: lessonSlug,
          type: 'retrieval_attempted',
          payload: { explainBackGraded: true },
        },
        { trusted: true },
      )

      // If a prior fail opened a repair, a passing explanation closes it.
      const events = await getUnitEvents(user.id, courseSlug, lessonSlug, lessonSlug)
      if (hasOpenRepair(events)) {
        await recordEvidenceEvent({
          userId: user.id,
          courseSlug,
          lessonSlug,
          unitId: lessonSlug,
          type: 'repair_completed',
          payload: {},
        })
      }
    } else {
      // A fail opens a repair → state goes repair_required → the repair queue.
      await recordEvidenceEvent({
        userId: user.id,
        courseSlug,
        lessonSlug,
        unitId: lessonSlug,
        type: 'repair_created',
        payload: {},
      })
    }

    return { available: true, passed: verdict.passed, feedback: verdict.feedback }
  } catch (err) {
    console.error('[academy/grader] gradeTeachback failed', err)
    // Never throw to the client; treat an outage as "unavailable" (no evidence emitted).
    return { available: false, passed: false, feedback: 'Grading is warming up — your explanation was saved.' }
  }
}
