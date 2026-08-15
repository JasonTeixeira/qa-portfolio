// Visual-first lesson SWEEP harness — renders MANY lessons of one course in a
// SINGLE authenticated browser context (one login), so a multi-lesson render
// sweep doesn't trip the login throttle. Companion to capture-lesson.mjs (which
// is the single-lesson variant). Writes readable top->bottom segments per lesson.
//
// Usage:
//   ACADEMY_TEST_EMAIL=... ACADEMY_TEST_PASSWORD=... \
//     node scripts/academy/visual-first/sweep-lessons.mjs <courseSlug> <slug1,slug2,...> [baseUrl] [outDir]
//
// Prints one JSON line per lesson + a final summary line. Exit non-zero if any
// lesson failed to render (login redirect / overflow / error).

import { chromium } from 'playwright'

const [courseSlug, lessonsCsv, baseUrl = 'http://localhost:3087', outDir = '/tmp/academy-shots'] =
  process.argv.slice(2)

if (!courseSlug || !lessonsCsv) {
  console.error('usage: sweep-lessons.mjs <courseSlug> <slug1,slug2,...> [baseUrl] [outDir]')
  process.exit(2)
}
const lessons = lessonsCsv.split(',').map((s) => s.trim()).filter(Boolean)
const email = process.env.ACADEMY_TEST_EMAIL
const password = process.env.ACADEMY_TEST_PASSWORD
if (!email || !password) {
  console.error('Missing ACADEMY_TEST_EMAIL / ACADEMY_TEST_PASSWORD env.')
  process.exit(2)
}

const VH = 1040
const MAX_SEGMENTS = 8

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: VH }, deviceScaleFactor: 2 })
const page = await ctx.newPage()

async function submitLogin() {
  const btn = await page.$('button[type=submit], button:has-text("Sign in"), button:has-text("Log in")')
  if (!btn) throw new Error('login submit button not found')
  await btn.click()
  try {
    await page.waitForURL((u) => !String(u).includes('/login'), { timeout: 15000 })
  } catch {
    /* still on /login */
  }
}

const results = []
try {
  // login ONCE for the whole sweep
  await page.goto(`${baseUrl}/login?audience=academy`, { waitUntil: 'networkidle', timeout: 60000 })
  await (await page.$('input[type=email], input[name=email]')).fill(email)
  await (await page.$('input[type=password], input[name=password]')).fill(password)
  await submitLogin()
  if (page.url().includes('/login')) {
    await page.waitForTimeout(2000)
    await submitLogin()
  }
  if (page.url().includes('/login')) throw new Error('login did not stick')

  for (const slug of lessons) {
    const url = `${baseUrl}/academy/learn/${courseSlug}/${slug}`
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      if (page.url().includes('/login')) throw new Error('redirected to login')
      if (!res || res.status() >= 400) throw new Error(`status ${res ? res.status() : 'none'}`)
      await page.waitForTimeout(1200)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      const total = await page.evaluate(() => document.body.scrollHeight)
      const segments = Math.min(MAX_SEGMENTS, Math.ceil(total / VH))
      for (let i = 0; i < segments; i++) {
        await page.evaluate((y) => window.scrollTo(0, y), i * VH)
        await page.waitForTimeout(500)
        await page.screenshot({ path: `${outDir}/lesson-${courseSlug}-${slug}-seg-${i}.png` })
      }
      const row = { slug, ok: true, overflow, segments }
      results.push(row)
      console.log(JSON.stringify(row))
    } catch (err) {
      const row = { slug, ok: false, error: String(err && err.message ? err.message : err) }
      results.push(row)
      console.log(JSON.stringify(row))
    }
  }
} catch (err) {
  console.error(JSON.stringify({ fatal: String(err && err.message ? err.message : err) }))
}
await browser.close()

const failed = results.filter((r) => !r.ok)
const overflows = results.filter((r) => r.ok && r.overflow !== 0)
console.log(JSON.stringify({ summary: true, rendered: results.length, failed: failed.length, overflows: overflows.length }))
process.exit(failed.length === 0 && overflows.length === 0 ? 0 : 1)
