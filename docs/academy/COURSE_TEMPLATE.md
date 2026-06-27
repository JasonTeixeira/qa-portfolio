# Sage Academy — Course Template (the world-class lesson standard)

> The canonical pattern every course follows, extracted from the polished **Programming Fundamentals · First
> Steps** module (the reference implementation: `scripts/academy/seed-first-steps.ts`). Built + graded with
> [COURSE_PROGRAM.md](./COURSE_PROGRAM.md). Copy this spec; don't reinvent it.

## The non-negotiables (a lesson isn't world-class without all of these)
1. **15-block sequence, in order** (below). Not a block dump — a deliberate arc from "why" to "proven".
2. **Beginner/prerequisite-correct.** Never use a concept before the lesson that teaches it. Each lesson lists
   what prior concepts it may rely on; the author verifies every block against that list.
3. **A real, guaranteed win.** Every lesson ends with a lab the learner can actually complete, producing a
   concrete success — the dopamine that earns the next lesson.
4. **Labs genuinely verify.** The `check` is an output the learner produces ONLY by doing the real skill; the
   `starter` ends in `# your code here` and alone CANNOT pass. Author MUST execute both (starter fails, correct
   passes) before shipping. Pyodide is non-interactive → operate on in-code data, never `input()`.
5. **One journey, not silos.** Callbacks to prior lessons + forward pulls to the next. The final lesson is a
   capstone that names everything learned and reads as a genuine triumph.
6. **Voice:** sharp, warm, opinionated, zero filler. Every sentence earns its place.

## The 15-block sequence (what each block must achieve)
| # | Block | Its job |
|---|-------|---------|
| 1 | `sprint-contract` | The concrete outcome + the proof + what NOT to claim. `intensity`: micro/standard/deep/capstone. |
| 2 | `mission` | Open on a **real stake or vivid image** in the first sentence. Never "in this lesson you will". |
| 3 | `context` | Why this matters in the bigger arc (what it unlocks) — plain language, no jargon. |
| 4 | `pretest` | Activate intuition with a question whose `reveal` produces a genuine "oh!" (productive failure first). |
| 5 | `concept` | ONE mental model, plain language. The idea, not the syntax tour. |
| 6 | `worked-example` | Fully worked, step by step, with the **common mistake** named. |
| 7 | `code` | One clean, runnable canonical snippet. |
| 8 | `callout` (tip/note) | The genuine **thing pros know that beginners miss** — a real insight, not a restatement. |
| 9 | `lab` | The guaranteed win. `starter` + a real `check`. (See non-negotiable #4.) |
| 10 | `debug` | A broken version with a bug a learner would **actually** make; they find + fix it. |
| 11 | `quiz` | One sharp check-for-understanding + an `explanation`. |
| 12 | `verification` | "Prove it — no vibes": concrete items the learner can confirm they can do. |
| 13 | `teachback` | Prompts to say it back in their own words (the Feynman check). |
| 14 | `transfer` | A genuinely useful application elsewhere — not busywork. The capstone's is the course's closing words. |
| 15 | `spaced-review` | Seeds the FSRS recall prompt so it returns later. |

Valid block shapes are the `LessonBlock` union in `data/academy/sample-course.ts` — author only those.

## What separates 92 from 99 (the polish checklist)
- **Mission** opens on a stake/image, not a syllabus line.
- **Callouts** are real pro-insights, not restatements.
- **Connective tissue:** each mission has a callback ("you printed a line in Lesson 1…") + a forward pull
  ("next you'll make the program decide"). The capstone roll-calls every prior lesson by number.
- **Transfers** are real and useful.
- **Pretest reveal + debug** land as genuine "oh!" moments.
- Cut every hedge, throat-clear, and filler sentence.

## The authoring mechanism (reproducible, idempotent)
- One seed script per course/module: `scripts/academy/seed-<course-or-module>.ts` — mirrors
  `seed-first-steps.ts`: `createClient` from env, `--apply` gate (default dry-run), upsert `academy_courses`
  (on `slug`) + `academy_lessons` (on `course_slug,slug`). Idempotent: re-run any time.
- Columns: `course_slug, slug, title, module_title, module_sort, sort, status:'published', blocks(jsonb), is_free_preview`.
- The reader (`lib/academy/content.ts`) orders by `(module_sort, sort)` — set those for module/lesson order.
- Free-preview floor: the first 1-2 lessons of the on-ramp `is_free_preview: true`; the rest gated.
- Modules are denormalized (`module_title` + `module_sort`) — there is no modules table. Relabel/re-sort by
  UPDATE when restructuring; NEVER change a slug (learner progress + evidence reference slugs).

## The per-lesson gate (GREEN = ship)
- Seed type-checks (`npx tsc --noEmit` → 0) + dry-run parses + lists the expected lessons/blocks.
- Seeds idempotently to the live DB; the lesson **renders** in the player (screenshot, all blocks intact).
- Lab: starter fails, correct solution passes (executed).
- a11y on the lesson page (0 serious/critical); enforcement + journey e2e still green.
- Pedagogy review scores the lesson **≥95** for its target audience (loop the named fixes until it does).

## Course completeness (GREEN = the course ships)
All lessons ≥95 · one coherent start→ship arc with connective tissue · a capstone that synthesizes + celebrates ·
pre/post **assessment spanning every module** · a final whole-course coherence read. Reference: Programming
Fundamentals = Module 1 First Steps (8, polished to 99) → Module 2 Foundations (9, craft).

## Guardrails
Prerequisite-correct. Labs genuinely verify (no theatre checks). Real teaching, not LLM filler. Idempotent
seeds, scoped commits, no push. A lesson is "world-class" only when the pedagogy review says so on the rendered page.
