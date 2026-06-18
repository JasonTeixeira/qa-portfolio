'use client'

import * as React from 'react'
import Link from 'next/link'
import { MonoLabel } from '@/components/el'
import { SystemFlowOverlay } from '@/components/living/SystemFlowLayer'

export interface CatalogRowItem {
  slug: string
  name: string
  tagline: string
  /** Display price string — sourced from tier data, never hardcoded. */
  price: string
  timeline: string
  href: string
}

export interface CatalogRowProps {
  /** Mono eyebrow for the group, e.g. "ai services". */
  label: string
  items: CatalogRowItem[]
}

/**
 * CatalogRow — a compact, ruled list of catalog entries for the extended
 * (inquiry-first) services. Each row is a hairline-separated line item with a
 * price pulled from the source data. No cards, no neon — an instrument-panel
 * index that scales to dozens of offerings without visual noise.
 */
export function CatalogRow({ label, items }: CatalogRowProps) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <MonoLabel tone="muted">{`// ${label}`}</MonoLabel>
        <span aria-hidden className="h-px flex-1 bg-[var(--sage-border)]" />
        <MonoLabel tone="faint" className="tabular-nums">
          {String(items.length).padStart(2, '0')}
        </MonoLabel>
      </div>
      <ul className="overflow-hidden rounded-[3px] border border-[var(--sage-border)]">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={item.href}
              className="group relative flex items-center gap-4 overflow-hidden border-b border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--sage-surface-2)]"
            >
              <SystemFlowOverlay variant="systems" intensity="quiet" />
              <div className="min-w-0 flex-1">
                <span className="text-[15px] font-medium text-[var(--sage-ink)] transition-colors group-hover:text-[var(--sage-accent-readable)] [font-family:var(--font-display)]">
                  {item.name}
                </span>
                <p className="mt-0.5 truncate text-[13px] text-[var(--sage-ink-muted)]">
                  {item.tagline}
                </p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <span className="block text-sm tabular-nums text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]">
                  {item.price}
                </span>
                <MonoLabel tone="faint">{item.timeline}</MonoLabel>
              </div>
              <span
                aria-hidden
                className="shrink-0 text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--sage-accent-readable)]"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
