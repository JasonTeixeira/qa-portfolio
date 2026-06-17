# Search Console + Bing Submission Checklist — Program D/A

Last updated: 2026-06-17

## Google Search Console

Status: Google site verification token is installed in `app/layout.tsx`.

Submit:

- `https://www.sageideas.dev/sitemap.xml`
- Inspect `/`
- Inspect `/tools/seo-audit`
- Inspect `/reports/ai-search-readiness-2026`
- Inspect one service×industry page, for example `/services/audit/for/fintech`

Weekly checks:

- Pages indexed
- Crawled but not indexed
- Duplicate without user-selected canonical
- Structured data: Breadcrumbs, Articles, Services
- Queries gaining impressions but low CTR

## Bing Webmaster Tools

Still requires account access.

Steps:

1. Add property: `https://www.sageideas.dev`
2. Use DNS TXT verification if possible.
3. Submit sitemap: `https://www.sageideas.dev/sitemap.xml`
4. Enable automatic import from Google Search Console if available.
5. Inspect homepage and flagship report URL.

## Definition of Done

- Google property verified
- Bing property verified
- Sitemap submitted to both
- First crawl/index report captured in `docs/baselines/`
- No accidental indexation of `/admin`, `/portal`, `/api`, `/checkout`
