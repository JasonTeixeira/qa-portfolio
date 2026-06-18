import * as React from 'react'

interface BuildLogProps {
  /** The verbatim "what shipped" paragraphs from the case study. */
  entries: string[]
}

/**
 * BuildLog — a ruled, indexed timeline rendered from the real "what shipped"
 * prose. A hairline spine with registration nodes; each entry is a verbatim
 * build-log paragraph, numbered. No fabricated dates or milestones — the
 * content is the case study's own words, given timeline structure.
 */
export function BuildLog({ entries }: BuildLogProps) {
  return (
    <ol className="relative m-0 list-none p-0">
      {/* Spine */}
      <span
        aria-hidden
        className="absolute bottom-2 left-[7px] top-2 w-px bg-[var(--sage-border)]"
      />
      {entries.map((entry, i) => (
        <li key={i} className="relative grid grid-cols-[auto_1fr] gap-x-5 pb-8 last:pb-0">
          {/* Node */}
          <span aria-hidden className="relative mt-1 flex h-[15px] w-[15px] items-center justify-center">
            <span className="h-[15px] w-[15px] rounded-full border border-[var(--sage-border-strong)] bg-[var(--sage-bg)]" />
            <span className="absolute h-1.5 w-1.5 rounded-full bg-[#3D5AFE]" />
          </span>

          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
              {'log · entry '}
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="mt-2 text-[15px] leading-[1.7] text-[var(--sage-ink-muted)]">{entry}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
