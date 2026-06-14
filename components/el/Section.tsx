'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'
import { MonoLabel } from './MonoLabel'
import { Hairline } from './Hairline'

export interface SectionHeaderProps {
  /** Two-digit act/section index, e.g. "02". Rendered as a ruled mono marker. */
  index?: string
  /**
   * Mono eyebrow, e.g. "receipts". Rendered in the "// {label}" idiom.
   * Pass the bare label; the "//" prefix is added.
   */
  eyebrow: string
  /** Fraunces display heading. Accepts an italic-accented span via children. */
  heading: React.ReactNode
  /** Optional supporting lede beneath the heading. */
  lede?: React.ReactNode
  /** Optional right-aligned action (e.g. a "view all" link). */
  action?: React.ReactNode
  /** Center-align the header (used for manifesto / final CTA). */
  centered?: boolean
  className?: string
}

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

/**
 * SectionHeader — the Engineered Luxury section header: a ruled mono eyebrow
 * with an index number, a large Fraunces display heading, and an optional
 * lede + action. Composes the hero's eyebrow-row idiom into a reusable block.
 */
export function SectionHeader({
  index,
  eyebrow,
  heading,
  lede,
  action,
  centered = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered ? 'text-center' : '', className)}>
      {/* Ruled eyebrow row */}
      <div
        className={cn(
          'mb-7 flex items-center gap-4',
          centered && 'mx-auto max-w-md justify-center',
        )}
      >
        {index ? (
          <MonoLabel tone="accent" className="tabular-nums">
            {index}
          </MonoLabel>
        ) : null}
        {!centered && <Hairline className="hidden flex-1 sm:block" />}
        <MonoLabel tone="muted">{`// ${eyebrow}`}</MonoLabel>
        {centered ? null : <Hairline className="flex-1" strong />}
      </div>

      <div
        className={cn(
          'flex flex-col gap-6',
          !centered && action && 'lg:flex-row lg:items-end lg:justify-between',
        )}
      >
        <div className={cn(centered ? 'mx-auto' : 'max-w-2xl')}>
          <h2
            className="text-[var(--sage-ink)] font-normal text-[clamp(1.85rem,1.1rem+2.6vw,3.25rem)]"
            style={HEADING_STYLE}
          >
            {heading}
          </h2>
          {lede ? (
            <p
              className={cn(
                'mt-5 text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base',
                centered ? 'mx-auto max-w-2xl' : 'max-w-[58ch]',
              )}
            >
              {lede}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  )
}

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Section index for the header marker, e.g. "02". */
  index?: string
  eyebrow: string
  heading: React.ReactNode
  lede?: React.ReactNode
  action?: React.ReactNode
  centered?: boolean
  /** Accessible label for the section landmark. Falls back to eyebrow. */
  ariaLabel?: string
  /** Add the top hairline frame rule that brackets each act. Default true. */
  topRule?: boolean
  /** Apply grain atmosphere to this band. */
  grain?: boolean
  /** Constrain inner width. Default 'max-w-7xl'. */
  width?: string
  /** Content rendered beneath the header. */
  children?: React.ReactNode
}

/**
 * Section — one orchestrated Engineered Luxury "act". A top hairline frame,
 * a SectionHeader (mono eyebrow + Fraunces heading), and a single whileInView
 * reveal of the header. Children render beneath and can stagger their own
 * reveals. Reduced-motion is honored globally via MotionConfig.
 */
export function Section({
  index,
  eyebrow,
  heading,
  lede,
  action,
  centered = false,
  ariaLabel,
  topRule = true,
  grain = false,
  width = 'max-w-7xl',
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      aria-label={ariaLabel ?? eyebrow}
      className={cn(
        'relative',
        topRule && 'border-t border-[var(--sage-border)]',
        grain && 'sage-grain isolate overflow-hidden',
        'py-16 sm:py-20 lg:py-28',
        className,
      )}
      {...rest}
    >
      <div className={cn('relative z-10 mx-auto px-5 sm:px-8', width)}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUINT }}
          className="mb-12 lg:mb-16"
        >
          <SectionHeader
            index={index}
            eyebrow={eyebrow}
            heading={heading}
            lede={lede}
            action={action}
            centered={centered}
          />
        </motion.div>
        {children}
      </div>
    </section>
  )
}
