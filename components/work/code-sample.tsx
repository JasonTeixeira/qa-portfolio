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
            'background-color: #0B0A09',
            'border-radius: 0 0 0.75rem 0.75rem',
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
    <figure className="rounded-xl border border-[#2A2826] bg-[#0B0A09] overflow-hidden my-6">
      {/* Terminal chrome */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#2A2826] bg-[#12110F]">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E85D3A]/70" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#A8C633]/60" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#0ED3CF]/70" aria-hidden />
          <span className="ml-3 text-[11px] font-mono text-[#A8A29E]">{sample.title}</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#57534E]">
          {langLabel[sample.lang]}
        </span>
      </header>

      <div dangerouslySetInnerHTML={{ __html: html }} />

      {sample.caption && (
        <figcaption className="px-4 py-2.5 text-xs text-[#A8A29E] border-t border-[#2A2826] bg-[#0F0E0D] [font-family:var(--font-mono),ui-monospace,monospace]">
          {'// '}
          {sample.caption}
        </figcaption>
      )}
    </figure>
  )
}
