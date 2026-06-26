import AxeBuilder from '@axe-core/playwright'
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const date = process.env.AUDIT_DATE ?? new Date().toISOString().slice(0, 10)
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3041'
const root = process.cwd()
const auditDir = join(root, 'docs/evidence/marketing/audits', date)
const screenshotDir = join(root, 'docs/evidence/marketing/screenshots', date)

const routes = [
  { name: 'home', path: '/' },
  { name: 'services', path: '/services' },
  { name: 'pricing', path: '/pricing' },
  { name: 'book', path: '/book?source=marketing_audit' },
  { name: 'contact', path: '/contact' },
  { name: 'trust', path: '/trust' },
  { name: 'work', path: '/work' },
  { name: 'founder', path: '/founder' },
  { name: 'industries', path: '/industries' },
  { name: 'process', path: '/process' },
  { name: 'how-it-works', path: '/how-it-works' },
  { name: 'showcase', path: '/showcase' },
  { name: 'showcase-proof', path: '/showcase/proof' },
  { name: 'showcase-compare', path: '/showcase/compare' },
  { name: 'showcase-revenue-os', path: '/showcase/revenue-os' },
  { name: 'showcase-contractor-quote-engine', path: '/showcase/contractor-quote-engine' },
  { name: 'showcase-med-spa-consultation-funnel', path: '/showcase/med-spa-consultation-funnel' },
  { name: 'showcase-law-firm-intake-system', path: '/showcase/law-firm-intake-system' },
  { name: 'showcase-ai-support-agent-dashboard', path: '/showcase/ai-support-agent-dashboard' },
  { name: 'legal', path: '/legal' },
  { name: 'legal-privacy', path: '/legal/privacy' },
  { name: 'legal-terms', path: '/legal/terms' },
  { name: 'legal-cookies', path: '/legal/cookies' },
  { name: 'legal-msa', path: '/legal/msa' },
  { name: 'legal-nda', path: '/legal/nda' },
  { name: 'legal-sow-template', path: '/legal/sow-template' },
  { name: 'blog', path: '/blog' },
  { name: 'topics', path: '/topics' },
  { name: 'lab', path: '/lab' },
]

const viewports = [
  { name: 'desktop', width: 1440, height: 1100 },
  { name: 'mobile', width: 390, height: 844 },
]

function abs(path) {
  return new URL(path, baseUrl).toString()
}

function normalizeHref(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null
  const url = new URL(href, baseUrl)
  if (url.origin !== new URL(baseUrl).origin) return null
  url.hash = ''
  return url.toString()
}

function routeName(path) {
  return path.replace(/^\//, '').replace(/[/?=&]+/g, '-').replace(/-$/, '') || 'home'
}

mkdirSync(auditDir, { recursive: true })
mkdirSync(screenshotDir, { recursive: true })

const browser = await chromium.launch()
const routeResults = []
const linkTargets = new Map()

async function primeBusinessIntent(context) {
  await context.addInitScript(() => {
    window.sessionStorage.setItem('sage_living_os_boot_seen', 'true')
    window.localStorage.setItem('sage-intent', 'hire')
    window.localStorage.setItem('sage-audit-mode', 'true')
  })
}

try {
  for (const route of routes) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      deviceScaleFactor: 1,
    })
    await primeBusinessIntent(context)
    const page = await context.newPage()
    const response = await page.goto(abs(route.path), { waitUntil: 'networkidle' })
    const status = response?.status() ?? 0

    const metadata = await page.evaluate(() => {
      const meta = (name) =>
        document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ??
        document.querySelector(`meta[property="${name}"]`)?.getAttribute('content') ??
        ''
      const links = [...document.querySelectorAll('a[href]')].map((a) => ({
        text: a.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        href: a.getAttribute('href') ?? '',
      }))
      return {
        title: document.title,
        description: meta('description'),
        ogTitle: meta('og:title'),
        ogDescription: meta('og:description'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
        h1: [...document.querySelectorAll('h1')].map((h) => h.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
        jsonLdCount: document.querySelectorAll('script[type="application/ld+json"]').length,
        links,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }
    })

    for (const link of metadata.links) {
      const target = normalizeHref(link.href)
      if (target) linkTargets.set(target, { href: target, source: route.path, text: link.text })
    }

    const axe = await new AxeBuilder({ page }).analyze()
    const axeViolations = axe.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.length,
    }))

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(abs(route.path), { waitUntil: 'networkidle' })
      await page.screenshot({
        path: join(screenshotDir, `${routeName(route.name)}-${viewport.name}.png`),
        fullPage: true,
      })
    }

    routeResults.push({
      route: route.path,
      status,
      metadata,
      axeViolations,
      overflow: metadata.scrollWidth > metadata.innerWidth + 1,
    })
    await context.close()
  }

  const linkResults = []
  const context = await browser.newContext()
  const request = context.request
  for (const target of linkTargets.values()) {
    const res = await request.get(target.href, { failOnStatusCode: false })
    linkResults.push({
      href: target.href,
      source: target.source,
      text: target.text,
      status: res.status(),
      ok: res.status() >= 200 && res.status() < 400,
    })
  }
  await context.close()

  const metadataResults = routeResults.map((route) => ({
    route: route.route,
    status: route.status,
    title: route.metadata.title,
    description: route.metadata.description,
    canonical: route.metadata.canonical,
    h1: route.metadata.h1,
    jsonLdCount: route.metadata.jsonLdCount,
    missing: [
      route.metadata.title ? null : 'title',
      route.metadata.description ? null : 'description',
      route.metadata.h1.length > 0 ? null : 'h1',
    ].filter(Boolean),
  }))

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    routes: routeResults.length,
    linkTargets: linkResults.length,
    failedLinks: linkResults.filter((link) => !link.ok).length,
    routesWithAxeViolations: routeResults.filter((route) => route.axeViolations.length > 0).length,
    seriousAxeViolations: routeResults.flatMap((route) =>
      route.axeViolations
        .filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
        .map((violation) => ({ route: route.route, ...violation })),
    ),
    routesWithOverflow: routeResults.filter((route) => route.overflow).map((route) => route.route),
  }

  writeFileSync(join(auditDir, 'business-site-audit.json'), `${JSON.stringify({ summary, routes: routeResults }, null, 2)}\n`)
  writeFileSync(join(auditDir, 'metadata-check.json'), `${JSON.stringify(metadataResults, null, 2)}\n`)
  writeFileSync(join(auditDir, 'link-check.json'), `${JSON.stringify(linkResults, null, 2)}\n`)
  writeFileSync(
    join(auditDir, 'link-check.txt'),
    linkResults.map((link) => `${link.ok ? 'OK' : 'FAIL'} ${link.status} ${link.href} <- ${link.source}`).join('\n') + '\n',
  )
  writeFileSync(
    join(auditDir, 'axe-results.json'),
    `${JSON.stringify(routeResults.map((route) => ({ route: route.route, violations: route.axeViolations })), null, 2)}\n`,
  )
  writeFileSync(
    join(auditDir, 'route-inventory.txt'),
    routes.map((route) => `${route.name}\t${route.path}`).join('\n') + '\n',
  )

  const failures = [
    ...linkResults.filter((link) => !link.ok).map((link) => `link ${link.status} ${link.href}`),
    ...metadataResults.flatMap((route) => route.missing.map((item) => `${route.route} missing ${item}`)),
    ...summary.routesWithOverflow.map((route) => `${route} horizontal overflow`),
  ]

  console.log(JSON.stringify(summary, null, 2))
  if (failures.length > 0) {
    console.error(failures.join('\n'))
    process.exit(1)
  }
} finally {
  await browser.close()
}
