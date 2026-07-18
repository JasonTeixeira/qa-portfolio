'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startLoopRound, finalizeLoop } from '@/app/academy/interview/_actions-network'
import { verdictLabel, type CommitteeVerdict } from '@/lib/academy/interview/rubric'
import styles from './loop.module.css'

/** One planned round of the loop, resolved against the caller's real round sessions. */
export type LoopRoundView = {
  index: number
  name: string
  track: string
  focus: string | null
  /** planned = no session yet · live = session started, not graded · graded = has a real verdict. */
  state: 'planned' | 'live' | 'graded'
  sessionId: string | null
  score: number | null
  verdict: CommitteeVerdict | null
}

/** The deterministic loop aggregate, present ONLY once the loop has been finalized. */
export type LoopAggregateView = {
  overall: number
  verdict: CommitteeVerdict
  gradedRounds: number
  totalRounds: number
  perRound: { index: number; label: string; score: number }[]
}

type Props = {
  loopId: string
  presetName: string
  presetDescription: string | null
  rounds: readonly LoopRoundView[]
  /** Deterministic aggregate, or null when the loop has not been finalized yet. */
  initialAggregate: LoopAggregateView | null
}

const TRACK_LABELS: Record<string, string> = {
  coding: 'Coding',
  system_design: 'System design',
  behavioral: 'Behavioral',
  negotiation: 'Negotiation',
}

const START_REASONS: Record<string, string> = {
  unauthorized: 'Sign in to run this round.',
  forbidden: 'This loop is not yours.',
  loop_complete: 'Every round has already been started.',
  no_rounds: 'This preset has no rounds configured.',
  invalid_preset_round: 'That round is misconfigured — contact support.',
  insert_failed: 'Could not start the round — try again.',
  server_error: 'Something went wrong — try again.',
}

const FINALIZE_REASONS: Record<string, string> = {
  unauthorized: 'Sign in to finalize this loop.',
  forbidden: 'This loop is not yours.',
  no_rounds: 'This loop has no rounds yet.',
  no_graded_rounds: 'No round is graded yet — finish a round first.',
  update_failed: 'Could not finalize the loop — try again.',
  server_error: 'Something went wrong — try again.',
}

function trackLabel(track: string): string {
  return TRACK_LABELS[track] ?? track
}

/** Committee band → color class (shared with the aggregate reveal). */
function bandClass(verdict: CommitteeVerdict): string {
  if (verdict === 'strong_hire' || verdict === 'hire') return styles.bandHire
  if (verdict === 'lean_hire') return styles.bandLean
  return styles.bandNo
}

/**
 * The loop "dress rehearsal" runner. Renders the preset's ordered rounds with their REAL state
 * (planned / live / graded + the round's real verdict), starts the next round through the
 * existing single-session flow, and — only once every round is graded — finalizes the loop to
 * reveal the DETERMINISTIC aggregate (mean of the round scores → committee band).
 *
 * HONESTY: the aggregate is never shown before the loop is finalized, and a partial loop shows
 * "N of M rounds graded" rather than an inflated projection. No round score is ever fabricated.
 */
