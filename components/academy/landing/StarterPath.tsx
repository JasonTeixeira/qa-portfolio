'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Lead magnet: "The free AI-Engineering Starter Path." The lessons are already
 * public (reciprocity — value first, no wall), so the path shows immediately;
 * the email exchange is for the *guided* version — a paced sequence + build
 * notes delivered over a week. Foot-in-the-door into the nurture funnel.
 */

const INK = '#F2EFE9'
const LINE = '#1E1E24'
const ACCENT = '#3D5AFE'
const GREEN = '#18B663'

const mono = { fontFamily: 'var(--font-mono), monospace' } as const
const serif = { fontFamily: 'var(--font-serif), Georgia, serif' } as const

type Step = { n: string; kind: string; title: string; time: string; href: string }

const PATH: Step[] = [
  { n: '01', kind: 'do', title: 'Your first program', time: '15 min', href: '/academy/concepts/your-first-program' },
  { n: '02', kind: 'do', title: 'Variables: names for values', time: '15 min', href: '/academy/concepts/variables-names-for-values' },
  { n: '03', kind: 'do', title: 'Booleans & decisions: make the program choose', time: '20 min', href: '/academy/concepts/booleans-and-decisions-make-the-program-choose' },
  { n: '04', kind: 'do', title: 'Loops: do something for every item', time: '20 min', href: '/academy/concepts/loops-do-something-for-every-item' },
  { n: '05', kind: 'do', title: 'Functions: name and reuse a block of code', time: '20 min', href: '/academy/concepts/functions-name-and-reuse-a-block-of-code' },
  { n: '06', kind: 'watch', title: 'How modern AI actually works — RAG, evals, agents', time: '3 min', href: '/academy#watch' },
  { n: '07', kind: 'next', title: 'Pick your track and keep building', time: '—', href: '/academy/catalog' },
]

export function StarterPath() {
  const [email, setEmail] = useState('')
  const [honey, setHoney] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'loading') return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, honey, source: 'academy-starter-path' }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(48px, 7vw, 88px) clamp(20px, 4vw, 40px) 96px', color: INK, fontFamily: 'var(--font-sans), sans-serif' }}>
      <div style={{ ...mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8FA0FF' }}>Free · no subscription</div>
      <h1 style={{ ...serif, margin: '14px 0 0', fontWeight: 600, fontSize: 'clamp(34px, 5vw, 60px)', lineHeight: 1.02, letterSpacing: '-0.03em', maxWidth: '18ch', textWrap: 'balance' }}>
        The AI-Engineering <em style={{ fontStyle: 'italic', color: '#8FA0FF' }}>Starter Path.</em>
      </h1>
      <p style={{ margin: '20px 0 0', color: '#9C9CA6', fontSize: 17.5, lineHeight: 1.6, maxWidth: '56ch' }}>
        Seven steps from “I use AI” to “I can build with it” — real lessons you run in the browser, in the right order.
        Free to start right now. Want it paced, with my build notes? Drop your email and I&apos;ll send the guided version.
      </p>

      {/* Email capture */}
      <form onSubmit={submit} style={{ margin: '32px 0 8px', display: 'flex', flexWrap: 'wrap', gap: 10, maxWidth: 520 }}>
        <input type="text" name="company" value={honey} onChange={(e) => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
        {state === 'done' ? (
          <div style={{ ...mono, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: GREEN, border: `1px solid rgba(24,182,99,0.4)`, borderRadius: 12, padding: '14px 18px', background: 'rgba(24,182,99,0.06)', width: '100%' }}>
            ✓ You&apos;re in — the guided path is on its way. Meanwhile, start with step 01 below.
          </div>
        ) : (
          <>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email for the guided starter path"
              style={{ flex: '1 1 240px', minWidth: 0, background: '#111115', border: `1px solid ${LINE}`, borderRadius: 12, padding: '14px 16px', color: INK, fontSize: 15, outline: 'none' }}
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: state === 'loading' ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {state === 'loading' ? 'Sending…' : 'Send me the path'}
            </button>
          </>
        )}
      </form>
      <div style={{ ...mono, fontSize: 10.5, color: '#5A5A64' }}>
        {state === 'error' ? 'Something hiccuped — try again in a moment.' : 'No spam. Unsubscribe in one click. The lessons below are free either way.'}
      </div>

      {/* The path */}
      <div style={{ marginTop: 48, borderTop: `1px solid ${LINE}` }}>
        {PATH.map((s) => {
          const kindColor = s.kind === 'watch' ? '#8FA0FF' : s.kind === 'next' ? GREEN : '#9598A2'
          return (
            <Link
              key={s.n}
              href={s.href}
              style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 20, padding: '20px 4px', borderBottom: `1px solid ${LINE}`, textDecoration: 'none', color: 'inherit' }}
            >
              <span style={{ ...mono, fontSize: 13, color: kindColor }}>{s.n}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ ...mono, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: kindColor }}>{s.kind}</span>
                <span style={{ ...serif, display: 'block', fontSize: 'clamp(17px, 2vw, 21px)', fontWeight: 500, color: INK, marginTop: 3 }}>{s.title}</span>
              </span>
              <span style={{ ...mono, fontSize: 11, color: '#5A5A64', whiteSpace: 'nowrap' }}>{s.time} →</span>
            </Link>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginTop: 40 }}>
        <Link href="/academy/pricing" style={{ ...mono, fontSize: 12, color: '#8FA0FF', textDecoration: 'none' }}>when you&apos;re ready for the full academy →</Link>
      </div>
    </main>
  )
}
