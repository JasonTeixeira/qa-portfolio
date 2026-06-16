# SEO Data Refresh

`keyword-map.ts` starts with honest seed terms so pages can be mapped before Google Search Console has enough history. Unknown volume uses `0`; unknown difficulty uses `-1`. Do not invent metrics.

Refresh flow:

1. Export Search Console queries and pages for the last 12 months.
2. Add external volume/difficulty from Keyword Planner, Ahrefs, DataForSEO, or another named source.
3. Map one primary term to one URL. Supporting terms may share the URL.
4. Update `source`, `monthlyVolume`, `difficulty`, `lastRefreshed`, and optional `gscSnapshot`.
5. Run `npm run seo:content-audit` and review dispositions before publishing new content.
