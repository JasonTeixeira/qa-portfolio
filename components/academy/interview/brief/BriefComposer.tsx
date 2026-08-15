'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { generateBrief } from '@/app/academy/interview/_actions-network'
import styles from './brief.module.css'

/** Client-side copy for every honest failure reason generateBrief can return. */
const REASONS: Record<string, string> = {
  unauthorized: 'Please sign in to decode a job description.',
  jd_too_short: 'Paste more of the posting — a few lines at minimum.',
  jd_too_long: 'That posting is too long — paste the responsibilities and requirements only.',
  jd_rejected: 'That text was rejected as unsafe input. Paste the plain job description.',
  company_required: 'Add the company name (or set a target company in onboarding).',
  brief_unavailable: 'The decoder is unavailable right now — try again later.',
  no_scenarios: 'No practice scenarios are published yet, so a tuned queue cannot be built.',
  brief_failed: 'Could not decode that posting — try again.',
  insert_failed: 'Could not save the brief — try again.',
  server_error: 'Something went wrong — try again.',
}

/** generateBrief refuses a JD under this length; mirror it for a live client hint. */
const MIN_JD_CHARS = 40

/**
 * The "decode a job description" form. Submitting calls the generateBrief server action
 * (grounded ONLY in the pasted JD text + the member's own history) and, on success, routes
 * to the new brief. The JD is PASTED TEXT — there is no file upload. On failure it shows the
 * real reason and never navigates — no fabricated brief id.
 */
export function BriefComposer() {
  const router = useRouter()
  const [jdText, setJdText] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const trimmedLen = jdText.trim().length
  const tooShort = trimmedLen < MIN_JD_CHARS

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (tooShort || pending) return
    setError(null)
    startTransition(async () => {
      const result = await generateBrief({
        jdText,
        company: company.trim() || undefined,
        role: role.trim() || undefined,
      })
      if (result.ok) {
        router.push(`/academy/interview/brief/${result.briefId}`)
        return
      }
      setError(REASONS[result.reason] ?? 'Could not decode that posting — try again.')
    })
  }

  const hint = tooShort
    ? `${trimmedLen}/${MIN_JD_CHARS} characters minimum`
    : `${trimmedLen.toLocaleString()} characters`

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="brief-jd">
          Job description
        </label>
        <textarea
          id="brief-jd"
          className={styles.textarea}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here — responsibilities, requirements, the whole posting."
          disabled={pending}
          spellCheck={false}
        />
      </div>

      <div className={styles.inputRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="brief-company">
            Company (optional)
          </label>
          <input
            id="brief-company"
            className={styles.input}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Meridian Labs"
            disabled={pending}
            autoComplete="organization"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="brief-role">
            Role (optional)
          </label>
          <input
            id="brief-role"
            className={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior SWE, Payments"
            disabled={pending}
          />
        </div>
      </div>

      {error ? (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.formFoot}>
        <span className={styles.charHint}>{hint}</span>
        <button type="submit" className={styles.submit} disabled={tooShort || pending}>
          {pending ? 'Decoding…' : 'Decode this JD →'}
        </button>
      </div>
    </form>
  )
}
