import type { MetadataRoute } from 'next'
import { CASE_STUDIES } from '@/data/agency/case-studies'
import { POSTS } from '@/data/agency/posts'

/**
 * Agency sitemap — Next nested-sitemap convention, emitted at /agency/sitemap.xml.
 * proxy.ts rewrites agency.sageideas.dev/sitemap.xml onto this route, so every
 * URL here is absolute against the agency subdomain (not sageideas.dev/agency/…).
 */

const SITE_URL = 'https://agency.sageideas.dev'

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

/** Parse the display date format ('01 JUL 2026') into a Date. */
function parsePostDate(display: string): Date | undefined {
  const parts = display.trim().split(/\s+/)
  if (parts.length !== 3) return undefined
  const day = Number(parts[0])
  const month = MONTHS[parts[1].toUpperCase()]
  const year = Number(parts[2])
  if (!Number.isFinite(day) || month === undefined || !Number.isFinite(year)) return undefined
  return new Date(Date.UTC(year, month, day))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const workEntries: MetadataRoute.Sitemap = CASE_STUDIES.map((study) => ({
    url: `${SITE_URL}/work/${study.id}`,
    priority: 0.8,
  }))

  const postEntries: MetadataRoute.Sitemap = POSTS.filter(
    (post) => post.status === 'published',
  ).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: parsePostDate(post.date),
    priority: 0.7,
  }))

  return [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/services`, priority: 0.9 },
    { url: `${SITE_URL}/audit`, priority: 0.8 },
    { url: `${SITE_URL}/blog`, priority: 0.8 },
    { url: `${SITE_URL}/method`, priority: 0.8 },
    { url: `${SITE_URL}/capabilities`, priority: 0.5 },
    ...workEntries,
    ...postEntries,
  ]
}
