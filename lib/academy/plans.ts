/**
 * Sage Academy all-access membership plans. Two recurring options that unlock
 * every course, lab, and certificate. Price IDs come from env so the same code
 * runs against test + live Stripe keys.
 *
 * Set in .env.local (and Vercel):
 *   STRIPE_PRICE_ACADEMY_ALLACCESS_MONTHLY=price_…
 *   STRIPE_PRICE_ACADEMY_ALLACCESS_YEARLY=price_…
 */

export type PlanInterval = 'monthly' | 'yearly'

export type AcademyPlan = {
  interval: PlanInterval
  /** display price, e.g. "$20" */
  price: string
  /** cadence suffix, e.g. "/month" */
  cadence: string
  /** amount in cents — informational; Stripe is the source of truth */
  amountCents: number
  priceEnvVar: string
  /** marketing line shown on the yearly plan */
  note?: string
  badge?: string
}

export const ACADEMY_PLANS: Record<PlanInterval, AcademyPlan> = {
  monthly: {
    interval: 'monthly',
    price: '$20',
    cadence: '/month',
    amountCents: 2000,
    priceEnvVar: 'STRIPE_PRICE_ACADEMY_ALLACCESS_MONTHLY',
  },
  yearly: {
    interval: 'yearly',
    price: '$200',
    cadence: '/year',
    amountCents: 20000,
    priceEnvVar: 'STRIPE_PRICE_ACADEMY_ALLACCESS_YEARLY',
    note: 'Two months free vs monthly',
    badge: 'Best value',
  },
}

export function getAcademyPriceId(interval: PlanInterval): string | undefined {
  const v = process.env[ACADEMY_PLANS[interval].priceEnvVar]
  return v && v.trim() ? v.trim() : undefined
}

/** True once both recurring prices are configured — used to show/hide the join CTA. */
export function academyPlansConfigured(): boolean {
  return !!getAcademyPriceId('monthly') || !!getAcademyPriceId('yearly')
}
