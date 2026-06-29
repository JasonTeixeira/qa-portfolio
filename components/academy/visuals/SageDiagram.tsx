'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * SageDiagram — a zero-dependency, custom-SVG node/edge diagram renderer.
 *
 * Copied-in (self-contained) from the Sage Design OS `mermaid-diagram` block and
 * re-tokenized to the academy's editorial dark-luxury `--ac-*` system. Every
 * hardcoded color from the source (`#f7f2e8`, the `rgba(247,242,232,…)` washes,
 * the per-tone teal/lime/coral fills) is re-pointed to a semantic academy token:
 *   - ink / labels      → var(--ac-ink) / var(--ac-ink-soft) / var(--ac-ink-faint)
 *   - canvas + node fill → var(--ac-bg) / var(--ac-surface) + accent/state washes
 *     via color-mix() against the surface
 *   - hairlines / edges  → var(--ac-rule) / var(--ac-rule-strong)
 *   - accent tone        → var(--ac-accent) / var(--ac-accent-text)
 *   - success/warning    → var(--ac-mastery) / var(--ac-danger) (the state ramp)
 *
 * Motion: edges draw in (stroke-dashoffset) and nodes fade-up in order, on a
 * compositor-only path (opacity + transform). Under prefers-reduced-motion the
 * diagram renders in its final state instantly — the meaning is the structure,
 * never the motion. a11y: <figure>/<svg role="img"> carry an accessible
 * title + description; nodes/edges are decorative SVG under that label.
 */

export type SageDiagramTone = 'default' | 'accent' | 'success' | 'warning'

// Kept for back-compat; node tone is the same closed set as edge tone.
export type SageDiagramNodeTone = SageDiagramTone

export type SageDiagramNode = {
  id: string
  label: string
  description?: string
  x: number
  y: number
  tone?: SageDiagramTone
}

export type SageDiagramEdge = {
  from: string
  to: string
  label?: string
  dashed?: boolean
  /**
   * Semantic edge color. The toned edges carry the diagnosis: an `accent` or
   * `warning` edge is the suspect path / blast radius and is drawn heavier so it
   * pops out of the default-gray graph. Independent of `dashed` (they combine).
   */
  tone?: SageDiagramTone
}

export type SageDiagramLegendItem = {
  tone: SageDiagramTone
  label: string
}

export type SageDiagramProps = {
  title: string
  subtitle?: string
  nodes: SageDiagramNode[]
  edges: SageDiagramEdge[]
  /**
   * Optional legend rows. When omitted, a legend is auto-derived from the set of
   * non-default edge/node tones actually present, with sensible default labels.
   * The legend renders only when at least one tone is in use.
   */
  legend?: SageDiagramLegendItem[]
  className?: string
  height?: number
}

// Semantic token map per tone. Fills are an accent/state WASH mixed into the
// surface via color-mix() so the node reads as a tinted card, not a flat block.
const NODE_TONE: Record<
  SageDiagramNodeTone,
  { fill: string; stroke: string; text: string }
> = {
  default: {
    fill: 'color-mix(in oklch, var(--ac-surface) 86%, var(--ac-ink) 14%)',
    stroke: 'var(--ac-rule-strong)',
    text: 'var(--ac-ink)',
  },
  accent: {
    fill: 'color-mix(in oklch, var(--ac-surface) 82%, var(--ac-accent) 18%)',
    stroke: 'var(--ac-accent)',
    text: 'var(--ac-accent-text)',
  },
  success: {
    fill: 'color-mix(in oklch, var(--ac-surface) 84%, var(--ac-mastery) 16%)',
    stroke: 'var(--ac-mastery)',
    text: 'var(--ac-mastery)',
  },
  warning: {
    fill: 'color-mix(in oklch, var(--ac-surface) 84%, var(--ac-danger) 16%)',
    stroke: 'var(--ac-danger)',
    text: 'var(--ac-danger)',
  },
}

// Edge color + stroke weight per tone. Default uses --ac-rule-strong (a real
// hairline, not a faint wash) raised to ~2.25 so every supporting flow (incl.
// long faint diagonals like "queries") reads clearly against the dark panel.
// The semantic tones pull their hue from the academy state ramp and draw
// HEAVIER so the suspect path and blast radius pop out of the graph on their
// own; `warning` (the blast-radius edge) is the single heaviest stroke because
// it is conceptually the most important edge in the diagram.
const EDGE_TONE: Record<SageDiagramTone, { stroke: string; width: number }> = {
  default: { stroke: 'var(--ac-ink-faint)', width: 2.25 },
  accent: { stroke: 'var(--ac-accent)', width: 3.25 },
  warning: { stroke: 'var(--ac-danger)', width: 4 },
  success: { stroke: 'var(--ac-mastery)', width: 3 },
}

