import type { ReactNode } from 'react'
import { DiagGlyph, type GlyphKind } from './glyphs'

/**
 * SVG diagram primitives — server-safe (no client JS). All motion is CSS-driven
 * (stroke-dashoffset via .ag-dashflow, opacity via .ag-pulse) and killed by the
 * global prefers-reduced-motion guard in agency.css.
 *
 * Coordinate contract: primitives operate in SVG user space. DiagFrame renders
 * a 1000×560 viewBox; SystemDiagram converts its 100×56 spec space by ×10.
 */

export type DiagAccent = 'primary' | 'ai' | 'browser' | 'pass' | 'log' | 'fail'
export type DiagNodeSize = 'sm' | 'md' | 'lg'
export type DiagPinKind = 'hazard' | 'artifact'

export const DIAG_ACCENT: Record<DiagAccent, string> = {
  primary: 'var(--acc-primary)',
  ai: 'var(--acc-ai)',
  browser: 'var(--acc-browser)',
  pass: 'var(--acc-pass)',
  log: 'var(--acc-log)',
  fail: 'var(--acc-fail)',
}

interface NodeDims {
  w: number
  h: number
  glyph: number
  labelSize: number
  subSize: number
}

export const NODE_DIMS: Record<DiagNodeSize, NodeDims> = {
  sm: { w: 118, h: 74, glyph: 24, labelSize: 12, subSize: 10 },
  md: { w: 150, h: 90, glyph: 30, labelSize: 13, subSize: 10.5 },
  lg: { w: 180, h: 102, glyph: 34, labelSize: 14, subSize: 11 },
}

interface Point {
  x: number
  y: number
}

/* ---------- DiagFrame ---------- */

/**
 * Responsive frame: full-width 30px-grid panel (grid drawn in CSS on .ag-diag)
 * with the diagram svg rendered at a fixed height and centered. Below 720px
 * the panel horizontally scrolls so labels never shrink illegibly.
 * Decorative: aria-hidden — pair with a visually-hidden summary.
 */
export function DiagFrame({
  uid,
  children,
  viewW = 1000,
  viewH = 560,
}: {
  uid: string
  children: ReactNode
  viewW?: number
  viewH?: number
}) {
  const glowId = `${uid}-glow`
  return (
    <div className="ag-diag" aria-hidden="true">
      <svg
        className="ag-diag-svg"
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        focusable="false"
      >
        <defs>
          {/* Soft accent glow — blurred duplicate strokes reference this filter. */}
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          </filter>
        </defs>
        {children}
      </svg>
    </div>
  )
}

/* ---------- DiagNode ---------- */

/**
 * A glowing schematic node: accent-stroked tile, glyph, mono label, optional
 * sublabel and pulse ring. Glow = blurred duplicate rect via the frame filter.
 */
export function DiagNode({
  uid,
  x,
  y,
  glyph,
  label,
  sublabel,
  accent,
  size = 'md',
  pulse = false,
}: {
  uid: string
  x: number
  y: number
  glyph: GlyphKind
  label: string
  sublabel?: string
  accent: DiagAccent
  size?: DiagNodeSize
  pulse?: boolean
}) {
  const dims = NODE_DIMS[size]
  const color = DIAG_ACCENT[accent]
  const left = -dims.w / 2
  const top = -dims.h / 2
  const glyphY = top + 10
  const labelY = sublabel ? dims.h / 2 - 26 : dims.h / 2 - 18
  const subY = dims.h / 2 - 11

  return (
    <g transform={`translate(${x} ${y})`} style={{ color }}>
      {/* glow halo */}
      <rect
        x={left}
        y={top}
        width={dims.w}
        height={dims.h}
        rx={3}
        fill="none"
        stroke={color}
        strokeWidth={3}
        opacity={0.5}
        filter={`url(#${uid}-glow)`}
      />
      {/* optional pulse ring (opacity keyframes only — compositor friendly) */}
      {pulse ? (
        <rect
          className="ag-pulse"
          x={left - 6}
          y={top - 6}
          width={dims.w + 12}
          height={dims.h + 12}
          rx={5}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          opacity={0.55}
        />
      ) : null}
      {/* tile */}
      <rect
        x={left}
        y={top}
        width={dims.w}
        height={dims.h}
        rx={3}
        fill="var(--ag-card)"
        stroke={color}
        strokeWidth={1.4}
      />
      {/* faint accent wash so the tile reads charged, not flat */}
      <rect
        x={left}
        y={top}
        width={dims.w}
        height={dims.h}
        rx={3}
        fill={color}
        opacity={0.07}
      />
      {/* corner tick — schematic registration mark */}
      <path
        d={`M${left + 1.5} ${top + 9} v-7.5 h7.5`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0.9}
      />
      <DiagGlyph kind={glyph} x={-dims.glyph / 2} y={glyphY} size={dims.glyph} />
      <text
        x={0}
        y={labelY}
        textAnchor="middle"
        fill="var(--tx)"
        fontFamily="var(--f-mono)"
        fontSize={dims.labelSize}
        fontWeight={600}
        letterSpacing="0.08em"
      >
        {label.toUpperCase()}
      </text>
      {sublabel ? (
        <text
          x={0}
          y={subY}
          textAnchor="middle"
          fill="var(--tx-3)"
          fontFamily="var(--f-mono)"
          fontSize={dims.subSize}
          letterSpacing="0.05em"
        >
          {sublabel}
        </text>
      ) : null}
    </g>
  )
}

