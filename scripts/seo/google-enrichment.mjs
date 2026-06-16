import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://www.sageideas.dev'
const OUT_DIR = path.join(process.cwd(), 'docs', 'seo')

function isoDateDaysAgo(days) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function getDateStamp() {
  return new Date().toISOString().slice(0, 10)
}

async function postJson(url, token, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = payload?.error?.message ?? `${res.status} ${res.statusText}`
    throw new Error(message)
  }
  return payload
}

async function fetchGscRows() {
  const token = process.env.GSC_ACCESS_TOKEN || process.env.GOOGLE_ACCESS_TOKEN
  const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:sageideas.dev'
  if (!token) {
    return {
      status: 'skipped',
      reason: 'Set GSC_ACCESS_TOKEN or GOOGLE_ACCESS_TOKEN to pull Search Console query data.',
      siteUrl,
      rows: [],
    }
  }

  const startDate = process.env.GSC_START_DATE || isoDateDaysAgo(93)
  const endDate = process.env.GSC_END_DATE || isoDateDaysAgo(3)
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    siteUrl,
  )}/searchAnalytics/query`
  const data = await postJson(endpoint, token, {
    startDate,
    endDate,
    dimensions: ['page', 'query'],
    rowLimit: Number(process.env.GSC_ROW_LIMIT || 25000),
    startRow: 0,
  })

  return {
    status: 'ok',
    siteUrl,
    startDate,
    endDate,
    rows: (data.rows ?? []).map((row) => ({
      page: row.keys?.[0] ?? '',
      query: row.keys?.[1] ?? '',
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    })),
  }
}

async function fetchGa4Rows() {
  const token = process.env.GA4_ACCESS_TOKEN || process.env.GOOGLE_ACCESS_TOKEN
  const propertyId = process.env.GA4_PROPERTY_ID
  if (!token || !propertyId) {
    return {
      status: 'skipped',
      reason:
        'Set GA4_PROPERTY_ID and GA4_ACCESS_TOKEN, or GOOGLE_ACCESS_TOKEN, to pull GA4 landing-page data.',
      propertyId: propertyId ?? null,
      rows: [],
    }
  }

  const startDate = process.env.GA4_START_DATE || '90daysAgo'
  const endDate = process.env.GA4_END_DATE || 'yesterday'
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`
  const data = await postJson(endpoint, token, {
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'landingPagePlusQueryString' }, { name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'eventCount' }],
    limit: String(process.env.GA4_ROW_LIMIT || 10000),
  })

  return {
    status: 'ok',
    propertyId,
    startDate,
    endDate,
    rows: (data.rows ?? []).map((row) => ({
      landingPage: row.dimensionValues?.[0]?.value ?? '',
      channel: row.dimensionValues?.[1]?.value ?? '',
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
      eventCount: Number(row.metricValues?.[2]?.value ?? 0),
    })),
  }
}

function summarize(gsc, ga4) {
  const queryByPage = new Map()
  for (const row of gsc.rows ?? []) {
    if (!row.page.includes(SITE)) continue
    const current = queryByPage.get(row.page) ?? {
      page: row.page,
      clicks: 0,
      impressions: 0,
      queries: [],
    }
    current.clicks += row.clicks
    current.impressions += row.impressions
    current.queries.push({
      query: row.query,
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position,
    })
    queryByPage.set(row.page, current)
  }

  const ga4ByPath = new Map()
  for (const row of ga4.rows ?? []) {
    const pathOnly = row.landingPage.split('?')[0]
    const current = ga4ByPath.get(pathOnly) ?? {
      path: pathOnly,
      sessions: 0,
      activeUsers: 0,
      eventCount: 0,
    }
    current.sessions += row.sessions
    current.activeUsers += row.activeUsers
    current.eventCount += row.eventCount
    ga4ByPath.set(pathOnly, current)
  }

  return {
    organicPages: Array.from(queryByPage.values())
      .map((page) => ({
        ...page,
        queries: page.queries
          .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks)
          .slice(0, 12),
      }))
      .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks),
    landingPages: Array.from(ga4ByPath.values()).sort((a, b) => b.sessions - a.sessions),
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const [gsc, ga4] = await Promise.all([fetchGscRows(), fetchGa4Rows()])
  const report = {
    generatedAt: new Date().toISOString(),
    sources: {
      searchConsole:
        'https://developers.google.com/webmaster-tools/v1/searchanalytics/query',
      ga4DataApi:
        'https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport',
    },
    gsc,
    ga4,
    summary: summarize(gsc, ga4),
    nextActions:
      gsc.status === 'ok' || ga4.status === 'ok'
        ? [
            'Map high-impression queries to existing pages before writing new content.',
            'Prioritize pages with impressions but weak CTR for title/meta rewrites.',
            'Prioritize pages with sessions but weak conversion for CTA and proof upgrades.',
          ]
        : [
            'Create OAuth access with Search Console and GA4 Data API scopes.',
            'Add the authenticated user or service account to Search Console and GA4.',
            'Rerun npm run seo:google-enrichment with the required environment variables.',
          ],
  }

  const outPath = path.join(OUT_DIR, `google-enrichment.${getDateStamp()}.json`)
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Wrote ${path.relative(process.cwd(), outPath)}`)
  console.log(`GSC: ${gsc.status}${gsc.reason ? ` - ${gsc.reason}` : ''}`)
  console.log(`GA4: ${ga4.status}${ga4.reason ? ` - ${ga4.reason}` : ''}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
