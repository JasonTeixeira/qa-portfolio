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
  FLOW_PULSE_LEN,
  flowDuration,
} from './motion'

/**
 * Dataflow pulse color + intensity per tone. The pulse is a BRIGHT reading of the
 * edge's semantic tone (a lighter, glowing version of its stroke), so the moving
 * light reinforces meaning: blue data on the primary path, red on the attack/
 * blast path, green on the healthy/source-of-truth path. Default supporting wires
 * get a soft accent shimmer so the whole system feels alive without competing.
 */
const FLOW_COLOR: Record<Tone, string> = {
  default: 'var(--ac-accent-text)',
  accent: 'var(--ac-accent-text)',
  warning: 'var(--ac-danger)',
  success: 'var(--ac-mastery)',
  muted: 'var(--ac-ink-faint)',
}
const FLOW_OPACITY: Record<Tone, number> = {
  default: 0.45,
  accent: 0.95,
  warning: 0.95,
  success: 0.9,
  muted: 0.4,
}

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
  /**
   * NARRATION ENGINE hook. When set, the diagram is spotlight-controlled: nodes/
   * edges named here are emphasized (full opacity + their dataflow pulse), all
   * others dim back. Edge keys are `from->to`. Drive it from NarratedDiagram to
   * make the figure explain itself beat-by-beat. Null/undefined = normal mode.
   */
  spotlight?: SpotlightSpec | null
  /**
   * Narrated mode: skip the on-scroll draw-in and render the whole figure at once
   * (the spotlight then carries emphasis, not the reveal). Set by NarratedDiagram.
   */
  instant?: boolean
}

