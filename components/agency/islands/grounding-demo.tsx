'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * RAG grounding-check demo — 3 canned questions, each "runs" a stepped check
 * and lands on a verdict. Canned content ported verbatim from
 * "Proof Portfolio v3 Navy". Honest label: SIMULATION OF MY REAL SCRIPT.
 * Reduced motion renders the result instantly.
 */

interface SourceRow {
  name: string
  tag: string
  /** CSS color for tag + border */
  color: string
}

interface Check {
  question: string
  sources: readonly SourceRow[]
  verdict: string
  /** CSS accent token for verdict + selected underline */
  color: string
  note: string
}

const CHECKS: readonly Check[] = [
  {
    question: '“Can I get a refund after 30 days?”',
    sources: [
      { name: 'policies/refunds.md', tag: 'CITED', color: 'var(--acc-pass)' },
      { name: 'legal/terms.md', tag: 'RETRIEVED', color: 'var(--tx-3)' },
    ],
    verdict: 'GROUNDED — SHIPS AUTOMATICALLY',
    color: 'var(--acc-pass)',
    note: 'Every citation is inside the retrieved set. The grounding check passes and the answer goes out — no human needed.',
  },
  {
    question: '“What is the enterprise SLA?”',
    sources: [
      { name: 'pricing/plans.md', tag: 'RETRIEVED', color: 'var(--tx-3)' },
      { name: 'sla-guarantees.pdf', tag: 'CITED — NEVER RETRIEVED', color: 'var(--acc-fail)' },
    ],
    verdict: 'BLOCKED — UNGROUNDED CITATION',
    color: 'var(--acc-fail)',
    note: 'The answer confidently cites a document retrieval never returned — a classic hallucination. The citation check fails it before anyone sees it.',
  },
  {
    question: '“Does the API support bulk export?”',
    sources: [{ name: 'api/reference.md', tag: 'WEAK MATCH', color: 'var(--acc-log)' }],
    verdict: 'LOW CONFIDENCE — ROUTED TO HUMAN REVIEW',
    color: 'var(--acc-log)',
    note: 'Retrieval confidence is below threshold, so the answer queues for approval instead of shipping. The human correction becomes a new eval case.',
  },
]

const STEP_MS = 340

/** 0 = checking, 1 = sources visible, 2 = verdict visible */
type Phase = 0 | 1 | 2

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function GroundingDemo() {
  const [selected, setSelected] = useState(0)
  const [phase, setPhase] = useState<Phase>(2)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const run = (index: number) => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setSelected(index)
    if (prefersReducedMotion()) {
      setPhase(2)
      return
    }
    setPhase(0)
    timers.current.push(setTimeout(() => setPhase(1), STEP_MS))
    timers.current.push(setTimeout(() => setPhase(2), STEP_MS * 2))
  }

  const check = CHECKS[selected]

  return (
    <div className="ag-ground">
      <div className="ag-ground__head">
        <h4 className="ag-ground__kicker">
          INTERACTIVE — TRY THE GROUNDING CHECK · PICK A QUESTION
        </h4>
        <span className="ag-ground__sim-badge">SIMULATION OF MY REAL SCRIPT</span>
      </div>

      <div className="ag-ground__questions">
        {CHECKS.map((c, i) => (
          <button
            key={c.question}
            type="button"
            className="ag-ground__question"
            aria-pressed={selected === i}
            onClick={() => run(i)}
          >
            <span className="ag-ground__question-text">{c.question}</span>
            <span
              className="ag-ground__question-underline"
              aria-hidden="true"
              style={{ background: selected === i ? c.color : 'transparent' }}
            />
          </button>
        ))}
      </div>

      <div className="ag-ground__result" aria-live="polite">
        <span className="ag-ground__result-label">RETRIEVED + CITED SOURCES</span>

        {phase === 0 ? (
          <span className="ag-ground__running ag-pulse">▸ RUNNING GROUNDING CHECK…</span>
        ) : (
          <div className="ag-ground__sources">
            {check.sources.map((s) => (
              <span
                key={s.name}
                className="ag-ground__source"
                style={{ borderColor: s.color }}
              >
                {s.name}
                <em className="ag-ground__source-tag" style={{ color: s.color }}>
                  {s.tag}
                </em>
              </span>
            ))}
          </div>
        )}

        {phase === 2 && (
          <>
            <span className="ag-ground__verdict" style={{ color: check.color }}>
              ▸ {check.verdict}
            </span>
            <p className="ag-ground__note">{check.note}</p>
          </>
        )}
      </div>
    </div>
  )
}
