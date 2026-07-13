/**
 * NODE-KIND renderers + measurement for SageDiagram.
 *
 * Each `kind` is a distinct, standard shape treatment so a node TYPE is readable
 * from its silhouette alone (a store always looks like a store):
 *   - service   → rounded card
 *   - process   → rounded card (squarer corners)
 *   - store     → database cylinder
 *   - queue     → slotted / stacked card
 *   - external  → dashed-border card (outside the system boundary)
 *   - client    → card with a top "tab" (a UI surface)
 *   - decision  → diamond
 *
 * Shapes are tasteful + on-brand: `--ac-*` surfaces, hairlines, and the tone
 * accent for border + text. All sizing comes from `measureNode` so dagre and the
 * renderer agree on geometry (no overlaps, no clipping).
 */

import * as React from 'react'
import { TONES, type Tone } from './tones'
import { ArchIcon, type ArchIconKind } from './arch-icons'

export type NodeKind =
  | 'service'
  | 'store'
  | 'queue'
  | 'external'
  | 'client'
  | 'decision'
  | 'process'

/** Node kind → proprietary Sage glyph. Every card leads with its component icon. */
const NODE_ICON: Record<NodeKind, ArchIconKind> = {
  service: 'service',
  store: 'store',
  queue: 'queue',
  external: 'external',
  client: 'client',
  decision: 'decision',
  process: 'process',
}

/** Concrete outer-glow per tone so a semantic node POPS off the near-black canvas
 *  (drop-shadow needs a concrete color; these track the --ac state hues). */
const TONE_GLOW: Partial<Record<Tone, string>> = {
  accent: 'rgba(61, 90, 254, 0.45)',
  warning: 'rgba(229, 72, 77, 0.42)',
  success: 'rgba(24, 182, 99, 0.40)',
}

export type DiagramNodeSpec = {
  id: string
  label: string
  description?: string
  kind?: NodeKind
  tone?: Tone
}

export type DiagramEdgeKind = 'sync' | 'async' | 'data' | 'control'

export type DiagramEdgeSpec = {
  from: string
  to: string
  label?: string
  kind?: DiagramEdgeKind
  tone?: Tone
  /** Force a dashed stroke independent of kind (kind 'async' is dashed too). */
  dashed?: boolean
}

// Standard node footprint. Width grows with the longer of label/description.
//
// LEGIBILITY: the SVG scales DOWN to the lesson column, so on-screen text size =
// fontSize × (renderedWidth / viewBoxWidth). To make labels read larger at any
// column width we bump the FONT and the per-glyph advance (CHAR_W) + padding +
// box height TOGETHER. dagre reserves the box from measureNode, so a larger box
// means text occupies a larger share of the viewBox → bigger on screen — while
// the box still fully contains the (now wider) text run, so nothing overflows.
const MIN_W = 180
const MAX_W = 280
// Taller so every node carries its proprietary glyph on top + label (+ description)
// with comfortable rhythm. measureNode drives dagre, so spacing adapts.
const BASE_H = 108
// Leading component glyph, centered on top of the label.
const NODE_ICON_SIZE = 30
const LABEL_CHAR_W = 11.0 // ~19px display label advance (font 16→19, ×1.19)
const DESC_CHAR_W = 8.4 // ~15px mono description advance (font 13→15, ×1.15)
const PAD_X = 30
// Diamonds need extra footprint (text inscribed in a rotated square).
const DECISION_SCALE = 1.32

/** Kind-aware measured box dagre reserves and the renderer draws into. */
export function measureNode(
  node: DiagramNodeSpec,
  kind: NodeKind,
): { width: number; height: number } {
  const labelW = node.label.length * LABEL_CHAR_W
  const descW = (node.description?.length ?? 0) * DESC_CHAR_W
  let width = Math.min(MAX_W, Math.max(MIN_W, Math.max(labelW, descW) + PAD_X * 2))
  let height = node.description ? BASE_H : BASE_H - 22

  if (kind === 'store') height += 16 // cylinder caps
  if (kind === 'client') height += 14 // top tab
  if (kind === 'queue') width += 16 // slot rails
  if (kind === 'decision') {
    width = Math.round(width * DECISION_SCALE)
    height = Math.round((node.description ? BASE_H : BASE_H - 10) * DECISION_SCALE)
  }
  return { width, height }
}

type ShapeProps = {
  /** Half-width / half-height (the box is centered on the group origin). */
  hw: number
  hh: number
  fill: string
  stroke: string
}

