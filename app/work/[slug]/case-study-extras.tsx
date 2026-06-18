// Server-rendered editorial extras for case studies.
// Sits between the main case-study view and the sticky CTA.
// All children are RSC — zero added client JS.

import type { CaseExtras } from '@/data/work/case-extras'
import { CodeSample } from '@/components/work/code-sample'
import { NearMissLedger } from '@/components/el/work/NearMissLedger'
import { MonoLabel, Hairline } from '@/components/el'

interface Props {
  extras: CaseExtras
}

const DISPLAY_STYLE = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.018em',
} as const

export function CaseStudyExtras({ extras }: Props) {
  if (!extras.almostHappened?.length && !extras.codeSamples?.length && !extras.pullQuote) {
    return null
  }

  return (
    <section
      aria-label="Build log and honesty"
      className="relative border-t border-[var(--sage-border)] bg-[var(--sage-bg)]"
    >
      <div className="mx-auto max-w-4xl space-y-16 px-5 py-16 sm:px-8 lg:py-24">
        {/* Pull quote */}
        {extras.pullQuote && (
          <figure className="border-l border-[#3D5AFE] pl-6 sm:pl-8">
            <blockquote
              className="text-[clamp(1.5rem,_1.1rem_+_1.6vw,_2.5rem)] font-normal leading-[1.18] tracking-[-0.018em] text-[var(--sage-ink)]"
              style={DISPLAY_STYLE}
            >
              <span className="italic">&ldquo;{extras.pullQuote}&rdquo;</span>
            </blockquote>
            <figcaption className="mt-4 text-[10px] uppercase tracking-[0.22em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
              {'// build log · entry 04'}
            </figcaption>
          </figure>
        )}

        {/* What almost happened */}
        {extras.almostHappened && extras.almostHappened.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-4">
              <MonoLabel tone="accent">{`// honesty`}</MonoLabel>
              <Hairline className="flex-1" />
            </div>
            <h2
              className="text-[clamp(1.6rem,_1.2rem_+_1.4vw,_2.25rem)] font-normal tracking-[-0.018em] text-[var(--sage-ink)]"
              style={DISPLAY_STYLE}
            >
              What almost happened.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sage-ink-muted)]">
              Every project has near-misses — decisions that, if we&apos;d kept going, would have
              shipped a hole. This is the diff between the version that almost made it to prod and the
              version that did.
            </p>
            <div className="mt-8">
              <NearMissLedger items={extras.almostHappened} />
            </div>
          </div>
        )}

        {/* Code samples */}
        {extras.codeSamples && extras.codeSamples.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-4">
              <MonoLabel tone="accent">{`// from the repo`}</MonoLabel>
              <Hairline className="flex-1" />
            </div>
            <h2
              className="text-[clamp(1.6rem,_1.2rem_+_1.4vw,_2.25rem)] font-normal tracking-[-0.018em] text-[var(--sage-ink)]"
              style={DISPLAY_STYLE}
            >
              Inline excerpts.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sage-ink-muted)]">
              Trimmed, but real. The patterns that made the system survive retries, multi-tenant
              queries, and a bot that won&apos;t hallucinate.
            </p>
            <div className="mt-6 space-y-4">
              {extras.codeSamples.map((s, i) => (
                <CodeSample key={i} sample={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
