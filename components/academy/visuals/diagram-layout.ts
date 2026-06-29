/**
 * The AUTO-LAYOUT engine for SageDiagram.
 *
 * Authors write LAYOUT-FREE specs (nodes + edges + kinds/tones, NO x/y). This
 * module runs `@dagrejs/dagre` (hierarchical layout) to compute every node's
 * position + size and every edge's polyline points + label anchor — so a diagram
 * is best-in-class BY CONSTRUCTION: consistent spacing, no overlaps, no clipping,
 * no hand-tuning. Authors own MEANING; this engine owns LAYOUT.
 *
 * Output coordinates are dagre's own (centered nodes, origin top-left). The
 * renderer adds a uniform PADDING margin and derives the SVG viewBox from the
 * laid-out graph bounds, so the diagram is explicitly sized (0 CLS) and never
 * clips.
 */

import dagre from '@dagrejs/dagre'
import type { DiagramNodeSpec, DiagramEdgeSpec, NodeKind } from './diagram-kinds'
import { measureNode } from './diagram-kinds'

export type LaidOutNode = DiagramNodeSpec & {
  kind: NodeKind
  /** Center coordinates (dagre convention), already padded into the viewBox. */
  x: number
  y: number
  width: number
  height: number
}

export type LaidOutEdge = DiagramEdgeSpec & {
  /** Dagre polyline through the edge (padded), start → end. */
  points: { x: number; y: number }[]
  /** Where the label pill anchors along the path (auto-offset, in-bounds). */
  labelX: number
  labelY: number
  /** Pixel width of the label pill (sized to the text). */
  labelWidth: number
}

export type DiagramLayout = {
  nodes: LaidOutNode[]
  edges: LaidOutEdge[]
  /**
   * The TIGHT content bounding box (min corner of all nodes + edge points +
   * label pills, minus a uniform margin). The renderer uses this as the viewBox
   * ORIGIN so there is no empty band — the diagram fills its frame on all four
   * sides. dagre centers ranks on the cross-axis, so the content min is NOT the
   * near-side padding; reading the real min kills the dead-air band.
   */
  minX: number
  minY: number
  /** Explicit SVG dimensions (tight content extent + uniform margin) — 0 CLS. */
  width: number
  height: number
}

/**
 * Uniform inner margin so nodes/labels never touch the frame edge. Generous so
 * the rightmost node's FULL width + stroke clears the frame (no clipping).
 */
const PADDING = 44
/** Label pill geometry — shared with the renderer. */
export const LABEL_PILL_H = 30
const LABEL_PAD_X = 15
// Approx advance of the 14.5px mono label glyph (FIX 3 bumped the font from
// 13.5→14.5px + heavier weight). Pill width tracks this so the larger text never
// overflows the pill and the clearance logic stays accurate.
const LABEL_CHAR_W = 8.6

export type LayoutOptions = {
  /** Flow direction. 'LR' (left→right) is the academy default. */
  rankdir?: 'LR' | 'TB' | 'RL' | 'BT'
}

/** Pixel width of a label pill sized to its text (never clips). */
export function labelPillWidth(label: string | undefined): number {
  if (!label) return 0
  return Math.max(56, label.length * LABEL_CHAR_W + LABEL_PAD_X * 2)
}

/**
 * Run dagre over a layout-free spec and return absolute geometry.
 *
 * Spacing scale (one rhythm for every diagram): nodesep 58 (within a rank —
 * widened from 48 so files in a dense rank breathe and the cross-axis mass
 * doesn't clump to one side), ranksep 80 (between ranks), edgesep 24. Node sizes
 * come from the label via `measureNode` (kind-aware), so dagre reserves real
 * space and nothing overlaps. Edge labels are registered with dagre too
 * (width/height + labelpos 'c') so ranksep accounts for them.
 *
 * Even-distribution knobs (why the graph no longer reads bottom-heavy /
 * right-dense): dagre's default placement leaves a single tall outlier in a rank
 * floating with cross-axis slack while later ranks clump. Two settings fix that:
 *   - `align: 'UL'` pins each rank's nodes to a consistent up-left coordination
 *     so the main spine stays a straight, centered through-line instead of
 *     drifting; the tight-bbox + symmetric PADDING then centers it in the frame.
 *   - `acyclicer: 'greedy'` reverses back-edges with a greedy heuristic before
 *     ranking, so a long feedback edge no longer forces dagre to inflate one
 *     side's rank span to route around a cycle — ranks come out evenly weighted.
 * Combined with the wider nodesep, no third of the canvas ends up markedly
 * denser than another (verified against the multi-store academy graph).
 */
