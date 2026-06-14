'use client'

import * as React from 'react'
import { MonoLabel } from '@/components/el'

export interface FaqItem {
  q: string
  a: string
}

export interface FaqAccordionProps {
  items: FaqItem[]
}

/**
 * FaqAccordion — Engineered Luxury disclosure list. Ruled rows on the surface
 * ramp, mono index markers, native <details>/<summary> so it works without JS
 * and stays accessible. The first item is open by default.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="overflow-hidden rounded-[3px] border border-[var(--sage-border)]">
      {items.map((item, i) => (
        <details
          key={item.q}
          open={i === 0}
          className="group border-b border-[var(--sage-border)] bg-[var(--sage-surface-1)] last:border-b-0 open:bg-[var(--sage-surface-2)]"
        >
          <summary className="flex cursor-pointer list-none items-start gap-4 px-5 py-5 transition-colors hover:bg-[var(--sage-surface-2)] sm:px-7">
            <MonoLabel tone="faint" className="mt-1 tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </MonoLabel>
            <span className="flex-1 text-[15px] font-medium leading-snug text-[var(--sage-ink)]">
              {item.q}
            </span>
            <span
              aria-hidden
              className="mt-0.5 shrink-0 text-[var(--sage-ink-faint)] transition-transform duration-200 group-open:rotate-45 group-open:text-[#0ED3CF]"
            >
              +
            </span>
          </summary>
          <div className="px-5 pb-6 pl-[3.25rem] text-[14px] leading-[1.7] text-[var(--sage-ink-muted)] sm:px-7 sm:pl-[4.25rem]">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  )
}
