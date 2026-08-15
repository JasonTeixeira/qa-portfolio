'use client'

import * as React from 'react'
import { renderTokens } from '@/components/academy/visuals/code-colorizer'
import type { CodeWalkthroughLanguage } from '@/components/academy/visuals/SageCodeWalkthrough'
import styles from './code-surface.module.css'

/** The languages the sample blocks author with; maps onto the colorizer's set. */
type SourceLanguage = 'python' | 'ts' | 'bash' | 'js' | 'javascript' | 'typescript' | undefined

/** Human label shown in the header chip per language. */
const LANG_LABEL: Record<CodeWalkthroughLanguage, string> = {
  python: 'Python',
  ts: 'TypeScript',
  bash: 'Shell',
}

/** Normalize the loose authoring language into the 3 the colorizer supports. */
function toColorizerLang(language: SourceLanguage): CodeWalkthroughLanguage {
  switch (language) {
    case 'python':
      return 'python'
    case 'bash':
      return 'bash'
    case 'js':
    case 'javascript':
    case 'ts':
    case 'typescript':
    default:
      return 'ts'
  }
}

type CodeSurfaceProps = {
  code: string
  language?: SourceLanguage
  /** Optional filename shown in the header chip (e.g. `handler.py`). */
  filename?: string
  /** Show a copy control in the header (client clipboard). Default false. */
  copyable?: boolean
  /** Accessible label for the scroll region. */
  ariaLabel?: string
  /** Optional 1-based line numbers to highlight as the instrument focus line(s). */
  activeLines?: number[]
}

/**
 * CodeSurface — the shared, dependency-free code WELL for the lesson player.
 *
 * A real editor surface, not a plain <pre> dump: a lifted inset well (inner
 * border + inset shadow), a language/label header chip, subtle line numbers in a
 * gutter, and lightweight token highlighting (keyword / string / comment /
 * number / fn / punctuation) via the shared `renderTokens` colorizer — all on the
 * existing --ac-* palette, every token AA on the near-black code floor.
 *
 * a11y: the scroll region keeps tabIndex=0 + role="region" + aria-label (WCAG
 * 2.1.1 scrollable-region-focusable). Line numbers are aria-hidden decoration;
 * the code text is real, selectable text. Zero JS motion.
 */
export function CodeSurface({
  code,
  language,
  filename,
  copyable = false,
  ariaLabel = 'Code sample',
  activeLines,
}: CodeSurfaceProps) {
  const [copied, setCopied] = React.useState(false)
  const lang = toColorizerLang(language)
  const label = filename ?? LANG_LABEL[lang]
  // Trailing newline shouldn't render a phantom empty final line.
  const lines = React.useMemo(() => code.replace(/\n$/, '').split('\n'), [code])
  const gutterWidth = String(lines.length).length
  const activeSet = React.useMemo(() => new Set(activeLines ?? []), [activeLines])

  const copy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className={styles.well}>
      <div className={styles.head}>
        {/* Project-specific terminal header: a mono prompt glyph + a breadcrumb
            path to the file (not the macOS traffic-light cliché). The ▮ block is
            the Sage terminal caret; the path reads as a real editor location. */}
        <span className={styles.prompt} aria-hidden="true">▮</span>
        <span className={styles.path} aria-hidden="true">
          <span className={styles.pathRoot}>sage</span>
          <span className={styles.pathSep}>/</span>
          <span className={styles.label}>{label}</span>
        </span>
        <span className={styles.rows} aria-hidden="true">
          {lines.length} LN
        </span>
        <span className={styles.lang} aria-hidden="true">
          {LANG_LABEL[lang]}
        </span>
        {copyable ? (
          <button type="button" className={styles.copy} onClick={copy}>
            {copied ? 'copied' : 'copy'}
          </button>
        ) : null}
      </div>
      <pre className={styles.body} tabIndex={0} role="region" aria-label={ariaLabel}>
        <code className={styles.codeGrid} style={{ '--gutter-ch': gutterWidth } as React.CSSProperties}>
          {lines.map((line, i) => (
            <span
              key={i}
              className={styles.row}
              data-active={activeSet.has(i + 1) ? 'true' : undefined}
            >
              <span className={styles.ln} aria-hidden="true">
                {i + 1}
              </span>
              <span className={styles.src}>{renderTokens(line, lang)}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
