import { NextRequest, NextResponse } from 'next/server'
import { tiersBySlug } from '@/data/services/tiers'
import { isSelfServe } from '@/data/services/tier-classification'
import { getStripe, isStripeConfigured } from '@/lib/stripe/client'
import { rateLimit } from '@/lib/rate-limit'

/**
 * GET /checkout/<slug> — a shareable, linkable checkout for self-serve
 * service tiers. The in-app flows POST to /api/checkout and follow the JSON
 * url; but tier ctaHrefs ("/checkout/audit") and external links (the agency
 * portfolio's package CTAs) navigate directly, which 404'd before this
 * route existed. Creates the same Stripe session (same idempotency scheme)
 * and 302s straight to Stripe. Non-self-serve or unknown slugs land on the
 * booking page instead of an error.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const limited = await rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'checkout-link' })
  if (limited) return limited
  const { slug } = await ctx.params
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sageideas.dev'

  const tier = tiersBySlug[slug]
  if (!tier || !isSelfServe(tier) || !tier.stripePriceId || !isStripeConfigured()) {
    return NextResponse.redirect(`${base}/book?from=checkout-${encodeURIComponent(slug).slice(0, 64)}`, 302)
  }

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [{ price: tier.stripePriceId, quantity: 1 }],
        success_url: `${base}/checkout/success?slug=${tier.slug}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/checkout/cancel?slug=${tier.slug}`,
        billing_address_collection: 'auto',
        customer_creation: 'always',
        automatic_tax: { enabled: false },
        allow_promotion_codes: true,
        metadata: { kind: 'service', slug: tier.slug, tier_name: tier.name, source: req.nextUrl.searchParams.get('src') ?? 'direct' },
        payment_intent_data: { metadata: { kind: 'service', slug: tier.slug } },
      },
    )
    if (session.url) return NextResponse.redirect(session.url, 302)
  } catch (err) {
    console.error('[checkout/link] stripe error:', err)
  }
  return NextResponse.redirect(`${base}/book?from=checkout-error`, 302)
}
