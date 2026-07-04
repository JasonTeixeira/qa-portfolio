/**
 * Shared MOTION language for academy visuals.
 *
 * One curve (`--ac-ease-out-expo`), compositor-only properties (opacity +
 * transform + stroke-dashoffset), and a single rule: under prefers-reduced-
 * motion the visual renders in its legible static FINAL state instantly. Meaning
 * never lives in the motion — the structure carries it, the motion only sequences
 * the reveal. Used by SageDiagram (and reusable by future components).
 */

/** The house ease-out-expo (matches --ac-ease-out-expo in globals.css). */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/** Per-step stagger so nodes/edges reveal in rank/flow order, not all at once. */
export const NODE_STAGGER = 0.06
export const EDGE_STAGGER = 0.07

/** Edge draw-in (stroke-dashoffset) duration. */
export const EDGE_DRAW_DURATION = 0.7
/** Node fade-up duration. */
export const NODE_RISE_DURATION = 0.55
/** Edge label pill fade duration. */
export const LABEL_FADE_DURATION = 0.4

/**
 * DATAFLOW — the signature Sage motion. After a wire draws in, a bright,
 * tone-colored pulse of light travels ALONG it from source→target, looping.
 * It always follows the authored flow direction (the path is built from→to),
 * so data reads as moving through the system regardless of screen direction.
 * Implemented as a short dash + full-length gap whose stroke-dashoffset loops
 * at constant velocity → longer wires take proportionally longer (real speed,
 * not a fixed beat). Compositor-only (stroke-dashoffset); under reduced-motion
 * the pulse is not rendered — the static wire + arrowhead carry direction.
 */
export const FLOW_PULSE_LEN = 30 // px — length of the traveling light segment
export const FLOW_SPEED = 165 // px/sec — constant velocity across every edge
export const FLOW_MIN_DURATION = 1.1 // s — floor so short edges don't strobe
export const FLOW_MAX_DURATION = 3.6 // s — cap so long edges still feel alive

/** Loop duration for a pulse crossing a path of on-screen length `len` (px). */
export function flowDuration(len: number): number {
  const raw = (len + FLOW_PULSE_LEN) / FLOW_SPEED
  return Math.min(FLOW_MAX_DURATION, Math.max(FLOW_MIN_DURATION, raw))
}
