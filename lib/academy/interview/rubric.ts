/**
 * The Interview Mastery rubric — a fixed, code-owned taxonomy. Pure + unit-testable; no I/O.
 *
 * Two product invariants live here (Spec §1):
 *   1. ONE readiness score, SIX dimensions, CAPPED BY THE WEAKEST. Overall readiness is not an
 *      average — it is gated by the lowest dimension. You are "6 points from the bar" *because*
 *      your weakest habit caps everything.
 *   2. Committee-language verdicts (`strong_hire → strong_no_hire`) scored against "the bar" for
 *      the target level (intern 62 · new_grad 70 · mid 77 · senior 84).
 *
 * These six dimensions never change, so they are a constant here rather than a table.
 */

export type DimensionSlug =
  | 'problem_framing'
  | 'communication'
  | 'technical_depth'
  | 'tradeoff_judgment'
  | 'verification_habit'
  | 'composure'

export type RubricDimension = {
  slug: DimensionSlug
  label: string
  /** What Marlowe and the committee are actually scoring on this axis. */
  blurb: string
}

/** The six committee dimensions, in canonical display order. */
export const RUBRIC_DIMENSIONS: readonly RubricDimension[] = [
  {
    slug: 'problem_framing',
    label: 'Problem framing',
    blurb: 'Restates the problem, surfaces constraints, and picks the right shape before coding.',
  },
  {
    slug: 'communication',
    label: 'Communication',
    blurb: 'Narrates a plan, thinks out loud, and keeps the interviewer with them.',
  },
  {
    slug: 'technical_depth',
    label: 'Technical depth',
    blurb: 'Reaches for the right tool and reasons correctly about complexity and edge cases.',
  },
  {
    slug: 'tradeoff_judgment',
    label: 'Tradeoff judgment',
    blurb: 'Names alternatives and defends a choice under pressure instead of hand-waving.',
  },
  {
    slug: 'verification_habit',
    label: 'Verification habit',
    blurb: 'Proves correctness with a test — never trusts a green bar or asserts "done" without evidence.',
  },
  {
    slug: 'composure',
    label: 'Composure',
    blurb: 'Recovers from a stumble, absorbs a hard follow-up, and stays steady when interrupted.',
  },
] as const

export const DIMENSION_SLUGS: readonly DimensionSlug[] = RUBRIC_DIMENSIONS.map((d) => d.slug)

// ── Levels + bars ──────────────────────────────────────────────────────────

export type LevelSlug = 'intern' | 'new_grad' | 'mid' | 'senior'

/** The bar (readiness threshold) for each target level — mirrors interview_levels seed. */
export const LEVEL_BARS: Readonly<Record<LevelSlug, number>> = {
  intern: 62,
  new_grad: 70,
  mid: 77,
  senior: 84,
}

/** The bar for a level, defaulting to the senior bar for an unknown/missing level. */
export function barForLevel(level: LevelSlug | string | null | undefined): number {
  if (level && level in LEVEL_BARS) return LEVEL_BARS[level as LevelSlug]
  return LEVEL_BARS.senior
}

// ── Bar status + committee verdict bands ────────────────────────────────────

/** How a single dimension's score sits relative to the level's bar. */
export type BarStatus = 'above_bar' | 'at_bar' | 'near_bar' | 'below_bar'

export type CommitteeVerdict = 'strong_hire' | 'hire' | 'lean_hire' | 'no_hire' | 'strong_no_hire'

/** Points below the bar within which a dimension is "near" (still caps the score) rather than "below". */
const NEAR_BAR_BAND = 6

/**
 * Classify one dimension's score against the bar. A dimension AT or ABOVE the bar clears it;
 * within NEAR_BAR_BAND below counts as "near bar"; further below is "below bar" and is what
 * caps the overall score.
 */
export function barStatus(score: number, bar: number): BarStatus {
  if (score >= bar + NEAR_BAR_BAND) return 'above_bar'
  if (score >= bar) return 'at_bar'
  if (score >= bar - NEAR_BAR_BAND) return 'near_bar'
  return 'below_bar'
}

export type DimensionScore = { slug: DimensionSlug; score: number }

/**
 * The core "capped by your weakest dimension" rule. Overall readiness is the MINIMUM dimension
 * score, not the average — one weak habit gates the whole result. Missing dimensions are treated
 * as unscored and ignored; an empty set yields 0 (no data → no score, never a fabricated number).
 */
export function overallReadiness(dims: readonly DimensionScore[]): number {
  if (dims.length === 0) return 0
  return dims.reduce((min, d) => Math.min(min, d.score), Number.POSITIVE_INFINITY)
}

/** The single weakest dimension — the one the plan should attack first. Null when there is no data. */
export function weakestDimension(dims: readonly DimensionScore[]): DimensionScore | null {
  if (dims.length === 0) return null
  return dims.reduce((weakest, d) => (d.score < weakest.score ? d : weakest))
}

/**
 * Map an overall (min-capped) score against the level bar to a committee verdict band. The bands
 * are relative to the bar so the same score reads differently for an intern vs a senior target.
 */
export function committeeVerdict(overall: number, bar: number): CommitteeVerdict {
  const delta = overall - bar
  if (delta >= 8) return 'strong_hire'
  if (delta >= 0) return 'hire'
  if (delta >= -6) return 'lean_hire'
  if (delta >= -16) return 'no_hire'
  return 'strong_no_hire'
}

/** Human-facing committee label. */
export function verdictLabel(verdict: CommitteeVerdict): string {
  switch (verdict) {
    case 'strong_hire':
      return 'Strong hire'
    case 'hire':
      return 'Hire'
    case 'lean_hire':
      return 'Lean hire'
    case 'no_hire':
      return 'No hire'
    case 'strong_no_hire':
      return 'Strong no-hire'
  }
}
