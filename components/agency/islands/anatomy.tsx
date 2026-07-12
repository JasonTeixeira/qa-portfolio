'use client'

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactElement } from 'react'

/**
 * "Anatomy of a trustworthy automation" — 5 selectable workflow-stage nodes
 * joined by animated dashed connectors, with a detail panel underneath.
 * A11y: radiogroup pattern — roving tabindex, arrow keys move + select,
 * Enter/Space select. Copy ported verbatim from "Proof Portfolio v3 Navy".
 * Visual layer: glyph circles on a gentle arc, curved dash-flow connectors
 * with direction arrows, and an artifact chip attached under each node.
 */

type GlyphId = 'bolt' | 'sparkle' | 'gauge' | 'person' | 'list'

interface Stage {
  label: string
  kicker: string
  /** CSS accent token for this stage */
  color: string
  description: string
  artifact: string
  glyph: GlyphId
}

const STAGES: readonly Stage[] = [
  {
    label: 'TRIGGER',
    kicker: '01 / TRIGGER',
    color: 'var(--acc-browser)',
    description:
      'A defined input starts the run — a webhook, a schedule, a message. Never a person remembering to. If it can’t say what wakes it up, it isn’t an automation yet.',
    artifact: 'Job manifest + trigger log',
    glyph: 'bolt',
  },
  {
    label: 'AI STEP',
    kicker: '02 / AI STEP',
    color: 'var(--acc-ai)',
    description:
      'The model answers from retrieved sources only, with versioned prompts. A prompt edit is a code change — it gets review and a changelog entry.',
    artifact: 'Prompt changelog + retrieval trace',
    glyph: 'sparkle',
  },
  {
    label: 'EVALS',
    kicker: '03 / EVALS',
    color: 'var(--acc-primary)',
    description:
      'Every output is scored against a rubric: grounding, structure, refusal behavior. Answers that cite outside the retrieved set fail automatically.',
    artifact: 'Eval JSON report per run',
    glyph: 'gauge',
  },
  {
    label: 'HUMAN GATE',
    kicker: '04 / HUMAN GATE',
    color: 'var(--acc-pass)',
    description:
      'Low-confidence results never ship — they route to an approval queue. Every human correction becomes a new eval case. The loop closes.',
    artifact: 'Approval queue + audit trail',
    glyph: 'person',
  },
  {
    label: 'LOG',
    kicker: '05 / LOG',
    color: 'var(--acc-log)',
    description:
      'Every run leaves a trail — observable, repeatable, and recoverable by someone who isn’t me. A workflow without a runbook is a liability with a schedule.',
    artifact: 'Run logs + runbook',
    glyph: 'list',
  },
]

/** Gentle arc: vertical offset (px) per node, ends low, middle high. */
const ARC_Y: readonly number[] = [30, 10, 0, 10, 30]
/** Circle center = arc offset + half of the 80px circle. */
const CIRCLE_CENTER = 40

const GLYPH_PATHS: Record<GlyphId, ReactElement> = {
  bolt: <path d="M13.5 2.5 5.5 14h6l-1 7.5 8-11.5h-6z" />,
  sparkle: (
    <path d="M12 3l1.9 7.1L21 12l-7.1 1.9L12 21l-1.9-7.1L3 12l7.1-1.9z" />
  ),
  gauge: (
    <>
      <path d="M4.5 16a8 8 0 0 1 15 0" />
      <path d="M12 16l4.2-5.4" />
      <circle cx="12" cy="16" r="1.4" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1-4.2 3.8-6.3 7-6.3s6 2.1 7 6.3" />
    </>
  ),
  list: (
    <>
      <path d="M9 6.5h10M9 12h10M9 17.5h10" />
      <circle cx="5" cy="6.5" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="5" cy="17.5" r="1.2" />
    </>
  ),
}

function StageGlyph({ glyph }: { glyph: GlyphId }): ReactElement {
  return (
    <svg
      className="ag-anatomy__glyph"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPH_PATHS[glyph]}
    </svg>
  )
}

/** Curved dash-flow connector between node i and i+1, sloped to match the arc. */
function Connector({ from, to }: { from: number; to: number }): ReactElement {
  const y1 = ARC_Y[from] + CIRCLE_CENTER
  const y2 = ARC_Y[to] + CIRCLE_CENTER
  const midY = (y1 + y2) / 2
  return (
    <span className="ag-anatomy__link" aria-hidden="true">
      <svg
        className="ag-anatomy__link-svg"
        viewBox="0 0 120 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          className="ag-dashflow"
          d={`M0 ${y1} C 45 ${y1}, 75 ${y2}, 120 ${y2}`}
          fill="none"
          stroke="rgba(226, 234, 250, 0.3)"
          strokeWidth="2"
        />
      </svg>
      <span className="ag-anatomy__link-arrow" style={{ top: `${midY - 4}px` }} />
    </span>
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
          Select each stage. Every service I offer lives somewhere on this map — and each stage
          links to the case study that proves it.
        </p>
      </div>

      <div
        className="ag-anatomy__rail ag-anatomy__rail--arc"
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
              className="ag-anatomy__node ag-anatomy__node--glyph"
              style={
                { '--stage-color': s.color, '--arc-y': `${ARC_Y[i]}px` } as CSSProperties
              }
              onClick={() => setSelected(i)}
            >
              <span className="ag-anatomy__circle" aria-hidden="true">
                <StageGlyph glyph={s.glyph} />
              </span>
              <span className="ag-anatomy__label">{s.label}</span>
              <span className="ag-anatomy__chip">{s.artifact}</span>
            </button>
            {i < STAGES.length - 1 && <Connector from={i} to={i + 1} />}
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
