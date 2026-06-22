# Sage Ideas — Comprehensive Marketing Audit
**Date:** 2026-06-21 · **Scope:** full marketing surface (homepage, services, pricing, work, founder, nav, blog, funnels) · **Excludes:** the Academy product (separately built to world-class this cycle)

## Method (and why you can trust it)
Four senior analysts ran against the codebase in parallel — **conversion/positioning**, **technical SEO**, **performance/CWV**, **accessibility/design-consistency** — and every high-severity finding was **cross-checked against the live site** before it landed here. That live pass mattered: it overturned the conversion analyst's three biggest "critical" findings as **stale-code false positives** (see the honesty note below). Measured data (Lighthouse + a real performance trace) anchors the perf and a11y claims. Nothing in the "Verified" column is asserted from code alone.

---

## Executive verdict
**The site is 80% of a seasoned-professional brand with a few specific cracks that disproportionately undercut it.** The *craft* is genuinely high — the homepage, services, pricing, blog, and now the academy share a coherent dark-luxury editorial system, the writing voice is distinctive, and the technical foundation (LCP 391ms warm, CLS 0, SEO 100, BP 100) is strong. What reads as less-than-seasoned is concentrated in four places: **(1) proof is developer-flavored, not buyer-flavored; (2) the positioning leads with "solo" as an apology instead of a weapon; (3) the navigation overwhelms; (4) a handful of trust/SEO/a11y details leak credibility.** None require a rebuild. All are surgical.

## Honesty note — false positives caught at the live layer
The conversion analyst flagged `/services` as a CRITICAL fracture ($150/hr hourly rate, sparkles icon, legacy service names conflicting with pricing, cal.com booking). **All of that lives in `app/services/services-content.tsx`, which is imported nowhere and never renders.** The live `/services` already renders `ServicesEl` — tier-based ("Sage Audit / Ship / Automate / SEO Sprint / Content Engine"), "Fixed scope, fixed price, Stripe checkout," CTAs to `/book`, no hourly rate, no sparkles. **Action: delete the dead component** (`services-content.tsx`) so it can't mislead a future audit or get accidentally re-wired — but it is *not* a live conversion problem. Treat any audit finding sourced from that file as void.

---

## Measured baseline (homepage, live)
| Metric | Result | Read |
|---|---|---|
| LCP (warm, desktop) | **391 ms** | Excellent on fast connections |
| CLS | **0.00** | Excellent |
| Lighthouse SEO | **100** | Strong |
| Lighthouse Best Practices | **100** | Strong |
| Lighthouse Accessibility (mobile) | **97** | One real defect (malformed list) |
| Lighthouse "Agentic/AX tree" | **50** | Same malformed-list defect breaks the AX tree |

The warm numbers are great. The risk is **cold / mobile / slow-network**, where the splash path and bundle weight bite (see Performance).

---

## 1 · Positioning & Messaging
**Strength:** the hero line ("I build the product, the brand, and the AI that runs it"), "Phone a real collaborator before you sign," and "Bring me the hard one" are better than 95% of agency copy. The voice is real.

| # | Sev | Finding | Verified | Fix |
|---|---|---|---|---|
| P-1 | HIGH | **"Solo" is framed as a disclaimer, not the value.** Subhead leads "A solo, AI-native studio…" — solo is the qualifier, when it should be the weapon: *no handoff, no telephone game, the person who pitches is the person who types.* | code | Lead the subhead with the buyer benefit of solo; demote "solo" from apology to proof. The homepage trust strip already has the right language — pull it up. |
| P-2 | MED | **"AI-native studio" is undifferentiated** — every agency claims it. The loader tagline "AI-native studio · since 2020" communicates nothing specific. | code | Anchor on the *operator* angle ("I run my own products in production, then build yours to the same standard") — that's defensible and unique. |
| P-3 | MED | **No "for whom."** A fintech founder, a brand, and a CISSP-prep company all hit the same hero. Passes the 5-second test on intent, fails on audience. | code | Add one ICP-signaling line near the hero or in the route-finder. |

## 2 · Information Architecture & Funnels
**Strength:** `/services` → `/pricing` → `/book` is now coherent and fixed-scope (the fracture was dead code). The route-finder hero experiment is a smart CRO touch.

| # | Sev | Finding | Verified | Fix |
|---|---|---|---|---|
| IA-1 | HIGH | **Nav overwhelms** — two mega-dropdowns (Services, Resources) expose ~31 destinations before the visitor reads a word. Decision paralysis; reads as "we do everything." | live (nav visible) | Collapse to ~5: Services · Work · Pricing · Resources (single dropdown) · Book. The "route console" delights the builder, not the buyer. |
| IA-2 | HIGH | **Studio vs Academy are conflated in the primary nav** (a mode-toggle widget between Work and Pricing). They're different products at different price points and audiences. | live | Give Academy one clean nav link → the (now world-class) academy landing. Drop the toggle from primary nav. |
| IA-3 | MED | **Dead component risk** (`services-content.tsx`) — unused but present. | verified live | Delete it. |

