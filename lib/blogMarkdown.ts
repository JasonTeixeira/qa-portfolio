import { marked, type Tokens } from 'marked'
import { codeToHtml } from 'shiki'

const SHIKI_THEME = 'github-dark'

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function highlightCode(code: string, lang?: string): Promise<string> {
  if (!lang) {
    return `<pre class="shiki-pre"><code>${escapeHtml(code)}</code></pre>`
  }
  try {
    const html = await codeToHtml(code, {
      lang,
      theme: SHIKI_THEME,
    })
    return html.replace('<pre class="', '<pre class="shiki-pre ')
  } catch {
    return `<pre class="shiki-pre"><code>${escapeHtml(code)}</code></pre>`
  }
}

export async function renderMarkdownToHtml(md: string): Promise<string> {
  const tokens = marked.lexer(md)

  // First pass: collect code blocks and highlight them async
  const codeBlocks: { idx: number; html: string }[] = []
  await Promise.all(
    tokens
      .map((token, idx) => ({ token, idx }))
      .filter(({ token }) => token.type === 'code')
      .map(async ({ token, idx }) => {
        const t = token as Tokens.Code
        const html = await highlightCode(t.text, t.lang || undefined)
        codeBlocks.push({ idx, html })
      }),
  )

  // Build a marked renderer that uses pre-highlighted blocks
  const blockMap = new Map(codeBlocks.map((c) => [c.idx, c.html]))
  // Walk tokens and replace 'code' with a custom html token containing highlighted output
  const transformed = tokens.map((token, idx) => {
    if (token.type === 'code') {
      const html = blockMap.get(idx)
      if (html) {
        return { type: 'html', raw: html, pre: false, text: html } as Tokens.HTML
      }
    }
    return token
  })

  // marked.parser accepts an array of tokens
  const html = marked.parser(transformed as Parameters<typeof marked.parser>[0])
  return html
}
