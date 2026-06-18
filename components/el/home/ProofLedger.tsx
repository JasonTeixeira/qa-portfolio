'use client'

import * as React from 'react'
import Link from 'next/link'
import { Surface, MonoLabel, Hairline, Reveal } from '@/components/el'
import { proofPoints, type ProofPoint } from '@/data/social-proof/testimonials'

const KIND_META: Record<ProofPoint['kind'], { dot: string; label: string }> = {
  shipped: { dot: 'var(--sage-lime)', label: 'shipped' },
  reference: { dot: '#3D5AFE', label: 'reference' },
  principle: { dot: 'var(--sage-coral)', label: 'principle' },
}

/**
 * ProofLedger — Engineered Luxury restyle of the verifiable ProofGrid. Same
 * honest proof points (shipped work, callable references, first principles),
 * rendered as ruled ledger cards with a kind sigil + index. No invented quotes.
 */
export function ProofLedger({ points = proofPoints }: { points?: ProofPoint[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {points.map((point, i) => {
        const meta = KIND_META[point.kind]
        const inner = (
          <Surface
            level={2}
            interactive={Boolean(point.href)}
            className="flex h-full flex-col gap-3 p-6"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: meta.dot }}
                />
                <MonoLabel tone="muted">{meta.label}</MonoLabel>
              </span>
              <MonoLabel tone="faint" className="tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </MonoLabel>
            </div>

            <p
              className="text-lg font-normal leading-snug text-[var(--sage-ink)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {point.label}
            </p>

            <Hairline />
            <p className="text-xs leading-relaxed text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
              {point.detail}
            </p>

            {point.href && (
              <span
                aria-hidden
                className="mt-auto self-end text-xs text-[var(--sage-ink-faint)] transition-colors [font-family:var(--font-mono),ui-monospace,monospace] group-hover:text-[#3D5AFE]"
              >
                →
              </span>
            )}
          </Surface>
        )

        return (
          <li key={point.label} className="h-full">
            {point.href ? (
              <Reveal delay={i * 0.04} className="group block h-full">
                <Link href={point.href} className="block h-full rounded-[3px]">
                  {inner}
                </Link>
              </Reveal>
            ) : (
              <Reveal delay={i * 0.04} className="h-full">
                {inner}
              </Reveal>
            )}
          </li>
        )
      })}
    </ul>
  )
}
