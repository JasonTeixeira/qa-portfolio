'use client'

import { useState } from 'react'
import { saveArtifact } from '@/app/academy/interview/_actions'
import type { InterviewTrack } from './types'
import styles from './session.module.css'

type Props = {
  sessionId: string
  track: Exclude<InterviewTrack, 'coding'>
}

/** Non-coding tracks map onto the two non-code artifact kinds. Behavioral STAR notes
 *  and system-design whiteboard notes are both `whiteboard`; negotiation is `negotiation`. */
const KIND: Record<Exclude<InterviewTrack, 'coding'>, 'whiteboard' | 'negotiation'> = {
  system_design: 'whiteboard',
  behavioral: 'whiteboard',
  negotiation: 'negotiation',
}

const COPY: Record<Exclude<InterviewTrack, 'coding'>, { label: string; placeholder: string; scored: string }> = {
  system_design: {
    label: 'Whiteboard · scratch your design',
    placeholder: 'Components, data flow, the failure mode Marlowe is pushing on…',
    scored: 'scored on: problem framing · tradeoff judgment · technical depth',
  },
  behavioral: {
    label: 'STAR scratchpad · situation / task / action / result',
    placeholder: 'S: … T: … A: what did YOU decide? R: the measurable result…',
    scored: 'scored on: communication · composure · tradeoff judgment',
  },
  negotiation: {
    label: 'Your anchors · visible only to you',
    placeholder: 'Walk-away, target, leverage — and every concession you make…',
    scored: 'scored on: anchoring · silence tolerance · concession pattern',
  },
}

/**
 * The honest non-coding workspace — a scratchpad the candidate writes into, saved as a
 * `whiteboard` or `negotiation` artifact the grader can weigh. Deliberately minimal:
 * the coding track is the hero; here the transcript carries most of the signal and the
 * notes are supplementary context, saved on demand.
 */
export function NotesWorkspace({ sessionId, track }: Props) {
  const [notes, setNotes] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const copy = COPY[track]

  const save = async () => {
    if (state === 'saving' || !notes.trim()) return
    setState('saving')
    const res = await saveArtifact({
      sessionId,
      kind: KIND[track],
      payload: { track, notes: notes.trim() },
    })
    setState(res.ok ? 'saved' : 'error')
  }

  return (
    <div className={styles.notesCard}>
      <div className={styles.notesHead}>
        <span className={styles.notesLabel}>{copy.label}</span>
      </div>
      <textarea
        className={styles.notesArea}
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value)
          if (state === 'saved') setState('idle')
        }}
        placeholder={copy.placeholder}
        aria-label="Workspace notes"
      />
      <div className={styles.notesFoot}>
        <span className={styles.notesScored}>{copy.scored}</span>
        {state === 'saved' ? (
          <span className={styles.saved}>✓ saved</span>
        ) : (
          <button
            type="button"
            className={styles.saveNotes}
            onClick={save}
            disabled={state === 'saving' || !notes.trim()}
          >
            {state === 'saving' ? 'Saving…' : state === 'error' ? 'Retry save' : 'Save notes'}
          </button>
        )}
      </div>
    </div>
  )
}
