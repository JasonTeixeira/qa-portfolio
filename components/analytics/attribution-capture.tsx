'use client'

import { useEffect } from 'react'
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_SECONDS,
  extractAttributionFromUrl,
  serializeAttribution,
} from '@/lib/analytics/attribution'

function hasAttributionCookie() {
  return document.cookie.split(';').some((part) => part.trim().startsWith(`${ATTRIBUTION_COOKIE}=`))
}

export function AttributionCapture() {
  useEffect(() => {
    if (hasAttributionCookie()) return

    try {
      const attribution = extractAttributionFromUrl(window.location.href, document.referrer)
      const encoded = serializeAttribution(attribution)
      document.cookie = [
        `${ATTRIBUTION_COOKIE}=${encoded}`,
        `Max-Age=${ATTRIBUTION_MAX_AGE_SECONDS}`,
        'Path=/',
        'SameSite=Lax',
        window.location.protocol === 'https:' ? 'Secure' : '',
      ]
        .filter(Boolean)
        .join('; ')
    } catch {
      // Attribution should never interfere with rendering or form submission.
    }
  }, [])

  return null
}