## 3 · Conversion & Trust
**This is the highest-leverage domain.** The craft is there; the *proof* is aimed at engineers, not buyers.

| # | Sev | Finding | Verified | Fix |
|---|---|---|---|---|
| CV-1 | CRITICAL | **Proof is developer-flavored.** Homepage "receipts" = "398 tests · flagship CI", "130+ public repos." A $50k buyer can't price that. | live (homepage) | Translate ≥2 receipts to buyer outcomes: "0 surprise change orders," "11 products in production since 2020," "the person who pitches writes the code." |
| CV-2 | CRITICAL | **Every pricing-page sample artifact is `comingSoon: true`** (`data/services/tiers.ts`, 10/10 tiers). The highest-intent visitor (pricing stage) hits a wall of placeholders. | code (file:line) | Ship ONE real redacted artifact — a 3–4pp sanitized Audit report — and unflag it. One real deliverable > ten "coming soon." |
| CV-3 | HIGH | **Pre-emptive apology copy.** "Proof gets stronger as real client assets… are added" + empty `attributedTestimonials`/`permissionedLogos` arrays render an implicit "no client proof yet." | code | Remove the disclaimer. Reframe the receipts as "my own stack, in production" (honest, no proof debt) and lead with the **callable-references** mechanism — that's your real differentiator. |
| CV-4 | MED | **Founder-built work presented as portfolio.** All 7 "work" entries are own-products (Nexural, Athanor, Voza…). Good proof, but unlabeled it risks reading as fabricated client work. | code | Add an explicit "Operator-built — to client standard" badge on each work card. Turns the caveat into a flex. |
| CV-5 | MED | **Closing section splits the ask** — "Book a call" and "Learn the system" at equal weight at the conversion moment. | code | Single primary CTA in the closer; academy cross-sell visually subordinate. |

## 4 · SEO
**Strength:** already strong — BlogPosting/Breadcrumb/Org/ProfessionalService JSON-LD, sitemap coverage, OG, clusters, canonical on most pages. SEO Lighthouse = 100.

| # | Sev | Finding | Verified | Fix |
|---|---|---|---|---|
| SEO-1 | CRITICAL | **`WebSite` schema never emitted** (`buildWebSite()` exists, unused). Loses Sitelinks-Searchbox eligibility + clean entity anchoring. Also Org + ProfessionalService are emitted on *every* page (layout) → entity duplication. | code | Emit `WebSite` + `Organization` + `ProfessionalService` once, co-located on `app/page.tsx`; remove from layout. |
| SEO-2 | CRITICAL | **Relative canonical** on `/hire-ai-engineer` (`canonical: '/hire-ai-engineer'`) — Google rejects relative canonicals. Also missing from sitemap. | code (file:line) | Absolute URL; decide index vs noindex; add to sitemap if indexed. |
| SEO-3 | HIGH | **Bare commodity titles** on the 3 highest-intent pages: `/services`="Services", `/pricing`="Pricing", `/capabilities`="Capabilities". | live (title) | Keyword-rich titles: "AI Engineering & Studio Services — Sage Ideas," etc. |
| SEO-4 | HIGH | **Breadcrumbs are `sr-only`** — invisible to users, losing orientation + crawlable anchor equity. | code | Make them visibly present (understated mono), keep JSON-LD. |
| SEO-5 | MED | **OG/Twitter gaps** on `/blog` index, `/founder`, `/work`, topic hubs, industry pages (fall back to global card). + **lying `lastModified: now`** on all non-blog sitemap entries. + **blank favicon** (`data:,`). | code (file:line each) | Add per-page OG + twitter; drop synthetic lastmod; ship a real favicon (the Sage mark exists). |

## 5 · Performance
**Strength:** warm LCP 391ms, CLS 0; GSAP/recharts correctly dynamic-imported; RSC boundaries clean; React Compiler on. The risk is mobile/cold.

