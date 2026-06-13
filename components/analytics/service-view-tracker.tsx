'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/events'

export function ServiceViewTracker({
  slug,
}: {
  slug: string
  tier: string
}) {
  useEffect(() => {
    trackEvent('service_view', { slug })
  }, [slug])
  return null
}
