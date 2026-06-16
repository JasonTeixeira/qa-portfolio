# Sage Ideas SEO + Authority Playbook

Last updated: 2026-06-16

## Non-Negotiables

- No fake testimonials, borrowed logos, fabricated traffic claims, or synthetic client proof.
- Every backlink target must point to a page with a clear buyer/search intent.
- Every article must link to one relevant money page and one relevant proof page.
- Google needs crawlable render assets. Do not block `/_next/static` in robots.

## Money Pages

| Page | Primary Intent | Internal Links To Add From Content |
| --- | --- | --- |
| `/services/ai-agent-development` | AI agent development studio | AI agent boundaries, evals, human-in-loop, workflow automation |
| `/services/ai-implementation-consulting` | AI implementation consulting | AI readiness, build vs buy, automation audits |
| `/services/app-build` | app/SaaS product build | product architecture, Next.js, Stripe, Supabase, launch plans |
| `/industries/fintech` | fintech engineering studio | trading systems, Supabase in production, Stripe, WebSockets |
| `/work/nexural` | fintech proof | Nexural build logs, database design, Discord AI bot |
| `/academy` | education/content funnel | every builder education article |

## Backlink Targets

Prioritize pages with proof or utility:

1. `/work/nexural` — strongest shipped-product proof.
2. `/blog/designing-a-185-table-database-schema-lessons-from-building-nexural` — technical depth asset.
3. `/blog/supabase-in-production-what-i-wish-i-knew-before-185-tables` — useful developer article.
4. `/tools/seo-audit` — free tool / lead magnet.
5. `/academy/ai-native-product-building/enroll` — course waitlist once packaging is ready.

## Backlink Motions

### 1. Founder Build Notes

Publish one concrete build note per week:

- What shipped
- What broke
- What decision mattered
- Artifact screenshot or code snippet
- Link to the relevant work, service, or academy page

Distribution:

- LinkedIn post
- X thread
- Dev.to or Hashnode rewrite when technical
- GitHub README link if tied to an open-source artifact

### 2. Technical Guest Posts

Targets:

- Supabase community/tutorial publications
- Vercel/Next.js community roundups
- Stripe developer stories
- Indie Hackers build-in-public posts
- Fintech engineering newsletters

Pitch angle examples:

- “What a 185-table solo-built fintech schema taught me about data modeling”
- “The AI feature boundary problem: how to decide what not to automate”
- “Stripe billing mistakes from building real SaaS products”

### 3. Proof Asset Outreach

Only after permission:

- Ask collaborators for a named quote.
- Ask companies for logo permission separately.
- Ask whether the quote can mention a measurable outcome.
- Store approved proof in `data/social-proof/attributed.ts`.

Required fields:

- name
- title
- company
- exact approved quote
- outcome if approved
- logo path if permissioned
- written permission record outside the repo

### 4. Internal Linking Loop

For every new post:

- Link to one money page.
- Link to one case study.
- Link to one related academy track.
- Link to one topic hub.

For every money page:

- Link back to relevant case studies.
- Link to one comparison page.
- Link to one academy route when educational intent exists.

## Monthly SEO Maintenance

1. Check Google Search Console queries with impressions but low CTR.
2. Rewrite titles/meta descriptions for pages ranking in positions 5-20.
3. Add internal links from fresh posts to underperforming money pages.
4. Refresh one old technical article with a stronger intro and proof asset.
5. Submit sitemap after major route/content changes.

## Course Funnel SEO

The academy should rank through practical problem pages, not broad “marketing course” claims.

Initial clusters:

- AI-native product building
- premium conversion site architecture
- content engine for builders
- AI automation systems

Each cluster needs:

- one pillar page
- four tactical articles
- one teardown post
- one lead magnet or template
- one academy enrollment page
