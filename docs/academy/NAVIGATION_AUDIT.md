# Sage Academy — Navigation & IA Audit (toward 99+ human appeal, mobile-ready)

> Evidence-based audit of the current navigation/information-architecture. Goal: one canonical, dumb-proof,
> mobile-ready flow so a learner always knows where they are and can reach the course they need in the fewest taps.

## A. What exists today (the map, as built)
**Main menu (desktop top bar), 5 items:**
`My Learning` → /dashboard · `Learn` → /catalog · `Review` → /review · `Compete` → /leagues · `Progress` → /profile.
Plus: brand mark → /dashboard, ⌘K search, level/XP chip, Sign out.

**Mobile nav:** a `TabBar` component EXISTS (`components/academy/shell/TabBar.tsx`) but is **not globally mounted** —
it's only referenced inside the catalog page + a sub-nav. So on a phone you get the cramped desktop top bar, not a
real bottom tab bar.

**The course pipeline (happy path):** land → login → /dashboard → /catalog → /course/[slug] → /learn/[course]/[lesson] → /learn/.../lab → /review.

**Per-page layout pattern:** Dashboard = next-action hero → habit/streak → your courses → certificates → footer
"More" strip. Catalog = scene hero → "Keep going" → course cards (one action each) → build-your-own link. Lesson =
left lesson rail + a vertical stream of 20 block types. Lab = top bar (back/run) + editor/output split.

## B. Gaps & weaknesses (ranked by impact on "99+ / dumb-proof")

### CRITICAL — these actively confuse
1. **Three competing "courses" entry points / two parallel content models.**
   - Courses model: `/catalog` → `/course/[slug]` → `/learn/[course]/[lesson]` (the real seeded courses).
   - Tracks model (LEGACY): `/academy/[track]` → `/[track]/enroll` → `/[track]/learn`, backed by `data/academy/tracks.ts`
     (6 tracks) — a whole separate enroll/track system.
   - A THIRD list: `/academy/my-courses`.
   A learner can land in any of three places that all mean "courses," with different layouts + flows. **This is the
   #1 thing keeping nav from being dumb-proof.** → Pick ONE canonical model (Courses), retire/redirect the others.

2. **Main-menu labels don't match mental models — and collide.**
   - `My Learning` vs `Learn` — both read as "learning"; a user can't tell which is "my stuff" vs "browse."
   - `Progress` routes to **/profile** — a profile is not a progress view (mismatch).
   - `Compete` is jargon for leagues.
   → Rename to plain, distinct destinations (see §D).

3. **No first-class "where am I / my path" MAP.** You asked for a map of where the learner is + what they can
   assemble. A `ContentMap` exists but it's buried as a catalog sub-tab ("Browse / Map"). A high-end LMS needs a
   first-class **Progress/Path** surface: modules → lessons, % complete, what's next, certificates — modular so the
   learner sees and assembles their path.

4. **Mobile navigation is not wired.** No persistent bottom tab bar. For the planned mobile app this is the single
   biggest structural gap — every primary destination must be one thumb-tap away, with a per-tab back stack.

### HIGH — these erode "you are here"
5. **Orphan / un-highlighted routes.** Pages pass `active="courses"` and `active="resources"`, but the nav only
   defines keys `home/learn/review/compete/progress` → those pages highlight **nothing** in the menu, so the learner
   loses their place. `active="progress"` is overloaded across 4 different pages.
6. **No consistent breadcrumb / "up" affordance.** Lesson + lab have a back link; the rest of the app doesn't have a
   consistent "Catalog › Course › Lesson" trail or a reliable way to go up a level.
7. **Lots of secondary surface with no clear home** (build, community, efficacy, engine, evidence, join, refer,
   resources, u/[handle], onboarding, preview). They're reachable but unplaced in the IA — clutter risk.
8. **Per-page secondary nav is inconsistent** (catalog tabs vs dashboard footer strip vs lesson rail) — no shared pattern.

### MEDIUM
9. **"Review" is empty for new learners** (nothing to review yet) — needs an empty state, or demote until there's debt.
10. **Search scope is unclear** — ⌘K should be the universal "jump anywhere" fast path (courses + lessons + actions),
    which doubles as the mobile power-path.
11. **Course overview vs catalog vs my-courses** overlap — consolidate to one "browse" + one "my courses" view.

## C. What's missing for a high-end LMS pipeline
- ONE canonical content model: **Catalog (browse) → Course (overview + syllabus) → Lesson → Lab → Review.** Retire tracks.
- A first-class **Progress / Path map** (modular: see where you are, what's next, assemble/adjust your path, certs).
- A clean **"My courses" (enrolled/in-progress) vs "Browse all"** split (the catalog already shows progress — formalize it).
- A **single global nav contract**: desktop top bar + mobile bottom tab bar, SAME destinations + active state, a back
  stack, breadcrumbs on deep pages.
- A **command palette** (⌘K / mobile search) as the universal fast path. Clear **empty states** for new learners.

## D. Recommended IA (dumb-proof, identical on desktop top-bar + mobile bottom-tab)
Five primary destinations — same five everywhere, so the model is learnable in one glance:
1. **Home** (`/dashboard`) — "what do I do next."
2. **Courses** (`/catalog`) — browse all + my courses in one surface (My / Browse toggle).
3. **My Path** (`/progress` — NEW, promote `ContentMap`) — the map: modules→lessons, where you are, what's next, certs.
4. **Practice** (`/review`) — spaced review + labs (the "do the reps" surface).
5. **Profile** (`/profile`) — identity, leagues/Compete, community, settings (secondary stuff nests here).
Plus: brand mark → Home, ⌘K command palette, breadcrumbs on Course/Lesson/Lab, a consistent back affordance,
and the nav `active` key fixed so every page lights exactly one destination.

**Mobile-app readiness:** bottom tab bar (the 5, thumb-reachable, ≥44px targets), one nav stack per tab with a
back gesture, no hover-only affordances, command palette as the fast path. The scene heroes are full-bleed and read
great on phones.

## E. Suggested order of work (after this audit)
1. **Consolidate the content model** — make Courses canonical; redirect/retire `/[track]/*` + fold `my-courses` into the catalog.
2. **Fix the main menu** — rename to Home / Courses / My Path / Practice / Profile; fix the `active` keys; add breadcrumbs.
3. **Promote the Path map** — `ContentMap` → a first-class `/progress` destination.
4. **Mount the mobile bottom TabBar** (responsive: top bar ≥ md, bottom tabs < md).
5. **THEN build all courses as a skeleton** through the canonical pipeline so the whole flow is visible end-to-end.
