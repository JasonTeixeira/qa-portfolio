# Agency Proof Portfolio — Build Spec (agency.sageideas.dev)

**Design source of truth:** Claude Design project `950e3cac-c954-4f95-99c1-93e9d69374c0`,
file `Proof Portfolio v3 Navy.dc.html` (readable via claude-design MCP tools).
Companion files: `Proof Portfolio v2 Light.dc.html` (rejected direction, reference only),
`Blog.dc.html`, `Blog - Testing Probabilistic AI.dc.html`.

**Mission:** port v3 Navy to production as a second skin on this repo, fix its six known
gaps, and make the proof layer real. Target: 99+ Lighthouse in all four categories, axe-clean,
on every breakpoint. The site's own scores are content (hero displays them).

---

## 0. Locked decisions (2026-07-11, with Sage)

1. **Visual system: code-native, maximal.** Every explainer, diagram, and system visual is
   built in code (SVG/CSS/canvas, interactive, animated) — evolve the proprietary Academy
   diagram engine (`components/academy/visuals`: 38-icon bank, glowing nodes, dataflow pulse,
   NarratedDiagram storyboard) into an agency-skinned diagram system. Higgsfield is
   **atmosphere only** (grain/texture, at most one hero background plate) — no generated
   illustration as content. Evidence slots get REAL screenshots (Playwright traces, CI runs,
   PROOF_REPORTs), never generated imagery. Show-don't-tell is the organizing principle:
   prefer a diagram/demo over a paragraph everywhere.
2. **Identity: personal name, agency undertone.** "Jason Teixeira — AI / QA / Automation"
   as headline identity; services and contract offers presented under the same name.
   Doubles as job-application portfolio for hiring managers and services site for clients.
