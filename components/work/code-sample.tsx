// Phase 7: Server-rendered Shiki code sample with terminal chrome.
// Renders zero client JS — the syntax tree is HTML at build time.

import { codeToHtml } from 'shiki'
import type { CodeSample as CodeSampleType } from '@/data/work/case-extras'

interface Props {
  sample: CodeSampleType
}

const langLabel: Record<CodeSampleType['lang'], string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  python: 'python',
  bash: 'bash',
  sql: 'sql',
  yaml: 'yaml',
  json: 'json',
}

export async function CodeSample({ sample }: Props) {
  const html = await codeToHtml(sample.code.trimEnd(), {
    lang: sample.lang,
    theme: 'github-dark-default',
    transformers: [
      {
        pre(node) {
          node.properties.style = [
            'background-color: var(--sage-bg)',
            'border-radius: 0 0 3px 3px',
            'padding: 1.25rem',
            'overflow-x: auto',
            'font-size: 12.5px',
            'line-height: 1.65',
            'font-family: var(--font-mono), ui-monospace, monospace',
          ].join(';')
          return node
        },
      },
    ],
  })

  return (
    <figure className="my-6 overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-bg)]">
      {/* Terminal chrome */}
      <header className="flex items-center justify-between border-b border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--sage-coral)]/70" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-[var(--sage-lime)]/60" aria-hidden />
          <span className="h-2 w-2 rounded-full bg-[#0ED3CF]/70" aria-hidden />
          <span className="ml-3 text-[11px] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
            {sample.title}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
          {langLabel[sample.lang]}
        </span>
      </header>

      <div dangerouslySetInnerHTML={{ __html: html }} />

      {sample.caption && (
        <figcaption className="border-t border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-4 py-2.5 text-xs text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
          {'// '}
          {sample.caption}
        </figcaption>
      )}
    </figure>
  )
}
