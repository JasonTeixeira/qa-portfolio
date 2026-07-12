'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { PipelineThread } from '@/components/agency/pipeline-thread'
import { StickyCta } from '@/components/agency/sticky-cta'

// Anchor links are root-absolute so they resolve to the homepage sections
// from subpages (/blog, /audit) as well as from the homepage itself.
const NAV_LINKS = [
  { href: '/#proof', label: 'PROOF' },
  { href: '/#case-studies', label: 'CASE STUDIES' },
  { href: '/#ledger', label: 'LEDGER' },
  { href: '/services', label: 'SERVICES' },
  { href: '/audit', label: 'AUDIT' },
  { href: '/blog', label: 'WRITING' },
] as const

const MOBILE_MENU_ID = 'ag-mobile-menu'
const DESKTOP_QUERY = '(min-width: 720px)'
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])'

/**
 * Fixed 64px nav with backdrop blur, mono anchor links, and a 2px
 * scroll-progress bar (rAF-throttled, compositor-only scaleX).
 * Below 720px the links row is hidden and a MENU button opens a
 * full-screen overlay panel (focus-trapped, scroll-locked).
 */
export function AgencyNav() {
  const barRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
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

  const closeMenu = useCallback((): void => setIsMenuOpen(false), [])

  // Menu-open side effects: scroll lock, focus trap, Escape, desktop-resize
  // close, and focus restoration to the MENU button on close.
  useEffect(() => {
    if (!isMenuOpen) return
    const panel = panelRef.current
    if (!panel) return

    const doc = document.documentElement
    const previousOverflow = doc.style.overflow
    doc.style.overflow = 'hidden'

    const getFocusable = (): HTMLElement[] =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

    const initialFocusable = getFocusable()
    if (initialFocusable.length > 0) initialFocusable[0].focus()

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const isInsidePanel = active instanceof HTMLElement && panel.contains(active)
      if (event.shiftKey) {
        if (active === first || !isInsidePanel) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !isInsidePanel) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    // If the viewport grows past the mobile breakpoint (rotation / resize),
    // close the menu so the scroll lock and trap don't outlive the button.
    const desktopQuery = window.matchMedia(DESKTOP_QUERY)
    const handleDesktop = (event: MediaQueryListEvent): void => {
      if (event.matches) setIsMenuOpen(false)
    }
    desktopQuery.addEventListener('change', handleDesktop)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      desktopQuery.removeEventListener('change', handleDesktop)
      doc.style.overflow = previousOverflow
      menuButtonRef.current?.focus()
    }
  }, [isMenuOpen])

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
        <div className="ag-nav-right">
          <Link href="/#contact" className="ag-nav-cta">
            CONTACT
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className="ag-mnav-toggle"
            aria-expanded={isMenuOpen}
            aria-controls={MOBILE_MENU_ID}
            onClick={() => setIsMenuOpen(true)}
          >
            MENU
          </button>
        </div>
      </nav>
      <div ref={barRef} className="ag-nav-progress" aria-hidden="true" />
    </header>
    {/* Overlay is a sibling of the fixed header: .ag-nav's backdrop-filter
        creates a containing block that would trap a fixed descendant. */}
    {isMenuOpen ? (
      <div
        ref={panelRef}
        id={MOBILE_MENU_ID}
        className="ag-mnav"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="ag-mnav-top">
          <span className="ag-nav-mark">
            JASON TEIXEIRA <span className="ag-nav-mark-diamond" aria-hidden="true">◆</span>
          </span>
          <button
            type="button"
            className="ag-mnav-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="ag-mnav-links" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="ag-mnav-link" onClick={closeMenu}>
              {link.label}
            </Link>
          ))}
          <Link href="/#contact" className="ag-mnav-contact" onClick={closeMenu}>
            CONTACT
          </Link>
        </nav>
      </div>
    ) : null}
    {/* Siblings of the fixed header for the same containing-block reason. */}
    {isHome ? <PipelineThread /> : null}
    {isHome ? <StickyCta /> : null}
    </>
  )
}
