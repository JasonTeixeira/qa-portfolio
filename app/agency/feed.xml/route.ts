import { PUBLISHED_POSTS } from '@/data/agency/posts'

/**
 * The Proof Log — RSS 2.0 feed, emitted at /agency/feed.xml.
 * proxy.ts rewrites agency.sageideas.dev/feed.xml onto this route (same
 * host-mapping pattern as sitemap.xml/robots.txt).
 */

const SITE_URL = 'https://agency.sageideas.dev'
const FEED_URL = `${SITE_URL}/feed.xml`

const MONTHS: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
}

/** Parse the display date format ('01 JUL 2026') into a UTC Date. */
function parsePostDate(display: string): Date | undefined {
  const parts = display.trim().split(/\s+/)
  if (parts.length !== 3) return undefined
  const day = Number(parts[0])
  const month = MONTHS[parts[1].toUpperCase()]
  const year = Number(parts[2])
  if (!Number.isFinite(day) || month === undefined || !Number.isFinite(year)) return undefined
  return new Date(Date.UTC(year, month, day))
}

/** Escape the five XML-special characters for element text content. */
function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function GET(): Response {
  const items = PUBLISHED_POSTS.map((post) => {
    const link = `${SITE_URL}/blog/${post.slug}`
    const pubDate = parsePostDate(post.date)
    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <description>${escapeXml(post.dek)}</description>`,
      ...(pubDate ? [`      <pubDate>${pubDate.toUTCString()}</pubDate>`] : []),
      '    </item>',
    ].join('\n')
  }).join('\n')

  const latest = PUBLISHED_POSTS.map((post) => parsePostDate(post.date))
    .filter((date): date is Date => date !== undefined)
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>The Proof Log — Jason Teixeira</title>',
    `    <link>${SITE_URL}/blog</link>`,
    '    <description>Field notes from systems that prove they work — eval harnesses, browser QA, release gates, and operational AI workflows.</description>',
    '    <language>en</language>',
    ...(latest ? [`    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>`] : []),
    `    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
