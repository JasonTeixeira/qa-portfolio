'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/events'

type Props = {
  source?: string
  variant?: 'inline' | 'card'
  headline?: string
  blurb?: string
}

export function NewsletterSignup({
  source = 'lab',
  variant = 'card',
  headline = 'Sage Ideas, in your inbox.',
  blurb = 'One short note per week — what we shipped, what worked, what we got wrong. No drip campaigns.',
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/lab/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setStatus('error')
        setErrorMsg(
          data?.error === 'invalid_email'
            ? 'That email looks invalid.'
            : 'Could not subscribe right now. Try again in a minute.',
        )
        return
      }
      setStatus('success')
      setEmail('')
      trackEvent('newsletter_signup', { source })
    } catch {
      setStatus('error')
      setErrorMsg('Could not subscribe right now. Try again in a minute.')
    }
  }

  const containerClass =
    variant === 'card'
      ? 'rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] p-6 sm:p-8'
      : ''

  return (
    <div className={containerClass}>
      {variant === 'card' && (
        <>
          <h3 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">{headline}</h3>
          <p className="mt-2 text-[var(--sage-ink-muted)] leading-relaxed">{blurb}</p>
        </>
      )}
      {variant === 'inline' && (headline || blurb) && (
        <div className="mb-4">
          {headline ? <h3 className="text-lg font-bold text-[var(--sage-ink)]">{headline}</h3> : null}
          {blurb ? <p className="mt-1 text-sm leading-relaxed text-[var(--sage-ink-muted)]">{blurb}</p> : null}
        </div>
      )}

      {status === 'success' ? (
        <div className="flex items-center gap-3 rounded-[8px] border border-[var(--sage-brand)]/30 bg-[var(--sage-brand)]/10 px-4 py-3 mt-4 text-sm text-[var(--sage-ink)]">
          <Check className="h-4 w-4 text-[var(--sage-brand)]" />
          You are in. First note hits your inbox soon.
        </div>
      ) : (
        <form onSubmit={onSubmit} className={variant === 'card' ? 'mt-6' : ''}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor={`newsletter-${source}`}>
              Email
            </label>
            <input
              id={`newsletter-${source}`}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 rounded-[8px] border border-[var(--sage-border)] bg-[#09090D] px-4 py-3 text-sm text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] focus:border-[var(--sage-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--sage-brand)]"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--sage-brand)] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[#5670ff] disabled:opacity-50"
            >
              {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
              {status !== 'submitting' && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
          {status === 'error' && errorMsg && (
            <p className="mt-3 text-sm text-red-400">{errorMsg}</p>
          )}
          <p className="mt-3 text-xs text-[var(--sage-ink-faint)]">
            No spam. Unsubscribe in one click. We never share your email.
          </p>
        </form>
      )}
    </div>
  )
}
