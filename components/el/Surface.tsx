import * as React from 'react'
import { cn } from '@/lib/utils'
import { RegistrationTicks } from './RegistrationTicks'

type SurfaceLevel = 1 | 2 | 3

const LEVEL_TO_BG: Record<SurfaceLevel, string> = {
  1: 'bg-[var(--sage-surface-1)]',
  2: 'bg-[var(--sage-surface-2)]',
  3: 'bg-[var(--sage-surface-3)]',
}

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Elevation on the surface ramp. Default 2 (card). */
  level?: SurfaceLevel
  /** Hairline border. Default true. */
  bordered?: boolean
  /** Render corner registration ticks. */
  ticks?: boolean
  /** Add a hover lift: border brightens, faint translate. For interactive cards. */
  interactive?: boolean
}

/**
 * Surface — the kit's elevated panel. Real elevation via the surface ramp
 * (never a flat slab), hairline-bordered, sharp 2px radius. Optional corner
 * ticks and an interactive hover treatment that brightens the border rather
 * than blooming a neon glow.
 */
export function Surface({
  level = 2,
  bordered = true,
  ticks = false,
  interactive = false,
  className,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <div
      className={cn(
        'relative rounded-[3px]',
        LEVEL_TO_BG[level],
        bordered && 'border border-[var(--sage-border)]',
        interactive &&
          'transition-[border-color,background-color,transform] duration-200 ease-out hover:-translate-y-px hover:border-[var(--sage-border-hover)] hover:bg-[var(--sage-surface-3)]',
        className,
      )}
      {...rest}
    >
      {ticks ? <RegistrationTicks /> : null}
      {children}
    </div>
  )
}
