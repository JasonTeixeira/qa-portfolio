/**
 * Pure weekly league rollover — NO 'server-only', NO DB. Unit-testable.
 * The weekly cron (app/api/cron/academy/weekly) seats each learner into next
 * week's league using `toTier` computed here. Reuses the tested movement rules.
 */

import { movementForRank, nextTier, prevTier, type Movement, type TierIndex } from '@/lib/academy/leagues-logic'

export interface RolloverMember {
  userId: string
  rank: number
}

export interface RolloverOutcome {
  userId: string
  fromTier: TierIndex
  toTier: TierIndex
  movement: Movement
}

/**
 * Given a finished league's tier and its final ranked roster, decide each
 * member's destination tier for the next week. Top ranks promote up, bottom
 * ranks relegate down, the middle holds — clamped at the tier ends.
 */
export function rolloverLeague(tier: TierIndex, ranked: RolloverMember[]): RolloverOutcome[] {
  const total = ranked.length
  return ranked.map((m) => {
    const movement = movementForRank(m.rank, total, tier)
    const toTier = movement === 'promote' ? nextTier(tier) : movement === 'relegate' ? prevTier(tier) : tier
    return { userId: m.userId, fromTier: tier, toTier, movement }
  })
}
