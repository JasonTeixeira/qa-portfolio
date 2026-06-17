'use client'

import { useEffect, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { trackEvent } from './events'

export type ExperimentVariant = 'control' | 'treatment'

export const EXPERIMENT_FLAGS = {
  routeFinderHeroEntry: 'route_finder_hero_entry',
} as const

export function getVariant(flagKey: string): ExperimentVariant {
  if (typeof window === 'undefined') return 'control'

  try {
    const variant = posthog.getFeatureFlag(flagKey)
    return variant === 'treatment' || variant === true ? 'treatment' : 'control'
  } catch {
    return 'control'
  }
}

export function useExperiment(flagKey: string): ExperimentVariant {
  const [variant, setVariant] = useState<ExperimentVariant>('control')
  const trackedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const update = () => {
      if (cancelled) return
      const next = getVariant(flagKey)
      setVariant(next)
      if (!trackedRef.current) {
        trackedRef.current = true
        trackEvent('experiment_viewed', { flag: flagKey, variant: next })
      }
    }

    try {
      posthog.onFeatureFlags(update)
    } catch {
      update()
    }

    const fallback = window.setTimeout(update, 1200)
    return () => {
      cancelled = true
      window.clearTimeout(fallback)
    }
  }, [flagKey])

  return variant
}
