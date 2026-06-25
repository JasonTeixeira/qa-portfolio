# Sage Academy — Build & Test Plan (the 95–99 task document)

> Executable companion to [GROWTH_ENGINE.md](./GROWTH_ENGINE.md). Every phase has
> **Deliverables → Engineering → Testing → Exit gate**. A phase is not "done"
> until its dimensions are re-scored **≥95** with a **green Playwright e2e** proving
> the loop works for a real user, plus a live browser verification. Check boxes as
> we go.

## Global testing strategy
- **Unit** (vitest/node): pure logic — streak math, XP→level, FSRS scheduling,
  Hake's g, referral attribution, league ranking, notification eligibility.
- **Integration**: server actions + DB (RLS, upserts, idempotency) against a test
  Supabase branch.
- **E2E** (Playwright): real user journeys; one named scenario per dimension below.
- **Load** (k6): hot paths at the 50k profile (Phase 6).
- **A11y / CWV**: axe + Lighthouse on every academy surface (≥95 a11y).
- **Security**: review-agent pass on every surface with user input or public output
  (referral, profiles, notifications).

## Definition of Done (per dimension)
`spec → migration → build → unit + integration tests green → Playwright e2e green →
verified live in browser → re-scored ≥95`. If <95, iterate before advancing.

## North Star instrumentation (wired incrementally, audited in P5)
Emit PostHog events at every step from day one: `signup`, `onboarding_step`,
`first_aha`, `lesson_complete`, `lab_pass`, `quiz_complete`, `streak_increment`,
`review_session`, `referral_sent/converted`, `upgrade`. North Star = **CURR**.

---

## Phase 0 — Foundation finish (content + money)  → dims 10, 13
**Deliverables**
- [ ] ≥3 real courses authored end-to-end and live (catalog → course → lesson → lab → quiz all walkable).
- [ ] Stripe live: academy all-access product + $20/mo + $200/yr prices; webhook; `ACADEMY_GATE_ENABLED=true`.

**Engineering**
- [ ] Operator drops Stripe OPE5 secret key into `.env.local` (`STRIPE_SECRET_KEY`) + Vercel.
- [ ] Create product + monthly/yearly prices via Stripe API → set `STRIPE_PRICE_ACADEMY_ALLACCESS_MONTHLY/YEARLY` (local + Vercel).
- [ ] Register webhook endpoint (`/api/stripe/webhook`) → set `STRIPE_WEBHOOK_SECRET`.
- [ ] Flip `ACADEMY_GATE_ENABLED=true`; resolve the two-account price split (care/App-Dev → OPE5 or quarantine).
- [ ] Author the operator's real courses via `/academy-admin` (uses the proven studio + Learning Engine scaffold).

**Testing**
- [ ] Unit: `lib/academy/plans.ts` price resolution; `membership.ts` upsert from subscription.
- [ ] Integration: webhook `checkout.session.completed (academy_allaccess)` → `academy_allaccess_subscriptions` row; idempotent on replay.
- [ ] **E2E (`free-to-paid`)**: signup → free-preview lesson → hit a premium lesson → upgrade → Stripe Checkout (test mode) → webhook grants Pro → premium lesson unlocks. Logged-out gated route → academy login.
- [ ] Live: one real low-value test charge end-to-end, then refund.

**Exit gate:** Stripe charges + grants Pro verified e2e; ≥3 courses live + walkable. Dims 10→ramps, 13 ≥95.

---

## Phase 1 — Habit core  → dims 2, 3, 5  (the stickiness engine)
**Deliverables**
- [ ] Onboarding flow: goal → motivation → calibration → daily-goal commit → first-lab **aha** (before the signup wall).
- [ ] Streaks + freeze + repair; XP + levels; daily goal.
- [ ] FSRS review scheduler + daily **Review** session (`/academy/review`).

