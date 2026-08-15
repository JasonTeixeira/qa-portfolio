# Sage Interview Academy — Architecture Spec

> Status: DISCOVERY / ARCHITECTURE. No app code exists yet. This spec is derived
> from the 15 `Sage Interview *.dc.html` design files in
> `design-source/sage-academy-2026/` and the existing Sage Academy platform.
> Companion: [`INTERVIEW_BUILD_PLAN.md`](./INTERVIEW_BUILD_PLAN.md).

---

## 1. Product overview

**"Interview Mastery"** is a paid add-on riding on top of the existing Sage
Academy (sageideas.dev). It is a **separate purchase** from the all-access
membership — Academy Pro ($29/mo base) + Interview Mastery add-on ($24/mo billed
annually at $290/yr, or $39/mo monthly). It turns interview prep into a
measured, converging training loop with an AI interviewer named **Marlowe**.

### The core learner loop (derived from Cockpit → Session → Verdict → Debrief → Schedule)

> **Set a target** (role, level, timeline, optional JD) → **run a mock** with
> Marlowe — coding / system-design / behavioral / negotiation, voice-or-typed,
> with the signature *"the tests are lying to you"* verification twist → **get a
> committee verdict** (score vs "the bar", `no hire → strong hire`) → **read a
> timestamped debrief** and **drill the weakest dimension first** → **schedule
> the next rep** (taper toward a real onsite, or run a full loop simulation) →
> **track readiness** climbing toward the bar → land the offer, rehearse the
> negotiation, and **auto-pause billing** when the search ends.

Two invariants define the product:

1. **One readiness score, six dimensions, capped by the weakest.** Readiness is
   0–100 scored against **"the bar" for the target level** (intern 62 · new-grad
   70 · mid 77 · senior 84). The overall number is gated by your lowest
   dimension — the sample user is "6 points from the bar" *because*
   `verification habit = 58` caps everything.
