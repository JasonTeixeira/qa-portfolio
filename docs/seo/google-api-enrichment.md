# Google SEO Enrichment

This repo is ready to enrich the keyword map with first-party Google data.

## What the script pulls

- Search Console Search Analytics: page/query impressions, clicks, CTR, and average position.
- GA4 Data API: landing page sessions, active users, event count, and channel grouping.

## Run

```bash
GSC_SITE_URL="sc-domain:sageideas.dev" \
GSC_ACCESS_TOKEN="ya29..." \
GA4_PROPERTY_ID="123456789" \
GA4_ACCESS_TOKEN="ya29..." \
npm run seo:google-enrichment
```

If one token has both scopes, set `GOOGLE_ACCESS_TOKEN` instead of separate
`GSC_ACCESS_TOKEN` and `GA4_ACCESS_TOKEN`.

## Output

The script writes:

```text
docs/seo/google-enrichment.YYYY-MM-DD.json
```

Use the report to update `data/seo/keyword-map.ts` only after the query has
real impressions or a clear fit with a money page. Do not create pages from
zero-impression guesses when first-party data exists.
