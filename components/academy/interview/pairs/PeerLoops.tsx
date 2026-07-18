'use client'

import { useState, useTransition } from 'react'
import { requestPeerMatch } from '@/app/academy/interview/_actions-network'
import styles from './pairs.module.css'

/** One of the caller's OWN peer-match requests (never someone else's data). */
export type PeerMatchView = {
  id: string
  status: 'requested' | 'matched' | 'scheduled' | 'completed'
  track: string | null
  note: string | null
  slotText: string | null
  createdLabel: string
}

type Props = {
  initialRequests: readonly PeerMatchView[]
}

const TRACKS: readonly { value: string; label: string }[] = [
  { value: '', label: 'Any track' },
  { value: 'coding', label: 'Coding' },
  { value: 'system_design', label: 'System design' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'negotiation', label: 'Negotiation' },
]

const TRACK_LABELS: Record<string, string> = {
  coding: 'Coding',
  system_design: 'System design',
  behavioral: 'Behavioral',
  negotiation: 'Negotiation',
}

const STATUS_LABELS: Record<PeerMatchView['status'], string> = {
  requested: 'Requested',
  matched: 'Matched',
  scheduled: 'Scheduled',
  completed: 'Completed',
}

const STATUS_CLASSES: Record<PeerMatchView['status'], string> = {
  requested: styles.chipRequested,
  matched: styles.chipMatched,
  scheduled: styles.chipScheduled,
  completed: styles.chipCompleted,
}

const REASONS: Record<string, string> = {
  unauthorized: 'Sign in to request a peer loop.',
  invalid_track: 'Pick a valid track.',
  insert_failed: 'Could not post your request — try again.',
  server_error: 'Something went wrong — try again.',
}

function trackLabel(track: string | null): string {
  if (!track) return 'Any track'
  return TRACK_LABELS[track] ?? track
}

/**
 * Async peer loops — a REQUEST surface, not a live room (Spec §7). The form posts an own-row
 * interview_peer_matches request (status 'requested', peer_user_id null); there is no presence, no
 * A/V, and no fabricated matched stranger. The list shows only the caller's OWN requests and their
 * real status. Copy is explicit that matching is opt-in and asynchronous — we never imply a
 * real-time match exists.
 */
export function PeerLoops({ initialRequests }: Props) {
  const [requests, setRequests] = useState<readonly PeerMatchView[]>(initialRequests)
  const [track, setTrack] = useState('')
  const [note, setNote] = useState('')
  const [slot, setSlot] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [okId, setOkId] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOkId(null)
    startTransition(async () => {
      const result = await requestPeerMatch({
        track: track || undefined,
        note: note.trim() || undefined,
        slot_text: slot.trim() || undefined,
      })
      if (result.ok) {
        const created: PeerMatchView = {
          id: result.id,
          status: 'requested',
          track: track || null,
          note: note.trim() || null,
          slotText: slot.trim() || null,
          createdLabel: 'Just now',
        }
        setRequests((prev) => [created, ...prev])
        setNote('')
        setSlot('')
        setTrack('')
        setOkId(result.id)
        return
      }
      setError(REASONS[result.reason] ?? 'Could not post your request — try again.')
    })
  }

  return (
    <div className={styles.scope}>
      <div className={styles.head}>
        <div className={styles.headKicker}>Async peer loops · humans, on your own clock</div>
        <h1 className={styles.headTitle}>Trade a mock with another member.</h1>
        <p className={styles.headLine}>
          Marlowe trains your answers; sitting in the interviewer&rsquo;s chair trains something else — you
          learn what weak answers look like from the other side. Peer loops are <b>asynchronous</b>: you post a
          request, and when another member opts in to trade, you exchange recordings and feedback. No live call,
          no presence, no stranger waiting in a room.
        </p>
        <span className={styles.asyncTag}>
          <span className={styles.asyncDot} aria-hidden />
          async · no live room
        </span>
      </div>

      <div className={styles.grid}>
        {/* LEFT — request + your requests */}
        <div className={styles.stackGap}>
          <div className={`${styles.card} ${styles.cardGold}`}>
            <div className={`${styles.cardKicker} ${styles.cardKickerGold}`}>Request a peer loop</div>
            <form className={styles.form} onSubmit={submit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="peer-track">
                  Track
                </label>
                <select
                  id="peer-track"
                  className={styles.select}
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                >
                  {TRACKS.map((t) => (
                    <option key={t.value || 'any'} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="peer-slot">
                  Availability <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="peer-slot"
                  className={styles.input}
                  type="text"
                  value={slot}
                  maxLength={200}
                  placeholder="e.g. weekday evenings UTC-5"
                  onChange={(e) => setSlot(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="peer-note">
                  Note to your future peer <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="peer-note"
                  className={styles.textarea}
                  value={note}
                  maxLength={2000}
                  placeholder="What you want to practice, what you can offer in the interviewer chair…"
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className={styles.submitRow}>
                <button type="submit" className={styles.submitBtn} disabled={pending} aria-busy={pending}>
                  {pending ? 'Posting…' : 'Post my request'}
                </button>
                {okId ? (
                  <span className={`${styles.feedback} ${styles.feedbackOk}`} role="status">
                    Posted — we&rsquo;ll notify you when a peer opts in.
                  </span>
                ) : null}
                {error ? (
                  <span className={`${styles.feedback} ${styles.feedbackErr}`} role="alert">
                    {error}
                  </span>
                ) : null}
              </div>
              <div className={styles.formNote}>
                Your request is visible to matching only by target level and track — never your name or employer.
              </div>
            </form>
          </div>

          <div className={styles.card}>
            <div className={styles.cardKicker}>Your requests</div>
            {requests.length === 0 ? (
              <p className={styles.emptyRequests}>
                No requests yet. Post one above and it will appear here as <b>Requested</b> until a peer opts in.
              </p>
            ) : (
              <div className={styles.requests}>
                {requests.map((r) => (
                  <div key={r.id} className={styles.request}>
                    <div className={styles.requestBody}>
                      <div className={styles.requestTop}>
                        <span className={styles.requestTrack}>{trackLabel(r.track)}</span>
                        <span className={styles.requestDate}>{r.createdLabel}</span>
                      </div>
                      {r.note ? <div className={styles.requestNote}>{r.note}</div> : null}
                      {r.slotText ? <div className={styles.requestSlot}>{r.slotText}</div> : null}
                    </div>
                    <span className={`${styles.statusChip} ${STATUS_CLASSES[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — how it works + honesty */}
        <div className={styles.stackGap}>
          <div className={styles.card}>
            <div className={styles.cardKicker}>How async peer loops work</div>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.stepNum}>1</span>
                <span className={styles.stepText}>You post a request with your track and rough availability.</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>2</span>
                <span className={styles.stepText}>
                  When another member with a compatible target opts in, your request flips to <b>Matched</b>.
                </span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>3</span>
                <span className={styles.stepText}>
                  You each run the prompt on your own clock, in both chairs, and exchange recordings.
                </span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>4</span>
                <span className={styles.stepText}>
                  You trade written feedback — sitting in the interviewer chair is the fastest way to hear your
                  own hand-waving.
                </span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardKicker}>The honest version</div>
            <p className={styles.honesty}>
              This is a <b>request board</b>, not a live room. There is no video, no presence, and no stranger
              waiting on the other end. If no peer opts in yet, your request simply stays <b>Requested</b> — we
              will notify you when someone takes it. We never fabricate a match.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