2. **Committee-language verdicts, honest scoring, zero flattery.** Every rep is
   graded `strong hire → hire → lean hire → no hire → strong no-hire`, with
   timestamped transcript evidence ("your recovery at 32:02 is the reason this
   isn't a no-hire").

### The six dimensions (fixed taxonomy)

`problem_framing`, `communication`, `technical_depth`, `tradeoff_judgment`,
`verification_habit`, `composure`. Each scored 0–100 with a bar-status
(`above bar` / `at bar` / `near bar` / `below bar · caps your score`).

### The four tracks + loop

`coding`, `system_design`, `behavioral`, `negotiation` (a.k.a. "screens & comp").
A **full loop simulation** is an ordered set of 4 mock rounds graded as one
aggregate verdict (the "dress rehearsal").

### The upsell / pricing model

- **Landing** = `Sage Interview Mastery.dc.html` (marketing, rubric, pricing).
- **Purchase** = `Sage Interview Checkout.dc.html` — a NEW Stripe recurring
  price, a separate line-item added onto the Academy plan.
- **Win recap** = `Sage Interview Offer.dc.html` (note: this is the *end-of-
  journey celebration* when a member LANDS a job — not the sales offer), which
  triggers the distinctive **auto-pause billing in 30 days unless still
  interviewing**.

---

## 2. Screen → route map

All routes live under `app/academy/interview/*`, behind the existing
`needsAcademyLogin` middleware. Subscriber-gated routes additionally check
`getInterviewAccess()` (new, §4). Public marketing/checkout routes do not.

| Screen (`.dc.html`) | Proposed route | Gate | Purpose | Real data it needs |
|---|---|---|---|---|
| **Mastery** | `/academy/interview/mastery` | public | Add-on landing: hero, rubric, pricing toggle, comparison, FAQ | none (static marketing) + `interview-plans.ts` price line |
| **Checkout** | `/academy/interview/checkout` | signed-in | Purchase add-on onto Academy plan | `interview-plans.ts`, current sub state |
| **Onboarding** | `/academy/interview/onboarding` | subscriber | 5-step target wizard (role, level, timeline, JD, evidence) | writes `interview_profiles` |
| **Cockpit** | `/academy/interview` | subscriber | Prep home: readiness dial, week plan, rubric, loop, story bank, history, offer tracker | `interview_profiles`, `interview_readiness`, `interview_schedule`, `interview_sessions`, `interview_stories`, `interview_pipeline`, `interview_loops` |
| **Session** | `/academy/interview/session/[id]` | subscriber | Live mock room: Marlowe transcript + mode workspace (code/whiteboard/STAR/offer) | `interview_scenarios`, `interview_sessions`, `interview_turns`, `interview_artifacts` |
| **Verdict** | `/academy/interview/verdict/[sessionId]` | subscriber | Processing → committee scorecard reveal | `interview_verdicts` (AI-graded) |
| **Debrief** | `/academy/interview/debrief/[sessionId]` | subscriber | Timestamped review, speech analytics, rubric movement, next drills | `interview_verdicts`, `interview_turns`, `interview_drills` |
| **Schedule** | `/academy/interview/schedule` | subscriber | Taper/countdown week grid, onsite running order, reminders | `interview_schedule`, `interview_reminders`, `interview_profiles`, `interview_pipeline` |
| **Library** | `/academy/interview/library` | subscriber | 1,400+ scenario bank, filters, company presets, weakest-first sort | `interview_scenarios`, `interview_company_presets`, `interview_readiness` |
| **Progress** | `/academy/interview/progress` | subscriber | Readiness-over-time chart, cohort percentile, skill trajectories, habits | `interview_readiness_snapshots`, `interview_readiness`, `interview_verdicts` |
| **Pairs** | `/academy/interview/pairs` | subscriber | Peer-loop matching (async request + scheduling — see §7 flag) | `interview_peer_matches` |
| **Company Brief** | `/academy/interview/brief/[id]` | subscriber | AI brief for a target company/role from the attached JD | `interview_company_briefs` (AI-generated) |
| **Offer (win recap)** | `/academy/interview/offer` | subscriber | End-of-journey recap + negotiation CTA + billing auto-pause | `interview_verdicts`, `interview_readiness_snapshots`, `interview_pipeline`, `interview_subscriptions` |
| **Emails** | *not a route* → `lib/email/interview/*` | n/a | 5 lifecycle transactional templates (sender `sprout@sageideas.dev`) | triggered from real events |
| **Mobile** | *responsive variants*, not separate routes | — | Voice-first Session + Debrief on 390px; coding stays desktop-only | same as Session/Debrief |

---

## 3. Data model

Conventions mirror the existing academy migrations exactly:
- **Content tables** (seeded, service-role write): public/authenticated `select`
  where `status = 'published'`, no anon insert/update policy (default-deny), slug
  as natural key — same shape as `academy_courses` (`0080`).
- **Per-user tables**: `user_id uuid references auth.users(id) on delete cascade`,
  RLS own-row `select`/`insert`/`update` using `(select auth.uid()) = user_id` —
  same shape as `academy_progress` (`0074`).
- Next migration numbers: **`0115`–`0125`** (last is `0114_academy_cert_revocation`).

### 3a. Content tables (seeded once, admin-authored)

**`interview_scenarios`** — the question/scenario bank (1,400+ target).

```sql
create table if not exists public.interview_scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  track text not null check (track in ('coding','system_design','behavioral','negotiation')),
  title text not null,
  description text not null,
  est_minutes integer not null default 30,
  difficulty text not null default 'senior'
    check (difficulty in ('all_levels','mid_senior','senior','senior_plus')),
  trains text[] not null default '{}',        -- dimension slugs this scenario attacks
  recommended boolean not null default false, -- baseline "for you"; real reco is per-user (§4)
  interviewer_prompt jsonb not null default '{}'::jsonb, -- Marlowe seed: persona brief, probe hints, twist config
  seed_code text,                             -- coding starter (e.g. solution.py)
  seed_tests jsonb,                           -- [{name, hidden, passes_for_wrong_reason, expr}] — the "lying" suite
  company_preset_id uuid references public.interview_company_presets(id),
  status text not null default 'published' check (status in ('draft','published')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.interview_scenarios enable row level security;
create policy interview_scenarios_public_read on public.interview_scenarios
  for select to anon, authenticated using (status = 'published');
```

**`interview_company_presets`** — Big Tech loop / Startup onsite / Fintech-quant /
AI lab. Columns: `id, slug, name, description, rounds jsonb` (`[{name,track,focus}]`),
`sim_minutes int, style text, status, sort`. Same public-read/service-write RLS.

**`interview_levels`** — the bar ladder (tiny reference table): `slug`
(`intern|new_grad|mid|senior`), `name`, `bar int` (62/70/77/84), `blurb`, `sort`.
Public read. (The six `dimensions` are a code constant in
`lib/academy/interview/rubric.ts`, not a table — they never change.)

### 3b. Per-user tables (RLS own-row)

**`interview_profiles`** — one row per learner; the onboarding output.

```sql
create table if not exists public.interview_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_role text,                          -- 'Software Engineer', 'Frontend', 'Data/ML', ...
  target_level text check (target_level in ('intern','new_grad','mid','senior')),
  target_company text,                       -- 'Meridian Labs'
  target_date date,                          -- drives days-out + taper
  timeline text check (timeline in ('two_weeks','six_weeks','three_months','no_date')),
  cadence text,                              -- 'daily · intense', '4–5 reps/week', ...
  jd_filename text,                          -- attached JD (nullable)
  jd_summary text,                           -- parsed JD weighting (nullable)
  use_evidence_portfolio boolean not null default false,
  program_week integer,                      -- 'Week 3 of 6' — computed, nullable until first plan
  program_total_weeks integer,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- RLS: own-row select/insert/update (auth.uid() = user_id)
```

**`interview_sessions`** — one mock attempt (also each loop round).

```sql
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid references public.interview_scenarios(id),   -- null for free placement
  loop_id uuid references public.interview_loops(id),           -- set when part of a loop sim
  track text not null,
  level text not null,
  interviewer_style text not null default 'skeptical'
    check (interviewer_style in ('warm','neutral','skeptical','adversarial')),
  mode text not null default 'voice' check (mode in ('voice','typed')),
  is_placement boolean not null default false,
  status text not null default 'live'
    check (status in ('connecting','live','completed','abandoned')),
  phase text,                                -- 'solve → verify'
  question_title text,
  question_body text,
  hint_used boolean not null default false,
  duration_seconds integer not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
-- RLS: own-row select/insert/update
```

**`interview_turns`** — the live transcript (Marlowe + candidate).

```sql
create table if not exists public.interview_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, -- for RLS scoping
  seq integer not null,
  speaker text not null check (speaker in ('interviewer','candidate')),
  content text not null,
  ts_seconds integer,                        -- position within the session (→ mm:ss)
  is_hint boolean not null default false,    -- a used hint is marked in the debrief
  created_at timestamptz not null default now(),
  unique (session_id, seq)
);
-- RLS: own-row select/insert (auth.uid() = user_id)
```

**`interview_artifacts`** — per-session work product.
`id, session_id, user_id, kind ('code'|'whiteboard'|'negotiation'), payload jsonb,
created_at`. For coding: `{filename, code, test_results:[{name,passed,hidden}],
caught_the_lie:boolean}`. For whiteboard: node/edge graph. For negotiation:
concession log (anchoring, silence tolerance).

**`interview_verdicts`** — the AI committee grade (one per completed session).

```sql
create table if not exists public.interview_verdicts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null,                    -- 0–100
  prev_score integer,                        -- for the ▲/▼ delta
  verdict text not null
    check (verdict in ('strong_hire','hire','lean_hire','no_hire','strong_no_hire')),
  dims jsonb not null,                       -- [{slug,score,delta,bar_status}]
  evidence jsonb not null default '[]'::jsonb, -- [{ts_seconds,mark,title,note}] timestamped moments
  speech_analytics jsonb,                    -- {wpm,fillers_per_min,talk_ratio,avg_pause} — NULL for typed
  summary_sentence text,
  claims_checked integer,
  words integer,
  created_at timestamptz not null default now()
);
-- RLS: own-row select; INSERT via service role only (grader action) — mirror
-- 0103_academy_assessments_lock_writes (no client insert of a self-scored grade).
```

**`interview_readiness`** — current six-dimension scores (6 rows/user).
`user_id, dimension_slug, score int, trend int, bar_status text, updated_at`,
`unique(user_id, dimension_slug)`. Overall readiness is **derived** (capped by
min) — not stored fabricated. Empty until the first real verdict exists.

**`interview_readiness_snapshots`** — the Progress chart series.
`id, user_id, captured_at, overall int, dims jsonb, event text` (`'placement'`,
`'loop 1'`, `'today'`). One row per graded session/loop. Projection line is
computed client-side and clearly labeled as a projection.

**`interview_drills`** — debrief → drill plan.
`id, user_id, verdict_id, scenario_id, tag, title, meta, status ('queued'|'done'),
created_at`.

**`interview_loops`** — full loop simulation header.
`id, user_id, company_preset_id, scheduled_at, status, overall_verdict, created_at`.
Rounds are `interview_sessions` with `loop_id` set.

**`interview_schedule`** — weekly plan / taper slots.
`id, user_id, slot_date, slot_time, track, session_type
('hard_rep'|'dress_rehearsal'|'light'|'taper'|'go_time'), what, meta, est_minutes,
scenario_id, status ('planned'|'done'), created_at`.

**`interview_reminders`** — `id, user_id, label, kind, enabled boolean, fire_at`.

**`interview_stories`** — STAR story bank (8-signal coverage).
`id, user_id, signal ('ownership'|'conflict'|'failure'|'influence'|...), title,
star jsonb ({situation,task,action,result}), grade ('lands'|'rough'|'gap'),
updated_at`. Gaps are rows with no story yet.

**`interview_pipeline`** — offer tracker.
`id, user_id, company, role, stage ('applied'|'recruiter_screen'|'onsite'|'offer'|
'rejected'), next_at, notes, created_at`.

**`interview_company_briefs`** — AI-generated per-user brief.
`id, user_id, company, role, source_jd_filename, decoded jsonb ([{phrase,means}]),
rounds jsonb ([{name,focus,readiness}]), edge text, risk text, queue jsonb,
confidence text, created_at`.

**`interview_peer_matches`** — Pairs (async, see §7).
`id, user_id, peer_user_id, status ('requested'|'matched'|'scheduled'|'completed'),
track, slot_text, note, created_at`. **No live-room / presence fields** — that is
a deliberate scope boundary (§7).

### 3c. Commerce / entitlement

**`interview_subscriptions`** — mirrors `academy_allaccess_subscriptions` (`0084`).
`id, user_id, email, stripe_subscription_id (unique), stripe_customer_id, status,
plan_interval ('monthly'|'yearly'), current_period_end, cancel_at_period_end,
auto_pause_at timestamptz, price_amount, price_currency, updated_at`. The
`auto_pause_at` column implements the "auto-pause 30 days after an offer is
logged" promise. Own-row select; service-role write from the Stripe webhook.

---

## 4. Reuse map (existing helpers — name them, don't reinvent)

| Need | Reuse | New sibling to add |
|---|---|---|
| Design tokens | `styles/academy-tokens.css` (`--sa-*`) — interview hex already matches | none (screens are already on-token) |
| Auth / session | `createSupabaseServerClient`, `supabaseAdmin` (`lib/supabase/server.ts`) | — |
| Academy access | `getAcademyAccess()` (`lib/academy/access.ts`) | **`lib/academy/interview-access.ts`** → `getInterviewAccess()` reading `interview_subscriptions` (mirror `getActiveMembership`) |
| Plans / price IDs | `lib/academy/plans.ts` | **`lib/academy/interview-plans.ts`** — env `STRIPE_PRICE_INTERVIEW_ADDON_MONTHLY` / `_YEARLY`, `interviewPlansConfigured()` |
| Checkout | `app/api/checkout/route.ts` (`kind` dispatch) | add **`kind: 'interview'`** branch (`mode: 'subscription'`, idempotency key, metadata `kind=interview`) |
| Webhook → entitlement | `upsertAcademyMembershipFromSubscription` (`lib/academy/membership.ts`) | **`upsertInterviewSubscriptionFromSubscription`** (guard `metadata.kind === 'interview'`) |
| AI calls | `deepSeekChat` / `deepSeekChatStream` (`lib/rag/deepseek.ts`) | interviewer + grader + brief actions (§5) |
| AI logic pattern | `lib/academy/grader-logic.ts` (pure builder + parser + `looksLikeInjection`) | **`lib/academy/interview/*-logic.ts`** per AI surface |
| Streaming route pattern | `app/api/academy/tutor/route.ts` (SSE, userId from session) | **`app/api/academy/interview/session/route.ts`** |
| Coding execution | existing in-browser **Pyodide** lab runner (`components/academy/lesson/`) | run the "lying" test suite client-side; POST results |
| Code editor surface | `components/academy/lesson/CodeSurface.tsx` | reuse for the Session coding workspace |

---

## 5. AI integration (server-side only, via `deepSeekChat` / `deepSeekChatStream`)

Every call: userId derived from the session (never the body), messages built by a
pure `*-logic.ts` module, response parsed + validated there, `looksLikeInjection`
guard on learner free-text. All observability flows through the existing DeepSeek
wrapper.

1. **Marlowe interviewer turns** — `deepSeekChatStream`, streamed SSE like the
   tutor route. **System-prompt intent:** *"You are Marlowe, a `{style}`
   interviewer running a `{level}` `{track}` interview. Ask one question at a
   time. Interrupt when the candidate hand-waves. For coding, force them to PROVE
   correctness with a runnable test, not prose — never reveal the hidden test.
   Stay in character; do not coach unless a hint is explicitly requested."* Input
   = scenario `interviewer_prompt` + transcript so far + latest candidate turn.
2. **Committee verdict grader** — `deepSeekChat`, temp 0, JSON out. Reuse the
   `grader-logic.ts` shape. **Intent:** *"You are a hiring committee grading this
   transcript against the `{level}` bar across six dimensions. Score each 0–100,
   cite timestamped evidence, cap the overall by the weakest dimension, and
   return committee language (`strong_hire…strong_no_hire`). Reward proving
   claims; penalize asserting without testing."* Input = full transcript +
   artifacts (incl. `caught_the_lie`) + rubric definitions. Output validated to
   the `interview_verdicts` shape.
3. **Verification-twist evaluation** — **deterministic, not AI.** The "one test
   passes for the wrong reason" is a property of the scenario's `seed_tests`
   (`passes_for_wrong_reason: true`), evaluated by the Pyodide runner. AI's role
   is only Marlowe's probing + the grader crediting/penalizing whether the
   candidate *caught* it.
4. **Company brief generator** — `deepSeekChat`, JSON out, from parsed JD text.
   **Intent:** *"Decode this JD into interview implications, predict the likely
   loop and focus areas, name the candidate's edge and risk from their session
   history, and propose a tuned scenario queue. Use only the public JD + the
   member's own history; never fabricate private company data."*
5. **Debrief drill planner** — `deepSeekChat`, JSON out. **Intent:** *"Given this
   verdict and the weakest dimensions, propose exactly three follow-up drills
   (mapped to real scenarios) that attack the cap first."*

**Not AI:** speech analytics (derived from STT transcript timing — depends on the
voice stack, §7), the readiness cap (deterministic min over dimensions), and the
transactional emails (data-driven templates).

---

## 6. Component inventory

| Component | Type | Basis |
|---|---|---|
| `ReadinessGauge` | new | SVG ring (circumference 477, dash math from design), center score, bar marker |
| `RubricBars` | new | six dimension bars with a `│` bar-marker at the level bar; color by `bar_status` |
| `MockSessionRunner` | new | split layout: transcript stream (left) + mode workspace (right) |
| `TranscriptStream` | new | streamed SSE turns, speaker bubbles, timestamps, "listening…" state |
| `CodingWorkspace` | reuse+wrap | wraps `CodeSurface.tsx` + Pyodide runner + test-results row (incl. the hidden test) |
| `WhiteboardCanvas` | new | system-design node/edge tool (box/edge/text) |
| `StarTracker` | new | STAR fills-as-you-speak (S/T/A/R marks) |
| `NegotiationSheet` | new | offer cards + private anchors + concession tracker |
| `VerdictScorecard` | new | processing → reveal, count-up ring, committee label + evidence sentence |
| `DebriefTimeline` | new | timestamped moments (tap-to-replay), speech-analytics tiles, rubric movement |
| `ScheduleTaper` | new | week grid with `session_type` styling, onsite running order, reminder toggles |
| `LibraryFilters` + `ScenarioCard` | new | track filters, "attacks your cap" pill, weakest-first sort |
| `ReadinessChart` | new (or reuse academy viz primitives) | readiness-over-time + cohort percentile + skill trajectories |
| `OfferTracker` | new | pipeline stages |
| `StoryBank` | new | 8-signal coverage grid |
| Lesson shell / rail / typography | reuse | `components/academy/lesson/*.module.css` grammar |

---

## 7. What is REAL vs STUBBED (honesty)

**Absolute rule: no fabricated readiness or verdicts anywhere.** A new subscriber
sees the Cockpit **first-run empty state** ("No score. No plan. One mock fixes
both.") — the rich numbers (78 readiness, six bars, history, offer tracker) only
render once real `interview_sessions` / `interview_verdicts` exist. The design's
hardcoded arrays are seed fixtures/reference, not shipped defaults.

| Surface | Real | Stubbed / honest-empty |
|---|---|---|
| Onboarding | writes real `interview_profiles` | JD parsing is a thin PDF→text step (see flag) |
| Session (typed) | real Marlowe turns, real transcript, real Pyodide test run | — |
| Session (voice) | — | STT/TTS/barge-in behind a flag (§ dependency); typed is the scored MVP substrate |
| Verdict / Debrief | real AI grade from the real transcript | speech-analytics tiles **omitted** for typed sessions (design says typed is scored on everything except speech analytics) |
| Readiness / Progress | derived from real verdicts + snapshots | empty until sessions exist; projection line labeled "projection" |
| Company Brief | real AI generation from the attached JD | only appears after a JD is attached |
| Pairs | async request → scheduling state | **no live peer / no A/V room** — deliberately deferred (dependency below) |
| Cohort percentile | needs ≥ N graded members | show "not enough data yet" until the cohort is real |

### Dependencies I cannot fully satisfy from the current stack — FLAGGED

1. **Real-time voice** (streaming STT for the candidate, TTS for Marlowe,
   barge-in/interruption, mobile haptics). `deepSeekChat` is text-only. Speech
   analytics (wpm / fillers / talk-ratio / pause) depend entirely on this.
   **Recommendation:** ship typed mode first (fully scored minus speech
   analytics); add a browser-SpeechRecognition or Whisper/Deepgram STT + a TTS
   voice as a flagged Phase-4 integration. This is the single biggest net-new
   dependency in the designs.
2. **Live peer pairing (Pairs).** Marketing copy says "interview a stranger,"
   but the design ships only anonymized async slots (`request → requested`), with
   **no** room/presence/A-V fields. A true live version needs a matching service
   + scheduling + a WebRTC/websocket room + presence. **Recommendation:** build
   only the async request+scheduling stub (matches the actual data shape); defer
   live rooms and label the feature "async peer loops."
3. **Code execution.** Reuse the existing in-browser Pyodide lab runner rather
   than standing up server-side sandboxed execution. Confirm the hidden-test
   mechanism (`seed_tests[].passes_for_wrong_reason`) runs client-side.
4. **JD parsing.** Company Brief + Onboarding accept a PDF JD; needs a
   PDF→text extraction step before `deepSeekChat`. Minor, but net-new.
5. **Stripe.** Checkout in the design is a mock (Visa ···· 4242, pay button
   navigates). Real build = new recurring Stripe price + `kind: 'interview'`
   checkout + webhook, gated OFF until price IDs are set (same pattern as the
   all-access gate).
