import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.PW_BASE_URL || 'http://localhost:3040'
const OUT = '.design-review'

const targets = [
  { path: '/pricing', file: 'pricing-1440.png' },
  { path: '/services', file: 'services-1440.png' },
  { path: '/services/audit', file: 'service-audit-1440.png' },
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })

for (const t of targets) {
  await page.goto(`${BASE}${t.path}`, { waitUntil: 'networkidle' })
  // Settle whileInView reveals — scroll through then back to top.
  await page.evaluate(async () => {
    await new Promise((r) => {
      let y = 0
      const step = () => {
        window.scrollTo(0, y)
        y += window.innerHeight
        if (y < document.body.scrollHeight) setTimeout(step, 60)
        else { window.scrollTo(0, 0); setTimeout(r, 300) }
      }
      step()
    })
  })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${t.file}`, fullPage: true })
  console.log(`shot ${t.path} -> ${OUT}/${t.file}`)
}

await browser.close()
