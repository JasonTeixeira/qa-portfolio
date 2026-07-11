'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Scroll-reveal wrapper. Adds .is-in when the element enters the viewport.
 * Reduced-motion users get the final state via CSS (see agency.css).
 */
export function Reveal({
  children,
  className = '',
  as: Tag = 'div',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
  delay?: number
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.transitionDelay = `${delay}ms`
            el.classList.add('is-in')
            io.disconnect()
          }
        })
      },
      // threshold 0: elements taller than the viewport can never reach a fractional
      // ratio — they'd stay invisible forever. Fire on first pixel instead.
      { threshold: 0, rootMargin: '0px 0px -5% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay])

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`ag-reveal ${className}`}>
      {children}
    </Tag>
  )
}
