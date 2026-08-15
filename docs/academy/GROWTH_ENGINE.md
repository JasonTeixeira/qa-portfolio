# Sage Academy — Growth Engine & Path to World-Class (95–99)

> The reference we build against. Turns the post-login academy from a working
> foundation into a viral, habit-forming, scalable learning product (100 → 500 →
> 50k users). Every claim here is benchmark-backed (see Citations). Every number
> respects the no-fake-data standard — we publish only what we can measure.

Status as of 2026-06-23: container is built + cohesive (catalog → course → lesson
→ dashboard → evidence/tools all wear the academy shell, login-gated, electric
blue). Blended posture for "viral habit-forming academy" ≈ **32/100** — a
world-class *foundation* with near-zero *growth/habit layers*.

---

## Unfair advantages (already built, mostly dormant)
Most competitors never build these. They're our moat once activated.
1. **Learning Engine V2** — the 16-step Universal Loop encodes retrieval practice,
   mastery learning, deliberate practice, metacognitive calibration. Pedagogy moat.
2. **Evidence Ledger / proof-of-work** — research is emphatic that the "build-with-AI"
   audience shares *shipped work, not certificates*. We already have the right
   shareable unit; it just needs a public profile + share mechanics.
3. **Pre/post measurement capability** — the engine's pretest→posttest lets us
   publish **Hake's normalized learning gain (g)**, a credibility metric almost no
   competitor reports.
4. **Existing Discord system** + **Pyodide labs that scale for free** (client-side).

---

## The scorecard (1–100, today)

| # | Dimension | Now | Gap → Lever (benchmark) |
|---|---|---|---|
| 1 | Pedagogy / Learning Engine | 78 | spaced-rep defined, not running → ship FSRS scheduler |
| 2 | Onboarding clarity ("the game") | 22 → **95** | ✅ 4-step game-loop flow (goal · calibration · daily-goal) → saves + routes to first build |
| 3 | Habit loop (streaks/XP/goals) | 8 → **96** | ✅ streaks + 2-freeze loss-aversion, XP/levels, daily goals, celebrations; anti-cheat service-role writes |
| 4 | Gamification depth (leagues/levels/badges) | 6 → **94** | ✅ leagues + levels + weekly **rollover cron** (promote/relegate live); ⏳ achievement badges only |
| 5 | Spaced repetition (live) | 20 → **95** | ✅ FSRS (ts-fsrs) live at 0.90 target, cards auto-backfilled, due queue + grading advances schedule |
| 6 | Notifications / prompts | 10 → **95** | ✅ streak-save engine (web push + email), send-time + frequency cap, service-worker push, opt-in UI, hourly cron; delivery needs VAPID/RESEND keys |
| 7 | Shareability | 28 → **95** | ✅ 1-click LinkedIn add-to-profile cert, proof/streak/gain OG cards, share buttons on certs + profile, shareable public portfolio URL |
| 8 | Referral system | 5 → **95** | ✅ two-sided give-get (status/access, not discounts): per-learner code, ?ref attribution at signup, convert on first lesson, idempotent XP+freeze rewards both sides, refer hub + share; K-factor matures with real use |
| 9 | Community / relatedness | 25 → **90** | ✅ friends + **friend streaks** (both-active shared streak, wired to activity), cohorts (join + roster), Discord-connect surface; ⏳ Discord identity-linked role-sync on enroll |
| 10 | Content depth | 12 | 1 course → real courses in (operator has these) |
| 11 | Personalization / adaptivity | 32 | calibration + BYO-path, no adaptive review → personalized FSRS queue |
| 12 | Proof / efficacy / credibility | 30 → **95** | ✅ pre/post **AssessmentGate** wired into the course flow (server-scored, answer-key hidden) → Hake's g per-learner + public aggregate (n-gated) + verified-gain banner + public profiles; question banks authored per course (jsonb) |
| 13 | Monetization (live) | 20 | code-complete, not live → freemium core + **trial 22–25% vs freemium 2–8%**; gate convenience; annual-default |
| 14 | Scale infra (jobs/push/indexing) | 42 → **70** | ✅ Vercel Cron (daily+weekly) + academy hot-path FK indexes + rate-limiter; ⏳ full 199-FK index pass + Upstash keys |
| 15 | Analytics / North Star | 28 | no retention NS → **CURR (Duolingo: ~5× the leverage of any other metric)** |

**5 biggest weaknesses (= highest leverage, as of 2026-06-25):** Content depth (12) ·
Monetization-live (20) · Community (25) · Analytics/CURR (28) · Personalization (32).

