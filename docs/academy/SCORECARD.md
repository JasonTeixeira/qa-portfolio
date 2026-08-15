# Engagement Scorecard — the loop's resumable ledger

> Driven by [ENGAGEMENT_PROGRAM.md](./ENGAGEMENT_PROGRAM.md). The loop reads this each
> iteration, builds the lowest unblocked category, and updates the row.
> `design` = growth-panel score (caps at 94 provisional). `instrument` = emits real
> events + metric queryable. `behavior` = A/B beats holdout, sustained. A category is
> GREEN only at `behavior ≥95`. Updated through Wave 5 (design-audited on the showcase).

| # | Category | design | instrument | behavior | status |
|---|---|---:|:---:|:---:|---|
| 1 | Goal / Journey hero | 88 |  ✓ | — | Stage 1 |
| 2 | Onboarding → first-win | 88 | wired | — | Stage 1 (guaranteed real first-win step; 88→cap: more peak-moment + identity line) |
| 3 | Achievements / badges | 90 |  ✓ | — | Stage 1 |
| 4 | Quests + variable reward | 89 | wired | — | Stage 1 (89→cap: +countdown/tomorrow-tease; real idempotent XP award + claim ledger live) |
| 5 | In-app trigger engine | 90 |  ✓ | — | Stage 1 → behavior-gated |
| 6 | Micro-interaction layer | 91 | n/a | — | near design cap · irresistible (EarnMoment hero-moment + magnitude hierarchy + amplified figure) |
| 7 | Tutor companion | 94 | wired | — | **at design cap** (streaming + cross-session memory + proactive opener + tap-to-resume; irresistible) |
| 8 | Streaks / XP / leagues | 93 |  ✓ | — | Stage 1 → needs real opponents |
| 9 | Progress / mastery | 90 |  ✓ | — | Stage 1 (content-gated) |
| 10 | Trust / proof / social | 86 | — | — | behavior-gated (real graduates) |
| 11 | Spaced-review ritual | 88 |  ✓ | — | Stage 1 → behavior-gated (FSRS tune) |
| 12 | Emotional hook / return | 90 |  ✓ | — | behavior-gated (IS the D7 metric) |

**Full 12-category design avg: ~89** (was 76). Worked categories sit at/near the 94 design cap.

## Stage 2 — instrumentation spine: LIVE (verified 2026-06-27)
`academy_events` (0111) + 5 metric views (0112: user_journey, activation, daily_active, event_funnel,
retention D1/D7/D30) + a typed best-effort emitter (`lib/academy/events.ts`). 7 surfaces instrumented:
lesson_completed · review_completed · badge_earned · bonus_claimed · goal_set · first_win · tutor_turn.
PROVEN end-to-end: grading a real review fired one `review_completed` (funnel + DAU read it; props PII-free
`{grade:"good"}`). Writes service-role only (own-read RLS); views revoked from app roles. So the behavioral
metrics are now QUERYABLE — they just need real cohort volume to become statistically meaningful.

## Stage 3 — experiment harness: BUILT, honestly RED (await live cohort, never fake-green)
`lib/academy/experiments-logic.ts` (pure): deterministic 50/50 assignment (MurmurHash-finalized FNV — fixed a
mixing defect so experiments randomize independently), a pooled two-proportion z-test (matches textbook
z=3.0016/p=0.0027), and `experimentVerdict` with a HARD insufficient-data guard (<100/arm → never claims a
win, even at 100% vs 0%). `lib/academy/experiments.ts`: 4 declared experiments mapping the behavior-gated
categories (#5 trigger→D1, #8 streak-jeopardy→D7, #11 review-ritual→D7, #12 hook→D7) to a metric + converted
event; `getExperimentReadout` buckets the live cohort and runs the verdict off the event spine. On today's
~0 cohort it returns `insufficient_data` by construction — the gates CANNOT go green without ~200+ real
signups + calendar time. That is the honest terminal wall: a *proven* 95–99 is one live cohort away, not one
more screenshot. Remaining build: an admin panel rendering `listExperimentReadouts()` behind the existing gate.

Next unblocked Stage-1 design polish: the 88–90 cluster (#1, #3, #5, #9, #11) + the 2 named rounds to lift
#4/#2/#6 to the 94 cap. Reality-gated (do not fake-green): **#10, #12**, behavioral half of **#5, #8, #11**.
