/**
 * Pure logic for the academy enforcement spine — NO 'server-only', NO DB.
 * The 11 evidence events, the 8-state unit machine, and the evidence-signal
 * derivation that feeds the score-cap resolver. Unit-testable in isolation.
 *
 * Contract: docs/academy/DATA_SPINE.md + PLATFORM_ARCHITECTURE.md §5/§10.
 * Invariant: unit state and score are ALWAYS a pure function of accumulated
 * evidence — never set directly by the UI. `complete` requires every event.
 */

export const EVIDENCE_EVENT_TYPES = [
  'diagnostic_completed',
  'retrieval_attempted',
  'lesson_completed',
  'sprint_artifact_created',
  'lab_verified',
  'repair_created',
  'repair_completed',
  'transfer_attempted',
  'capstone_submitted',
  'portfolio_item_created',
  'interview_answer_scored',
] as const

export type EvidenceEventType = (typeof EVIDENCE_EVENT_TYPES)[number]

/** A few payload keys the signal-derivation reads; the rest is free-form. */
export type EvidencePayload = {
  brokenCaseHandled?: boolean
  explainBackGraded?: boolean
  reviewed?: boolean
  spacingScheduled?: boolean
  boardAsset?: boolean
  externalOutcome?: boolean
  confidencePre?: number
  score?: number
  [key: string]: unknown
}

export type EvidenceEvent = {
  type: EvidenceEventType
  payload?: EvidencePayload
  at?: string
}

export const UNIT_STATES = [
  'locked',
  'ready',
  'in_progress',
  'proof_pending',
  'review_pending',
  'repair_required',
  'transfer_due',
  'complete',
] as const

export type UnitState = (typeof UNIT_STATES)[number]

export type UnitInput = {
  prerequisitesMet: boolean
  events: readonly EvidenceEvent[]
}

/** Events required for a standard unit to reach `complete`. */
export const REQUIRED_FOR_COMPLETE: readonly EvidenceEventType[] = [
  'diagnostic_completed',
  'retrieval_attempted',
  'sprint_artifact_created',
  'lab_verified',
  'lesson_completed',
  'transfer_attempted',
] as const

function has(events: readonly EvidenceEvent[], type: EvidenceEventType): boolean {
  return events.some((e) => e.type === type)
}

/** An open repair = a repair was created but not yet completed. */
export function hasOpenRepair(events: readonly EvidenceEvent[]): boolean {
  const created = events.filter((e) => e.type === 'repair_created').length
  const completed = events.filter((e) => e.type === 'repair_completed').length
  return created > completed
}

/**
 * Derive the unit's state purely from its evidence. The "Complete" affordance
 * stays disabled until this returns 'complete'. A failed gate (open repair)
 * routes to 'repair_required' — never a dead end (the repair queue picks it up).
 *
 * `complete` is PRESENCE-based: it requires every event in REQUIRED_FOR_COMPLETE
 * to exist, regardless of arrival order. Pedagogical ordering is enforced upstream
 * at the emit layer (the server actions), not here — and events cannot be forged
 * (RLS: no learner insert path), so presence is a sufficient completion invariant.
 * `capstone_submitted` / `interview_answer_scored` are emitted only by capstone and
 * interview-ready units (different required sets) and intentionally don't affect a
 * standard unit's state.
 */
export function deriveUnitState(input: UnitInput): UnitState {
  const { prerequisitesMet, events } = input
  if (!prerequisitesMet) return 'locked'
  if (events.length === 0) return 'ready'
  if (hasOpenRepair(events)) return 'repair_required'

  const allRequired = REQUIRED_FOR_COMPLETE.every((t) => has(events, t))
  if (allRequired) return 'complete'

  // furthest contiguous stage reached
  if (has(events, 'lesson_completed')) return 'transfer_due'
  if (has(events, 'lab_verified')) return 'review_pending'
  if (has(events, 'sprint_artifact_created')) return 'proof_pending'
  if (has(events, 'diagnostic_completed') || has(events, 'retrieval_attempted')) return 'in_progress'
  return 'ready'
}

/** The boolean evidence signals the score-cap resolver consumes. */
export type EvidenceSignals = {
  hasRetrieval: boolean
  hasArtifact: boolean
  hasVerification: boolean
  hasBrokenCase: boolean
  hasExplainBack: boolean
  hasReview: boolean
  hasRepair: boolean
  hasSpacing: boolean
  hasTransfer: boolean
  hasPortfolio: boolean
  hasBoardAsset: boolean
  hasExternalOutcome: boolean
}

/**
 * Collapse the event log into the signal set. Some signals come from an event
 * type; some from a payload flag (a clean review still emits `repair_completed`
 * with no open repair, which is what lifts the "no repair" cap).
 */
export function deriveSignals(events: readonly EvidenceEvent[]): EvidenceSignals {
  const payloadFlag = (key: keyof EvidencePayload): boolean =>
    events.some((e) => e.payload?.[key] === true)
  return {
    hasRetrieval: has(events, 'retrieval_attempted'),
    hasArtifact: has(events, 'sprint_artifact_created'),
    hasVerification: has(events, 'lab_verified'),
    hasBrokenCase: payloadFlag('brokenCaseHandled'),
    hasExplainBack: payloadFlag('explainBackGraded'),
    hasReview: has(events, 'lesson_completed') || payloadFlag('reviewed'),
    // a real repair cycle requires BOTH a created and a (matching) completed event —
    // a stray repair_completed must NOT lift the cap.
    hasRepair:
      has(events, 'repair_created') &&
      has(events, 'repair_completed') &&
      !hasOpenRepair(events),
    hasSpacing: payloadFlag('spacingScheduled'),
    hasTransfer: has(events, 'transfer_attempted'),
    hasPortfolio: has(events, 'portfolio_item_created'),
    hasBoardAsset: payloadFlag('boardAsset'),
    hasExternalOutcome: payloadFlag('externalOutcome'),
  }
}
