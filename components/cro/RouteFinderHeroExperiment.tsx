'use client'

import { TrackedLink } from '@/components/analytics/tracked-link'
import { SystemFlowLayer } from '@/components/living/SystemFlowLayer'
import { EXPERIMENT_FLAGS, useExperiment } from '@/lib/analytics/experiments'

type Props = {
  surface: 'home' | 'services' | 'pricing'
}

export function RouteFinderHeroExperiment({ surface }: Props) {
  const variant = useExperiment(EXPERIMENT_FLAGS.routeFinderHeroEntry)

  if (variant !== 'treatment') return null

  const href = `/tools/route-finder?source=${surface}_hero_experiment`

  return (
    <SystemFlowLayer
      aria-label="Route Finder diagnostic"
      className="mx-auto mb-8 mt-4 max-w-7xl border border-[rgba(61,90,254,0.34)] bg-[rgba(20,20,24,0.84)] p-4 text-[var(--sage-ink)] shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-5 lg:mb-10"
      variant="systems"
      intensity="normal"
      data-experiment={EXPERIMENT_FLAGS.routeFinderHeroEntry}
      data-variant="treatment"
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--sage-accent-readable)]">
            Diagnostic route
          </p>
          <h2 className="text-xl font-extrabold tracking-[-0.01em] text-[var(--sage-ink)] sm:text-2xl">
            Not sure if you need studio, academy, audit, or build?
          </h2>
          <p className="mt-2 max-w-[68ch] text-sm leading-6 text-[var(--sage-ink-muted)]">
            Answer four questions and get the right path before you browse packages.
          </p>
        </div>
        <TrackedLink
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--sage-accent)] px-5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--sage-brand-bright)]"
          href={href}
          event="cta_click"
          eventProps={{
            location: `${surface}_hero_experiment`,
            label: 'route_finder_hero_entry',
            href,
          }}
        >
          Find my route →
        </TrackedLink>
      </div>
    </SystemFlowLayer>
  )
}
