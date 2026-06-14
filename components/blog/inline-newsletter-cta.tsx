'use client'

import { useState } from 'react'
import { MonoLabel, Hairline } from '@/components/el'

export function InlineNewsletterCTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setMessage(null)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog-inline' }),
      })
      if (res.ok) {
        setStatus('success')
        setMessage('Check your inbox to confirm.')
        setEmail('')
      } else {
        const data = await res.json().catch(() => ({}))
        setStatus('error')
        setMessage((data as { error?: string })?.error || 'Something went wrong. Try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Try again.')
    }
  }

  return (
    <aside
      className="my-12 border border-[var(--sage-border)] rounded-[3px] bg-[var(--sage-surface-1)] p-6 sm:p-8"
      aria-label="Newsletter subscription"
    >
      <div className="flex items-center gap-4 mb-6">
        <MonoLabel tone="accent">{'// field notes'}</MonoLabel>
        <Hairline className="flex-1" />
      </div>
      <p
        className="text-[var(--sage-ink)] font-normal text-[1.25rem] mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
          letterSpacing: '-0.018em',
          lineHeight: 1.2,
        }}
      >
        Get more like this.
      </p>
      <p className="text-[14px] leading-[1.7] text-[var(--sage-ink-muted)] mb-6 max-w-[52ch]">
        Production engineering, AI systems, and architecture writing — once or twice
        a month, no fluff.
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-2 text-[13px] font-mono text-[#0ED3CF]">
          <span aria-hidden>✓</span>
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 h-10 px-4 rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-bg)] text-[13px] text-[var(--sage-ink-muted)] placeholder:text-[var(--sage-ink-faint)] focus:outline-none focus:border-[#0ED3CF]/50 transition-colors [font-family:var(--font-mono),ui-monospace,monospace]"
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="h-10 inline-flex items-center justify-center gap-2 px-5 rounded-[2px] bg-[#0ED3CF] text-[#08110F] text-[12px] font-medium uppercase tracking-[0.08em] [font-family:var(--font-mono),ui-monospace,monospace] hover:bg-[#33EBE8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'loading' ? 'Subscribing…' : 'Subscribe →'}
          </button>
        </form>
      )}

      {status === 'error' && message && (
        <p className="mt-3 text-[12px] font-mono text-red-400">{message}</p>
      )}
    </aside>
  )
}
