'use client'

/**
 * SageCodeWalkthrough — the academy's ANIMATED CODE STEPPER.
 *
 * A terminal-look surface (filename tab + traffic-dots in --ac tokens) renders a
 * snippet as real, selectable text in JetBrains Mono with a line-number gutter.
 * A series of authored STEPS each highlight a set of 1-based lines (left accent
 * bar + tinted background + vivid syntax). Non-active lines recede to a single
 * flat faint ink with syntax color removed, so the active line clearly dominates
 * (Scrimba/Sourcegraph context treatment) while staying AA-legible. Each step
 * carries a label + optional
 * deeper note. The stepper AUTO-ADVANCES on a timer once scrolled into view, and
 * is ALSO fully operable by hand: prev/next buttons, clickable step dots, and
 * arrow/enter keyboard control. Meaning never lives in the motion —
 * prefers-reduced-motion shows the active step statically with no auto-advance
 * and no transitions, and every transition is compositor-only (opacity only;
 * the accent bar is always present, just opacity-toggled).
 *
 * Wrapped in the shared <VisualFrame> so it is one system with SageDiagram/SageViz.
 * a11y: the stepper is a labelled group, the live annotation is aria-live polite,
 * controls are labelled buttons with focus-visible rings, current step announced.
 * 0 CLS: the code area height is reserved from the line count; stepping never
 * reflows. Syntax color is a light, synchronous, token-based regex colorizer for
 * the 3 supported languages (shiki ships in the repo but is async/heavier than an
 * interactive per-line stepper wants — the prompt's light-colorizer path is used).
 */

import * as React from 'react'
import { useReducedMotion } from 'framer-motion'
import { VisualFrame } from './VisualFrame'
import { renderTokens } from './code-colorizer'

export type CodeWalkthroughLanguage = 'python' | 'ts' | 'bash'

export type CodeWalkthroughStep = {
  /** 1-based line numbers this step highlights. */
  lines: number[]
  /** Short caption shown as the active step label. */
  label: string
  /** Optional deeper explanation shown under the label. */
  note?: string
}

export type SageCodeWalkthroughProps = {
  title: string
  subtitle?: string
  filename: string
  language: CodeWalkthroughLanguage
  /** The full snippet, newline-separated. */
  code: string
  /** Each step highlights its lines, with a caption + optional deeper note. */
  steps: CodeWalkthroughStep[]
  caption?: string
  className?: string
  /** Auto-advance dwell per step (ms). Default 3200. */
  intervalMs?: number
}

// Fixed metrics so the code area is reserved up-front (0 CLS) and stepping never
// reflows. Line height is locked; the gutter width is fixed by digit count.
const LINE_HEIGHT_PX = 24
const CODE_PAD_Y_PX = 16
const DEFAULT_INTERVAL_MS = 3200