**Engineering**
- [ ] Migrations: `academy_streaks` (current_len, longest, last_active_date, freezes_available, freeze_dates), `academy_xp` (total, weekly, level), `academy_daily_goals` (goal_minutes, met_date), `academy_reviews` (concept_key, fsrs_difficulty, fsrs_stability, due_at, last_grade, reps), `academy_onboarding` (goal, motivation, calibration_level, completed_at). All own-row RLS.
- [ ] `lib/academy/streaks.ts` — timezone-aware day boundary, increment/miss/freeze/repair.
- [ ] `lib/academy/xp.ts` — award table (lesson/lab/quiz) + level curve.
- [ ] `lib/academy/fsrs.ts` — wrap `ts-fsrs` (0.90 target): `schedule(card, grade)`, `dueQueue(user)`.
- [ ] `lib/academy/onboarding.ts`; hook XP/streak into `markLessonComplete` + lab/quiz completion.
- [ ] UI: `OnboardingFlow`, `StreakWidget` (shell header), XP/level bar, `DailyGoalRing`, `ReviewSession` page, review-due badge in the shell. Celebration on level-up / goal-met.
- [ ] `npm i ts-fsrs`.

**Testing**
- [ ] Unit: streak increment across midnight + freeze consume + repair window; XP→level; FSRS due-calc + grade→next-interval.
- [ ] Integration: onboarding persistence; review upsert + RLS.
- [ ] **E2E (`habit-loop`)**: new user → onboarding → first lab aha → streak=1 → (advance clock) next-day review queue surfaces → grade 3 reviews → streak=2, XP accrues, daily goal met; skip a day → freeze consumed; cross level threshold → level-up celebration.
- [ ] Live: streak widget + review page verified.

**Exit gate:** dims 2,3,5 ≥95. Posture ~32 → ~55.

---

## Phase 2 — Proof + credibility  → dims 7, 12  (the premium moat)
**Deliverables**
- [ ] Pre/post assessment → **Hake's g** per learner + public aggregate (honest "collecting data" state under n-threshold).
- [ ] Public proof-of-work **portfolio** (the shareable unit) at `/academy/u/[handle]`.
- [ ] One-click LinkedIn certificate + auto proof-of-work/streak **social cards** at the aha.

**Engineering**
- [ ] Migrations: `academy_assessments` (course_slug, kind pretest|posttest, score, taken_at), `academy_profiles` (handle unique, is_public, bio), `academy_artifacts` (course/lesson, title, repo_url, demo_url).
- [ ] `lib/academy/efficacy.ts` — Hake's g = (post−pre)/(100−pre); per-learner + aggregate.
- [ ] Pretest gate at course start, posttest at end; gain display on course/dashboard.
- [ ] Public profile page (own-vs-public RLS), `/academy/efficacy` public page (real aggregate only).
- [ ] Social-card OG route (`/og/academy?kind=proof|streak|gain&...`); LinkedIn add-certificate (cert verify URL); share buttons at completion.

**Testing**
- [ ] Unit: Hake's g; n-threshold gating; handle uniqueness.
- [ ] Integration: assessment RLS; profile public vs private read.
- [ ] **E2E (`proof`)**: pretest → complete course → posttest → g shown; public portfolio renders artifacts at a shareable URL while logged-out; cert LinkedIn link + social card generate.
- [ ] Live: efficacy page shows real aggregate or honest empty state.

**Exit gate:** dims 7,12 ≥95.

---

## Phase 3 — Growth loops  → dims 4, 8, 9  (the spread)
**Deliverables**
- [ ] Two-sided referral (status/access rewards, not discounts), surfaced at session-1 aha + milestones.
- [ ] Engagement-tier **leagues** (weekly XP, promotion/relegation, fresh-start reset) at `/academy/leagues`.
- [ ] Discord ↔ academy bridge (role sync on enroll), cohorts, friend streaks.

**Engineering**
- [ ] Migrations: `academy_referrals` (code, referrer_id, invitee_id, reward_type, status), `academy_leagues` (week, tier), `academy_league_members` (league_id, user_id, weekly_xp, rank), `academy_cohorts`, `academy_friendships` (+ friend_streak).
- [ ] `lib/academy/referrals.ts` — code gen, attribution at signup, idempotent give-get reward grant.
- [ ] `lib/academy/leagues.ts` — assignment by engagement tier, weekly rank + promote/relegate (logic here; cron triggers it in P4).
- [ ] Discord role sync (reuse existing discord system) on enrollment.
- [ ] UI: referral widget (code + status, at aha + milestones), leagues page (tier + leaderboard), friend streaks.

