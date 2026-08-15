'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  saveScheduleSlot,
  updateScheduleSlot,
  deleteScheduleSlot,
  seedTaperFromProfile,
} from '@/app/academy/interview/_actions-plan'
import styles from './schedule.module.css'

/** A real interview_schedule row, serialized for the client. */
export type ScheduleSlot = {
  id: string
  slotDate: string
  slotTime: string | null
  track: string | null
  sessionType: string | null
  what: string | null
  estMinutes: number | null
  status: string
}

type Props = {
  slots: readonly ScheduleSlot[]
  /** A real target_date exists on the profile — enables the "generate my taper" seed action. */
  hasTargetDate: boolean
}

const SESSION_TYPES = [
  { value: 'hard_rep', label: 'hard rep', tag: 'tagHardRep' },
  { value: 'dress_rehearsal', label: 'dress rehearsal', tag: 'tagDress' },
  { value: 'light', label: 'light', tag: 'tagLight' },
  { value: 'taper', label: 'taper', tag: 'tagTaper' },
  { value: 'go_time', label: 'go time', tag: 'tagGoTime' },
] as const

const TRACKS = ['coding', 'system_design', 'behavioral', 'negotiation'] as const

const SESSION_META = new Map<string, (typeof SESSION_TYPES)[number]>(
  SESSION_TYPES.map((s) => [s.value, s]),
)

