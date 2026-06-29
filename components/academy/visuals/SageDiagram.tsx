'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { type Tone } from './tones'
import { DiagramNode, type DiagramNodeSpec, type DiagramEdgeSpec, type NodeKind, type DiagramEdgeKind } from './diagram-kinds'
import { layoutDiagram, pointsToPath, pathLength, LABEL_PILL_H } from './diagram-layout'
import { edgeStyle, dashFor, arrowId, warningGlowId, EdgeMarkers } from './diagram-edges'
import { VisualFrame, deriveLegend, type LegendItem } from './VisualFrame'
import {
  EASE_OUT_EXPO,
  NODE_STAGGER,
  EDGE_STAGGER,
  EDGE_DRAW_DURATION,
  NODE_RISE_DURATION,
  LABEL_FADE_DURATION,
} from './motion'

/**
 * SageDiagram — the AUTO-LAYOUT system-map renderer for the academy.
 *
 * Authors write a LAYOUT-FREE spec: nodes carry only MEANING (id, label, kind,
 * tone) with NO x/y, and edges carry only (from, to, kind, tone, label). The
 * `@dagrejs/dagre` engine (diagram-layout.ts) computes every position + edge
 * polyline + label anchor, so a diagram is best-in-class BY CONSTRUCTION — no
 * overlaps, no clipping, consistent spacing — with zero per-diagram tuning.
 *
 * The shared system does the rest: node-kind shapes (diagram-kinds), the
 * semantic tone map + auto-legend (tones + VisualFrame), the edge taxonomy +
 * per-tone arrowheads (diagram-edges), the standard frame (VisualFrame), and the
 * house motion language (motion). Edges draw in along flow order; nodes fade up
 * in rank order; prefers-reduced-motion renders the legible final state
 * instantly. a11y: <svg role="img"> + aria-labelledby/describedby; the sr
 * description names the toned path + node roles.
 */

// Re-export the spec types so callers/data layer import from one place.
export type SageDiagramTone = Tone
export type { NodeKind, DiagramEdgeKind, DiagramNodeSpec, DiagramEdgeSpec }
export type SageDiagramNode = DiagramNodeSpec
export type SageDiagramEdge = DiagramEdgeSpec
export type SageDiagramLegendItem = LegendItem

export type SageDiagramProps = {
  title: string
  subtitle?: string
  nodes: DiagramNodeSpec[]
  edges: DiagramEdgeSpec[]
  /** Auto-derived from the non-default tones present when omitted. */
  legend?: LegendItem[]
  /** Flow direction. Default 'LR' (left→right). */
  rankdir?: 'LR' | 'TB' | 'RL' | 'BT'
  caption?: string
  className?: string
  /** Optional rendered height cap; the viewBox aspect is owned by dagre. */
  height?: number
}

// Human-readable role names for the accessible description.
const KIND_ROLE: Record<NodeKind, string> = {
  service: 'service',
  store: 'data store',
  queue: 'queue',
  external: 'external system',
  client: 'client',
  decision: 'decision',
  process: 'process',
}

