import { DiagEdge, DiagNode, type DiagAccent } from '@/components/agency/diagrams/primitives'
import type { GlyphKind } from '@/components/agency/diagrams/glyphs'

/**
 * Hero background pipeline schematic — server component, zero JS shipped.
 *
 * A ghosted 5-node pipeline (trigger → model → eval → gate → verified) drifts
 * left-to-right across the hero's upper band, edges flowing toward the right
 * column where the GateRunner terminal sits: the pipeline feeds the gate.
 *
 * Deliberately subdued: every node group is capped at ≤0.4 opacity and the
 * wrapper (.ag-hero-schematic in wow.css) masks to transparent before the
 * bottom-anchored headline block. Decorative only — aria-hidden.
 */

const UID = 'agherosc'

/** Half of the sm DiagNode width (118) plus a 3px breathing gap. */
const NODE_HALF_W = 62

interface Point {
  x: number
  y: number
}

interface SchematicNode {
  x: number
  y: number
  glyph: GlyphKind
  label: string
  accent: DiagAccent
  opacity: number
}

interface SchematicEdge {
  from: Point
  to: Point
  accent: DiagAccent
  bend: number
}

/* viewBox space: 1440×620, pinned to the hero's top edge (xMidYMin slice). */
const NODES: readonly SchematicNode[] = [
  { x: 150, y: 212, glyph: 'webhook', label: 'trigger', accent: 'primary', opacity: 0.3 },
  { x: 408, y: 142, glyph: 'model', label: 'model', accent: 'ai', opacity: 0.3 },
  { x: 662, y: 216, glyph: 'eval', label: 'eval', accent: 'log', opacity: 0.32 },
  { x: 916, y: 146, glyph: 'gate', label: 'gate', accent: 'primary', opacity: 0.36 },
  { x: 1172, y: 222, glyph: 'check', label: 'verified', accent: 'pass', opacity: 0.4 },
]

function buildEdges(nodes: readonly SchematicNode[]): readonly SchematicEdge[] {
  const edges: SchematicEdge[] = []
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const a = nodes[i]
    const b = nodes[i + 1]
    if (!a || !b) continue
    edges.push({
      from: { x: a.x + NODE_HALF_W, y: a.y },
      to: { x: b.x - NODE_HALF_W, y: b.y },
      accent: b.accent,
      bend: i % 2 === 0 ? 22 : -22,
    })
  }
  return edges
}

const EDGES = buildEdges(NODES)

/** Trailing edge: the verified signal drifts off toward the terminal column. */
const DRIFT_EDGE: SchematicEdge = {
  from: { x: 1172 + NODE_HALF_W, y: 222 },
  to: { x: 1408, y: 300 },
  accent: 'pass',
  bend: 26,
}

export function HeroSchematic() {
  return (
    <div className="ag-hero-schematic" aria-hidden="true">
      <svg
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMin slice"
        role="presentation"
        focusable="false"
      >
        <defs>
          {/* Same soft glow contract DiagFrame provides for DiagNode halos. */}
          <filter id={`${UID}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          </filter>
        </defs>

        {EDGES.map((edge) => (
          <g key={`${edge.from.x}-${edge.to.x}`} opacity={0.28}>
            <DiagEdge from={edge.from} to={edge.to} accent={edge.accent} curved bend={edge.bend} />
          </g>
        ))}
        <g opacity={0.26}>
          <DiagEdge
            from={DRIFT_EDGE.from}
            to={DRIFT_EDGE.to}
            accent={DRIFT_EDGE.accent}
            curved
            bend={DRIFT_EDGE.bend}
          />
        </g>

        {NODES.map((node) => (
          <g key={node.glyph} opacity={node.opacity}>
            <DiagNode
              uid={UID}
              x={node.x}
              y={node.y}
              glyph={node.glyph}
              label={node.label}
              accent={node.accent}
              size="sm"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
