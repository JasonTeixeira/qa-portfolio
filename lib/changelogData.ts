// Auto-curated from git history — a real, honest shipped-work feed.
// Updated manually as meaningful changes ship. Not every commit lands here;
// dashboard snapshots and chores are skipped.

export type ChangelogTag = 'feat' | 'fix' | 'refactor' | 'content'

export interface ChangelogEntry {
  date: string // ISO yyyy-mm-dd
  tag: ChangelogTag
  title: string
  body?: string
  scope?: string
}

export const changelog: ChangelogEntry[] = [
  // ── May 2026 ──
  {
    date: '2026-05-04',
    tag: 'feat',
    scope: 'phase-8',
    title: 'Audit fixes + polish pass',
    body:
      'Canonical hostname standardized on www.sageideas.dev, title duplication removed sitewide, OG image added to /stack, /insights → /blog and /rss.xml → /feed.xml redirects, evidence strip on /trust, beefed-up /lab grid, "Latest writing" block on the homepage, contact face + four-step expectation timeline, and this changelog page.',
  },
  {
    date: '2026-05-04',
    tag: 'feat',
    scope: 'phase-7',
    title: 'Trust stack — live receipts, data handling, guarantees, honesty',
    body: 'Built /trust as a real-receipts page: live status, what we promise vs. what we deliver, how we handle data, and the things we explicitly don\'t do.',
  },
  {
    date: '2026-05-04',
    tag: 'feat',
    scope: 'phase-6',
    title: 'Details that signal $100M',
    body: 'Tightened the small things — typography rhythm, motion timing, dark-on-dark contrast, micro-interactions on cards and buttons.',
  },
  {
    date: '2026-05-04',
    tag: 'feat',
    scope: 'phase-5',
    title: 'Conversion architecture — typed intake, Supabase + Resend wiring',
    body: 'Replaced the contact form with a typed three-mode intake (Studio / Project / Consult), wired to Supabase for persistence and Resend for transactional email.',
  },
  {
    date: '2026-05-04',
    tag: 'feat',
    scope: 'phase-4',
    title: 'Visual proof layer — branded portrait, hero motion, artifact galleries',
    body: 'Added the studio hero motion sequence, branded portrait treatment, and the artifact galleries on case studies.',
  },
  {
    date: '2026-05-04',
    tag: 'feat',
    scope: 'phase-3',
    title: 'Pricing lane — Studio Engagement + rebuilt /pricing',
    body: 'Picked a clear pricing lane. Added Studio Engagement (the embedded retainer), rewrote /pricing to lead with it, kept Project and Consult as supporting modes.',
  },
  {
    date: '2026-05-04',
    tag: 'feat',
    scope: 'phase-2',
    title: 'Narrative spine — hero, film-poster titles, /pov, founder origin',
    body: 'Rewrote the homepage spine, introduced film-poster section titles, launched /pov as the studio\'s point of view, rewrote the founder origin.',
  },
  {
    date: '2026-05-04',
    tag: 'feat',
    title: 'Restored studio-relaunch agency site + layered in client portal',
    body: 'Re-grounded the site as a studio (not a personal portfolio). Added the client portal scaffolding (intake → project → invoices → docs).',
  },
  {
    date: '2026-05-03',
    tag: 'fix',
    scope: 'p0',
    title: 'Production bug sweep',
    body: 'Headshot rendering, scheduler edge cases, copy interpolation, label spacing.',
  },
  {
    date: '2026-05-03',
    tag: 'feat',
    title: 'Cinematic service pipelines + App Development tier',
    body: 'Each service now has its own cinematic pipeline visual. Added App Development as a stand-alone tier.',
  },
  {
    date: '2026-05-03',
    tag: 'feat',
    title: 'Founder page rewrite + sitewide voice reset',
    body: 'Killed every recruiter-era phrase across the site. Rewrote /founder around the studio approach and the kind of work I take on.',
  },
  {
    date: '2026-05-03',
    tag: 'feat',
    scope: 'trust',
    title: 'Transparent references; dropped fabricated cert years',
    body: 'References section now lists only real, verifiable items. Removed any cert "year earned" that wasn\'t accurate.',
  },
  {
    date: '2026-05-03',
    tag: 'feat',
    title: 'Pricing reset, full 8×4 capability matrix, Care retainers',
    body: 'New pricing system: nine tiers, an 8×4 capability matrix, and Care retainers for ongoing site/brand/content care.',
  },
  {
    date: '2026-05-02',
    tag: 'fix',
    title: 'Replaced AI-generated blog covers with clean SVGs',
    body: 'Six ugly auto-generated PNGs swapped for hand-tuned SVGs that match the site theme.',
  },
  {
    date: '2026-05-02',
    tag: 'fix',
    title: 'Portfolio gaps — live URLs, nav, SEO, honest metrics',
    body: 'Filled in real live URLs, fixed broken nav targets, tightened SEO meta, removed metrics that couldn\'t be verified.',
  },

  // ── April 2026 ──
  {
    date: '2026-04-30',
    tag: 'fix',
    title: 'Removed inflated claims, fake testimonials, misleading metrics',
    body: 'A full pass to delete anything that overstated what the studio is. If a number couldn\'t be sourced, it got cut.',
  },
  {
    date: '2026-04-28',
    tag: 'feat',
    title: 'micro-saas-starter added — five new lab products complete',
    body: 'A pragmatic SaaS starter (auth, billing, dashboard, marketing site) joins The Lab. Brings the recent product additions to five.',
  },
  {
    date: '2026-04-28',
    tag: 'feat',
    title: 'realtime-market-dash added to portfolio',
    body: 'Live market data dashboard with WebSocket streaming and chart synchronization.',
  },
  {
    date: '2026-04-27',
    tag: 'feat',
    title: 'sage-cli added to portfolio',
    body: 'A small CLI for ergonomic scripting, with a tested plugin system.',
  },
  {
    date: '2026-04-27',
    tag: 'feat',
    title: '45 custom SVG blog cover images',
    body: 'Hand-tuned blog cover art for every post — themed to the site, no stock imagery.',
  },
  {
    date: '2026-04-27',
    tag: 'feat',
    title: '5 architecture diagrams wired to case studies',
    body: 'AlphaStream, AWS Landing Zone, CI/CD pipeline, Nexural ecosystem, Trade Engine state machine — all real, all rendered as SVG.',
  },
  {
    date: '2026-04-27',
    tag: 'feat',
    title: 'Industry landing pages for long-tail SEO',
    body: 'Four industry-specific pages (fintech, healthtech, SaaS, agencies) with their own challenges, engagements, and proof.',
  },
  {
    date: '2026-04-27',
    tag: 'feat',
    title: 'SEO overhaul — schemas, slugs, RSS, sharing',
    body: 'Schema.org markup, clean slugs, working RSS feed, social-share imagery for every page.',
  },
  {
    date: '2026-04-27',
    tag: 'feat',
    title: 'trade-engine added to portfolio',
    body: 'Documented the algorithmic trade engine and its state machine.',
  },
  {
    date: '2026-04-27',
    tag: 'feat',
    title: 'terraform-aws-modules added to portfolio',
    body: 'Reusable AWS infrastructure modules: VPC, IAM landing zone, GitHub OIDC, CI runners.',
  },
  {
    date: '2026-04-26',
    tag: 'feat',
    title: 'Cal.com booking integrated across contact + services',
    body: 'Direct booking from contact and services pages with no third-party redirect.',
  },
  {
    date: '2026-04-26',
    tag: 'fix',
    title: 'Comprehensive cleanup — filters, counts, sitemap, CTAs',
    body: 'Category filters now reflect real counts. Sitemap covers every page. CTAs point to the right places.',
  },
  {
    date: '2026-04-25',
    tag: 'content',
    title: 'Completed 50 expert blog posts',
    body: 'Finished the editorial backlog — 50 long-form posts on systems, fintech, AI, testing, and infrastructure.',
  },
  {
    date: '2026-04-24',
    tag: 'feat',
    title: 'Site redesign v2.0',
    body: 'Full visual rebuild — type system, color tokens, motion library, component primitives.',
  },

  // ── January 2026 ──
  {
    date: '2026-01-18',
    tag: 'feat',
    scope: 'platform',
    title: 'Security receipts, synthetic monitor, flagship blueprint',
    body: 'Live security scan results, a synthetic monitor running every five minutes, and the flagship landing-zone blueprint as a downloadable artifact.',
  },
  {
    date: '2026-01-18',
    tag: 'feat',
    scope: 'platform',
    title: 'Ops reliability page + incident drill evidence',
    body: 'Documented operational reliability practice with real incident-drill artifacts (game day reports, runbooks).',
  },
  {
    date: '2026-01-18',
    tag: 'feat',
    scope: 'dashboard',
    title: 'AWS proof / receipts block',
    body: 'The quality dashboard now pulls live AWS telemetry through a hardened proxy with a verification gate.',
  },
  {
    date: '2026-01-15',
    tag: 'feat',
    scope: 'flagship',
    title: 'AWS Landing Zone narrative + homepage feature',
    body: 'Strengthened the landing-zone case study and promoted it to the homepage as the flagship engagement example.',
  },
  {
    date: '2026-01-15',
    tag: 'feat',
    scope: 'infra',
    title: 'Terraform modules for API, newsletter, telemetry, site',
    body: 'The site itself ships as IaC — every component (Next.js app, newsletter, telemetry pipeline, API routes) defined in Terraform.',
  },
  {
    date: '2026-01-15',
    tag: 'feat',
    scope: 'ui',
    title: 'Artifacts and dashboard components',
    body: 'New primitives for /artifacts and the quality dashboard — downloadable evidence cards, live-status pills, metric trend lines.',
  },
]
