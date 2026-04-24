'use client'

import { useEffect, useState, useRef } from 'react'
import { useInView, motion } from 'framer-motion'

interface MetricCounterProps {
  value: string
  label: string
}

export function MetricCounter({ value, label }: MetricCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [displayValue, setDisplayValue] = useState('0')
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!isInView || hasAnimated) return

    // Extract number and suffix (e.g., "37+" -> 37, "+")
    const numMatch = value.match(/^[\$]?([\d,]+)/)
    const prefix = value.match(/^(\$)/) ? '$' : ''
    const suffix = value.replace(/^[\$]?[\d,]+/, '')
    
    if (!numMatch) {
      setDisplayValue(value)
      setHasAnimated(true)
      return
    }

    const targetNum = parseInt(numMatch[1].replace(/,/g, ''), 10)
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(targetNum * easeOut)
      
      setDisplayValue(prefix + currentValue.toLocaleString() + suffix)

      if (currentStep >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
        setHasAnimated(true)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isInView, value, hasAnimated])

  return (
    <motion.div
      ref={ref}
      className="text-center group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        <motion.div
          className="text-4xl sm:text-5xl font-bold text-[#FAFAFA] mb-2 font-mono"
          animate={hasAnimated ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {displayValue}
        </motion.div>
        {/* Subtle glow on complete */}
        {hasAnimated && (
          <motion.div
            className="absolute inset-0 bg-[#06B6D4]/10 blur-xl rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.6 }}
          />
        )}
      </div>
      <div className="text-sm text-[#71717A] group-hover:text-[#A1A1AA] transition-colors">
        {label}
      </div>
    </motion.div>
  )
}