3. **Case studies: real projects, max proof.** Roster (replaces the design file's generic 5):
   Nexural QA OS + headless audit loops (92→99.6 program) · Voza verification (4-tier
   PROOF_REPORT, 256/256 device cert, Maestro E2E) · sage-kernel (proof-first SDLC OS,
   124 MCP tools) + course-auditor harness · client-adjacent work (GIGGL E2E/TestFlight
   pipeline, Voltz, Priority OS — anonymize as needed). Sweep remaining repos for more
   provable work — see `docs/agency-proof-inventory.md`. Honesty tiers (T1/T2/T3) apply to
   every claim; nothing ships unlabeled.
4. **Pricing: none shown.** All three contract offers route to BOOK A CALL.

## 1. Placement & routing

- Route group `app/(agency)/` with its **own root layout** — do NOT inherit the Academy skin.
- `middleware.ts`: host-based rewrite — requests to `agency.sageideas.dev` → `/(agency)` tree.
  Marketing pages of sageideas.dev remain untouched.
- Single Vercel project, add the `agency.sageideas.dev` domain.
- `~/code/active/sageideas-business-site` is a dead prior draft (RevenueLoop export, no git).
  Raid `docs/agency-world-class-loop.md` + `docs/evidence/agency/` for reference, then ignore.
- Dev server: never port 3000 (use 3050+).

## 2. Design tokens (extract from inline styles → `app/(agency)/agency-tokens.css`)

- Surfaces: `#090E1A` base · `#070B14` deep band · `#0E1526` card · `#101830` raised ·
  `#141E38/#16203A` hover. Borders `rgba(160,185,235,.08–.28)`.
- Semantic accents (workflow-stage semantics, keep the mapping):
  `--acc-primary #4D9FFF` (hover `#7BB8FF`) · `--acc-browser #38BDF8` · `--acc-ai #B08BE8` ·
  `--acc-pass #6FC98F` · `--acc-log #2DD4BF` · `--acc-fail #E07A6A/#E8897B`.
- Text `#E6ECF8` + opacity ladder — **floor at WCAG 4.5:1**; the design's `.35` alpha mono
  labels fail — raise to ≥.62 or bump size.
- Type: Archivo variable (wdth 62–125, wght 100–900) + JetBrains Mono 400/500/700.
  **Self-host via `next/font`** (no Google CDN). Hero H1 `clamp(56px,6.6vw,108px)` wt 750
  ls −.03em; kickers 11–15px mono tracking .16–.26em — keep scale, extract to vars.
- Radius 0 everywhere (sharp identity) except circular nodes / 12px icon tiles.

## 3. Component inventory (client islands only where interactive)

| Component | Source in design | Notes |
|---|---|---|
| `PipelineDiagram` | 5 case-study headers | one component, props for stages/colors; CSS-only anim |
| `StatusBadge` | LOCAL PROOF / PROTOTYPE / INTERNAL TOOL | honesty labels — NEVER remove |
| `EvidenceLedger` | section 04 table | data-driven from `data/agency/ledger.ts` (typed) |
| `AnatomySelector` | section 02.5 | keyboard + touch support required (design is hover-only) |
| `GroundingDemo` | CS1 RAG demo | canned Q&A, GROUNDED/BLOCKED/ROUTED verdicts |
| `TestPyramid` | CS2 | hover → also focus/tap |
| `BeforeAfterToggle` | CS3 | |
| `GateRunner` | CS4 terminal sim | reuse as the HERO instrument (see §5) |
| `TiltCard` | work samples | disable on touch + reduced-motion; no permanent will-change |
| `GhostNumeral` | 18vw outlined section numbers | keep, `data-drift` parallax |
| `Marquee` | hero bottom strip | pause on reduced-motion |

## 4. Known defects in the design file — fix in the port, do not copy

1. `min-width:1100px` — rebuild fully responsive: 320 / 375 / 768 / 1024 / 1440 / 1920.
2. No `prefers-reduced-motion` — gate ALL infinite anims (dashmove, marquee, pulse) and
   scroll JS behind the media query.
3. Hover-only state changes (`onMouseEnter`) — add focus-visible + touch equivalents,
   aria-labels on icon-only controls, fix heading semantics (mono kickers are not headings).
4. 800ms `setInterval` force-playing videos — delete; use IntersectionObserver.
5. Permanent `will-change` from tilt — apply on interaction start, remove on end.
6. All-inline styles — extract to tokens + co-located CSS; compositor-only animation
  (transform/opacity), rAF-throttled passive scroll (design already does this part right).

## 5. The four upgrades (what makes it 99+ instead of a port)

1. **Hero signature moment:** replace grid+glow hero background with `GateRunner` running
   against THIS site: types out real checks (Lighthouse scores from last CI run, test count,
   axe result, uptime) → `READINESS: SHIP ✓`. Data from a build-time JSON artifact committed
   by CI (`proof/site-proof.json`). The 3 dashed data-lines can stay as accent.
2. **Micro-interaction language** (Snellenberg grade): magnetic primary CTAs, char/line
   reveal on H1s, designed focus rings, ledger row hover with intent. Use Archivo width axis
   (62→125) for kicker→display contrast — it's loaded and unused in the design.
3. **Real T1 tier:** GitHub API (repo/commit facts) + Lighthouse CI output + Playwright run
   counts feed the ledger and hero at build time. Simulated demos stay but keep their
   "SIMULATION OF MY REAL SCRIPT" labels.
4. **Lead magnet:** `/audit` — visitor pastes URL → serverless runs PSI API (+ light checks)
   → scored teardown rendered in the ledger visual language → email-gated full report.
   Rate-limited, honest about what's checked.

## 6. Content ops (blocking before ship)

- Replace `YOUR NAME`, `you@example.com`, placeholder RESUME/GITHUB/LINKEDIN with real values.
- 18 empty `image-slot` frames need real artifacts (screenshots of eval output, CI runs,
  Playwright traces). The site is a shell until these exist. Tier labels must stay accurate.
- 5 writing pieces: 1 published, 4 DRAFT — keep DRAFT tags until real posts exist.
- Contract offers (AI Workflow Build / Test Coverage Sprint / Release Gate Setup): no
  prices — wire BOOK A CALL (Cal.com or /book). Scope copy still needs Sage's sign-off.

## 7. Verification gates (the point of the whole site)

- Lighthouse CI: ≥99 Performance/A11y/Best-Practices/SEO, mobile + desktop, on `/`, `/audit`.
- axe: zero violations. Keyboard-only pass through all 5 interactive demos.
- Playwright: visual snapshots at 320/768/1024/1440; interaction tests per demo
  (grounding verdicts, gate sim completes, anatomy selector keyboard-operable).
- `prefers-reduced-motion` snapshot test: no animation frames.
- Bundle budget: landing ≤150kb JS gzipped (design is CSS/HTML-native — protect that).
- CI writes `proof/site-proof.json` → consumed by hero + ledger (§5.1). Failing gate = failing
  build. The site may never claim a score it didn't earn — same rule as the copy: no invented
  metrics.

## 8. Sequencing

1. Tokens + layout shell + middleware rewrite (verify on dev port with Host header).
2. Static sections (nav, hero static, scan, proof grid, skills, writing, contact, footer).
3. Interactive islands (anatomy, 4 demos, tilt) with a11y built in.
4. Hero GateRunner + site-proof pipeline.
5. Ledger data layer + real artifacts drop-in.
6. `/audit` lead magnet.
7. Gate hardening loop until 99+ everywhere; then domain + ship.
