/**
 * The shared FRAME for every academy visual.
 *
 * The standard `<figure>`: kicker + serif title + subtitle + auto-legend + the
 * visual itself + optional caption — on a dark surface with a hairline, soft
 * elevation, and tasteful grain. Extracted so SageDiagram, SageViz, and future
 * components are instantly recognizable as one system (not a one-off).
 *
 * a11y: the figure is `aria-labelledby` (title) + `aria-describedby` (an
 * sr-only description the caller supplies, which names the toned path so meaning
 * survives without color or motion). The legend is `aria-hidden` (decorative —
 * the description carries the same information in prose).
 */

import * as React from 'react'
import { TONES, DEFAULT_LEGEND_LABEL, TONE_ORDER, isToned, type Tone } from './tones'

export type LegendItem = {
  tone: Tone
  label: string
}

export type VisualFrameProps = {
  /** Mono eyebrow above the title (e.g. "System map", "Chart"). */
  kicker: string
  title: string
  titleId: string
  subtitle?: string
  /** sr-only description id — the caller renders the description text as a child. */
  descId: string
  /** The accessible description (carries the toned-path semantics in prose). */
  description: string
  legend?: LegendItem[]
  caption?: string
  className?: string
  children: React.ReactNode
}

export function VisualFrame({
  kicker,
  title,
  titleId,
  subtitle,
  descId,
  description,
  legend,
  caption,
  className,
  children,
}: VisualFrameProps) {
  return (
    <figure
      className={className ? `ac-grain ${className}` : 'ac-grain'}
      style={shellStyle}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div style={headerStyle}>
        <p style={kickerStyle}>{kicker}</p>
        <h2 id={titleId} style={titleStyle}>
          {title}
        </h2>
        {subtitle ? <p style={subtitleStyle}>{subtitle}</p> : null}
        {/* sr-only: visible subtitle PLUS toned-path semantics, so the figure
            reads identically with color + motion stripped. */}
        <p id={descId} style={srOnlyStyle}>
          {description}
        </p>
        {legend && legend.length > 0 ? (
          <ul style={legendRowStyle} aria-hidden="true">
            {legend.map((item) => (
              <li key={item.tone} style={legendItemStyle}>
                <span
                  style={{
                    ...legendSwatchStyle,
                    background: TONES[item.tone].stroke,
                  }}
                />
                <span style={legendLabelStyle}>{item.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {children}
      {caption ? <figcaption style={captionStyle}>{caption}</figcaption> : null}
    </figure>
  )
}

/**
 * Derive the legend from the non-default tones actually present (across nodes
 * AND edges), unless an explicit legend is supplied. Renders nothing when no
 * tones are in use. Shared so every visual auto-legends identically.
 */
export function deriveLegend(
  tones: Iterable<Tone | undefined>,
  explicit?: LegendItem[],
): LegendItem[] {
  if (explicit && explicit.length > 0) return explicit
  const present = new Set<Tone>()
  for (const tone of tones) {
    if (isToned(tone)) present.add(tone as Tone)
  }
  return TONE_ORDER.filter((t) => present.has(t)).map((tone) => ({
    tone,
    label: DEFAULT_LEGEND_LABEL[tone],
  }))
}

const shellStyle: React.CSSProperties = {
  position: 'relative',
  margin: '2.5rem 0',
  border: '1px solid var(--ac-rule)',
  borderRadius: 'var(--ac-radius-lg)',
  padding: 'var(--ac-space-md)',
  background: 'var(--ac-surface)',
  boxShadow: 'var(--ac-elev-2)',
  color: 'var(--ac-ink)',
  overflow: 'hidden',
}

const headerStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  // Tightened bottom pad (1.1rem → 0.7rem) so the diagram sits directly under
  // the legend row — no fixed gap stacking on top of the SVG's own top margin.
  padding: '0.25rem 0.25rem 0.7rem',
}

const kickerStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--ac-accent-text)',
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: 'var(--ac-step--1, 0.8rem)',
  letterSpacing: 'var(--ac-track-label, 0.12em)',
  textTransform: 'uppercase',
}

const titleStyle: React.CSSProperties = {
  margin: '0.4rem 0 0',
  fontFamily: 'var(--ac-font-display, Georgia, serif)',
  fontSize: 'var(--ac-step-3, 1.85rem)',
  letterSpacing: 'var(--ac-track-display, -0.022em)',
  lineHeight: 'var(--ac-leading-snug, 1.3)',
  color: 'var(--ac-ink)',
}

const subtitleStyle: React.CSSProperties = {
  maxWidth: '64ch',
  margin: '0.55rem 0 0',
  color: 'var(--ac-ink-soft)',
  fontSize: 'var(--ac-step-0, 1rem)',
  lineHeight: 'var(--ac-leading-body, 1.62)',
}

const legendRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem 1.15rem',
  listStyle: 'none',
  margin: '0.85rem 0 0',
  padding: 0,
}

const legendItemStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45rem',
}

const legendSwatchStyle: React.CSSProperties = {
  width: 18,
  height: 4,
  borderRadius: 999,
  flex: '0 0 auto',
}

const legendLabelStyle: React.CSSProperties = {
  color: 'var(--ac-ink-soft)',
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: 'var(--ac-step--1, 0.8rem)',
  letterSpacing: 'var(--ac-track-label, 0.04em)',
}

const captionStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  margin: '1rem 0.25rem 0',
  color: 'var(--ac-ink-faint)',
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: 'var(--ac-step--1, 0.8rem)',
  lineHeight: 'var(--ac-leading-body, 1.5)',
}

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}
