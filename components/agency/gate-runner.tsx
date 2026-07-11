'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import siteProof from '@/proof/site-proof.json'

/**
 * Terminal-style panel rendering this site's own release gate.
 * It renders EXACTLY what proof/site-proof.json says — seeded pending at
 * build, overwritten by CI. No fake greens.
 */

type CheckStatus = 'pass' | 'pending' | 'fail'

interface GateCheck {
  id: string
  label: string
  status: CheckStatus
}

function toStatus(value: string): CheckStatus {
  // Unknown statuses degrade to pending — never upgrade to pass.
  return value === 'pass' || value === 'fail' ? value : 'pending'
}

const CHECKS: GateCheck[] = siteProof.checks.map((check) => ({
  id: check.id,
  label: check.label,
  status: toStatus(check.status),
}))

const VERIFIED_AT: string | null = siteProof.verifiedAt as string | null

const LINE_DELAY_MS = 300
const TOTAL_STEPS = CHECKS.length + 1 // check lines + readiness footer

const STATUS_TEXT: Record<CheckStatus, string> = {
  pass: '✓ PASS',
  pending: '○ PENDING',
  fail: '✗ FAIL',
}

type ReadinessTone = 'pass' | 'pending' | 'fail'

function readiness(): { text: string; tone: ReadinessTone } {
  if (CHECKS.some((check) => check.status === 'fail')) {
    return { text: 'READINESS: BLOCKED ✗', tone: 'fail' }
  }
  if (CHECKS.some((check) => check.status === 'pending')) {
    return { text: 'READINESS: VERIFICATION IN PROGRESS', tone: 'pending' }
  }
  return { text: 'READINESS: SHIP ✓', tone: 'pass' }
}

export function GateRunner() {
  const ref = useRef<HTMLDivElement | null>(null)
  const timersRef = useRef<number[]>([])
  const [step, setStep] = useState<number>(0)

  // Plays (or replays) the type-out sequence. Reduced motion: instant full
  // render — the button still "works", there is just no animation.
  const play = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(TOTAL_STEPS)
      return
    }
    setStep(0)
    for (let i = 1; i <= TOTAL_STEPS; i += 1) {
      timersRef.current.push(window.setTimeout(() => setStep(i), i * LINE_DELAY_MS))
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          io.disconnect()
          play()
        })
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [play])

  const gate = readiness()
  const done = step >= TOTAL_STEPS
  const cursor = <span className="ag-gate-cursor" aria-hidden="true" />

  return (
    <div ref={ref} className="ag-gate" aria-live="polite">
      <div className="ag-gate-headrow">
        <p className="ag-gate-header">
          <span className="ag-gate-prompt">$</span> verify agency.sageideas.dev
          {step === 0 ? cursor : null}
        </p>
        <button
          type="button"
          className="ag-gate-rerun"
          onClick={play}
          aria-label="Replay the gate check sequence"
        >
          RE-RUN <span aria-hidden="true">▸</span>
        </button>
      </div>
      <ul className="ag-gate-lines">
        {CHECKS.slice(0, step).map((check, index) => (
          <li key={check.id} className="ag-gate-line">
            <span className={`ag-gate-status ag-gate-status--${check.status}`}>
              {STATUS_TEXT[check.status]}
            </span>
            <span className="ag-gate-label">{check.label}</span>
            {!done && index === step - 1 ? cursor : null}
          </li>
        ))}
      </ul>
      {done ? (
        <p className={`ag-gate-footer ag-gate-footer--${gate.tone}`}>
          {gate.text}
          {cursor}
        </p>
      ) : null}
      <p className="ag-gate-caption">
        LIVE OUTPUT OF THIS SITE&apos;S OWN RELEASE GATE — SEEDED AT BUILD, WRITTEN BY CI
        {VERIFIED_AT ? ` · VERIFIED AT ${VERIFIED_AT}` : ''}
      </p>
    </div>
  )
}
