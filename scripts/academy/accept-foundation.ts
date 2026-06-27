/**
 * FOUNDATION ACCEPTANCE FIXTURE (Tier 4).
 *
 *   tsx --env-file=.env.local scripts/academy/accept-foundation.ts
 *
 * Proves the whole enforcement loop runs END-TO-END through the REAL foundation:
 * the real evidence ledger (academy_evidence_events — real table, real append-only
 * trigger, service-role write) feeding the REAL 8-state machine + min-of-caps
 * resolver, driving a unit ready/70 → complete/98 (the internal ceiling; 99+ stays
 * gated on real-learner outcome data).
 *
 * It writes the ledger directly with a service-role client (the same write the
 * server actions make) and derives state/score with the same pure logic the app
 * uses (no `server-only`/`next/headers` wrappers, which don't resolve outside Next).
 * Runs against a FRESH synthetic unit per run (accept-<ts>), so it is re-runnable
 * and never touches the test learner's real lesson — the enforcement e2e depends on
 * that lesson staying evidence-empty. The ledger is append-only; the synthetic
 * units are inert, so there is no teardown.
 */

import { createClient } from '@supabase/supabase-js'
import { deriveUnitState, deriveSignals, type EvidenceEvent, type EvidenceEventType, type EvidencePayload } from '@/lib/academy/evidence-events-logic'
import { resolveScore, type ContractSignals } from '@/lib/academy/caps-logic'

const TEST_EMAIL = 'client1+test@sageideas.org'
const COURSE = 'programming-fundamentals'
const LESSON = 'input-validation'
const UNIT = `accept-${Date.now()}`
// The §12 enrichments all exist in the finished foundation, so a fully-evidenced
// internal unit hits only the external/outcome cap (98).
const CONTRACT: ContractSignals = {
  scenarioFirst: true, aiGuideGrounding: true, habitTriggers: true, masteryMapEntry: true, socialSurface: true,
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env.local)')
const admin = createClient(url, key, { auth: { persistSession: false } })

let failures = 0
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label} → ${JSON.stringify(actual)}${ok ? '' : ` (expected ${JSON.stringify(expected)})`}`)
  if (!ok) failures++
}

async function resolveUserId(): Promise<string> {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (error) throw new Error(`listUsers failed: ${error.message}`)
  const user = data.users.find((u) => u.email === TEST_EMAIL)
  if (!user) throw new Error(`test user ${TEST_EMAIL} not found`)
  return user.id
}

async function emit(userId: string, type: EvidenceEventType, payload: EvidencePayload = {}) {
  // The real action constructs payload server-side (the AI grader sets explainBackGraded
  // via the trusted path); here we write the same persisted rows directly.
  const { error } = await admin.from('academy_evidence_events').insert({
    user_id: userId, course_slug: COURSE, lesson_slug: LESSON, unit_id: UNIT, event_type: type, payload,
  })
  if (error) throw new Error(`emit ${type} failed: ${error.message}`)
}

async function events(userId: string): Promise<EvidenceEvent[]> {
  const { data, error } = await admin
    .from('academy_evidence_events')
    .select('event_type, payload, created_at')
    .eq('user_id', userId).eq('course_slug', COURSE).eq('lesson_slug', LESSON).eq('unit_id', UNIT)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`read failed: ${error.message}`)
  return (data ?? []).map((r) => ({ type: r.event_type as EvidenceEventType, payload: (r.payload ?? {}) as EvidencePayload }))
}
const state = async (u: string) => deriveUnitState({ prerequisitesMet: true, events: await events(u) })
const score = async (u: string) => resolveScore(deriveSignals(await events(u)), CONTRACT).score

async function main() {
  console.log(`\nFOUNDATION ACCEPTANCE — ${COURSE}/${LESSON} unit=${UNIT}\n`)
  const userId = await resolveUserId()
  console.log(`  learner: ${TEST_EMAIL} (${userId.slice(0, 8)}…)\n`)

  check('initial state (no evidence)', await state(userId), 'ready')
  check('initial score (no-retrieval cap)', await score(userId), 70)

  await emit(userId, 'diagnostic_completed')
  check('after diagnostic', await state(userId), 'in_progress')

  await emit(userId, 'retrieval_attempted')
  await emit(userId, 'sprint_artifact_created', { brokenCaseHandled: true })
  check('after artifact', await state(userId), 'proof_pending')

  await emit(userId, 'lab_verified')
  check('after server-verified lab', await state(userId), 'review_pending')

  await emit(userId, 'repair_created')
  check('open repair → repair_required (never a dead end)', await state(userId), 'repair_required')
  await emit(userId, 'repair_completed', { reviewed: true })

  await emit(userId, 'retrieval_attempted', { explainBackGraded: true }) // AI-graded explain-back (trusted path)

  await emit(userId, 'lesson_completed', { spacingScheduled: true })
  check('after lesson complete', await state(userId), 'transfer_due')

  await emit(userId, 'transfer_attempted')
  check('after transfer → COMPLETE', await state(userId), 'complete')

  await emit(userId, 'portfolio_item_created', { boardAsset: true })
  check('final score = internal ceiling (98; 99+ needs real outcomes)', await score(userId), 98)

  console.log(`\n${failures === 0 ? 'ACCEPTANCE PASS — the loop runs end-to-end ready/70 → complete/98 through the real foundation.' : `ACCEPTANCE FAIL — ${failures} check(s) failed.`}\n`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('ACCEPTANCE ERROR:', err)
  process.exit(1)
})
