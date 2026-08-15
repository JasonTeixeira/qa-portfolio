'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gradeSession } from '@/app/academy/interview/_actions'
import { barForLevel } from '@/lib/academy/interview/rubric'
import { CodingWorkspace } from './CodingWorkspace'
import { NotesWorkspace } from './NotesWorkspace'
import { TranscriptStream } from './TranscriptStream'
import type { InitialTurn, ScenarioData, SessionData } from './types'
import styles from './session.module.css'

type Props = {
  session: SessionData
  scenario: ScenarioData
  initialTurns: InitialTurn[]
}

const TRACK_LABEL: Record<SessionData['track'], string> = {
  coding: 'Coding',
  system_design: 'System design',
  behavioral: 'Behavioral',
  negotiation: 'Negotiation',
}

/** mm:ss from whole seconds. */
function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/**
 * The live mock room orchestrator — the session bar (REC + clock + End & debrief) over
 * the transcript-left / workspace-right split. Marlowe streams on the left; the workspace
 * on the right is the coding editor (hero) or a notes scratchpad for the other tracks.
 * "End & debrief" grades the finished session and routes to the committee verdict.
 */
export function MockSessionRunner({ session, scenario, initialTurns }: Props) {
  const router = useRouter()
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.round((Date.now() - session.startedAtMs) / 1000)),
  )
  const [grading, startGrading] = useTransition()
  const [gradeError, setGradeError] = useState<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(Math.max(0, Math.round((Date.now() - session.startedAtMs) / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [session.startedAtMs])

  const bar = barForLevel(session.level)
  const trackLabel = TRACK_LABEL[session.track]
  const modeLabel = session.mode === 'voice' ? 'Voice' : 'Typed'

  const endAndDebrief = () => {
    if (grading) return
    setGradeError(null)
    startGrading(async () => {
      const res = await gradeSession(session.id)
      if (res.ok || (!res.ok && res.reason === 'already_graded')) {
        router.push(`/academy/interview/verdict/${session.id}`)
        return
      }
      const reasons: Record<string, string> = {
        empty_transcript: 'There is no transcript to grade yet — answer at least one question first.',
        grader_unavailable: 'The grader is warming up — try again in a moment.',
        grade_failed: 'The grade could not be completed — try again in a moment.',
        forbidden: 'This session is not yours.',
      }
      setGradeError(reasons[res.reason] ?? 'Could not grade this session — try again in a moment.')
    })
  }

  return (
    <div className={styles.root}>
      <header className={styles.sessionBar}>
        <div className={styles.sessionBarInner}>
          <Link href="/academy/interview" className={styles.exit}>
            <span className={styles.exitMark} aria-hidden>
              ◆
            </span>
            <span className={styles.exitLabel}>← exit mock room</span>
          </Link>
          <span className={styles.recPill}>
            <span className={styles.recDot} aria-hidden /> REC · {modeLabel} · {session.level} bar
          </span>
          <span className={styles.ccPill} title="Live captions are always on — the transcript is a first-class citizen.">
            CC always on
          </span>
          <div className={styles.barRight}>
            <span className={styles.clock} aria-label="Elapsed time">
              {mmss(seconds)}
            </span>
            <span className={styles.phaseTag}>track: {session.track}</span>
            {gradeError ? <span className={styles.endErr}>{gradeError}</span> : null}
            <button type="button" className={styles.endBtn} onClick={endAndDebrief} disabled={grading}>
              {grading ? 'Grading…' : 'End & debrief'}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.split}>
        <TranscriptStream
          sessionId={session.id}
          startedAtMs={session.startedAtMs}
          initialTurns={initialTurns}
          styleLabel={session.interviewerStyle}
        />

        <div className={styles.right}>
          <div className={styles.questionCard}>
            <div className={styles.questionMeta}>
              <span className={styles.questionKicker}>{trackLabel} · {session.level}</span>
              <span className={styles.questionTune}>calibrated to the {session.level} bar</span>
            </div>
            <div className={styles.questionTitle}>
              {session.questionTitle ?? 'Your placement question'}
            </div>
            {session.questionBody ? <p className={styles.questionBody}>{session.questionBody}</p> : null}
          </div>

          {session.track === 'coding' ? (
            <CodingWorkspace
              sessionId={session.id}
              seedCode={scenario?.seedCode ?? null}
              seedTests={scenario?.seedTests ?? []}
            />
          ) : (
            <NotesWorkspace sessionId={session.id} track={session.track} />
          )}

          <div className={styles.signals} aria-label="Session facts">
            {[
              { label: 'Elapsed', value: mmss(seconds) },
              { label: 'Level bar', value: String(bar) },
              { label: 'Track', value: trackLabel },
              { label: 'Mode', value: modeLabel },
              { label: 'Style', value: session.interviewerStyle },
            ].map((s) => (
              <div key={s.label} className={styles.signal}>
                <div className={styles.signalValue}>{s.value}</div>
                <div className={styles.signalLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
