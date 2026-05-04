'use client'

import { useEffect } from 'react'
import { track } from './posthog-provider'

export function PageViewTracker({
  event,
  props,
}: {
  event: string
  props?: Record<string, unknown>
}) {
  useEffect(() => {
    track(event, props)
    // intentionally only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
