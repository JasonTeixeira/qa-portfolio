# Sage Academy — Design System (Institutional Editorial shell)

> The visual + interaction foundation every page and course inherits. Direction chosen by the
> operator: **Institutional Editorial** — disciplined Swiss/editorial structure with dark-luxury
> restraint; data-as-design; real hierarchy; quiet depth; no theatre, no gimmicks (matches the
> Nexural institutional / PhD-quant standard). Reads with [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md)
> + the user's `~/.claude/rules/ecc/web/design-quality.md` (anti-template) + `performance.md`.
>
> **Reconcile, don't fork:** tokens go in the academy's existing global tokens layer; if a token
> exists, extend it. These are the *target* values — one source, no per-page palettes.

## Principle
"This is a real institution." Seriousness is earned through **hierarchy and restraint**, not
decoration. Every surface must demonstrate ≥4 of design-quality.md's required qualities; the
default ones here are: scale-contrast hierarchy · intentional rhythm · quiet depth (surfaces +
rule-lines) · a real type pairing · semantic-only color · designed states.

## Color (semantic, not decorative) — disciplined DARK
**Reconciliation (2026-06-26):** the parent site (Sage Living OS) and the existing ~30 academy
pages + `components/academy/academy-shell.tsx` are committed dark. Institutional Editorial is
therefore expressed as a **disciplined dark** treatment — cohesive with the site, but stripped
of neon/bloom/glow for institutional restraint. A light "library" inversion is a future option,
not the default. Tokens alias the existing `--sage-*` dark ramp so the academy stays one product.
```css
:root {
  /* base — aliases the Sage Living OS dark ramp (no new palette) */
  --ac-bg:        #0B0B0E;   /* = --sage-bg */
  --ac-surface:   #111115;   /* = --sage-surface-1 */
  --ac-surface-2: #141418;   /* = --sage-surface-2 (recessed/raised) */
  --ac-ink:       #F2EFE9;   /* = --sage-ink (primary text) */
  --ac-ink-soft:  #C0C0CA;   /* = --sage-ink-muted (secondary) */
  --ac-ink-faint: #8A8B96;   /* labels, mono captions */
  --ac-rule:      #1E1E24;   /* = --sage-border — hairline rules, NOT glow */
  --ac-rule-strong: #2A2A33; /* = --sage-border-strong */
  --ac-accent:    #3D6BFF;   /* the single disciplined accent — links, focus, active */
  /* semantic state — used ONLY for meaning (the 8-state machine + caps) */
  --ac-mastery:   #4ADE80;   /* proven / complete */
  --ac-pending:   #E8B75A;   /* = --warm-gold — in-progress / proof-pending / capped */
  --ac-locked:    #52525B;   /* locked / neutral */
  --ac-danger:    #FF5436;   /* = --warm-ember — failure / repair-required */
}
```
Rule: NO bloom/glow shadows on academy chrome — depth is surfaces + hairline rules only. The
8-state machine maps state→color (locked `--ac-locked` · ready/active `--ac-accent` · complete
`--ac-mastery` · repair `--ac-danger`). Score-cap UI uses `--ac-pending` for "capped". Color is
never ornament. (Light inversion, if ever built, flips bg/ink and keeps the same accent + states.)

## Typography (a real pairing, big scale contrast)
Two families, deliberate: a **serif display** (editorial authority) + a **grotesk/sans body**
(institutional clarity). Max two families (performance.md). `font-display: swap`, preload the
one critical weight.
```css
:root {
  --ac-font-display: /* serif, e.g. "Newsreader"/"Source Serif" */ serif;
  --ac-font-body:    /* grotesk, e.g. "Inter"/"Söhne"-like */ system-ui, sans-serif;
  --ac-font-mono:    ui-monospace, "SF Mono", monospace;   /* labs, data, code */
  --ac-step--1: clamp(.83rem,.8rem+.15vw,.9rem);
  --ac-step-0:  clamp(1rem,.95rem+.25vw,1.075rem);
  --ac-step-2:  clamp(1.4rem,1.2rem+1vw,1.85rem);
  --ac-step-4:  clamp(2.2rem,1.6rem+2.6vw,3.4rem);  /* lesson/course titles */
  --ac-step-6:  clamp(3rem,2rem+5vw,5.5rem);        /* hero scenario lines */
}
```
Display serif for scenario hooks, course/lesson titles, section headers. Body grotesk for prose
and UI. Mono for labs, evidence ledgers, scores, and data. Big jumps between steps = the hierarchy.

