import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import {
  deriveUnitState,
  deriveSignals,
  type EvidenceEvent,
  type EvidenceEventType,
  type EvidencePayload,
  type UnitState,
} from '@/lib/academy/evidence-events-logic'
import {
  resolveScore,
  type ContractSignals,
  type ScoreResolution,
} from '@/lib/academy/caps-logic'

/**
 * The DB layer for the enforcement spine. Writes go through the service role
 * AFTER a server-side check (the caller is responsible for verifying the event
 * really happened — the lab verified, the guide graded the explain-back). A
 * learner has no insert path (RLS), so they cannot fake an event, a state, or a
 * score. Reads + derivation reuse the pure logic in *-logic.ts.
 */

export type RecordEvidenceInput = {
  userId: string
  courseSlug: string
  lessonSlug: string
  unitId: string
  type: EvidenceEventType
  payload?: EvidencePayload
}

/**
 * Append one verified evidence event. Service-role only; append-only.
 *
 * @security CALLER CONTRACT — the anti-cheat guarantee lives here, not in the DB:
 *  1. `userId` MUST be sourced from the authenticated session (`auth.getUser()`),
 *     NEVER from request/route/form input. The service role bypasses RLS, so a
 *     spoofed `userId` would write to another learner's ledger (IDOR).
 *  2. `payload` MUST be constructed server-side from VERIFIED facts (the lab
 *     actually verified output; the AI guide actually graded the explain-back).
 *     NEVER forward a client-supplied payload. In particular `externalOutcome`
 *     is admin/grader-only — it lifts the final 98-cap and must never be settable
 *     by a learner-triggered flow.
 *  3. Emit the event only AFTER the underlying check passed — this is the write
 *     of record, not a request to check.
 */
export async function recordEvidenceEvent(input: RecordEvidenceInput): Promise<void> {
  const admin = supabaseAdmin()
  const { error } = await admin.from('academy_evidence_events').insert({
    user_id: input.userId,
    course_slug: input.courseSlug,
    lesson_slug: input.lessonSlug,
    unit_id: input.unitId,
    event_type: input.type,
    payload: input.payload ?? {},
  })
  if (error) throw new Error(`evidence insert failed: ${error.message}`)
}

/** Raw events for one unit, oldest first (the order state derivation expects). */
export async function getUnitEvents(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  unitId: string,
): Promise<EvidenceEvent[]> {
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('academy_evidence_events')
    .select('event_type, payload, created_at')
    .eq('user_id', userId)
    .eq('course_slug', courseSlug)
    .eq('lesson_slug', lessonSlug)
    .eq('unit_id', unitId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`evidence read failed: ${error.message}`)
  return (data ?? []).map((r) => ({
    type: r.event_type as EvidenceEventType,
    payload: (r.payload ?? {}) as EvidencePayload,
    at: r.created_at as string,
  }))
}

/** The unit's current state — always a pure function of its evidence. */
export async function getUnitState(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  unitId: string,
  prerequisitesMet: boolean,
): Promise<UnitState> {
  const events = await getUnitEvents(userId, courseSlug, lessonSlug, unitId)
  return deriveUnitState({ prerequisitesMet, events })
}

/** The unit's resolved score (min of all binding caps) for the score-cap UI. */
export async function getUnitScore(
  userId: string,
  courseSlug: string,
  lessonSlug: string,
  unitId: string,
  contract: ContractSignals,
): Promise<ScoreResolution> {
  const events = await getUnitEvents(userId, courseSlug, lessonSlug, unitId)
  return resolveScore(deriveSignals(events), contract)
}
