'use client'

/**
 * Sprout — the site chat dock, implemented 1:1 from <sage-chat> in
 * "Sage Academy Download/sage-widgets.js" (FAB, panel geometry, styles,
 * greeting, chips, scripted replies, 550ms typing beat, human fallback).
 *
 * Honesty deltas vs the widget: the pricing reply quotes the real Stripe
 * plans ($25/mo · $250/yr); the language reply is
 * trimmed to what the site ships today. Unanswered questions emit a
 * `chat_unanswered` analytics event so real gaps feed the FAQ.
 */

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'

type Msg = { who: 'bot' | 'me'; text: string }

const REPLIES: [RegExp, string][] = [
  [/start|begin|first|which course|donde|empez|开始|शुरू/i, 'Start with Engineering Judgment (Course 00). It’s the loop every other course runs on — and in about 25 minutes you’ll ship your first artifact. No prerequisites.'],
  [/proof|prove|artifact|certificat|prueba|证明|प्रमाण/i, 'A proof is a check a skeptic can run — a passing eval, a decision memo, a repaired case. Every course ends in one, and they stack into a ledger you can share with anyone.'],
  [/pric|cost|\$|pay|precio|价格|मूल्य|tarif/i, 'One membership: $25/month or $250/year, every course as it ships — labs, proofs, recall, leagues, certificates. Every plan starts with a 7-day free trial, cancel anytime.'],
  [/refund|guarantee|cancel|garant/i, 'No lock-in: cancel anytime and you keep access through the end of the period you paid for. Your ledger and certificates stay yours. Start with a 7-day free trial, and you can read a full lesson free before you pay.'],
  [/interview|mock|behavioral|system design round/i, 'Interview Mastery is the add-on: unlimited voice-first mocks scored against a consistent bar, +$39/mo ($24/mo annual) on top of membership. The /interview page has the full picture.'],
  [/human|person|contact|email|talk|support|help/i, 'A real person reads everything at hello@sageideas.dev — usually same-day. For account things, that’s the fastest path.'],
  [/^(hi|hey|hello|hola|olá|salut|你好|नमस्ते)\b/i, 'Hey! Happy you’re here. What can I help you figure out — courses, proofs, or pricing?'],
  [/hard|difficult|beginner|new to|junior/i, 'It meets you where you are — the pretest in each lesson calibrates, and the starter labs fail on purpose so the first win is guaranteed. Plenty of career-switchers here.'],
  [/time|hours|week|long/i, 'Most people do one lesson (~30 min) a few times a week, plus a 6-minute recall queue. A course is a 4–6 week sprint at that pace.'],
]
const FALLBACK =
  'Good question — I don’t want to guess at that one. Send it to hello@sageideas.dev and a human will answer today. Meanwhile: courses, proofs, or pricing — I know those cold.'
const GREETING =
  'Hey — I’m Sprout. Questions about courses, proofs, or where to start? Ask away. A human reads everything too.'
const CHIPS = ['Where do I start?', 'What’s a proof?', 'How does pricing work?']

const mono = { fontFamily: 'var(--font-mono), monospace' } as const

export function SageChat() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const msgsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    msgsRef.current?.scrollTo({ top: msgsRef.current.scrollHeight })
  }, [msgs])

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && msgs.length === 0) {
      setMsgs([{ who: 'bot', text: GREETING }])
      try {
        posthog.capture('chat_opened', { page: window.location.pathname })
      } catch {}
    }
  }

  function send(q: string) {
    const text = q.trim()
    if (!text) return
    setInput('')
    setMsgs((m) => [...m, { who: 'me', text }, { who: 'bot', text: '…' }])
    const hit = REPLIES.find(([re]) => re.test(text))
    try {
      posthog.capture(hit ? 'chat_message' : 'chat_unanswered', { question: text, page: window.location.pathname })
    } catch {}
    setTimeout(() => {
      setMsgs((m) => {
        const copy = [...m]
        copy[copy.length - 1] = { who: 'bot', text: hit ? hit[1] : FALLBACK }
        return copy
      })
    }, 550)
  }

  return (
    <>
      <button
        onClick={toggle}
        aria-label="Chat with Sprout"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: '#3D5AFE',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: 19,
          boxShadow: '0 0 24px rgba(61,90,254,0.4), 0 12px 32px -8px rgba(0,0,0,0.6)',
          zIndex: 95,
          transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        ◆
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Sage helper"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 86,
            width: 'min(330px, calc(100vw - 40px))',
            maxHeight: 'min(480px, calc(100vh - 120px))',
            background: '#141418',
            border: '1px solid #2A2A33',
            borderRadius: 16,
            boxShadow: '0 32px 80px -24px rgba(0,0,0,0.9)',
            zIndex: 95,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'var(--font-sans), sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid #1E1E24' }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: '#3D5AFE', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, flexShrink: 0 }}>◆</span>
            <span>
              <b style={{ fontSize: 13.5, color: '#F2EFE9', fontWeight: 700, display: 'block' }}>Sprout</b>
              <small style={{ ...mono, fontSize: 9, color: '#18B663', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#18B663' }} />
                usually replies in seconds
              </small>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9598A2', fontSize: 16, cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
            >
              ×
            </button>
          </div>
          <div ref={msgsRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 180 }}>
            {msgs.map((m, i) => (
              <div
                key={i}
                style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  alignSelf: m.who === 'me' ? 'flex-end' : 'flex-start',
                  background: m.who === 'me' ? '#3D5AFE' : '#1A1A20',
                  color: m.who === 'me' ? '#fff' : '#D6D6DE',
                  borderRadius: m.who === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                }}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '0 16px 12px' }}>
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                style={{ border: '1px solid #2A2A33', background: 'transparent', borderRadius: 16, padding: '7px 13px', fontSize: 12, color: '#B6B6C0', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid #1E1E24' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send(input)
              }}
              placeholder="Ask me anything…"
              style={{ flex: 1, background: '#0F0F13', border: '1px solid #2A2A33', borderRadius: 10, padding: '10px 13px', fontSize: 13.5, color: '#F2EFE9', fontFamily: 'inherit', outline: 'none', minWidth: 0 }}
            />
            <button
              onClick={() => send(input)}
              style={{ background: '#3D5AFE', color: '#fff', border: 'none', borderRadius: 10, padding: '0 15px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

/**
 * Funnel telemetry for the academy marketing pages: one delegated listener
 * captures every link/button click (`cta_click` with href/text/page) and
 * scroll-depth milestones (25/50/75/100, once per page) — full-funnel
 * visibility with zero per-page wiring.
 */
export function FunnelTelemetry() {
  useEffect(() => {
    const page = window.location.pathname
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a, button')
      if (!el) return
      const href = el.getAttribute('href') ?? undefined
      const text = (el.textContent ?? '').trim().slice(0, 80)
      if (!text && !href) return
      try {
        posthog.capture('cta_click', { href, text, page })
      } catch {}
    }
    const fired = new Set<number>()
    const onScroll = () => {
      const doc = document.documentElement
      const depth = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100
      for (const mark of [25, 50, 75, 100]) {
        if (depth >= mark && !fired.has(mark)) {
          fired.add(mark)
          try {
            posthog.capture('scroll_depth', { depth: mark, page })
          } catch {}
        }
      }
    }
    document.addEventListener('click', onClick, { capture: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return null
}
