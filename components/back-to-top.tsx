'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-[#18181B] border border-[#27272A] rounded-full shadow-lg hover:border-[#06B6D4] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 group"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5 text-[#71717A] group-hover:text-[#06B6D4] transition-colors" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
