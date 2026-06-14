'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'

export interface RevealProps extends HTMLMotionProps<'div'> {
  /** Stagger delay in seconds. */
  delay?: number
  /** Vertical travel in px. Default 18. */
  y?: number
}

/**
 * Reveal — a single whileInView slide-up, the kit's standard scroll entrance.
 * Uses the shared EASE_OUT_QUINT. Reduced-motion is honored globally via
 * MotionConfig (durations collapse to 0; elements land at rest).
 */
export function Reveal({
  delay = 0,
  y = 18,
  children,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE_OUT_QUINT, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
