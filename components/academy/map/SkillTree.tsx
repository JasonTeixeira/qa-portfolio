'use client'

import Link from 'next/link'
import { SkillNode } from './SkillNode'
import { topic as getTopic } from '@/lib/academy/topics'
import { NODE_DIMS, type SkillGraph, type SkillNode as SkillNodeModel } from '@/lib/academy/curriculum-graph'

const LINE = '#2A2A32'
const GREEN = '#18B663'
const mono = { fontFamily: 'var(--font-mono), monospace' } as const

const CLICKABLE = new Set(['complete', 'in-progress', 'available', 'locked'])

function edgePath(from: SkillNodeModel, to: SkillNodeModel): string {
  const { w, h } = NODE_DIMS
  const fx = from.x + w / 2
  const fy = from.y + h
  const tx = to.x + w / 2
  const ty = to.y
  const midY = (fy + ty) / 2
  return `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`
}

export function SkillTree({ graph, currentTrackId }: { graph: SkillGraph; currentTrackId?: string }) {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
        <div style={{ position: 'relative', width: graph.width, height: graph.height, margin: '0 auto', minWidth: graph.width }}>
          <svg width={graph.width} height={graph.height} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
            {graph.edges.map((e) => {
              const from = byId.get(e.from)
              const to = byId.get(e.to)
              if (!from || !to) return null
              const color = e.met ? GREEN : LINE
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={edgePath(from, to)}
                  fill="none"
                  stroke={color}
                  strokeWidth={e.met ? 2 : 1.5}
                  strokeDasharray={e.met ? undefined : '4 5'}
                  opacity={e.met ? 0.9 : 0.5}
                />
              )
            })}
          </svg>

          {graph.nodes.map((n) => {
            const inner = <SkillNode node={n} current={n.id === currentTrackId} />
            const style = { position: 'absolute' as const, left: n.x, top: n.y, width: NODE_DIMS.w, height: NODE_DIMS.h }
            return CLICKABLE.has(n.state) ? (
              <Link key={n.id} href="/academy/catalog" style={{ ...style, textDecoration: 'none' }} aria-label={`${n.name} — ${n.state}`}>
                {inner}
              </Link>
            ) : (
              <div key={n.id} style={style} aria-label={`${n.name} — ${n.state}`}>
                {inner}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginTop: 20, ...mono, fontSize: 10.5, color: '#9598A2' }}>
        <Legend swatch={GREEN} label="complete" />
        <Legend swatch={getTopic('ai-engineering').color} label="live — start now" />
        <Legend swatch="#E0A93E" label="building — coming soon" />
        <Legend swatch={LINE} label="prerequisite line" dashed />
      </div>
      <p style={{ ...mono, fontSize: 10.5, color: '#5A5A64', marginTop: 10 }}>
        Two tracks are live today; the rest are on the build path. Locks are guidance, not walls — you can open anything.
      </p>
    </div>
  )
}

function Legend({ swatch, label, dashed }: { swatch: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, border: `1.5px ${dashed ? 'dashed' : 'solid'} ${swatch}`, background: dashed ? 'transparent' : swatch }} />
      {label}
    </span>
  )
}
