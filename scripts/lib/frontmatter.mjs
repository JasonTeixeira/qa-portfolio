import { dump, load } from 'js-yaml'

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {}, content: raw }
  const parsed = load(match[1]) ?? {}
  return {
    data: parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {},
    content: raw.slice(match[0].length),
  }
}

export function stringifyFrontmatter(content, data, options = {}) {
  const yaml = dump(data, {
    lineWidth: options.lineWidth ?? 1000,
    quotingType: options.quotingType ?? '"',
    forceQuotes: Boolean(options.forceQuotes),
    noRefs: true,
    sortKeys: false,
  })
  return `---\n${yaml}---\n\n${content}`
}
