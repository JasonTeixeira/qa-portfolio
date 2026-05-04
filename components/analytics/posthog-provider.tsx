'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

let initialized = false

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (initialized) return
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      person_profiles: 'identified_only',
    })
    initialized = true
  }, [])

  return <>{children}</>
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!initialized) return
  try {
    posthog.capture(event, props)
  } catch {}
}
