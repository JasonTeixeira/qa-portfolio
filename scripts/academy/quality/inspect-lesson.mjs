/**
 * Accessibility + consistency + perf-proxy inspection for one academy lesson, in the
 * REAL authenticated player. Companion to capture-lesson.mjs (screenshots). Emits one
 * JSON line the harness ingests for dims 6 (a11y / H4), 9 (consistency), 8 (perf-proxy).
 *
 *   ACADEMY_TEST_EMAIL=.. ACADEMY_TEST_PASSWORD=.. \
 *     node scripts/academy/quality/inspect-lesson.mjs <course> <lesson> [baseUrl]
 *
 * Perf on a dev server is unoptimized, so dim-8 here is an honest PROXY (LCP-ish from
 * navigation timing); the real Lighthouse gate lives in the Phase-6 prod ship gate.
 */
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import { existsSync } from 'node:fs'

const [courseSlug, lessonSlug, baseUrl = 'http://localhost:3040'] = process.argv.slice(2)
const storageState = process.env.ACADEMY_STORAGE_STATE
const email = process.env.ACADEMY_TEST_EMAIL
const password = process.env.ACADEMY_TEST_PASSWORD
const haveState = storageState && existsSync(storageState)
if (!courseSlug || !lessonSlug || (!haveState && (!email || !password))) {
  console.error('usage: inspect-lesson.mjs <course> <lesson> [baseUrl] (+ ACADEMY_STORAGE_STATE or ACADEMY_TEST_EMAIL/PASSWORD)')
  process.exit(2)
}

// The canonical palette (ACADEMY_QUALITY_STANDARD §9 / DESIGN_SYSTEM). Consistency dim
// flags meaningful off-system colors (allowing greys + transparency).
const ALLOWED = new Set(
  [// core palette
   '#0b0b0e', '#111115', '#f2efe9', '#9598a2', '#1e1e24', '#3d5afe', '#18b663', '#e0a93e', '#e5484d',
   '#2a2a33', '#141418', '#b6b6c0', '#8fa0ff',
   // per-topic accent tokens (lib/academy/topics.ts) — deliberate design system
   '#5bc8e8', '#6e8bff', '#34d399', '#e8b75a', '#9db4d0', '#a78bfa',
  ].map((h) => h.toLowerCase()),
)

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 1040 }, deviceScaleFactor: 1,
  ...(haveState ? { storageState } : {}),
})
const page = await ctx.newPage()
try {
  if (!haveState) {
    await page.goto(`${baseUrl}/login?audience=academy&next=/academy/dashboard`, { waitUntil: 'networkidle', timeout: 60000 })
    await (await page.$('#email, input[name=email]')).fill(email)
    const pw = await page.$('#password, input[name=password]')
    await pw.fill(password)
    await pw.press('Enter')
    await page.waitForURL((u) => !String(u).includes('/login'), { timeout: 20000 }).catch(() => {})
  }

  const started = Date.now()
  const res = await page.goto(`${baseUrl}/academy/learn/${courseSlug}/${lessonSlug}`, { waitUntil: 'networkidle', timeout: 60000 })
  if (page.url().includes('/login') || !res || res.status() >= 400) throw new Error(`lesson not reachable (status ${res ? res.status() : 'redirect'})`)
  await page.waitForTimeout(1200)

  // ── a11y (axe) ──────────────────────────────────────────────────────────────
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 }
  for (const v of axe.violations) byImpact[v.impact || 'minor'] = (byImpact[v.impact || 'minor'] || 0) + (v.nodes?.length || 1)
  const a11yHardFail = byImpact.critical > 0 || byImpact.serious > 0
  // score: 100 − weighted violations, floored
  const a11yScore = Math.max(0, 100 - byImpact.critical * 40 - byImpact.serious * 20 - byImpact.moderate * 5 - byImpact.minor * 1)

  // ── consistency (off-palette colors) ─────────────────────────────────────────
  const colors = await page.evaluate(() => {
    const seen = new Map()
    const norm = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null
      const [r, g, b, a] = m[1].split(',').map((x) => parseFloat(x))
      if (a !== undefined && a < 0.15) return null
      const hex = '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
      return hex
    }
    for (const el of Array.from(document.querySelectorAll('body *')).slice(0, 4000)) {
      const s = getComputedStyle(el)
      for (const prop of ['color', 'backgroundColor', 'borderTopColor']) {
        const h = norm(s[prop]); if (h) seen.set(h, (seen.get(h) || 0) + 1)
      }
    }
    return [...seen.entries()]
  })
  const offPalette = colors.filter(([h]) => !ALLOWED.has(h.toLowerCase()) && h !== '#000000' && h !== '#ffffff')
    .sort((a, b) => b[1] - a[1])
  // tolerate greys (r≈g≈b); flag only saturated off-system hues
  const isGrey = (h) => { const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16); return Math.max(r, g, b) - Math.min(r, g, b) < 18 }
  const offHues = offPalette.filter(([h]) => !isGrey(h))
  const consistencyScore = Math.max(0, 100 - offHues.length * 6)

  // ── perf proxy (dev, honest) ─────────────────────────────────────────────────
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0]
    return n ? { domContentLoaded: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) } : null
  })
  const wallMs = Date.now() - started

  console.log(JSON.stringify({
    ok: true,
    a11y: { score: a11yScore, byImpact, hardFail: a11yHardFail, topViolations: axe.violations.slice(0, 5).map((v) => ({ id: v.id, impact: v.impact, n: v.nodes?.length })) },
    consistency: { score: consistencyScore, offHues: offHues.slice(0, 8) },
    perfProxy: { wallMs, nav, note: 'dev-server proxy — real Lighthouse gate at Phase-6 prod' },
  }))
  await browser.close()
  process.exit(0)
} catch (err) {
  console.error(JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }))
  await browser.close()
  process.exit(1)
}
