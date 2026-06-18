'use client'

import * as React from 'react'
import Link from 'next/link'
import { Surface, MonoLabel, Hairline } from '@/components/el'
import { CareCheckoutButton } from '@/components/studio/care-checkout-button'
import type { CareTier } from '@/data/services/tiers'

export interface CareCardProps {
  care: CareTier
  index: string
}

/**
 * CareCard — Engineered Luxury card for the monthly care retainers. Uses the
 * live CareCheckoutButton (subscription Stripe flow). Quieter than the
 * productized TierCards — care plans are upkeep, not the headline.
 */
export function CareCard({ care, index }: CareCardProps) {
  return (
    <Surface level={2} className="flex h-full flex-col p-7">
      <div className="flex items-center justify-between">
        <MonoLabel tone="muted">{'// retainer'}</MonoLabel>
        <MonoLabel tone="faint" className="tabular-nums">
          {index}
        </MonoLabel>
      </div>

      <h3
        className="mt-5 text-xl font-normal tracking-[-0.01em] text-[var(--sage-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {care.name}
      </h3>
      <p className="mt-2 text-sm leading-[1.6] text-[var(--sage-ink-muted)]">
        {care.tagline}
      </p>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span
          className="text-3xl leading-none tabular-nums text-[var(--sage-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {care.price}
        </span>
        <span className="text-sm text-[var(--sage-ink-faint)]">/mo</span>
      </div>

      <Hairline className="my-5" />

      <ul className="space-y-2 flex-1">
        {care.outcomes.map((o) => (
          <li
            key={o}
            className="flex gap-3 text-[13px] leading-[1.5] text-[var(--sage-ink-muted)]"
          >
            <span aria-hidden className="mt-[7px] h-px w-3 shrink-0 bg-[var(--sage-border-hover)]" />
            <span>{o}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3">
        <CareCheckoutButton care={care} variant="secondary" />
        <Link
          href={`/services/${care.slug}`}
          className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)] transition-colors hover:text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]"
        >
          <span>details</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </Surface>
  )
}
