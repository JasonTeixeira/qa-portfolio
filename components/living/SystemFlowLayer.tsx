'use client'

import { type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import styles from './SystemFlowLayer.module.css'

type FlowVariant = 'studio' | 'academy' | 'growth' | 'systems'
type FlowIntensity = 'quiet' | 'normal'

type SystemFlowLayerProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  className?: string
  variant?: FlowVariant
  intensity?: FlowIntensity
  decorative?: boolean
}

function FlowMarkup() {
  return (
    <span className={styles.flowOverlay} aria-hidden="true">
      <span className={styles.grid} />
      <span className={styles.rail} />
      <span className={styles.railTwo} />
      <span className={styles.railThree} />
      <span className={styles.packet} />
      <span className={styles.packetTwo} />
      <span className={styles.pulse} />
    </span>
  )
}

export function SystemFlowLayer({
  children,
  className = '',
  variant = 'studio',
  intensity = 'normal',
  decorative = false,
  ...rest
}: SystemFlowLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (reduced) {
      setActive(false)
      return
    }

    const node = ref.current
    if (!node) return
    const target = decorative ? node.parentElement : node
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setActive(Boolean(entry?.isIntersecting)),
      { threshold: 0.12 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [decorative, reduced])

  return (
    <div
      ref={ref}
      className={`${styles.flowHost} ${className}`}
      data-flow-active={active ? 'true' : 'false'}
      data-flow-variant={variant}
      data-flow-intensity={intensity}
      aria-hidden={decorative || undefined}
      {...rest}
    >
      <FlowMarkup />
      {children}
    </div>
  )
}

export function SystemFlowOverlay({
  className = '',
  variant = 'studio',
  intensity = 'quiet',
}: Omit<SystemFlowLayerProps, 'children' | 'decorative'>) {
  return (
    <SystemFlowLayer
      className={`absolute inset-0 rounded-[inherit] ${className}`}
      variant={variant}
      intensity={intensity}
      decorative
    />
  )
}
