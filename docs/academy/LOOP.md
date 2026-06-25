# Sage Academy — Autonomous Build Loop (convergence driver)

> The executable driver for a `/loop` run. Read this + [GROWTH_ENGINE.md](./GROWTH_ENGINE.md)
> (the scorecard) + [BUILD_AND_TEST_PLAN.md](./BUILD_AND_TEST_PLAN.md) (the phase plan)
> at the start of every pass. This file is the source of truth for the loop's
> objective, pipeline, guardrails, and stop condition.

## Objective
Drive every **buildable** growth-engine dimension to **95–99**, verified by tests +
adversarial audit, and keep it there. Stop at the exit gate. Do not pad scores.

## Operating mode (locked by operator, 2026-06-25)
- **Checkpoint:** commit each GREEN pass to the current feature branch. **No push.**
- **Scope:** all buildable dims + the *mechanisms* for gated dims that don't need
  content/Stripe (analytics/CURR dashboard, adaptive FSRS, badges, full index pass,
  Discord role-sync mechanism). Leave content (10) + monetization (13) to the operator.
- **Cadence:** run to convergence, then STOP (don't re-loop once the gate is met).

## Guardrails (NON-NEGOTIABLE)
1. **Never fabricate** data, courses, quiz questions, scores, metrics, or users to hit a
   number. Honest "collecting / blocked / empty" states only. A dim is ≥95 only when its
   *mechanism* is complete, tested, and audit-clean — not when a number is faked.
2. **Never** touch Stripe, production, or `git push`. No outward-facing actions.
3. **Operator-gated — DO NOT attempt:** dim 10 (content — operator authors via
   `/academy-admin`), dim 13 (monetization — Stripe 2FA-locked). Do not stub fake
   content or fake payment flows. Leave the wiring intact; verify it the moment content lands.
4. **Scoped commits only.** `git add <explicit paths this pass touched>` — NEVER
   `git add -A` / `git add .`. The branch has unrelated pre-existing dirty files
   (book/contact/founder/showcase/discord) that are NOT ours — never stage them.
5. **Never claim verification not run.** Every "done" is backed by a passing gate, quoted.
6. Match existing conventions; pure logic in `*-logic.ts` (unit-testable) before DB/UI.
   Files <800 lines, functions <50, immutable updates, RLS + service-role anti-cheat.

## The per-pass pipeline (one iteration)
1. **SELECT** — read the ledger below; pick the lowest-scoring buildable dim, OR the
   highest-severity open finding from the last audit. One focused target per pass.
2. **RESEARCH** — GitHub code search + Context7/vendor docs for a proven pattern before
   writing net-new code. Prefer adopting over inventing.
3. **BUILD** — migration (via Supabase MCP `apply_migration` + persist the SQL to
   `supabase/migrations/NNNN_*.sql`) → pure logic → DB layer → server actions → UI.
4. **TEST** — add unit tests to `tests/unit/run.mjs` (pure logic, edge cases) + a
   Playwright e2e to `tests/e2e/academy-*.spec.ts` (gating + real-pipeline render via
   service-role-arranged state; the in-dev client-action submit is HMR-flaky — assert
   server/read paths, not the flaky optimistic toggle).
5. **GATE — all must pass = GREEN:**
   - `npx tsc --noEmit --pretty false` → 0 errors
   - `npx tsx tests/unit/run.mjs` → 0 failures
   - academy e2e suite (dev server on :3040, `.env.local` loaded) → all pass
   - `npx next build` → exit 0 (run when routes/edge/runtime change, else at least once/pass)
6. **AUDIT** — dispatch 2 adversarial agents in parallel (`security-reviewer` +
   `code-reviewer`) scoped to this pass's diff. Fix every CRITICAL + HIGH before moving on.
   Re-run the gate after fixes.
7. **RE-SCORE** — update the ledger + GROWTH_ENGINE.md honestly with evidence
   (test counts, what's done, what remains).
8. **CHECKPOINT** — scoped commit of this pass's files. Conventional message, no push,
   no Co-Authored-By (attribution disabled per operator config).
9. **LOOP or STOP** — exit gate met? → STOP + final report. Else → next pass.

## Exit gate (STOP condition)
Stop when ALL hold:
- Every **buildable** dimension is **≥95** in the ledger.
- A final full-suite run is green (typecheck + unit + every academy e2e + `next build`).
- A final adversarial audit has **no open CRITICAL/HIGH**.
- The only dims <95 are the operator-gated ones (10 content, 13 monetization), each with
  an honest blocked note.
Then: write a convergence report and **do not re-loop**.

## Buildable backlog (drive these — lowest leverage-adjusted first)
- **14 · Scale infra (70→95):** full 199-FK index audit + missing indexes (migration);
  `EXPLAIN` the hot academy queries; document Upstash as a key-gated flip.
- **11 · Personalization (32→95):** adaptive FSRS — per-user difficulty from calibration
  level + grade history; serve harder/easier review cards. Pure selection logic + tests.
- **15 · Analytics/CURR (28→95):** CURR (Current-User Retention Rate) + cohort-retention
  computation (`lib/academy/metrics.ts`) + internal `/academy-admin/metrics` dashboard;
  wire PostHog events at every funnel step (events fire pre-data; dashboard shows honest
  "collecting" until n is meaningful).
- **9 · Community (90→95):** Discord identity-linked role-sync on enroll — build the
  account-link mechanism + sync hook (activates when a learner links Discord OAuth).
- **4 · Gamification (94→95):** achievement badges (definitions + award rules + display).
- **1 · Pedagogy (78→90+):** tighten the Learning-Engine where mechanism-improvable
  (spaced-review surfacing, mastery gates) without inventing content.
- **Hardening backlog (`TODO(scale)` in code):** atomic XP increment RPC
  (`addLeagueXp`, `recordActivityAndAward`, `awardBonusXp`); atomic first-completion
  claim in `markLessonComplete`; batch the streak-reminder N+1.
- **Phase 6 capstone:** full end-to-end journey e2e (signup→onboarding→learn→streak→
  review→refer→cert/portfolio→leagues→community); axe a11y + Lighthouse/CWV ≥95 sweep on
  every academy surface; final security re-audit; full 15-dim re-score.

## Gated — DO NOT attempt (operator owns these)
- **10 · Content depth:** operator authors ≥3 real courses + their pre/post jsonb via
  `/academy-admin`. The slot is fully wired (XP/FSRS/leagues/referral/gain/certs/portfolio
  attach by `course_slug`). Loop verifies the loop end-to-end the moment a course lands.
- **13 · Monetization:** Stripe code-complete behind `ACADEMY_GATE_ENABLED`; 2FA-locked.

## Ledger (update every pass — current 2026-06-25)
| # | Dimension | Score | State |
|---|---|---|---|
| 1 | Pedagogy / Learning Engine | 78 | buildable — improve mechanism |
| 2 | Onboarding | 95 | ✅ done |
| 3 | Habit loop | 96 | ✅ done |
| 4 | Gamification depth | 94 | buildable — badges remain |
| 5 | Spaced repetition | 95 | ✅ done |
| 6 | Notifications | 95 | ✅ mechanism (delivery needs VAPID/RESEND keys) |
| 7 | Shareability | 95 | ✅ done |
| 8 | Referral | 95 | ✅ done |
| 9 | Community | 90 | buildable — Discord role-sync remains |
| 10 | Content depth | 12 | 🔒 OPERATOR (author courses) |
| 11 | Personalization | 32 | buildable — adaptive FSRS |
| 12 | Proof / efficacy | 95 | ✅ done |
| 13 | Monetization | 20 | 🔒 OPERATOR (Stripe locked) |
| 14 | Scale infra | 70 | buildable — full index pass |
| 15 | Analytics / CURR | 28 | buildable — CURR dashboard + events |

## Command reference
- Unit: `npx tsx tests/unit/run.mjs`
- Typecheck: `npx tsc --noEmit --pretty false`
- E2E (needs `next dev -p 3040` running + `.env.local`):
  `PW_BASE_URL=http://127.0.0.1:3040 node --env-file-if-exists=.env.local scripts/ops/run-playwright.mjs test tests/e2e/academy-habit.spec.ts tests/e2e/academy-leagues.spec.ts tests/e2e/academy-proof.spec.ts tests/e2e/academy-assessment.spec.ts tests/e2e/academy-referral.spec.ts tests/e2e/academy-community.spec.ts --config=playwright.e2e.config.ts --project=chromium`
- Build: `npx next build`
- Supabase project: `hocrntqhgvmeaxwlhzwl` (via Supabase MCP). Migrations numbered ≥0104.

## Notes for the runner
- If the e2e dev server (:3040) or `.env.local` is unavailable, fall back to
  typecheck + unit + build, and LOG that e2e was skipped (don't claim it ran).
- Cache discipline: self-pace wake-ups at <270s (warm) or ≥1200s (cold) — never the
  300–1200s dead band.
- Keep the ledger + GROWTH_ENGINE.md the single source of truth; update both each pass.
