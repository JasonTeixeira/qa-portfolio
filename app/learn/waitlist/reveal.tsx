'use client'

import { useEffect } from 'react'

/**
 * RevealOnScroll — fades + lifts each below-the-fold section in as it enters the
 * viewport. Adds the hidden state only via JS (so no-JS / reduced-motion render
 * everything visible) and reveals on intersection. Scoped to [data-reveal-scope].
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal-scope] > section'),
    ).slice(1) // keep the hero (above the fold) visible immediately
    if (!sections.length) return

    sections.forEach((el) => el.setAttribute('data-reveal', ''))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-reveal-in', '')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    sections.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return null
}
