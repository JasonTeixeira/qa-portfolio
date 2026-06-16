#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const SITE = process.env.PUBLIC_SITE_URL || 'https://www.sageideas.dev'
const OUT_DIR = path.join(ROOT, 'docs', 'baselines')

async function fetchText(pathname) {
  const res = await fetch(new URL(pathname, SITE), { redirect: 'follow' })
  if (!res.ok) throw new Error(`${pathname} returned ${res.status}`)
  return res.text()
}

async function main() {
  const capturedAt = new Date().toISOString()
  const sitemap = await fetchText('/sitemap.xml')
  const indexedPagesApprox = (sitemap.match(/<loc>/g) ?? []).length

  const snapshot = {
    capturedAt,
    capturedBy: 'scripts/seo/baseline.mjs v1',
    notes:
      'API credentials are not connected yet. This is a technical baseline scaffold using live sitemap/crawl data; fill GSC, GA4, CWV, and referring-domain sections after service-account access is added.',
    gsc: {
      property: 'sc-domain:sageideas.dev',
      periodDays: 28,
      impressions: 0,
      clicks: 0,
      avgPosition: 0,
      indexedPagesApprox,
      topPages: [],
      topQueries: [],
    },
    ga4: {
      propertyId: process.env.GA4_PROPERTY_ID || '',
      periodDays: 28,
      organicSessions: 0,
      totalSessions: 0,
      topOrganicPages: [],
      conversionEvents: {},
    },
    cwv: {
      measuredAt: capturedAt,
      source: 'manual',
      pages: [],
    },
    referringDomains: {
      count: 0,
      source: 'manual',
      capturedAt,
      notes: 'Pending Ahrefs/Majestic/GSC link export.',
    },
    brandedSearch: {
      impressions28d: 0,
      clicks28d: 0,
      avgPosition: 0,
    },
  }

  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify(snapshot, null, 2))
    return
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  const outPath = path.join(OUT_DIR, `${capturedAt.slice(0, 10)}.json`)
  await fs.writeFile(outPath, JSON.stringify(snapshot, null, 2) + '\n')
  console.log(`Wrote ${path.relative(ROOT, outPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
