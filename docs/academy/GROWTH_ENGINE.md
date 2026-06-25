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
| 2 | Onboarding clarity ("the game") | 22 | no goal/calibration/daily-goal → Duolingo 3-min flow, aha before signup |
| 3 | Habit loop (streaks/XP/goals) | 8 | none → **7-day streak = 2.4× retention; freeze cuts churn 21%** |
| 4 | Gamification depth (leagues/levels/badges) | 6 | none → **engagement-tier leagues +25% completion, 3× engaged** |
| 5 | Spaced repetition (live) | 20 | spec only → **FSRS (ts-fsrs), 90% target, ~30% fewer reviews than SM-2** |
| 6 | Notifications / prompts | 10 | transactional only → streak-save reminder (send-time) + web push |
| 7 | Shareability | 28 | certs+ledger exist, no share → 1-click LinkedIn + proof-of-work cards at aha |
| 8 | Referral system | 5 | none → two-sided give-get (3× one-sided); **K 0.15–0.4 → 15–30% of signups** |
| 9 | Community / relatedness | 25 | Discord unwired → **cohorts/community: completion 13%→65–90%, engagement 3–5×** |
| 10 | Content depth | 12 | 1 course → real courses in (operator has these) |
| 11 | Personalization / adaptivity | 32 | calibration + BYO-path, no adaptive review → personalized FSRS queue |
| 12 | Proof / efficacy / credibility | 30 | Hake's g dormant → capture pre/post, publish aggregate **g (≥0.7 = high-gain)** |
| 13 | Monetization (live) | 20 | code-complete, not live → freemium core + **trial 22–25% vs freemium 2–8%**; gate convenience; annual-default |
| 14 | Scale infra (jobs/push/indexing) | 42 | no cron/jobs, 199 unindexed FKs → Vercel Cron + queue + index pass |
| 15 | Analytics / North Star | 28 | no retention NS → **CURR (Duolingo: ~5× the leverage of any other metric)** |

**5 biggest weaknesses (= highest leverage):** Referral (5) · Gamification (6) ·
Habit loop (8) · Notifications (10) · Content (12).

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
