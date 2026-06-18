'use client'

import * as React from 'react'
import Link from 'next/link'
import { Surface, MonoLabel, Hairline, Reveal } from '@/components/el'

export interface EngagementTile {
  kind: string
  title: string
  description: string
  href: string
  cta: string
}

interface EngagementTilesProps {
  tiles: EngagementTile[]
}

/**
 * EngagementTiles — Engineered Luxury restyle of the final-CTA offer tiles.
 * Three ruled engagement lanes (productized / retainer / studio). The first
 * is marked as the primary lane with a teal top-rule + corner ticks; the
 * others stay quiet. No per-card colored gradients or neon.
 */
export function EngagementTiles({ tiles }: EngagementTilesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiles.map((tile, i) => {
        const primary = i === 0
        return (
          <Reveal key={tile.kind} delay={i * 0.06} className="h-full">
            <Link href={tile.href} className="group block h-full">
              <Surface
                level={primary ? 3 : 2}
                ticks={primary}
                interactive
                className="flex h-full flex-col p-7"
              >
                {primary && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#3D5AFE] via-[#3D5AFE]/30 to-transparent"
                  />
                )}
                <div className="flex items-center justify-between">
                  <MonoLabel tone="accent">{`// ${tile.kind}`}</MonoLabel>
                  <MonoLabel tone="faint" className="tabular-nums">
                    0{i + 1}
                  </MonoLabel>
                </div>

                <h3
                  className="mt-5 text-xl font-normal tracking-[-0.01em] text-[var(--sage-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {tile.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-[1.6] text-[var(--sage-ink-muted)]">
                  {tile.description}
                </p>

                <Hairline className="mt-6" />
                <span className="mt-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)] transition-colors group-hover:text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]">
                  {tile.cta}
                  <span
                    aria-hidden
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Surface>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