export function SageCodeWalkthrough({
  title,
  subtitle,
  filename,
  language,
  code,
  steps,
  caption,
  className,
  intervalMs = DEFAULT_INTERVAL_MS,
}: SageCodeWalkthroughProps) {
  const reduce = useReducedMotion()
  const titleId = React.useId()
  const descId = React.useId()
  const stepperId = React.useId()

  const lines = React.useMemo(() => code.replace(/\n$/, '').split('\n'), [code])
  const hasSteps = steps.length > 0

  const [active, setActive] = React.useState(0)
  const [inView, setInView] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  // Clamp if the steps prop shrinks.
  const activeStep = hasSteps ? Math.min(active, steps.length - 1) : 0
  const current = hasSteps ? steps[activeStep] : undefined
  const activeLineSet = React.useMemo(
    () => new Set(current?.lines ?? []),
    [current],
  )

  const goTo = React.useCallback(
    (next: number) => {
      if (!hasSteps) return
      const wrapped = (next + steps.length) % steps.length
      setActive(wrapped)
    },
    [hasSteps, steps.length],
  )
  const goNext = React.useCallback(() => goTo(activeStep + 1), [goTo, activeStep])
  const goPrev = React.useCallback(() => goTo(activeStep - 1), [goTo, activeStep])

  // Start only when in view (IntersectionObserver). One-shot: once seen, stays on.
  React.useEffect(() => {
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            obs.disconnect()
            break
          }
        }
      },
      { threshold: 0.4 },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  // Auto-advance — only in view, only when motion is allowed, only with >1 step.
  React.useEffect(() => {
    if (reduce || !inView || !hasSteps || steps.length < 2) return
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length)
    }, Math.max(1200, intervalMs))
    return () => window.clearInterval(id)
  }, [reduce, inView, hasSteps, steps.length, intervalMs])

  // Keyboard: arrows step, Home/End jump, on the stepper group.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!hasSteps) return
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        goNext()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        goPrev()
        break
      case 'Home':
        event.preventDefault()
        goTo(0)
        break
      case 'End':
        event.preventDefault()
        goTo(steps.length - 1)
        break
      default:
        break
    }
  }

  // Reserve the code area height so step changes never reflow (0 CLS).
  const codeAreaHeight = lines.length * LINE_HEIGHT_PX + CODE_PAD_Y_PX * 2
  const gutterDigits = String(lines.length).length
  const gutterWidth = `calc(${Math.max(2, gutterDigits)}ch + 1.2rem)`

  // sr-only description: name the walkthrough so meaning survives without motion.
  const description = React.useMemo(() => {
    const lead =
      subtitle ?? `Line-by-line walkthrough of ${filename}, a ${LANG_LABEL[language]} snippet.`
    if (!hasSteps) return lead
    const stepList = steps
      .map((s, i) => `Step ${i + 1}: ${s.label} (lines ${formatLineRange(s.lines)})`)
      .join('. ')
    return `${lead} ${steps.length} step${steps.length === 1 ? '' : 's'}. ${stepList}.`
  }, [subtitle, filename, language, hasSteps, steps])

  const transition = reduce
    ? 'none'
    : `opacity var(--ac-dur-fast, 150ms) var(--ac-ease, ${easeCss})`

  return (
    <VisualFrame
      kicker="Code walkthrough"
      title={title}
      titleId={titleId}
      subtitle={subtitle}
      descId={descId}
      description={description}
      caption={caption}
      className={className}
    >
      <div ref={rootRef} style={layoutStyle}>
        {/* Terminal surface */}
        <div style={terminalStyle}>
          <div style={terminalHeaderStyle}>
            <span style={dotsStyle} aria-hidden="true">
              <span style={{ ...dotStyle, background: 'var(--ac-danger)' }} />
              <span style={{ ...dotStyle, background: 'var(--ac-pending)' }} />
              <span style={{ ...dotStyle, background: 'var(--ac-mastery)' }} />
            </span>
            <span style={filenameStyle}>{filename}</span>
            <span style={langBadgeStyle} aria-hidden="true">
              {LANG_LABEL[language]}
            </span>
          </div>

          {/* Real, selectable code text. Height reserved => 0 CLS. */}
          <div style={{ ...codeScrollStyle, minHeight: codeAreaHeight }}>
            <pre style={preStyle}>
              <code style={codeStyle}>
                {lines.map((lineText, index) => {
                  const lineNo = index + 1
                  const isActive = activeLineSet.has(lineNo)
                  const dim = hasSteps && !isActive
                  return (
                    <span
                      key={lineNo}
                      style={{
                        ...lineRowStyle,
                        background: isActive
                          ? 'color-mix(in oklch, var(--ac-surface-2) 60%, var(--ac-accent) 14%)'
                          : 'transparent',
                        // Recession is carried by a FLAT faint ink on dimmed
                        // lines (see lineCodeStyle / dim branch below), which
                        // desaturates context the way Scrimba/Sourcegraph do and
                        // stays AA on its own. Opacity is kept high (0.78) so it
                        // adds a touch more recede WITHOUT dropping the dimmed ink
                        // below readability — a low opacity multiplier alone would
                        // crush ink-soft to ~2.8:1 (sub-AA). Opacity is the only
                        // animated/compositor property; the ink swap is instant.
                        opacity: dim ? 0.78 : 1,
                        transition,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          ...accentBarStyle,
                          opacity: isActive ? 1 : 0,
                          transition,
                        }}
                      />
                      <span style={{ ...gutterStyle, width: gutterWidth }}>{lineNo}</span>
                      {/* Dimmed lines render as a single FLAT faint ink with
                          syntax color suppressed, so only the active line's vivid
                          tokens carry hue — that desaturation is what makes the
                          active line dominate. Text stays real/selectable; the ink
                          (--ac-ink-faint, ~6:1 on --ac-bg) is AA as secondary
                          text. No reflow: color/opacity only, 0 CLS. */}
                      <span style={dim ? lineCodeDimStyle : lineCodeStyle}>
                        {dim ? lineText : renderTokens(lineText, language)}
                        {lineText.length === 0 ? '​' : null}
                      </span>
                    </span>
                  )
                })}
              </code>
            </pre>
          </div>
        </div>

        {/* Stepper + annotation */}
        {hasSteps ? (
          <div
            id={stepperId}
            role="group"
            aria-roledescription="code walkthrough stepper"
            aria-label={`${title} — step ${activeStep + 1} of ${steps.length}`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            style={stepperStyle}
          >
            <div style={progressRowStyle}>
              <div style={dotGroupStyle}>
                <span style={dotGroupLabelStyle} aria-hidden="true">
                  Steps
                </span>
                <div style={dotRowStyle} role="tablist" aria-label="Walkthrough steps">
                  {steps.map((step, index) => {
                  const isOn = index === activeStep
                  return (
                    <button
                      key={index}
                      type="button"
                      role="tab"
                      aria-selected={isOn}
                      aria-label={`Step ${index + 1}: ${step.label}`}
                      onClick={() => goTo(index)}
                      className="ac-cw-dot"
                      style={{
                        ...stepDotStyle,
                        background: isOn ? 'var(--ac-accent)' : 'var(--ac-rule-strong)',
                        transform: isOn ? 'scale(1.18)' : 'scale(1)',
                        transition: reduce ? 'none' : undefined,
                      }}
                    />
                  )
                })}
                </div>
              </div>

              <div style={navStyle}>
                {/* Passive readout — duplicates the group label, so hidden from AT. */}
                <span style={stepCountStyle} aria-hidden="true">
                  {activeStep + 1}
                  <span style={stepCountSlashStyle}> / </span>
                  {steps.length}
                </span>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous step"
                  className="ac-cw-nav"
                  style={navButtonStyle}
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next step"
                  className="ac-cw-nav"
                  style={navButtonStyle}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            {/* The live annotation — announced on step change. */}
            <div aria-live="polite" aria-atomic="true" style={annotationStyle}>
              <p style={annotationLabelStyle}>
                <span style={annotationIndexStyle}>
                  {`Step ${activeStep + 1}`}
                  {current && current.lines.length > 0 ? (
                    <span style={annotationLinesStyle}>
                      {` · ${formatLineLabel(current.lines)}`}
                    </span>
                  ) : null}
                </span>
                {current?.label}
              </p>
              {current?.note ? <p style={annotationNoteStyle}>{current.note}</p> : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Scoped hover/focus-visible states (token-only). */}
      <style>{controlCss}</style>
    </VisualFrame>
  )
}

/* --------------------------------- helpers --------------------------------- */

const LANG_LABEL: Record<CodeWalkthroughLanguage, string> = {
  python: 'Python',
  ts: 'TypeScript',
  bash: 'Bash',
}

function formatLineRange(lines: number[]): string {
  if (lines.length === 0) return '—'
  if (lines.length === 1) return String(lines[0])
  const sorted = [...lines].sort((a, b) => a - b)
  return `${sorted[0]}–${sorted[sorted.length - 1]}`
}

/**
 * Annotation header line label. Singular vs plural, contiguous range vs list:
 *   [3]       -> "line 3"
 *   [4,5,6]   -> "lines 4–6"   (contiguous)
 *   [2,5,9]   -> "lines 2, 5, 9" (non-contiguous)
 */
function formatLineLabel(lines: number[]): string {
  if (lines.length === 0) return ''
  const sorted = [...lines].sort((a, b) => a - b)
  if (sorted.length === 1) return `line ${sorted[0]}`
  const isContiguous = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1)
  if (isContiguous) return `lines ${sorted[0]}–${sorted[sorted.length - 1]}`
  return `lines ${sorted.join(', ')}`
}

const easeCss = 'cubic-bezier(0.16, 1, 0.3, 1)'

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10 3.5 5.5 8l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------------------------------- styles --------------------------------- */

const layoutStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  // Tight coupling: the stepper sits close under the terminal block so the
  // annotation reads as one unit with the code, not a floating caption.
  gap: 'var(--ac-space-xs)',
}

