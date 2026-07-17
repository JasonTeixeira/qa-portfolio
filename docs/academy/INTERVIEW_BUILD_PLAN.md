# Sage Interview Academy — Phased Build Plan

> Vertical-slice plan for building the Interview Mastery add-on. Architecture:
> [`INTERVIEW_ACADEMY_SPEC.md`](./INTERVIEW_ACADEMY_SPEC.md). Each phase ships a
> demonstrable slice with real data + an acceptance check. No fabricated numbers
> at any phase — honest empty states until real user data exists.

Stack constraints (all phases): Next.js App Router, Supabase (RLS own-row for
per-user, service-role write for content/grades), `--sa-*` tokens, `deepSeekChat`
/ `deepSeekChatStream` server-side only. Reuse the helpers named in Spec §4.

---

## Phase 0 — Foundation (no AI, no fabricated data)

**Screens:** route scaffolds for all 14 surfaces (empty/first-run states only);
Cockpit first-run empty state fully built ("No score. No plan. One mock fixes
both.").

**Build:**
- `app/academy/interview/*` route tree (Spec §2), each rendering an honest
  empty/first-run state.
- **One migration `0115_interview_foundation.sql`**: all `interview_*` tables +
  RLS (content tables public-read/service-write; per-user own-row; `verdicts`
  service-insert-only). Seed `interview_levels` (bar ladder) + a handful of
  `interview_scenarios` incl. **`the-lying-test-suite`** + the 4
  `interview_company_presets`.
- `lib/academy/interview-access.ts` (`getInterviewAccess()`) + a gate flag
  `INTERVIEW_GATE_ENABLED` (ships OFF, like `ACADEMY_GATE_ENABLED`).
- `lib/academy/interview/rubric.ts` (6-dimension constant + bar-status logic).
- Nav entry: "Interview" link from the Academy dashboard; "← Academy" back link.

**Tables live:** all (schema); seeded content only. **AI:** none.

**Acceptance:** migration applies clean; every `/academy/interview/*` route
renders behind `needsAcademyLogin` with an honest empty state; nav links
round-trip; `getInterviewAccess()` returns `false` for everyone (gate off) without
crashing; RLS verified (a user cannot read another user's rows).

---

## Phase 1 — Core loop with a real AI mock (the product's spine)

**Screens:** Onboarding → Cockpit → Session → Verdict, end-to-end.

**Build:**
- **Onboarding** 5-step wizard writes `interview_profiles` (role, level, timeline,
  cadence, optional JD filename, evidence-portfolio toggle).
- **Session** (`typed` mode): `MockSessionRunner` — `TranscriptStream` streaming
  real Marlowe turns via `app/api/academy/interview/session/route.ts` (SSE, tutor
  pattern); `CodingWorkspace` wrapping `CodeSurface.tsx` + Pyodide runner + the
  "lying" test suite; writes `interview_turns` + `interview_artifacts`.
- **Verdict**: on "End & debrief", a server action grades the transcript via
  `deepSeekChat` (grader-logic pattern), writes `interview_verdicts` (service
  role), updates `interview_readiness` (+ a `interview_readiness_snapshots` row).
- **Cockpit**: real readiness dial + rubric bars + session history from the rows
  above; first-run empty state falls away after the first real verdict.

**Tables live:** `interview_profiles`, `interview_scenarios`, `interview_sessions`,
`interview_turns`, `interview_artifacts`, `interview_verdicts`,
`interview_readiness`, `interview_readiness_snapshots`.

**AI calls:** (1) Marlowe interviewer stream, (2) committee verdict grader — both
Spec §5.

**Acceptance:** a real user completes a typed coding mock (the lying-test-suite);
Marlowe interrupts and probes the boundary; running the suite surfaces the hidden
`passes_for_wrong_reason` test; ending it produces a real AI verdict with
committee language + timestamped evidence; the Cockpit readiness/rubric now show
**real** numbers derived from that session (min-capped), not fixtures.

---

## Phase 2 — Debrief, drill, schedule, library, progress (the mastery loop)

**Screens:** Debrief, Schedule, Library, Progress.

**Build:**
- **Debrief**: `DebriefTimeline` from `interview_verdicts.evidence` (tap-to-replay
  turns); rubric movement from readiness snapshots; drill planner (`deepSeekChat`)
  writes `interview_drills`.
- **Schedule**: `ScheduleTaper` week grid from `interview_schedule` +
  `interview_profiles.target_date` (taper phases: hard rep → light → taper → go
  time); reminder toggles (`interview_reminders`).
- **Library**: `LibraryFilters` + `ScenarioCard` over real `interview_scenarios`,
  sorted weakest-dimension-first using `interview_readiness`; "attacks your cap"
  pill from the real weakest dim; company presets.
- **Progress**: `ReadinessChart` from `interview_readiness_snapshots` (projection
  labeled), skill trajectories, habit ledger; cohort percentile shows "not enough
  data yet" until the cohort is real.
- **Story bank** on Cockpit reads `interview_stories`.

**Tables live (adds):** `interview_drills`, `interview_schedule`,
`interview_reminders`, `interview_stories`.

**AI calls:** debrief drill planner (Spec §5.5); speech analytics only if a voice
session exists (else omitted — honest).

**Acceptance:** finishing a session yields a debrief with **real** timestamped
moments and three drills mapped to real scenarios; Library filters/sorts real
scenarios by the user's real weakest dimension; Schedule renders a real taper from
the real target date; Progress plots only real snapshots.

---

## Phase 3 — Loops, peers, company brief (breadth)

**Screens:** Company Brief, Pairs (async), full loop simulation, Debrief polish.

**Build:**
- **Company Brief**: JD PDF→text step → `deepSeekChat` generator → writes
  `interview_company_briefs` (decoded phrases, predicted rounds, edge/risk, tuned
  queue). Only appears after a JD is attached.
- **Loop simulation**: `interview_loops` header + N `interview_sessions` with
  `loop_id`; an aggregate verdict from the round verdicts.
- **Pairs (async stub only)**: `interview_peer_matches` with `request →
  requested` state + text slots. **No live A/V room** — labeled "async peer
  loops" (Spec §7 flag).

**Tables live (adds):** `interview_company_briefs`, `interview_loops`,
`interview_peer_matches`.

**AI calls:** company brief generator (Spec §5.4).

**Acceptance:** attaching a JD produces a real AI brief grounded only in the JD +
the member's history; a 4-round loop sim produces a real aggregate verdict; a peer
request persists and flips to "requested" (no fake live presence claimed).

---

## Phase 4 — Commerce, comms, mobile, voice (monetize + polish)

**Screens:** Mastery landing, Checkout, Offer (win recap), Emails, mobile
responsive, optional voice.

**Build:**
- `lib/academy/interview-plans.ts` (env price IDs) + `kind: 'interview'` branch in
  `app/api/checkout/route.ts` (`mode: 'subscription'`) + webhook
  `upsertInterviewSubscriptionFromSubscription` → `interview_subscriptions`. Gate
  flips via `getInterviewAccess()`. Ships gated OFF until price IDs are set.
- **Mastery** landing + **Checkout** (real Stripe test) + **Offer** win recap
  (sets `interview_subscriptions.auto_pause_at = now + 30d` when an offer is
  logged).
- **Emails**: 5 lifecycle templates in `lib/email/interview/*` (sender
  `sprout@sageideas.dev`), triggered by real events (placement done, T-3,
  weekly digest, win-back, offer logged) — stats pulled from real rows.
- **Mobile**: responsive Session (voice-first, coding stays desktop-only) +
  Debrief at 320/375/390; verify no overflow.
- **Voice (flagged)**: STT for the candidate + a TTS Marlowe voice + barge-in;
  enables speech analytics. Behind a feature flag; typed remains the fallback.

**Tables live (adds):** `interview_subscriptions`.

**AI calls:** none new (voice reuses the Phase-1 interviewer stream over an STT
transcript).

**Acceptance:** an add-on purchase via Stripe test mode fires the webhook, writes
`interview_subscriptions`, and flips the gate so Cockpit unlocks; the 5 emails
send on their real triggers with real stats; all screens are overflow-free at
320–1440; logging an offer sets the 30-day auto-pause; (voice, if enabled,
produces a scored session with speech analytics).

---

## Cross-phase gates
- Every AI surface: userId from session, `looksLikeInjection` guard, JSON output
  validated in a pure `*-logic.ts` module (unit-testable), verdict inserts
  service-role only.
- Every per-user table: RLS own-row proven (cross-user read denied) before the
  screen ships.
- No screen ships with fixture numbers — empty state until real rows exist.
