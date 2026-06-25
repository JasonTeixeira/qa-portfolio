'use client'

import { useEffect } from 'react'

/**
 * Captures a `?ref=CODE` from the URL into the `sage_ref` cookie so the signup
 * action can attribute the new learner to their referrer. Renders nothing.
 */
export function ReferralCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (!ref) return
    const clean = ref.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
    if (clean) document.cookie = `sage_ref=${clean}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
  }, [])
  return null
}
