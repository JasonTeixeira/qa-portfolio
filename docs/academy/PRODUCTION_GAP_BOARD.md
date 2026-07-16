# Production Gap Board — Tech Academy + Interview Academy → 95–99+

**Generated 2026-07-16** from: full-repo route audit vs `design-source/sage-academy-2026/HANDOFF.md`,
commerce/infra audit, the 32-course content board (`proof-artifacts/academy/CONTENT_BOARD.json`),
and the live voice/storyboard coverage scan. This is the definitive "what's left."

## The one-line truth

The **learner app is ~90% built and genuinely good** (dashboard, player, labs, recall/FSRS,
leagues, evidence, certificates, tutor, gamification all real). What separates it from a
production 95–99+ academy: **23 thin courses, 24 un-voiced courses, the entire Interview
product (0% built), the official design skin, and a broken commerce path** (can't take money
today).

## Workstream board

### 1 · CONTENT — the biggest lift
| Item | State | Gap |
|---|---|---|
| 9 courses (system-design + 8 rebuilt) | ✅ world-class sprint arc | — |
| 23 courses (all career-* + prog-fund + python-basics, ~460 lessons) | ❌ thin format | Upgrade to full sprint arc: worked-example + lab (code or artifact) + debug + tradeoff + unlock-gate. Pilot `career-backend_engineering`, then Workflow batch. |

### 2 · VOICE — one batch away
| Item | State | Gap |
|---|---|---|
| 8 courses | ✅ voiced (approved ElevenLabs clone) | — |
| 23 courses | storyboards DONE (~3,400 beats), no audio | Narrate with VoiceBox **kokoro Eric (US)** ($0) → apply-audio → storage. Jason's clone swaps in later (WIP profile 9cfec560). |
| system-design | ❌ no storyboards | Generate storyboards first, then voice. |

### 3 · VISUAL EXPERIENCE — "ultimate visual" layer
| Item | State | Gap |
|---|---|---|
| LessonPlayer | instrument pass: visual ~90 / UX ~91, a11y 100 | Apply the OFFICIAL `Sage Lesson Player.dc.html` skin (supersedes/merges terminal pass) + finite polish list (code-scroll fade, back-half station variance, diagram arrowheads, elevation tier). |
| App screens skin | functional, pre-design-system | Re-skin dashboard/recall/progress/evidence/profile/certificate to the `Sage *.dc.html` set; extract `Sage Academy Design System.dc.html` tokens FIRST. |
| Diagram kits | pulled, unwired | Wire System Design Kit / Data Viz & Widgets / Algorithms-in-Motion into academy diagrams. |
| Production Package (video) | design only | Title stingers + transitions + 16:9 export frames — "every lesson opens like a film." |

### 4 · INTERVIEW ACADEMY — 100% missing (largest single build)
15 designed screens, zero code: Cockpit, Mastery, Session, Pairs, Verdict, Schedule, Library,
Company Brief, Offer, Checkout, Debrief, Progress, Onboarding, Mobile, Emails. Net-new product +
upsell revenue. Needs: data model (mock sessions, readiness scores, verdicts), AI interviewer
(verification-twist mocks), scheduling, its own Stripe product.

### 5 · MISSING APP SCREENS (spec pillars)
- **Placement/diagnostic** — no route (drives "start at the right level").
- **Team Admin** (manager verdicts/artifacts/mastery view) — required for the $190-seat tier.
- **Dedicated 2-click cancel/pause screen** (folded into settings today; spec = distinct flow).
- **Weekly Challenge as a real feature** (table+UI; today only a static engine label).
- Public URL shapes: `/@[handle]` and `/certificates/[id]` (exist at academy-prefixed paths).

### 6 · COMMERCE — launch blockers (can't take money today)
1. `STRIPE_PRICE_ACADEMY_*` unset + key/account mismatch vs STRIPE_PRICE_MAP.md → checkout 409s. **[JASON: reconcile account, create prices]**
2. Paywall gate OFF (`ACADEMY_GATE_ENABLED` unset) — everything free. **[JASON: flip at launch]**
3. No self-serve cancel/pause/downgrade/proration; no Billing Portal session.
4. Team/$190-seat billing entirely missing.
5. Price copy $25 vs spec $29.

### 7 · PRODUCTION INFRA
- Rate limiting in-memory (Upstash unconfigured) — bypassable at scale. **[JASON: Upstash account]**
- Sentry DSN unset (errors uncaptured); 15 Vercel crons with no heartbeat monitor. **[JASON: DSN]**
- **Certificate revocation is fake** (`revoked` hardcoded false — verify endpoint's REVOKED unreachable). Undermines the signature trust claim.
- No certificate PDF/print export.
- Emails: recall-due + receipt templates missing; academy learner weekly digest missing (studio digest exists); hand-written HTML not react-email.
- Search in-memory only (spec: pg_trgm/Typesense).

### 8 · ENGAGEMENT/MASTERY LOOP — mostly built ✅
Socratic tutor (RAG, wired), FSRS recall + review queue, mastery/evidence engine, scenario
quizzes (1,684 Q), XP/streaks/badges/leagues/daily goals, web-push. Gaps: weekly challenge
feature, placement, recall-due email.

## Order of attack
1. **Content batch** (pilot backend-engineering → 22-course Workflow) — biggest lift, no deps.
2. **Voice batch** (Eric, $0) — parallel with content.
3. **Design tokens → LessonPlayer official skin → app screens** — the visual experience.
4. **Commerce hardening** (portal/cancel/pause, revocation, seat billing) + Jason's account items.
5. **Interview Academy build** (vertical slices: Cockpit+Session+Verdict first).
6. **Missing screens** (Placement, Team Admin, Weekly Challenge) + emails + search.
7. **Ship gate**: prices live, gate ON, Sentry/Upstash live, prod Lighthouse, full harness board green.

## Jason-only items (nobody else can do these)
- Stripe: reconcile which account is canonical; create the $29/$250/$190-seat prices there.
- Provision Upstash Redis + Sentry DSN (accounts/keys).
- Flip `ACADEMY_GATE_ENABLED` at launch (business call).
- Final voice sign-off (Eric renders now; your clone later).
- Design-taste sample sign-offs at each phase gate (rubric §6).
- Rotate the ElevenLabs API key (was pasted in chat).