**Testing**
- [ ] Unit: referral attribution + reward idempotency; league rank sort + promote/relegate; friend-streak.
- [ ] Integration: referral RLS; league membership writes.
- [ ] **E2E (`referral` + `leagues`)**: A shares code → B signs up via code → both rewarded once; XP ranks within a league; simulate week rollover → promote/relegate; Discord role synced on enroll (mock/verify).

**Exit gate:** dims 4,8,9 ≥95. Posture ~55 → ~80.

---

## Phase 4 — Engagement infrastructure  → dims 6, 14
**Deliverables**
- [ ] Background jobs (Vercel Cron + queue): due-review compute, streak check/reset, league rollover.
- [ ] Notification engine: lifecycle email + **web push** (VAPID/service worker); streak-save reminders with send-time + frequency cap.
- [ ] DB index pass (199 unindexed FKs); Upstash connected (rate limiter global).

**Engineering**
- [ ] Cron routes (`vercel.ts` crons): daily (reminders, streak, reviews), weekly (league rollover); guarded by `CRON_SECRET`.
- [ ] Migrations: `academy_notifications` (type, channel, sent_at, opened), `push_subscriptions` (endpoint, keys, user_id); index migration for the flagged FKs.
- [ ] `lib/notifications/` — email (Resend) + web-push (`web-push` lib); send-time from user's active window; frequency cap; streak-save trigger.
- [ ] Service worker + subscribe UI.
- [ ] Set `UPSTASH_REDIS_REST_URL/TOKEN` (rate limiter auto-activates global).

**Testing**
- [ ] Unit: notification eligibility + frequency cap + send-time; push subscribe/unsubscribe.
- [ ] Integration: cron route idempotency; notification log.
- [ ] **E2E (`notifications`)**: streak at risk → reminder queued (mock provider); web-push subscribe → receive (mock); cron runs verified.
- [ ] Perf: `EXPLAIN` confirms hot queries use new indexes; rate-limit global under Upstash.

**Exit gate:** dims 6,14 ≥95.

---

## Phase 5 — Personalization + measurement + content scale  → dims 1, 10, 11, 15
**Deliverables**
- [ ] Personalized/adaptive FSRS (difficulty from calibration + grade history).
- [ ] CURR dashboard + retention cohorts + funnel (PostHog).
- [ ] Content breadth ramp.

**Engineering**
- [ ] Adaptive selection in `fsrs.ts` (per-user params; serve harder/easier).
- [ ] `lib/academy/metrics.ts` — CURR + cohort retention; internal `/academy-admin/metrics` dashboard.
- [ ] Verify all funnel events fire end-to-end.

**Testing**
- [ ] Unit: adaptive selection; CURR computation matches DB.
- [ ] **E2E (`funnel`)**: each step emits its event; adaptive review serves correct difficulty.
- [ ] Live: CURR dashboard trustworthy.

**Exit gate:** dims 11,15 ≥95; dim 1 → 90+; dim 10 ramps with real content.

---

## Phase 6 — Hardening + the 95–99 verification capstone
**Deliverables**
- [ ] Full Playwright **e2e suite** across the whole journey (signup → onboarding → learn → streak → review → referral → upgrade → cert/portfolio share → leagues).
- [ ] Load test (k6) at the 50k profile on hot paths.
- [ ] A11y (axe) + Lighthouse/CWV ≥95 on every academy surface.
- [ ] Security re-audit (review agents) on referral/profiles/notifications.
- [ ] **Full 15-dimension re-score; fix everything <95.**

**Exit gate:** every dimension ≥95, green e2e suite, load + a11y + security pass. Locks **95–99**. Nothing touches the 50k ramp until this gate is green.

---

## What needs the operator (unblocks phases)
- **P0:** Stripe OPE5 secret key + the real course content/methodology repo.
- **P3:** confirm referral reward (free month vs XP vs exclusive track) + Discord server/bot access.
- **P5:** content breadth (more courses).

## Sequencing note
P1 (habit core) needs **no** operator content — we can start it immediately. P0
runs in parallel the moment the Stripe key + courses arrive. P2→P6 follow the gates.
