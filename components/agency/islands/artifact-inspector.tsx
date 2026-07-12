'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import type { EvidenceCapture, EvidenceProject } from '@/data/agency/evidence-manifest'

/**
 * Artifact Inspector — one shared modal evidence viewer per provider scope.
 *
 * <ArtifactInspectorProvider captures={...}> wraps a section; any number of
 * <InspectableArtifact> triggers inside it open the SAME modal instance,
 * scoped to the provider's capture list. Server pages can use both freely —
 * they only receive plain serializable EvidenceCapture props + ReactNode
 * children.
 *
 * Modal contract: role=dialog + aria-modal, Tab focus loop, Escape / backdrop
 * click close, body scroll locked while open, focus returned to the trigger,
 * ← / → cycles captures, adjacent images preloaded. Open/close animates
 * scale+opacity only (220ms); reduced-motion closes instantly.
 */

const CLOSE_MS = 220

interface CaseRoute {
  href: string
  label: string
}

/** Capture project → deep link into the matching case study (or /method). */
const CASE_ROUTES: Record<EvidenceProject, CaseRoute> = {
  'qa-os': { href: '/work/nexural-qa-os', label: 'SEE THE CASE STUDY →' },
  voza: { href: '/work/voza-verification', label: 'SEE THE CASE STUDY →' },
  'sage-kernel': { href: '/work/sage-kernel-course-auditor', label: 'SEE THE CASE STUDY →' },
  'dashboard-loop': { href: '/work/dashboard-audit-loop', label: 'SEE THE CASE STUDY →' },
  giggl: { href: '/work/giggl-release-lane', label: 'SEE THE CASE STUDY →' },
  'this-site': { href: '/method', label: 'SEE THE METHOD →' },
}

interface InspectorContextValue {
  captures: EvidenceCapture[]
  open: (index: number, trigger: HTMLElement | null) => void
}

const InspectorContext = createContext<InspectorContextValue | null>(null)

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/* ── Provider: owns the single modal instance ────────────────────────────── */

interface ProviderProps {
  captures: EvidenceCapture[]
  children: ReactNode
}

export function ArtifactInspectorProvider({ captures, children }: ProviderProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const open = useCallback((index: number, trigger: HTMLElement | null) => {
    triggerRef.current = trigger
    setOpenIndex(index)
  }, [])

  const close = useCallback(() => {
    setOpenIndex(null)
    const trigger = triggerRef.current
    triggerRef.current = null
    trigger?.focus()
  }, [])

  return (
    <InspectorContext.Provider value={{ captures, open }}>
      {children}
      {openIndex !== null ? (
        <InspectorModal captures={captures} initialIndex={openIndex} onClose={close} />
      ) : null}
    </InspectorContext.Provider>
  )
}

/* ── Triggers ────────────────────────────────────────────────────────────── */

interface InspectableArtifactProps {
  capture: EvidenceCapture
  className?: string
  children: ReactNode
}

/** Renders its children (the card figure content) as an inspector trigger button. */
export function InspectableArtifact({
  capture,
  className = '',
  children,
}: InspectableArtifactProps) {
  const ctx = useContext(InspectorContext)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const index = ctx ? ctx.captures.findIndex((c) => c.file === capture.file) : -1

  if (!ctx || index === -1) {
    return <div className={className}>{children}</div>
  }

  return (
    <button
      ref={btnRef}
      type="button"
      className={`ag-inspect-trigger ${className}`.trim()}
      aria-label={`Inspect: ${capture.title}`}
      aria-haspopup="dialog"
      onClick={() => ctx.open(index, btnRef.current)}
    >
      {children}
    </button>
  )
}

interface InspectorButtonProps {
  index?: number
  className?: string
  children: ReactNode
}

/** Plain trigger button (e.g. the "OPEN THE VAULT" line-link). */
export function InspectorButton({ index = 0, className = '', children }: InspectorButtonProps) {
  const ctx = useContext(InspectorContext)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  if (!ctx) return null
  return (
    <button
      ref={btnRef}
      type="button"
      className={className}
      aria-haspopup="dialog"
      onClick={() => ctx.open(index, btnRef.current)}
    >
      {children}
    </button>
  )
}

