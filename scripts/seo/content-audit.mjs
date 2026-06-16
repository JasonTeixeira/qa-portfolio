#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const BLOG_DIR = path.join(ROOT, 'content', 'blog')
const OUT_DIR = path.join(ROOT, 'docs', 'seo')

const clusterRules = [
  ['testing-qa', /\b(test|testing|qa|selenium|appium|coverage|flaky|owasp|security scanner)\b/i],
  ['fintech-trading', /\b(trading|fintech|risk|portfolio|backtesting|nexural|alphastream|futures|indicator|var|cvar)\b/i],
  ['cloud-infra', /\b(aws|cloud|terraform|docker|ci\/cd|oidc|supabase|postgres|infrastructure|monitoring|websocket)\b/i],
  ['ai-engineering', /\b(ai|agent|gpt|llm|discord bot|automation)\b/i],
  ['solo-studio', /\b(solo|career|llc|interview|recruiter|building in public|book|portfolio)\b/i],
]

function deriveCluster(data, slug) {
  const haystack = [data.title, data.category, slug, ...(data.tags ?? [])].filter(Boolean).join(' ')
  return clusterRules.find(([, re]) => re.test(haystack))?.[0] ?? 'product-systems'
}

function scorePost({ data, content, cluster }) {
  const title = String(data.title ?? '')
  const words = content.split(/\s+/).filter(Boolean).length
  const excerpt = String(data.excerpt ?? data.description ?? '')
  const hasCover = typeof data.coverImage === 'string' && data.coverImage.startsWith('/')
  const clusterInTitle = title.toLowerCase().includes(cluster.replace(/-/g, ' '))
  const tagInTitle = (data.tags ?? []).some((tag) => title.toLowerCase().includes(String(tag).toLowerCase()))

  return [
    clusterInTitle ? 2 : tagInTitle ? 1 : 0,
    words > 1000 ? 2 : words >= 500 ? 1 : 0,
    excerpt.length > 0 ? 2 : 0,
    hasCover ? 2 : 0,
    data.cluster ? 2 : 1,
  ].reduce((sum, n) => sum + n, 0)
}

function disposition(score) {
  if (score >= 8) return 'keep'
  if (score >= 6) return 'improve'
  if (score >= 4) return 'merge'
  return 'prune'
}

async function main() {
  const files = (await fs.readdir(BLOG_DIR)).filter((file) => file.endsWith('.mdx')).sort()
  const auditedAt = new Date().toISOString()
  const items = []

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '')
    const raw = await fs.readFile(path.join(BLOG_DIR, file), 'utf8')
    const { data, content } = matter(raw)
    const cluster = data.cluster ?? deriveCluster(data, slug)
    const score = scorePost({ data, content, cluster })
    items.push({
      slug,
      title: data.title ?? slug,
      date: data.date ?? data.datePublished ?? null,
      category: data.category ?? 'Engineering',
      cluster,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      score,
      disposition: disposition(score),
      hasExplicitCluster: Boolean(data.cluster),
      hasKeywords: Array.isArray(data.keywords) && data.keywords.length > 0,
      hasCover: Boolean(data.coverImage),
      url: `/blog/${slug}`,
    })
  }

  const summary = {
    auditedAt,
    total: items.length,
    byDisposition: items.reduce((acc, item) => {
      acc[item.disposition] = (acc[item.disposition] ?? 0) + 1
      return acc
    }, {}),
    byCluster: items.reduce((acc, item) => {
      acc[item.cluster] = (acc[item.cluster] ?? 0) + 1
      return acc
    }, {}),
  }

  const out = { summary, items }
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify(out, null, 2))
    return
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  const date = auditedAt.slice(0, 10)
  const outPath = path.join(OUT_DIR, `content-inventory.${date}.json`)
  await fs.writeFile(outPath, JSON.stringify(out, null, 2) + '\n')
  console.log(`Wrote ${path.relative(ROOT, outPath)} (${items.length} posts)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