/** What the narration engine emphasizes on a given beat. */
export type SpotlightSpec = { nodes: string[]; edges: string[] }
/** Canonical edge key used by the spotlight (matches `from->to`). */
export const edgeKey = (from: string, to: string) => `${from}->${to}`

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
  spotlight = null,
  instant = false,
}: SageDiagramProps) {
  const reduce = useReducedMotion()
  // Spotlight sets for O(1) membership per element (null = normal, no dimming).
  const spotNodes = React.useMemo(() => (spotlight ? new Set(spotlight.nodes) : null), [spotlight])
  const spotEdges = React.useMemo(() => (spotlight ? new Set(spotlight.edges) : null), [spotlight])
  const DIM = 0.13 // opacity of de-emphasized elements while a spotlight is active
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
  // MARQUEE PROMOTION (blocker #3): the system-map is the lesson's centerpiece,
  // so we never let a small authored `height` shrink it below a hero floor — a
  // too-small cap is clamped up to HERO_MIN_H (still never taller than the laid-
  // out box, so no dead-air / letterboxing). Aspect ratio is owned by the SVG.
  const HERO_MIN_H = 420
  const cappedHeight = height ? Math.min(Math.max(height, HERO_MIN_H), viewH) : undefined
  const renderHeight = cappedHeight
  // Graticule cell in user-space px — a low-contrast instrument grid backdrop so
  // the canvas reads as an instrument panel, not a flat black field. Sized so a
  // typical figure shows ~14-20 columns of ruling.
  const gridId = `grid-${uid}`
  const gridFineId = `gridfine-${uid}`

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
        <defs>
          {/* Instrument GRATICULE — a two-tier ruled grid (fine + coarse) at very
              low contrast so the panel reads as instrumentation, not flat black.
              Pure --ac-rule hairlines; static (no motion); print/RM identical. */}
          <pattern id={gridFineId} width={22} height={22} patternUnits="userSpaceOnUse">
            <path d="M 22 0 L 0 0 0 22" fill="none" stroke="var(--ac-rule)" strokeWidth={0.6} opacity={0.5} />
          </pattern>
          <pattern id={gridId} width={110} height={110} patternUnits="userSpaceOnUse">
            <rect width={110} height={110} fill={`url(#${gridFineId})`} />
            <path d="M 110 0 L 0 0 0 110" fill="none" stroke="var(--ac-rule-strong)" strokeWidth={0.75} opacity={0.55} />
          </pattern>
        </defs>
        <rect
          x={viewX}
          y={viewY}
          width={viewW}
          height={viewH}
          rx="14"
          fill="var(--ac-bg)"
          stroke="var(--ac-rule)"
        />
        {/* graticule fill, inset a hair so it never rides the frame stroke */}
        <rect
          x={viewX + 1}
          y={viewY + 1}
          width={viewW - 2}
          height={viewH - 2}
          rx="13"
          fill={`url(#${gridId})`}
          pointerEvents="none"
        />
        {/* corner registration ticks — a small instrument affordance in each corner */}
        {[
          [viewX + 14, viewY + 14, 1, 1],
          [viewX + viewW - 14, viewY + 14, -1, 1],
          [viewX + 14, viewY + viewH - 14, 1, -1],
          [viewX + viewW - 14, viewY + viewH - 14, -1, -1],
        ].map(([cx, cy, sx, sy], i) => (
          <g key={i} stroke="var(--ac-rule-strong)" strokeWidth={1} opacity={0.7} pointerEvents="none">
            <line x1={cx} y1={cy} x2={cx + 10 * sx} y2={cy} />
            <line x1={cx} y1={cy} x2={cx} y2={cy + 10 * sy} />
          </g>
        ))}

        {/* Edges — draw in along the dagre polyline via stroke-dashoffset. */}
        {layout.edges.map((edge, edgeIndex) => {
          const toneKey: Tone = edge.tone ?? 'default'
          const { stroke, width, opacity } = edgeStyle(edge.tone)
          const dash = dashFor(edge.kind, edge.dashed, toneKey)
          const d = pointsToPath(edge.points)
          const len = pathLength(edge.points)
          const delay = edgeIndex * EDGE_STAGGER
          const animate = !reduce && !dash
          // Narration engine: dim edges outside the current spotlight; only spotlit
          // (or, in normal mode, all) edges carry their dataflow pulse.
          const ek = edgeKey(edge.from, edge.to)
          const edgeDim = spotEdges ? !spotEdges.has(ek) : false
          const pulseOn = !reduce && !edgeDim
          const pulseDelay = instant ? 0 : EDGE_DRAW_DURATION + delay

          return (
            <g key={`${edge.from}-${edge.to}-${edge.label ?? edgeIndex}`}>
              <motion.path
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dash ?? (animate && !instant ? len : undefined)}
                markerEnd={`url(#${arrowId(toneKey, uid)})`}
                {...(instant
                  ? {
                      initial: false as const,
                      animate: { opacity: edgeDim ? DIM : opacity },
                      transition: { duration: 0.4, ease: EASE_OUT_EXPO },
                    }
                  : {
                      opacity,
                      initial: animate ? { strokeDashoffset: len, opacity: 0 } : false,
                      whileInView: animate ? { strokeDashoffset: 0, opacity } : undefined,
                      viewport: { once: true, amount: 0.4 },
                      transition: {
                        duration: reduce ? 0 : EDGE_DRAW_DURATION,
                        delay: reduce ? 0 : delay,
                        ease: EASE_OUT_EXPO,
                      },
                    })}
              />
              {/* Dataflow — after the wire draws in, a bright tone-colored pulse of
                  light travels from source→target along it, looping at constant
                  velocity. Signature Sage motion; skipped under reduced-motion (the
                  static wire + arrowhead already carry direction + meaning). */}
              {pulseOn ? (
                <motion.path
                  d={d}
                  fill="none"
                  stroke={FLOW_COLOR[toneKey]}
                  strokeWidth={Math.max(2, width - 0.5)}
                  strokeLinecap="round"
                  strokeDasharray={`${FLOW_PULSE_LEN} ${len}`}
                  style={{ filter: `drop-shadow(0 0 4px ${FLOW_COLOR[toneKey]})` }}
                  pointerEvents="none"
                  aria-hidden
                  initial={{ strokeDashoffset: FLOW_PULSE_LEN + len, opacity: 0 }}
                  whileInView={{ strokeDashoffset: 0, opacity: FLOW_OPACITY[toneKey] }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{
                    strokeDashoffset: {
                      duration: flowDuration(len),
                      repeat: Infinity,
                      ease: 'linear',
                      delay: pulseDelay,
                    },
                    opacity: { duration: 0.5, delay: pulseDelay },
                  }}
                />
              ) : null}
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
          // Narration engine: nodes outside the spotlight recede.
          const nodeDim = spotNodes ? !spotNodes.has(node.id) : false
          return (
            <motion.g
              key={node.id}
              {...(instant
                ? {
                    initial: false as const,
                    animate: { opacity: nodeDim ? DIM : 1, y: 0, scale: nodeDim ? 1 : spotNodes ? 1.03 : 1 },
                    transition: { duration: 0.4, ease: EASE_OUT_EXPO },
                  }
                : {
                    initial: reduce ? false : { opacity: 0, y: 14 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.4 },
                    transition: {
                      duration: reduce ? 0 : NODE_RISE_DURATION,
                      delay: reduce ? 0 : delay,
                      ease: EASE_OUT_EXPO,
                    },
                  })}
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
