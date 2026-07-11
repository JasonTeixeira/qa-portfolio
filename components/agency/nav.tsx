'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { PipelineThread } from '@/components/agency/pipeline-thread'

// Anchor links are root-absolute so they resolve to the homepage sections
// from subpages (/blog, /audit) as well as from the homepage itself.
const NAV_LINKS = [
  { href: '/#proof', label: 'PROOF' },
  { href: '/#case-studies', label: 'CASE STUDIES' },
  { href: '/#ledger', label: 'LEDGER' },
  { href: '/audit', label: 'AUDIT' },
  { href: '/blog', label: 'WRITING' },
] as const

/**
 * Fixed 64px nav with backdrop blur, mono anchor links, and a 2px
 * scroll-progress bar (rAF-throttled, compositor-only scaleX).
 */
export function AgencyNav() {
  const barRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()
  // PipelineThread is homepage-only — its stage dots map to home sections.
  const isHome = pathname === '/agency' || pathname === '/'

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
    <>
    <header className="ag-nav">
      <nav className="ag-nav-inner" aria-label="Main navigation">
        <Link href="/#top" className="ag-nav-mark">
          JASON TEIXEIRA <span className="ag-nav-mark-diamond" aria-hidden="true">◆</span>
        </Link>
        <div className="ag-nav-links">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="ag-nav-link ag-nav-link--underline">
              {link.label}
            </Link>
          ))}
        </div>
        <Link href="/#contact" className="ag-nav-cta">
          CONTACT
        </Link>
      </nav>
      <div ref={barRef} className="ag-nav-progress" aria-hidden="true" />
    </header>
    {/* Sibling of the fixed header: .ag-nav's backdrop-filter creates a
        containing block that would trap a fixed descendant. */}
    {isHome ? <PipelineThread /> : null}
    </>
  )
}
