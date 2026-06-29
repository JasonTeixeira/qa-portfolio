/**
 * EDGE taxonomy for SageDiagram.
 *
 * Standard stroke + arrowhead per (kind, tone):
 *   - sync     → solid line  (a synchronous call / request-response)
 *   - async    → dashed line (an event / async message; "emits event")
 *   - data     → solid line, slightly lighter (a data/read flow)
 *   - control  → dashed-dotted (a control / orchestration signal)
 * Toned edges (accent/warning/success) draw HEAVIER (the primary-path weight
 * ramp from tones.ts) and carry a per-tone arrowhead, so the suspect path and
 * blast radius pop out of the default-gray graph on their own.
 *
 * One arrowhead marker is emitted per tone (SVG markers cannot inherit the
 * line's stroke), keyed by a per-figure uid so multiple diagrams never collide.
 */

import * as React from 'react'
import { TONES, EDGE_DEFAULT_STROKE, isToned, TONE_ORDER, type Tone } from './tones'
import type { DiagramEdgeKind } from './diagram-kinds'

/**
 * Arrowhead scale per tone. Toned heads are larger so they match the heavier
 * 3.5–4px toned strokes; the default head matches the ~2px supporting stroke.
 * Each entry is the marker box size in user-space px (markerUnits userSpaceOnUse
 * means the head does NOT auto-scale with stroke-width, so we size it here).
 */
const ARROW_SIZE: Record<Tone, number> = {
  default: 13,
  // FIX 2 — the suspect-path head is the largest, matching its heaviest (5px)
  // stroke so the arrow doesn't look pinched against the bolder line.
  accent: 20,
  warning: 18,
  success: 17,
  muted: 13,
}

/**
 * Dash pattern for an edge — kind FIRST (meaning the author authored), then a
 * TONE fallback that carries colorblind redundancy.
 *
 * Kind dashes always win because they encode authored semantics (async = event,
 * control = orchestration). When the author left the edge a solid kind (sync /
 * data / unset), the tone supplies a distinct cadence so the three primary paths
 * separate WITHOUT relying on hue:
 *   - accent  (suspect path)  → stays SOLID + heaviest weight (4): the loudest,
 *     most-continuous line, the eye's first stop.
 *   - warning (blast radius)  → long-dash '14 6': a clearly different cadence
 *     from async's '9 7' and from the solid suspect line, so a red-green
 *     colorblind reader still tells suspect from blast-radius by pattern.
 *   - success (source of truth) → SOLID (its 3.5 weight + check-style head and
 *     hue carry it; kept continuous so "healthy/truth" reads as unbroken).
 * default/muted edges fall through to solid (their kind already decides).
 */
/**
 * FIX 2 — confident suspect-path dash. The accent (suspect) path reads as a
 * deliberate moving line, not a hairline. Whenever an edge is accent-toned we
 * give it a larger, evenly-weighted cadence ('13 8') so — paired with its heavy
 * 5px stroke and brightened hue — it is unmistakably the loudest line on the
 * canvas. This wins even when the author forced 'dashed' or left it solid,
 * because the suspect path's cadence is a property of the DIAGNOSIS, not the
 * edge kind. Authored async/control cadences still win for NON-accent edges so
 * their semantics survive.
 */
const SUSPECT_DASH = '13 8'

export function dashFor(
  kind: DiagramEdgeKind | undefined,
  forceDashed?: boolean,
  tone?: Tone,
): string | undefined {
  // The suspect path's confident cadence dominates regardless of kind/force.
  if (tone === 'accent') return SUSPECT_DASH
  if (forceDashed) return '9 7'
  switch (kind) {
    case 'async':
      return '9 7'
    case 'control':
      return '2 6'
    case 'sync':
    case 'data':
    default:
      // No authored kind-dash → let the tone add non-color redundancy.
      if (tone === 'warning') return '14 6'
      return undefined
  }
}

/** Resolved stroke color + weight for an edge. */
export function edgeStyle(tone: Tone | undefined): { stroke: string; width: number; opacity: number } {
  const toneKey: Tone = tone ?? 'default'
  if (!isToned(toneKey)) {
    // Full opacity: the brighter EDGE_DEFAULT_STROKE mix carries the contrast, so
    // no opacity knock-down (which previously made supporting edges read faint).
    return { stroke: EDGE_DEFAULT_STROKE, width: TONES.default.edgeWidth, opacity: 1 }
  }
  return { stroke: TONES[toneKey].stroke, width: TONES[toneKey].edgeWidth, opacity: 1 }
}

/** Stable id for a tone's arrowhead marker within one figure. */
export function arrowId(tone: Tone, uid: string): string {
  return `arrow-${tone}-${uid}`
}

/**
 * Stable id for the blast-radius inner-glow gradient within one figure (FIX 4).
 * A single radial wash reused by every warning-toned node in the figure.
 */
export function warningGlowId(uid: string): string {
  return `warn-glow-${uid}`
}

/** The `<defs>` block: per-tone arrowheads + the blast-radius inner-glow wash. */
export function EdgeMarkers({ uid }: { uid: string }) {
  return (
    <defs>
      {/* FIX 4 — blast-radius inner glow. A radial danger wash, hot at the node
          center and fading to transparent at the rim, so a warning node reads as
          a charged surface (an inner glow) rather than a flat tinted card. Token
          -based --ac-danger at low alpha; sits above the fill, below the label,
          so AA label contrast is unaffected. Static (no motion) → reduced-motion
          and print render it identically. */}
      <radialGradient id={warningGlowId(uid)} cx="50%" cy="50%" r="62%">
        <stop offset="0%" stopColor="var(--ac-danger)" stopOpacity={0.26} />
        <stop offset="55%" stopColor="var(--ac-danger)" stopOpacity={0.12} />
        <stop offset="100%" stopColor="var(--ac-danger)" stopOpacity={0} />
      </radialGradient>
      {TONE_ORDER.map((tone) => {
        const size = ARROW_SIZE[tone]
        // Arrow geometry authored on a 13-unit grid; scale to the tone's size so
        // toned heads grow with their heavier strokes while keeping the same form.
        const s = size / 13
        return (
          <marker
            key={tone}
            id={arrowId(tone, uid)}
            markerWidth={size}
            markerHeight={size}
            refX={9.5 * s}
            refY={6 * s}
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d={`M${2 * s} ${1.5 * s} L${11 * s} ${6 * s} L${2 * s} ${10.5 * s} Z`}
              fill={tone === 'default' ? EDGE_DEFAULT_STROKE : TONES[tone].stroke}
            />
          </marker>
        )
      })}
    </defs>
  )
}
