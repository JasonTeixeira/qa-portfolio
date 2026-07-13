/**
 * Shared semantic TONE system for the academy visual design system.
 *
 * Color carries MEANING, used consistently across every visual. Each tone maps
 * to one academy `--ac-*` state token, so an `accent` edge is always the
 * suspect/focus path, `warning` is always blast-radius/risk, `success` is always
 * the source-of-truth/healthy node, and `muted` is always out-of-scope.
 *
 * This is the single source of truth — SageDiagram, SageViz, and future
 * components all import from here so nothing is bespoke.
 */

export type Tone = 'default' | 'accent' | 'warning' | 'success' | 'muted'

/**
 * Per-tone visual treatment. `stroke`/`text` are the semantic hue; `fill` is an
 * accent/state WASH mixed into the surface via color-mix() so a node reads as a
 * tinted card, not a flat block. `edgeWidth` powers the primary-path weight ramp
 * (toned edges draw heavier so the diagnosis is legible from the graph alone).
 */
export type ToneTreatment = {
  /** Node fill: a tinted surface wash. */
  fill: string
  /** Border + arrowhead + edge color: the semantic hue. */
  stroke: string
  /** On-tone text color (AA on the tinted fill / dark bg). */
  text: string
  /** Edge stroke weight for this tone (the primary-path ramp). */
  edgeWidth: number
}

export const TONES: Record<Tone, ToneTreatment> = {
  default: {
    fill: 'color-mix(in oklch, var(--ac-surface) 86%, var(--ac-ink) 14%)',
    stroke: 'var(--ac-rule-strong)',
    text: 'var(--ac-ink)',
    // Default edges read as a clearly-visible supporting line (the BRIGHTER mix
    // in EDGE_DEFAULT_STROKE carries the actual color; this width is the floor of
    // the ramp). Widened so the gap to toned edges is unmistakable.
    edgeWidth: 2,
  },
  accent: {
    fill: 'color-mix(in oklch, var(--ac-surface) 74%, var(--ac-accent) 26%)',
    // FIX 2 — SUSPECT-PATH DOMINANCE. The accent edge is the single most
    // important diagnostic signal, so brighten the hue further (more white mix)
    // so it pops hardest off the near-black canvas — clearly above every other
    // stroke including warning.
    stroke: 'color-mix(in oklch, var(--ac-accent) 68%, white 32%)',
    text: 'var(--ac-accent-text)',
    // FIX 2 — the heaviest stroke in the ramp, ahead of warning (4) and well
    // above the default supporting line (2). The suspect path must out-weight
    // every other edge so the eye lands on it first.
    edgeWidth: 5,
  },
  warning: {
    // FIX 4 — BLAST-RADIUS EMPHASIS. Deepen the danger wash (16%→24%) so a
    // warning-toned NODE reads as a charged surface, not just a border tint —
    // the blast radius should register as the second-loudest element after the
    // suspect path. Token-based color-mix, applied to ANY warning node. Paired
    // with the inner-glow halo in diagram-kinds (NodeShell).
    fill: 'color-mix(in oklch, var(--ac-surface) 76%, var(--ac-danger) 24%)',
    stroke: 'color-mix(in oklch, var(--ac-danger) 80%, white 20%)',
    // AA on the DEEPER fill: raw --ac-danger (oklch 66% L) lands ~3:1 on the new
    // ~30% L washed surface — under AA 4.5. Brighten it toward white the same way
    // --ac-accent-text brightens accent, lifting the danger hue to a text-safe
    // luminance while keeping it unmistakably "danger". (No --ac-danger-text
    // token exists, so this is the in-system equivalent, token-based.)
    text: 'color-mix(in oklch, var(--ac-danger) 55%, white 45%)',
    edgeWidth: 4,
  },
  success: {
    fill: 'color-mix(in oklch, var(--ac-surface) 76%, var(--ac-mastery) 24%)',
    stroke: 'var(--ac-mastery)',
    text: 'var(--ac-mastery)',
    edgeWidth: 3.5,
  },
  muted: {
    // Out of scope: no wash, faint hairline, faint text — recedes on purpose.
    fill: 'color-mix(in oklch, var(--ac-surface) 92%, var(--ac-bg) 8%)',
    stroke: 'var(--ac-ink-faint)',
    text: 'var(--ac-ink-faint)',
    edgeWidth: 2,
  },
}

/**
 * Default edge color for the un-toned graph. NOT --ac-ink-faint (too dim against
 * the near-black canvas) and NOT --ac-rule-strong (a hairline). A bright mix of
 * --ac-ink-soft toward white so every supporting edge clearly reads, while still
 * sitting visually below the toned suspect/blast-radius paths.
 */
export const EDGE_DEFAULT_STROKE =
  'color-mix(in oklch, var(--ac-ink-soft) 88%, white 12%)'

/** True for every tone except `default` — drives legend rendering + edge emphasis. */
export function isToned(tone: Tone | undefined): boolean {
  return tone !== undefined && tone !== 'default'
}

/**
 * Default legend copy, derived from which tones are present when no explicit
 * `legend` is supplied. Tuned to the academy's diagnosis vocabulary.
 */
export const DEFAULT_LEGEND_LABEL: Record<Tone, string> = {
  accent: 'on the suspect path',
  warning: 'blast radius',
  success: 'source of truth',
  muted: 'out of scope',
  default: 'supporting flow',
}

/**
 * One-line plain-language DECODE under each legend chip, so a first-time reader
 * learns what the color MEANS in operational terms — not just its name. Rendered
 * as sublabel text beneath the legend label in VisualFrame.
 */
export const LEGEND_DECODE: Record<Tone, string> = {
  accent: 'the path this lesson is tracing',
  warning: 'what breaks if this is wrong',
  success: 'the system of record — the truth',
  muted: 'shown for context, not in scope',
  default: 'ordinary request / data flow',
}

/** Stable legend ordering: suspect path → blast radius → source of truth → muted. */
export const TONE_ORDER: Tone[] = ['accent', 'warning', 'success', 'muted', 'default']
