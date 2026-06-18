'use client'

import * as React from 'react'
import { Phone, Lock } from 'lucide-react'
import { Surface, MonoLabel, Hairline, Reveal } from '@/components/el'
import type { Reference, LogoEntry } from '@/data/references'

interface ReferenceRosterProps {
  references: Reference[]
  trustedBy: LogoEntry[]
}

/**
 * ReferenceRoster — Engineered Luxury restyle of the callable-rolodex section
 * body. Reference cards read as ruled roster entries (index, role, industry,
 * context, call-availability). Beneath them, a quiet hairline-gridded
 * trusted-by strip of NDA monograms. Honest data preserved verbatim.
 */
export function ReferenceRoster({ references, trustedBy }: ReferenceRosterProps) {
  return (
    <div className="flex flex-col gap-12">
      {/* Reference cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {references.map((r, i) => {
          const initials = (r.role[0] + r.industry[0]).toUpperCase()
          return (
            <Reveal key={r.id} delay={i * 0.05} className="h-full">
              <Surface level={2} className="flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <MonoLabel tone="accent">reference available</MonoLabel>
                  <MonoLabel tone="faint" className="tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </MonoLabel>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] text-[11px] font-medium text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]"
                  >
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <h3
                      className="truncate text-lg font-normal tracking-[-0.01em] text-[var(--sage-ink)]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {r.role}
                    </h3>
                    <MonoLabel tone="muted" as="p" className="truncate">
                      {r.industry}
                      {r.duration ? ` · ${r.duration}` : ''}
                    </MonoLabel>
                  </div>
                </div>

                <p className="mt-5 flex-1 text-sm leading-[1.6] text-[var(--sage-ink-muted)]">
                  {r.context}
                </p>

                {r.callAvailable && (
                  <>
                    <Hairline className="mt-5" />
                    <div className="mt-4 flex items-center gap-2 text-xs text-[var(--sage-ink-faint)]">
                      <Phone className="h-3.5 w-3.5 text-[#3D5AFE]/70" aria-hidden />
                      <span>
                        Reference call shared during discovery, both consenting.
                      </span>
                    </div>
                  </>
                )}
              </Surface>
            </Reveal>
          )
        })}
      </div>

      {/* Trusted-by strip */}
      <Reveal>
        <div>
          <div className="mb-5 flex flex-col gap-x-4 gap-y-2 sm:flex-row sm:items-baseline">
            <MonoLabel tone="accent" className="shrink-0">
              industries shipped into
            </MonoLabel>
            <p className="text-xs leading-relaxed text-[var(--sage-ink-faint)]">
              Most engagements run under NDA. Names withheld until written
              permission lands — no fake logos, no implied endorsements.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-3 lg:grid-cols-6">
            {trustedBy.map((e) => {
              const monogram =
                e.monogram ??
                e.label
                  .split(/\s+/)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              return (
                <div
                  key={e.id}
                  className="flex flex-col gap-3 bg-[var(--sage-surface-1)] p-4"
                  title={e.anonymous ? 'Under NDA — name withheld' : e.label}
                >
                  <div className="flex items-center justify-between">
                    <span
                      aria-hidden
                      className="text-xl font-medium tracking-tight text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]"
                    >
                      {monogram}
                    </span>
                    {e.anonymous && (
                      <Lock
                        className="h-3 w-3 text-[var(--sage-ink-faint)]"
                        aria-label="Under NDA"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[11px] text-[var(--sage-ink-muted)]">
                      {e.label}
                    </div>
                    <div className="truncate text-[10px] text-[var(--sage-ink-faint)]">
                      {e.industry}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
