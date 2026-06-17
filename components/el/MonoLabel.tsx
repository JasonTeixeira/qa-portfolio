import * as React from 'react'
import { cn } from '@/lib/utils'

type MonoLabelTone = 'muted' | 'faint' | 'ink' | 'accent'

const TONE_TO_CLASS: Record<MonoLabelTone, string> = {
  muted: 'text-[var(--sage-ink-muted)]',
  faint: 'text-[var(--sage-ink-faint)]',
  ink: 'text-[var(--sage-ink)]',
  accent: 'text-[var(--sage-accent-readable)]',
}

export interface MonoLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: MonoLabelTone
  /** Render as a different element (e.g. 'dt', 'dd'). Defaults to span. */
  as?: 'span' | 'p' | 'dt' | 'dd' | 'div'
}

/**
 * MonoLabel — the Geist-Mono eyebrow/metadata primitive used across the kit.
 * Small caps, wide tracking, restrained color. The "// section ·" idiom and
 * status labels all compose from this.
 */
export function MonoLabel({
  tone = 'faint',
  as: Tag = 'span',
  className,
  children,
  ...rest
}: MonoLabelProps) {
  return (
    <Tag
      className={cn(
        'text-[10px] uppercase tracking-[0.22em] [font-family:var(--font-mono),ui-monospace,monospace]',
        TONE_TO_CLASS[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
