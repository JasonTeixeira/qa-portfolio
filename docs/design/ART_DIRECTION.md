# Sage Ideas — Art Direction

*The rules. Commit to these before touching pixels. Deviations need a reason, not a mood.*

---

## Thesis — **The Forge and the System**

One solo craftsman who builds machines. The whole identity is a held tension:

| The Forge (organic) | The System (engineered) |
|---|---|
| Cinematic Japanese ink + sumi-e atmosphere | The precise grid, the instrument layer |
| Patience, the journey, craft, warmth | Data, architecture, the electric line |
| Landscapes, mist, brush, the 道 seal | Mono coordinates, schemas, live numbers |

Every screen should feel like **ink and circuitry in the same frame.** If a section is all atmosphere, it's wallpaper. If it's all data, it's a dashboard. The work is in the collision.

> Anti-goal: "clean minimal SaaS." That is the AI default. We are authored, atmospheric, and opinionated.

---

## 1. Typography — three voices, brutal contrast

| Voice | Face | Job |
|---|---|---|
| **Editorial** (the forge) | **Coconat** (`--font-editorial`) | Big statement moments, pull-quotes, the emotional beats. Used *sparingly* — it's the human hand. |
| **Structural** (the system) | **Bricolage Grotesque** (`--font-display`) | Section headlines, product names, UI. The confident machine voice. |
| **Instrument** | **JetBrains Mono** (`--font-mono`) | Labels, coordinates, specs, ticks: `S-01`, `185 / 69`, `nexural.system`. The spec-sheet layer. |

**Scale rule — no mid-range.** Emphasis lives at the extremes only:
- Display: `clamp(3rem, 1rem + 8vw, 8rem)` and up. Bleed it off the left edge.
- Instrument: `0.66–0.72rem`, `letter-spacing: 0.18–0.26em`, uppercase.
- Nothing "medium-bold" carries emphasis. Body is quiet (`--text-body`), display is huge. The gap *is* the design.

**Setting:** display tracking `-0.02em` to `-0.035em`; line-height `0.92–0.98`; intentional ragged line breaks (`<br/>` where a designer would break it, not where the box wraps).

---

## 2. Grid — 12 columns, asymmetry by default

- Container max `1180px`; 12 cols; gutter `clamp(16px, 2vw, 28px)`.
- **Centered is the exception, not the rule.** Content lives off-axis: a headline at cols 1–7, a caption out in cols 10–12, a device overlapping cols 6–12 and bleeding right.
- Overlap is allowed and encouraged — type over image, image over the column edge, the instrument layer in the margin.
- One full-bleed moment per major section to break the column and reset the eye.

---

## 3. Color + the temperature journey

**Base (always):** ink `#0B0B0E` · charcoal surfaces `#111115 / #141418` · cream text `#F2EFE9` · muted `#9C9CA6` · hairline `#1E1E24`.

**Two atmospheres** carry the journey:
- **Warm** — sunset/ember: deep red `#B3170E`, ember `#FF5436`, gold `#E8B75A`. *Arrival, resolve, human warmth.*
- **Cool** — ink-wash: slate `#1B2A3A`, mist `#8FA0B8`, moon `#BCD2FF`. *The work, the system, focus.*

**The electric accent — `#3D5AFE` — is reserved.** It is the *machine* speaking. Use it only for: the Surface→System seam, live data, the AI/system layer, one primary CTA. Never as decorative chrome, never a gradient background. Organic ink, *one* electric line.

**The journey (scroll arc):** the page changes temperature as you descend — **warm arrival → cool work & system → warm/dawn resolve.** Like climbing the mountain in the `/path` concept. Grade each section's backdrop to its place in the arc.

Per-product brand colors (`project.brand`) live *only* inside that product's showcase — never leak out.

---

## 4. The motif — repeat one mark with discipline

- **道 seal** (the hanko) — the signature. Appears in the brand mark and as a quiet recurring stamp.
- **Registration ticks** — a hairline mono coordinate layer in the margins (`+`, `01 / 04`, tick rules). This is the "engineered" fingerprint on every page.
- **One ink brush-stroke** as the divider between forge and system moments.

Pick these and repeat them everywhere. A recurring motif = an authored identity, not a template.

---

## 5. Motion — mass, meaning, restraint

- **Easing:** entrances `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) with a hair of settle; never linear, never bouncy-cute.
- **Reveals:** rise `48–60px` + fade, staggered `~70ms` among siblings, on scroll-into-view. They should feel *weighted*, like they have mass.
- **Meaning rule:** every motion reveals something true — arrival (reveal), looking inside (x-ray), proof accruing (count-up), depth (parallax). **No decorative particles. No glow for glow's sake.**
- **Durations:** reveals `0.7–1.0s`; scrubs are continuous and tied to scroll. Slow and deliberate beats fast and flashy.
- **Reduced-motion:** every section fully legible and complete with zero animation. Non-negotiable.

---

## 6. Atmosphere & depth — three planes

1. **Far:** cinematic landscape (graded to the section's temperature), parallaxing slow.
2. **Mid:** mist / ink wash / the system diagram, the engineered grid.
3. **Front:** content — type, device, instruments.

Always: fine **grain** over the dark, a soft **vignette**, and a temperature grade. Never a flat black void (that's the current "show my work" failure).

---

## 7. Rhythm — choreograph the scroll like a film

Vary density relentlessly: **full-bleed cinematic → tight ruled data → a beat of black breathing room → one huge statement.** Wide, tight, wide, hold. If every section is the same height and density, it reads as generated. Pacing is the most human signal there is.

---

## 8. Do / Don't (the anti-AI checklist)

**Do:** one bold move per section · asymmetry & overlap · brutal type-scale contrast · the reserved electric line · real proof and real imagery · motion that means something · the recurring motif · the temperature journey.

**Don't:** uniform card grids · centered-everything · even glow on every surface · decorative particle fields · mid-range type for emphasis · rainbow gradients as chrome · a flat black void where a composition should be · five effects when one will do.

---

*If a section can't answer "what's the one bold move, and which plane is it on?" — it isn't done.*