/* ---------- DiagEdge ---------- */

function edgePath(from: Point, to: Point, curved: boolean, bend: number): {
  d: string
  mid: Point
  endDir: Point
} {
  if (!curved) {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.hypot(dx, dy) || 1
    return {
      d: `M${from.x} ${from.y} L${to.x} ${to.y}`,
      mid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
      endDir: { x: dx / len, y: dy / len },
    }
  }
  // Quadratic curve: control point offset along the segment normal.
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const cx = mx + nx * bend
  const cy = my + ny * bend
  // Point at t=0.5 on the quad bezier for the label anchor.
  const mid = {
    x: 0.25 * from.x + 0.5 * cx + 0.25 * to.x,
    y: 0.25 * from.y + 0.5 * cy + 0.25 * to.y,
  }
  const edx = to.x - cx
  const edy = to.y - cy
  const elen = Math.hypot(edx, edy) || 1
  return {
    d: `M${from.x} ${from.y} Q${cx} ${cy} ${to.x} ${to.y}`,
    mid,
    endDir: { x: edx / elen, y: edy / elen },
  }
}

/**
 * Animated dashed connector with optional direction arrow and mono label.
 * Dash flow reuses .ag-dashflow (stroke-dashoffset keyframes in agency.css).
 */
export function DiagEdge({
  from,
  to,
  accent,
  curved = false,
  bend = 60,
  label,
  arrow = true,
}: {
  from: Point
  to: Point
  accent: DiagAccent
  curved?: boolean
  bend?: number
  label?: string
  arrow?: boolean
}) {
  const color = DIAG_ACCENT[accent]
  const { d, mid, endDir } = edgePath(from, to, curved, bend)
  // Arrowhead: triangle aligned to the incoming tangent at the end point.
  const ah = 13
  const aw = 5.5
  const tipX = to.x
  const tipY = to.y
  const baseX = tipX - endDir.x * ah
  const baseY = tipY - endDir.y * ah
  const arrowD = `M${tipX} ${tipY} L${baseX - endDir.y * aw} ${baseY + endDir.x * aw} L${
    baseX + endDir.y * aw
  } ${baseY - endDir.x * aw} Z`
  const labelW = label ? label.length * 6.6 + 14 : 0

  return (
    <g style={{ color }}>
      <path
        className="ag-dashflow"
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        opacity={0.75}
      />
      {arrow ? <path d={arrowD} fill="currentColor" opacity={0.9} /> : null}
      {label ? (
        <g>
          <rect
            x={mid.x - labelW / 2}
            y={mid.y - 10}
            width={labelW}
            height={20}
            fill="var(--ag-bg-deep)"
            opacity={0.92}
          />
          <text
            x={mid.x}
            y={mid.y + 4}
            textAnchor="middle"
            fill="currentColor"
            fontFamily="var(--f-mono)"
            fontSize={10.5}
            letterSpacing="0.08em"
          >
            {label.toUpperCase()}
          </text>
        </g>
      ) : null}
    </g>
  )
}

/* ---------- DiagBadgePin ---------- */

/**
 * Small hazard/artifact chip pinned to a node. Mono 10.5px; text drawn in the
 * accent color (all --acc-* meet the ≥ --tx-3 contrast floor on --ag-bg-deep).
 */
export function DiagBadgePin({
  x,
  y,
  kind,
  label,
  accent,
}: {
  x: number
  y: number
  kind: DiagPinKind
  label: string
  accent: DiagAccent
}) {
  const color = DIAG_ACCENT[accent]
  const text = label.toUpperCase()
  const w = text.length * 6.9 + 26
  const h = 22
  return (
    <g transform={`translate(${x} ${y})`} style={{ color }}>
      <rect
        x={0}
        y={-h / 2}
        width={w}
        height={h}
        fill="var(--ag-bg-deep)"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeDasharray={kind === 'artifact' ? '3 3' : undefined}
        opacity={0.95}
      />
      {kind === 'hazard' ? (
        // hazard triangle marker
        <path d="M12 -6 L17 3 L7 3 Z" fill="none" stroke="currentColor" strokeWidth={1.3} />
      ) : (
        // artifact diamond marker
        <path d="M12 -5 L16.5 0 L12 5 L7.5 0 Z" fill="currentColor" opacity={0.85} />
      )}
      <text
        x={22}
        y={3.5}
        fill="currentColor"
        fontFamily="var(--f-mono)"
        fontSize={10.5}
        fontWeight={600}
        letterSpacing="0.09em"
      >
        {text}
      </text>
    </g>
  )
}
