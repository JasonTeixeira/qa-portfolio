import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { tiersBySlug } from '@/data/services/tiers'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 })
  }

  let body: { slug?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { slug } = body
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  const tier = tiersBySlug[slug]
  if (!tier) {
    return NextResponse.json({ error: `Unknown tier: ${slug}` }, { status: 404 })
  }

  // Custom-cadence tiers (Build) should route to /book, not Stripe
  if (tier.cadence === 'custom') {
    return NextResponse.json({ error: 'This tier requires a discovery call.' }, { status: 422 })
  }

  if (!tier.stripePriceId) {
    return NextResponse.json({ error: 'No Stripe price configured for this tier' }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sageideas.dev'

  // Determine checkout mode
  const mode = tier.cadence === 'monthly' ? 'subscription' : 'payment'

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: [{ price: tier.stripePriceId, quantity: 1 }],
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    billing_address_collection: 'auto',
    automatic_tax: { enabled: false },
    metadata: { tier_slug: tier.slug, tier_name: tier.name },
  }

  if (mode === 'payment') {
    sessionParams.customer_creation = 'always'
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  return NextResponse.json({ url: session.url })
}
