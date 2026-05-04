'use client'

import { motion } from 'framer-motion'

/**
 * Subtle motion + texture layer for hero sections.
 *
 * Sits absolutely-positioned inside a `relative overflow-hidden` parent.
 * Layers, top to bottom:
 *   - slow-pan radial wash (cyan/violet)
 *   - faint grid
 *   - SVG grain
 *   - horizontal scanline
 *
 * No bouncing. No spinning. The motion is barely perceptible — just enough
 * to make the surface feel alive instead of a screenshot.
 */
export function HeroMotionLayer({
  intensity = 'medium',
}: {
  intensity?: 'low' | 'medium' | 'high'
}) {
  const grainOpacity = intensity === 'low' ? 0.04 : intensity === 'high' ? 0.1 : 0.06
  const scanlineOpacity = intensity === 'low' ? 0.03 : intensity === 'high' ? 0.07 : 0.05

  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Slow-pan cyan wash */}
      <motion.div
        className="absolute -inset-[10%]"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, rgba(6,182,212,0.12), transparent 50%)',
        }}
        animate={{ x: ['0%', '3%', '0%'], y: ['0%', '-2%', '0%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Slow-pan violet wash */}
      <motion.div
        className="absolute -inset-[10%]"
        style={{
          background:
            'radial-gradient(circle at 80% 70%, rgba(139,92,246,0.10), transparent 50%)',
        }}
        animate={{ x: ['0%', '-3%', '0%'], y: ['0%', '2%', '0%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(250,250,250,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          opacity: grainOpacity,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Scanline */}
      <div
        className="absolute inset-0"
        style={{
          opacity: scanlineOpacity,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)',
        }}
      />
    </div>
  )
}
