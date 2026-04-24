'use client'

import { motion } from 'framer-motion'

interface ProfessionalAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showGlow?: boolean
}

const sizeClasses = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-20 h-20 text-2xl',
  lg: 'w-32 h-32 text-4xl',
  xl: 'w-48 h-48 text-6xl',
}

export function ProfessionalAvatar({ size = 'lg', showGlow = true }: ProfessionalAvatarProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Glow effect */}
      {showGlow && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/30 to-[#8B5CF6]/30 rounded-full blur-2xl animate-pulse" />
      )}
      
      {/* Avatar container */}
      <div
        className={`
          relative ${sizeClasses[size]} rounded-full
          bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6]
          flex items-center justify-center
          font-bold text-[#09090B]
          ring-4 ring-[#27272A]
          shadow-xl shadow-[#06B6D4]/20
        `}
      >
        {/* Inner gradient border */}
        <div className="absolute inset-1 rounded-full bg-[#18181B] flex items-center justify-center">
          <span className="gradient-text font-bold">JT</span>
        </div>
      </div>

      {/* Status indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
        className="absolute bottom-1 right-1 w-4 h-4"
      >
        <span className="absolute inset-0 rounded-full bg-[#10B981] status-dot" />
        <span className="absolute inset-0.5 rounded-full bg-[#10B981]" />
      </motion.div>
    </motion.div>
  )
}
