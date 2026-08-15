/**
 * Pure score-cap resolver — NO 'server-only', NO DB. Unit-testable.
 *
 * The binding score is the MINIMUM of every applicable cap (absence of an
 * evidence signal lowers the ceiling). A course can never self-grade above the
 * evidence it has actually earned. 98–99 is structurally unreachable from
 * internal evidence alone — only real-learner outcome data lifts the last cap.
 *
 * Contract: PLATFORM_ARCHITECTURE.md §5 (V3/Board caps) + §12 (contract caps).
 */

import type { EvidenceSignals } from './evidence-events-logic'

/** Course-level §12 enrichment contract — caps when a piece is absent. */
export type ContractSignals = {
  scenarioFirst: boolean
  aiGuideGrounding: boolean
  habitTriggers: boolean
  masteryMapEntry: boolean
  socialSurface: boolean
}

export type Cap = {
  cap: number
  /** what is missing */
  reason: string
  /** the next action that would lift this cap */
  lift: string
}

/**
 * Every cap that currently applies, in no particular order. A cap applies only
 * when its evidence/contract piece is missing.
 */
export function scoreCaps(signals: EvidenceSignals, contract: ContractSignals): Cap[] {
  const caps: Cap[] = []
  const add = (missing: boolean, cap: number, reason: string, lift: string) => {
    if (missing) caps.push({ cap, reason, lift })
  }

  // V3 / Board caps (§5)
  add(!signals.hasRetrieval, 70, 'no retrieval', 'attempt the retrieval check')
  add(!signals.hasArtifact, 72, 'no artifact', 'build the sprint artifact')
  add(!signals.hasVerification, 78, 'no verification', 'verify your build (run the lab)')
  add(!signals.hasBrokenCase, 82, 'no broken case', 'handle the failure case')
  add(!signals.hasExplainBack, 84, 'no explain-back', 'explain it back to the guide')
  add(!signals.hasReview, 86, 'no review', 'complete the review step')
  add(!signals.hasRepair, 88, 'no repair', 'repair the flagged weakness')
  add(!signals.hasSpacing, 90, 'no spacing', 'schedule the spaced review')
  add(!signals.hasTransfer, 92, 'no transfer', 'transfer to a new context')
  add(!signals.hasPortfolio, 94, 'no portfolio', 'package a portfolio item')
  add(!signals.hasBoardAsset, 95, 'no board asset', 'produce the board asset')
  add(!signals.hasExternalOutcome, 98, 'no external/outcome data', 'earn real-learner outcome data')

  // §12 contract caps
  add(!contract.scenarioFirst, 90, 'no scenario-first hook', 'open the unit with the scenario')
  add(!contract.aiGuideGrounding, 93, 'no AI-guide grounding', 'ground the AI guide in the lesson')
  add(!contract.habitTriggers, 92, 'no habit triggers', 'wire the habit triggers')
  add(!contract.masteryMapEntry, 92, 'no mastery-map entry', 'add the mastery-map entry')
  add(!contract.socialSurface, 94, 'no social surface', 'add a social surface')

  return caps
}

export type ScoreResolution = {
  /** the binding score = min of all applicable caps (100 only if none apply) */
  score: number
  /** the single lowest cap currently holding the score down (null if fully evidenced) */
  binding: Cap | null
  /** every applicable cap, ascending by cap value */
  caps: Cap[]
}

/**
 * Resolve the score: the minimum of all applicable caps. `binding` names the
 * one cap to lift next. Internal-only evidence tops out at 98 (the external/
 * outcome cap) — there is no path to 99+ without real learner outcomes.
 */
export function resolveScore(signals: EvidenceSignals, contract: ContractSignals): ScoreResolution {
  const caps = scoreCaps(signals, contract).sort((a, b) => a.cap - b.cap)
  if (caps.length === 0) return { score: 100, binding: null, caps }
  const binding = caps[0]
  return { score: binding.cap, binding, caps }
}

/** A fully-evidenced internal unit's contract (everything present). */
export const FULL_CONTRACT: ContractSignals = {
  scenarioFirst: true,
  aiGuideGrounding: true,
  habitTriggers: true,
  masteryMapEntry: true,
  socialSurface: true,
}
