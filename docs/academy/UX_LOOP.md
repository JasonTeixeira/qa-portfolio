# Sage Academy — UX & Navigation Polish Loop (drive human-appeal to 95–99)

> The `/loop` driver for making the academy genuinely world-class to navigate, learn
> in, and track progress. Its quality gate is **visual + accessible + responsive** —
> each pass the loop *sees its own work* (the screenshot harness) and has a
> design-reviewer agent critique it against the world-class bar. Read this +
> [the scorecard below] at the start of every pass.
>
> Sibling loops: [LOOP.md](./LOOP.md) (the engine), [CONTENT_LOOP.md](./CONTENT_LOOP.md)
> (the courses). This one perfects the *experience*.

## Objective
Drive every human-appeal category in the scorecard to **95–99**: a high-end LMS that's
the easiest thing in the world to navigate — find a course, drop into a lesson, see
progress everywhere, and feel guided. Stop when every category is ≥95 with a clean
visual + a11y + build sweep.

## Operating mode (locked)
- **Obey [LOOP_HARDENING.md](./LOOP_HARDENING.md) every pass** — stable server first
  (`bash scripts/academy/ensure-clean-server.sh`), full-sweep no-regression, decompose big
  deliverables into gated sub-passes, stuck-handling (revert red, escalate stalls), anchored
  scoring (reviewer verdict + objective gates, never self-graded), wiring-dependency policy,
  the review rubric. NON-NEGOTIABLE.
- **Checkpoint:** commit each green pass to the current feature branch (no push), scoped.
- **Cadence:** run to convergence (all categories ≥95 + final design-review clean), then stop.
- **Honor the user's design rules** (`~/.claude/rules/ecc/web/design-quality.md`,
  `performance.md`, `testing.md`): no template look, intentional hierarchy/rhythm/depth,
  compositor-only motion, CWV budgets, breakpoints 320/768/1024/1440.

## The headline deliverables (the gaps → world-class)
Build these; each lifts several scorecard categories at once:
1. **Content / curriculum map** — a visual map of the universe (12 tracks → courses →
   lessons) with prerequisites, done/unlocked state, and a "you are here" marker. Your
   mastery system is already a graph (concept-attachment-map + deep-node prerequisites).
2. **Persistent course-outline sidebar (LEFT rail)** in the lesson player + a learner
   left rail on the dashboard (My Courses · Paths · Review · Community), always showing
   position + checkmarks + a course progress bar.
3. **Supportive RIGHT rail** — up-next, daily-goal ring, streak, and the AI guide entry.
4. **AI tutor / guide** — persistent assistant (dashboard + in-lesson + lab). Answers
   "why is this wrong?", gives lab **hints without solving**, explains a concept, and
   says what to do next. Wire to DeepSeek (already integrated), grounded in the lesson's
   blocks + the mastery deep-nodes.
5. **Progress everywhere** — course progress bars (cards + header), a per-lesson outline
   with %, a skill/mastery heat-map on the profile, a streak calendar, a big persistent
   "Continue where you left off."
6. **⌘K global search** across courses, lessons, concepts.
7. **Lesson notes / highlights** the learner can save.
8. **Mobile/responsive pass** (sprint + lab IDE on a phone) + **empty-state first-run**
   that guides a brand-new learner ("Start with Programming Fundamentals" + the map).

## The per-pass pipeline (one pass = one category/deliverable)
1. **SELECT** — the lowest-scoring category in the scorecard (or the next headline deliverable).
2. **DESIGN** — name the world-class reference pattern; sketch the layout; honor the
   design-quality checklist (≥4 of: hierarchy, rhythm, depth, type, semantic color,
   designed states, editorial composition, motion-with-purpose).
3. **BUILD** — component(s) + wiring; match the existing system (tokens, fonts, the
   academy shell). Files <800 lines; reuse, don't reinvent.
4. **AUTOMATED GATES — all must pass (GREEN):**
   - `npx tsc --noEmit --pretty false` → 0 errors
   - `npx next build` → exit 0
   - render e2e (the surface loads, key elements present) — extend `academy-content.spec.ts`
   - **a11y gate:** `RUN_ACADEMY_A11Y=1 … academy-a11y.spec.ts` → 0 serious/critical
   - **responsive:** the screenshot harness produces no horizontal overflow at 320/768/1024/1440
