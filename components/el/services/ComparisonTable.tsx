'use client'

import * as React from 'react'
import Link from 'next/link'
import { MonoLabel } from '@/components/el'
import type { Tier } from '@/data/services/tiers'
import { isSelfServe } from '@/data/services/tier-classification'

export interface ComparisonTableProps {
  tiers: Tier[]
  /** Slug to mark as the recommended row. */
  recommendedSlug?: string
}

const MODE_LABEL: Record<Tier['mode'], string> = {
  audit: 'Audit',
  sprint: 'Sprint',
  build: 'Build',
  operate: 'Operate',
}

const CADENCE_LABEL: Record<Tier['cadence'], string> = {
  'one-time': 'One-time',
  monthly: 'Monthly',
  custom: 'Custom',
}

/**
 * ComparisonTable — an honest, ruled comparison of every productized tier.
 * Prices come straight from tiers.ts (single source of truth). The
 * "Checkout" column states plainly whether a tier is self-serve Stripe or
 * routes to a scoping call — no fake urgency, no inflated anchors.
 */
export function ComparisonTable({ tiers, recommendedSlug }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-[3px] border border-[var(--sage-border)]">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <caption className="sr-only">
          Comparison of productized engagement tiers by price, timeline, cadence, and checkout type
        </caption>
        <thead>
          <tr className="bg-[var(--sage-surface-1)] [&>th]:border-b [&>th]:border-[var(--sage-border)] [&>th]:px-5 [&>th]:py-4">
            {['Engagement', 'Price', 'Timeline', 'Cadence', 'How to start'].map((h) => (
              <th key={h} scope="col">
                <MonoLabel tone="muted">{h}</MonoLabel>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[font-family:var(--font-mono),ui-monospace,monospace]">
          {tiers.map((tier) => {
            const isRec = tier.slug === recommendedSlug
            const selfServe = isSelfServe(tier)
            return (
              <tr
                key={tier.slug}
                className={`border-b border-[var(--sage-border)] last:border-b-0 transition-colors hover:bg-[var(--sage-surface-2)] ${
                  isRec ? 'bg-[#3D5AFE]/[0.04]' : 'bg-[var(--sage-surface-1)]'
                }`}
              >
                <th scope="row" className="px-5 py-4 align-top">
                  <Link
                    href={`/services/${tier.slug}`}
                    className="text-sm font-medium text-[var(--sage-ink)] underline-offset-4 hover:text-[#3D5AFE] hover:underline [font-family:var(--font-display)]"
                  >
                    {tier.name}
                  </Link>
                  {isRec && (
                    <span className="ml-2 align-middle text-[9px] uppercase tracking-[0.18em] text-[#3D5AFE]">
                      recommended
                    </span>
                  )}
                  <p className="mt-1 max-w-[28ch] text-[11px] leading-snug text-[var(--sage-ink-faint)] [font-family:var(--font-sans)]">
                    {tier.tagline}
                  </p>
                </th>
                <td className="px-5 py-4 align-top tabular-nums text-sm text-[var(--sage-ink)]">
                  {tier.price}
                </td>
                <td className="px-5 py-4 align-top text-[13px] text-[var(--sage-ink-muted)]">
                  {tier.timeline}
                </td>
                <td className="px-5 py-4 align-top text-[13px] text-[var(--sage-ink-muted)]">
                  {CADENCE_LABEL[tier.cadence]} · {MODE_LABEL[tier.mode]}
                </td>
                <td className="px-5 py-4 align-top text-[13px]">
                  <span className={selfServe ? 'text-[#3D5AFE]' : 'text-[var(--sage-ink-muted)]'}>
                    {selfServe ? 'Instant checkout' : 'Scope on a call'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
