'use client'

import { motion } from 'framer-motion'

export function FloatingOrbs() {
  return (
    <>
      {/* Primary orb - top right */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-[#06B6D4]/5 rounded-full blur-3xl pointer-events-none"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Secondary orb - bottom left */}
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 bg-[#8B5CF6]/3 rounded-full blur-3xl pointer-events-none"
        animate={{
          y: [0, 20, 0],
          x: [0, -15, 0],
          scale: [1, 0.95, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      
      {/* Accent orb - center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#06B6D4]/[0.02] rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </>
  )
}
