'use client'

import { NarratedDiagram, type DiagramStoryboard } from '@/components/academy/visuals/NarratedDiagram'
import type { SageDiagramNode, SageDiagramEdge, SageDiagramLegendItem } from '@/components/academy/visuals/SageDiagram'
import samples from '../diagram-preview/samples.json'

// idempotent-charge diagram (real lesson spec)
const s = (samples as unknown as Array<{
  title: string; subtitle?: string; rankdir?: 'LR' | 'TB' | 'RL' | 'BT'
  nodes: SageDiagramNode[]; edges: SageDiagramEdge[]; legend?: SageDiagramLegendItem[]
}>)[1]

// The narration: one beat per idea, each spotlighting what it's about.
const STORYBOARD: DiagramStoryboard = [
  { say: 'A charge begins — the client POSTs the request with an Idempotency-Key.', nodes: ['client', 'handler'], edges: [['client', 'handler']], ms: 3800 },
  { say: 'The handler reserves that key in the SAME transaction as the charge — one atomic write.', nodes: ['handler', 'keys', 'charges'], edges: [['handler', 'keys'], ['handler', 'charges']], ms: 4400 },
  { say: 'It hits the payment gateway exactly once — the external effect that must never repeat.', nodes: ['handler', 'gateway'], edges: [['handler', 'gateway']], ms: 4000 },
  { say: 'Now a replay arrives — the same key, a second time.', nodes: ['replay', 'keys'], edges: [['replay', 'keys']], ms: 3400 },
  { say: 'The key already exists, so the stored result returns straight to the client — no second charge.', nodes: ['keys', 'client'], edges: [['keys', 'client']], ms: 4400 },
  { say: 'That is idempotency: the key store is the single source of truth, and the gateway is only ever charged once.', nodes: ['keys', 'gateway'], edges: [], ms: 4800 },
]

export default function NarratedDemo() {
  return (
    <main style={{ background: '#0B0B0E', minHeight: '100vh', padding: '48px clamp(16px,4vw,64px)', color: '#F2EFE9' }}>
      <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, letterSpacing: '0.14em', color: '#83AFFF', textTransform: 'uppercase' }}>
        Sage engine — narrated diagram (voice-sync-ready)
      </p>
      <h1 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(1.8rem,1.3rem+2vw,2.6rem)', fontWeight: 500, margin: '8px 0 6px', letterSpacing: '-0.02em' }}>
        The diagram explains itself.
      </h1>
      <p style={{ color: '#9598A2', maxWidth: 640, lineHeight: 1.6, marginBottom: 28 }}>
        One storyboard, six beats. Each beat spotlights what it&rsquo;s about, fires the dataflow,
        and shows the line the voice will speak — auto-advancing on a timeline. When the voice
        engine lands, the same beats sync to the audio.
      </p>
      <div style={{ maxWidth: 1000 }}>
        <NarratedDiagram
          title={s.title}
          subtitle={s.subtitle}
          rankdir={s.rankdir ?? 'LR'}
          nodes={s.nodes}
          edges={s.edges}
          legend={s.legend}
          storyboard={STORYBOARD}
        />
      </div>
    </main>
  )
}
