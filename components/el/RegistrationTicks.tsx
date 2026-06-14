import * as React from 'react'
import { cn } from '@/lib/utils'

export interface RegistrationTicksProps {
  /** Tick color. Default faint teal — the precision-instrument cue. */
  color?: string
  /** Tick arm length in px. Default 12. */
  size?: number
  className?: string
}

/**
 * RegistrationTicks — four L-shaped hairline ticks at a panel's corners.
 * Extracted from the hero manifest's CornerTicks. Purely decorative; the
 * parent must be `position: relative`.
 */
export function RegistrationTicks({
  color = 'rgba(14,211,207,0.4)',
  size = 12,
  className,
}: RegistrationTicksProps) {
  const dim = { width: size, height: size }
  const base = 'pointer-events-none absolute'
  return (
    <span aria-hidden className={cn('contents', className)}>
      <span
        className={cn(base, '-left-px -top-px border-l border-t')}
        style={{ ...dim, borderColor: color }}
      />
      <span
        className={cn(base, '-right-px -top-px border-r border-t')}
        style={{ ...dim, borderColor: color }}
      />
      <span
        className={cn(base, '-bottom-px -left-px border-b border-l')}
        style={{ ...dim, borderColor: color }}
      />
      <span
        className={cn(base, '-bottom-px -right-px border-b border-r')}
        style={{ ...dim, borderColor: color }}
      />
    </span>
  )
}
