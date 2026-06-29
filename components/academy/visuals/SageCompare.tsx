'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TONES, type Tone } from './tones'
import { VisualFrame } from './VisualFrame'
import { EASE_OUT_EXPO, NODE_RISE_DURATION, NODE_STAGGER } from './motion'

/**
 * SageCompare — the animated 2-up COMPARISON for the academy visual system.
 *
 * weak-vs-gold, before/after, option A vs B. Two toned surface cards sit
 * side-by-side (stacking to one column under ~640px) inside the standard
 * <VisualFrame>. Each panel is a tinted card whose semantic `tone` (from the
 * shared tone map) does the teaching: the CONTRAST between the two panels is the
 * signal. Each `lines` row gets a minimal inline-SVG leading marker — a check for
 * success/accent tones, a downward "not this" caret for warning/muted/default —
 * drawn in `currentColor` so it inherits the panel's tone (never an emoji, never a
 * decorative glyph). An optional `verdict` footer closes each panel, and a center
 * "vs" seam separates them.
 *
 * WEIGHT EQUALIZATION (engine fix): the raw tone map gives each tone its own
 * fill alpha (16% vs 24% wash) and its own stroke brightness, so pairing e.g.
 * success against warning tips optical weight to one side. SageCompare does NOT
 * consume each tone's raw `fill`/`stroke`. Instead it derives BOTH the wash and
 * the keyline UNIFORMLY from each tone's semantic hue (its `stroke`) at one fixed
 * wash alpha and one fixed border opacity/width for every panel — so the two
 * panels carry identical perceived weight regardless of which tones are paired.
 * Only the HUE differs (the teaching contrast); the WEIGHT is normalized.
 *
 * Motion: the two panels fade up with a slight left-then-right stagger using the
 * house ease-out-expo curve and the shared NODE_RISE/STAGGER timings —
 * compositor-only (opacity + translateY). Under prefers-reduced-motion both
 * panels render in their final state instantly; the comparison is fully legible
 * with zero motion. Panels are equal-height (align-items: stretch) so there is no
 * reflow and no CLS.
 *
 * a11y: a labelled group (role="group") names the comparison; each panel is a
 * <section> region whose accessible name is its label. The sr-only frame
 * description names both sides + verdicts so the teaching survives color/motion
 * removal. AA contrast comes from the tone map's `text` tokens on the tinted fill.
 *
 * Legend: deliberately SUPPRESSED. The two pill headers already carry each
 * panel's label AND its tone swatch (border/text are the semantic hue), so they
 * fully self-disambiguate the sides. A frame legend would either (a) repeat the
 * generic tone meanings ("blast radius" / "source of truth") — which mislabels
 * the panels and does no work here — or (b) restate the same label+swatch the
 * pills already show. Both are redundant, so SageCompare passes no `legend` to
 * VisualFrame. The sr-only description still names both sides for AT.
 */

export type SageCompareTone = Tone

export type SageComparePanel = {
  /** Header chip text + the panel's accessible name. */
  label: string
  /** Semantic tone — drives the wash, border, text, and marker glyph. */
  tone?: Tone
  /** The comparison rows (each a marked list item). */
  lines: string[]
  /** Optional closing line (e.g. a takeaway / score). */
  verdict?: string
}

export type SageCompareProps = {
  title: string
  subtitle?: string
  left: SageComparePanel
  right: SageComparePanel
  /** Render the body lines in --ac-font-mono (for code/artifact compares). */
  mono?: boolean
  caption?: string
  className?: string
}

// Tones that read as "good/affirmed" get a check; the rest get a "not this"
// caret. Kept tiny and tone-driven so the marker reinforces the panel's meaning
// in HUE *and* in SHAPE — the shape contrast holds up in grayscale.
const CHECK_TONES = new Set<Tone>(['success', 'accent'])

// Uniform weight tokens. The wash and keyline for BOTH panels are derived from
// each tone's semantic hue at THESE fixed values, never from the tone's raw
// (differing) fill/stroke — so neither side optically dominates. Only hue varies.
const WASH_HUE_PCT = 12 // hue mixed into the surface for every panel's wash
const KEYLINE_OPACITY = 0.42 // border opacity, identical across tones
const KEYLINE_WIDTH = '1px' // border width, identical across tones

