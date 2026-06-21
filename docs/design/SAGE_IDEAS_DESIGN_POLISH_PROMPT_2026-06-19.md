# Design Polish Prompt For Claude Code

You are working in `/Users/Sage/code/active/sageideas.dev`.

Your task is to polish the public Sage Ideas agency website design. Do not work on admin, portal, Revenue OS, Job Application OS, Discord, Supabase, auth, or backend features unless a public marketing page directly imports the file and the edit is necessary for public-site design quality.

Read this handoff first:

`docs/design/SAGE_IDEAS_WEBSITE_HANDOFF_2026-06-19.md`

Local site:

`http://localhost:3042/`

Primary goal:

Make the current Sage Ideas redesigned agency site feel fully professional, premium, cohesive, conversion-ready, and polished across desktop and mobile while preserving the existing Living Systems / AI-native studio identity.

Important files and routes:

- Homepage: `app/page.tsx`, `components/living/LivingSystemsHome.tsx`
- Global layout/chrome: `app/layout.tsx`, `app/globals.css`, `components/marketing-chrome.tsx`, `components/navigation.tsx`, `components/footer.tsx`
- Services: `app/services/page.tsx`, `app/services/services-content.tsx`, `app/services/[slug]/flagship-page-content.tsx`, `components/el/services/*`, `data/services/*`
- Work: `app/work/page.tsx`, `app/work/[slug]/case-study-content.tsx`, `components/el/work/*`, `data/work/*`
- Pricing: `app/pricing/page.tsx`, `app/pricing/pricing-el.tsx`
- Contact: `app/contact/page.tsx`, `app/contact/contact-content.tsx`, `app/contact/contact-relaunch-content.tsx`
- Compare: `app/compare/page.tsx`, `app/compare/[slug]/page.tsx`, `data/compare/comparisons.ts`
- Industries: `app/industries/page.tsx`, `app/industries/[slug]/industry-page-content.tsx`, `data/industries/verticals.ts`
- Lab/tools: `app/lab/page.tsx`, `app/lab/[slug]/page.tsx`, `app/tools/route-finder/*`, `app/tools/seo-audit/*`
- Blog/content: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `components/blog/*`, `content/blog/*.mdx`

Use these design references:

- `docs/BRAND_CREATIVE_BRIEF.md`
- `docs/DESIGN_BRIEF_V2.md`
- `docs/DESIGN_ROUTE_AUDIT.md`
- `docs/UIUX_50M_AGENCY_AUDIT_2026-06-17.md`
- `docs/UIUX_COHESION_AUDIT_2026-06-17.md`
- `docs/UIUX_REPAIR_PROGRAMS_2026-06-17.md`
- `docs/design/quality-rubric.md`
- `.design-review/final-live-home-1440.png`
- `.design-review/final-live-home-390.png`
- `.design-review/audit-uiux-home-1440.png`
- `.design-review/audit-uiux-services-1440.png`
- `.design-review/audit-uiux-work-1440.png`
- `.design-review/audit-uiux-pricing-1440.png`
- `.design-review/audit-uiux-contact-1440.png`

Design constraints:

- Preserve the dark premium Living Systems identity.
- Use tokens from `app/globals.css`.
- Do not add decorative gradient orbs, blob backgrounds, or generic landing-page decoration.
- Do not use oversized hero marketing fluff where a dense agency/proof interface is better.
- Improve spacing, typography hierarchy, mobile flow, nav polish, proof density, CTA clarity, and section rhythm.
- Do not break SEO, sitemap, feed, OG route, public URLs, forms, or analytics.
- Do not push or deploy.
- Do not revert unrelated dirty work.

Start by auditing the public pages visually at these routes:

- `/`
- `/services`
- `/services/ai-development`
- `/work`
- `/pricing`
- `/contact`
- `/compare`
- `/industries`
- `/lab`
- `/blog`
- `/studio`

Check desktop and mobile:

- 1440 x 1000
- 390 x 844

Expected output:

1. Implement the design polish directly in the repo.
2. Keep changes focused on public website design files.
3. Run:

```bash
npm run typecheck
npm run build
```

4. Run focused lint on edited files.
5. Capture screenshots for key routes before and after when possible.
6. Return a concise handoff listing:
   - files changed
   - design problems fixed
   - routes verified
   - commands run
   - remaining risks