## Space, rhythm, depth
```css
:root {
  --ac-space: clamp(1rem,.8rem+1vw,1.5rem);     /* base unit; rhythm is intentional, not uniform */
  --ac-gutter: clamp(1.5rem,1rem+2.5vw,3rem);
  --ac-maxw-prose: 68ch;  --ac-maxw-shell: 1320px;
  --ac-radius: 6px;        /* restrained, consistent */
  --ac-shadow: 0 1px 2px oklch(22% .01 270 / .06), 0 8px 24px oklch(22% .01 270 / .05);
  --ac-rule-w: 1px;
}
```
Depth comes from **surfaces + hairline rules + restrained shadow** — never glow, never neon.
Editorial composition: asymmetric where it earns hierarchy (don't center everything); a 12-col
grid for shell, prose column capped at `--maxw-prose` for readability.

## Motion (purposeful, compositor-only)
`transform` / `opacity` / `clip-path` only (performance.md). Reveals are quiet and fast.
```css
:root { --ac-dur-fast:150ms; --ac-dur:300ms; --ac-ease:cubic-bezier(.16,1,.3,1); }
```
Motion clarifies flow (beat→beat progress, state change, mastery bar moving) — it never decorates.
**Honor `prefers-reduced-motion`** (kill non-essential motion). No parallax, no smoke, no theatre.

## The academy shell (build once — every page uses it; no page hand-rolls layout)
- **AppShell** — the route-group layout: persistent primary nav (left rail desktop / bottom-bar
  + drawer mobile), the six destinations from INFORMATION_ARCHITECTURE, the Guide overlay mount.
- **TabBar / SubTabBar** — the canonical tab + sub-tab control (course Overview/Syllabus/Progress/
  Board; Progress Mastery/Activity/Certificates/Evidence/Refer). One component, used everywhere.
- **Surface / Card / RuleList** — the depth primitives (surface, recessed surface, hairline rule).
- **LessonShell** — the three-pane player (LEFT outline+state · CENTER 5-beat sprint · RIGHT
  up-next/goal/guide). The only lesson layout.
- **StateBadge** — the 8-state machine chip (locked/ready/in-progress/proof-pending/review-pending/
  repair-required/transfer-due/complete) with semantic color. Single source of state display.
- **ScoreCapMeter** — shows the binding score + the cap + the next event to lift it.
- **MasteryMap** — the universe/skill graph ("you are here"); evidence-driven.
- **GuidePanel** — the AI guide (hint/explain/next + grader UI), persistent overlay.
- **ProgressRing / StreakStrip / Celebration** — the growth-engine surfaces (reuse existing).
- **EmptyState** — the institutional honest empty (no fake data); the first-run routes to Course 00.
- **States baseline:** every interactive element ships designed `hover / focus-visible / active /
  disabled` states; focus-visible uses `--ac-accent`. Disabled "Complete" until evidence exists.

## Accessibility & performance (foundation gates, not afterthoughts)
- WCAG 2.2: contrast ≥ AA on ink/bone + accent; semantic HTML (`header/nav/main/section`);
  full keyboard nav; focus order matches reading order; axe 0 serious/critical (UX_LOOP gate).
- CWV budgets (performance.md): microsite/landing tight; lesson + lab within app budget;
  preload only the one critical font weight + hero; defer the rest; labs (Pyodide) dynamically imported.
- Test both light and the dark inversion if dark ships (testing.md). Dark is NOT auto-on.

## Done = the shell gate (part of FOUNDATION.md)
Tokens in one place · the shell components above exist and are the *only* source of academy
chrome · no page hand-rolls layout/palette · designed states everywhere · axe + responsive
(320/768/1024/1440, no overflow) green · reads "institutional", not "template" (design-reviewer verdict).
