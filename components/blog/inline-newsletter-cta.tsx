'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

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
        setMessage(data?.error || 'Something went wrong. Try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Try again.')
    }
  }

  return (
    <aside className="my-12 rounded-2xl border border-[#06B6D4]/40 bg-gradient-to-br from-[#06B6D4]/[0.05] via-[#0F0F12] to-[#8B5CF6]/[0.05] p-6 sm:p-8">
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#06B6D4] mb-2">
        Field notes from the keyboard
      </div>
      <h3 className="text-2xl font-bold text-[#FAFAFA]">Get more like this.</h3>
      <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
        Production engineering, AI systems, and architecture writing — once or twice a month, no fluff.
      </p>
      {status === 'success' ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-[#10B981]">
          <CheckCircle2 className="w-4 h-4" />
          {message}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 px-4 py-2.5 bg-[#09090B] border border-[#27272A] rounded-lg text-[#FAFAFA] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#06B6D4]/60 focus:ring-1 focus:ring-[#06B6D4]/30 transition-colors"
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] disabled:opacity-60 disabled:cursor-not-allowed text-[#09090B] text-sm font-semibold transition-colors"
          >
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
      {status === 'error' && message && (
        <p className="mt-3 text-xs text-[#F87171]">{message}</p>
      )}
    </aside>
  )
}
