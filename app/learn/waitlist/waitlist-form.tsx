'use client'

import { useState, type FormEvent } from 'react'
import { trackEvent } from '@/lib/analytics/events'
import styles from './waitlist.module.css'

const SHARE_URL = 'https://www.sageideas.dev/learn/waitlist'
const SHARE_TEXT =
  'Sage Academy is coming — project-based courses + labs to learn code & AI, $20/mo. Founding spots are open:'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function WaitlistForm({ id }: { id?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/lab/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'academy_waitlist' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setStatus('error')
        setErrorMsg(
          data?.error === 'invalid_email'
            ? 'That email looks invalid — check it and try again.'
            : 'Could not join right now. Try again in a minute.',
        )
        return
      }
      setStatus('success')
      trackEvent('newsletter_signup', { source: 'academy_waitlist' })
    } catch {
      setStatus('error')
      setErrorMsg('Could not join right now. Try again in a minute.')
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(SHARE_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — the X share still works as a fallback.
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <div className={styles.successCheck} aria-hidden="true">✓</div>
        <h2>You’re on the founding list.</h2>
        <p>
          Watch your inbox — you’ll be first through the door when the academy opens, with founding
          pricing locked in. Want to bump a friend up the list?
        </p>
        <div className={styles.share}>
          <a
            className={styles.shareBtn}
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('cta_click', { location: 'waitlist_success', label: 'share_x' } as never)}
          >
            Share on X
          </a>
          <button type="button" className={styles.shareBtn} onClick={copyLink}>
            {copied ? 'Link copied ✓' : 'Copy link'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <form className={styles.form} onSubmit={onSubmit}>
        <input
          id={id}
          className={styles.input}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          disabled={status === 'submitting'}
        />
        <button type="submit" className={styles.submit} disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Joining…' : 'Join the waitlist'}
        </button>
      </form>
      <p className={styles.microcopy}>
        <b>Founding members lock in $20/mo forever.</b> No spam, one click to leave.
      </p>
      {status === 'error' && <p className={styles.error}>{errorMsg}</p>}
    </>
  )
}
