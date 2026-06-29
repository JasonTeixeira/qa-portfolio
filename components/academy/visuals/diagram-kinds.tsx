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

export type NodeKind =
  | 'service'
  | 'store'
  | 'queue'
  | 'external'
  | 'client'
  | 'decision'
  | 'process'

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
const MIN_W = 168
const MAX_W = 260
const BASE_H = 84
const LABEL_CHAR_W = 9.2 // ~17px display label advance
const DESC_CHAR_W = 7.2 // ~13px mono description advance (bumped for legibility)
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
      // Diamond.
      return (
        <path
          d={`M 0 ${-hh} L ${hw} 0 L 0 ${hh} L ${-hw} 0 Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
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
  return (
    <g>
      <NodeShell kind={kind} hw={hw} hh={hh} fill={t.fill} stroke={t.stroke} />
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
      <text
        x={0}
        y={(description ? -5 : 6) + labelDy}
        fill={t.text}
        fontSize={16}
        fontWeight={700}
        fontFamily="var(--ac-font-body, system-ui, sans-serif)"
        textAnchor="middle"
      >
        {label}
      </text>
      {description ? (
        <text
          x={0}
          y={17 + labelDy}
          /* AA on the tinted card / dark bg — --ac-ink-soft (oklch 80%), not
             --ac-ink-faint (oklch 64%, fails small-text AA). */
          fill="var(--ac-ink-soft)"
          fontSize={13}
          fontFamily="var(--ac-font-mono, ui-monospace, monospace)"
          textAnchor="middle"
        >
          {description}
        </text>
      ) : null}
    </g>
  )
}