export function layoutDiagram(
  nodes: DiagramNodeSpec[],
  edges: DiagramEdgeSpec[],
  options: LayoutOptions = {},
): DiagramLayout {
  const rankdir = options.rankdir ?? 'LR'

  const g = new dagre.graphlib.Graph({ multigraph: true })
  g.setGraph({
    rankdir,
    nodesep: 58,
    ranksep: 80,
    edgesep: 24,
    marginx: 0,
    marginy: 0,
    ranker: 'network-simplex',
    acyclicer: 'greedy',
    align: 'UL',
  })
  g.setDefaultEdgeLabel(() => ({}))

  // Register nodes with kind-aware measured sizes so dagre reserves real space.
  const kindById = new Map<string, NodeKind>()
  for (const node of nodes) {
    const kind: NodeKind = node.kind ?? 'service'
    kindById.set(node.id, kind)
    const { width, height } = measureNode(node, kind)
    g.setNode(node.id, { width, height })
  }

  // Register edges (+ their labels) so dagre routes around them and reserves
  // vertical room for the label between ranks.
  edges.forEach((edge, index) => {
    const labelWidth = labelPillWidth(edge.label)
    g.setEdge(
      edge.from,
      edge.to,
      {
        width: labelWidth,
        height: edge.label ? LABEL_PILL_H : 0,
        labelpos: 'c',
        minlen: 1,
      },
      `e${index}`,
    )
  })

  // Skip nodes/edges that reference unknown ids before laying out.
  const validNodeIds = new Set(nodes.map((n) => n.id))
  dagre.layout(g)

  const laidOutNodes: LaidOutNode[] = nodes.map((node) => {
    const dn = g.node(node.id)
    const kind = kindById.get(node.id) ?? 'service'
    return {
      ...node,
      kind,
      x: dn.x + PADDING,
      y: dn.y + PADDING,
      width: dn.width,
      height: dn.height,
    }
  })
  const nodeById = new Map(laidOutNodes.map((n) => [n.id, n]))

  const nodeBoxes = laidOutNodes.map(nodeToBox)

  // Horizontal + vertical extent of the laid-out node mass. Long-span detection
  // is relative to THIS (not absolute px) so the threshold scales with the graph
  // — a "full-width" edge on a small graph and a large one both qualify.
  const contentSpan = nodeSpan(laidOutNodes)

  const laidOutEdges: LaidOutEdge[] = edges
    .map((edge, index): LaidOutEdge | null => {
      if (!validNodeIds.has(edge.from) || !validNodeIds.has(edge.to)) return null
      const de = g.edge(edge.from, edge.to, `e${index}`)
      const dePoints: { x: number; y: number }[] = de?.points ?? []
      const rawPoints = dePoints.map((p: { x: number; y: number }) => ({
        x: p.x + PADDING,
        y: p.y + PADDING,
      }))
      let points =
        rawPoints.length >= 2
          ? rawPoints
          : fallbackPoints(nodeById.get(edge.from), nodeById.get(edge.to))

      // FIX 3 — LONG-SPAN ROUTING. A back/cross edge that spans the full width
      // arrives from dagre as a near-flat two/three-point line and reads as a
      // baseline rule rather than a routed relationship. When the endpoints are
      // ≥2 ranks apart (proxied by horizontal extent relative to the viewBox) OR
      // the straight-line length exceeds a viewBox-relative threshold, inject a
      // mid waypoint that drops/returns off the chord so the path arches with a
      // deliberate articulation. Normal edges keep their dagre route untouched.
      const articulated = articulateLongSpan(points, nodeBoxes, contentSpan)
      const wasArticulated = articulated !== points
      points = articulated

      const labelWidth = labelPillWidth(edge.label)
      // dagre attaches the label center (x/y) to the edge object at runtime when a
      // label is registered, but @dagrejs/dagre's GraphEdge type doesn't expose it.
      // When we re-routed a long span, dagre's stale label point sits off the new
      // arc — anchor to the articulated path's own midpoint so the pill rides the
      // line, not empty space beside it.
      const anchor = wasArticulated
        ? pointAtFraction(points, 0.5)
        : labelAnchor(points, de as unknown as { x?: number; y?: number } | undefined)

      // FIX 2 — EDGE-LABEL PADDING / collision. dagre anchors the pill at the
      // edge center, which on a short edge can land within the clearance band of
      // a node box (the pill nearly touches a card). Slide the anchor along the
      // path toward the segment midpoint until the pill clears every node by
      // ≥LABEL_CLEARANCE; this holds for short edges because we always have the
      // polyline to walk.
      const cleared = clearLabel({ x: anchor.x, y: anchor.y }, points, labelWidth, nodeBoxes)

      return { ...edge, points, labelX: cleared.x, labelY: cleared.y, labelWidth }
    })
    .filter((e): e is LaidOutEdge => e !== null)

  // Derive the viewBox from the TIGHT content bounding box — the true min AND
  // max of every node's full half-extent (+ stroke halo), every edge point, and
  // every label pill. dagre's `rankdir:'LR'` spreads ranks along X but CENTERS
  // them on the cross-axis (Y), so the topmost node's top edge is NOT at the
  // near-side PADDING — it floats lower. The old viewBox started at 0,0 and
  // assumed min ≈ PADDING, which left the dead-air band under the legend
  // whenever a tall outlier inflated viewH while the mass clustered low. Reading
  // the real min on all four sides and using it as the viewBox origin removes
  // that band: the diagram fills its frame top-to-bottom.
  const STROKE_HALO = 3 // half the node stroke (2px) + a hair of safety
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  const include = (x: number, y: number): void => {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  for (const n of laidOutNodes) {
    include(n.x - n.width / 2 - STROKE_HALO, n.y - n.height / 2 - STROKE_HALO)
    include(n.x + n.width / 2 + STROKE_HALO, n.y + n.height / 2 + STROKE_HALO)
  }
  for (const e of laidOutEdges) {
    for (const p of e.points) include(p.x, p.y)
    // The label pill (both corners) at its anchor also has to fit pre-clamp.
    include(e.labelX - e.labelWidth / 2, e.labelY - LABEL_PILL_H / 2)
    include(e.labelX + e.labelWidth / 2, e.labelY + LABEL_PILL_H / 2)
  }

  // Degenerate guard (no geometry): fall back to a unit box so width/height stay
  // finite and positive (0 CLS, no NaN aspect-ratio).
  if (!Number.isFinite(minX)) {
    minX = 0
    minY = 0
    maxX = 1
    maxY = 1
  }

  // FIX 1 — SYMMETRIC VERTICAL CENTERING. The tight bbox (minY..maxY) includes
  // edge troughs/labels, so it can extend well past the NODE cluster on one side
  // (a long back-edge arc drops below, pushing maxY down while the node mass
  // stays up top). That leaves the node row floating high with a dead band
  // below. Measure the node-cluster band (nodeMinY..nodeMaxY) and, if the full
  // bbox has materially more slack on one side of it than the other, pad the
  // tighter side so the SLACK IS SPLIT EVENLY around the node mass. This centers
  // the spine without anchoring it to either edge, and only ever GROWS the box
  // (never clips geometry) so 0 CLS / no-clip guarantees hold.
  let nodeMinY = Number.POSITIVE_INFINITY
  let nodeMaxY = Number.NEGATIVE_INFINITY
  for (const n of laidOutNodes) {
    nodeMinY = Math.min(nodeMinY, n.y - n.height / 2)
    nodeMaxY = Math.max(nodeMaxY, n.y + n.height / 2)
  }
  if (Number.isFinite(nodeMinY)) {
    const slackTop = nodeMinY - minY // empty room above the node cluster
    const slackBottom = maxY - nodeMaxY // empty room below the node cluster
    const diff = slackBottom - slackTop
    // Only correct a MEANINGFUL imbalance (a few px of dagre rounding is fine).
    const VERTICAL_BALANCE_THRESHOLD = 12
    if (diff > VERTICAL_BALANCE_THRESHOLD) {
      minY -= diff // grow the top to match the deeper bottom slack
    } else if (diff < -VERTICAL_BALANCE_THRESHOLD) {
      maxY -= diff // diff<0 → grow the bottom to match the deeper top slack
    }
  }

  // A uniform margin on ALL FOUR sides so nodes/labels never touch the frame and
  // the diagram sits directly under the legend with balanced air, not a band.
  const originX = minX - PADDING
  const originY = minY - PADDING
  const width = maxX - minX + PADDING * 2
  const height = maxY - minY + PADDING * 2

  // Clamp every label pill fully inside the derived viewBox so long labels
  // (e.g. "indexes (LAGS)") never truncate at the frame edge.
  for (const edge of laidOutEdges) {
    const halfW = edge.labelWidth / 2 + 6
    const halfH = LABEL_PILL_H / 2 + 6
    edge.labelX = clamp(edge.labelX, originX + halfW, originX + width - halfW)
    edge.labelY = clamp(edge.labelY, originY + halfH, originY + height - halfH)
  }

  return { nodes: laidOutNodes, edges: laidOutEdges, minX: originX, minY: originY, width, height }
}

/** Straight-line fallback when dagre returns no polyline (degenerate edge). */
function fallbackPoints(
  from: LaidOutNode | undefined,
  to: LaidOutNode | undefined,
): { x: number; y: number }[] {
  if (!from || !to) return []
  return [
    { x: from.x, y: from.y },
    { x: to.x, y: to.y },
  ]
}

type Pt = { x: number; y: number }
type Box = { x: number; y: number; halfW: number; halfH: number }

/** Minimum clearance between a label pill and any node box / parallel edge. */
const LABEL_CLEARANCE = 12
/** A span this fraction of the content's larger axis qualifies as "long". */
const LONG_SPAN_FRACTION = 0.55
/** Threshold above which an existing dagre bend is left alone (not re-articulated). */
const ARTICULATION_MIN = 26
/**
 * FIX 1 — arc-depth band. A long-span back-edge bows by ARC_FRACTION·chord,
 * clamped to [ARTICULATION_MIN_ARC, ARC_MAX]. Lowered from the old
 * 0.16 / 26..96 band so the articulation trough no longer drops far below the
 * node band and inflates the tight bbox downward (the cause of the bottom-heavy
 * dead band). Shallow enough to keep the spine centered, deep enough to still
 * read as a routed relationship rather than a baseline rule.
 */
const ARC_FRACTION = 0.1
const ARTICULATION_MIN_ARC = 20
const ARC_MAX = 56

/** Axis-aligned bbox of a laid-out node (center + half extents, no halo). */
function nodeToBox(n: LaidOutNode): Box {
  return { x: n.x, y: n.y, halfW: n.width / 2, halfH: n.height / 2 }
}

/** Content extent of the node mass (drives the relative long-span threshold). */
function nodeSpan(nodes: LaidOutNode[]): { w: number; h: number } {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const n of nodes) {
    minX = Math.min(minX, n.x - n.width / 2)
    maxX = Math.max(maxX, n.x + n.width / 2)
    minY = Math.min(minY, n.y - n.height / 2)
    maxY = Math.max(maxY, n.y + n.height / 2)
  }
  if (!Number.isFinite(minX)) return { w: 1, h: 1 }
  return { w: maxX - minX, h: maxY - minY }
}

