import { supabaseAdmin } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe/client'
import type { PlanInterval } from '@/lib/academy/plans'

/**
 * Settings-page billing view. Reads the learner's real all-access subscription
 * from academy_allaccess_subscriptions and, when Stripe is configured, their
 * real invoice history straight from Stripe. Everything here is real or absent —
 * the Settings UI omits the whole card when there is no real subscription.
 */

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due'])

export type BillingInvoice = {
  id: string
  number: string
  createdIso: string
  amount: string
  interval: string
  pdfUrl: string | null
}

export type BillingCard = {
  brand: string | null
  last4: string | null
}

export type BillingView = {
  hasSubscription: boolean
  planInterval: PlanInterval
  status: string
  priceLabel: string
  cadenceLabel: string
  renewsIso: string | null
  cancelAtPeriodEnd: boolean
  card: BillingCard | null
  stripeCustomerId: string | null
  invoices: BillingInvoice[]
}

type SubRow = {
  status: string
  plan_interval: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
  price_amount: number | null
  price_currency: string | null
  stripe_customer_id: string | null
}

function money(amountCents: number | null | undefined, currency: string | null | undefined): string {
  if (amountCents == null) return ''
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency ?? 'usd').toUpperCase(),
    }).format(amountCents / 100)
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`
  }
}

function intervalLabel(interval: string | null | undefined): { cadence: string; word: string } {
  const yearly = interval === 'yearly' || interval === 'year'
  return yearly ? { cadence: '/year', word: 'Annual' } : { cadence: '/month', word: 'Monthly' }
}

/**
 * Real billing snapshot for the signed-in learner, or a `hasSubscription: false`
 * view when they have no active all-access membership.
 */
export async function getAcademyBilling(userId: string): Promise<BillingView> {
  const admin = supabaseAdmin()
  const { data } = (await admin
    .from('academy_allaccess_subscriptions')
    .select(
      'status, plan_interval, current_period_end, cancel_at_period_end, price_amount, price_currency, stripe_customer_id',
    )
    .eq('user_id', userId)
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: SubRow | null }

  const empty: BillingView = {
    hasSubscription: false,
    planInterval: 'monthly',
    status: 'none',
    priceLabel: '',
    cadenceLabel: '',
    renewsIso: null,
    cancelAtPeriodEnd: false,
    card: null,
    stripeCustomerId: null,
    invoices: [],
  }

  if (!data || !ACTIVE_STATUSES.has(data.status)) return empty
  if (
    data.current_period_end &&
    new Date(data.current_period_end).getTime() < Date.now()
  ) {
    return empty
  }

  const label = intervalLabel(data.plan_interval)
  const planInterval: PlanInterval = data.plan_interval === 'yearly' ? 'yearly' : 'monthly'

  const view: BillingView = {
    hasSubscription: true,
    planInterval,
    status: data.status,
    priceLabel: money(data.price_amount, data.price_currency),
    cadenceLabel: label.cadence,
    renewsIso: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    card: null,
    stripeCustomerId: data.stripe_customer_id,
    invoices: [],
  }

  // Enrich with real Stripe data (card + invoices) only when Stripe is live and
  // we have a customer id. Any Stripe failure degrades gracefully to the row data.
  if (isStripeConfigured() && data.stripe_customer_id) {
    try {
      const stripe = getStripe()
      const [invoiceList, customer] = await Promise.all([
        stripe.invoices.list({ customer: data.stripe_customer_id, limit: 12 }),
        stripe.customers.retrieve(data.stripe_customer_id, {
          expand: ['invoice_settings.default_payment_method'],
        }),
      ])

      view.invoices = invoiceList.data
        .filter((inv) => inv.status === 'paid' || inv.status === 'open')
        .map((inv) => {
          const createdIso = new Date(inv.created * 1000).toISOString()
          // Invoice line-item price shape varies across Stripe API versions; the
          // learner's current plan interval is the reliable cadence label.
          return {
            id: inv.id ?? createdIso,
            number: inv.number ?? inv.id ?? '—',
            createdIso,
            amount: money(inv.amount_paid || inv.amount_due, inv.currency),
            interval: label.word,
            pdfUrl: inv.invoice_pdf ?? inv.hosted_invoice_url ?? null,
          }
        })

      if (customer && !('deleted' in customer && customer.deleted)) {
        const pm = (customer as { invoice_settings?: { default_payment_method?: unknown } })
          .invoice_settings?.default_payment_method
        if (pm && typeof pm === 'object' && 'card' in pm) {
          const card = (pm as { card?: { brand?: string; last4?: string } }).card
          if (card) {
            view.card = { brand: card.brand ?? null, last4: card.last4 ?? null }
          }
        }
      }
    } catch (err) {
      console.error('[academy/billing] Stripe enrichment failed', err)
    }
  }

  return view
}
