'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * On-brand staggered reveal for academy visual blocks. Copied-in from the Sage
 * Design OS motion package and adapted to the academy: the `motion/react` import
 * is swapped to `framer-motion` (the dep the academy already ships), and the
 * motion language is pinned to the house `--ac-ease-out-expo` curve.
 *
 * Compositor-only (opacity + transform). With reduced-motion the children render
 * in their final state instantly — the meaning never lives in the motion.
 */
export type RevealStaggerProps = {
  children: React.ReactNode
  className?: string
  itemClassName?: string
  as?: 'div' | 'ul' | 'ol'
  itemAs?: 'div' | 'li'
  delayStep?: number
}

// The house ease-out-expo (matches --ac-ease-out-expo in globals.css).
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export function RevealStagger({
  children,
  className,
  itemClassName,
  as = 'div',
  itemAs = 'div',
  delayStep = 0.06,
}: RevealStaggerProps) {
  const reduce = useReducedMotion()
  const items = React.Children.toArray(children)
  const Container = motion[as]
  const Item = motion[itemAs]

  return (
    <Container className={className}>
      {items.map((child, index) => (
        <Item
          key={index}
          className={itemClassName}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
            duration: reduce ? 0 : 0.62,
            delay: reduce ? 0 : index * delayStep,
            ease: EASE_OUT_EXPO,
          }}
        >
          {child}
        </Item>
      ))}
    </Container>
  )
}