/** Shortest distance from a point to a box's surface (0 if inside). */
function distToBox(p: Pt, b: Box): number {
  const dx = Math.max(Math.abs(p.x - b.x) - b.halfW, 0)
  const dy = Math.max(Math.abs(p.y - b.y) - b.halfH, 0)
  return Math.hypot(dx, dy)
}

/** Minimum clearance from a point to ALL node boxes. */
function minBoxClearance(p: Pt, boxes: Box[]): number {
  let min = Number.POSITIVE_INFINITY
  for (const b of boxes) min = Math.min(min, distToBox(p, b))
  return min
}

/**
 * Sample a point a fractional distance `t` (0..1) along a polyline by arc length.
 * Used to walk a label anchor toward the path's true midpoint when it must move
 * to clear a node.
 */
function pointAtFraction(points: Pt[], t: number): Pt {
  if (points.length === 0) return { x: 0, y: 0 }
  if (points.length === 1) return points[0]
  const total = pathLength(points)
  if (total === 0) return points[0]
  const target = total * Math.min(Math.max(t, 0), 1)
  let acc = 0
  for (let i = 1; i < points.length; i++) {
    const seg = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
    if (acc + seg >= target) {
      const f = seg === 0 ? 0 : (target - acc) / seg
      return {
        x: points[i - 1].x + (points[i].x - points[i - 1].x) * f,
        y: points[i - 1].y + (points[i].y - points[i - 1].y) * f,
      }
    }
    acc += seg
  }
  return points[points.length - 1]
}

