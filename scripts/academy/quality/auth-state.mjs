/**
 * Log the harness academy account in ONCE and persist the browser storage state, so
 * capture-lesson / inspect-lesson can reuse the session instead of logging in per run
 * (which trips the auth rate limit and flakes). Writes the state path to stdout.
 *
 *   ACADEMY_TEST_EMAIL=.. ACADEMY_TEST_PASSWORD=.. \
 *     node scripts/academy/quality/auth-state.mjs [baseUrl] [statePath]
 */
import { chromium } from 'playwright'

const [baseUrl = 'http://localhost:3040', statePath = '/tmp/academy-harness-state.json'] = process.argv.slice(2)
const email = process.env.ACADEMY_TEST_EMAIL
const password = process.env.ACADEMY_TEST_PASSWORD
if (!email || !password) { console.error('need ACADEMY_TEST_EMAIL / ACADEMY_TEST_PASSWORD'); process.exit(2) }

const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()
try {
  await page.goto(`${baseUrl}/login?audience=academy&next=/academy/dashboard`, { waitUntil: 'networkidle', timeout: 60000 })
  await (await page.$('#email, input[name=email]')).fill(email)
  const pw = await page.$('#password, input[name=password]')
  await pw.fill(password)
  await pw.press('Enter')
  await page.waitForURL((u) => !String(u).includes('/login'), { timeout: 20000 })
  if (page.url().includes('/login')) throw new Error('login did not stick (rate limited? bad creds?)')
  await ctx.storageState({ path: statePath })
  console.log(JSON.stringify({ ok: true, statePath, landedOn: page.url() }))
  await browser.close()
  process.exit(0)
} catch (err) {
  console.error(JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }))
  await browser.close()
  process.exit(1)
}
