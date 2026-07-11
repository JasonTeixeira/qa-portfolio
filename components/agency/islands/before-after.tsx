'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

/**
 * BEFORE — MANUAL vs AFTER — AUTOMATED toggle for the ops case study.
 * Two-tab tablist (keyboard: arrow keys switch tabs, selection follows
 * focus). Copy ported verbatim from "Proof Portfolio v3 Navy".
 */

const MANUAL_STEPS: readonly { text: string; tilt: string }[] = [
  { text: '1 · export the sheet by hand', tilt: '-1.2deg' },
  { text: '2 · paste into Discord', tilt: '0.8deg' },
  { text: '3 · hope nobody forgets step 3', tilt: '-0.6deg' },
  { text: '4 · it breaks — nobody notices for a week', tilt: '1.1deg' },
]

const AUTO_STEPS: readonly { text: string; color: string }[] = [
  { text: 'webhook trigger', color: 'var(--acc-browser)' },
  { text: 'job with retries', color: 'var(--acc-pass)' },
  { text: 'approval if risky', color: 'var(--acc-primary)' },
  { text: 'post + sync', color: 'var(--acc-ai)' },
  { text: 'log + alert', color: 'var(--acc-log)' },
]

const MANUAL_SUMMARY = 'NO TRIGGER · NO LOG · NO OWNER · NO RECOVERY PATH'
const AUTO_SUMMARY =
  'TRIGGER ✓ · RETRIES ✓ · APPROVAL ✓ · LOG ✓ · RUNBOOK ✓ — ANYONE CAN RUN OR RECOVER IT'

type Mode = 'manual' | 'auto'

export function BeforeAfterToggle() {
  const [mode, setMode] = useState<Mode>('auto')
  const manualTabRef = useRef<HTMLButtonElement | null>(null)
  const autoTabRef = useRef<HTMLButtonElement | null>(null)

  const switchTo = (next: Mode) => {
    setMode(next)
    ;(next === 'manual' ? manualTabRef : autoTabRef).current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      switchTo(mode === 'manual' ? 'auto' : 'manual')
    } else if (event.key === 'Home') {
      event.preventDefault()
      switchTo('manual')
    } else if (event.key === 'End') {
      event.preventDefault()
      switchTo('auto')
    }
  }

  return (
    <div className="ag-ba">
      <div className="ag-ba__head">
        <h4 className="ag-ba__kicker">INTERACTIVE — THE SAME PROCESS, TWICE</h4>
        <div
          className="ag-ba__tabs"
          role="tablist"
          aria-label="Before and after workflow"
          onKeyDown={handleKeyDown}
        >
          <button
            ref={manualTabRef}
            type="button"
            role="tab"
            id="ba-tab-manual"
            aria-selected={mode === 'manual'}
            aria-controls="ba-panel-manual"
            tabIndex={mode === 'manual' ? 0 : -1}
            className="ag-ba__tab ag-ba__tab--manual"
            onClick={() => setMode('manual')}
          >
            BEFORE — MANUAL
            <span
              className="ag-ba__tab-underline"
              aria-hidden="true"
              style={{ background: mode === 'manual' ? 'var(--acc-fail)' : 'transparent' }}
            />
          </button>
          <button
            ref={autoTabRef}
            type="button"
            role="tab"
            id="ba-tab-auto"
            aria-selected={mode === 'auto'}
            aria-controls="ba-panel-auto"
            tabIndex={mode === 'auto' ? 0 : -1}
            className="ag-ba__tab ag-ba__tab--auto"
            onClick={() => setMode('auto')}
          >
            AFTER — AUTOMATED
            <span
              className="ag-ba__tab-underline"
              aria-hidden="true"
              style={{ background: mode === 'auto' ? 'var(--acc-pass)' : 'transparent' }}
            />
          </button>
        </div>
      </div>

      {mode === 'manual' ? (
        <div
          id="ba-panel-manual"
          role="tabpanel"
          aria-labelledby="ba-tab-manual"
          className="ag-ba__panel"
        >
          <div className="ag-ba__steps">
            {MANUAL_STEPS.map((step) => (
              <span
                key={step.text}
                className="ag-ba__step ag-ba__step--manual"
                style={{ transform: `rotate(${step.tilt})` }}
              >
                {step.text}
              </span>
            ))}
          </div>
          <span className="ag-ba__summary ag-ba__summary--manual">{MANUAL_SUMMARY}</span>
        </div>
      ) : (
        <div
          id="ba-panel-auto"
          role="tabpanel"
          aria-labelledby="ba-tab-auto"
          className="ag-ba__panel"
        >
          <div className="ag-ba__steps ag-ba__steps--flow">
            {AUTO_STEPS.map((step, i) => (
              <span key={step.text} className="ag-ba__flow-item">
                <span className="ag-ba__step ag-ba__step--auto" style={{ borderColor: step.color }}>
                  {step.text}
                </span>
                {i < AUTO_STEPS.length - 1 && (
                  <span className="ag-ba__arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
          <span className="ag-ba__summary ag-ba__summary--auto">{AUTO_SUMMARY}</span>
        </div>
      )}
    </div>
  )
}