export function SageDiagram({
  title,
  subtitle,
  nodes,
  edges,
  legend,
  rankdir = 'LR',
  caption,
  className,
  height,
}: SageDiagramProps) {
  const reduce = useReducedMotion()
  const titleId = React.useId()
  const descId = React.useId()
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, '')

  // Run the layout engine once per spec change (pure, memoizable).
  const layout = React.useMemo(
    () => layoutDiagram(nodes, edges, { rankdir }),
    [nodes, edges, rankdir],
  )

  const legendItems = React.useMemo(
    () =>
      deriveLegend(
        [
          ...nodes.map((n) => n.tone),
          ...edges.map((e) => e.tone),
        ],
        legend,
      ),
    [nodes, edges, legend],
  )

  // Accessible description: name the suspect path + blast radius + toned roles so
  // the figure's meaning survives without color or motion.
  const srDescription = React.useMemo(
    () => buildDescription(subtitle, nodes, legendItems),
    [subtitle, nodes, legendItems],
  )

  const { minX: viewX, minY: viewY, width: viewW, height: viewH } = layout
  // Explicit dims from the TIGHT content box = 0 CLS AND no dead-air band: the
  // viewBox starts at the content's real min corner (not 0,0), so the diagram
  // fills its frame top-to-bottom. Cap rendered height if requested while
  // preserving the laid-out aspect ratio.
  const renderHeight = height ? Math.min(height, viewH) : undefined

  return (
    <VisualFrame
      kicker="System map"
      title={title}
      titleId={titleId}
      subtitle={subtitle}
      descId={descId}
      description={srDescription}
      legend={legendItems}
      caption={caption}
      className={className}
    >
      <svg
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
        width="100%"
        height={renderHeight}
        preserveAspectRatio="xMidYMid meet"
        style={{ ...svgStyle, aspectRatio: `${viewW} / ${viewH}` }}
      >
        <EdgeMarkers uid={uid} />
        <rect
          x={viewX}
          y={viewY}
          width={viewW}
          height={viewH}
          rx="16"
          fill="var(--ac-bg)"
          stroke="var(--ac-rule)"
        />

        {/* Edges — draw in along the dagre polyline via stroke-dashoffset. */}
        {layout.edges.map((edge, edgeIndex) => {
          const toneKey: Tone = edge.tone ?? 'default'
          const { stroke, width, opacity } = edgeStyle(edge.tone)
          const dash = dashFor(edge.kind, edge.dashed, toneKey)
          const d = pointsToPath(edge.points)
          const len = pathLength(edge.points)
          const delay = edgeIndex * EDGE_STAGGER
          const animate = !reduce && !dash

          return (
            <g key={`${edge.from}-${edge.to}-${edge.label ?? edgeIndex}`}>
              <motion.path
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dash ?? (animate ? len : undefined)}
                markerEnd={`url(#${arrowId(toneKey, uid)})`}
                opacity={opacity}
                initial={animate ? { strokeDashoffset: len, opacity: 0 } : false}
                whileInView={animate ? { strokeDashoffset: 0, opacity } : undefined}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: reduce ? 0 : EDGE_DRAW_DURATION,
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
                    duration: reduce ? 0 : LABEL_FADE_DURATION,
                    delay: reduce ? 0 : delay + 0.25,
                    ease: EASE_OUT_EXPO,
                  }}
                >
                  <rect
                    x={edge.labelX - edge.labelWidth / 2}
                    y={edge.labelY - LABEL_PILL_H / 2}
                    width={edge.labelWidth}
                    height={LABEL_PILL_H}
                    rx={LABEL_PILL_H / 2}
                    fill="var(--ac-surface)"
                    stroke={toneKey !== 'default' ? stroke : 'var(--ac-rule-strong)'}
                    strokeWidth={toneKey !== 'default' ? 2 : 1.25}
                  />
                  <text
                    x={edge.labelX}
                    y={edge.labelY + 4.5}
                    /* FIX 3 — LABEL LEGIBILITY. Short parenthetical labels (e.g.
                       "indexes (LAGS)") misread at figure scale. Bump to 14.5px
                       and lift the default weight to 600 so the glyphs stay
                       crisp and high-contrast; toned labels go 650. Pill width
                       (LABEL_CHAR_W in diagram-layout) tracks this so clearance
                       logic still holds — text never overflows the pill. */
                    fill={toneKey !== 'default' ? stroke : 'var(--ac-ink-soft)'}
                    fontSize="14.5"
                    fontWeight={toneKey !== 'default' ? 650 : 600}
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

        {/* Nodes — fade up in rank order (opacity + translateY). */}
        {layout.nodes.map((node, nodeIndex) => {
          const delay = nodeIndex * NODE_STAGGER
          return (
            <motion.g
              key={node.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: reduce ? 0 : NODE_RISE_DURATION,
                delay: reduce ? 0 : delay,
                ease: EASE_OUT_EXPO,
              }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <g transform={`translate(${node.x}, ${node.y})`}>
                <DiagramNode
                  kind={node.kind}
                  tone={node.tone ?? 'default'}
                  label={node.label}
                  description={node.description}
                  width={node.width}
                  height={node.height}
                  glowId={warningGlowId(uid)}
                />
              </g>
            </motion.g>
          )
        })}
      </svg>
    </VisualFrame>
  )
}

/** Compose the sr-only description that names the toned path + node roles. */
function buildDescription(
  subtitle: string | undefined,
  nodes: DiagramNodeSpec[],
  legendItems: LegendItem[],
): string {
  const accent = legendItems.find((i) => i.tone === 'accent')?.label
  const warning = legendItems.find((i) => i.tone === 'warning')?.label
  const success = legendItems.find((i) => i.tone === 'success')?.label

  // Name nodes that carry a toned role so the diagnosis survives color removal.
  const tonedNodes = nodes
    .filter((n) => n.tone && n.tone !== 'default')
    .map((n) => `${n.label} (${KIND_ROLE[n.kind ?? 'service']}, ${labelForTone(n.tone)})`)

  const sentences = [
    accent ? `Highlighted edges are ${accent}.` : '',
    warning ? `The blast-radius element (${warning}) is shown in the warning color.` : '',
    success ? `The ${success} is marked in the success color.` : '',
    tonedNodes.length ? `Key nodes: ${tonedNodes.join('; ')}.` : '',
  ].filter(Boolean)

  const lead = subtitle ?? 'Node-and-edge system diagram laid out automatically.'
  return sentences.length ? `${lead} ${sentences.join(' ')}` : lead
}

function labelForTone(tone: Tone | undefined): string {
  switch (tone) {
    case 'accent':
      return 'suspect path'
    case 'warning':
      return 'blast radius'
    case 'success':
      return 'source of truth'
    case 'muted':
      return 'out of scope'
    default:
      return 'supporting'
  }
}

const svgStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  position: 'relative',
  zIndex: 1,
  borderRadius: 'var(--ac-radius)',
  overflow: 'hidden',
}