export function SageCompare({
  title,
  subtitle,
  left,
  right,
  mono,
  caption,
  className,
}: SageCompareProps) {
  const reduce = useReducedMotion()
  const titleId = React.useId()
  const descId = React.useId()
  const leftId = React.useId()
  const rightId = React.useId()

  const description = React.useMemo(
    () => buildDescription(subtitle, left, right),
    [subtitle, left, right],
  )

  return (
    <VisualFrame
      kicker="Comparison"
      title={title}
      titleId={titleId}
      subtitle={subtitle}
      descId={descId}
      description={description}
      caption={caption}
      className={className}
    >
      <div style={containerStyle}>
        <style>{RESPONSIVE_CSS}</style>
        <div role="group" aria-labelledby={titleId} className="ac-compare" style={gridStyle}>
          <Panel
            panel={left}
            regionId={leftId}
            mono={mono}
            reduce={reduce ?? false}
            index={0}
          />
          <div className="ac-compare-seam" style={seamStyle} aria-hidden="true">
            <span className="ac-compare-seam-rule" style={seamRuleStyle} />
            <span className="ac-compare-seam-chip" style={seamChipStyle}>
              vs
            </span>
          </div>
          <Panel
            panel={right}
            regionId={rightId}
            mono={mono}
            reduce={reduce ?? false}
            index={1}
          />
        </div>
      </div>
    </VisualFrame>
  )
}

type PanelProps = {
  panel: SageComparePanel
  regionId: string
  mono?: boolean
  reduce: boolean
  index: number
}

function Panel({ panel, regionId, mono, reduce, index }: PanelProps) {
  const tone: Tone = panel.tone ?? 'default'
  const treatment = TONES[tone]
  const isCheck = CHECK_TONES.has(tone)

  // Equalize perceived weight: derive the wash and keyline UNIFORMLY from this
  // tone's semantic hue (treatment.stroke) at one fixed wash alpha and one fixed
  // border opacity/width for every tone — instead of consuming the tone's raw
  // (differing) fill + stroke. Hue stays distinct; weight is normalized so
  // neither panel optically dominates regardless of the pairing.
  const hue = treatment.stroke
  const wash = `color-mix(in oklch, var(--ac-surface) ${100 - WASH_HUE_PCT}%, ${hue} ${WASH_HUE_PCT}%)`
  const keyline = `color-mix(in oklch, ${hue} ${Math.round(KEYLINE_OPACITY * 100)}%, transparent)`

  const cardStyle: React.CSSProperties = {
    ...panelStyle,
    background: wash,
    borderColor: keyline,
    borderWidth: KEYLINE_WIDTH,
  }

  return (
    <motion.section
      aria-labelledby={regionId}
      style={cardStyle}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: reduce ? 0 : NODE_RISE_DURATION,
        delay: reduce ? 0 : index * (NODE_STAGGER * 2),
        ease: EASE_OUT_EXPO,
      }}
    >
      <p
        id={regionId}
        style={{ ...chipStyle, color: treatment.text, borderColor: keyline }}
      >
        {panel.label}
      </p>
      <ul style={listStyle}>
        {panel.lines.map((line, i) => (
          <li key={i} style={rowStyle}>
            <span style={{ ...markerStyle, color: treatment.text }} aria-hidden="true">
              <Marker check={isCheck} />
            </span>
            <span style={{ ...lineTextStyle, fontFamily: mono ? MONO : BODY }}>
              {line}
            </span>
          </li>
        ))}
      </ul>
      {panel.verdict ? (
        <p style={{ ...verdictStyle, color: treatment.text, borderTopColor: keyline }}>
          {panel.verdict}
        </p>
      ) : null}
    </motion.section>
  )
}

/**
 * Minimal inline-SVG markers in currentColor — check (good) vs a "not this"
 * caret (weak). The check is a rising stroke = "yes". The weak marker is a SOLID
 * downward caret = "down / not this": a filled triangle reads as a deliberate
 * negative verdict, not a neutral list bullet, and the up-vs-down filled-vs-
 * stroked shape contrast survives grayscale. Both stay tiny + currentColor.
 */
function Marker({ check }: { check: boolean }) {
  if (check) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7.4 6 10.2 11 3.6" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      {/* downward caret — a filled triangle pointing down: "not this". */}
      <path d="M3.4 4.8h7.2L7 10.4z" />
    </svg>
  )
}

/** sr-only description: name both sides + verdicts so the contrast survives. */
function buildDescription(
  subtitle: string | undefined,
  left: SageComparePanel,
  right: SageComparePanel,
): string {
  const lead = subtitle ?? 'A side-by-side comparison of two options.'
  const side = (p: SageComparePanel): string => {
    const verdict = p.verdict ? ` Verdict: ${p.verdict}` : ''
    return `${p.label}: ${p.lines.join('; ')}.${verdict}`
  }
  return `${lead} Left — ${side(left)} Right — ${side(right)}`
}

const MONO = 'var(--ac-font-mono, ui-monospace, monospace)'
const BODY = 'var(--ac-font-body, system-ui, sans-serif)'

