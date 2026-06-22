'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { trackEvent } from '@/lib/analytics/events'
import styles from './waitlist.module.css'

const BASE_URL = 'https://www.sageideas.dev/learn/waitlist'
const SHARE_TEXT =
  'Sage Academy is coming — project-based courses + labs to learn code & AI, $20/mo. Founding spots are open:'

const TIERS = [
  { n: 1, label: 'Move up the list' },
  { n: 3, label: 'First month free' },
  { n: 10, label: 'Founding price locked for life' },
  { n: 25, label: 'A 1:1 build session with the founder' },
]

type Result = { refCode: string; position: number; referrals: number; total: number }
type Status = 'idle' | 'submitting' | 'success' | 'error'

export function WaitlistForm({ id }: { id?: string }) {
  const [email, setEmail] = useState('')
  const [ref, setRef] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const r = new URLSearchParams(window.location.search).get('ref')
      if (r) setRef(r)
    } catch {
      // No URL access — referral attribution simply won't apply.
    }
  }, [])

  const shareUrl = result ? `${BASE_URL}?ref=${result.refCode}` : BASE_URL

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/academy/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ref }),
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
      setResult({ refCode: data.refCode, position: data.position, referrals: data.referrals, total: data.total })
      setStatus('success')
      trackEvent('newsletter_signup', { source: 'academy_waitlist' })
      try { window.dispatchEvent(new Event('sage:waitlist-signup')) } catch { /* no-op */ }
    } catch {
      setStatus('error')
      setErrorMsg('Could not join right now. Try again in a minute.')
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — the X share still works as a fallback.
    }
  }

  if (status === 'success' && result) {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <div className={styles.successCheck} aria-hidden="true">✓</div>
        <h2>You’re in line.</h2>
        <p className={styles.position}>
          Position <strong>#{result.position.toLocaleString()}</strong>
        </p>
        <p>
          Move up by inviting builders — <strong>every friend who joins with your link jumps you 5 spots.</strong>
        </p>
        <div className={styles.refBox}>
          <span className={styles.refLink}>{shareUrl.replace('https://', '')}</span>
          <button type="button" className={styles.refCopy} onClick={copyLink}>
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
        </div>
        <div className={styles.share}>
          <a
            className={styles.shareBtn}
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('cta_click', { location: 'waitlist_success', label: 'share_x' } as never)}
          >
            Share on X
          </a>
        </div>
        <ul className={styles.tiers}>
          {TIERS.map((t) => (
            <li key={t.n} className={result.referrals >= t.n ? styles.tierDone : undefined}>
              <b>{t.n}</b> {t.label}
              {result.referrals >= t.n ? ' ✓' : ''}
            </li>
          ))}
        </ul>
        {result.referrals > 0 && (
          <p className={styles.refCount}>{result.referrals} referred so far — keep going.</p>
        )}
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
      {status === 'error' && (
        <p className={styles.error} role="alert" aria-live="assertive">
          {errorMsg}
        </p>
      )}
    </>
  )
}
