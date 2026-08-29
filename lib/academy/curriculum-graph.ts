/**
 * The curriculum graph — a git-resident, DB-independent definition of how the
 * academy's tracks relate. This is the topology behind the visual skill-tree:
 * which track is a prerequisite for which, laid out into tiers.
 *
 * Pure + deterministic (no DB, no Date/random) so it renders even when the
 * catalog Supabase is paused and is fully unit-testable. Per-user progress is
 * an OPTIONAL overlay passed in from the page; structure never depends on it.
 *
 * Locks are SOFT in v1: `state` marks the recommended path and what's "locked",
 * but nothing here blocks access — the paywall gate stays the only real lock.
 */

import { TRACKS, type AcademyTrack } from './taxonomy'

/** prereq trackId → the tracks that must come first. Empty = an entry point. */
export const CURRICULUM_PREREQS: Record<string, string[]> = {
  foundations: [],
  security: ['foundations'],
  backend: ['foundations'],
  frontend: ['foundations'],
  databases: ['foundations'],
  cloud: ['backend'],
  architecture: ['backend', 'databases'],
  'ai-engineering': ['foundations', 'backend'],
  'data-engineering': ['databases'],
  reliability: ['cloud'],
  product: ['frontend'],
  career: ['ai-engineering', 'architecture'],
}

export type SkillNodeState = 'complete' | 'in-progress' | 'available' | 'locked' | 'building' | 'upcoming'

export type SkillNode = {
  id: string
  name: string
  topic: AcademyTrack['topic']
  glyph: string
  outcome: string
  status: AcademyTrack['status']
  tier: number
  x: number
  y: number
  state: SkillNodeState
  pct: number // 0-100 completion overlay (0 when no progress data)
  prereqIds: string[]
}

export type SkillEdge = { from: string; to: string; met: boolean }

export type SkillGraph = { nodes: SkillNode[]; edges: SkillEdge[]; width: number; height: number }

export type TrackProgress = { pct: number } // per-track completion overlay

// Canvas geometry (virtual coordinate space; the renderer scales to fit).
const NODE_W = 214
const NODE_H = 96
const COL_GAP = 40
const ROW_H = 176
const PAD_X = 24
const PAD_Y = 24

/** Longest-path tier for each node (entry points = 0). Deterministic. */
export function computeTiers(prereqs: Record<string, string[]>): Record<string, number> {
  const memo: Record<string, number> = {}
  const visiting = new Set<string>()
  function depth(id: string): number {
    if (memo[id] !== undefined) return memo[id]
    if (visiting.has(id)) return 0 // cycle guard (shouldn't happen)
    visiting.add(id)
    const parents = prereqs[id] ?? []
    const d = parents.length === 0 ? 0 : 1 + Math.max(...parents.map((p) => depth(p)))
    visiting.delete(id)
    memo[id] = d
    return d
  }
  for (const id of Object.keys(prereqs)) depth(id)
  return memo
}

function deriveState(status: AcademyTrack['status'], _prereqMet: boolean, pct: number): SkillNodeState {
  if (status === 'upcoming') return 'upcoming'
  if (status === 'building') return 'building'
  // Live tracks are always startable (soft locks) — a live track never shows as
  // "locked" just because an upstream track hasn't been built yet. The prereq
  // EDGES still communicate the recommended order; the node state does not gate.
  if (pct >= 100) return 'complete'
  if (pct > 0) return 'in-progress'
  return 'available'
}

/**
 * Build the positioned graph. `tracks` defaults to the live software-AI tracks;
 * `progressByTrack` is an optional per-track completion overlay (signed-in + DB).
 */
export function buildCurriculumGraph(
  progressByTrack: Record<string, TrackProgress> = {},
  tracks: AcademyTrack[] = TRACKS.filter((t) => t.categoryId === 'software-ai'),
): SkillGraph {
  const prereqs: Record<string, string[]> = {}
  for (const t of tracks) prereqs[t.id] = (CURRICULUM_PREREQS[t.id] ?? []).filter((p) => tracks.some((x) => x.id === p))
  const tiers = computeTiers(prereqs)

  // group by tier for horizontal spread
  const byTier = new Map<number, AcademyTrack[]>()
  for (const t of tracks) {
    const tier = tiers[t.id] ?? 0
    if (!byTier.has(tier)) byTier.set(tier, [])
    byTier.get(tier)!.push(t)
  }
  const maxTier = Math.max(0, ...[...byTier.keys()])
  const widest = Math.max(1, ...[...byTier.values()].map((a) => a.length))
  const width = PAD_X * 2 + widest * NODE_W + (widest - 1) * COL_GAP
  const height = PAD_Y * 2 + (maxTier + 1) * NODE_H + maxTier * (ROW_H - NODE_H)

  const completeSet = new Set(
    tracks.filter((t) => (progressByTrack[t.id]?.pct ?? 0) >= 100).map((t) => t.id),
  )

  const nodes: SkillNode[] = []
  for (const [tier, group] of [...byTier.entries()].sort((a, b) => a[0] - b[0])) {
    // center each tier's row within the canvas
    const rowW = group.length * NODE_W + (group.length - 1) * COL_GAP
    const startX = (width - rowW) / 2
    group.sort((a, b) => a.id.localeCompare(b.id))
    group.forEach((t, i) => {
      const prereqMet = (prereqs[t.id] ?? []).every((p) => completeSet.has(p))
      const pct = progressByTrack[t.id]?.pct ?? 0
      nodes.push({
        id: t.id,
        name: t.name,
        topic: t.topic,
        glyph: t.glyph,
        outcome: t.outcome,
        status: t.status,
        tier,
        x: startX + i * (NODE_W + COL_GAP),
        y: PAD_Y + tier * ROW_H,
        state: deriveState(t.status, prereqMet, pct),
        pct,
        prereqIds: prereqs[t.id] ?? [],
      })
    })
  }

  const edges: SkillEdge[] = []
  for (const t of tracks) {
    for (const p of prereqs[t.id] ?? []) {
      edges.push({ from: p, to: t.id, met: completeSet.has(p) })
    }
  }

  return { nodes, edges, width, height }
}

export const NODE_DIMS = { w: NODE_W, h: NODE_H }
