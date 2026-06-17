import * as React from 'react'
import { cn } from '@/lib/utils'

export interface HairlineProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the rule. Default horizontal. */
  orientation?: 'horizontal' | 'vertical'
  /** Stronger hairline (border-strong) instead of the default. */
  strong?: boolean
  /**
   * Lead the rule with a short accent segment — the hero's signature
   * "one sharp signal" device. Horizontal only.
   */
  accentLead?: boolean
}

/**
 * Hairline — the kit's ruling primitive. A 1px divider on the surface ramp's
 * border token. Optionally led by a short accent segment, mirroring the
 * hero's headline underline.
 */
export function Hairline({
  orientation = 'horizontal',
  strong = false,
  accentLead = false,
  className,
  ...rest
}: HairlineProps) {
  const lineColor = strong
    ? 'bg-[var(--sage-border-strong)]'
    : 'bg-[var(--sage-border)]'

  if (orientation === 'vertical') {
    return (
      <div
        aria-hidden
        className={cn('w-px self-stretch', lineColor, className)}
        {...rest}
      />
    )
  }

  if (accentLead) {
    return (
      <div
        aria-hidden
        className={cn('flex items-center gap-4', className)}
        {...rest}
      >
        <span className="h-px w-16 bg-[var(--sage-accent)]" />
        <span className={cn('h-px flex-1', lineColor)} />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className={cn('h-px w-full', lineColor, className)}
      {...rest}
    />
  )
}