const terminalStyle: React.CSSProperties = {
  border: '1px solid var(--ac-rule)',
  borderRadius: 'var(--ac-radius)',
  background: 'var(--ac-bg)',
  overflow: 'hidden',
  boxShadow: 'var(--ac-elev-1)',
}

const terminalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.55rem 0.85rem',
  borderBottom: '1px solid var(--ac-rule)',
  background: 'var(--ac-surface)',
}

const dotsStyle: React.CSSProperties = {
  display: 'inline-flex',
  gap: '0.4rem',
  flex: '0 0 auto',
}

const dotStyle: React.CSSProperties = {
  width: 11,
  height: 11,
  borderRadius: '50%',
  display: 'inline-block',
  opacity: 0.85,
}

const filenameStyle: React.CSSProperties = {
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: 'var(--ac-step--1, 0.8rem)',
  color: 'var(--ac-ink-soft)',
  letterSpacing: '0.01em',
}

const langBadgeStyle: React.CSSProperties = {
  marginLeft: 'auto',
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: '0.7rem',
  letterSpacing: 'var(--ac-track-label, 0.12em)',
  textTransform: 'uppercase',
  color: 'var(--ac-ink-faint)',
  border: '1px solid var(--ac-rule)',
  borderRadius: 'var(--ac-radius-pill)',
  padding: '0.1rem 0.55rem',
}

