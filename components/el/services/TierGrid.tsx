'use client'

import * as React from 'react'
import { Reveal } from '@/components/el'
import type { Tier } from '@/data/services/tiers'
import { TierCard } from './TierCard'

export interface TierGridProps {
  tiers: Tier[]
  /** Slug of the single tier to mark as recommended (the one teal accent). */
  recommendedSlug?: string
  /** Index offset so markers continue across multiple grids. Default 0. */
  startIndex?: number
}

/**
 * TierGrid — the Engineered Luxury productized-tier grid. Renders TierCards
 * with continuous mono index markers and a single recommended accent. Prices
 * come from each Tier (tiers.ts). Used on /pricing and /services.
 */
export function TierGrid({ tiers, recommendedSlug, startIndex = 0 }: TierGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tiers.map((tier, i) => (
        <Reveal key={tier.slug} delay={(i % 3) * 0.06} className="h-full">
          <TierCard
            tier={tier}
            index={String(startIndex + i + 1).padStart(2, '0')}
            recommended={tier.slug === recommendedSlug}
          />
        </Reveal>
      ))}
    </div>
  )
}
