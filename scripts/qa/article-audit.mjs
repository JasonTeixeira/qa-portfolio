import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { parseFrontmatter } from '../lib/frontmatter.mjs'

const root = process.cwd()
const blogDir = path.join(root, 'content', 'blog')
const outPath = path.join(root, '.design-review', 'article-qa-report.json')
const baseURL = process.env.PW_BASE_URL || 'http://localhost:3040'
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 900 },
]

function readPosts() {
  return fs
    .readdirSync(blogDir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(blogDir, file), 'utf8')
      const parsed = parseFrontmatter(raw)
      const slug = parsed.data.slug || file.replace(/\.mdx$/, '')
      return {
        file,
        slug,
        title: parsed.data.title || '',
        description: parsed.data.description || parsed.data.excerpt || '',
        excerpt: parsed.data.excerpt || '',
        cluster: parsed.data.cluster || '',
        category: parsed.data.category || '',
        date: parsed.data.date || parsed.data.datePublished || '',
        content: parsed.content,
      }
    })
}

function frontmatterIssues(post) {
  const issues = []
  if (post.title.length < 10 || post.title.length > 140) issues.push('weak_title_length')
  if (post.description.length < 40 || post.description.length > 320) issues.push('weak_description_length')
  if (!post.cluster) issues.push('missing_cluster')
  if (!post.category) issues.push('missing_category')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(post.date))) issues.push('bad_date')
  return issues
}

async function auditRoute(browser, post, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
  })
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  const url = `${baseURL}/blog/${post.slug}`
  const response = await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(250)

  const metrics = await page.evaluate(() => {
    const text = document.body.innerText
    return {
      statusReady: Boolean(document.querySelector('h1')),
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      leadMagnets: document.querySelectorAll('[aria-label="Article lead magnet"]').length,
      routeCards: document.querySelectorAll('[aria-label="Article learning path"]').length,
      conversionSystems: document.querySelectorAll('[aria-label="Article next steps"]').length,
      relatedSections: document.querySelectorAll('[aria-label="Related articles"]').length,
      hasBookCta: text.includes('Book a 30-min call') || text.includes('Book the studio'),
      title: document.title,
      metaDescription:
        document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    }
  })

  await page.close()
  return {
    viewport: viewport.name,
    status: response?.status() ?? 0,
    errors,
    metrics,
  }
}

const posts = readPosts()
const report = {
  generatedAt: new Date().toISOString(),
  baseURL,
  totalPosts: posts.length,
  failures: [],
  posts: [],
}

const browser = await chromium.launch({ headless: true })
try {
  for (const post of posts) {
    const frontmatter = frontmatterIssues(post)
    const routeChecks = []

    for (const viewport of viewports) {
      routeChecks.push(await auditRoute(browser, post, viewport))
    }

    const issues = [...frontmatter]
    for (const check of routeChecks) {
      if (check.status >= 400 || check.status === 0) issues.push(`${check.viewport}:bad_status`)
      if (!check.metrics.statusReady) issues.push(`${check.viewport}:missing_h1`)
      if (check.metrics.overflow) issues.push(`${check.viewport}:horizontal_overflow`)
      if (check.errors.length) issues.push(`${check.viewport}:console_errors`)
      if (check.metrics.leadMagnets < 1) issues.push(`${check.viewport}:missing_lead_magnet`)
      if (check.metrics.routeCards < 1) issues.push(`${check.viewport}:missing_route_cards`)
      if (check.metrics.conversionSystems < 1) issues.push(`${check.viewport}:missing_conversion_system`)
      if (check.metrics.metaDescription.length < 40) issues.push(`${check.viewport}:weak_meta_description`)
    }

    const entry = {
      slug: post.slug,
      file: post.file,
      issues: Array.from(new Set(issues)),
      routeChecks,
    }
    report.posts.push(entry)
    if (entry.issues.length) report.failures.push(entry)
    console.log(`${entry.issues.length ? 'FAIL' : 'PASS'} /blog/${post.slug}${entry.issues.length ? ` ${entry.issues.join(',')}` : ''}`)
  }
} finally {
  await browser.close()
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(report, null, 2))

console.log(`\nArticle QA: ${report.totalPosts - report.failures.length}/${report.totalPosts} passed`)
console.log(`Report: ${path.relative(root, outPath)}`)

if (report.failures.length) {
  process.exitCode = 1
}
