'use client'

import { ReactNode, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'cyan' | 'violet' | 'gradient'
}

export function GlowCard({ children, className, glowColor = 'cyan' }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const glowColors = {
    cyan: 'rgba(6, 182, 212, 0.15)',
    violet: 'rgba(139, 92, 246, 0.15)',
    gradient: 'rgba(6, 182, 212, 0.15)'
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all duration-300',
        isHovered && 'border-[#06B6D4]/50',
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect following cursor */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColors[glowColor]}, transparent 40%)`
          }}
        />
      )}
      
      {/* Gradient border on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          padding: '1px',
          background: glowColor === 'violet' 
            ? 'linear-gradient(135deg, #8B5CF6, transparent, #8B5CF6)'
            : 'linear-gradient(135deg, #06B6D4, transparent, #8B5CF6)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />
      
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
