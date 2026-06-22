'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { MotionConfig } from 'framer-motion'

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
      // No session recording on marketing — keeps the ~50-80KB rrweb recorder
      // out of the bundle and avoids recording prospects on the public site.
      disable_session_recording: true,
    })
    initialized = true
  }, [])

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!initialized) return
  try {
    posthog.capture(event, props)
  } catch {}
}
