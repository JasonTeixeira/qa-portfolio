#!/usr/bin/env node

import { Resolver } from 'node:dns/promises'

const FETCH_SITE = process.env.SITE_URL || 'https://www.sageideas.dev'
const PUBLIC_SITE = process.env.PUBLIC_SITE_URL || 'https://www.sageideas.dev'
const DOMAIN = process.env.GSC_DOMAIN || new URL(PUBLIC_SITE).hostname.replace(/^www\./, '')
const GSC_TOKEN = process.env.GSC_VERIFICATION_TOKEN || 'FSkeMXEvQz0bdu-hz9pQVnZ9zN5rsMv7yk2xk9B26TU'
const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-PS7LKSEGVW'
const resolver = new Resolver()
resolver.setServers((process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(','))

async function fetchText(path) {
  const url = new URL(path, FETCH_SITE)
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`${url} returned ${res.status}`)
  return res.text()
}

function pass(label, detail = '') {
  console.log(`PASS ${label}${detail ? ` - ${detail}` : ''}`)
}

function fail(label, detail = '') {
  console.error(`FAIL ${label}${detail ? ` - ${detail}` : ''}`)
  process.exitCode = 1
}

const homepage = await fetchText('/')
if (homepage.includes(`content="${GSC_TOKEN}"`)) {
  pass('GSC meta verification tag', FETCH_SITE)
} else {
  fail('GSC meta verification tag', `missing token ${GSC_TOKEN}`)
}

try {
  const txt = (await resolver.resolveTxt(DOMAIN)).flat()
  const expected = `google-site-verification=${GSC_TOKEN}`
  if (txt.includes(expected)) pass('GSC DNS TXT verification record', DOMAIN)
  else fail('GSC DNS TXT verification record', `missing ${expected}`)
} catch (error) {
  fail('GSC DNS TXT verification record', error instanceof Error ? error.message : String(error))
}

const robots = await fetchText('/robots.txt')
if (robots.includes(`${PUBLIC_SITE}/sitemap.xml`)) pass('robots.txt sitemap pointer')
else fail('robots.txt sitemap pointer')

const sitemap = await fetchText('/sitemap.xml')
if (sitemap.includes(`<loc>${PUBLIC_SITE}/</loc>`) && sitemap.includes(`<loc>${PUBLIC_SITE}/academy</loc>`)) {
  pass('sitemap.xml key URLs')
} else {
  fail('sitemap.xml key URLs', 'missing homepage or academy')
}

if (!GA4_ID) {
  fail('GA4 Measurement ID env', 'set NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX')
} else if (!/^G-[A-Z0-9]+$/.test(GA4_ID)) {
  fail('GA4 Measurement ID env', `${GA4_ID} does not look like G-XXXXXXXXXX`)
} else if (homepage.includes(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`)) {
  pass('GA4 script rendered', GA4_ID)
} else {
  fail('GA4 script rendered', `missing ${GA4_ID} on ${FETCH_SITE}`)
}

if (process.exitCode) {
  console.error('\nGoogle verification is not complete.')
  process.exit(process.exitCode)
}

console.log('\nGoogle verification checks passed.')