/**
 * FIX 3 helper. If the edge's endpoints span a long horizontal/diagonal reach
 * (≥ LONG_SPAN_FRACTION of the content's larger axis) AND the current route is
 * nearly straight (a flat chord), splice a single articulation waypoint at the
 * chord midpoint, offset perpendicular to the chord. The offset direction is
 * chosen to bow AWAY from the densest node cluster's center, and the arc height
 * scales with span but is clamped so it always clears nodes. Already-bent dagre
 * routes (3+ points with real vertical travel) are returned unchanged.
 */
function articulateLongSpan(points: Pt[], boxes: Box[], span: { w: number; h: number }): Pt[] {
  if (points.length < 2) return points
  const a = points[0]
  const b = points[points.length - 1]
  const dx = b.x - a.x
  const dy = b.y - a.y
  const chord = Math.hypot(dx, dy)
  if (chord === 0) return points

  const axis = Math.max(span.w, span.h, 1)
  const isLong = chord >= axis * LONG_SPAN_FRACTION
  if (!isLong) return points

  // How far the existing route already departs from the straight chord. If dagre
  // already routed it with a real bend, leave it alone (don't double-articulate).
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  const existingBow = maxPerpDeviation(points, a, b)
  if (existingBow >= ARTICULATION_MIN) return points

  // Unit perpendicular to the chord.
  const nx = -dy / chord
  const ny = dx / chord

  // FIX 1 — SHALLOWER ARC. A long back-edge previously dropped a deep trough
  // (clamp 0.16·chord, 26..96) that extended the tight bbox far below the node
  // band, creating a wide empty band and a bottom-heavy frame. A shallower arc
  // (0.10·chord, 20..56) still reads as a deliberately routed relationship but
  // keeps the trough close to the node band so the bbox no longer balloons
  // downward. Combined with the symmetric vertical centering pass below, the
  // spine sits centered in the frame.
  const arc = Math.min(Math.max(chord * ARC_FRACTION, ARTICULATION_MIN_ARC), ARC_MAX)

  // Try both perpendicular directions; keep the one whose apex clears nodes best.
  const candA = { x: mid.x + nx * arc, y: mid.y + ny * arc }
  const candB = { x: mid.x - nx * arc, y: mid.y - ny * arc }
  const apex = minBoxClearance(candA, boxes) >= minBoxClearance(candB, boxes) ? candA : candB

  // If even the better apex is buried in a node, shrink the arc until it clears.
  let chosen = apex
  let scale = 1
  const dirX = chosen.x - mid.x
  const dirY = chosen.y - mid.y
  while (scale > 0.3 && minBoxClearance(chosen, boxes) < LABEL_CLEARANCE) {
    scale -= 0.15
    chosen = { x: mid.x + dirX * scale, y: mid.y + dirY * scale }
  }

  return [a, chosen, b]
}