const codeScrollStyle: React.CSSProperties = {
  overflowX: 'auto',
}

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: `${CODE_PAD_Y_PX}px 0`,
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
}

const codeStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'inherit',
  fontSize: '0.825rem',
}

const lineRowStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  height: LINE_HEIGHT_PX,
  lineHeight: `${LINE_HEIGHT_PX}px`,
  paddingRight: '1rem',
  willChange: 'opacity',
}

const accentBarStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 3,
  background: 'var(--ac-accent)',
  borderRadius: '0 2px 2px 0',
}

const gutterStyle: React.CSSProperties = {
  flex: '0 0 auto',
  textAlign: 'right',
  paddingRight: '0.9rem',
  paddingLeft: '0.6rem',
  color: 'var(--ac-ink-faint)',
  userSelect: 'none',
  fontVariantNumeric: 'tabular-nums',
}

const lineCodeStyle: React.CSSProperties = {
  whiteSpace: 'pre',
  // Base ink for un-tinted tokens (plain identifiers / operators / punctuation).
  // Colored tokens override per-span; this is the dimmer foreground weight so the
  // tinted tokens read as the emphasis. Matches TOKEN_COLOR.plain.
  color: 'var(--ac-ink-soft)',
}

// Non-active (context) lines: a single flat faint ink, syntax color removed, so
// the active line's vivid tokens clearly dominate (Scrimba/Sourcegraph context
// treatment). --ac-ink-faint is ~6:1 on --ac-bg at full opacity — AA-legible as
// secondary text even after the row's 0.78 opacity (≈4.6:1, still ≥ AA 4.5:1 for
// the bulk of the line). Color is set here (instant, no animation); the row's
// opacity is the only animated property, keeping motion compositor-only and the
// static reduced-motion state already showing the active line dominant.
const lineCodeDimStyle: React.CSSProperties = {
  whiteSpace: 'pre',
  color: 'var(--ac-ink-faint)',
}

