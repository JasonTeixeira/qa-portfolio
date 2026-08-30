'use client'

import { useEffect, useRef, useState } from 'react'
import { AtlasOrb } from './AtlasOrb'
import {
  ATLAS_QUESTIONS,
  recommendPath,
  type AtlasAnswers,
  type AtlasQuestionId,
} from '@/data/academy/atlas'

const C = {
  bg: '#0B0B0E',
  card: '#111115',
  line: '#1E1E24',
  text: '#F2EFE9',
  muted: '#B6B6C0',
  faint: '#6B6B78',
  accent: '#3D5AFE',
  accentInk: '#8FA0FF',
  green: '#18B663',
} as const
const MONO = "var(--font-mono, 'JetBrains Mono', ui-monospace, monospace)"
const SERIF = 'var(--font-serif, Fraunces, Georgia, serif)'

type Phase = 'q' | 'reveal' | 'sent'
type SentKind = 'ok' | 'dev' | 'emailFailed'

/** The Atlas "Find your path" experience. Presentational + self-contained: the
 *  parent (AtlasLauncher) decides when to mount it and handles once-per-visitor. */
export function AtlasIntake({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('q')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AtlasAnswers>({})
  const [typed, setTyped] = useState('')
  const [speaking, setSpeaking] = useState(true)
  const [reduced, setReduced] = useState(false)

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState<SentKind | null>(null)

  const honeyRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setReduced(!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Typewriter for each question — drives the orb's "speaking" state.
  useEffect(() => {
    if (phase !== 'q') return
    const prompt = ATLAS_QUESTIONS[step].prompt
    if (reduced) {
      setTyped(prompt)
      setSpeaking(false)
      return
    }
    setTyped('')
    setSpeaking(true)
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setTyped(prompt.slice(0, i))
      if (i >= prompt.length) {
        window.clearInterval(id)
        setSpeaking(false)
      }
    }, 26)
    return () => window.clearInterval(id)
  }, [phase, step, reduced])

  // A brief "speaking" flash when the path is revealed.
  useEffect(() => {
    if (phase !== 'reveal' || reduced) return
    setSpeaking(true)
    const id = window.setTimeout(() => setSpeaking(false), 1500)
    return () => window.clearTimeout(id)
  }, [phase, reduced])

  const q = ATLAS_QUESTIONS[step]
  const path = recommendPath(answers)

  function choose(qid: AtlasQuestionId, value: string) {
    const next = { ...answers, [qid]: value }
    setAnswers(next)
    if (step < ATLAS_QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      setPhase('reveal')
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Please enter a valid email.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/funnel/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          answers,
          source: 'atlas',
          honey: honeyRef.current?.value ?? '',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'Something went wrong. Try again.')
        return
      }
      setSent(data?.dev ? 'dev' : data?.emailFailed ? 'emailFailed' : 'ok')
      setPhase('sent')
    } catch {
      setError('Network hiccup — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Find your path with Atlas"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'radial-gradient(120% 90% at 50% 30%, rgba(61,90,254,0.12), transparent 60%), rgba(6,6,9,0.86)',
        backdropFilter: 'blur(8px)',
        animation: reduced ? undefined : 'atlasFade 0.4s ease both',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes atlasFade{from{opacity:0}to{opacity:1}}
@keyframes atlasCardIn{from{opacity:0;transform:translateY(14px) scale(0.99)}to{opacity:1;transform:none}}
.atlasChip{transition:transform .18s cubic-bezier(0.16,1,0.3,1),border-color .18s,background .18s}
.atlasChip:hover{transform:translateY(-2px);border-color:#3D5AFE;background:#15161d}
.atlasChip:focus-visible{outline:2px solid #8FA0FF;outline-offset:2px}`,
        }}
      />
      <div
        style={{
          position: 'relative',
          width: 'min(560px, 100%)',
          maxHeight: 'calc(100dvh - 40px)',
          overflowY: 'auto',
          background: C.card,
          border: `1px solid ${C.line}`,
          borderRadius: 20,
          padding: 'clamp(24px, 4vw, 40px)',
          boxShadow: '0 40px 120px -30px rgba(0,0,0,0.9)',
          animation: reduced ? undefined : 'atlasCardIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 30,
            height: 30,
            borderRadius: 8,
            border: `1px solid ${C.line}`,
            background: 'transparent',
            color: C.faint,
            cursor: 'pointer',
            fontSize: 15,
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Atlas identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <AtlasOrb speaking={speaking} size={112} />
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.accentInk }}>
            Atlas · your guide
          </div>
        </div>

        {phase === 'q' && (
          <div style={{ marginTop: 26 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.faint }}>
              {q.eyebrow}
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 'clamp(22px, 3.4vw, 30px)',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: C.text,
                margin: '10px 0 0',
                minHeight: 74,
              }}
            >
              {typed}
              {speaking && !reduced ? <span style={{ color: C.accentInk }}>▍</span> : null}
            </h2>

            <div style={{ display: 'grid', gap: 10, marginTop: 22 }}>
              {q.options.map((o) => (
                <button
                  key={o.value}
                  className="atlasChip"
                  onClick={() => choose(q.id, o.value)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 2,
                    textAlign: 'left',
                    padding: '13px 16px',
                    borderRadius: 12,
                    border: `1px solid ${C.line}`,
                    background: '#0F1014',
                    color: C.text,
                    cursor: 'pointer',
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                  }}
                >
                  {o.label}
                  {o.hint ? <span style={{ fontSize: 12.5, fontWeight: 400, color: C.faint }}>{o.hint}</span> : null}
                </button>
              ))}
            </div>

            {/* progress + back */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {ATLAS_QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: i === step ? 20 : 7,
                      height: 7,
                      borderRadius: 4,
                      background: i <= step ? C.accent : C.line,
                      transition: 'width .3s, background .3s',
                    }}
                  />
                ))}
              </div>
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 13, fontFamily: MONO }}
                >
                  ← back
                </button>
              ) : (
                <button
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 13, fontFamily: MONO }}
                >
                  skip
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'reveal' && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.green }}>
              Your path
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 'clamp(22px, 3.4vw, 30px)',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: C.text,
                margin: '10px 0 12px',
              }}
            >
              {path.headline}
            </h2>
            <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{path.why}</p>

            <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, background: '#0F1014', padding: '16px 18px', margin: '18px 0' }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faint }}>
                Start here
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '5px 0 12px' }}>{path.startTitle}</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {path.steps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
                    <span style={{ fontFamily: MONO, color: C.accentInk }}>0{i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, marginTop: 12 }}>{path.cadence}</div>
            </div>

            {/* email = the reward, not a wall */}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 13.5, color: C.text, fontWeight: 600 }}>
                Save your path — and I&rsquo;ll send your first lesson.
              </label>
              <input
                aria-hidden
                ref={honeyRef}
                tabIndex={-1}
                autoComplete="off"
                name="company"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@work.com"
                  style={{
                    flex: '1 1 200px',
                    padding: '13px 15px',
                    borderRadius: 11,
                    border: `1px solid ${error ? '#E0564E' : C.line}`,
                    background: '#0B0B0E',
                    color: C.text,
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '13px 22px',
                    borderRadius: 11,
                    border: 'none',
                    background: C.accent,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14.5,
                    cursor: submitting ? 'default' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {submitting ? 'Saving…' : 'Save my path'}
                </button>
              </div>
              {error ? <div style={{ color: '#E0776E', fontSize: 12.5 }}>{error}</div> : null}
              <a
                href={path.startHref}
                style={{ fontFamily: MONO, fontSize: 12.5, color: C.faint, textDecoration: 'none' }}
              >
                or just start free now, no email →
              </a>
            </form>
          </div>
        )}

        {phase === 'sent' && (
          <div style={{ marginTop: 26, textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 'clamp(22px, 3.4vw, 30px)',
                lineHeight: 1.2,
                color: C.text,
                margin: '0 0 12px',
              }}
            >
              {sent === 'ok' ? 'Your path is on its way.' : 'Path saved.'}
            </h2>
            <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.65, margin: '0 auto', maxWidth: '38ch' }}>
              {sent === 'ok' && 'Check your inbox — your first lesson and next steps are waiting. Or start right now:'}
              {sent === 'dev' && 'Saved locally (email isn’t wired up in this environment yet). You can start right now:'}
              {sent === 'emailFailed' &&
                'You’re on the list — the confirmation email didn’t go through, but your path is saved. Start right now:'}
            </p>
            <a
              href={path.startHref}
              style={{
                display: 'inline-block',
                marginTop: 20,
                padding: '13px 26px',
                borderRadius: 26,
                background: C.accent,
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Start free — no card
            </a>
            <div style={{ marginTop: 14 }}>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 13, fontFamily: MONO }}
              >
                close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