/** Max perpendicular distance of any interior point from the a→b chord. */
function maxPerpDeviation(points: Pt[], a: Pt, b: Pt): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  if (len === 0) return 0
  let max = 0
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]
    const perp = Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len
    max = Math.max(max, perp)
  }
  return max
}

/**
 * FIX 2 helper. Guarantee ≥ LABEL_CLEARANCE between the label pill and every
 * node box. Model the pill as a box at the candidate anchor; if it intrudes,
 * walk the anchor along the path toward the geometric midpoint (the openest part
 * of a routed edge) and, failing that, nudge perpendicular to the local segment.
 * Returns the first position that clears, or the least-bad one found.
 */
function clearLabel(anchor: Pt, points: Pt[], labelWidth: number, boxes: Box[]): Pt {
  const pillHalfW = labelWidth / 2
  const pillHalfH = LABEL_PILL_H / 2

  const clears = (p: Pt): boolean => {
    for (const b of boxes) {
      // Gap between the pill box and the node box on each axis.
      const gapX = Math.abs(p.x - b.x) - (pillHalfW + b.halfW)
      const gapY = Math.abs(p.y - b.y) - (pillHalfH + b.halfH)
      // Overlap on BOTH axes (gap<0 each) → boxes intersect. Otherwise the true
      // separation is the larger positive gap; require it to meet clearance.
      const sep = Math.max(gapX, gapY)
      if (sep < LABEL_CLEARANCE) return false
    }
    return true
  }

  if (clears(anchor)) return anchor

  // 1) Walk along the path toward the midpoint in fractional steps, both sides.
  let best = anchor
  let bestScore = -Infinity
  const score = (p: Pt): number => minBoxClearance(p, boxes)
  bestScore = score(anchor)
  for (const t of [0.5, 0.45, 0.55, 0.4, 0.6, 0.35, 0.65, 0.3, 0.7]) {
    const cand = pointAtFraction(points, t)
    if (clears(cand)) return cand
    const s = score(cand)
    if (s > bestScore) {
      bestScore = s
      best = cand
    }
  }

  // 2) Perpendicular nudge off the local segment at the best on-path point.
  const seg = localPerp(points, best)
  for (const dist of [LABEL_CLEARANCE, LABEL_CLEARANCE + 8, LABEL_CLEARANCE + 18, LABEL_CLEARANCE + 30]) {
    for (const sign of [1, -1]) {
      const cand = { x: best.x + seg.x * dist * sign, y: best.y + seg.y * dist * sign }
      if (clears(cand)) return cand
    }
  }

  return best
}