const stepperStyle: React.CSSProperties = {
  display: 'grid',
  gap: '0.7rem',
  // Hairline + inset padding couple the controls/annotation into one panel that
  // visually continues the terminal block above it.
  borderTop: '1px solid var(--ac-rule)',
  paddingTop: '0.7rem',
  borderRadius: 'var(--ac-radius)',
  outline: 'none',
}

const progressRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--ac-space-sm)',
  flexWrap: 'wrap',
}

// Dots = interactive step targets. The micro-label names them so they don't read
// as decorative progress pips.
const dotGroupStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.6rem',
  flexWrap: 'wrap',
}

const dotGroupLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: '0.66rem',
  letterSpacing: 'var(--ac-track-label, 0.12em)',
  textTransform: 'uppercase',
  color: 'var(--ac-ink-faint)',
}

const dotRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.55rem',
  flexWrap: 'wrap',
}

const stepDotStyle: React.CSSProperties = {
  width: 11,
  height: 11,
  padding: 0,
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  transition: `transform var(--ac-dur-fast, 150ms) var(--ac-ease, ${easeCss}), background var(--ac-dur-fast, 150ms) var(--ac-ease, ${easeCss})`,
}

const navStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
}

const stepCountStyle: React.CSSProperties = {
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: 'var(--ac-step--1, 0.8rem)',
  // Passive readout: current step in soft ink, total dimmer — quieter than the
  // interactive dots, which carry the accent fill.
  color: 'var(--ac-ink-soft)',
  fontVariantNumeric: 'tabular-nums',
  marginRight: '0.25rem',
}

const stepCountSlashStyle: React.CSSProperties = {
  color: 'var(--ac-ink-faint)',
}

const navButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  padding: 0,
  borderRadius: 'var(--ac-radius-sm)',
  border: '1px solid var(--ac-rule-strong)',
  background: 'var(--ac-surface)',
  color: 'var(--ac-ink-soft)',
  cursor: 'pointer',
}

const annotationStyle: React.CSSProperties = {
  borderLeft: '3px solid var(--ac-accent)',
  paddingLeft: '0.9rem',
  minHeight: '2.6rem',
}

const annotationLabelStyle: React.CSSProperties = {
  margin: 0,
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.6rem',
  flexWrap: 'wrap',
  color: 'var(--ac-ink)',
  fontFamily: 'var(--ac-font-body, system-ui, sans-serif)',
  fontSize: 'var(--ac-step-0, 1rem)',
  fontWeight: 600,
  lineHeight: 'var(--ac-leading-snug, 1.3)',
}

const annotationIndexStyle: React.CSSProperties = {
  fontFamily: 'var(--ac-font-mono, ui-monospace, monospace)',
  fontSize: '0.7rem',
  letterSpacing: 'var(--ac-track-label, 0.12em)',
  textTransform: 'uppercase',
  color: 'var(--ac-accent-text)',
}

// The line locator inside the step index — mono, faint, subtle. Quiet by design
// so it reads as a pointer to the code, not a second emphasis.
const annotationLinesStyle: React.CSSProperties = {
  color: 'var(--ac-ink-faint)',
  fontWeight: 400,
}

const annotationNoteStyle: React.CSSProperties = {
  margin: '0.4rem 0 0',
  maxWidth: '64ch',
  color: 'var(--ac-ink-soft)',
  fontSize: 'var(--ac-step--1, 0.875rem)',
  lineHeight: 'var(--ac-leading-body, 1.62)',
}

// Scoped hover + focus-visible states (token-only, compositor-friendly).
const controlCss = `
.ac-cw-nav:hover { background: var(--ac-surface-2); color: var(--ac-ink); }
.ac-cw-nav:focus-visible,
.ac-cw-dot:focus-visible {
  outline: 2px solid var(--ac-accent);
  outline-offset: 2px;
}
.ac-cw-dot:hover { background: var(--ac-accent-text) !important; }
`
