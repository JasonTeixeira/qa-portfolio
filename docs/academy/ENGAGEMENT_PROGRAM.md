# Sage Academy — Engagement Program (drive every category to a *proven* 95–99)

> The master engineering-loop driver. Supersedes [ENGAGEMENT_LOOP.md](./ENGAGEMENT_LOOP.md)
> (Waves 0–5, which took the tuned surfaces to ~91 design-audited). Reads with
> [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md) + [LOOP_HARDENING.md](./LOOP_HARDENING.md).

## What "proven 95" means here (non-negotiable)
A category is **GREEN** only when its exit gate is met by *evidence*, not opinion:
- **Design-proven** (Stage 1): the growth-designer panel scores the populated showcase ≥95 AND the craft gate passes (a11y/perf/60fps).
- **Instrument-proven** (Stage 2): the mechanism emits real events; the metric it targets is defined, queryable, and dashboarded.
- **Behavior-proven** (Stage 3): a live cohort moves the target metric past threshold in an A/B vs. holdout, sustained over the metric's natural window.

No category is claimed ≥95 on design score alone. Design score caps a category at **94 (provisional)** until Stage 3 confirms it. This is the firewall against scoring theatre.

## The standing quality gate (every wave, all must pass = GREEN)
1. `npx tsc --noEmit --pretty false` → 0
2. `npx tsx tests/unit/run.mjs` → 0 failures (pure logic unit-tested before DB/UI)
3. `npx next build` → exit 0
4. a11y: `RUN_ACADEMY_A11Y=1 …` → 0 serious/critical, AA contrast
5. enforcement + journey e2e green (showcase seed touches client2 only, never client1)
6. perf: Lighthouse/CWV on the changed surface within [performance.md] budgets; 60fps on motion
7. adversarial review on any new write path / reward / trigger (server-verified, not client-forgeable)
8. scoped commit, no push, no Co-Authored-By

## The audit + review panels
- **Design panel** (Stages 1–3): N independent growth/retention designers score each surface 1–100 for habit/interaction pull, return concrete fixes. Same harness as Waves 4–5.
- **Engineering review**: `code-reviewer` + `security-reviewer` (+ language reviewers) on every diff; CRITICAL/HIGH block the gate.
- **Metric panel** (Stage 3): replaces the design scorers with real A/B readouts — the panel becomes a query, not an opinion.

## The ledger (resumable state)
`docs/academy/SCORECARD.md` — one row per category: `now | design | instrument | behavior | status`.
Each wave updates it. The loop reads it to pick the lowest-scoring unblocked category next. The program is **done** when every row is `behavior ≥95`.

---

## Stage 1 — Craft to design-proven ≥95 (runnable now)
Close the build-now residuals. Per-category exit: design panel ≥95 + craft gate.
Backlog (highest leverage first):
- **Earn-moment celebration**: full-screen badge/cert reveal + share card; reward beat on every milestone (badges, level, streak tiers, cert). (#3, #6, #12)
- **Micro-interaction + sound/haptic pass**: tasteful sound design, haptics, 60fps device audit, reduced-motion parity. (#6)
- **Tutor companion**: streaming responses + cross-session memory ("last time you stalled on recursion…") + proactive nudges. (#7)
- **Adaptive goal ETA**: re-forecast the goal date from real pace; commitment escalation (calendar/reminder). (#1)
- **Review choreography**: completion reveal, streak-on-review, decay-aware "at-risk" cue. (#11)
- **League escalation**: countdown color-escalates in final 24h; per-row gap deltas. (#8)
Loop: pick lowest design score → build (parallel, file-disjoint agents) → standing gate → reseed + re-screenshot → design panel re-score → if <95, take the named fixes back into the same category; if ≥95 mark `design:95 (provisional)`, advance. Repeat until all twelve `design ≥95`.

## Stage 2 — Measurement spine (instrument-proven)
Precondition for any behavioral claim. Build:
- **Event spine** (Supabase): a typed `academy_events` table + a thin client/server emitter; instrument every loop surface (lesson start/complete, review, streak tick, badge earn, trigger fire/click, league view, tutor turn).
- **Metric tree**: activation (time-to-first-win), D1/D7/D30 return, streak survival curve, review adherence, lesson-completion, session frequency — defined as SQL, materialized.
- **Dashboards**: one queryable surface per metric; a north-star + guardrails (e.g. don't trade integrity for engagement).
Exit: every Stage-1 mechanism emits real events; each category's target metric is queryable + dashboarded. Mark `instrument:✓`.

## Stage 3 — Behavior-proven ≥95 (reality-gated)
The honest wall. Build the machinery now; the gates go green only on live data.
- **Experiment harness**: assignment + holdouts + a results query that reads significance; the loop's scorer becomes this query.
- **Per-user trigger timing**: learn each learner's at-risk hour from their activity histogram; fire push/email then; measure reactivation.
- **FSRS tuning**: optimize review parameters on real review logs.
- **Real social/competition**: leagues fill with real humans; social proof accrues from real graduates; rarity from a real population.
Exit per category: A/B beats holdout past threshold, sustained over the metric window. **Until a real cohort exists these gates are RED and the loop PARKS them — it does not fake-green and does not block Stages 1–2.** When data flows, the loop auto-resumes on the parked categories.

---

## The driver (how it iterates)
Each iteration:
1. Read `SCORECARD.md`; pick the lowest unblocked category (skip behavior-gates with no data).
2. Run the stage-appropriate build wave (file-disjoint parallel agents).
3. Standing quality gate. Red → fix in place, do not advance.
4. Audit/review panel (design now; metric in Stage 3). Below threshold → fold the named fixes back into the same category (loop-until, decaying-return stop: 2 rounds with <+2 lift ⇒ category is at its current-stage ceiling, advance + record).
5. Update `SCORECARD.md` + scoped commit. Report at the boundary.
6. Stop when every category is `behavior ≥95`, OR when all non-reality-gated work is GREEN and only behavioral gates remain (then park + await data).

## Guardrails (NON-NEGOTIABLE)
Obey [LOOP_HARDENING.md]. No theatre, no fabricated data or metrics (the seed learner is a labelled fixture). Rewards/badges/quests/XP/metrics server-verified, never client-forgeable. Scoped commits, no push, no Stripe/prod without authorization. Never claim a gate not run. A category at design-95 is **provisional** until behavior confirms — say so.
