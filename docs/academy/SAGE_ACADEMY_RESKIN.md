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
| Dashboard Cockpit | Sage Dashboard Cockpit | **DONE** — one-for-one bento; all real panels (continue-lesson, per-course progress, evidence ledger PROVEN, streak/XP momentum, FSRS recall-due, certificates, job-ready journey); fabricated design bits (per-learner repair→91 headline, league rows, AI coach note, per-week XP history) honestly omitted/reframed. Added real getDueCount+evidence reads. Auth-verified. |
| Lesson Player | Sage Lesson Player | **DONE** — THE core surface, one-for-one via CSS-only token alignment (lesson.module.css + sprint.module.css → exact --ac-* palette). ALL 24 block types preserved, 140 labs + ArtifactComposer + quizzes + progress/evidence UNTOUCHED (zero logic changed). Verified on real lesson backend-request-response. |
| Course Map | Sage Course Map | **DONE** — new /academy/course/[slug]/map one-for-one; real modules+lessons+status/progress, resume CTA, real durations; type/XP chips omitted (no per-lesson kind/xp field). Verified on Backend Engineering. |
| Evidence Portfolio | Sage Evidence Portfolio | **DONE** — one-for-one; real claims→artifacts→verdict table (real counts 11/9 not mock's 14/14; all PROVEN, NEEDS-REPAIR only for real open repairs, mock's "in review" NOT rendered), real earned+in-progress certs, honest share link. Auth-verified. |
| Public Profile | Sage Public Profile | **DONE** — one-for-one /academy/u/[handle]; real name/stats/tier/streak, real published-evidence table (all PASSED, open repairs excluded), real certs, honest empty + private-profile states; real artifact titles (no invented filenames). Verified on real public handle (Maya R.). |
| Onboarding | Sage Onboarding | **DONE** — one-for-one design language across the real multi-step flow (primer + "Three moves" deck verbatim + real goal/commitment/calibration/daily-goal steps); real completeOnboarding→/win→dashboard preserved; kept real personalization (not the mock's fake options). Auth-verified. |
| Placement | Sage Placement | **DEFERRED → PHASE 4** — design is a 3-scenario diagnostic that ROUTES the learner to a start point; NO placement-scenario/routing engine exists (onboarding calibration is the real "where you start" mechanism, already reskinned). Building the answer→course routing = inventing product logic (fabrication). Build as a real feature in Phase 4 (signup→onboard→PLACEMENT→course journey) with real routing, or fold into onboarding calibration. NOT a Phase-1 reskin. |
| Recall Queue | Sage Recall Queue | **DONE** — one-for-one FSRS flashcard flow (/academy/review); real due queue (15 cards), real computed retention (83%, null-honest), real Again/Hard/Good/Easy → real scheduler (untouched), real due windows; answer reveal = recall-guidance + lesson link (no stored answer column — no fabricated key). Auth-verified. |
| Daily Rep | Sage Daily Rep | **DONE** — new /academy/today; reuses ReviewSession (variant=daily) = SAME real FSRS due queue + scheduler as Recall Queue, reframed as the daily streak-shield rep. Gold "{N}-day streak · at stake/shielded" pill from real academy_streaks.current_length (getGamification), streak-shield footer copy. Wired the half-added daily-variant infra through all 3 topbars + footer (fixed broken retentionStat ref). Route compiles + auth-gates (307→login?next=/academy/today); presentational delta over already-live-verified component. Real streak, real cards, no fabrication. |
| Weekly Challenge | Sage Weekly Challenge | **DEFERRED → feature-build (post-reskin)** — the design is a full scenario-of-the-week feature: a weekly incident writeup ("The invoice that emailed itself twice."), a submission box for "Friday's review", and a peer "what the crew is chewing on" discussion thread. This needs THREE backends that do not exist — challenge content (no `academy_weekly_challenges` table), a submission store (`academy_challenge_entries` absent), and a discussion store — and no lib reads any of them. Reskinning it would require fabricating the entire feature + its data (the invoice scenario, the submissions, the crew discussion), which violates no-fabrication. Same "surface it, don't fake it" precedent as Checkout/Placement. Build as a real feature (content table + submission + discussion) in a later phase, then skin. |
| Sage Studio (authoring) | Sage Studio | **DONE** — /academy-admin reskinned to the editorial design: gold-tiled "Sage Studio" + AUTHOR pill app-bar (on StudioHome + LessonEditor), a REAL stats strip (real course count / published / draft / summed lessons / field-note count via getAllFieldNotes) — the design's mock "448 planned · 124 written · next ships Monday" OMITTED as fabricated — and the numbered "block arc" rail with real content-derived status + word counts. All editor functionality + saveLesson/saveCourse untouched; tsc clean; route compiles + AUTHOR-gates (307→login). NOTE: "Sage Ideas Studio.dc.html" is a 206-byte stub; "Sage Studio.dc.html" (13KB) is the real design. Optional Phase-6 polish: 3-pane live-preview split + per-block single-selection editing (not rebuilt — working multi-block form kept). |
| Lab (standalone) | Sage Lab | **DONE** — LabRunner (/academy/learn/[course]/[lesson]/lab) restructured to the split-pane design: LEFT editor (line-number gutter) + docked terminal output; RIGHT "THE BRIEF" (Fraunces headline = real lab.title, prose = real lab.summary) + "CHECK — CAN'T BE FAKED" card showing the ONE real server-held checkpoint honestly (pending→verified via real verifyLab verdict). Full boot/run/verifyLab/markLessonComplete flow preserved byte-for-byte. OMITTED as fabricated: "Show the fix" (no stored solution — labs are check-by-output, answer never reaches client), "WHY IT FAILS" incident narrative, mock chips (repaired 214×/N due/6 min), the 3-item checklist (a lab holds exactly ONE check — 3 rows = 2 fabricated criteria). tsc clean; route auth-gates (live screenshot auth-blocked, no creds — same as Daily Rep/Studio this turn). |
| 404 | Sage 404 | **DONE** — sitewide app/not-found.tsx reskinned to "This page failed its check": ghosted Fraunces numeral, curl-trace terminal card (✗ 404 — resource not in the ledger), two honest exits (home + real /field-notes). Replaced the agency 404 (retired /work,/services,/founder links). Softened the mock's "logged as a failing case · gets repaired" to an honest broken-link line (no unverified logging claim). Live-verified at a 404 URL; tsc clean. Residual agency nav/footer around it = global layout chrome (Phase 3 removes). |
| Cancel (membership) | Sage Cancel | **DEFERRED → Phase 4 (billing)** — the design is a membership CANCELLATION + retention flow ("Before you go — the honest picture.": ledger-stays / certs-stay / lessons-pause list, reason chips, "Pause 2 months" + "Drop to monthly $29" retention offers, red "Cancel my membership"). NOT the current app/checkout/cancel (that's the Stripe checkout-abandoned page). This needs real Stripe subscription-management actions (pause_collection, plan swap to monthly, cancel_at_period_end) + reason logging — none exist. The real cancel path TODAY is the Stripe billing portal linked from the (reskinned) Settings. Faking pause/downgrade/cancel = fabrication. Build in Phase 4 when live-Stripe billing is wired. |
| Help | Sage Help | **DONE** — new /academy/help (search + 4 category cards + MOST-ASKED accordion + contact card), modeled on the About marketing page. 6 FAQ items grounded ONLY in real features (each cited): Sage Tutor (AiTutorPanel + /api/academy/tutor), streak freezes (freezes_available default 2), proof-based unlock gates (scaffold unlock-gate/sprint-contract), public certificate-verify URL (/academy/certificate/[code]), data export (/api/academy/export), real Stripe cancel/billing (portal). DROPPED mock fabrications: team-plan manager visibility (NO team/org/seats backend), 14-day guarantee (NO refund policy in code), learner "mastery cap" (caps-logic is content-quality only); reframed "Sprout"→real Sage Tutor. Search = real client-side filter; contact = mailto:contact@sageideas.dev (verified real). tsc clean; gates like sibling marketing pages (307→login) — Phase 3 makes marketing/help public + should add /academy/help to the middleware public allowlist. |
| Legal | Sage Legal | **DEFERRED → operator/attorney input gate** — the design ("The fine print, unfine-printed.") is binding legal copy: Terms of Service / Privacy / **Refund policy** tabs, an honest-summary, and §-sections asserting real commitments (prorated refunds on paid-feature removal, aggregate liability capped at trailing-12-mo fees, "never train models without opt-in", "team seats per-person transferable by admin", Delaware jurisdiction, legal@sageideas.dev). HIGHEST-stakes no-fabrication case: authoring binding ToS/Privacy/Refund text is an operator/attorney job, NOT an AI skin task. Verified: existing app/legal is the AGENCY services-agreement suite (Sage Ideas LLC B2B), there is NO real academy Terms/Privacy/Refund copy anywhere, the design references features that DON'T exist (no team-seats backend, no refund policy — same finding as Cancel/Help), and legal@sageideas.dev is unverified. The presentation shell (tabs + honest-summary + numbered §sections) can be built one-for-one ONCE Sage/attorney provides the real clause text. |
| Why Proof / Team Admin | (respective) | queued |
| ⚠ HARNESS NOTE: reskinned academy login has 2 forms (OAuth + email); sweep verify must click the EMAIL submit `getByRole('button',{name:/Log in →/})` (click Log-in tab first), NOT the first button[type=submit] (that's GitHub OAuth). |
