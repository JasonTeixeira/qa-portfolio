// Visual-first lesson capture harness.
//
// Renders ANY academy lesson in the REAL authenticated player and writes readable
// top->bottom segment screenshots, so the visual-design panel can score the whole
// lesson (not isolated components). This is the "render" step of the Phase-B
// pipeline (docs/academy/PHASE_B_PIPELINE.md).
//
// Usage:
//   ACADEMY_TEST_EMAIL=... ACADEMY_TEST_PASSWORD=... \
//     node scripts/academy/visual-first/capture-lesson.mjs <courseSlug> <lessonSlug> [baseUrl] [outDir]
//
// Defaults: baseUrl=http://localhost:3087  outDir=/tmp/academy-shots
// Creds come ONLY from env (never hardcode). Exits non-zero on login/render failure
// so a pipeline runner can detect it. Prints a JSON line with the written paths +
// horizontal-overflow px (must be 0) for the runner to parse.

import { chromium } from 'playwright'

const [courseSlug, lessonSlug, baseUrl = 'http://localhost:3087', outDir = '/tmp/academy-shots'] =
  process.argv.slice(2)

if (!courseSlug || !lessonSlug) {
  console.error('usage: capture-lesson.mjs <courseSlug> <lessonSlug> [baseUrl] [outDir]')
  process.exit(2)
}
const email = process.env.ACADEMY_TEST_EMAIL
const password = process.env.ACADEMY_TEST_PASSWORD
if (!email || !password) {
  console.error('Missing ACADEMY_TEST_EMAIL / ACADEMY_TEST_PASSWORD env (login creds).')
  process.exit(2)
}

const LESSON = `${baseUrl}/academy/learn/${courseSlug}/${lessonSlug}`
const VH = 1040
const MAX_SEGMENTS = 8

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: VH }, deviceScaleFactor: 2 })
const page = await ctx.newPage()

try {
  // 1) authenticate (academy audience)
  await page.goto(`${baseUrl}/login?audience=academy`, { waitUntil: 'networkidle', timeout: 60000 })
  const emailEl = await page.$('input[type=email], input[name=email]')
  const passEl = await page.$('input[type=password], input[name=password]')
  if (!emailEl || !passEl) throw new Error('login form not found (email/password inputs)')
  await emailEl.fill(email)
  await passEl.fill(password)
  // Submit, then wait for the auth redirect to actually LAND (not a fixed sleep —
  // the redirect can lag past a fixed wait, leaving the session unset). Retry the
  // submit once if we're still on /login.
  async function submitLogin() {
    // Submit the PASSWORD form specifically. The login page also has a GitHub OAuth
    // button (also type=submit), so a generic button click hijacks to OAuth — press
    // Enter inside the password field to post the right form.
    const pw = await page.$('#password, input[type=password], input[name=password]')
    if (!pw) throw new Error('password field not found')
    await pw.press('Enter')
    try {
      await page.waitForURL((u) => !String(u).includes('/login'), { timeout: 15000 })
    } catch {
      /* still on /login — caller retries or fails at the lesson check */
    }
  }
  await submitLogin()
  if (page.url().includes('/login')) {
    await page.waitForTimeout(2000)
    await submitLogin()
  }

  // 2) navigate to the lesson; fail loudly if redirected to /login (gated/unentitled)
  const res = await page.goto(LESSON, { waitUntil: 'networkidle', timeout: 60000 })
  if (page.url().includes('/login')) throw new Error(`redirected to login — login did not stick or user not entitled to ${courseSlug}`)
  if (!res || res.status() >= 400) throw new Error(`lesson returned status ${res ? res.status() : 'none'}`)
  await page.waitForTimeout(1500)

  // 3) guard: no horizontal overflow (the visual-bleed must never exceed viewport)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )

  // 4) segment the full scroll into readable shots
  const total = await page.evaluate(() => document.body.scrollHeight)
  const segments = Math.min(MAX_SEGMENTS, Math.ceil(total / VH))
  const paths = []
  for (let i = 0; i < segments; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * VH)
    await page.waitForTimeout(700)
    const out = `${outDir}/lesson-${courseSlug}-${lessonSlug}-seg-${i}.png`
    await page.screenshot({ path: out })
    paths.push(out)
  }

  console.log(JSON.stringify({ ok: true, status: res.status(), overflow, height: total, segments, paths }))
  await browser.close()
  process.exit(overflow === 0 ? 0 : 1)
} catch (err) {
  console.error(JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }))
  await browser.close()
  process.exit(1)
}