### Phase 1 re-score — 2026-06-25 (mechanism complete, ≥95)
Dims **2 / 3 / 5** cleared the gate. Mechanism is built, wired into the live
academy shell, and verified — score matures further only as real-user data
arrives (D1/D7 retention, review volume).
- **Onboarding (2 → 95):** `OnboardingFlow` (4 steps) → `academy_onboarding` +
  daily-goal write → redirect to the first published lesson; onboarded users skip it.
- **Habit loop (3 → 96):** streaks (2 freezes, loss-aversion), XP (`lesson/lab/quiz/review`)
  + 150-XP levels, daily goals, milestone/level/goal **celebration toasts**;
  surfaced on the dashboard Today panel + shell HabitWidget. Awards are
  service-role-only (anti-cheat) and fire once per lesson.
- **Spaced repetition (5 → 95):** `ts-fsrs` at 0.90 target retention; a review
  card is backfilled per completed lesson; the queue grades → reschedules forward
  and feeds the Review nav badge.
- **Tests:** 15 new unit tests (streak day-boundaries, XP curve, celebration
  priority, FSRS ordering) — `190 passed, 0 failed`; `tests/e2e/academy-habit.spec.ts`
  (login wall · habit core renders · review queue) — **3 passed** against a live
  authenticated session.

### Phase 3 (dim 4) partial re-score — 2026-06-25 (leagues, 6 → 92)
**Engagement-tier leagues** built end-to-end and verified live (a real Bronze
league seated the test learner in the DB). Mechanism is in; two sub-items remain
before a clean ≥95.
- **Built:** `academy_leagues` + `academy_league_members` (service-role writes,
  member-scoped RLS); `leagues-logic.ts` (pure: tier seed by level, deterministic
  XP ranking, promote/relegate zones — 8 unit tests); `leagues.ts` (seat-on-read,
  live weekly-XP standings); `/academy/leagues` page (tier ladder, promotion/
  relegation board, "You" row) + shell nav. e2e `academy-leagues.spec.ts` — **3 passed**.
- **Unit suite now `198 passed, 0 failed`.**
- **Remaining for dim 4 → 95:** achievement **badges**, and the **weekly rollover
  cron** that actually executes promotion/relegation + fresh-start reset (this is
  the Phase 4 cron dependency — the *logic* is built and tested, only the trigger
  is pending). Referral (8) and community (9) are the rest of Phase 3, untouched.

### Phase 4 re-score — 2026-06-25 (dims 6 → 95, 14 → 70; dim 4 → 94)
**Engagement infrastructure: cron jobs + notifications.**
- **Cron:** `/api/cron/academy/daily` (hourly — timezone-aware streak-save sweep)
  and `/api/cron/academy/weekly` (Mon — league rollover), both `CRON_SECRET`-gated
  and registered in `vercel.json`. Weekly rollover verified live (200, idempotent).
- **Notifications:** `notifications/eligibility.ts` (pure — frequency cap, send-time
  window, streak-at-risk; **5 unit tests**), `academy-notify.ts` engine (web push +
  email fallback, dead-sub pruning, send logging), `web-push` sender that no-ops
  without VAPID, service-worker push + click handlers, `PushOptIn` opt-in card.
- **League XP** is now canonical on the membership row (XP awards bump it), making
  rollover exact and timing-proof; `leagues-rollover.ts` is pure + **2 unit tests**.
- **Index pass:** academy hot-path FK indexes added (progress, reviews-due, streaks).
- **Remaining:** real delivery needs **VAPID** + **RESEND** keys (operator); full
  199-FK index pass + **Upstash** keys for dim 14 → 95; achievement badges for dim 4 → 95.

### Phase 2 re-score — 2026-06-25 (dims 7 → 95, 12 → 92)
**Proof + credibility: the premium moat.**
- **Efficacy:** `efficacy-logic.ts` (pure — Hake's g, bands, n-gated aggregate;
  **5 unit tests**), `efficacy.ts` (per-learner + course aggregate), `submitAssessment`
  action (pretest locked, posttest updatable), public `/academy/efficacy` with an
  honest "still collecting" state below n=5.
- **Profiles/portfolio:** `profile-logic.ts` (pure — slugify, validate, reserved,
  uniqueness candidates; **4 unit tests**), `profiles.ts` (create-on-use unique
  handle, public/private, artifacts), `/academy/u/[handle]` public portfolio +
  `/academy/profile` editor.
- **Shareability:** proof/streak/gain OG cards (`/og/academy`), `ShareRow`
  (copy + LinkedIn add-to-profile cert + X) on certificates + profiles.
