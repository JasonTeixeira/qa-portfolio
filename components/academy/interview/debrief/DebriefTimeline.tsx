'use client'

import { useState } from 'react'
import styles from './debrief.module.css'

/** One graded moment from interview_verdicts.evidence. */
export type DebriefMoment = {
  tsSeconds: number
  mark: string
  title: string
  note: string
}

/** One transcript turn from interview_turns (passed in — replay needs no new fetch). */
export type DebriefTurn = {
  seq: number
  speaker: string
  content: string
  tsSeconds: number | null
  isHint: boolean
}

type Props = {
  moments: readonly DebriefMoment[]
  turns: readonly DebriefTurn[]
}

/** Seconds around a moment's timestamp that count as "at" that moment for replay. */
const REPLAY_BEFORE = 25
const REPLAY_AFTER = 45
const MAX_REPLAY_TURNS = 4

function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/**
 * The transcript turns at/around a moment. A pure client-side disclosure over the turns already
 * loaded — clicking a timestamp reveals what was actually said, no fetch. Turns are correlated by
 * ts_seconds within a window; when none carry a timestamp near the moment, the nearest single turn
 * is shown, and when there is no transcript at all the disclosure says so honestly.
 */
function turnsForMoment(moment: DebriefMoment, turns: readonly DebriefTurn[]): DebriefTurn[] {
  const timed = turns.filter((t) => typeof t.tsSeconds === 'number')
  if (timed.length === 0) return []
  const lo = moment.tsSeconds - REPLAY_BEFORE
  const hi = moment.tsSeconds + REPLAY_AFTER
  const inWindow = timed
    .filter((t) => (t.tsSeconds as number) >= lo && (t.tsSeconds as number) <= hi)
    .sort((a, b) => (a.tsSeconds as number) - (b.tsSeconds as number))
  if (inWindow.length > 0) return inWindow.slice(0, MAX_REPLAY_TURNS)
  // Fallback: the single turn closest to the moment.
  const nearest = timed.reduce((best, t) =>
    Math.abs((t.tsSeconds as number) - moment.tsSeconds) < Math.abs((best.tsSeconds as number) - moment.tsSeconds)
      ? t
      : best,
  )
  return [nearest]
}

/**
 * The timestamped debrief timeline. Every entry is a REAL graded moment from the transcript; each
 * timestamp is tap-to-replay — it discloses the transcript turns around that second. No fabricated
 * moments: an ungraded/empty evidence set renders an honest line instead of an invented timeline.
 */
export function DebriefTimeline({ moments, turns }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  if (moments.length === 0) {
    return (
      <p className={styles.emptyLine}>
        No timestamped moments were captured for this mock — the committee scored it without pinning
        specific transcript beats. Nothing is invented here.
      </p>
    )
  }

  const hasTranscript = turns.length > 0

  return (
    <div className={styles.timeline}>
      {moments.map((mo, i) => {
        const isOpen = openIdx === i
        const replay = isOpen ? turnsForMoment(mo, turns) : []
        return (
          <div key={`${mo.tsSeconds}-${i}`} className={styles.moment}>
            <button
              type="button"
              className={styles.momentStamp}
              aria-expanded={isOpen}
              onClick={() => setOpenIdx(isOpen ? null : i)}
              title="Tap to replay the transcript at this moment"
            >
              {mmss(mo.tsSeconds)}
            </button>
            <div className={styles.momentBody}>
              <div className={styles.momentTop}>
                {mo.mark ? (
                  <span className={styles.mark} data-mark={mo.mark}>
                    {mo.mark}
                  </span>
                ) : null}
                {mo.title ? <span className={styles.momentTitle}>{mo.title}</span> : null}
              </div>
              {mo.note ? <p className={styles.momentNote}>{mo.note}</p> : null}
              {!isOpen ? (
                <div className={styles.replayHint}>
                  {hasTranscript ? 'tap the time to replay ↑' : 'transcript replay unavailable'}
                </div>
              ) : null}
              {isOpen ? (
                <div className={styles.replay}>
                  {replay.length === 0 ? (
                    <span className={styles.replayEmpty}>
                      No transcript was captured around this moment.
                    </span>
                  ) : (
                    replay.map((t) => (
                      <div key={t.seq} className={styles.replayTurn}>
                        <span className={styles.replaySpeaker} data-speaker={t.speaker}>
                          {t.speaker === 'interviewer' ? 'Marlowe' : 'You'}
                          {t.isHint ? <span className={styles.replayHintTag}>hint</span> : null}
                        </span>
                        <span className={styles.replayContent}>{t.content}</span>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
