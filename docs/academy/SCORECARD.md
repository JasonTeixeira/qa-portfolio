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
| 6 | Micro-interaction layer | 89 | n/a | — | Stage 1 (EarnMoment system + GPU primitives; 89→cap: hero/overlay state + reward-magnitude hierarchy) |
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

## Stage 3 — behavioral proof: REALITY-GATED (await live cohort, never fake-green)
The metric views exist and return data; D1/D7/D30 retention, streak survival, and activation become
*meaningful* only with real signups over real calendar time. The experiment harness (assignment + holdouts)
is the remaining build; its gates stay RED until a live cohort moves a metric vs holdout.

Next unblocked Stage-1 design polish: the 88–90 cluster (#1, #3, #5, #9, #11) + the 2 named rounds to lift
#4/#2/#6 to the 94 cap. Reality-gated (do not fake-green): **#10, #12**, behavioral half of **#5, #8, #11**.