// The query container — the grid below restyles itself based on THIS element's
// inline width via the container query in RESPONSIVE_CSS.
const containerStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  containerType: 'inline-size',
  containerName: 'ac-compare-c',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  // Two equal columns + a slim seam between; the container query collapses this
  // to a single column (and hides the seam) under ~640px of available width.
  gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
  alignItems: 'stretch', // equal-height panels → no reflow, 0 CLS
  gap: 'var(--ac-space-2xs)',
}

/**
 * Self-contained responsive collapse + reduced-motion guard. A container query
 * (not a viewport media query) so the comparison reflows to the width it's
 * actually rendered at — correct inside any column. Under prefers-reduced-motion
 * the panels are forced to their final state with no transform/transition, so the
 * comparison is fully legible and stable with zero motion.
 */
const RESPONSIVE_CSS = `
@container ac-compare-c (max-width: 640px) {
  .ac-compare {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--ac-space-sm);
  }
  /* Seam collapses to a full-width horizontal divider between the stacked
     panels: the rule spans the row's width, the "vs" chip stays centered on it
     and never overlaps panel content. */
  .ac-compare-seam {
    width: 100%;
    height: auto;
    padding: var(--ac-space-3xs) 0;
  }
  .ac-compare-seam-rule {
    top: 50%;
    bottom: auto;
    left: 0;
    right: 0;
    width: auto;
    height: var(--ac-rule-w, 1px);
    transform: translateY(-50%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ac-compare > section {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
`

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ac-space-xs)',
  height: '100%',
  padding: 'var(--ac-space-sm)',
  border: '1px solid',
  borderRadius: 'var(--ac-radius)',
  // willChange kept narrow + only meaningful while animating; framer-motion
  // manages the transform. No layout-bound properties animate.
  contain: 'paint',
}

const chipStyle: React.CSSProperties = {
  alignSelf: 'flex-start',
  margin: 0,
  padding: '0.25rem 0.6rem',
  border: '1px solid',
  borderRadius: 'var(--ac-radius-pill)',
  fontFamily: MONO,
  fontSize: 'var(--ac-step--1, 0.8rem)',
  fontWeight: 600,
  letterSpacing: 'var(--ac-track-label, 0.08em)',
  textTransform: 'uppercase',
}

const listStyle: React.CSSProperties = {
  // flex:1 lets the lines list absorb all vertical slack within the
  // (equal-height) panel, so the verdict footer below it is pinned to a SHARED
  // bottom baseline across both sides even when the two lists wrap to different
  // heights. The footer rules then mirror. No layout animates → 0 CLS.
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ac-space-2xs)',
  margin: 0,
  padding: 0,
  listStyle: 'none',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--ac-space-2xs)',
}

const markerStyle: React.CSSProperties = {
  display: 'inline-flex',
  flex: '0 0 auto',
  marginTop: '0.18em',
}

const lineTextStyle: React.CSSProperties = {
  color: 'var(--ac-ink)',
  fontSize: 'var(--ac-step-0, 1rem)',
  lineHeight: 'var(--ac-leading-body, 1.6)',
}

const verdictStyle: React.CSSProperties = {
  // The flex:1 list above already pushes this to the panel bottom; margin-top
  // auto is the fallback that keeps the verdict pinned even if the list shrinks,
  // so both footer rules sit on a shared baseline across the two panels.
  margin: 'auto 0 0',
  paddingTop: 'var(--ac-space-xs)',
  borderTop: '1px solid',
  fontFamily: MONO,
  fontSize: 'var(--ac-step--1, 0.8rem)',
  fontWeight: 600,
  letterSpacing: 'var(--ac-track-label, 0.04em)',
}

const seamStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Slim, fixed-width gutter so the split reads hard at any container size.
  width: '1.6rem',
}

/**
 * The continuous vertical hairline running the FULL height of the gutter (so it
 * spans both equal-height panels, not just the chip's row). Strengthened from a
 * single faint rule to --ac-rule-strong so the 2-up split reads hard even at
 * scale. On the 1-col collapse this rotates to a horizontal divider (see CSS).
 */
const seamRuleStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: '50%',
  width: 'var(--ac-rule-w, 1px)',
  transform: 'translateX(-50%)',
  background: 'var(--ac-rule-strong)',
}

/**
 * The "vs" token, centered ON the rule. A bordered mono chip with a solid
 * surface background that masks the hairline behind it, so the rule visually
 * "threads through" the chip — making the seam unmistakable without colliding
 * with panel content.
 */
const seamChipStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.2rem 0.4rem',
  border: '1px solid var(--ac-rule-strong)',
  borderRadius: 'var(--ac-radius-pill)',
  background: 'var(--ac-surface)',
  color: 'var(--ac-ink-soft)',
  fontFamily: MONO,
  fontSize: 'var(--ac-step--1, 0.8rem)',
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: 'var(--ac-track-label, 0.08em)',
  textTransform: 'uppercase',
}
