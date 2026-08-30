'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

const INK = '#F2EFE9'
const ACCENT_INK = '#8FA0FF'
const LINE = '#1E1E24'
const mono = { fontFamily: 'var(--font-mono), monospace' } as const
const serif = { fontFamily: 'var(--font-serif), Georgia, serif' } as const

/**
 * Registry of labs that are playable in-browser. A slug maps to its interactive
 * component (lazy-loaded, client-only — Pyodide etc. never download until the
 * lab is on screen). Labs without an entry simply don't render this section, so
 * the spec/proof pages degrade cleanly. Add a playable lab = add one line here.
 */
const REGISTRY: Record<string, ComponentType> = {
  'idempotent-charge-api': dynamic(
    () => import('@/components/academy/sample/IdempotencyLab').then((m) => m.IdempotencyLab),
    { ssr: false, loading: () => <div style={{ ...mono, fontSize: 12, color: '#5A5A64', padding: '24px 0' }}>Loading the runtime…</div> },
  ),
}

export function hasInteractiveLab(slug: string): boolean {
  return slug in REGISTRY
}

export function InteractiveLab({ slug }: { slug: string }) {
  const Comp = REGISTRY[slug]
  if (!Comp) return null
  return (
    <section style={{ borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(20px, 4vw, 48px)' }}>
        <div style={{ ...mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: ACCENT_INK }}>
          Run it in your browser
        </div>
        <h2 style={{ ...serif, margin: '10px 0 0', fontWeight: 600, fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.08, letterSpacing: '-0.02em', color: INK }}>
          Do the work — watch the check go green.
        </h2>
        <div style={{ marginTop: 24 }}>
          <Comp />
        </div>
      </div>
    </section>
  )
}
