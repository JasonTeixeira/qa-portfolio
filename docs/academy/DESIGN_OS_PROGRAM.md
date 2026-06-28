# Sage Academy — Design OS Program (autonomous, production-grade visual build)

> The self-running engineering loop for building the academy's **Design Operating System** and rebuilding the
> course's visual layer to a genuinely high-end, interactive standard. Driven the same gated way as
> [ENGAGEMENT_PROGRAM.md](./ENGAGEMENT_PROGRAM.md) + [COURSE_PROGRAM.md](./COURSE_PROGRAM.md). Obeys the ECC web
> rules: design-quality (anti-template), performance, accessibility, security, coding-style.

## What "production-grade, perfect" means here (the bar)
A surface is GREEN only when it passes ALL objective gates AND a design panel scores it ≥95. "Perfect" visual
taste has a subjective ceiling an automated reviewer approximates but a human eye finalizes — so the loop drives
to ≥95 autonomously and **surfaces taste checkpoints** to the operator. No surface ships on the model's taste alone.

## The standing quality gate (every wave — ALL must pass)
1. `npx tsc --noEmit --pretty false` → 0
2. `npx tsx tests/unit/run.mjs` → 0 failures
3. `npx next build` → exit 0
4. **a11y**: `RUN_ACADEMY_A11Y=1 …` → 0 serious/critical, AA contrast, keyboard-operable, **reduced-motion honored**
5. **performance**: Lighthouse/CWV on the changed surface within [performance.md] budgets (LCP<2.5s · CLS<0.1 ·
   INP<200ms · landing JS<150kb gz / CSS<30kb); motion compositor-only (transform/opacity/clip-path), 60fps
6. **visual regression**: full-page screenshots at 320 · 768 · 1024 · 1440; no overflow; both states where relevant
7. enforcement + journey e2e still green (showcase seed = client2 only; client1 untouched)
8. adversarial review on any new write path; **scoped commit, no push, no Co-Authored-By**

## The design panel (the ≥95 gate)
N independent senior product/visual designers score each surface 1-100 against the ECC design-quality
"required qualities" (hierarchy via scale contrast · intentional rhythm · depth/layering · typography with a
real pairing · semantic color · designed hover/focus/active · editorial/bento composition · texture/atmosphere ·
motion that clarifies · data-viz as part of the system) — a surface must demonstrate ≥4 convincingly, with no
banned template patterns. Returns concrete fixes → loop them back in (decaying-return stop: 2 rounds <+2 ⇒ at
the stage ceiling, surface a taste checkpoint, advance).

## Stages
- **Stage 0 — Foundation (taste-gated).** A documented visual DIRECTION (operator's call — not "clean minimal")
  + the token layer: oklch palette + semantic roles, a type scale + a deliberate pairing, spacing rhythm,
  radius, **elevation/depth**, motion durations + easings, texture/atmosphere. Tokens in one CSS layer; a
  reference component proves them. EXIT: tokens defined + a reference surface at ≥95 + operator signs the direction.
- **Stage 1 — Core surfaces.** Rebuild lesson player + course overview + lab to high-end: editorial hierarchy,
  depth, each of the 20 lesson block-types styled with character, distinctive but coherent. EXIT: each surface
  ≥95 + all gates, at every breakpoint.
- **Stage 2 — Interaction & motion.** Reveal/scroll choreography, micro-interactions, the lab as a beautiful
  interactive surface, tasteful sound where it fits — all reduced-motion safe + 60fps. EXIT: ≥95 + perf gate.
- **Stage 3 — Roll out + templatize.** Apply the system across the academy; fold the visual standard into
  [COURSE_TEMPLATE.md](./COURSE_TEMPLATE.md) so every future course inherits it. EXIT: whole-academy coherence ≥95.

## The autonomous loop (one iteration)
1. Read `DESIGN_OS_SCORECARD.md`; pick the lowest unblocked surface in the current stage.
2. Build the wave (file-disjoint parallel agents, using the frontend-design / visual-design-foundations /
   interaction-design skills + the ECC design rules).
3. Standing quality gate. Red → fix in place, do not advance.
4. Design panel. <95 → fold the named fixes back in (loop-until / decaying-return stop).
5. Update the ledger + scoped commit. Report at the boundary.
6. Advance. End the stage when every surface ≥95; then PAUSE for the operator at the stage boundary.

## Autonomy bounds (NON-NEGOTIABLE — what the loop may + may not do alone)
MAY, autonomously: build/edit code + content, run all gates, spawn review agents, loop fixes, make scoped
commits, update the ledger, self-pace to the next wave.
MUST PAUSE + surface to the operator: (a) the **visual-direction** decision and any subsequent **taste** call the
panel can't settle; (b) anything **irreversible/external** — push, deploy, publishing, deleting existing work,
schema-destructive migrations, secrets; (c) a gate that can't go green after 3 rounds; (d) every **stage boundary**.
NEVER: push, deploy, `git add -A`, fabricate a passing gate/score, ship on the model's taste alone, claim a gate
not run.

## Ledger
`DESIGN_OS_SCORECARD.md` — per-surface: design score · gates · stage · status. The loop reads it to choose next
work and records evidence. DONE = every surface ≥95 across all stages + folded into COURSE_TEMPLATE.md + the
operator has signed the direction and the stage boundaries.
