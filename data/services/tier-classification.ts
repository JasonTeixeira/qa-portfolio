// Tier classification for service detail pages.
// flagship → existing FlagshipPageContent (unchanged)
// A → tier-a-page (full mini-flagship, ~80% complexity)
// B → tier-b-page (mini-flagship lite)
// C → tier-c-page (productized card layout)

import type { Tier } from './tiers'
import type { ExtendedTier } from './extended'

export type ServiceTier = 'flagship' | 'A' | 'B' | 'C'

const PRICE_RX = /\$([\d,]+)/

function parsePriceFloor(price: string): number {
  const m = price.match(PRICE_RX)
  if (!m) return 0
  return Number(m[1].replace(/,/g, ''))
}

export function getServiceTier(service: Tier | ExtendedTier): ServiceTier {
  if ((service as ExtendedTier).category === 'ai-flagship') return 'flagship'

  const floor = parsePriceFloor(service.price)
  const isRecurring = service.cadence === 'monthly'

  if (floor >= 5000 && !isRecurring) return 'A'
  if (floor < 1500 || isRecurring) return 'C'
  return 'B'
}

export const tierLabel: Record<ServiceTier, string> = {
  flagship: 'FLAGSHIP',
  A: 'DEEP',
  B: 'STANDARD',
  C: 'PRODUCTIZED',
}

export const tierOrder: Record<ServiceTier, number> = {
  flagship: 0,
  A: 1,
  B: 2,
  C: 3,
}
