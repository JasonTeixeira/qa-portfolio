'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/events'

export function CheckoutCompleteTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackEvent('checkout_complete', { slug })
    // Intentionally empty dep array: fire once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
