# Google Analytics + Search Console Setup

This site is ready for Google measurement. Search Console domain verification is handled by DNS and the homepage also emits the meta verification tag.

## Current Verified Pieces

- Domain DNS provider: Vercel DNS.
- Search Console DNS TXT record:
  `google-site-verification=FSkeMXEvQz0bdu-hz9pQVnZ9zN5rsMv7yk2xk9B26TU`
- Homepage meta verification tag:
  `<meta name="google-site-verification" content="FSkeMXEvQz0bdu-hz9pQVnZ9zN5rsMv7yk2xk9B26TU" />`
- Sitemap: `https://www.sageideas.dev/sitemap.xml`
- Robots: `https://www.sageideas.dev/robots.txt`

## GA4 Property

Create one GA4 web stream for:

- Property name: `Sage Ideas`
- Web stream URL: `https://www.sageideas.dev`
- Stream name: `Sage Ideas Website`

Add the Measurement ID to Vercel:

```txt
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-PS7LKSEGVW
```

The site defaults to `G-PS7LKSEGVW` in code, so the env var is optional unless the property changes later.

Optional strict-consent mode:

```txt
NEXT_PUBLIC_GA4_REQUIRE_CONSENT=true
```

Default behavior leaves ads storage denied and allows basic analytics measurement so the premium homepage is measurable even when the cookie banner is not shown.

## GA4 Key Events

After first production traffic, mark these GA4 events as key events:

- `contact_submit`
- `checkout_start`
- `lead_magnet_complete`
- `newsletter_signup`

These are emitted from the typed event layer in `lib/analytics/events.ts`.

## Search Console

Use the domain property:

```txt
sc-domain:sageideas.dev
```

Submit the sitemap:

```txt
https://www.sageideas.dev/sitemap.xml
```

Check these reports weekly:

- Performance > Search results
- Indexing > Pages
- Indexing > Sitemaps
- Experience > Core Web Vitals

## Bing Webmaster Tools

Import from Google Search Console after the domain property verifies. Submit the same sitemap:

```txt
https://www.sageideas.dev/sitemap.xml
```

## Local Verification

After deploy and after setting the GA4 env var:

```bash
SITE_URL=https://www.sageideas.dev \
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX \
npm run verify:google
```

The script checks:

- Search Console meta tag
- Search Console DNS TXT record
- `robots.txt` sitemap pointer
- sitemap key URLs
- GA4 script render

## SEO Operating Cadence

Weekly:

- Export GSC queries/pages from the last 28 days.
- Review pages with high impressions and low CTR.
- Review pages ranking positions 8-20 for refresh opportunities.
- Check GA4 key events by landing page.
- Add internal links from high-traffic pages to money pages.

Monthly:

- Update the keyword map from real GSC data.
- Publish or refresh one pillar/hub and three supporting articles.
- Expand case studies with real screenshots, architecture, and proof.
- Review Lighthouse/CWV for homepage, academy, work, services, and blog templates.

Quarterly:

- Produce a baseline snapshot in `docs/baselines/`.
- Prune or merge thin pages.
- Re-score the content roadmap by revenue intent.
