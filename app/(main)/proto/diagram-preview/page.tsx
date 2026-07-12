'use client'
import { SageDiagram, type SageDiagramNode, type SageDiagramEdge } from '@/components/academy/visuals/SageDiagram'
import samples from './samples.json'
type Sample = { lesson: string; title: string; subtitle?: string; rankdir?: 'LR'|'TB'|'RL'|'BT'; legend?: unknown[]; nodes: unknown[]; edges: unknown[] }
export default function DiagramPreview() {
  return (
    <main style={{ background: '#0B0B0E', minHeight: '100vh', padding: '48px clamp(16px,4vw,64px)', color: '#F2EFE9' }}>
      <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.12em', color: '#9598A2', textTransform: 'uppercase' }}>SageDiagram — current concept-map render (3 real lessons)</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 56, marginTop: 32, maxWidth: 1100 }}>
        {(samples as Sample[]).map((s, i) => (
          <section key={i}>
            <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: '#3D5AFE', marginBottom: 10 }}>{s.lesson}</p>
            <SageDiagram title={s.title} subtitle={s.subtitle} rankdir={s.rankdir ?? 'LR'} nodes={s.nodes as SageDiagramNode[]} edges={s.edges as SageDiagramEdge[]} legend={s.legend as never} />
          </section>
        ))}
      </div>
    </main>
  )
}
