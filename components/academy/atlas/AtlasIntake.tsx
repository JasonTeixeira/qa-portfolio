'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AtlasOrb } from './AtlasOrb'
import {
  ATLAS_QUESTIONS,
  recommendPath,
  type AtlasAnswers,
  type AtlasQuestionId,
} from '@/data/academy/atlas'

const C = {
  text: '#F3F1EC',
  muted: '#B4B6C2',
  faint: '#7A7C88',
  line: 'rgba(255,255,255,0.08)',
  accent: '#3D5AFE',
  accentInk: '#9AA8FF',
  green: '#3ECF8E',
  danger: '#F0796E',
} as const
const MONO = "var(--font-mono, 'JetBrains Mono', ui-monospace, monospace)"
const SERIF = 'var(--font-serif, Fraunces, Georgia, serif)'

const RAIL_LABELS: Record<AtlasQuestionId, string> = {
  goal: 'Goal',
  level: 'Level',
  time: 'Time',
  field: 'Field',
}

type Phase = 'q' | 'reveal' | 'sent'
type SentKind = 'ok' | 'dev' | 'emailFailed'

/** Atlas "Find your path" — a guided, keyboard-first intake. Presentational +
 *  self-contained; AtlasLauncher owns once-per-visitor + mount timing. */
export function AtlasIntake({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('q')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AtlasAnswers>({})
  const [typed, setTyped] = useState('')
  const [speaking, setSpeaking] = useState(true)
  const [reduced, setReduced] = useState(false)
  const [focusIdx, setFocusIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState<SentKind | null>(null)

  const honeyRef = useRef<HTMLInputElement>(null)
  const optRefs = useRef<Array<HTMLButtonElement | null>>([])
  const emailRef = useRef<HTMLInputElement>(null)

  const q = ATLAS_QUESTIONS[step]
  const path = useMemo(() => recommendPath(answers), [answers])

  useEffect(() => {
    setReduced(!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // Typewriter per question → drives the orb's "speaking" state.
  useEffect(() => {
    if (phase !== 'q') return
    setPicked(null)
    setFocusIdx(0)
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
    }, 24)
    return () => window.clearInterval(id)
  }, [phase, step, reduced])

  // Focus the first option when a question mounts; focus email on reveal.
  useEffect(() => {
    if (phase === 'q') {
      const t = window.setTimeout(() => optRefs.current[0]?.focus(), reduced ? 0 : 260)
      return () => window.clearTimeout(t)
    }
    if (phase === 'reveal') {
      const t = window.setTimeout(() => emailRef.current?.focus(), reduced ? 0 : 400)
      return () => window.clearTimeout(t)
    }
  }, [phase, step, reduced])

  // Brief "speaking" flash on the reveal.
  useEffect(() => {
    if (phase !== 'reveal' || reduced) return
    setSpeaking(true)
    const id = window.setTimeout(() => setSpeaking(false), 1600)
    return () => window.clearTimeout(id)
  }, [phase, reduced])

  function choose(value: string) {
    setPicked(value)
    const next = { ...answers, [q.id]: value }
    const advance = () => {
      setAnswers(next)
      if (step < ATLAS_QUESTIONS.length - 1) setStep(step + 1)
      else setPhase('reveal')
    }
    if (reduced) advance()
    else window.setTimeout(advance, 190)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (phase !== 'q') return
    const n = q.options.length
    if (/^[1-9]$/.test(e.key)) {
      const i = Number(e.key) - 1
      if (i < n) {
        e.preventDefault()
        choose(q.options[i].value)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const i = (focusIdx + 1) % n
      setFocusIdx(i)
      optRefs.current[i]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const i = (focusIdx - 1 + n) % n
      setFocusIdx(i)
      optRefs.current[i]?.focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
      if (step > 0) {
        e.preventDefault()
        setStep(step - 1)
      }
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
        body: JSON.stringify({ email: value, answers, source: 'atlas', honey: honeyRef.current?.value ?? '' }),
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

  const anim = (a: string) => (reduced ? undefined : a)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Find your path with Atlas"
      onKeyDown={onKeyDown}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'radial-gradient(130% 100% at 50% 0%, rgba(61,90,254,0.14), transparent 55%), rgba(5,5,9,0.9)',
        backdropFilter: 'blur(10px)',
        animation: anim('atlasFade 0.4s ease both'),
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes atlasFade{from{opacity:0}to{opacity:1}}
@keyframes atlasCardIn{from{opacity:0;transform:translateY(18px) scale(0.985)}to{opacity:1;transform:none}}
@keyframes atlasStepIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes atlasOptIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.atlasOpt{position:relative;transition:transform .2s cubic-bezier(0.16,1,0.3,1),border-color .2s,background .2s,box-shadow .2s}
.atlasOpt:hover,.atlasOpt:focus-visible{transform:translateX(5px);border-color:rgba(122,140,255,0.65);background:rgba(122,140,255,0.07);box-shadow:0 8px 24px -14px rgba(61,90,254,0.7);outline:none}
.atlasOpt:focus-visible{box-shadow:0 0 0 2px rgba(154,168,255,0.55),0 8px 24px -14px rgba(61,90,254,0.7)}
.atlasOpt .atlasArrow{opacity:0;transform:translateX(-6px);transition:opacity .2s,transform .2s}
.atlasOpt:hover .atlasArrow,.atlasOpt:focus-visible .atlasArrow{opacity:1;transform:none}
.atlasGhost{transition:color .18s}.atlasGhost:hover{color:#B4B6C2}
.atlasSubmit{transition:transform .18s,box-shadow .18s,opacity .18s}.atlasSubmit:hover{transform:translateY(-1px);box-shadow:0 12px 30px -12px rgba(61,90,254,0.8)}`,
        }}
      />

      {/* gradient hairline border → glass panel */}
      <div
        style={{
          width: 'min(540px, 100%)',
          maxHeight: 'calc(100dvh - 40px)',
          padding: 1,
          borderRadius: 26,
          background: 'linear-gradient(155deg, rgba(160,175,255,0.42), rgba(61,90,254,0.05) 44%, rgba(255,255,255,0.05))',
          boxShadow: '0 50px 130px -30px rgba(0,0,0,0.92)',
          animation: anim('atlasCardIn 0.55s cubic-bezier(0.16,1,0.3,1) both'),
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: 25,
            background: 'rgba(12,13,18,0.9)',
            backdropFilter: 'blur(26px)',
            overflow: 'hidden',
            maxHeight: 'calc(100dvh - 42px)',
            overflowY: 'auto',
          }}
        >
          {/* aurora wash */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(90% 55% at 50% -8%, rgba(61,90,254,0.22), transparent 62%), radial-gradient(60% 40% at 100% 0%, rgba(122,140,255,0.1), transparent 60%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', padding: 'clamp(24px, 4vw, 38px)' }}>
            {/* close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="atlasGhost"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 9,
                border: `1px solid ${C.line}`,
                background: 'rgba(255,255,255,0.03)',
                color: C.faint,
                cursor: 'pointer',
                fontSize: 15,
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {/* identity */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
              <AtlasOrb speaking={speaking} size={96} />
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.26em', textTransform: 'uppercase', color: C.accentInk }}>
                Atlas · your guide
              </div>
            </div>

            {/* progress rail */}
            {phase !== 'sent' && (
              <div style={{ display: 'flex', gap: 7, margin: '22px 0 4px' }}>
                {ATLAS_QUESTIONS.map((qq, i) => {
                  const done = phase === 'reveal' || i < step
                  const active = phase === 'q' && i === step
                  return (
                    <div key={qq.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div
                        style={{
                          height: 3,
                          borderRadius: 3,
                          background: done ? C.accent : active ? C.accentInk : 'rgba(255,255,255,0.09)',
                          boxShadow: active ? '0 0 10px rgba(154,168,255,0.7)' : undefined,
                          transition: 'background .3s',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 8.5,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          color: done || active ? C.accentInk : C.faint,
                        }}
                      >
                        {RAIL_LABELS[qq.id]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {phase === 'q' && (
              <div key={step} style={{ animation: anim('atlasStepIn 0.45s cubic-bezier(0.16,1,0.3,1) both') }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.faint, marginTop: 20 }}>
                  {q.eyebrow}
                </div>
                <h2
                  aria-live="polite"
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 'clamp(23px, 3.6vw, 31px)',
                    lineHeight: 1.16,
                    letterSpacing: '-0.02em',
                    color: C.text,
                    margin: '9px 0 0',
                    minHeight: 72,
                  }}
                >
                  {typed}
                  {speaking && !reduced ? <span style={{ color: C.accentInk, fontWeight: 300 }}>▍</span> : null}
                </h2>

                <div style={{ display: 'grid', gap: 9, marginTop: 18 }}>
                  {q.options.map((o, i) => {
                    const isPicked = picked === o.value
                    return (
                      <button
                        key={o.value}
                        ref={(el) => {
                          optRefs.current[i] = el
                        }}
                        className="atlasOpt"
                        onClick={() => choose(o.value)}
                        onMouseEnter={() => setFocusIdx(i)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          textAlign: 'left',
                          padding: '13px 15px',
                          borderRadius: 13,
                          border: `1px solid ${isPicked ? 'rgba(122,140,255,0.7)' : C.line}`,
                          background: isPicked ? 'rgba(122,140,255,0.1)' : 'rgba(255,255,255,0.02)',
                          color: C.text,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          animation: anim(`atlasOptIn 0.5s cubic-bezier(0.16,1,0.3,1) both`),
                          animationDelay: reduced ? undefined : `${i * 55 + 120}ms`,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            flexShrink: 0,
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            display: 'grid',
                            placeItems: 'center',
                            fontFamily: MONO,
                            fontSize: 11,
                            color: C.accentInk,
                            background: 'rgba(122,140,255,0.1)',
                            border: '1px solid rgba(122,140,255,0.22)',
                          }}
                        >
                          {`0${i + 1}`}
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 15, fontWeight: 600 }}>{o.label}</span>
                          {o.hint ? <span style={{ fontSize: 12.5, fontWeight: 400, color: C.faint }}>{o.hint}</span> : null}
                        </span>
                        <span className="atlasArrow" aria-hidden style={{ color: C.accentInk, fontSize: 15 }}>
                          →
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint }}>
                    press <b style={{ color: C.muted, fontWeight: 500 }}>1–{q.options.length}</b> · <b style={{ color: C.muted, fontWeight: 500 }}>↑↓</b> to move
                  </span>
                  {step > 0 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="atlasGhost"
                      style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 13, fontFamily: MONO }}
                    >
                      ← back
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="atlasGhost"
                      style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 13, fontFamily: MONO }}
                    >
                      skip
                    </button>
                  )}
                </div>
              </div>
            )}

            {phase === 'reveal' && (
              <div style={{ marginTop: 20, animation: anim('atlasStepIn 0.5s cubic-bezier(0.16,1,0.3,1) both') }}>
                <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.green }}>
                  Your path
                </div>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 'clamp(23px, 3.6vw, 31px)',
                    lineHeight: 1.16,
                    letterSpacing: '-0.02em',
                    color: C.text,
                    margin: '9px 0 12px',
                  }}
                >
                  {path.headline}
                </h2>
                <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.66, margin: 0 }}>{path.why}</p>

                {/* plan card */}
                <div
                  style={{
                    border: `1px solid ${C.line}`,
                    borderRadius: 15,
                    background: 'linear-gradient(180deg, rgba(122,140,255,0.06), rgba(255,255,255,0.015))',
                    padding: '17px 19px',
                    margin: '18px 0',
                  }}
                >
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.faint }}>
                    Start here
                  </div>
                  <div style={{ fontSize: 16.5, fontWeight: 600, color: C.text, margin: '5px 0 14px' }}>{path.startTitle}</div>
                  <div style={{ display: 'grid', gap: 11 }}>
                    {path.steps.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
                        <span
                          aria-hidden
                          style={{
                            flexShrink: 0,
                            fontFamily: MONO,
                            fontSize: 10,
                            color: C.accentInk,
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            display: 'grid',
                            placeItems: 'center',
                            background: 'rgba(122,140,255,0.1)',
                          }}
                        >
                          {`0${i + 1}`}
                        </span>
                        <span style={{ paddingTop: 2 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.faint, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
                    {path.cadence}
                  </div>
                </div>

                {/* email = reward */}
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label htmlFor="atlas-email" style={{ fontSize: 13.5, color: C.text, fontWeight: 600 }}>
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
                      id="atlas-email"
                      ref={emailRef}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@work.com"
                      style={{
                        flex: '1 1 200px',
                        padding: '13px 15px',
                        borderRadius: 12,
                        border: `1px solid ${error ? C.danger : C.line}`,
                        background: 'rgba(255,255,255,0.03)',
                        color: C.text,
                        fontSize: 15,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="atlasSubmit"
                      style={{
                        padding: '13px 22px',
                        borderRadius: 12,
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
                  {error ? <div style={{ color: C.danger, fontSize: 12.5 }}>{error}</div> : null}
                  <a href={path.startHref} className="atlasGhost" style={{ fontFamily: MONO, fontSize: 12.5, color: C.faint, textDecoration: 'none' }}>
                    or just start free now, no email →
                  </a>
                </form>
              </div>
            )}

            {phase === 'sent' && (
              <div style={{ marginTop: 24, textAlign: 'center', animation: anim('atlasStepIn 0.5s ease both') }}>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 'clamp(23px, 3.6vw, 31px)',
                    lineHeight: 1.16,
                    color: C.text,
                    margin: '0 0 12px',
                  }}
                >
                  {sent === 'ok' ? 'Your path is on its way.' : 'Path saved.'}
                </h2>
                <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.66, margin: '0 auto', maxWidth: '38ch' }}>
                  {sent === 'ok' && 'Check your inbox — your first lesson and next steps are waiting. Or start right now:'}
                  {sent === 'dev' && 'Saved (email isn’t wired up in this environment yet). You can start right now:'}
                  {sent === 'emailFailed' && 'You’re on the list — the email didn’t go through, but your path is saved. Start right now:'}
                </p>
                <a
                  href={path.startHref}
                  className="atlasSubmit"
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
                    className="atlasGhost"
                    style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', fontSize: 13, fontFamily: MONO }}
                  >
                    close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
