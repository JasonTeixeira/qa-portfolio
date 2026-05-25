// Phase 7: Server-rendered editorial extras for case studies.
// Sits between the main client content and the sticky CTA.
// All children are RSC — zero added client JS.

import type { CaseExtras } from '@/data/work/case-extras'
import { CodeSample } from '@/components/work/code-sample'
import { AlmostHappenedBlock } from '@/components/work/almost-happened'
import { SectionLabel } from '@/components/section-label'

interface Props {
  extras: CaseExtras
}

export function CaseStudyExtras({ extras }: Props) {
  if (!extras.almostHappened?.length && !extras.codeSamples?.length && !extras.pullQuote) {
    return null
  }

  return (
    <section className="relative bg-[#09090B] border-t border-[#2A2826]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
        {/* Pull quote */}
        {extras.pullQuote && (
          <figure className="border-l-2 border-[#0ED3CF] pl-6 sm:pl-8 max-w-3xl">
            <blockquote
              className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#F4F2EF] leading-snug tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="italic">&ldquo;{extras.pullQuote}&rdquo;</span>
            </blockquote>
            <figcaption className="mt-4 text-xs font-mono uppercase tracking-[0.22em] text-[#57534E]">
              {'// build log · entry 04'}
            </figcaption>
          </figure>
        )}

        {/* What almost happened */}
        {extras.almostHappened && extras.almostHappened.length > 0 && (
          <div>
            <SectionLabel>Honesty</SectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-normal text-[#FAFAFA] tracking-tight">
              What almost happened.
            </h2>
            <p className="mt-3 text-sm text-[#A8A29E] leading-relaxed max-w-2xl">
              Every project has near-misses. Decisions that, if we&apos;d kept going, would have shipped
              a hole. The list below is the diff between the version that almost made it to prod and the
              version that did.
            </p>
            <div className="mt-8">
              <AlmostHappenedBlock items={extras.almostHappened} />
            </div>
          </div>
        )}

        {/* Code samples */}
        {extras.codeSamples && extras.codeSamples.length > 0 && (
          <div>
            <SectionLabel>From the repo</SectionLabel>
            <h2 className="mt-3 text-2xl sm:text-3xl font-normal text-[#FAFAFA] tracking-tight">
              Inline excerpts.
            </h2>
            <p className="mt-3 text-sm text-[#A8A29E] leading-relaxed max-w-2xl">
              Trimmed, but real. These are the patterns that made the system survive Stripe retries,
              multi-tenant queries, and a Discord bot that won&apos;t hallucinate positions.
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
