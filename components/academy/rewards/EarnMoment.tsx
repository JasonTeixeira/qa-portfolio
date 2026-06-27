'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useSound } from '@/hooks/useSound'
import styles from './earn-moment.module.css'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** What kind of reward this is — drives the accent token + default glyph. */
export type EarnKind = 'badge' | 'level' | 'streak' | 'cert'

/** Inline (sits in the layout flow) or overlay (centered, dims the page). */
export type EarnVariant = 'inline' | 'overlay'

/**
 * Visual weight tier, 1–4, ordered by how rare/terminal the reward is:
 * streak (frequent, cheap) < badge < level < cert (rare, terminal).
 * Higher tiers get more scale + treatment in CSS via `data-mag`. This is the
 * only place the magnitude ordering is defined.
 */
export type MagnitudeWeight = 1 | 2 | 3 | 4

const MAGNITUDE: Record<EarnKind, MagnitudeWeight> = {
  streak: 1,
  badge: 2,
  level: 3,
  cert: 4,
}

/**
 * Map a reward kind to its magnitude weight (1–4). Rarer/terminal rewards
 * weigh more, so the reveal can express hierarchy instead of treating a
 * certificate identically to a streak tick.
 *
 * @param kind reward category
 * @returns weight tier, 1 (streak) … 4 (cert)
 */
export function magnitudeWeight(kind: EarnKind): MagnitudeWeight {
  return MAGNITUDE[kind]
}

type Props = {
  /** Reward category. Controls semantic accent colour and the fallback icon. */
  kind: EarnKind
  /** Headline — the thing earned. e.g. "Volume Profile — Proven". */
  title: string
  /** Optional supporting line. e.g. "Level 4 · +120 XP". */
  sub?: string
  /**
   * Optional amplified reward figure — the dopamine token, e.g. "+120 XP" or
   * "Lv.4". Rendered as a large celebratory display element in the hero/overlay
   * state and a confident accent in inline. Decorative emphasis only; the
   * meaning still lives in title/sub for assistive tech. Renders nothing when
   * omitted — the component fabricates no figure of its own.
   */
  figure?: string
  /**
   * Optional custom icon node. When omitted, a kind-appropriate glyph is used.
   * Always decorative (aria-hidden) — meaning lives in title/sub.
   */
  icon?: React.ReactNode
  /** inline (default) or overlay. */
  variant?: EarnVariant
  /**
   * Play the one-shot reward tone on reveal. Opt-in and still gated by the
   * user's sound preference + reduced-motion inside useSound. Default false.
   */
  withSound?: boolean
  /**
   * Overlay only — called when dismissed (Esc, backdrop click, close button).
   * When provided on an overlay, a close affordance + focus trap are wired up.
   */
  onDismiss?: () => void
  className?: string
}

const DEFAULT_GLYPH: Record<EarnKind, string> = {
  badge: '◆',
  level: '▲',
  streak: '✦',
  cert: '❖',
}

const VERB: Record<EarnKind, string> = {
  badge: 'Badge earned',
  level: 'Level up',
  streak: 'Streak extended',
  cert: 'Certificate earned',
}

/**
 * A restrained reward reveal: an icon, a title, and an optional sub-line on a
 * disciplined-dark card. Animation is compositor-only (scale / opacity /
 * clip-path) and entirely content-agnostic — it renders whatever props it's
 * given and fabricates nothing.
 *
 * Accessibility:
 * - The reward is announced via an aria-live="polite" region (role="status").
 * - Overlay variant is a labelled dialog: Esc and backdrop dismiss, focus moves
 *   to the panel on open and returns to the previously-focused element on close,
 *   and Tab is trapped between the focusable controls.
 * - Reduced-motion → instant, no-motion variant (no scale/clip reveal).
 * - Never animates opacity on the text itself once revealed; the reveal is a
 *   one-shot transform on the card, after which text is fully opaque.
 */
export function EarnMoment({
  kind,
  title,
  sub,
  figure,
  icon,
  variant = 'inline',
  withSound = false,
  onDismiss,
  className = '',
}: Props) {
  const { play } = useSound()
  const labelId = useId()
  const descId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  // `revealed` flips on the frame after mount so the entrance transition runs.
  const [revealed, setRevealed] = useState(false)
  const [reduced, setReduced] = useState(false)

  const isOverlay = variant === 'overlay'
  const dismissable = isOverlay && typeof onDismiss === 'function'

  // Reveal + one-shot sound on mount.
  useEffect(() => {
    const reducedNow = prefersReducedMotion()
    setReduced(reducedNow)
    const id = requestAnimationFrame(() => setRevealed(true))
    if (withSound) play('earn')
    return () => cancelAnimationFrame(id)
    // play/withSound are stable for the life of a given reveal; intentionally
    // run once on mount so the tone fires exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Overlay focus management: move focus in on open, restore on unmount.
  useEffect(() => {
    if (!isOverlay) return
    restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null
    panelRef.current?.focus()
    return () => {
      restoreFocusRef.current?.focus?.()
    }
  }, [isOverlay])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isOverlay) return
      if (e.key === 'Escape' && dismissable) {
        e.stopPropagation()
        onDismiss?.()
        return
      }
      if (e.key !== 'Tab') return
      // Trap focus among the panel's focusable controls.
      const panel = panelRef.current
      if (!panel) return
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) {
        e.preventDefault()
        panel.focus()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [isOverlay, dismissable, onDismiss],
  )

  const reveal = reduced ? styles.reduced : revealed ? styles.revealed : styles.hidden
  const card = (
    <div
      ref={panelRef}
      className={`${styles.card} ${styles[`kind-${kind}`]} ${reveal}`}
      data-variant={variant}
      data-mag={magnitudeWeight(kind)}
      role={isOverlay ? 'dialog' : 'status'}
      aria-modal={isOverlay ? true : undefined}
      aria-live={isOverlay ? undefined : 'polite'}
      aria-labelledby={labelId}
      aria-describedby={sub ? descId : undefined}
      tabIndex={isOverlay ? -1 : undefined}
    >
      <span className={styles.glyph} aria-hidden="true">
        {icon ?? DEFAULT_GLYPH[kind]}
      </span>
      <p className={styles.eyebrow}>{VERB[kind]}</p>
      <p id={labelId} className={styles.title}>
        {title}
      </p>
      {figure ? (
        <p className={styles.figure} aria-hidden="true">
          {figure}
        </p>
      ) : null}
      {sub ? (
        <p id={descId} className={styles.sub}>
          {sub}
        </p>
      ) : null}

      {dismissable ? (
        <button
          type="button"
          className={styles.dismiss}
          onClick={() => onDismiss?.()}
        >
          Continue
        </button>
      ) : null}
    </div>
  )

  if (!isOverlay) {
    return <div className={`${styles.inlineWrap} ${className}`}>{card}</div>
  }

  return (
    <div
      className={`${styles.overlay} ${reduced ? styles.reduced : revealed ? styles.revealed : styles.hidden} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop: click-to-dismiss when dismissable. Not a focus target;
          the labelled dialog panel is. aria-hidden keeps it out of the AX tree. */}
      <div
        className={styles.backdrop}
        aria-hidden="true"
        onClick={dismissable ? () => onDismiss?.() : undefined}
      />
      {card}
    </div>
  )
}
