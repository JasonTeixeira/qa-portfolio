# Loop Hardening — the rules that make the academy loops safe to run unattended

> Shared by all three loops — [LOOP.md](./LOOP.md) (engine), [CONTENT_LOOP.md](./CONTENT_LOOP.md)
> (courses), [UX_LOOP.md](./UX_LOOP.md) (experience). These close the gaps that
> separate "a loop that works while I watch it" from "a loop that builds correctly by
> itself." Every pass of every loop MUST obey these.

## 1. Stable target (no flaky dev server)
A loop renders/tests every pass, so the target must be stable.
- **Before any pass that renders**, run `bash scripts/academy/ensure-clean-server.sh`.
  It kills stray Next processes, clears the corrupt `.next/dev` cache, restarts ONE dev
  server on :3040, and blocks until it serves 200. It is idempotent + safe to re-run.
- **One Next process only.** A concurrent build corrupts `.next` (ENOENT routes-manifest,
  "compaction already active") → blank pages + false gate failures. If `ensure-clean-server`
  detects a second Next process it cannot own the port, it logs and aborts the pass — do
  NOT push through; surface it.
- For UX/perf-sensitive sweeps, prefer a **production serve** (`next build` once, then
  `node scripts/serve-prod.mjs`) — far more stable than dev. Rebuild only when code changes.

## 2. No regressions — full sweep, before/after
- A pass is GREEN only when the **entire relevant gate suite** passes, not just the
  surface/lesson it touched: typecheck + build + ALL academy e2e + (UX) a11y + (content)
  check-course. A pass that turns any previously-green check red is **not done**.
- **Before/after capture** (UX loop): screenshot the affected surfaces BEFORE editing and
  AFTER; the design reviewer compares them — a pass may not make any surface look worse.
- Never delete or weaken a test/gate to make a pass go green. If a gate is wrong, fix the
  gate deliberately and say so in the commit.

## 3. Decompose big deliverables
A deliverable that can't be built + fully gated in one pass (content map, AI tutor,
left/right rails, search) is split into sub-passes, each independently gated + committed:
1. data/lib layer (pure, unit-tested) → 2. component (renders, a11y) → 3. wiring (real
data, render e2e) → 4. responsive (4 breakpoints) → 5. polish (visual audit ≥95).
The ledger tracks the deliverable as `WIP (n/m sub-passes)` until every sub-pass is green.

## 4. Stuck-handling (never commit red, never spin)
- If a pass can't clear its gates + review after **3 fix attempts**, `git restore` the
  working changes (revert the pass), write a `BLOCKED: <reason>` line in the ledger, and
  move to the next item. Never commit a red pass.
- **No-improvement detector:** if two consecutive passes on the same category don't raise
  its reviewer score, stop iterating it, mark it `STALLED: <what's needed>`, and escalate
  to a human note instead of looping forever.
- **Backstop:** a hard cap of ~60 passes per loop run; if hit before convergence, stop and
  write a status report. (Prevents runaway cost.)

## 5. Convergence is anchored, not self-graded
A category/dimension reaches its target ONLY when:
- the **objective gates** pass (typecheck · build · a11y 0 serious/critical · render e2e ·
  no responsive overflow · lab determinism / content gate as applicable), AND
- the **review agents** explicitly say so with evidence — the design/UX reviewer, looking
  at the after-screenshots, states it "reads world-class" and scores ≥95; the code/a11y
  reviewer has 0 open CRITICAL/HIGH.
The loop does NOT mark its own score from self-assessment. The reviewer's verdict + the
gate output are the score. Quote both in the ledger update.

## 6. Wiring dependencies — build the mechanism, flag the key, never fake
Some features need a secret/service the loop can't supply:
- **AI tutor → DeepSeek** API key (the academy LLM is DeepSeek-only). Build the full
  tutor + a graceful "AI guide is being configured" state; gate the prompt-grounding logic
  with unit tests; mark the dimension `mechanism ✓ — needs DEEPSEEK key to answer live`.
- **Notifications → VAPID / RESEND**, **rate-limit → Upstash**, **CWV → Lighthouse CI**.
- Policy: build + unit-test the mechanism, degrade gracefully without the key, and record
  the honest blocked state in the ledger. NEVER fabricate output, data, or a passing key.

## 7. The review rubric (so scoring is consistent across passes)
The loops dispatch two reviewer agents each pass. Give them THESE criteria verbatim.

**Design / UX reviewer (reads the screenshots at 4 breakpoints):** score 1–100 on —
1. First impression / does it look like a premium product, not a template?
2. Visual hierarchy — can the eye find the primary action / the lesson / the progress in <5s?
3. Navigation clarity — could a brand-new learner get from dashboard → their lesson → back, and always know where they are?
4. Progress legibility — is progress visible and honest on this surface?
5. Rhythm/spacing/depth/type/color per `~/.claude/rules/ecc/web/design-quality.md` (≥4 of the required qualities).
6. State coverage — empty, loading, and error states are designed, not blank.
7. Mobile (320/375) — usable, no overflow, touch targets ≥44px.
8. Motion — purposeful, compositor-friendly, respects reduced-motion.
Report gaps with concrete fixes; only call a surface ≥95 if it would survive a screenshot in a real premium-product showcase.

**Code / a11y reviewer (reads the diff):** semantic HTML; keyboard nav + visible focus;
ARIA only where needed + correct; no layout shift (CLS); no `dangerouslySetInnerHTML` on
unsanitized input; server/client boundary correct; component <800 lines; no dead/duplicate
code. Flag CRITICAL/HIGH; confirm what's solid.

## 8. Per-pass checklist (the loop pastes this as todos)
- [ ] ensure-clean-server (200 OK, one Next process)
- [ ] capture BEFORE screenshots (UX)
- [ ] build the change (match the design system / conventions)
- [ ] gates: typecheck · build · full e2e · a11y · responsive · content/lab as applicable
- [ ] capture AFTER screenshots; design reviewer scores vs world-class
- [ ] code/a11y reviewer on the diff; fix all CRITICAL/HIGH; re-gate
- [ ] re-score from the reviewer verdict + gate output (not self-assessment)
- [ ] scoped commit; update the ledger (incl. BLOCKED/STALLED if applicable)