const REASONS: Record<string, string> = {
  unauthorized: 'Please sign in to edit your plan.',
  invalid_slot_date: 'Pick a valid date.',
  invalid_session_type: 'Pick a session type.',
  insert_failed: 'Could not save the slot — try again.',
  update_failed: 'Could not update the slot — try again.',
  delete_failed: 'Could not remove the slot — try again.',
  server_error: 'Something went wrong — try again.',
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Weekday + a "today" marker for an ISO date, computed UTC-noon-safe from the date parts. */
function dayLabel(iso: string): { name: string; date: string; isToday: boolean } {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const name = WEEKDAY[dt.getUTCDay()] ?? ''
  const date = dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' })
  return { name, date, isToday: iso === todayIso() }
}

function tagClass(sessionType: string | null): string {
  const meta = sessionType ? SESSION_META.get(sessionType) : null
  return meta ? styles[meta.tag] : styles.tagTaper
}

function tagLabel(sessionType: string | null): string {
  const meta = sessionType ? SESSION_META.get(sessionType) : null
  return meta?.label ?? 'session'
}

const HOT_TYPES = new Set(['go_time', 'dress_rehearsal'])

/**
 * The taper week grid — the real interview_schedule slots, styled by session_type, with honest
 * add / mark-done / delete wired to the spine's own-row actions. Slots are NEVER invented on the
 * client: every row shown here came from a server read, and after any mutation we router.refresh()
 * so the re-render reflects the actual persisted rows. When no slots exist yet and a target date is
 * set, the one action is seedTaperFromProfile() — pure date math, no fabricated slots.
 */
export function ScheduleTaper({ slots, hasTargetDate }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  function run(fn: () => Promise<{ ok: boolean; reason?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await fn()
      if (result.ok) {
        router.refresh()
        return
      }
      setError(REASONS[result.reason ?? ''] ?? 'Could not save — try again.')
    })
  }

  function handleSeed() {
    run(() => seedTaperFromProfile())
  }

  function handleDelete(id: string) {
    run(() => deleteScheduleSlot(id))
  }

  function handleToggleDone(slot: ScheduleSlot) {
    const next = slot.status === 'done' ? 'planned' : 'done'
    run(() => updateScheduleSlot(slot.id, { status: next }))
  }

  function handleAdd(formData: FormData) {
    const slotDate = String(formData.get('slot_date') ?? '')
    const sessionType = String(formData.get('session_type') ?? '')
    const slotTime = String(formData.get('slot_time') ?? '').trim()
    const what = String(formData.get('what') ?? '').trim()
    const track = String(formData.get('track') ?? '')
    const estRaw = String(formData.get('est_minutes') ?? '').trim()
    setError(null)
    startTransition(async () => {
      const result = await saveScheduleSlot({
        slot_date: slotDate,
        session_type: sessionType,
        slot_time: slotTime || undefined,
        what: what || undefined,
        track: track || undefined,
        est_minutes: estRaw ? Number(estRaw) : undefined,
      })
      if (result.ok) {
        setShowAdd(false)
        router.refresh()
        return
      }
      setError(REASONS[result.reason] ?? 'Could not save the slot — try again.')
    })
  }

  // No slots yet — offer the honest seed action (only when a real target date exists).
  if (slots.length === 0) {
    return (
      <div className={styles.seedBox}>
        <h2 className={styles.seedTitle}>
          {hasTargetDate ? 'Your taper isn’t built yet.' : 'No plan yet — and no date to build one from.'}
        </h2>
        <p className={styles.seedBody}>
          {hasTargetDate
            ? 'Generate a taper working backward from your interview date — hard reps early, a light rep, then rest before go-time. You can edit or add slots after.'
            : 'Set a target date in onboarding first. The taper is pure date math built backward from the day you’re aiming at — without a date there’s nothing to count down to.'}
        </p>
        {hasTargetDate ? (
          <div className={styles.seedActions}>
            <button type="button" className={styles.saveBtn} onClick={handleSeed} disabled={pending}>
              {pending ? 'Generating…' : 'Generate my taper plan'}
            </button>
          </div>
        ) : null}
        {error ? (
          <p className={styles.errorLine} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className={styles.days}>
        {slots.map((slot) => {
          const { name, date, isToday } = dayLabel(slot.slotDate)
          const hot = HOT_TYPES.has(slot.sessionType ?? '') || isToday
          const done = slot.status === 'done'
          const metaBits = [
            slot.estMinutes ? `~${slot.estMinutes} min` : null,
            slot.track ? slot.track.replace('_', ' ') : null,
          ].filter(Boolean)
          return (
            <div key={slot.id} className={styles.dayRow}>
              <div className={styles.dayLabel}>
                <div className={`${styles.dayName} ${isToday ? styles.dayNameHot : ''}`}>
                  {isToday ? `${name} · today` : name}
                </div>
                <div className={styles.dayDate}>{date}</div>
              </div>
              <div className={`${styles.slot} ${hot ? styles.slotHot : ''} ${done ? styles.slotDone : ''}`}>
                <span className={`${styles.slotTime} ${hot ? styles.slotTimeHot : ''}`}>
                  {slot.slotTime || '—'}
                </span>
                <div className={styles.slotBody}>
                  <div className={`${styles.slotWhat} ${done ? styles.slotWhatDone : ''}`}>
                    {slot.what || 'Session'}
                  </div>
                  {metaBits.length > 0 ? <div className={styles.slotMeta}>{metaBits.join(' · ')}</div> : null}
                </div>
                <span className={`${styles.tag} ${tagClass(slot.sessionType)}`}>{tagLabel(slot.sessionType)}</span>
                <div className={styles.slotActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => handleToggleDone(slot)}
                    disabled={pending}
                    aria-label={done ? 'Mark planned' : 'Mark done'}
                  >
                    {done ? 'undo' : 'done'}
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => handleDelete(slot.id)}
                    disabled={pending}
                    aria-label="Delete slot"
                  >
                    del
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showAdd ? (
        <form className={styles.addForm} action={handleAdd}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="slot_date">
              Date
            </label>
            <input id="slot_date" name="slot_date" type="date" required className={styles.input} defaultValue={todayIso()} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="slot_time">
              Time
            </label>
            <input id="slot_time" name="slot_time" type="text" placeholder="18:30" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="session_type">
              Type
            </label>
            <select id="session_type" name="session_type" className={styles.select} defaultValue="hard_rep">
              {SESSION_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="track">
              Track
            </label>
            <select id="track" name="track" className={styles.select} defaultValue="">
              <option value="">—</option>
              {TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="est_minutes">
              Minutes
            </label>
            <input id="est_minutes" name="est_minutes" type="number" min="0" placeholder="35" className={styles.input} />
          </div>
          <div className={`${styles.field} ${styles.fieldWide}`}>
            <label className={styles.fieldLabel} htmlFor="what">
              What
            </label>
            <input id="what" name="what" type="text" placeholder="Coding mock · the lying test suite" className={styles.input} />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={pending}>
              {pending ? 'Saving…' : 'Add slot'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowAdd(false)}>
              cancel
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.addBar}>
          <button type="button" className={styles.addToggle} onClick={() => setShowAdd(true)}>
            + add a slot
          </button>
        </div>
      )}

      {error ? (
        <p className={styles.errorLine} role="alert">
          {error}
        </p>
      ) : null}
    </>
  )
}