/** The kind-specific SHELL (background shape). Drawn behind the label. */
function NodeShell({ kind, hw, hh, fill, stroke }: ShapeProps & { kind: NodeKind }) {
  const sw = 2
  switch (kind) {
    case 'store': {
      // Database cylinder: top ellipse + body + bottom curve.
      const ry = Math.min(14, hh * 0.28)
      const top = -hh
      const bottom = hh
      return (
        <g>
          <path
            d={`M ${-hw} ${top + ry}
                A ${hw} ${ry} 0 0 1 ${hw} ${top + ry}
                L ${hw} ${bottom - ry}
                A ${hw} ${ry} 0 0 1 ${-hw} ${bottom - ry}
                Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
          <path
            d={`M ${-hw} ${top + ry} A ${hw} ${ry} 0 0 0 ${hw} ${top + ry}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            opacity={0.85}
          />
        </g>
      )
    }
    case 'queue': {
      // Slotted card: a rounded card with two vertical rails (a buffer).
      const railX = hw - 12
      return (
        <g>
          <rect
            x={-hw}
            y={-hh}
            width={hw * 2}
            height={hh * 2}
            rx={10}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line x1={-railX} y1={-hh} x2={-railX} y2={hh} stroke={stroke} strokeWidth={1.25} opacity={0.6} />
          <line x1={railX} y1={-hh} x2={railX} y2={hh} stroke={stroke} strokeWidth={1.25} opacity={0.6} />
        </g>
      )
    }
    case 'external': {
      // Outside the system boundary → dashed border.
      return (
        <rect
          x={-hw}
          y={-hh}
          width={hw * 2}
          height={hh * 2}
          rx={14}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          strokeDasharray="7 6"
        />
      )
    }
    case 'client': {
      // A UI surface → card with a top tab bar.
      const tabH = 14
      return (
        <g>
          <rect
            x={-hw}
            y={-hh + tabH}
            width={hw * 2}
            height={hh * 2 - tabH}
            rx={12}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
          <rect
            x={-hw}
            y={-hh}
            width={hw * 2}
            height={tabH + 10}
            rx={12}
            fill={stroke}
            opacity={0.16}
          />
          <line x1={-hw} y1={-hh + tabH} x2={hw} y2={-hh + tabH} stroke={stroke} strokeWidth={1} opacity={0.5} />
        </g>
      )
    }
    case 'decision': {
      // Decision GATE — a diamond with an inset hairline diamond so it reads as a
      // distinct routing/branch instrument, not just another card silhouette.
      const inset = 0.82
      return (
        <g>
          <path
            d={`M 0 ${-hh} L ${hw} 0 L 0 ${hh} L ${-hw} 0 Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
          <path
            d={`M 0 ${-hh * inset} L ${hw * inset} 0 L 0 ${hh * inset} L ${-hw * inset} 0 Z`}
            fill="none"
            stroke={stroke}
            strokeWidth={1}
            opacity={0.4}
          />
        </g>
      )
    }
    case 'process':
      return (
        <rect
          x={-hw}
          y={-hh}
          width={hw * 2}
          height={hh * 2}
          rx={6}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      )
    case 'service':
    default:
      return (
        <rect
          x={-hw}
          y={-hh}
          width={hw * 2}
          height={hh * 2}
          rx={14}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      )
  }
}

/** A fully rendered node: kind shell + optional blast-radius glow + label. */
export function DiagramNode({
  kind,
  tone,
  label,
  description,
  width,
  height,
  glowId,
}: {
  kind: NodeKind
  tone: Tone
  label: string
  description?: string
  width: number
  height: number
  /** FIX 4 — gradient id for the warning (blast-radius) inner glow, if any. */
  glowId?: string
}) {
  const t = TONES[tone]
  const hw = width / 2
  const hh = height / 2
  // Client nodes carry a top tab; nudge text down so it sits in the body.
  const labelDy = kind === 'client' ? 4 : 0
  // FIX 4 — BLAST-RADIUS EMPHASIS (general): any warning-toned node gets an inner
  // danger glow. A rounded rect inset from the node's half-extents holds the
  // radial wash, layered above the shell fill and below the label, so the danger
  // semantics read harder while AA label contrast is preserved. Inset keeps the
  // glow inside every kind's silhouette (cylinder/diamond included) — it never
  // bleeds past the shell stroke. Static fill → no motion, print/RM identical.
  const showGlow = tone === 'warning' && Boolean(glowId)
  const glowInset = 4
  // The diamond IS its own glyph; every other kind leads with its component icon
  // centered on top of the label.
  const showIcon = kind !== 'decision'
  const iconY = -hh + 14
  const labelY = (showIcon ? (description ? 12 : 18) : description ? -6 : 6) + labelDy
  const descY = (showIcon ? 34 : 20) + labelDy
  // Concrete outer glow so a semantic node pops off the canvas (toned only).
  const glow = TONE_GLOW[tone]
  return (
    <g>
      <g style={glow ? { filter: `drop-shadow(0 0 9px ${glow})` } : undefined}>
        <NodeShell kind={kind} hw={hw} hh={hh} fill={t.fill} stroke={t.stroke} />
      </g>
      {showGlow ? (
        <rect
          x={-hw + glowInset}
          y={-hh + glowInset}
          width={hw * 2 - glowInset * 2}
          height={hh * 2 - glowInset * 2}
          rx={12}
          fill={`url(#${glowId})`}
          pointerEvents="none"
        />
      ) : null}
      {showIcon ? (
        <g transform={`translate(${-NODE_ICON_SIZE / 2} ${iconY})`} style={{ color: t.stroke }}>
          <ArchIcon kind={NODE_ICON[kind]} size={NODE_ICON_SIZE} strokeWidth={1.6} />
        </g>
      ) : null}
      {/* INSTRUMENT LABEL — monospace, uppercase-tracked so a node reads as a
          labeled instrument cell, not a soft card. ≥16px in user-space (scales to
          ≥13px on-screen at the lesson column width) with heavy weight for crisp
          glyphs on the tinted fill. */}
      <text
        x={0}
        y={labelY}
        fill={t.text}
        fontSize={17}
        fontWeight={650}
        letterSpacing={0.3}
        fontFamily="var(--ac-font-mono, ui-monospace, monospace)"
        textAnchor="middle"
      >
        {label}
      </text>
      {description ? (
        <text
          x={0}
          y={descY}
          /* AA on the tinted card / dark bg — --ac-ink-soft (oklch 80%). */
          fill="var(--ac-ink-soft)"
          fontSize={13.5}
          fontFamily="var(--ac-font-mono, ui-monospace, monospace)"
          textAnchor="middle"
        >
          {description}
        </text>
      ) : null}
    </g>
  )
}
