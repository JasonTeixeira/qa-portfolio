# Sage Academy — Data Spine Contract (the 15 entities + enforcement primitives)

> The canonical schema every course maps into and the runtime enforces. This is the contract;
> the build reconciles it against the existing `academy_*` tables (via Supabase `list_tables` +
> the migration history) and adds only what's missing. **Net-new is the enforcement layer.**
> Reads with [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md) §5/§8/§10 + [FOUNDATION.md](./FOUNDATION.md).

## Reconciliation rule (do not fabricate, do not duplicate)
Before writing a migration, **list existing academy tables and migrations**. If a table here
already exists, extend it — never create a parallel one. The content tables (courses, lessons,
enrollment, XP, FSRS, leagues, referral, efficacy) largely EXIST. The **enforcement primitives
(EvidenceEvent · unit state · score-cap resolution) are the gap** — that's Tier-0's real work.

## The 15-entity spine (content + progress)
Grouped; each row is a logical entity (may be one table or a typed jsonb column on its parent).

**Structure**
1. **Course** — `academy_courses` (slug, topic, level, scenario/mission, outcomes, board-assets ref).
2. **Module** — course → ordered modules (id, course_slug, order, title).
3. **Lesson** — `academy_lessons` (course_slug, slug, the v3 17-section / 5-beat blocks jsonb,
   intensity, source citation). Unique `(course_slug, slug)`.
4. **Sprint** — the lesson's 16-block sprint (lives in the lesson blocks; REQUIRED_SECTIONS).
5. **Lab** — runnable (Pyodide) or reasoning; `check` string; reference solution.
6. **Capstone** — course-level project + rubric.

**Knowledge**
7. **Concept** — deep-node (id, title, body, prerequisites[] → the content-map edges).
8. **Skill** — what a unit certifies; maps to mastery-map nodes.
9. **RetrievalCard** — question bank + spaced-recall items (feeds FSRS + board).

**Artifacts & proof**
10. **Artifact** — what the learner builds (sprint output, lab result, capstone).
11. **Check** — a verification (lab check, rubric item, assessment question).
12. **PortfolioItem** — packaged proof attached to the learner profile.

**Progress & social**
13. **Enrollment / Progress** — per-learner course/lesson state, %, XP, streak, FSRS schedule.
14. **Review/Repair/Transfer record** — board scheduler state + the repair queue.
15. **Social** — league membership, community, referral, certificate.

## The enforcement primitives (NET-NEW — Tier 0, the foundation's spine)
These make the loop real product logic. Pure-logic-first (`lib/academy/*-logic.ts`, unit-tested)
before the DB/UI, per LOOP_HARDENING.

### `academy_evidence_events`
The currency. Append-only, **service-role write only** (anti-cheat), RLS read = owner.
```
id · user_id · course_slug · lesson_slug · unit_id
event_type   -- one of the 11 (see below)
payload jsonb -- e.g. {confidence_pre, score, grader:'ai', repair_id, ...}
created_at
```
The 11 event types (PLATFORM_ARCHITECTURE §5): `diagnostic_completed · retrieval_attempted ·
lesson_completed · sprint_artifact_created · lab_verified · repair_created · repair_completed ·
transfer_attempted · capstone_submitted · portfolio_item_created · interview_answer_scored`.
**No event may be written by the client.** Retrieval/explain-back events require the AI guide
or a server check as grader; confidence is captured **before** the answer.

### Unit state (the 8-state machine) — `academy_unit_state` (or derived view)
```
user_id · unit_id · state
state ∈ { locked, ready, in_progress, proof_pending, review_pending,
          repair_required, transfer_due, complete }
```
Transitions are a **pure function** of the unit's accumulated EvidenceEvents — never set
directly by the UI. `complete` is reachable only when all required events for that unit exist.
A failed gate → `repair_required` → routes to the repair queue (never a dead end).

### Score-cap resolution — `lib/academy/caps-logic.ts` (pure) + a read view
The binding score is the **minimum** of every applicable cap:
- V3/Board caps (§5): no retrieval→70 · no artifact→72 · no verification→78 · no broken→82 ·
  no explain-back→84 · no review→86 · no repair→88 · no spacing→90 · no transfer→92 ·
  no portfolio→94 · no board asset→95 · no external/outcome→98.
- §12 contract caps: no scenario-first→90 · no AI-guide grounding→93 · no habit triggers→92 ·
  no mastery-map entry→92 · no social surface→94.
`resolveScore(evidence, contract) = min(100, …all caps…)`. The UI shows the binding cap and the
*next event that would lift it* ("verify your build to lift 78 → 82"). **No path to 99+ without
real-outcome evidence** — the resolver cannot return ≥99 from internal events alone.

### Measurement (§12.2) — `lib/academy/metrics.ts` over the events
Derived, honest (shows "collecting" until n is real): **CURR** (retention), **mastery-gain**
Hake's `g = (post−pre)/(100−pre)`, evidence-completion funnel per beat, confidence calibration
(predicted vs actual), beat-level drop-off. Surfaced on `/academy-admin/metrics`.

## Invariants (the foundation guarantees these for every course)
- Evidence is append-only and server-written. A learner cannot fake an event.
- State is a pure function of evidence. "Complete" cannot be set without the events.
- Score is the min of all caps. A course cannot self-grade above its earned evidence.
- 98–99 is unreachable without real-outcome rows. The ceiling is structural, not a policy.

## Tier-0 done-gate (part of FOUNDATION.md)
- [ ] Existing academy tables listed; spine reconciled (no duplicate parallel tables).
- [ ] `academy_evidence_events` + unit-state + caps resolver exist; RLS + service-role writes.
- [ ] Pure-logic unit tests: state-machine transitions + cap resolution + metrics math, green.
- [ ] A scripted EvidenceEvent sequence drives a unit locked→complete and resolves a capped score.