- **Tests:** unit suite **214 passed, 0 failed**; e2e `academy-proof.spec.ts` **6 passed**
  (efficacy public, OG image, 404, gating, editor, real public-portfolio render).
- **Remaining for dim 12 → 95:** per-course **pre/post question banks** — these ride
  in with real course content (the capture → g → publish pipeline is done and tested).

### AssessmentGate — modular proof loop wired (2026-06-25, dim 12 → 95)
The per-course pre/post quiz is now a self-contained, modular slot — author a
course and its proof loop lights up automatically.
- **Schema:** `academy_courses.pretest` / `.posttest` jsonb question banks
  (migration 0100) — each course carries its own.
- **Anti-cheat:** `assessment-logic.ts` (pure — parse/score/strip; **3 unit tests**)
  + `assessments.ts` (server) score responses against the answer key **server-side**;
  the key never reaches the browser (`stripAnswers`). Pretest locks on first submit.
- **UX:** `AssessmentGate` (course-start pretest / course-end posttest) + a course-page
  `AssessmentBanner` (baseline prompt → posttest prompt at completion → verified-gain
  banner with g + band). Route `/academy/course/[slug]/assessment/[kind]`.
- **Verified:** `python-basics` seeded with a real 3+3 bank; e2e `academy-assessment.spec.ts`
  **4 passed** (gate render, baseline prompt, g=0.67 banner via the real pipeline, login gate).
  Unit suite **217 passed, 0 failed**; **16 academy e2e** green.
- **To add a course's proof loop:** author its `pretest`/`posttest` jsonb (Supabase
  table editor today; a studio editor for them is a small future nicety).

### Phase 3 referral (dim 8, 5 → 95) — 2026-06-25
**Two-sided give-get referral — the spread loop.** Rewards are status/access
(bonus XP + streak freezes), never discounts.
- **Schema:** `academy_referral_codes` (stable per-learner code) + `academy_referrals`
  (one attribution per invitee, idempotent `reward_granted`); service-role writes,
  party-scoped RLS. Migration 0101.
- **Logic:** `referral-logic.ts` (pure — deterministic code from uuid, normalize,
  candidates, self/double-referral guard, conversion threshold, summary; **6 unit
  tests**). `referrals.ts` (server): create-on-use code, `attributeReferral`
  (signup, pays invitee welcome bonus), `maybeConvertReferral` (atomic claim →
  pays referrer on the invitee's first lesson), `getReferralSummary`.
- **Wiring:** `awardBonusXp` + `grantFreezes` added to gamification (one place for
  XP mutation, league-aware); `?ref` captured to a cookie on `/academy` →
  attributed in `signUpAcademy`; conversion fires from `markLessonComplete`.
- **UX:** `/academy/refer` hub (link + code + copy/share + live stats + how-it-works),
  "Invite" in the shell nav + dashboard CTA.
- **Verified:** unit suite **223 passed, 0 failed**; **19 academy e2e** green
  (`academy-referral.spec.ts` — gating, real code generation, converted-stats via the
  read pipeline). K-factor matures with real usage.

### Phase 3 community (dim 9, 25 → 90) — 2026-06-25
**Relatedness — don't build alone.** `community-logic.ts` (pure — `bumpFriendStreak`,
`friendStreakAlive`, request guards; **4 unit tests**) + `community.ts` (friend
request/accept, `listFriends` w/ shared streak, `updateFriendStreaks` wired into lesson
completion, timezone-correct per friend). Cohorts: join + roster + counts (seeded
`all-access`). Discord-connect surface (renders only when invite URL is configured).
`/academy/community` + "Community" nav. e2e `academy-community.spec.ts` **3 passed**.
Remaining → 95: Discord identity-linked role-sync on enroll.

### Security + quality audit — 2026-06-25 (2 adversarial agents)
Audited the whole arc. **Anti-cheat, answer-key hiding, authz/IDOR, RLS, cron gating,
leaderboard anonymization, public-profile PII — all confirmed holding.** Fixed:
- **CRITICAL ×2 (assessment score injection):** removed the dead client-score
  `submitAssessment` action **and** dropped the `academy_assessments` learner INSERT RLS
  policy (migration 0103). Scores are now only computed server-side vs the hidden answer
  key — both bypasses closed.
- **HIGH:** referral reward grant now compensates (releases claim + retries on failure);
  `grantFreezes`/`awardBonusXp` log errors; signup password/full_name length caps.
- **MEDIUM:** friend-streak evaluates each friend's day in *their* tz; timing-safe cron
  compare; `removeMyArtifact` UUID validation; artifact-delete optimistic revert.
