'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

/**
 * Test pyramid — 4 selectable layers (visual order top → bottom) with a side
 * panel explaining what each layer protects and its tradeoffs.
 * A11y: radiogroup with roving tabindex; ArrowUp/ArrowDown move between
 * layers. Copy ported verbatim from "Proof Portfolio v3 Navy".
 */

interface Layer {
  title: string
  /** CSS accent token */
  color: string
  /** pyramid layer width, top layer narrowest */
  width: string
  description: string
  tools: string
}

/** Visual order: top of the pyramid first. */
const LAYERS: readonly Layer[] = [
  {
    title: 'VISUAL + A11Y',
    color: 'var(--acc-ai)',
    width: '34%',
    description:
      'Protects what users actually see — pixel regressions and accessibility. Different job from E2E: it catches what “passes” but looks broken.',
    tools: 'snapshot diffs · axe-core',
  },
  {
    title: 'E2E BROWSER',
    color: 'var(--acc-primary)',
    width: '54%',
    description:
      'Protects the highest-value user flows: auth, checkout, forms. Failures capture traces and screenshots so bugs arrive pre-reproduced.',
    tools: 'Playwright · Chromium · trace files',
  },
  {
    title: 'API SMOKE',
    color: 'var(--acc-pass)',
    width: '76%',
    description:
      'Protects the seams — endpoints, auth, data shapes — without the cost of a browser. First thing to run against a fresh deploy.',
    tools: 'HTTP checks · schema assertions',
  },
  {
    title: 'UNIT + INTEGRATION',
    color: 'var(--acc-browser)',
    width: '100%',
    description:
      'Protects logic and contracts. Fast and deterministic — runs on every change, catches most regressions before a browser ever opens.',
    tools: 'vitest / jest · runs in CI on every push',
  },
]

/** Design default: E2E BROWSER selected. */
const DEFAULT_LAYER = 1

export function TestPyramid() {
  const [selected, setSelected] = useState(DEFAULT_LAYER)
  const layerRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectAndFocus = (index: number) => {
    const next = (index + LAYERS.length) % LAYERS.length
    setSelected(next)
    layerRefs.current[next]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        selectAndFocus(selected + 1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        selectAndFocus(selected - 1)
        break
      case 'Home':
        event.preventDefault()
        selectAndFocus(0)
        break
      case 'End':
        event.preventDefault()
        selectAndFocus(LAYERS.length - 1)
        break
    }
  }

  const layer = LAYERS[selected]

  return (
    <div className="ag-pyramid">
      <div
        className="ag-pyramid__stack"
        role="radiogroup"
        aria-label="Test pyramid layers"
        onKeyDown={handleKeyDown}
      >
        {LAYERS.map((l, i) => (
          <button
            key={l.title}
            ref={(el) => {
              layerRefs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected === i}
            tabIndex={selected === i ? 0 : -1}
            className="ag-pyramid__layer"
            style={
              {
                '--layer-color': l.color,
                '--layer-width': l.width,
              } as React.CSSProperties
            }
            onClick={() => setSelected(i)}
          >
            <span className="ag-pyramid__layer-title">{l.title}</span>
            <span className="ag-pyramid__layer-underline" aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="ag-pyramid__panel" aria-live="polite">
        <h4 className="ag-pyramid__kicker">INTERACTIVE — HOVER THE PYRAMID</h4>
        <span className="ag-pyramid__title" style={{ color: layer.color }}>
          {layer.title}
        </span>
        <p className="ag-pyramid__desc">{layer.description}</p>
        <span className="ag-pyramid__tools">{layer.tools}</span>
      </div>
    </div>
  )
}
