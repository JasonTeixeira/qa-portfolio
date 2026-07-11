'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

/**
 * "Anatomy of a trustworthy automation" — 5 selectable workflow-stage nodes
 * joined by animated dashed connectors, with a detail panel underneath.
 * A11y: radiogroup pattern — roving tabindex, arrow keys move + select,
 * Enter/Space select. Copy ported verbatim from "Proof Portfolio v3 Navy".
 */

interface Stage {
  label: string
  kicker: string
  /** CSS accent token for this stage */
  color: string
  description: string
  artifact: string
}

const STAGES: readonly Stage[] = [
  {
    label: 'TRIGGER',
    kicker: '01 / TRIGGER',
    color: 'var(--acc-browser)',
    description:
      'A defined input starts the run — a webhook, a schedule, a message. Never a person remembering to. If it can’t say what wakes it up, it isn’t an automation yet.',
    artifact: 'Job manifest + trigger log',
  },
  {
    label: 'AI STEP',
    kicker: '02 / AI STEP',
    color: 'var(--acc-ai)',
    description:
      'The model answers from retrieved sources only, with versioned prompts. A prompt edit is a code change — it gets review and a changelog entry.',
    artifact: 'Prompt changelog + retrieval trace',
  },
  {
    label: 'EVALS',
    kicker: '03 / EVALS',
    color: 'var(--acc-primary)',
    description:
      'Every output is scored against a rubric: grounding, structure, refusal behavior. Answers that cite outside the retrieved set fail automatically.',
    artifact: 'Eval JSON report per run',
  },
  {
    label: 'HUMAN GATE',
    kicker: '04 / HUMAN GATE',
    color: 'var(--acc-pass)',
    description:
      'Low-confidence results never ship — they route to an approval queue. Every human correction becomes a new eval case. The loop closes.',
    artifact: 'Approval queue + audit trail',
  },
  {
    label: 'LOG',
    kicker: '05 / LOG',
    color: 'var(--acc-log)',
    description:
      'Every run leaves a trail — observable, repeatable, and recoverable by someone who isn’t me. A workflow without a runbook is a liability with a schedule.',
    artifact: 'Run logs + runbook',
  },
]

function Connector() {
  return (
    <svg className="ag-anatomy__connector" aria-hidden="true" focusable="false">
      <line
        className="ag-dashflow"
        x1="0"
        y1="1"
        x2="100%"
        y2="1"
        stroke="rgba(226, 234, 250, 0.3)"
        strokeWidth="2"
      />
    </svg>
  )
}

export function AnatomySelector() {
  const [selected, setSelected] = useState(0)
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectAndFocus = (index: number) => {
    const next = (index + STAGES.length) % STAGES.length
    setSelected(next)
    nodeRefs.current[next]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        selectAndFocus(selected + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        selectAndFocus(selected - 1)
        break
      case 'Home':
        event.preventDefault()
        selectAndFocus(0)
        break
      case 'End':
        event.preventDefault()
        selectAndFocus(STAGES.length - 1)
        break
    }
  }

  const stage = STAGES[selected]

  return (
    <section id="anatomy" className="ag-section ag-anatomy" aria-labelledby="anatomy-heading">
      <div className="ag-anatomy__head">
        <p className="ag-kicker">02.5 — SYSTEM ANATOMY</p>
        <h2 id="anatomy-heading" className="ag-anatomy__title">
          Anatomy of a trustworthy automation
        </h2>
        <p className="ag-anatomy__lede">
          Hover each stage. Every service I offer lives somewhere on this map — and each stage
          links to the case study that proves it.
        </p>
      </div>

      <div
        className="ag-anatomy__rail"
        role="radiogroup"
        aria-label="Workflow stages"
        onKeyDown={handleKeyDown}
      >
        {STAGES.map((s, i) => (
          <div className="ag-anatomy__step" key={s.label}>
            <button
              ref={(el) => {
                nodeRefs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={selected === i}
              tabIndex={selected === i ? 0 : -1}
              className="ag-anatomy__node"
              style={{ '--stage-color': s.color } as React.CSSProperties}
              onClick={() => setSelected(i)}
            >
              <span className="ag-anatomy__ring" aria-hidden="true">
                <span className="ag-anatomy__dot" />
              </span>
              <span className="ag-anatomy__label">{s.label}</span>
              <span className="ag-anatomy__underline" aria-hidden="true" />
            </button>
            {i < STAGES.length - 1 && <Connector />}
          </div>
        ))}
      </div>

      <div className="ag-anatomy__panel" aria-live="polite">
        <div className="ag-anatomy__panel-main">
          <span className="ag-anatomy__panel-kicker" style={{ color: stage.color }}>
            {stage.kicker}
          </span>
          <p className="ag-anatomy__panel-desc">{stage.description}</p>
        </div>
        <div className="ag-anatomy__panel-side">
          <span className="ag-anatomy__panel-label">ARTIFACT IT PRODUCES</span>
          <span className="ag-anatomy__panel-artifact">{stage.artifact}</span>
          <a className="ag-anatomy__panel-link" href="#case-studies">
            SEE THE CASE STUDY →
          </a>
        </div>
      </div>
    </section>
  )
}
