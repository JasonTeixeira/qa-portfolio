'use client'

import * as React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Surface, MonoLabel, Hairline, Reveal } from '@/components/el'

export interface Capability {
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  href: string
}

interface CapabilityLanesProps {
  capabilities: Capability[]
}

/**
 * CapabilityLanes — Engineered Luxury restyle of the "Four lanes" act.
 *
 * A 2x2 ruled bento of capability lanes instead of the neon horizontal rail.
 * Each lane: an index, a hairline-framed mono icon, a Fraunces title, and an
 * "engage →" affordance. One teal accent on hover (border + icon), depth from
 * the surface ramp. No colored glow per-card.
 */
export function CapabilityLanes({ capabilities }: CapabilityLanesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {capabilities.map((cap, i) => {
        const Icon = cap.icon
        return (
          <Reveal key={cap.title} delay={i * 0.06}>
            <Link href={cap.href} className="group block h-full">
              <Surface level={2} interactive className="flex h-full flex-col p-7 sm:p-8">
                <div className="flex items-start justify-between">
                  <span
                    aria-hidden
                    className="flex h-11 w-11 items-center justify-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-1)] text-[var(--sage-ink-muted)] transition-colors duration-200 group-hover:border-[#0ED3CF]/50 group-hover:text-[#0ED3CF]"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <MonoLabel tone="faint" className="tabular-nums">
                    0{i + 1}
                  </MonoLabel>
                </div>

                <MonoLabel tone="accent" as="div" className="mt-6">
                  {cap.subtitle}
                </MonoLabel>
                <h3
                  className="mt-2 text-2xl font-normal tracking-[-0.02em] text-[var(--sage-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {cap.title}
                </h3>
                <p className="mt-3 flex-1 text-[15px] leading-[1.65] text-[var(--sage-ink-muted)]">
                  {cap.description}
                </p>

                <Hairline className="mt-6" />
                <span className="mt-4 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)] transition-colors group-hover:text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace]">
                  engage
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
