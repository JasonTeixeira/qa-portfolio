'use client'

import { useEffect, useRef } from 'react'

const NAV_LINKS = [
  { href: '#proof', label: 'PROOF' },
  { href: '#case-studies', label: 'CASE STUDIES' },
  { href: '#ledger', label: 'LEDGER' },
  { href: '/audit', label: 'AUDIT' },
  { href: '#writing', label: 'WRITING' },
] as const

/**
 * Fixed 64px nav with backdrop blur, mono anchor links, and a 2px
 * scroll-progress bar (rAF-throttled, compositor-only scaleX).
 */
export function AgencyNav() {
  const barRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let rafId = 0

    const update = () => {
      rafId = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`
      }
    }

    const schedule = () => {
      if (rafId === 0) rafId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafId !== 0) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <header className="ag-nav">
      <nav className="ag-nav-inner" aria-label="Main navigation">
        <a href="#top" className="ag-nav-mark">
          JASON TEIXEIRA <span className="ag-nav-mark-diamond" aria-hidden="true">◆</span>
        </a>
        <div className="ag-nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="ag-nav-link ag-nav-link--underline">
              {link.label}
            </a>
          ))}
        </div>
        <a href="#contact" className="ag-nav-cta">
          CONTACT
        </a>
      </nav>
      <div ref={barRef} className="ag-nav-progress" aria-hidden="true" />
    </header>
  )
}
