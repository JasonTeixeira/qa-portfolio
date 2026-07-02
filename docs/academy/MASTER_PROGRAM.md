# Sage Academy — Master Program (the ultimate-system build, run autonomously)

> The operator approved running ALL five programs to make the academy the best on the
> planet: complete content, independently verified for accuracy, maximally interactive,
> translated worldwide, on the app stores. This doc sequences them, tracks progress, and
> is the resume point across context summarization + rate-limit cycles. Reads with
> [AUTHORING_PROGRAM.md](./AUTHORING_PROGRAM.md), [CONTENT_AUDIT.md](./CONTENT_AUDIT.md),
> [FRONTEND_DESIGN_HANDOFF.txt](./FRONTEND_DESIGN_HANDOFF.txt).

## Dependency order (why this sequence)
Content must exist before it can be verified; must be verified before it is translated
(never translate an error) or mass-marketed; interactivity layers onto verified content;
mobile packages the whole thing. So:

**P0 Complete content (→ 448/448)** → **P1 Independent accuracy verification** →
**P2 Interactivity + labs** → **P3 Translation** → **P4 Mobile (PWA → stores)**.
Community/portfolio threads throughout (substrate already exists).

## The engine (reused across programs)
The proven per-course loop: `gen-author-workflow` → Workflow(author) → `collect-payload`
(coerce + floor-check) → `apply-course --apply` → `sweep-lessons` (single-login render) →
`gen-score-workflow` → Workflow(score ≥95) → scoped commit. NEVER two 20-agent Workflows
at once. Rate-limit → back off, resume from the ledger. Same shape adapts to verify/translate.

---

## P0 — COMPLETE CONTENT (→ 448/448)
State: 424/448 done (21 courses). Remaining 2 courses:
- [ ] `career-programming_cs_foundations` (20) — DISTINCT CS/algorithms course (own source
      `01_programming_cs_foundations`; big-O, two-pointers, binary search, graphs, DP).
      Manifest un-excluded (410 mapped). Authoring in progress.
- [ ] `python-basics` (4) — no source curriculum; author from authoritative Python docs
      (context7) from scratch, or fold into programming-fundamentals + hide.
Exit: 23/23 courses, 448/448 lessons visual-first + render-verified ≥95.

## P1 — INDEPENDENT ACCURACY VERIFICATION (all 448) [POC PROVEN]
Tools: **context7** (library/framework API truth) + **WebSearch/WebFetch** (OWASP, RFC 9110,
MDN, NIST, SWEBOK, cloud docs). POC scored 3 lessons 82–98 and caught a real spec bug
(403→404 existence-leak in security-mindset-risk — fixed + committed).
Method (per course, Workflow): extract each lesson's technical claims → route (spec→web/RFC,
library-API→context7) → verdict CONFIRMED/IMPRECISE/WRONG with the quoted source → auto-fix
WRONG/IMPRECISE (targeted patch or re-author) → re-apply → re-score → commit. Dedupe by
source URL (OWASP/RFC/MDN pages reused across dozens of lessons) to bound fetch volume.
Output: a per-course accuracy report + a platform accuracy score. This is the marketing moat.
Exit: every lesson accuracy-verified ≥95 against primary sources; errors fixed.

## P2 — INTERACTIVITY + LABS
Have: Pyodide + `LabRunner` (27/448 runnable). Build:
- Executable labs across coding courses (backend/frontend/databases/CS-foundations) — real
  starter+check runs in-browser.
- Interactive ARTIFACT builders for judgment/design/leadership/security courses: fill-in
  ADR / decision-memo / threat-model / risk-register with live validation (matches the
  reviewable-artifact pedagogy — a "lab" that isn't code).
- More WASM runtimes (JS/TS via quickjs; SQL via sql.js) so labs aren't Python-only.
- Clickable/expandable diagrams (SageDiagram node → detail drawer).
Exit: every lesson has ≥1 real interactive element (lab, artifact-builder, or interactive viz).

## P3 — TRANSLATION (top world languages)
Infra: `scripts/translate-academy.ts` + `i18n:audit` + `i18n:verify`. Translate block
text/labels/captions + diagram node/edge labels per locale; keep code + structure.
Languages (by reach): Spanish, Mandarin (Simplified), Hindi, Arabic (RTL), Portuguese-BR,
French, Japanese, German, Indonesian, Russian. Add a technical-accuracy pass per locale
(terms of art must survive translation; RTL layout for Arabic). Run AFTER P1.
Exit: platform localized to the top languages, each with a passing i18n:verify + a technical
review sample ≥95.

## P4 — MOBILE (learn from anywhere)
Web = Next.js. Ship in order of speed-to-value:
- [ ] PWA: manifest + service worker + offline lesson cache (installable now).
- [ ] Capacitor wrapper → App Store + Play Store (Pyodide/labs work in webview).
- [ ] (optional) Expo/React Native rebuild for native-grade UX if warranted.
Exit: installable PWA live; store builds submitted.

---

## Master ledger
| Program | Status |
|---|---|
| P0 complete content (448) | IN PROGRESS — CS-foundations authoring; python-basics next |
| P1 accuracy verification | POC proven (bug caught + fixed); full run queued after P0 |
| P2 interactivity + labs | queued |
| P3 translation | queued (after P1) |
| P4 mobile | queued (PWA can start in parallel) |

## Guardrails (unchanged)
Grounded, never hollow. Verify before translate/ship. Scoped commits, no push. Never fake a
gate/score. One heavy Workflow at a time. Rate-limit → back off + resume from this ledger.
Checkpoint the operator at PROGRAM boundaries (not per-lesson).