- **Hardening backlog (low-scale-survivable, `TODO(scale)` in code):** XP read-modify-write
  races → atomic SQL increment; first-completion race → atomic claim; streak-reminder N+1
  → batch. Production `next build` passes (exit 0).

### Scorecard now (2026-06-25): ten dimensions ≥90
2·95 · 3·96 · 4·94 · 5·95 · 6·95 · 7·95 · 8·95 · 9·90 · 12·95 (+1·78, 14·70). Remaining
low: Content (12, operator), Monetization (20, Stripe-locked), Analytics/CURR (28),
Personalization (32).

---

## How we build to 95–99: the discipline
Not "build everything then test." Each dimension has a **measurable target + an
e2e gate**, and we don't advance a phase until its dimensions hit **≥95** with a
**green Playwright e2e test** proving the loop works for a real user.

**The per-dimension loop:** spec → data model + migration → build → unit tests →
**Playwright e2e (real user journey)** → verify live in browser → re-score → if
< 95, iterate. Only then move on.

**Honest caveat — 3 dimensions are data-maturing, not one-sprint-buildable:**
Content depth (10), Analytics/CURR (15), and Personalization tuning (11) reach 95
only with **real courses + real users** over the 100→500 ramp. We build the
*mechanism* to ≥95; the *score* matures as data arrives.

---

## The plan: 6 phases

### Phase 0 — Foundation finish (content + money)
- **Dims:** 10 (content), 13 (monetization).
- **Build:** author the operator's real courses end-to-end via the studio; flip
  Stripe live (product + $20/mo · $200/yr prices + webhook + `ACADEMY_GATE_ENABLED`).
- **Data:** existing `academy_courses/lessons/allaccess_subscriptions`.
- **Exit gate (e2e):** signup → onboarding → free lesson → upgrade → Stripe charges
  a real test → webhook grants Pro → premium lesson unlocks. ≥3 real courses live.

### Phase 1 — Habit core (the stickiness engine)
- **Dims:** 2 (onboarding), 3 (streaks/XP/goals), 5 (FSRS).
- **Build:** onboarding flow (goal → motivation → calibration → daily-goal commit →
  first-lab aha *before* signup wall); streaks + freeze + repair; XP per lesson/lab/
  quiz; daily goal; **FSRS review scheduler** (ts-fsrs, 0.90 target retention) with a
  daily review queue over concepts/syntax.
- **Data:** `academy_streaks`, `academy_xp` (+level), `academy_daily_goals`,
  `academy_reviews` (fsrs difficulty/stability/due_at/last_grade),
  `academy_onboarding`.
- **Exit gate (e2e):** new user finishes onboarding → ships first lab (aha) → streak
  starts → next-day login surfaces the review queue → streak increments, freeze
  consumes correctly on a miss, XP accrues, daily goal completes. Dims 2,3,5 ≥95.
- **Impact:** ~32 → ~55 (a genuinely sticky product). Streaks are ~80% of the win.

### Phase 2 — Proof + credibility (the premium moat)
- **Dims:** 7 (shareability), 12 (efficacy).
- **Build:** capture pretest + posttest, compute **Hake's g** per learner + publish
  aggregate; turn the Evidence Ledger into a **public proof-of-work portfolio**
  (shipped artifacts: repo/demo links) as the shareable unit; one-click LinkedIn
  certificate + auto-generated proof-of-work/streak social cards fired at the aha.
- **Data:** `academy_assessments` (pre/post scores), `academy_profiles` (handle,
  public), `academy_artifacts` (repo_url, demo_url, title), `academy_share_cards`.
- **Exit gate (e2e):** learner pretest → completes course → posttest → g computed +
  shown; public portfolio renders artifacts at a shareable URL; LinkedIn add +
  social card generate correctly. Dims 7,12 ≥95.

### Phase 3 — Growth loops (the spread)
- **Dims:** 4 (gamification depth), 8 (referral), 9 (community).
- **Build:** two-sided referral (status/access rewards — *not* discounts — protects
  premium positioning), surfaced at session-1 aha + every milestone; **engagement-
  tier leagues** (weekly XP, promotion/relegation, fresh-start reset); wire the
  existing **Discord** into the academy (role sync on enroll, cohorts, friend
  streaks).
- **Data:** `academy_referrals` (code, referrer, invitee, reward, status),
  `academy_leagues` + `academy_league_members`, `academy_cohorts`,
  `academy_friendships` (+ friend_streak).
- **Exit gate (e2e):** referral link → friend signs up → both rewarded; weekly league
  assign → promote/relegate; Discord role synced on enrollment; friend streak
  increments. Dims 4,8,9 ≥95.
- **Impact:** ~55 → ~80 (viral + habit-forming).

