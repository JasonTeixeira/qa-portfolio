'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { track } from '@/components/analytics/posthog-provider'

type CtaVariant = 'solid' | 'ghost' | 'text'

export interface CtaLinkProps {
  href: string
  variant?: CtaVariant
  /** Trailing arrow. Default true. */
  arrow?: boolean
  /** Analytics event name (PostHog). Optional. */
  event?: string
  eventProps?: Record<string, unknown>
  className?: string
  children: React.ReactNode
}

/**
 * CtaLink — the kit's call-to-action link, derived from the hero CTAs.
 *
 * - solid: Living accent fill, the primary "./book" action (used sparingly).
 * - ghost: hairline-bordered, the secondary action.
 * - text:  bare mono link with a hover arrow, for "view all" affordances.
 *
 * All variants use Geist Mono, uppercase tracking, and a sharp 3px radius.
 * Analytics fire on click when `event` is provided.
 */
export function CtaLink({
  href,
  variant = 'ghost',
  arrow = true,
  event,
  eventProps,
  className,
  children,
}: CtaLinkProps) {
  const onClick = event ? () => track(event, eventProps) : undefined

  if (variant === 'text') {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-[var(--sage-ink-muted)] transition-colors hover:text-[var(--sage-accent-readable)] [font-family:var(--font-mono),ui-monospace,monospace]',
          className,
        )}
      >
        <span>{children}</span>
        {arrow ? (
          <span
            aria-hidden
            className="text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--sage-accent-readable)]"
          >
            →
          </span>
        ) : null}
      </Link>
    )
  }

  if (variant === 'solid') {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'group relative inline-flex h-12 items-center gap-2.5 rounded-[3px] bg-[var(--sage-accent)] px-6 text-[13px] font-medium uppercase tracking-[0.08em] text-white transition-[background-color,box-shadow,transform] duration-200 ease-out [font-family:var(--font-mono),ui-monospace,monospace] hover:bg-[var(--sage-brand-bright)] hover:shadow-[0_0_28px_-4px_rgba(61,90,254,0.45)] focus-visible:outline-none active:translate-y-px',
          className,
        )}
      >
        <span>{children}</span>
        {arrow ? (
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        ) : null}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group inline-flex h-12 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]',
        className,
      )}
    >
      <span>{children}</span>
      {arrow ? (
        <span
          aria-hidden
          className="text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      ) : null}
    </Link>
  )
}
