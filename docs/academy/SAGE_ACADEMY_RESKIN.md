# Sage Academy Reskin — sageideas.dev becomes the Academy

> Operator directive (2026-07-03): sageideas.dev IS Sage Academy. The agency site + its
> content are retired — the root domain is the academy, nothing else. Reskin the whole
> academy app one-for-one to the `Sage Academy` design export, wired to the existing Supabase
> backend + the 140 verified labs. Blog = Field Notes, from markdown files in the repo.

## Source of truth
`design-source/sage-academy/*.dc.html` — 38 self-contained design screens (copied from the
operator's export) + support JS. Preview them locally: `python3 -m http.server 8747` in that
dir, open `Sage Home.dc.html` etc.

## Key finding (why this is tractable, not a rebuild)
The codebase ALREADY speaks this design language:
- `app/globals.css` defines the full `--ac-*` token layer: dark-luxury oklch palette, Fraunces
  (display) / Hanken Grotesk (body) / JetBrains Mono (mono kickers), editorial type scale,
  spacing, radii, elevation.
- The design's exact hex palette: base `#0B0B0E`, surface `#111115`, line `#1E1E24`, text
  `#F2EFE9`, muted `#9598A2`, accent `#3D5AFE` (electric blue), proof-green `#18B663`, gold
  `#E0A93E`, danger `#E5484D`, accent-text `#8FA0FF`.
- The design system screen documents the SAME visual components already built: SageDiagram,
  SageCodeWalkthrough, SageCompare, SageViz.
So the reskin = (1) align token VALUES to the exact design palette, (2) build the new Home +
Field Notes blog one-for-one, (3) restyle existing surfaces to match their design screen —
keeping backend/logic, swapping presentation.

## Guardrails
- Build new surfaces on their OWN routes first; render-verify one-for-one; only swap the root
  (retire the agency homepage) AFTER operator sign-off — that repoint is the one irreversible step.
- A concurrent design process edits `components/academy/landing/AcademyLanding.tsx` +
  `landing.module.css` (current root). This reskin SUPERSEDES that surface — do not fight it;
  build fresh, coordinate the swap.
- Scoped commits only, never `git add -A`, never push. No fake gates. tsc-clean per surface.

## MASTER PROGRAM — 7 phases to production (autonomous harness)
sageideas.dev BECOMES the academy; the agency moves to `studio.sageideas.dev` (operator wires
DNS/domain in Vercel separately; this repo provides the hostname middleware). The harness runs
each phase autonomously (self-paced loop + verified subagents, one surface/unit per iteration,
render-verified + scoped-committed), and STOPS at the 3 operator gates below.

| # | Phase | Runs | Exit gate |
|---|---|---|---|
| 1 | **Rescan + Reskin** — capture all 38 design screens; reskin every academy surface one-for-one, real backend/data + 140 labs preserved | autonomous (loop) | every academy screen matches its design, render-verified, committed |
| 2 | **Shell + tokens** — one shared AcademyNav/AcademyFooter; align --ac-* token VALUES to exact design hex; componentize Home (retire the dangerouslySetInnerHTML blob) | autonomous | consistent shell on every page; Home is real components; tokens exact |
| 3 | **Root swap (academy only)** — repoint `/` to academy Home; retire agency framing on sageideas.dev; propose residual agency routes (/services,/book,/work,…) → redirect to studio.sageideas.dev OR remove (operator picks). NOTE: the AGENCY SITE (studio.sageideas.dev) is built by the operator in a SEPARATE session — DO NOT build/touch it here. No studio hostname routing needed in this repo. | build autonomous · **⛔ OPERATOR GATE: production root-repoint + residual-agency-route decision** | academy is the root on sageideas.dev, render-verified |
| 4 | **Operational wiring** — billing end-to-end (real Stripe price IDs → checkout → access grant → unlock); auth/onboarding/placement on the new skin; full journey signup→onboard→placement→course→lesson→lab→verify→certificate→evidence | autonomous · **⛔ OPERATOR GATE: live Stripe price IDs/secrets** | a real user can sign up, pay, and complete a lesson+lab+certificate end-to-end (verified) |
| 5 | **Hardening** — a11y (WCAG, keyboard, contrast, reduced-motion), perf/CWV (kill the HTML-blob, image/font strategy, bundle budget), SEO (metadata/structured-data/sitemap/robots), analytics + Sentry, e2e tests on the critical flows | autonomous | a11y 0-serious · CWV targets met · e2e green |
| 6 | **Polish (world-class)** — motion/micro-interactions from the design; activate the 7-language i18n (switcher wired to existing ar/de/es/fr/hi/ja/pt content); mobile/PWA installable | autonomous | motion + i18n + PWA live |
| 7 | **QA + launch** — verify all 448 lessons + 140 labs render under the new skin; certificates generate; evidence/leagues populate; full QA sweep; production deploy + smoke | autonomous build · **⛔ OPERATOR GATE: production deploy** | verified production launch |

**3 operator gates only:** (3) production root-repoint + agency domain, (4) live Stripe secrets, (7) production deploy. Everything else runs autonomously.

## Legacy phase plan (subsumed by the 7-phase program above)
- **P0 Foundation** — align `--ac-*` token values to the exact design hex; confirm fonts wired.
- **P1 Home (proof surface)** — port `Sage Home.dc.html` one-for-one to a real route
  (`/home-v2` preview), render-verify vs the design screenshot, operator sign-off.
- **P2 Field Notes blog** — `Sage Field Notes.dc.html` (list) + `Sage Field Note Article.dc.html`
  (post) from markdown in the repo (`content/field-notes/*.md`).
- **P3 App surfaces** — restyle to their design screens, reusing backend: Courses, Course Landing,
  Lesson Player, Dashboard Cockpit, Progress, Leagues, Certificate, Pricing, Checkout, Auth,
  Settings, How It Works, Why Proof, About, Onboarding, Placement, Recall Queue, Daily Rep, Lab,
  Studio, Public Profile, Evidence Portfolio, Course Map, 404, emails.
- **P4 Root swap** — repoint `app/page.tsx` to the new Home; retire agency framing/metadata;
  redirect/retire dead agency routes. (Operator-gated.)

## Surface → design-screen map (P3)
| App surface | Design screen |
|---|---|
| / (root) | Sage Home |
| /academy or /courses | Sage Courses |
| course landing | Sage Course Landing |
| lesson player | Sage Lesson Player |
| dashboard | Sage Dashboard Cockpit |
| progress | Sage Progress |
| leagues | Sage Leagues |
| certificate | Sage Certificate |
| pricing | Sage Pricing |
| checkout | Sage Checkout |
| auth/login | Sage Auth |
| field notes (blog) | Sage Field Notes + Article |
| how it works | Sage How It Works |
| about | Sage About |

## Ledger
| phase | status |
|---|---|
| P0 foundation (token alignment) | tokens already match; align exact hex during P3 |
| P1 Home one-for-one | **DONE** — live at /home-v2, render-verified vs design |
| P2 Field Notes blog | **DONE** — /field-notes (list) + /field-notes/[slug] (article), markdown-driven (content/field-notes/*.mdx, 8 real posts), render-verified one-for-one |
| P3 app surfaces | in progress — restyle existing surfaces to their design screens, one at a time |
| P4 root swap | operator-gated (retire agency home; repoint / to new Home) |

### P3 surface ledger
| surface | design screen | status |
|---|---|---|
| Courses | Sage Courses | **DONE** — catalog one-for-one; real 23 courses/448 lessons from Supabase, track filter, honest progress states (Start/Continue/Review, no fake bars). Auth-verified render. |
| Course landing | Sage Course Landing | **DONE** — one-for-one, data-driven for any [slug]; real modules/lessons, "the arc" module cards, sample-lesson player from real free-preview, honest omissions where mock had no backing. Auth-verified (Backend Engineering). |
| Lesson Player | Sage Lesson Player | queued |
| Dashboard | Sage Dashboard Cockpit | queued |
| Pricing | Sage Pricing | **DONE** — one-for-one; rewired agency pricing → real academy plans (lib/academy/plans.ts, $25/mo·$250/yr, live academy_allaccess Stripe checkout); "Honest answers" FAQ. Render-verified. |
| How It Works | Sage How It Works | **DONE** — one-for-one; "Frame it. Map it. Prove it." mastery-loop (10 steps, each with its diagram card); CTAs → real /academy. Render-verified. |
| Progress | Sage Progress | **DONE** — one-for-one; 4 panels wired to REAL data (mastery time-series reconstructed from evidence events, per-course, evidence velocity, FSRS recall skill-graph); "by dimension" honestly OMITTED (no real per-dimension data — no fabrication). Auth-verified. |
| Leagues | Sage Leagues | **DONE** — one-for-one; 100% real/honest: real tier+reset countdown, NO fabricated members (honest solo/empty-cohort state), REAL academy XP economy (lesson+20/lab+30/quiz+15/review+10, not the mock's cockpit economy), real referral invite link. Auth-verified. |
| Certificate | Sage Certificate | **DONE** — one-for-one (green proof theme); real cert (code/course/recipient/date/lessons), real modules→COVERED + artifacts→SHIPPED (discarded mock's fake competency claims), verify-curl → REAL public URL with honest fields, no fabricated revocation. Verified on real cert SAGE-PYTH-0AD13FAD. |
| About | Sage About | **DONE (component)** — verbatim founder story one-for-one, built at app/academy/about (auth-verified render). ⚠ PHASE-3 ROUTING: public academy About can't sit at /about (next.config redirect /about→/studio is agency) nor gated /academy/*; root swap must (a) remove the /about→/studio agency redirect and (b) make the academy About public at /about. |
| Auth | Sage Auth | **DONE** — one-for-one split-screen (proof value panel + form); real auth actions preserved (signInWithPassword/signUpAcademy/signInWithProvider GitHub+Google), Create/Log-in tabs, forgot-password; academy-only (studio login + e2e untouched). Render-verified. |
| Settings | Sage Settings | **DONE** — new /academy/settings one-for-one; real profile save, real Stripe billing+invoices (omitted w/o subscription), real export endpoint, delete→real support path; notifications/language/connect honestly-disabled where no backend (no fake controls). Added lib/academy/billing.ts + billing-portal + export API. Auth-verified. |
| Checkout | Sage Checkout | **DEFERRED → PHASE 4** — design shows an EMBEDDED card form, but real checkout is Stripe-HOSTED (/api/checkout → checkout.stripe.com). Faking a card form = fabrication (unsafe); a real Stripe Payment Element embedded checkout is a billing-architecture decision needing live Stripe keys. Handle at Phase 4 (operator gate): decide hosted (keep, PCI-safe) vs embedded Payment Element (matches design). NOT a Phase-1 reskin. |
| Dashboard Cockpit / Lesson Player + remaining | (respective) | queued |
| ⚠ HARNESS NOTE: reskinned academy login has 2 forms (OAuth + email); sweep verify must click the EMAIL submit `getByRole('button',{name:/Log in →/})` (click Log-in tab first), NOT the first button[type=submit] (that's GitHub OAuth). |
