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
