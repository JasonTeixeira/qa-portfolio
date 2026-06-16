'use client'

import { useEffect } from 'react'
import { trackEvent, type EventName } from '@/lib/analytics/events'

export function PageViewTracker({
  event,
  props,
}: {
  event: EventName
  props?: Record<string, unknown>
}) {
  useEffect(() => {
    trackEvent(event, props as never)
    // intentionally only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
