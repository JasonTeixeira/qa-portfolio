/**
 * Pure logic for the loop-simulation aggregate — NO IO, NO DB, NO LLM. A full
 * loop is N graded rounds (each an interview_sessions row with loop_id set); this
 * module turns the round verdicts into ONE honest overall verdict (Spec §5.4 loop
 * sim / §3b interview_loops.overall_verdict).
 *
 * The one non-negotiable rule: the loop's overall is DETERMINISTIC from the round
 * scores — the MEAN of the graded rounds, then banded by rubric.committeeVerdict
 * against the level bar. It is NEVER a model call. A loop with one weak round is
 * honestly dragged down by that round's score; you cannot buy back a bombed
 * system-design round with a great coding round beyond what the average allows.
 */

import { barForLevel, committeeVerdict, type CommitteeVerdict } from '@/lib/academy/interview/rubric'

/** One graded round's verdict feeding the aggregate. `verdict`/`track` are carried through. */
export type LoopRoundVerdict = {
  score: number
  verdict?: string | null
  track?: string | null
}

/** One round as reflected back in the aggregate (only finite-scored rounds count). */
export type LoopPerRound = {
  score: number
  verdict: string | null
  track: string | null
}

/** The deterministic loop aggregate. Null is returned when no round is graded yet. */
export type LoopAggregate = {
  /** Mean of the graded round scores, rounded — the deterministic loop overall. */
  overall: number
  /** Committee band for `overall` against the level bar — derived, never a model claim. */
  verdict: CommitteeVerdict
  perRound: LoopPerRound[]
  /** How many rounds actually contributed a real (finite) score. */
  gradedRounds: number
}

export type AggregateLoopOptions = {
  /** Target level whose bar the overall is banded against (defaults to senior). */
  level?: string | null
}

/**
 * Aggregate a loop's round verdicts into one deterministic overall.
 *
 * INTEGRITY: `overall` is the MEAN of the graded round scores (never a model
 * call), and `verdict` is `committeeVerdict(overall, bar)` — the same banding the
 * single-session grader uses. Rounds without a finite score are ignored (an
 * ungraded round contributes nothing rather than a fabricated zero); when NO
 * round is graded there is no honest overall, so the function returns `null`
 * (incomplete) — the caller must not write a loop verdict from nothing.
 */
export function aggregateLoopVerdict(
  roundVerdicts: readonly LoopRoundVerdict[],
  options: AggregateLoopOptions = {},
): LoopAggregate | null {
  if (!Array.isArray(roundVerdicts) || roundVerdicts.length === 0) return null

  const perRound: LoopPerRound[] = []
  let sum = 0
  for (const round of roundVerdicts) {
    if (!round) continue
    const score = Number(round.score)
    // Skip ungraded / non-finite rounds — never coerce a missing grade into a 0.
    if (!Number.isFinite(score)) continue
    const clamped = Math.min(100, Math.max(0, Math.round(score)))
    perRound.push({
      score: clamped,
      verdict: typeof round.verdict === 'string' ? round.verdict : null,
      track: typeof round.track === 'string' ? round.track : null,
    })
    sum += clamped
  }

  const gradedRounds = perRound.length
  if (gradedRounds === 0) return null // incomplete — no graded round to aggregate

  const overall = Math.round(sum / gradedRounds)
  const bar = barForLevel(options.level ?? null)
  const verdict = committeeVerdict(overall, bar)

  return { overall, verdict, perRound, gradedRounds }
}
