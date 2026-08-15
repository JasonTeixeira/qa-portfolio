# Sage Academy — Information Architecture (every page · tab · sub-tab, aligned)

> The canonical sitemap. One nav tree, one learn path, one course entry. This is the contract
> the foundation builds to — and the consolidation plan for the sprawl that exists today.
> Reads with [FOUNDATION.md](./FOUNDATION.md) + [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

## The problem this fixes (live route audit, 2026-06-26)
The current `app/academy/*` surface has **drifted and duplicated**:
- TWO learn paths: `/academy/[track]/learn` **and** `/academy/learn/[course]/[lesson]`.
- TWO course entries: `/academy/[track]` **and** `/academy/course/[slug]`.
- Orphan surfaces with no nav home: `/efficacy`, `/evidence`, `/engine`, `/engine/lab`,
  `/resources`, `/resources/sprint-loop`, `/build`, `/preview`.
There is no tab/sub-tab hierarchy. **Consolidation is Tier-1 foundation work, not optional.**

## The canonical primary nav (the only top-level tabs a learner sees)
A persistent left rail (desktop) / bottom bar + drawer (mobile). Exactly six destinations:

| Nav item | Route | Purpose | Loop role |
|---|---|---|---|
| **Home** | `/academy` → `/academy/dashboard` | Continue, daily goal, streak, up-next, AI guide | the **Trigger** of the habit loop |
| **Learn** | `/academy/catalog` | The universe: catalog + content map + paths | course discovery |
| **Review** | `/academy/review` | Board-style due recall + error-log repairs (FSRS) | the **Investment** beat |
| **Compete** | `/academy/leagues` | Leagues + community | variable reward + relatedness |
| **Progress** | `/academy/profile` | Mastery map, streak, certificates, evidence ledger | evidence **visibility** |
| **Guide** | (overlay, not a route) | The AI guide — persistent, everywhere | feedback + grader |

Everything else is a child of one of these or a flow (auth/onboarding/admin). No orphans.

## Page-by-page (tabs · sub-tabs · what's on it · data)

### Home — `/academy/dashboard`
No tabs (it's the launchpad). Surfaces: **Continue where you left off** (big), daily-goal ring,
streak calendar strip, **Up Next**, **Due for Review** count → Review, mastery-map glance, AI
guide entry. First-run state routes to **Course 00** (see Onboarding). Data: enrollment, FSRS
due, streak, daily goal, mastery rollup.

### Learn — `/academy/catalog`
Tabs:
- **Catalog** (default) — all tracks → courses, filterable; enrolled state + progress bars.
- **Content Map** — the universe graph (12 tracks → courses → lessons), prerequisites,
  done/unlocked, "you are here". (Folds the mastery-system concept-attachment graph.)
- **My Courses** — `/academy/my-courses` content; active enrollments + continue.
- **Paths** — `/academy/build` content; build-your-own-path from the map.
Data: courses/modules/lessons spine, enrollment, prerequisite edges, progress.

### Course overview — `/academy/course/[slug]`
The single course entry. Tabs:
- **Overview** — scenario/mission of the course, what you'll build, outcomes, time, level.
- **Syllabus** — modules → lessons (the 17-section / 5-beat units), locked/unlocked + the
  8-state badge per unit; the persistent course-outline lives here and in the player rail.
- **Progress** — per-lesson %, score + *why it's capped* (the score-cap engine, visible).
- **Board** — the course's board assets (question bank · spaced cards · error log · attack
  outline · oral defense · mixed practice · confidence · atlas). Stickiness layer (§6).
Sub-route: `assessment/[kind]` — pretest/posttest gate. Data: course spine, enrollment, evidence,
caps, board assets.

### Lesson player — `/academy/learn/[course]/[lesson]`  (the ONE learn path)
Three-pane institutional shell:
- **LEFT rail** — course outline + the 8-state machine per unit (checkmarks/locks); current
  position; course progress bar.
- **CENTER** — the **5-beat sprint** (HOOK → MODEL → DO → PROVE → LOCK), evidence-gated; the
  "Complete" affordance disabled until EvidenceEvents exist.
- **RIGHT rail** — up-next, daily-goal ring, streak, **AI guide** (hint/explain/next + grader).
Sub-route: **`/lab`** — the Pyodide lab IDE (runnable) or reasoning/diagnosis surface by domain.
Data: lesson blocks, evidence events, FSRS, guide context (blocks + deep-nodes).

### Review — `/academy/review`
No tabs. The board scheduler: due recall cards + error-log repairs + transfer prompts (FSRS).
Writes `repair_*` / `transfer_*` / spacing events. A gate-failure anywhere routes **here**
(repair, don't punish), not to a dead end.

### Compete — `/academy/leagues`
Tabs:
- **Leagues** (default) — current league, standings, weekly promote/relegate, XP.
- **Community** — `/academy/community` content; cohorts, discussion, Discord link.
Data: league logic, XP, community.

### Progress — `/academy/profile`  (+ public `/academy/u/[handle]`)
Tabs:
- **Mastery** (default) — the skill/mastery heat-map + the "you are here" map; evidence-driven.
- **Activity** — streak calendar, XP/level, daily-goal history.
- **Certificates** — earned certs (`/academy/certificate/[code]` is the public cert page).
- **Evidence** — the honest evidence ledger (folds `/academy/evidence`) + efficacy /
  mastery-gain (folds `/academy/efficacy`): pre/post, Hake's `g`, what's proven.
- **Refer** — `/academy/refer` content. Data: mastery rollup, evidence, certs, efficacy, referral.

### Flows (not in primary nav)
- **Onboarding / Course 00** — `/academy/onboarding` → teaches the 5-beat method itself (§12.3);
  folds `/academy/resources` + `/resources/sprint-loop` ("how it works") as the method primer.
- **Auth** — `/academy/join` · `/academy/signup` (+ existing site auth).
- **Marketing preview** — `/academy/preview` (public, kept separate from the app).
- **Admin** — `/academy-admin` (authoring studio) · `/academy-admin/[course]/[lesson]` ·
  `/admin/academy` (ops) · `/academy-admin/metrics` (CURR / mastery-gain / calibration, §12.2).

## Consolidation plan (Tier-1)
> **Route audit finding (2026-06-26):** the `/academy/[track]` family is NOT a duplicate of the app —
> it's a **separate marketing/SEO layer** (static `data/academy/tracks.ts`, public + indexable, Course
> JSON-LD) whose slugs (`ai-native-product-building`) are a different namespace from course slugs
> (`python-basics`). There is no track→course resolver, so a naive redirect would 404. **Redirecting
> is NOT safe yet** — and per this doc's own rule (public marketing kept separate from the app), the
> right resolution is to KEEP `[track]` as the marketing namespace, not fold it into the app. Deferred,
> not skipped: a track→flagship-course resolver is the prerequisite, tracked as a Tier-3 item.

| Today | Action |
|---|---|
| `/academy/[track]`, `/academy/[track]/learn` | **Keep as the marketing/SEO layer** (separate namespace). Redirect into the app is BLOCKED on a track→flagship-course resolver — do not redirect until it exists (would 404 on slug mismatch). |
| `/academy/[track]/enroll` | Keep as the marketing enroll action. |
| `/academy/efficacy`, `/academy/evidence` | **Fold** into Progress → Evidence tab (redirect). |
| `/academy/engine`, `/engine/lab` | Internal engine demo — **remove from learner nav**; keep as dev-only or delete. |
| `/academy/resources`, `/resources/sprint-loop` | **Fold** into Onboarding / "How it works". |
| `/academy/build` | **Fold** into Learn → Paths tab. |
| `/academy/my-courses` | **Fold** into Learn → My Courses tab (keep route as deep-link). |
| `/academy/community` | **Fold** into Compete → Community tab (keep route). |

Rule: a redirect is honest (no broken links); deletion only for dev-only surfaces. Every
remaining route maps to exactly one nav home. **No surface without a home.**

## Done = the IA gate (part of FOUNDATION.md done-gate)
One nav tree · one **app** learn path (`/academy/learn/[course]/[lesson]`) · one **app** course entry
(`/academy/course/[slug]`) · the `[track]` marketing layer kept deliberately separate (not a dup) ·
every page/tab above exists or is a deliberate honest empty-state · nothing orphaned. The only
deferred item is the track→flagship-course resolver (Tier-3), which unblocks any future marketing→app
redirect — its absence is documented, not a silent gap.