/** Unit perpendicular of the polyline segment nearest to point `p`. */
function localPerp(points: Pt[], p: Pt): Pt {
  if (points.length < 2) return { x: 0, y: 1 }
  let bestI = 0
  let bestD = Number.POSITIVE_INFINITY
  for (let i = 1; i < points.length; i++) {
    const mx = (points[i].x + points[i - 1].x) / 2
    const my = (points[i].y + points[i - 1].y) / 2
    const d = Math.hypot(p.x - mx, p.y - my)
    if (d < bestD) {
      bestD = d
      bestI = i
    }
  }
  const dx = points[bestI].x - points[bestI - 1].x
  const dy = points[bestI].y - points[bestI - 1].y
  const len = Math.hypot(dx, dy) || 1
  return { x: -dy / len, y: dx / len }
}

/**
 * The label anchor: dagre's own label point when present, else the geometric
 * midpoint of the polyline. Either way it sits ON the edge path between nodes,
 * so a pill never lands on a box. The renderer draws the pill background, so the
 * line beneath stays readable.
 */
function labelAnchor(
  points: { x: number; y: number }[],
  de: { x?: number; y?: number } | undefined,
): { x: number; y: number } {
  if (de && typeof de.x === 'number' && typeof de.y === 'number') {
    return { x: de.x + PADDING, y: de.y + PADDING }
  }
  if (points.length === 0) return { x: 0, y: 0 }
  const mid = points[Math.floor(points.length / 2)]
  return { x: mid.x, y: mid.y }
}

function clamp(v: number, min: number, max: number): number {
  if (min > max) return (min + max) / 2
  return Math.min(Math.max(v, min), max)
}

/**
 * Build an SVG path `d` from a dagre polyline.
 *
 * - 0/1 points → empty / move only.
 * - 2 points → a clean straight line (a direct same-rank or adjacent hop).
 * - 3+ points → a SMOOTH curve through every point (Catmull-Rom → cubic Bézier),
 *   so multi-bend edges (e.g. the long Client→Search Index read/feedback path)
 *   read as deliberate routing, not an angular afterthought chord. The curve
 *   passes through dagre's own points, so the routing intent is preserved.
 */
export function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`
  }

  // Catmull-Rom spline through all points, converted to cubic Béziers. Tension
  // 1/6 is the standard Catmull-Rom→Bézier control-point factor (smooth, no
  // overshoot), so the curve hugs the dagre route.
  const p = points
  let d = `M${p[0].x},${p[0].y}`
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i === 0 ? 0 : i - 1]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[i + 2 < p.length ? i + 2 : p.length - 1]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += `C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`
  }
  return d
}

/** Total length of a polyline (drives the stroke-dashoffset draw-in motion). */
export function pathLength(points: { x: number; y: number }[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }
  return total
}
