'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { LessonNote } from '@/lib/academy/notes'
import { saveNote, deleteNote } from '@/app/academy/_actions/notes'
import styles from './notes.module.css'

const MAX = 4000

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

type Props = {
  courseSlug: string
  lessonSlug: string
  signedIn: boolean
  notes: LessonNote[]
}

/**
 * Learner-owned lesson notes. A labeled textarea + a list of the user's notes with
 * per-note delete. Mutations go through the user-scoped server actions (RLS owns
 * the user_id); we refresh the route after each to re-read the server list.
 */
export function NotesPanel({ courseSlug, lessonSlug, signedIn, notes }: Props) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const textareaId = useId()

  const trimmed = body.trim()
  const over = body.length > MAX
  const canSave = trimmed.length > 0 && !over && !pending

  const handleSave = () => {
    if (!canSave) return
    startTransition(async () => {
      const res = await saveNote(courseSlug, lessonSlug, body)
      if (res.ok) {
        setBody('')
        router.refresh()
      }
    })
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      await deleteNote(id, courseSlug, lessonSlug)
      setDeletingId(null)
      router.refresh()
    })
  }

  return (
    <details className={styles.panel}>
      <summary className={styles.summary}>
        <span className={styles.chevron} aria-hidden="true">
          ›
        </span>
        Notes
        <span className={styles.count}>{notes.length}</span>
      </summary>

      <div className={styles.body}>
        {signedIn ? (
          <>
            <div className={styles.form}>
              <label className={styles.label} htmlFor={textareaId}>
                Add a note
              </label>
              <textarea
                id={textareaId}
                className={styles.textarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Capture a takeaway, a question, or a code snippet to revisit…"
                aria-describedby={`${textareaId}-counter`}
              />
              <div className={styles.formFoot}>
                <span
                  id={`${textareaId}-counter`}
                  className={`${styles.counter} ${over ? styles.counterOver : ''}`}
                  aria-live="polite"
                >
                  {body.length} / {MAX}
                </span>
                <button
                  type="button"
                  className={styles.save}
                  onClick={handleSave}
                  disabled={!canSave}
                  aria-busy={pending && deletingId === null}
                >
                  {pending && deletingId === null ? 'Saving…' : 'Save note'}
                </button>
              </div>
            </div>

            {notes.length > 0 ? (
              <ul className={styles.list}>
                {notes.map((note) => (
                  <li key={note.id} className={styles.item}>
                    <p className={styles.noteText}>
                      {note.body}
                      <span className={styles.noteMeta}>{formatDate(note.createdAt)}</span>
                    </p>
                    <button
                      type="button"
                      className={styles.delete}
                      onClick={() => handleDelete(note.id)}
                      disabled={pending}
                      aria-label="Delete note"
                    >
                      {deletingId === note.id ? '…' : 'Delete'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>No notes yet. Anything you save here is private to you.</p>
            )}
          </>
        ) : (
          <p className={styles.signedOut}>
            <a className={styles.signInLink} href="/login?next=/academy">
              Sign in
            </a>{' '}
            to take private notes on this lesson.
          </p>
        )}
      </div>
    </details>
  )
}