/* ── Modal ───────────────────────────────────────────────────────────────── */

interface ModalProps {
  captures: EvidenceCapture[]
  initialIndex: number
  onClose: () => void
}

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function InspectorModal({ captures, initialIndex, onClose }: ModalProps) {
  const [index, setIndex] = useState(initialIndex)
  const [phase, setPhase] = useState<'enter' | 'open' | 'exit'>('enter')
  // Portal into .agency-root so the design tokens + reduced-motion kill-switch
  // apply, and the modal escapes content-visibility paint containment on
  // .ag-section ancestors. Client-only: this component mounts on interaction.
  const [host] = useState<HTMLElement | null>(() =>
    typeof document === 'undefined'
      ? null
      : (document.querySelector<HTMLElement>('.agency-root') ?? document.body),
  )
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const closeTimerRef = useRef(0)
  const closingRef = useRef(false)

  const count = captures.length
  const capture = captures[index] ?? captures[0]
  const caseRoute = CASE_ROUTES[capture.project]

  // Enter transition: mount at scale(.97)/opacity 0, then flip to open state.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setPhase('open')
      return
    }
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase('open'))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  // Body scroll lock, restored on close/unmount.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  // Initial focus lands on the close button.
  useEffect(() => {
    closeBtnRef.current?.focus()
  }, [])

  // Preload the adjacent captures so arrow navigation is instant.
  useEffect(() => {
    if (count < 2) return
    const neighbors = [(index + 1) % count, (index - 1 + count) % count]
    neighbors.forEach((i) => {
      const img = new Image()
      img.src = captures[i].file
    })
  }, [index, count, captures])

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), [])

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    if (prefersReducedMotion()) {
      onClose()
      return
    }
    closingRef.current = true
    setPhase('exit')
    closeTimerRef.current = window.setTimeout(onClose, CLOSE_MS)
  }, [onClose])

  const step = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + count) % count)
    },
    [count],
  )

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      requestClose()
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
      return
    }
    if (event.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement
    if (event.shiftKey) {
      if (active === first || !panel.contains(active)) {
        event.preventDefault()
        last.focus()
      }
    } else if (active === last || !panel.contains(active)) {
      event.preventDefault()
      first.focus()
    }
  }

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) requestClose()
  }

  if (!host) return null

  return createPortal(
    <div
      className="ag-inspector"
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-label={`Artifact inspector — ${capture.title}`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div ref={panelRef} className="ag-inspector-panel">
        <header className="ag-inspector-bar">
          <span className="ag-inspector-counter" aria-live="polite">
            ARTIFACT {pad2(index + 1)} / {pad2(count)}
          </span>
          <div className="ag-inspector-nav">
            <button
              type="button"
              className="ag-inspector-navbtn"
              onClick={() => step(-1)}
              aria-label="Previous artifact"
            >
              ← PREV
            </button>
            <button
              type="button"
              className="ag-inspector-navbtn"
              onClick={() => step(1)}
              aria-label="Next artifact"
            >
              NEXT →
            </button>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="ag-inspector-close"
            onClick={requestClose}
            aria-label="Close inspector"
          >
            ESC ✕
          </button>
        </header>

        <div className="ag-inspector-stage">
          <img
            key={capture.file}
            src={capture.file}
            alt={capture.title}
            className="ag-inspector-img"
            width={1200}
            height={750}
            decoding="async"
          />
        </div>

        <footer className="ag-inspector-meta">
          <p className="ag-inspector-title">{capture.title}</p>
          <p className="ag-inspector-path" title={capture.sourcePath}>
            <bdi>{capture.sourcePath}</bdi>
          </p>
          <div className="ag-inspector-tags">
            <span className="ag-chip ag-inspector-project">{capture.project}</span>
            <span
              className={`ag-badge ${capture.tier === 'T1' ? 'ag-badge--live' : 'ag-badge--local'}`}
            >
              {capture.tier}
            </span>
            {caseRoute ? (
              <Link href={caseRoute.href} className="ag-inspector-case" onClick={onClose}>
                {caseRoute.label}
              </Link>
            ) : null}
          </div>
        </footer>
      </div>
    </div>,
    host,
  )
}
