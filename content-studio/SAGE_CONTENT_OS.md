# Sage Content OS

The content machine behind Sage Academy's YouTube channel + social. One brand,
one visual system, reusable templates, and a weekly loop you run yourself.

> **Positioning.** An *educational* channel that teaches real engineering
> judgment — and earns the right to sell. Every piece teaches one concept and
> ends in a proof. The soft CTA routes viewers to the free academy lesson
> (top of funnel → paid academy), and "we build this for you" routes the
> high-intent few to the agency. Education is the hook; the businesses are the
> floor. No hype, no fake stats — same rule as the site: **proof, not paper.**

---

## Brand system (inherited from sageideas.dev — do not diverge)

| Token | Value | Use |
|---|---|---|
| Ground | `#0A0B0F` | video/thumbnail background |
| Ink | `#F4F2EC` | primary text |
| Muted | `#A9ABB8` | secondary text |
| Accent | `#3D5AFE` | the one bold color — logo, emphasis |
| Accent ink | `#9AA8FF` | italic emphasis words, on-dark accent text |
| Green | `#3ECF8E` | "passed / proven" semantic only |
| Red | `#F0796E` | "fails on purpose" semantic only |

- **Display:** Fraunces (serif, 500–600) — the headline voice. Emphasis words in italic `#9AA8FF`.
- **Utility:** JetBrains Mono — kickers, code, captions, data.
- **Logo:** the Cloud Native mark (white cloud + 3 deploy nodes on the blue tile) + "Sage Academy".
- **Motifs:** the proof card (a code snippet that ends in a green `✓ passed` / red `✗ fails`), the grid + blue aurora atmosphere, the Atlas orb for "guided" moments.

---

## Content pillars (each maps to a business goal)

1. **Concepts, explained** — RAG, evals, agents, embeddings, idempotency, system
   design. Bite-sized versions of the academy curriculum. → free lesson CTA.
2. **Build-alongs** — ship one real thing (an academy Lab), proof at the end. → academy Labs.
3. **Senior-engineer judgment** — how to frame, route, decide, defend. The
   academy's core thesis. → free "Engineering Judgment" lesson.
4. **Building in public** — the academy/agency as it's built. Light Sage Ideas
   brand. → agency.

Pull topics straight from the academy catalog + Labs — the channel is the
curriculum in public, so scripts already exist.

---

## Formats (one source → every cut)

| Format | Ratio | Length | Engine |
|---|---|---|---|
| YouTube long-form | 16:9 | 6–10 min | hyperframes (HTML→video) |
| Shorts / Reels / TikTok | 9:16 | 40–60s | hyperframes 9:16 cut |
| Thumbnail | 16:9 1280×720 | — | `templates/thumbnail.html` |
| In-lesson academy video | 16:9 | 1–3 min | reuse the long-form / concept scenes |

---

## The thumbnail engine (working now)

`templates/thumbnail.html` renders a pixel-consistent, on-brand 1280×720
thumbnail from URL params — no hand design, ever.

**Params:** `k` kicker · `t` title (allows `<em>`) · `s` subtitle · `n` episode
chip (empty string hides it) · `file` code-card filename · `code` code-card HTML.

**Render one (repeatable):**

```bash
# serve the studio once
cd content-studio && python3 -m http.server 8790 &
# then render any thumbnail (headless Chrome / Playwright at 1280×720):
#   http://localhost:8790/templates/thumbnail.html?t=What%20is%20<em>RAG</em>&k=AI%20ENGINEERING%20·%20EXPLAINED&n=EP.01
```

Proven examples: `renders/thumb-rag.png`, `renders/thumb-evals.png`.

---

## The weekly loop (run solo)

1. **Pick** a topic from a pillar (curriculum-aligned — the script half-exists).
2. **Script** one page: hook (≤8s) → one concept → one proof → CTA to the free lesson.
3. **Thumbnail:** render via the engine (title = the hook's sharpest 3–5 words).
4. **Video:** build the hyperframes composition, reusing the academy's diagram/
   scene components; drop a Higgsfield hero/b-roll shot where a generated visual
   beats a diagram; narrate (Higgsfield voice now → Jason's ElevenLabs voice
   once the plan is restored).
5. **Cut** the 9:16 Short from the same source.
6. **Publish** YouTube + Short + Reel + TikTok; embed the long-form in the
   matching academy lesson. Every description/end-card links the free lesson.

---

## Roadmap

- [x] **P1 — Brand + thumbnail engine.** Visual system locked to the site;
      reusable thumbnail template rendering real, upload-ready images.
- [ ] **P2 — Shorts/Reels 9:16 template + first flagship long-form** (hyperframes).
- [ ] **P3 — Higgsfield hero/b-roll + narration; batch a 5-video launch slate.**
- [ ] **P4 — Publishing kit:** channel avatar/banner, end-card + description
      templates, upload cadence.

## Open unlocks (owner)

- **ElevenLabs** plan restore → Jason's cloned narration voice.
- **Higgsfield** credits → generative hero/thumbnail art + b-roll (confirm spend before batch runs).
