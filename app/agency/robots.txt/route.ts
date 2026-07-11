/**
 * Agency robots.txt — served at /agency/robots.txt; proxy.ts rewrites
 * agency.sageideas.dev/robots.txt onto this route. A route handler (not the
 * app/robots.ts convention) because the metadata convention only applies at
 * the app root, and this file must coexist with the main site's robots.
 */

const BODY = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://agency.sageideas.dev/sitemap.xml
`

export function GET(): Response {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
