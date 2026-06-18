#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { parseFrontmatter } from '../lib/frontmatter.mjs'

const ROOT = process.cwd()
const SOURCE_ROOT = process.env.SAGE_AFTER_DARK_ROOT || '/Users/Sage/code/active/sage-after-dark'
const POSTS_DIR = path.join(SOURCE_ROOT, 'src', 'content', 'posts')
const DRAFTS_DIR = path.join(SOURCE_ROOT, '_drafts')
const OUT_DIR = path.join(ROOT, 'docs', 'content')

function classify(title, slug, tags = []) {
  const text = [title, slug, ...tags].filter(Boolean).join(' ')
  if (/\b(postgres|resend|stripe|vercel|observability|rollback|deploy|stack|saas)\b/i.test(text)) {
    return 'import-outline'
  }
  if (/\b(taste|essay|available|brain|skill|field note)\b/i.test(text)) {
    return 'voice-reference'
  }
  return 'review'
}

async function readMdxPosts() {
  const files = (await fs.readdir(POSTS_DIR)).filter((file) => file.endsWith('.mdx')).sort()
  return Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(POSTS_DIR, file), 'utf8')
      const { data, content } = parseFrontmatter(raw)
      const slug = data.slug ?? file.replace(/\.mdx$/, '')
      return {
        source: `src/content/posts/${file}`,
        slug,
        title: data.title ?? slug,
        published: data.published ?? data.date ?? null,
        status: data.status ?? 'unknown',
        pillar: data.pillar ?? null,
        tags: data.tags ?? [],
        wordCount: content.split(/\s+/).filter(Boolean).length,
        recommendation: classify(data.title, slug, data.tags ?? []),
      }
    }),
  )
}

async function readDrafts() {
  const files = (await fs.readdir(DRAFTS_DIR)).filter((file) => file.endsWith('.md')).sort()
  return Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(DRAFTS_DIR, file), 'utf8')
      return {
        source: `_drafts/${file}`,
        title: raw.match(/^#\s+(.+)$/m)?.[1] ?? file.replace(/\.md$/, ''),
        wordCount: raw.split(/\s+/).filter(Boolean).length,
        recommendation: file.includes('content') ? 'import-backlog' : 'voice-reference',
      }
    }),
  )
}

async function main() {
  const [posts, drafts] = await Promise.all([readMdxPosts(), readDrafts()])
  const inventory = {
    inventoriedAt: new Date().toISOString(),
    sourceRoot: SOURCE_ROOT,
    policy:
      'Use as source material only. Rewrite or canonicalize before publishing on sageideas.dev to avoid duplicate thin content.',
    summary: {
      posts: posts.length,
      drafts: drafts.length,
      importCandidates: [...posts, ...drafts].filter((item) =>
        String(item.recommendation).startsWith('import'),
      ).length,
    },
    posts,
    drafts,
  }

  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify(inventory, null, 2))
    return
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  const outPath = path.join(OUT_DIR, 'sage-after-dark-inventory.json')
  await fs.writeFile(outPath, JSON.stringify(inventory, null, 2) + '\n')
  console.log(`Wrote ${path.relative(ROOT, outPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
