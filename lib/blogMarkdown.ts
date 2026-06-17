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

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/`/g, '&#96;')
}

function parseAttrs(raw = ''): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([a-zA-Z][\w-]*)=(?:"([^"]*)"|'([^']*)'|([^\s]+))/g
  for (const match of raw.matchAll(re)) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attrs
}

function paragraphsFromBody(body: string) {
  return body
    .trim()
    .split(/\n{2,}/)
    .map((chunk) => `<p>${escapeHtml(chunk.trim()).replace(/\n/g, '<br/>')}</p>`)
    .join('')
}

function listFromBody(body: string) {
  const items = body
    .split('\n')
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean)
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}

function scorecardFromBody(body: string) {
  const rows = body
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('|') && !/^\|?\s*:?-{3,}/.test(line))
    .map((line) =>
      line
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim()),
    )

  if (!rows.length) return ''
  const [head, ...bodyRows] = rows
  return `<table><thead><tr>${head
    .map((cell) => `<th>${escapeHtml(cell)}</th>`)
    .join('')}</tr></thead><tbody>${bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`
}

function renderSystemDiagram(attrs: Record<string, string>, body: string) {
  const title = attrs.title || 'System diagram'
  const label = attrs.label || 'surface -> system'
  const nodes = (attrs.nodes || 'Input,Data,Decision,Output')
    .split(',')
    .map((node) => node.trim())
    .filter(Boolean)
    .slice(0, 4)
  const padded = [...nodes, 'Input', 'Data', 'Decision', 'Output'].slice(0, 4)

  return `<figure class="mdx-system-diagram">
    <figcaption><span>${escapeHtml(title)}</span><span>${escapeHtml(label)}</span></figcaption>
    <svg viewBox="0 0 640 280" role="img" aria-label="${escapeAttr(title)}">
      <defs><linearGradient id="mdx-system-flow" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stop-color="#3D5AFE"/><stop offset="52%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#FF2D9B"/></linearGradient></defs>
      <path d="M 62 164 C 150 66, 246 70, 324 136 S 478 232, 582 96" fill="none" stroke="url(#mdx-system-flow)" stroke-linecap="round" stroke-width="3"/>
      <path d="M 78 218 C 178 164, 270 196, 368 116 S 506 82, 592 174" fill="none" stroke="rgba(242,239,233,0.16)" stroke-linecap="round" stroke-width="1"/>
      ${[
        [62, 164],
        [224, 78],
        [398, 188],
        [582, 96],
      ]
        .map(
          ([x, y], index) =>
            `<g><circle cx="${x}" cy="${y}" r="24" fill="rgba(61,90,254,0.055)"/><circle cx="${x}" cy="${y}" r="8" fill="#0B0B0E" stroke="url(#mdx-system-flow)" stroke-width="2"/><text x="${x}" y="${y + 44}" fill="#8A8A94" font-family="var(--font-mono)" font-size="11" text-anchor="middle" letter-spacing="1.4">${escapeHtml(padded[index])}</text></g>`,
        )
        .join('')}
    </svg>
    ${body.trim() ? `<div class="mdx-system-diagram-body">${paragraphsFromBody(body)}</div>` : ''}
  </figure>`
}

function renderDirective(name: string, attrs: Record<string, string>, body: string) {
  const title = attrs.title || {
    'proof-note': 'Proof note',
    'system-diagram': 'System diagram',
    scorecard: 'Scorecard',
    checklist: 'Checklist',
    'offer-cta': 'Next step',
  }[name] || 'Note'
  const label = attrs.label || name.replace(/-/g, ' ')

  if (name === 'system-diagram') return renderSystemDiagram(attrs, body)

  if (name === 'scorecard') {
    return `<aside class="mdx-shortcode mdx-scorecard"><div class="mdx-shortcode-head"><span>${escapeHtml(label)}</span><strong>${escapeHtml(title)}</strong></div><div class="mdx-table-frame"><div class="mdx-table-scroll">${scorecardFromBody(body)}</div></div></aside>`
  }

  if (name === 'checklist') {
    return `<aside class="mdx-shortcode mdx-checklist"><div class="mdx-shortcode-head"><span>${escapeHtml(label)}</span><strong>${escapeHtml(title)}</strong></div>${listFromBody(body)}</aside>`
  }

  if (name === 'offer-cta') {
    const href = attrs.href || '/book'
    const cta = attrs.cta || attrs.button || 'Take the next step'
    return `<aside class="mdx-shortcode mdx-offer-cta"><div><span>${escapeHtml(label)}</span><h3>${escapeHtml(title)}</h3>${paragraphsFromBody(body)}</div><a href="${escapeAttr(href)}">${escapeHtml(cta)} <span aria-hidden="true">-&gt;</span></a></aside>`
  }

  return `<aside class="mdx-shortcode mdx-proof-note"><div class="mdx-shortcode-head"><span>${escapeHtml(label)}</span><strong>${escapeHtml(title)}</strong></div>${paragraphsFromBody(body)}</aside>`
}

export function transformContentDirectives(md: string): string {
  return md.replace(
    /^:::(proof-note|system-diagram|scorecard|checklist|offer-cta)([^\n]*)\n([\s\S]*?)\n:::$/gm,
    (_match, name: string, rawAttrs: string, body: string) =>
      renderDirective(name, parseAttrs(rawAttrs), body),
  )
}

async function highlightCode(code: string, lang?: string): Promise<string> {
  const label = lang ? lang.toUpperCase() : 'TEXT'
  if (!lang) {
    return `<figure class="mdx-code-panel" data-language="${label}"><figcaption><span>code panel</span><span>${label}</span></figcaption><pre class="shiki-pre"><code>${escapeHtml(code)}</code></pre></figure>`
  }
  try {
    const html = await codeToHtml(code, {
      lang,
      theme: SHIKI_THEME,
    })
    const highlighted = html.replace('<pre class="', '<pre class="shiki-pre ')
    return `<figure class="mdx-code-panel" data-language="${label}"><figcaption><span>code panel</span><span>${label}</span></figcaption>${highlighted}</figure>`
  } catch {
    return `<figure class="mdx-code-panel" data-language="${label}"><figcaption><span>code panel</span><span>${label}</span></figcaption><pre class="shiki-pre"><code>${escapeHtml(code)}</code></pre></figure>`
  }
}

function enhanceArticleHtml(html: string): string {
  return html
    .replace(/<blockquote>/g, '<blockquote class="mdx-callout" data-label="field note">')
    .replace(
      /<table>/g,
      '<div class="mdx-table-frame"><div class="mdx-table-scroll"><table>',
    )
    .replace(/<\/table>/g, '</table></div></div>')
    .replace(
      /<hr>/g,
      '<div class="mdx-system-break" aria-hidden="true"><span></span><span></span><span></span></div>',
    )
}

export async function renderMarkdownToHtml(md: string): Promise<string> {
  const tokens = marked.lexer(transformContentDirectives(md))

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
  return enhanceArticleHtml(html)
}