// Default legend copy, derived from which tones are present when no explicit
// `legend` prop is passed. Tuned to the academy's diagnosis vocabulary.
const DEFAULT_LEGEND_LABEL: Record<SageDiagramTone, string> = {
  accent: 'on the suspect path',
  warning: 'blast radius',
  success: 'source of truth',
  default: 'supporting flow',
}

// Stable legend ordering: suspect path → blast radius → source of truth.
const TONE_ORDER: SageDiagramTone[] = ['accent', 'warning', 'success', 'default']

const VIEW_W = 1080
// viewBox height cropped to the tightened two-row layout (top row ~y110, bottom
// row ~y300, node half-height 46) so the write path and the index/read cluster
// read as one connected system without a dead band below them.
const VIEW_H = 420
const LABEL_PILL_H = 26
const LABEL_PAD_X = 14 // horizontal padding inside the label pill
const LABEL_CHAR_W = 7.1 // approx advance width of the 12px mono glyph
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

// Node box half-extents (the rect drawn at each node is 200×92, centered).
const NODE_HALF_W = 100
const NODE_HALF_H = 46
// Clearance kept between a label pill and any node box it would otherwise touch.
const LABEL_NODE_GAP = 8

function deriveLegend(
  nodes: SageDiagramNode[],
  edges: SageDiagramEdge[],
  explicit?: SageDiagramLegendItem[],
): SageDiagramLegendItem[] {
  if (explicit && explicit.length > 0) return explicit
  const present = new Set<SageDiagramTone>()
  for (const node of nodes) {
    if (node.tone && node.tone !== 'default') present.add(node.tone)
  }
  for (const edge of edges) {
    if (edge.tone && edge.tone !== 'default') present.add(edge.tone)
  }
  return TONE_ORDER.filter((tone) => present.has(tone)).map((tone) => ({
    tone,
    label: DEFAULT_LEGEND_LABEL[tone],
  }))
}

// Clamp a pill's center-x so the rounded background + text stay inside the
// viewBox (no clipping / truncation of labels like "indexes (LAGS)").
function clampLabelX(centerX: number, halfWidth: number): number {
  const margin = 6
  const min = halfWidth + margin
  const max = VIEW_W - halfWidth - margin
  if (min > max) return VIEW_W / 2
  return Math.min(Math.max(centerX, min), max)
}

// Clamp a pill's center-y so the rounded background stays inside the viewBox.
function clampLabelY(centerY: number, halfHeight: number): number {
  const margin = 6
  const min = halfHeight + margin
  const max = VIEW_H - halfHeight - margin
  if (min > max) return VIEW_H / 2
  return Math.min(Math.max(centerY, min), max)
}

// True when a label pill centered at (cx,cy) would overlap a node's box.
// The node box is the 200×92 rect centered on the node, padded by the desired
// clearance. AABB-vs-AABB test (both pill and box are axis-aligned).
function pillOverlapsNode(
  cx: number,
  cy: number,
  halfW: number,
  halfH: number,
  node: SageDiagramNode,
): boolean {
  const dx = Math.abs(cx - node.x)
  const dy = Math.abs(cy - node.y)
  return (
    dx < halfW + NODE_HALF_W + LABEL_NODE_GAP &&
    dy < halfH + NODE_HALF_H + LABEL_NODE_GAP
  )
}

// Place an edge's label pill so it never sits on top of either endpoint node.
// Default: centered on the edge midpoint. When that would overlap a node
// (typical for short same-row edges where the centered pill spills into a box),
// offset the pill PERPENDICULAR to the edge — trying above first, then below —
// and pick the first clear, in-bounds side. Everything is clamped to the
// viewBox so the pill is always fully padded and never truncates.
function placeLabel(
  start: { x: number; y: number },
  end: { x: number; y: number },
  halfW: number,
  from: SageDiagramNode,
  to: SageDiagramNode,
): { cx: number; cy: number } {
  const halfH = LABEL_PILL_H / 2
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  const overlaps = (cx: number, cy: number): boolean =>
    pillOverlapsNode(cx, cy, halfW, halfH, from) ||
    pillOverlapsNode(cx, cy, halfW, halfH, to)

  // First choice: centered on the edge.
  let cx = clampLabelX(midX, halfW)
  let cy = clampLabelY(midY, halfH)
  if (!overlaps(cx, cy)) return { cx, cy }

  // Perpendicular unit vector to the edge direction.
  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.hypot(dx, dy) || 1
  const perpX = -dy / len
  const perpY = dx / len

  // Push out far enough to clear the taller of the two collisions, in steps.
  const baseShift = halfH + NODE_HALF_H + LABEL_NODE_GAP + 6
  for (let step = 1; step <= 4; step++) {
    const shift = baseShift + (step - 1) * 18
    for (const sign of [-1, 1] as const) {
      const tryCx = clampLabelX(midX + perpX * shift * sign, halfW)
      const tryCy = clampLabelY(midY + perpY * shift * sign, halfH)
      if (!overlaps(tryCx, tryCy)) return { cx: tryCx, cy: tryCy }
    }
  }

  // Fallback: the largest clear push we found direction-wise (above bias).
  cx = clampLabelX(midX + perpX * baseShift * -1, halfW)
  cy = clampLabelY(midY + perpY * baseShift * -1, halfH)
  return { cx, cy }
}

