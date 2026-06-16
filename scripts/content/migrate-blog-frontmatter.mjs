#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const BLOG_DIR = path.join(ROOT, 'content', 'blog')
const SITE = 'https://www.sageideas.dev'

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

function deriveKeywords(data, cluster) {
  const words = String(data.title ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .slice(0, 4)

  return Array.from(
    new Set(
      [...(data.tags ?? []), data.category, cluster.replace(/-/g, ' '), ...words]
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  ).slice(0, 10)
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const files = (await fs.readdir(BLOG_DIR)).filter((file) => file.endsWith('.mdx')).sort()
  const changed = []

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file)
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = matter(raw)
    const slug = parsed.data.slug ?? file.replace(/\.mdx$/, '')
    const cluster = parsed.data.cluster ?? deriveCluster(parsed.data, slug)
    const nextData = {
      ...parsed.data,
      slug,
      description: parsed.data.description ?? parsed.data.excerpt,
      cluster,
      keywords: parsed.data.keywords ?? deriveKeywords(parsed.data, cluster),
      canonical: parsed.data.canonical ?? `${SITE}/blog/${slug}`,
    }

    const nextRaw = matter.stringify(parsed.content.trimStart(), nextData, {
      lineWidth: 1000,
      quotingType: '"',
      forceQuotes: true,
    })

    if (nextRaw !== raw) {
      changed.push(file)
      if (!dryRun) await fs.writeFile(filePath, nextRaw)
    }
  }

  console.log(`${dryRun ? 'Would update' : 'Updated'} ${changed.length} blog files`)
  for (const file of changed) console.log(`- ${file}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
