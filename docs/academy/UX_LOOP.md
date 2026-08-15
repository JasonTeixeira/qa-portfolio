# Sage Academy — UX + Loop-Enforcement Loop (drive human-appeal to 95–99)

> The `/loop` driver for making the academy genuinely world-class to navigate, learn in,
> and track progress — **and for making the canonical loop real product logic, not pages.**
> Its quality gate is **visual + accessible + responsive + evidence-enforced** — each pass
> the loop *sees its own work* (the screenshot harness) and has a design-reviewer agent
> critique it against the world-class bar. Read this + [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md)
> (§10 enforcement contract + §12 the last 5 points) + [the scorecard below] every pass.
>
> Sibling loops: [LOOP.md](./LOOP.md) (the engine), [CONTENT_LOOP.md](./CONTENT_LOOP.md)
> (ingest the courses). This one perfects the *experience* **and enforces the loop**.
>
> **Why these are one loop:** the runtime-enforcement deliverables in PLATFORM_ARCHITECTURE
> §10/§12 ARE UX surfaces — the AI guide is also the *grader* that makes explain-back count;
> the mastery map is also *evidence-visibility*; the lesson-gate UI is the *8-state machine*;
> the board-review surface is the *spaced scheduler*. Building the UX = enforcing the loop.

## Objective
Drive every human-appeal **and** loop-enforcement category in the scorecard to **95–99**: a
high-end LMS that's the easiest thing in the world to navigate (find a course, drop into a
lesson, see progress everywhere, feel guided) AND that **enforces** the canonical loop —
nothing completes on "I read it," evidence is real, score caps bind, the habit loop runs.
Stop when every category is ≥95 with a clean visual + a11y + build + evidence-gate sweep.

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

### Loop-enforcement deliverables (PLATFORM_ARCHITECTURE §10 + §12 — same work, now owned here)
These turn the loop into product logic. Each is BOTH a UX surface and an enforcement mechanism:
9. **Evidence-gated completion + the 8-state machine** — a unit moves locked → ready →
   in-progress → proof-pending → review-pending → repair-required → transfer-due → complete
   **only on real EvidenceEvents** (the 11 events). The "Complete" affordance is disabled
   until evidence exists; the gate UI *is* the state machine. No "mark done."
10. **Score-cap engine, visible** — the unit/course score is the **minimum** of all V3/Board/§12
    caps; the UI shows *why* it's capped ("+ verify your build to lift 78 → 82"). Caps bind,
    and the learner can see the path to lift them. This is the anti-fake spine made legible.
11. **AI guide as GRADER (not just helper)** — beyond hints/explain/next-step, the guide
    **grades the explain-back / oral defense** and writes the EvidenceEvent. Closed-note
    retrieval; **confidence captured before the answer**. Without this, explain-back is a click,
    not evidence — so the AI guide is load-bearing for §12's genuine-evidence contract.
12. **Board-style spaced scheduler** — the right-rail "Review" surfaces due recall cards /
    error-log repairs (FSRS) and writes `repair_*`/`transfer_*` events. This is the Board layer
    (§6) made into a returning surface — and the Investment beat of the habit loop.
13. **Disengagement-recovery path (§12.5)** — failing a gate routes to the **repair queue with
    a scaffolded on-ramp + re-engagement nudge**, never a dead end. "Repair, don't punish."
14. **Course 00 onboarding-to-the-loop (§12.3)** — first-run teaches the 5-beat method itself,
    so the habit forms day one (subsumes deliverable 8's empty-state into a real first course).
15. **Measurement surfaces (§12.2)** — wire the EvidenceEvents to the metrics (CURR, Hake's
    mastery-gain `g`, beat-level funnel, confidence calibration) and show them on
    `/academy-admin/metrics` (honest "collecting" until n is real). 98–99 stays gated on this data.

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
   - **evidence-gate (for enforcement passes):** an e2e that proves a unit will NOT complete
     without its required EvidenceEvents, the score cap binds to the missing-evidence minimum,
     and a forced gate-failure routes to the repair queue (not a dead end). A unit-test on the
     state-machine + cap-resolver logic (`*-logic.ts`) precedes the DB/UI per LOOP_HARDENING.
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
- Every scorecard category ≥95 (experience **and** loop-enforcement).
- Final full sweep green: typecheck · build · render e2e · a11y (0 serious/critical) ·
  responsive (no overflow) · CWV in budget on lesson + lab · **evidence-gate e2e** (no
  completion without evidence · caps bind · gate-failure → repair queue).
- A final design-review pass over the whole navigation flow (dashboard → catalog →
  course → lesson → lab → progress) reads world-class, no open CRITICAL/HIGH.
- The canonical loop is **enforced**: a unit demonstrably cannot be faked, the AI guide
  grades explain-back into real evidence, and the §12 contract is present on every course.
Then: write a convergence report and stop. (98–99 remains gated on real learner outcomes.)

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
| **— Loop-enforcement (§10/§12) —** | | |
| Evidence-gating + 8-state machine | 30 | 95 |
| Score-cap engine (visible, binding) | 25 | 95 |
| AI guide as grader (genuine evidence) | 10 | 95 |
| Board-style spaced scheduler (surface) | 25 | 95 |
| Disengagement-recovery / repair queue | 15 | 95 |
| Course 00 onboarding-to-the-loop | 10 | 95 |
| Measurement surfaces (CURR / gain / calibration) | 28 | 95 |

**Highest leverage first:** Evidence-gating + 8-state machine + score-cap engine FIRST (they
are the spine the whole canon rests on; without them everything else is decoration) → AI guide
as grader (unlocks genuine evidence + ai-tutor + onboarding) → content map + persistent progress
sidebar + mastery map (content-map, in-lesson-nav, progress-viz, evidence-visibility at once) →
board scheduler + repair queue → measurement surfaces → progress-everywhere → search + notes →
mobile + empty-states + Course 00.

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
/loop Drive the Sage Academy UX + loop-enforcement to world-class per docs/academy/UX_LOOP.md.
One category per pass: design → pure logic (*-logic.ts) → build → typecheck/build/render/a11y/
responsive/evidence-gate gates → capture the screenshot harness → 2-agent audit (design reviewer
reads the screenshots + scores vs world-class; code/a11y reviewer on the diff) → fix → re-score
→ scoped commit. ENFORCEMENT FIRST (evidence-gating + 8-state machine + score-cap engine + AI
guide as grader — PLATFORM_ARCHITECTURE §10/§12), THEN the experience layer (content map, mastery
map, left/right rails + course-outline sidebar, progress everywhere, board scheduler + repair
queue, ⌘K search, notes, mobile/empty-states, Course 00). Stop when every category ≥95 with a
clean final sweep. Keep next dev -p 3040 the only Next process running.
```