export function LoopRunner({ loopId, presetName, presetDescription, rounds, initialAggregate }: Props) {
  const router = useRouter()
  const [startPending, startTransition] = useTransition()
  const [finalizePending, finalizeTransition] = useTransition()
  const [aggregate, setAggregate] = useState<LoopAggregateView | null>(initialAggregate)
  const [error, setError] = useState<string | null>(null)

  const totalRounds = rounds.length
  const gradedRounds = rounds.filter((r) => r.state === 'graded').length
  const liveRound = rounds.find((r) => r.state === 'live') ?? null
  const nextPlanned = rounds.find((r) => r.state === 'planned') ?? null
  // The next round can only be started once no earlier round is still live.
  const nextStartable = liveRound ? null : nextPlanned
  const allGraded = totalRounds > 0 && gradedRounds === totalRounds
  const progressPct = totalRounds > 0 ? Math.round((gradedRounds / totalRounds) * 100) : 0

  function startRound() {
    setError(null)
    startTransition(async () => {
      const result = await startLoopRound(loopId)
      if (result.ok) {
        router.push(`/academy/interview/session/${result.sessionId}`)
        return
      }
      setError(START_REASONS[result.reason] ?? 'Could not start the round — try again.')
    })
  }

  function finalize() {
    setError(null)
    finalizeTransition(async () => {
      const result = await finalizeLoop(loopId)
      if (result.ok) {
        setAggregate({
          overall: result.overall,
          verdict: result.verdict as CommitteeVerdict,
          gradedRounds: result.gradedRounds,
          totalRounds: result.totalRounds,
          perRound: rounds
            .filter((r) => r.state === 'graded' && r.score != null)
            .map((r) => ({ index: r.index, label: `R${r.index + 1} · ${trackLabel(r.track)}`, score: r.score as number })),
        })
        router.refresh()
        return
      }
      setError(FINALIZE_REASONS[result.reason] ?? 'Could not finalize the loop — try again.')
    })
  }

  return (
    <div className={styles.scope}>
      <div className={styles.head}>
        <div className={styles.headKicker}>
          Loop simulation · {totalRounds} round{totalRounds === 1 ? '' : 's'} · run the real order
        </div>
        <h1 className={styles.headTitle}>{presetName}</h1>
        {presetDescription ? <p className={styles.headLine}>{presetDescription}</p> : null}
        <div className={styles.progress}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <span className={styles.progressLabel}>
            {gradedRounds} of {totalRounds} rounds graded
          </span>
        </div>
      </div>

      <div className={styles.rounds}>
        {rounds.map((round) => {
          const isNext = nextStartable?.index === round.index
          const isLive = round.state === 'live'
          const isActive = isNext || isLive
          return (
            <div key={round.index} className={isActive ? `${styles.round} ${styles.roundActive}` : styles.round}>
              <span
                className={
                  round.state === 'graded' ? `${styles.roundNum} ${styles.roundNumGraded}` : styles.roundNum
                }
              >
                {round.index + 1}
              </span>
              <div className={styles.roundBody}>
                <div className={styles.roundName}>{round.name}</div>
                {round.focus ? <div className={styles.roundFocus}>{round.focus}</div> : null}
                <div className={styles.roundMeta}>
                  <span className={styles.trackChip}>{trackLabel(round.track)}</span>
                </div>
              </div>
              <div className={styles.roundStatus}>
                {round.state === 'graded' && round.verdict != null ? (
                  <div className={styles.roundScore}>
                    <div className={styles.roundScoreNum}>{round.score}</div>
                    <div className={`${styles.roundVerdict} ${bandClass(round.verdict)}`}>
                      {verdictLabel(round.verdict)}
                    </div>
                  </div>
                ) : isLive && round.sessionId ? (
                  <>
                    <span className={`${styles.statusTag} ${styles.statusLive}`}>In progress</span>
                    <a className={styles.ghostLink} href={`/academy/interview/session/${round.sessionId}`}>
                      Resume round →
                    </a>
                  </>
                ) : isNext ? (
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={startRound}
                    disabled={startPending}
                    aria-busy={startPending}
                  >
                    {startPending ? 'Starting…' : `Start round ${round.index + 1}`}
                  </button>
                ) : (
                  <span className={styles.statusTag}>Planned</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error ? (
        <div className={styles.errorMsg} role="alert">
          {error}
        </div>
      ) : null}

      {aggregate ? (
        <div className={styles.aggregate}>
          <div className={styles.aggKicker}>Loop verdict · aggregate of {aggregate.gradedRounds} graded round{aggregate.gradedRounds === 1 ? '' : 's'}</div>
          <div className={styles.aggHeadline}>
            <span className={`${styles.aggVerdict} ${bandClass(aggregate.verdict)}`}>
              {verdictLabel(aggregate.verdict)}
            </span>
            <span className={styles.aggScore}>overall {aggregate.overall} / 100</span>
          </div>
          <p className={styles.aggNote}>
            Your loop verdict is the deterministic mean of your round scores, banded against your target
            level — not a number anyone can inflate. One weak round pulls the whole loop down, exactly
            like a real committee.
            {aggregate.gradedRounds < aggregate.totalRounds
              ? ` Only ${aggregate.gradedRounds} of ${aggregate.totalRounds} rounds are graded, so this covers the graded rounds so far.`
              : ''}
          </p>
          <div className={styles.aggRounds}>
            {aggregate.perRound.map((r) => (
              <div key={r.index} className={styles.aggRow}>
                <span className={styles.aggRowLabel}>{r.label}</span>
                <span className={styles.aggBarTrack}>
                  <span className={styles.aggBarFill} style={{ width: `${Math.min(100, Math.max(0, r.score))}%` }} />
                </span>
                <span className={styles.aggRowScore}>{r.score}</span>
              </div>
            ))}
          </div>
        </div>
      ) : allGraded ? (
        <div className={styles.finalizeRow}>
          <span className={styles.finalizeCopy}>
            Every round is graded. Finalize to lock in your aggregate loop verdict — the deterministic
            mean of your rounds, banded against your level.
          </span>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={finalize}
            disabled={finalizePending}
            aria-busy={finalizePending}
          >
            {finalizePending ? 'Finalizing…' : 'Finalize loop'}
          </button>
        </div>
      ) : (
        <div className={styles.partialNote}>
          {gradedRounds} of {totalRounds} rounds graded — finish the loop to see your aggregate verdict. We
          never project a loop verdict from ungraded rounds.
        </div>
      )}
    </div>
  )
}
