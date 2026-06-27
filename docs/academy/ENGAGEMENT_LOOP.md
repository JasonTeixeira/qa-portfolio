# Sage Academy — Engagement Engine Loop (drive human appeal 76 → 95–99)

> The `/loop` driver for making the engagement infrastructure (habit loop + interaction loop +
> gamification + progress + trust) the highest-human-appeal, **content-agnostic** machine — so any
> course dropped in is instantly sticky. Reads with [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md)
> (§3 the habit loop) + [LOOP_HARDENING.md](./LOOP_HARDENING.md).

## Objective
Drive every engagement category to **95–99**, verified by the QA gates + a design-reviewer
engagement audit scored against a POPULATED showcase learner (not an empty account). Content-agnostic:
no course authoring — only the mechanisms that make the loop irresistible.

## The harness (so we build/tune against a visible target, not an empty account)
- `scripts/academy/seed-demo-learner.ts` — populates a showcase account (default client2+test, NOT
  client1 which the enforcement/journey e2e depend on being evidence-empty) with realistic coherent
  data: streak, XP/level, daily goal, completed lessons + evidence (lit mastery), a certificate,
  pre/post (Hake's g), due reviews, league standing, a friend. Idempotent. THE harness — every loop
  surface shows full so we can see + tune it.
- `tests/e2e/academy-screens.spec.ts` (client2Page) → screenshots the populated surfaces.
- Engagement audit: a design-reviewer scores each surface 1-100 specifically for habit/interaction
  appeal (not just aesthetics) and returns concrete fixes — the loop's scoring gate.

## The engagement scorecard (baseline 2026-06-27 → target 95)
| # | Category (mechanism, content-agnostic) | Now | Target |
|---|---|---:|---:|
| 1 | Goal-setting + "Your Journey" progress-to-goal hero | 35 | 95 |
| 2 | Onboarding → guaranteed first-win | 65 | 95 |
| 3 | Achievements / badges / milestone moments | 30 | 95 |
| 4 | Quests (daily/weekly) + variable reward | 40 | 95 |
| 5 | In-app trigger engine (streak-risk · reviews-due · near-cert · win-back) | 45 | 95 |
| 6 | Micro-interaction layer (count-ups · smooth fills · sound · haptics) | 40 | 95 |
| 7 | Tutor as companion (streaming · memory · proactive) | 70 | 95 |
| 8 | Streaks / XP / levels / leagues (core gamification) | 82 | 95 |
| 9 | Progress visibility / mastery map | 85 | 95 |
| 10 | Trust / proof / social proof surfaces | 80 | 95 |
| 11 | Spaced-review as a daily ritual | 78 | 95 |
| 12 | Emotional hook / delight / want-to-return | 78 | 95 |

## The waves (build order — each is a loop-completing increment)
- **Wave 0 — Harness:** seed-demo-learner + the engagement audit. (enabler)
- **Wave 1 — Habit spine:** goal-setting (commitment device) + "Your Journey" progress-to-goal hero
  + onboarding → guaranteed first-win flow. (#1, #2)
- **Wave 2 — Variable reward:** achievements/badges + milestone celebration moments (streak 7/30/100,
  course complete, first cert) + quests + variable-reward sprinkles. (#3, #4)
- **Wave 3 — Trigger + interaction:** the in-app trigger engine (the loop's entry) + the
  micro-interaction layer (count-ups, smooth fills, tasteful sound, haptics) + tutor streaming/memory/
  proactive nudges. (#5, #6, #7)
- **Wave 4 — Polish to 95–99:** the engagement audit per surface → fix loop, on the populated learner.

## The per-wave QA gate (all must pass = GREEN)
- `npx tsc --noEmit --pretty false` → 0 errors
- `npx tsx tests/unit/run.mjs` → 0 failures (pure logic: goal math, badge rules, quest rules, trigger
  eligibility, the variable-reward selection — all unit-tested before DB/UI per LOOP_HARDENING)
- `npx next build` → exit 0
- a11y: `RUN_ACADEMY_A11Y=1 …` → 0 serious/critical (new surfaces included)
- the enforcement + journey e2e still green (the showcase seed must NOT touch client1)
- screenshots on the POPULATED showcase + the design-reviewer engagement audit scores the surface ≥95
- adversarial review on any new write path / trigger / reward (anti-cheat: rewards/badges/quests must
  be server-verified, not client-forgeable — same discipline as the evidence spine)

## Exit gate (STOP)
Every scorecard category ≥95 on the populated showcase · full sweep green · a final engagement audit
over the whole loop (land → goal → first-win → lesson → reward → trigger → return) reads
irresistible. 98–99 remains gated on real-learner retention data (per PLATFORM_ARCHITECTURE §5).

## Guardrails (NON-NEGOTIABLE)
- Obey [LOOP_HARDENING.md](./LOOP_HARDENING.md). No fake data in the PRODUCT (the seed learner is an
  explicit, labelled showcase fixture, not shipped user-facing fake data).
- Rewards/badges/quests/XP are SERVER-VERIFIED (never client-forgeable) — anti-cheat parity with the
  evidence spine. Scoped commits, no push. Never claim a gate not run.
