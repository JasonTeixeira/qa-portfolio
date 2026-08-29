import { Icon, type IconName } from '@/components/academy/ui/Icon'
import { topic as getTopic } from '@/lib/academy/topics'
import type { SkillNode as SkillNodeModel } from '@/lib/academy/curriculum-graph'

const INK = '#F2EFE9'
const DIM = '#5A5A64'
const LINE = '#2A2A32'
const GREEN = '#18B663'
const AMBER = '#E0A93E'

const mono = { fontFamily: 'var(--font-mono), monospace' } as const

const STATE_CHIP: Record<SkillNodeModel['state'], { label: string; color: string }> = {
  complete: { label: 'complete', color: GREEN },
  'in-progress': { label: 'in progress', color: '#8FA0FF' },
  available: { label: 'start →', color: '#8FA0FF' },
  locked: { label: 'locked', color: DIM },
  building: { label: 'building', color: AMBER },
  upcoming: { label: 'soon', color: DIM },
}

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 13
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100)
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" role="img" aria-label={`${pct}% complete`}>
      <circle cx="16" cy="16" r={r} fill="none" stroke={LINE} strokeWidth="3" />
      <circle cx="16" cy="16" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 16 16)" />
    </svg>
  )
}

export function SkillNode({ node, current = false }: { node: SkillNodeModel; current?: boolean }) {
  const t = getTopic(node.topic)
  const dimmed = node.state === 'locked' || node.state === 'building' || node.state === 'upcoming'
  const chip = STATE_CHIP[node.state]
  const showRing = node.state === 'in-progress' || node.state === 'complete'

  const borderColor =
    node.state === 'complete' ? 'rgba(24,182,99,0.5)' : node.state === 'locked' || node.state === 'upcoming' ? LINE : dimmed ? LINE : `${t.color}88`
  const bg = node.state === 'complete' ? 'rgba(24,182,99,0.06)' : node.state === 'in-progress' || node.state === 'available' ? t.soft : '#111115'

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        border: `1.5px ${node.state === 'locked' ? 'dashed' : 'solid'} ${borderColor}`,
        borderRadius: 14,
        background: bg,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: node.state === 'upcoming' ? 0.55 : dimmed ? 0.82 : 1,
        boxShadow: current ? `0 0 0 2px ${t.color}, 0 0 30px ${t.soft}` : node.state === 'complete' ? '0 0 24px -8px rgba(24,182,99,0.5)' : 'none',
        transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 8, background: dimmed ? '#16161B' : t.soft, color: dimmed ? DIM : t.color, flexShrink: 0 }}>
          <Icon name={node.glyph as IconName} size={16} />
        </span>
        {showRing ? <Ring pct={node.pct} color={node.state === 'complete' ? GREEN : t.color} /> : node.state === 'locked' ? <Icon name="lock" size={15} /> : null}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 600, fontSize: 15, lineHeight: 1.15, color: dimmed && node.state !== 'building' ? '#9C9CA6' : INK, letterSpacing: '-0.01em' }}>
          {node.name}
        </div>
        <div style={{ ...mono, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: chip.color, marginTop: 6 }}>
          {t.label} · {chip.label}
        </div>
      </div>
    </div>
  )
}
