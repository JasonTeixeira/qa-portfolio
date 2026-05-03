'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { CareTier } from '@/data/services/tiers'

export function CareCheckoutButton({
  care,
  label,
  variant = 'primary',
}: {
  care: CareTier
  label?: string
  variant?: 'primary' | 'secondary'
}) {
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: care.slug }),
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
          ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#FAFAFA] font-medium'
          : ''
      }
    >
      {loading ? 'Loading…' : (label ?? `Subscribe — ${care.price}/mo`)}{' '}
      <ArrowRight className="w-4 h-4 ml-1" />
    </Button>
  )
}
