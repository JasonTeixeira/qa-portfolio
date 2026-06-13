import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { tiersBySlug } from '@/data/services/tiers'
import { careTiersBySlug } from '@/data/services/tiers'
import { isSelfServe } from '@/data/services/tier-classification'
import { rateLimit } from '@/lib/rate-limit'
import { getStripe, isStripeConfigured } from '@/lib/stripe/client'

export const runtime = 'nodejs'

// Rate limit is intentionally tight (10/60s) — this is a payment endpoint.
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'checkout' })
  if (limited) return limited

  // Parse + validate body first — these steps need no Stripe env.
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

  // Resolve the slug to either a one-time service tier or a care retainer.
  const tier = tiersBySlug[slug]
  const careTier = careTiersBySlug[slug]

  if (tier) {
    // One-time self-serve tiers only — custom/monthly/non-self-serve → book a call.
    if (!isSelfServe(tier)) {
      return NextResponse.json(
        { error: 'This engagement is by consultation — please book a call.' },
        { status: 400 },
      )
    }

    // Slug is valid and self-serve — now we need Stripe.
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Checkout unavailable' }, { status: 503 })
    }

    const stripe = getStripe()
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sageideas.dev'

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

  if (careTier) {
    // Care retainer subscription — monthly cadence, mode: 'subscription'.
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Checkout unavailable' }, { status: 503 })
    }

    const stripe = getStripe()
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sageideas.dev'

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const dayBucket = new Date().toISOString().slice(0, 10)
    const idempotencyKey = createHash('sha256')
      .update(`care:${careTier.slug}:${ip}:${dayBucket}`)
      .digest('hex')

    try {
      const session = await stripe.checkout.sessions.create(
        {
          mode: 'subscription',
          line_items: [{ price: careTier.stripePriceId, quantity: 1 }],
          success_url: `${base}/checkout/success?slug=${careTier.slug}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/checkout/cancel?slug=${careTier.slug}`,
          billing_address_collection: 'auto',
          automatic_tax: { enabled: false },
          metadata: { kind: 'care', tier_slug: careTier.slug, tier_name: careTier.name },
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

  // Slug matched neither a known service tier nor a care retainer.
  return NextResponse.json(
    { error: 'This engagement is by consultation — please book a call.' },
    { status: 400 },
  )
}
