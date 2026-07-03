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

## Phase plan
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
| Courses | Sage Courses | queued |
| Course landing | Sage Course Landing | queued |
| Lesson Player | Sage Lesson Player | queued |
| Dashboard | Sage Dashboard Cockpit | queued |
| Pricing | Sage Pricing | queued |
| How It Works | Sage How It Works | queued |
| Progress / Leagues / Certificate / Auth / Checkout / Settings / About | (respective) | queued |
