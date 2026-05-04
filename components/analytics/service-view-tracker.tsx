'use client'

import { useEffect } from 'react'
import { track } from './posthog-provider'

export function ServiceViewTracker({
  slug,
  tier,
}: {
  slug: string
  tier: string
}) {
  useEffect(() => {
    track('service_view', { slug, tier })
  }, [slug, tier])
  return null
}
