'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { Tier } from '@/data/services/tiers'

export function CheckoutButton({
  tier,
  label,
  variant = 'primary',
}: {
  tier: Tier
  label?: string
  variant?: 'primary' | 'secondary'
}) {
  const [loading, setLoading] = useState(false)

  // Inquiry-only flow: tier has no Stripe price configured.
  // Used by all extended catalog services (AI / automation / retainers / bundles)
  // and the legacy 'custom' Build tier. Routes to ctaHref (/contact?engagement=… or /book).
  const hasStripeCheckout = Boolean(tier.stripePriceId) && tier.cadence !== 'custom'
  if (!hasStripeCheckout) {
    const href =
      tier.cadence === 'custom'
        ? `/book?tier=${tier.slug}`
        : tier.ctaHref || `/contact?engagement=${tier.slug}`
    return (
      <Button
        asChild
        size="lg"
        className={
          variant === 'primary'
            ? 'bg-[#06B6D4] hover:bg-[#0891B2] text-[#09090B] font-medium'
            : ''
        }
      >
        <a href={href}>
          {label ?? tier.cta} <ArrowRight className="w-4 h-4 ml-1" />
        </a>
      </Button>
    )
  }

  const onClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: tier.slug }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      disabled={loading}
      onClick={onClick}
      className={
        variant === 'primary'
          ? 'bg-[#06B6D4] hover:bg-[#0891B2] text-[#09090B] font-medium'
          : ''
      }
    >
      {loading ? 'Loading…' : (label ?? tier.cta)}{' '}
      <ArrowRight className="w-4 h-4 ml-1" />
    </Button>
  )
}