export function SageDiagram({
  title,
  subtitle,
  nodes,
  edges,
  legend,
  className,
  height = 420,
}: SageDiagramProps) {
  const reduce = useReducedMotion()
  const titleId = React.useId()
  const descId = React.useId()
  // One safe id stem; per-tone marker ids derive from it so each arrowhead can
  // carry its edge color (marker fill cannot inherit the line's stroke).
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const nodeMap = React.useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes],
  )
  const legendItems = React.useMemo(
    () => deriveLegend(nodes, edges, legend),
    [nodes, edges, legend],
  )
  const arrowId = (tone: SageDiagramTone) => `arrow-${tone}-${uid}`

  // Accessible description: name the suspect path + blast radius so the figure's
  // meaning survives without color or motion.
  const accentLabel = legendItems.find((item) => item.tone === 'accent')?.label
  const warningLabel = legendItems.find((item) => item.tone === 'warning')?.label
  const successLabel = legendItems.find((item) => item.tone === 'success')?.label
  const semanticSentence = [
    accentLabel ? `Highlighted edges are ${accentLabel}.` : '',
    warningLabel ? `The blast-radius edge (${warningLabel}) is drawn in the warning color.` : '',
    successLabel ? `The ${successLabel} is marked in the success color.` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const srDescription = subtitle
    ? `${subtitle}${semanticSentence ? ` ${semanticSentence}` : ''}`
    : `Node-and-edge system diagram.${semanticSentence ? ` ${semanticSentence}` : ''}`

  return (
    <figure
      className={className}
      style={shellStyle}
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div style={headerStyle}>
        <p style={kickerStyle}>System map</p>
        <h2 id={titleId} style={titleStyle}>
          {title}
        </h2>
        {subtitle ? <p style={subtitleStyle}>{subtitle}</p> : null}
        {/* Accessible description carries the visible subtitle PLUS the suspect
            path / blast-radius semantics, so the figure reads identically with
            color and motion stripped. */}
        <p id={descId} style={srOnlyStyle}>
          {srDescription}
        </p>
        {legendItems.length > 0 ? (
          <ul style={legendRowStyle} aria-hidden="true">
            {legendItems.map((item) => (
              <li key={item.tone} style={legendItemStyle}>
                <span
                  style={{
                    ...legendSwatchStyle,
                    background: EDGE_TONE[item.tone].stroke,
                  }}
                />
                <span style={legendLabelStyle}>{item.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <svg
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height={height}
        style={svgStyle}
      >
        <defs>
          {/* One arrowhead marker per tone so direction reads in the edge's own
              color (SVG markers cannot inherit the line's stroke). */}
          {TONE_ORDER.map((tone) => (
            <marker
              key={tone}
              id={arrowId(tone)}
              markerWidth="13"
              markerHeight="13"
              refX="9.5"
              refY="6"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M2 1.5 L11 6 L2 10.5 Z" fill={EDGE_TONE[tone].stroke} />
            </marker>
          ))}
        </defs>
        <rect
          x="0"
          y="0"
          width={VIEW_W}
          height={VIEW_H}
          rx="20"
          fill="var(--ac-bg)"
          stroke="var(--ac-rule)"
        />

        {/* Edges — draw in via stroke-dashoffset (compositor-friendly). */}
        {edges.map((edge, edgeIndex) => {
          const from = nodeMap.get(edge.from)
          const to = nodeMap.get(edge.to)
          if (!from || !to) return null

          const start = edgePoint(from, to)
          const end = edgePoint(to, from)
          const len = Math.hypot(end.x - start.x, end.y - start.y)
          const delay = edgeIndex * 0.08
          const toneKey = edge.tone ?? 'default'
          const edgeTone = EDGE_TONE[toneKey]
          const isToned = toneKey !== 'default'
          // Dash pattern scales with weight so dashed toned edges still read.
          const dashPattern = edge.dashed ? '9 7' : undefined

          // Label pill sized to the text so it never clips, then placed so it
          // clears BOTH endpoint nodes (offset perpendicular to the edge when a
          // centered pill would overlap a box — the "indexes (LAGS)" case) and
          // clamped inside the viewBox so long labels never truncate.
          const labelText = edge.label ?? ''
          const pillW = Math.max(
            56,
            labelText.length * LABEL_CHAR_W + LABEL_PAD_X * 2,
          )
          const { cx: pillCx, cy: pillCy } = placeLabel(
            start,
            end,
            pillW / 2,
            from,
            to,
          )

          return (
            <g key={`${edge.from}-${edge.to}-${edge.label ?? 'edge'}`}>
              <motion.line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={edgeTone.stroke}
                strokeWidth={edgeTone.width}
                strokeLinecap="round"
                strokeDasharray={
                  edge.dashed ? dashPattern : reduce ? undefined : len
                }
                markerEnd={`url(#${arrowId(toneKey)})`}
                opacity={isToned ? 1 : 0.92}
                initial={
                  reduce || edge.dashed
                    ? false
                    : { strokeDashoffset: len, opacity: 0 }
                }
                whileInView={
                  reduce || edge.dashed
                    ? undefined
                    : { strokeDashoffset: 0, opacity: isToned ? 1 : 0.92 }
                }
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: reduce ? 0 : 0.7,
                  delay: reduce ? 0 : delay,
                  ease: EASE_OUT_EXPO,
                }}
              />
              {edge.label ? (
                <motion.g
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: reduce ? 0 : 0.4,
                    delay: reduce ? 0 : delay + 0.25,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <rect
                    x={pillCx - pillW / 2}
                    y={pillCy - LABEL_PILL_H / 2}
                    width={pillW}
                    height={LABEL_PILL_H}
                    rx={LABEL_PILL_H / 2}
                    fill="var(--ac-surface)"
                    stroke={isToned ? edgeTone.stroke : 'var(--ac-rule-strong)'}
                    strokeWidth={isToned ? 1.5 : 1}
                  />
                  <text
                    x={pillCx}
                    y={pillCy + 4}
                    fill={isToned ? edgeTone.stroke : 'var(--ac-ink)'}
                    fontSize="12"
                    fontWeight={isToned ? 600 : 500}
                    fontFamily="var(--ac-font-mono, ui-monospace, monospace)"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </motion.g>
              ) : null}
            </g>
          )
        })}

        {/* Nodes — fade-up in order (opacity + translateY). */}
        {nodes.map((node, nodeIndex) => {
          const tone = NODE_TONE[node.tone ?? 'default']
          const delay = nodeIndex * 0.07

          return (
            <motion.g
              key={node.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: reduce ? 0 : 0.55,
                delay: reduce ? 0 : delay,
                ease: EASE_OUT_EXPO,
              }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <g transform={`translate(${node.x}, ${node.y})`}>
                <rect
                  x="-100"
                  y="-46"
                  width="200"
                  height="92"
                  rx="14"
                  fill={tone.fill}
                  stroke={tone.stroke}
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y={node.description ? -7 : 6}
                  fill={tone.text}
                  fontSize="18"
                  fontWeight="700"
                  fontFamily="var(--ac-font-body, system-ui, sans-serif)"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
                {node.description ? (
                  <text
                    x="0"
                    y="20"
                    fill="var(--ac-ink-soft)"
                    fontSize="12"
                    fontFamily="var(--ac-font-mono, ui-monospace, monospace)"
                    textAnchor="middle"
                  >
                    {node.description}
                  </text>
                ) : null}
              </g>
            </motion.g>
          )
        })}
      </svg>
    </figure>
  )
}

// Clip an edge endpoint to the node's box edge so the arrow stops at the border.
function edgePoint(from: SageDiagramNode, to: SageDiagramNode) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const scale = Math.max(Math.abs(dx) / 106, Math.abs(dy) / 52, 1)
  return { x: from.x + dx / scale, y: from.y + dy / scale }
}

const shellStyle: React.CSSProperties = {
  margin: '2.5rem 0',
  border: '1px solid var(--ac-rule)',
  borderRadius: 'var(--ac-radius-lg)',
  padding: 'var(--ac-space-md)',
  background: 'var(--ac-surface)',
  boxShadow: 'var(--ac-elev-1)',
  color: 'var(--ac-ink)',
}

const headerStyle: React.CSSProperties = {
  padding: '0.25rem 0.25rem 1.1rem',
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
  maxWidth: '60ch',
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

const svgStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  borderRadius: 'var(--ac-radius)',
  overflow: 'hidden',
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
