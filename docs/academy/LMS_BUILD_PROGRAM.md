# Sage Academy — Full LMS Build Program (autonomous, gated)

> The self-running program to turn the 21-course AI-career curriculum (`/Users/Sage/AI_CAREER_OPERATING_SYSTEM`)
> into a genuinely high-end, mobile-ready LMS. Driven the same gated way as the other programs. Source of truth for
> the IA: [NAVIGATION_AUDIT.md](./NAVIGATION_AUDIT.md). Lesson quality bar: [COURSE_TEMPLATE.md](./COURSE_TEMPLATE.md).
> Visual standard: [DESIGN_OS_PROGRAM.md](./DESIGN_OS_PROGRAM.md) (editorial dark-luxury, zero emoji, the Icon system).

## The source
`/Users/Sage/AI_CAREER_OPERATING_SYSTEM/courses/[0-9]*/course_manifest.json` — **21 courses · 105 modules · 286
lessons** (13 written, 8 scaffolded). Manifest → academy mapping: `canonical_slug`→slug, `title`→title,
`promise`→subtitle, `canonical_course_number`→sort, `lesson_count`→lessons; `modules/` dirs → module_title/sort;
lesson `.md` → academy_lessons (title + `LessonBlock[]`). Course 00 is the entry gate (curriculum_architecture).

## The standing gate (every wave — ALL must pass = GREEN)
`tsc --noEmit` 0 · `tsx tests/unit/run.mjs` 0 · `next build` 0 · a11y 0 serious/critical (AA, keyboard,
reduced-motion) · perf within budgets · enforcement+journey e2e green · zero-emoji scan clean · scoped commit, no
push. Surface changes also: design-panel ≥95 + visual-regression at 320/768/1024/1440.

## The 4 steps (build order)
1. **The rails (IA consolidation + scaling).** Retire/redirect the legacy `/[track]/*` to the canonical Courses
   model; fold `my-courses` into the catalog. Rename the menu → **Home · Courses · My Path · Practice · Profile**;
   fix `active` keys; add breadcrumbs (Catalog › Course › Lesson). **Catalog groups 21 courses by domain** +
   prereq order (00 gates). **Lesson left-rail → collapsible Module→Lesson tree** (the course side-menu). Promote
   `ContentMap` → first-class **/progress "My Path"** map (where you are, what's next, certs). **Mount a responsive
   mobile bottom TabBar** (top bar ≥ md, bottom tabs < md; ≥44px targets; per-tab back stack).
2. **Skeleton-ingest all 21 courses.** `scripts/academy/ingest-career-os.ts` (idempotent, --apply) reads the 21
   manifests + module/lesson files → upserts academy_courses (domain via `topic`, sort = course #) + academy_lessons
   stubs (title + a minimal real block from source). Result: the whole pipeline is walkable end-to-end.
3. **Tutor KB ingest.** Run/extend the KB pipeline (`scripts/academy/ingest-kb.ts`) over the ingested lessons so
   Sage Tutor (right rail, RAG) can answer about the real course material.
4. **Phase-B world-class transformation.** Course by course (00 first), transform each lesson's source into the
   full 15-block format with real labs (Pyodide for coding courses; tradeoff/calibration/debug/verification for
   non-coding), per COURSE_TEMPLATE. Each lesson loops to a pedagogy ≥95; each course = a gate boundary (PAUSE).

## The loop (one iteration)
Read `LMS_BUILD_SCORECARD.md` → pick the next unblocked task in the current step → build (file-disjoint parallel
agents) → standing gate → (surface) design panel ≥95 / (lesson) pedagogy ≥95, loop fixes (decaying-return stop) →
update the ledger + scoped commit → report at the boundary.

## Autonomy bounds (NON-NEGOTIABLE)
MAY autonomously: build/edit code+content, run all gates, spawn agents, loop fixes, scoped commits, self-pace.
MUST PAUSE + surface: (a) any visual/taste decision the panel can't settle; (b) anything irreversible/external —
**push, deploy, deleting existing work, schema-destructive ops, secrets**; (c) a gate stuck after 3 rounds; (d)
every STEP boundary and every COURSE boundary in Phase B. NEVER: push, deploy, `git add -A`, fake a gate/score,
ship on the model's taste alone, claim a gate not run, or modify the source curriculum at `/Users/Sage/AI_CAREER_OPERATING_SYSTEM`
(read-only).

## Ledger
`LMS_BUILD_SCORECARD.md` — per task/course: status · gates · score. DONE = all 21 courses ingested + transformed
to ≥95, the rails complete (desktop top-bar + mobile bottom-tab, module-tree rail, /progress map), the tutor KB
covers the material, and the whole pipeline walks clean on desktop + mobile.