5. **VISUAL AUDIT (the differentiator):**
   - Capture: `RUN_ACADEMY_SCREENS=1 … academy-screens.spec.ts` → PNGs at 4 breakpoints.
   - **Design/UX reviewer agent** READS the screenshots and scores the surface 1–100
     against: world-class LMS bar, the design-quality checklist, navigation clarity
     ("could a new learner find their lesson + see progress in 5s?"), mobile usability,
     visual hierarchy, empty/loading/error states. Reports gaps with fixes.
   - **Code/a11y reviewer agent** on the diff (component correctness, semantic HTML,
     focus order, keyboard nav, no layout-shift). Fix every CRITICAL + HIGH; re-gate.
6. **RE-SCORE** the category honestly in the scorecard (≥95 only when gates + visual
   audit + a11y all pass and the reviewer agrees it reads world-class).
7. **CHECKPOINT** — scoped commit; update the scorecard ledger.
8. **LOOP or STOP** — exit gate met? → final sweep + report. Else → next.

## Quality gates (your own audit + review)
Functional: typecheck · build · render e2e. Accessible: axe (0 serious/critical) ·
keyboard nav · focus-visible. Responsive: no overflow at the 4 breakpoints. Visual:
the screenshot harness + the design-reviewer agent. Performance: Lighthouse/CWV within
budget on the heavy surfaces (lesson, lab) when they change. A category is **not ≥95**
until the design reviewer, looking at the screenshots, says it reads world-class.

## Exit gate (STOP)
- Every scorecard category ≥95.
- Final full sweep green: typecheck · build · render e2e · a11y (0 serious/critical) ·
  responsive (no overflow) · CWV in budget on lesson + lab.
- A final design-review pass over the whole navigation flow (dashboard → catalog →
  course → lesson → lab → progress) reads world-class, no open CRITICAL/HIGH.
Then: write a convergence report and stop.

## Scorecard ledger (update every pass — baseline 2026-06-26, target 95)
| Category | Now | Target |
|---|---:|---:|
| Visual design / aesthetic | 88 | 95 |
| Gamification / motivation | 90 | 95 |
| Lesson pedagogy (the sprint) | 86 | 95 |
| Course universe / catalog | 85 | 95 |
| Interactive labs | 84 | 95 |
| Course overview / syllabus | 82 | 95 |
| Trust / proof | 80 | 95 |
| Top navigation | 78 | 95 |
| Community | 75 | 95 |
| In-lesson navigation / sidebar | 72 | 95 |
| Onboarding / wayfinding | 70 | 95 |
| Progress visualization | 68 | 95 |
| Empty states / first-run | 62 | 95 |
| Mobile / responsive | 60 | 95 |
| Personalization / adaptivity | 50 | 95 |
| Global search | 45 | 95 |
| Content / curriculum map | 20 | 95 |
| AI tutor / guide | 15 | 95 |
| Notes / highlights | 15 | 95 |

**Highest leverage first:** Content map + persistent progress sidebar (lifts content-map,
in-lesson-nav, progress-viz, top-nav at once) → AI tutor (ai-tutor, onboarding,
personalization, labs) → progress-everywhere → search + notes → mobile + empty-states.

## Guardrails (NON-NEGOTIABLE)
- No fake data/progress/metrics; honest empty/loading/error states.
- No Stripe / prod / `git push`. Scoped commits only (never `git add -A`).
- The dev server (:3040) must be the ONLY Next process — a concurrent build corrupts
  `.next` and breaks the visual/render gates. Pause parallel builds before running.
- Never claim a render/a11y/visual result you didn't run; quote the gate output + cite the screenshot.
- Match the design system; never ship a generic template look (design-quality.md).

## Commands
- Screens:  `RUN_ACADEMY_SCREENS=1 PW_BASE_URL=http://127.0.0.1:3040 node --env-file-if-exists=.env.local scripts/ops/run-playwright.mjs test tests/e2e/academy-screens.spec.ts --config=playwright.e2e.config.ts --project=chromium`
- A11y:     `RUN_ACADEMY_A11Y=1 … tests/e2e/academy-a11y.spec.ts …`
- Build/typecheck: `npx next build` · `npx tsc --noEmit --pretty false`
- Screens land in `/tmp/academy-shots/<surface>-<width>.png` — Read them to review by eye.

## Run it
```
/loop Drive the Sage Academy UX to world-class per docs/academy/UX_LOOP.md. One category
per pass: design → build → typecheck/build/render/a11y/responsive gates → capture the
screenshot harness → 2-agent VISUAL audit (design reviewer reads the screenshots + scores
vs world-class; code/a11y reviewer on the diff) → fix → re-score → scoped commit. Build the
headline deliverables (content map, left/right rails + course-outline sidebar, AI tutor,
progress everywhere, ⌘K search, notes, mobile/empty-states). Stop when every category ≥95
with a clean final sweep. Keep next dev -p 3040 the only Next process running.
```