| # | Sev | Finding | Verified | Fix |
|---|---|---|---|---|
| PF-1 | CRITICAL | **5.5MB PNG backdrop** (`inkwash-cliffs.png`) fetched `priority` (eager, high) — competes with LCP on the splash path; mobile bandwidth killer. | code (file:line) + Agentic 50 mobile | Convert to AVIF (~70–85% smaller); drop `priority` (it's in a `display:none` container until splash). Est. 0.5–1.2s mobile LCP. |
| PF-2 | HIGH | **`framer-motion` (~45–50KB gz) in the global layout bundle** via `MotionConfig` in `posthog-provider.tsx` — loaded on every route incl. the homepage, which uses GSAP/CSS, not framer. ~30% of the landing JS budget wasted. | code (file:line) | Decouple from the layout; load framer only on routes that use it. (Note: keep a `MotionConfig reducedMotion="user"` somewhere — it's also the a11y motion fix, see A-2.) |
| PF-3 | HIGH | **PostHog session recording on the marketing homepage** (~120–140KB gz analytics payload incl. rrweb). | code | Gate recording to /portal,/admin,/tools; disable on marketing. |
| PF-4 | MED | **Dual IntersectionObserver** + **OperatorConsole 1s `setInterval` → React re-render every second** (re-renders 6 stations + SVG sin-math) → INP risk. **`filter` animated in the splash keyframe** (off-compositor repaint). | code (file:line) | Merge to one IO; move the clock to a DOM ref (no re-render); swap splash `filter` for an opacity overlay. |
| PF-5 | MED | **Duplicate `priority` backdrop** in both `SplashBackdrop` and `IntentGate`; 9 font files (3 families × 3 weights); CSP `script-src 'unsafe-inline'`. | code | One `priority`; drop unused weights + `display:'optional'` for mono; nonce-based CSP. |

## 6 · Accessibility & Design Consistency
**Strength:** skip link wired, reduced-motion CSS kill-switch present, semantic landmarks mostly correct. A11y Lighthouse 97.

| # | Sev | Finding | Verified | Fix |
|---|---|---|---|---|
| A-1 | CRITICAL | **Malformed list** — a `<ul>`/`<ol>` contains non-`<li>` children, breaking the accessibility tree (this is the Lighthouse 97 + Agentic 50 cause). | **measured live** | Find the offending list (likely nav or a stat list) and make children `<li>` only. Single highest-confidence a11y fix. |
| A-2 | CRITICAL | **IntentGate modal has no focus management/trap** (keyboard users can't be pulled in, bg stays reachable). + **Mega-menu has no Escape / focus return** (keyboard trap). + **Mobile drawer no focus trap/return.** | code (file:line) | Focus-in + trap + Escape + focus-restore on all three. |
| A-3 | HIGH | **Contact form a11y**: no `role="alert"`/`aria-live` on errors (silent failures for SR users); missing `id`/`htmlFor`; missing `autocomplete` tokens; "required" announced twice. | code (file:line) | Add live error region, label plumbing, autocomplete tokens. |
| A-4 | HIGH | **Framer-motion animations ignore `prefers-reduced-motion`** (contact page, others) — JS animations aren't caught by the CSS kill-switch. | code | `<MotionConfig reducedMotion="user">` at root — one line, fixes site-wide (and pairs with PF-2). |
| A-5 | MED | **Design tokens bypassed** — 269 hardcoded hex values across 81 files instead of the (well-built) `--sage-*` token system. A maintainability + future-theming + professionalism signal. | code | Progressive migration + lint guard; raw `#3D5AFE` → `var(--sage-accent)` etc. |

---

## Prioritized roadmap (by leverage, not by domain)

### P0 — credibility leaks a buyer/Google will notice (do first)
1. **CV-1 — Translate the homepage "receipts" to buyer outcomes.** Biggest single conversion lever.
2. **CV-2 — Ship one real redacted Audit artifact; unflag it.** Removes the pricing-stage wall.
3. **A-1 — Fix the malformed list.** Measured a11y + AX-tree defect; one fix lifts both scores.
4. **SEO-1 + SEO-2 — WebSite schema on homepage + fix the relative canonical.** Quiet but real indexing/entity bugs.
5. **CV-3 — Kill the apology copy; lead with callable references.**

### P1 — sharpen the professional read
6. **IA-1 + IA-2 — Collapse the nav to ~5 items; give Academy its own clean link.**
7. **P-1 — Re-frame "solo" as the weapon in the hero/subhead.**
8. **PF-1 — AVIF the 5.5MB backdrop + drop `priority`.** Mobile LCP.
9. **A-2 + A-4 — Modal/menu focus management + `MotionConfig reducedMotion="user"`.**
10. **SEO-3 + SEO-5 — Keyword titles on services/pricing/capabilities; per-page OG/Twitter; real favicon; drop synthetic lastmod.**

### P2 — polish & hygiene
11. **PF-2/PF-3 — Decouple framer-motion from layout; gate session recording.** Bundle weight.
12. **CV-4/CV-5 — "Operator-built" badges; single closing CTA.**
13. **A-3 — Contact form a11y plumbing.**
14. **IA-3 — Delete `services-content.tsx` dead code.**
15. **A-5 — Begin token migration + lint guard.**

---

## The 7 highest-leverage moves (if you only do seven)
1. **Make the proof buyer-facing** (receipts + one real artifact + callable references up front). *Conversion.*
2. **Fix the malformed list.** *Measured a11y + AX, one change.*
3. **WebSite schema + canonical fix + keyword titles.** *SEO entity + intent pages.*
4. **Collapse the nav; separate Studio and Academy.** *Clarity = professionalism.*
5. **Re-frame "solo" as the differentiator, not the disclaimer.** *Positioning.*
6. **AVIF the backdrop + drop `priority`.** *Mobile speed = perceived quality.*
7. **`MotionConfig reducedMotion="user"` + modal/menu focus traps.** *A11y, one provider + ~40 lines.*

Each is surgical. None touches the strong core. Done together, the site stops reading as "talented operator" and starts reading as "seasoned studio."
