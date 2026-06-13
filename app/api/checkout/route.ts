import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { tiersBySlug } from '@/data/services/tiers'
import { isSelfServe } from '@/data/services/tier-classification'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'checkout' })
  if (limited) return limited

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Checkout unavailable' }, { status: 503 })
  }

  let body: { slug?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
  if (!slug || slug.length > 64) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const tier = tiersBySlug[slug]

  if (!tier || !isSelfServe(tier)) {
    return NextResponse.json(
      { error: 'This engagement is by consultation — please book a call.' },
      { status: 400 },
    )
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sageideas.dev'

  // Stable key per (ip, slug, day) so a refresh doesn't open a second session.
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  const dayBucket = new Date().toISOString().slice(0, 10)
  const idempotencyKey = createHash('sha256')
    .update(`tier:${tier.slug}:${ip}:${dayBucket}`)
    .digest('hex')

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [{ price: tier.stripePriceId!, quantity: 1 }],
        success_url: `${base}/checkout/success?slug=${tier.slug}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/checkout/cancel?slug=${tier.slug}`,
        billing_address_collection: 'auto',
        customer_creation: 'always',
        automatic_tax: { enabled: false },
        allow_promotion_codes: true,
        metadata: { kind: 'service', slug: tier.slug, tier_name: tier.name },
        payment_intent_data: { metadata: { kind: 'service', slug: tier.slug } },
      },
      { idempotencyKey },
    )
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] stripe error:', err)
    return NextResponse.json(
      { error: "Couldn't start checkout. Please try again." },
      { status: 502 },
    )
  }
}
