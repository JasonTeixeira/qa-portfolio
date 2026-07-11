import type { GlyphKind } from './glyphs'
import {
  DiagBadgePin,
  DiagEdge,
  DiagFrame,
  DiagNode,
  NODE_DIMS,
  type DiagAccent,
  type DiagNodeSize,
  type DiagPinKind,
} from './primitives'

/**
 * SystemDiagram — renders a full case-study system topology from a typed spec.
 * Server component; all motion is CSS. The SVG is decorative (aria-hidden via
 * DiagFrame); `spec.summary` renders as visually-hidden text for AT users.
 *
 * Spec coordinates: nodes are positioned in a 100×56 space (x right, y down),
 * scaled ×10 into the SVG. Edges reference node ids and are trimmed to node
 * borders with a small gap, so connectors never pierce the tiles.
 */

export interface SystemNodeSpec {
  id: string
  glyph: GlyphKind
  label: string
  sublabel?: string
  accent: DiagAccent
  /** Center position in the 100×56 spec space. */
  x: number
  y: number
  size?: DiagNodeSize
  pulse?: boolean
}

export interface SystemEdgeSpec {
  from: string
  to: string
  accent: DiagAccent
  curved?: boolean
  /** Perpendicular bend of a curved edge, in spec units (sign picks the side). */
  bend?: number
  label?: string
}

export interface SystemPinSpec {
  nodeId: string
  kind: DiagPinKind
  label: string
  /** Defaults: hazard → fail, artifact → log. */
  accent?: DiagAccent
}

export interface SystemDiagramSpec {
  nodes: SystemNodeSpec[]
  edges: SystemEdgeSpec[]
  pins?: SystemPinSpec[]
  /** Plain-text topology summary for screen readers. */
  summary: string
}

const SCALE = 10
const EDGE_GAP = 9

interface Point {
  x: number
  y: number
}

/** Point on a node's border (plus gap) along the ray from its center to `toward`. */
function trimToBorder(node: SystemNodeSpec, toward: Point): Point {
  const dims = NODE_DIMS[node.size ?? 'md']
  const cx = node.x * SCALE
  const cy = node.y * SCALE
  const dx = toward.x - cx
  const dy = toward.y - cy
  const halfW = dims.w / 2
  const halfH = dims.h / 2
  const tx = dx !== 0 ? halfW / Math.abs(dx) : Number.POSITIVE_INFINITY
  const ty = dy !== 0 ? halfH / Math.abs(dy) : Number.POSITIVE_INFINITY
  const t = Math.min(tx, ty)
  const len = Math.hypot(dx, dy) || 1
  const gapT = EDGE_GAP / len
  return { x: cx + dx * (t + gapT), y: cy + dy * (t + gapT) }
}

/** Direction target for trimming: the curve's control point, or the other center. */
function trimTarget(a: Point, b: Point, curved: boolean, bendSvg: number): Point {
  if (!curved) return b
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  return { x: mx + (-dy / len) * bendSvg, y: my + (dx / len) * bendSvg }
}

export function SystemDiagram({ uid, spec }: { uid: string; spec: SystemDiagramSpec }) {
  const byId = new Map(spec.nodes.map((node) => [node.id, node]))

  return (
    <div className="ag-sysdiag">
      <DiagFrame uid={uid}>
        {spec.edges.map((edge, index) => {
          const fromNode = byId.get(edge.from)
          const toNode = byId.get(edge.to)
          if (!fromNode || !toNode) return null
          const fromCenter = { x: fromNode.x * SCALE, y: fromNode.y * SCALE }
          const toCenter = { x: toNode.x * SCALE, y: toNode.y * SCALE }
          const bendSvg = (edge.bend ?? 6) * SCALE
          const curved = edge.curved ?? false
          const control = trimTarget(fromCenter, toCenter, curved, bendSvg)
          const from = trimToBorder(fromNode, control)
          const to = trimToBorder(toNode, curved ? control : fromCenter)
          return (
            <DiagEdge
              key={`${edge.from}-${edge.to}-${index}`}
              from={from}
              to={to}
              accent={edge.accent}
              curved={curved}
              bend={bendSvg}
              label={edge.label}
            />
          )
        })}
        {spec.nodes.map((node) => (
          <DiagNode
            key={node.id}
            uid={uid}
            x={node.x * SCALE}
            y={node.y * SCALE}
            glyph={node.glyph}
            label={node.label}
            sublabel={node.sublabel}
            accent={node.accent}
            size={node.size}
            pulse={node.pulse}
          />
        ))}
        {(spec.pins ?? []).map((pin) => {
          const node = byId.get(pin.nodeId)
          if (!node) return null
          const dims = NODE_DIMS[node.size ?? 'md']
          // Pinned straddling the node's bottom-left edge.
          const x = node.x * SCALE - dims.w / 2 + 12
          const y = node.y * SCALE + dims.h / 2
          const accent = pin.accent ?? (pin.kind === 'hazard' ? 'fail' : 'log')
          return (
            <DiagBadgePin
              key={`${pin.nodeId}-${pin.label}`}
              x={x}
              y={y}
              kind={pin.kind}
              label={pin.label}
              accent={accent}
            />
          )
        })}
      </DiagFrame>
      <p className="ag-vh">{spec.summary}</p>
    </div>
  )
}
