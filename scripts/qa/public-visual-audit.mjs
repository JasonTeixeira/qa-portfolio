import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3040'
const outDir = path.join(root, '.design-review', 'program8-final-qa')

const routes = [
  { name: 'home', path: '/' },
  { name: 'services', path: '/services' },
  { name: 'service-app-development', path: '/services/app-development' },
  { name: 'service-studio-package', path: '/services/studio-package' },
  { name: 'service-rag-engineering', path: '/services/rag-engineering' },
  { name: 'service-internal-ai-copilot', path: '/services/internal-ai-copilot' },
  { name: 'pricing', path: '/pricing' },
  { name: 'work', path: '/work' },
  { name: 'work-nexural', path: '/work/nexural' },
  { name: 'academy', path: '/academy' },
  { name: 'academy-track', path: '/academy/ai-native-product-building' },
  { name: 'academy-enroll', path: '/academy/ai-native-product-building/enroll' },
  { name: 'blog', path: '/blog' },
  { name: 'topics', path: '/topics' },
  { name: 'topic-ai-engineering', path: '/topics/ai-engineering' },
  { name: 'compare', path: '/compare' },
  { name: 'compare-in-house', path: '/compare/sage-vs-in-house-hire' },
  { name: 'industries', path: '/industries' },
  { name: 'industry-fintech', path: '/industries/fintech' },
  { name: 'lab', path: '/lab' },
  { name: 'lab-nexural', path: '/lab/nexural' },
  { name: 'contact', path: '/contact' },
  { name: 'founder', path: '/founder' },
  { name: 'legal', path: '/legal' },
  { name: 'route-finder', path: '/tools/route-finder' },
  { name: 'seo-audit', path: '/tools/seo-audit' },
]

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

function isConsoleFailure(message) {
  const text = message.text()
  if (message.type() !== 'error') return false
  return ![
    'Failed to load resource: the server responded with a status of 404',
    'favicon',
    'ERR_BLOCKED_BY_CLIENT',
    '/_next/webpack-hmr',
    'WebSocket connection',
  ].some((allowed) => text.includes(allowed))
}

async function scrollPage(page) {
  await page.evaluate(async () => {
    const max = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      window.innerHeight,
    )
    const steps = Math.max(4, Math.ceil(max / window.innerHeight))
    for (let index = 0; index <= steps; index += 1) {
      window.scrollTo({ top: Math.round((max / steps) * index), behavior: 'instant' })
      await new Promise((resolve) => window.setTimeout(resolve, 90))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
}

async function collectMetrics(page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    const overflow = doc.scrollWidth - doc.clientWidth
    const hiddenContent = [...document.querySelectorAll('main *')]
      .filter((element) => {
        if (!(element instanceof HTMLElement)) return false
        if (element.closest('[hidden], [aria-hidden="true"], dialog, nav')) return false
        const text = element.innerText?.trim()
        if (!text || text.length < 12) return false
        const rect = element.getBoundingClientRect()
        if (rect.width < 24 || rect.height < 12) return false
        const style = window.getComputedStyle(element)
        return Number(style.opacity) === 0 && style.visibility !== 'hidden'
      })
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: element.innerText.trim().replace(/\s+/g, ' ').slice(0, 80),
      }))

    return {
      title: document.title,
      height: Math.max(document.body.scrollHeight, doc.scrollHeight),
      overflow,
      hiddenContent,
      h1: document.querySelector('h1')?.textContent?.trim() ?? null,
      mainTextLength: document.querySelector('main')?.textContent?.trim().length ?? 0,
    }
  })
}

async function auditRoute(browser, route, viewport) {
  const page = await browser.newPage({ viewport })
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => {
    if (isConsoleFailure(message)) consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  const url = `${baseUrl}${route.path}`
  let status = 0
  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    })
    status = response?.status() ?? 0
    await page.waitForTimeout(900)
    await scrollPage(page)
    await page.waitForTimeout(300)
    const metrics = await collectMetrics(page)
    const screenshot = path.join(outDir, `${route.name}-${viewport.name}.png`)
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
    await page.close()

    const issues = []
    if (status >= 400 || status === 0) issues.push(`status:${status}`)
    if (consoleErrors.length > 0) issues.push('console_errors')
    if (pageErrors.length > 0) issues.push('page_errors')
    if (metrics.overflow > 1) issues.push(`horizontal_overflow:${metrics.overflow}`)
    if (!metrics.h1) issues.push('missing_h1')
    if (metrics.mainTextLength < 250) issues.push('thin_main')
    const warnings = []
    if (metrics.hiddenContent.length > 0) warnings.push('hidden_content_signal')

    return {
      route: route.path,
      viewport: viewport.name,
      status,
      issues,
      warnings,
      consoleErrors,
      pageErrors,
      metrics,
      screenshot: path.relative(root, screenshot),
    }
  } catch (error) {
    await page.close()
    return {
      route: route.path,
      viewport: viewport.name,
      status,
      issues: ['audit_exception'],
      warnings: [],
      consoleErrors,
      pageErrors,
      error: error.message,
    }
  }
}

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
const checks = []

for (const viewport of viewports) {
  for (const route of routes) {
    const result = await auditRoute(browser, route, viewport)
    checks.push(result)
    console.log(
      `${result.issues.length ? 'FAIL' : 'PASS'} ${viewport.name} ${route.path}${result.issues.length ? ` ${result.issues.join(',')}` : ''}`,
    )
  }
}

await browser.close()

const failures = checks.filter((check) => check.issues.length > 0)
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  routes: routes.length,
  totalChecks: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  failures,
  checks,
}

const reportPath = path.join(outDir, 'report.json')
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`\nPublic visual QA: ${report.passed}/${report.totalChecks} checks passed`)
console.log(`Report: ${path.relative(root, reportPath)}`)

if (failures.length > 0) process.exitCode = 1
