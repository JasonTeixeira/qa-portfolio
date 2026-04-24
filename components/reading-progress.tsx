'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

export function ReadingProgress() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed top-16 left-0 right-0 h-0.5 bg-[#27272A] z-50 origin-left"
      style={{ scaleX: 0 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] origin-left"
        style={{ scaleX }}
      />
    </motion.div>
  )
}