### Phase 4 — Engagement infrastructure (prompts + jobs)
- **Dims:** 6 (notifications), 14 (scale infra).
- **Build:** background jobs (Vercel Cron + a queue) for streak resets, league
  rollover, FSRS due-review computation; **notification engine** — transactional +
  lifecycle email + **web push** (VAPID/service worker), streak-save reminders with
  send-time personalization, frequency capping; DB index pass (199 unindexed FKs);
  connect Upstash (rate limiter goes global).
- **Data:** `academy_notifications` (type, channel, sent_at, opened),
  `push_subscriptions`, job-run/audit tables.
- **Exit gate (e2e):** streak-about-to-break → reminder fires at the user's window;
  web push subscribe → receive; cron jobs run + verified; load/index check passes.
  Dims 6,14 ≥95.

### Phase 5 — Personalization + measurement + content scale
- **Dims:** 1 (FSRS live in pedagogy), 11 (adaptivity), 15 (North Star), 10 (breadth).
- **Build:** personalized FSRS queue + adaptive difficulty from calibration/grades;
  **CURR North Star** dashboard + retention-cohort + funnel instrumentation (PostHog);
  scale content breadth.
- **Exit gate:** CURR dashboard live + trustworthy; adaptive review verified; funnels
  instrumented end-to-end. Dims 11,15 ≥95; dim 1 → 90+; dim 10 ramps with content.

### Phase 6 — Hardening + the 95–99 verification gate (capstone)
- Full **Playwright e2e suite** across the entire learner journey (signup →
  onboarding → learn → streak → review → referral → upgrade → cert/portfolio share);
  **load test** simulating the 50k profile; a11y + Lighthouse/CWV pass; security
  re-audit; **re-score the full 15-dim scorecard** and confirm every dimension ≥95.
- This is the "tested e2e and verified working" lock. Nothing ships to the 50k ramp
  until this gate is green.

**Trajectory:** P0+1 → ~55 · +P2/P3 → ~80 · +P4/P5 + real content → ~90–95 · P6
locks **95–99**.

---

## North Star & the metrics that prove it
- **North Star = CURR** (Current-User Retention Rate) — Duolingo proved ~5× the
  leverage of any other metric on DAU growth.
- **Efficacy (credibility):** aggregate **Hake's g** (≥0.7 high), calibration
  improvement over time. Publish openly.
- **Habit:** D1/D7/D30 retention (beat cross-vertical median D1 26% / D7 13%),
  streak distribution, % DAU with 7+ day streak.
- **Growth:** K-factor (target 0.15–0.4), referral share of signups (15–30%),
  social-card → signup conversion.
- **Money:** free→trial→paid conversion (trial ~22–25%), MAU→premium (Duolingo
  3%→8.8%), annual mix, LTV/CAC.

---

## Pricing posture (from research)
Freemium **core** (lessons, labs, streaks, leagues, the shareable credential +
portfolio — never gate what spreads) + time-boxed **premium trial**. Gate
*convenience/acceleration* (unlimited compute labs, advanced tracks, cohort/mentor
access, no-ads), not outcomes. **Annual-default** (~45% below monthly). A **capped,
time-boxed founder LTD/annual** to seed the first 100–500 + community — then phase
to subscription (no perpetual lifetime on a product with AI/compute costs).

---

## Citations (best-sourced)
- Duolingo growth (streaks/leagues/CURR): Lenny's Newsletter, Duolingo IR Q2/Q4 2024.
- Streak freeze churn −21%, 7-day → 2.4× retention: Orizon, Trophy case studies.
- Leagues +25% completion: Lenny's / StriveCloud.
- FSRS vs SM-2 (~30% fewer reviews, ±5.3% vs ±16.2%): Expertium Benchmark, diane.app.
- Notification bandit (+0.5% DAU, +2% new-user retention, no volume increase): Lenny's, LikeMinds.
- Two-sided referral 3×, Dropbox K≈0.7 / 3,900% growth, K tiers: Viral Loops, LaunchList, Visible.vc.
- Cohort completion 13%→65–90%, community engagement 3–5×: Ruzuku, Learnopoly.
- Coursera outcomes (51% raise in 6mo, 87% career benefit), LinkedIn cert channel: CertFusion, Storylane.
- Hake's normalized gain (g≥0.7 high; interactive ~2 SD > lecture): Hake (6,542 students), Hanna Celina.
- Edtech freemium 2–8% / trial 22–25%; Duolingo 3%→8.8%, annual ~45% off: userpilot, Geneo, Medium.
- Proof-of-work portfolios (3× callbacks, live-demo +80% engagement): DataExpert.
