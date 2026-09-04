# Thumbnail Recipe — LOCKED (the approved hybrid system)

The style Jason approved. **Flat vivid isometric VECTOR illustration** (editorial, matte —
NEVER glossy/glass/3D-render) on a dark solid ground, WITH a floating **code window** and a
bright **hand-drawn annotation** circle/arrow (screenshot-annotation motif). Headline on the
LEFT with one keyword in a bright highlight box + cloud logo. Canonical art = `renders/hybrids/`.
**Do not reinvent this as glossy 3D — that was rejected.**

## Per-video flow
1. Pick the **background** by video index from the rotation (below) — so each video looks distinct in a row.
2. Generate ONE unique illustration via **Recraft** using the prompt template (below).
3. Download → render the thumbnail through `templates/hybrid-thumb.html` (`scripts/render-thumbs.mjs`)
   with the title (topic-led + hook), kicker (`AI ENGINEERING · NN`), and highlight color.
4. Ratios: 16:9 always; add 9:16 + 4:5 for Shorts/IG from the same hero (`r=` param).

## Background rotation (dark, rich, cohesive)
| idx | name | hex |
|-----|------|-----|
| 0 | indigo (classic) | `#1B1E4D` |
| 1 | deep teal | `#10303A` |
| 2 | deep purple | `#241546` |
| 3 | midnight blue | `#0E1B36` |
| 4 | deep plum | `#2A1030` |
| 5 | forest black | `#10281E` |
Rotate `PALETTE[(index) % 6]`. (01 RAG = indigo, already locked.)

## Highlight-box colors (rotate, from the approved set)
`#FF6B4A` (orange) · `#FFC94A` (gold) · `#2BB673` (green) · `#5B7CFA` (blue) · `#12B5A5` (teal)

## Recraft prompt template (recraft-v4-1 · standard · 2k · 16:9)
> Flat vivid isometric VECTOR illustration, editorial tech style, MATTE — no gloss, no glass,
> no photorealism. Solid **{BG_NAME} {BG_HEX}** background. Saturated friendly palette:
> orange-red, teal, blue, green, yellow, white. On the RIGHT: **{SCENE}**. A floating
> code-editor window with colorful code lines. A bright {teal|yellow} hand-drawn annotation
> circle and arrow pointing at the key element. Clean flat vector shading like a friendly tech
> illustration. The LEFT THIRD is empty {BG_NAME} for a headline. Absolutely no text, no
> letters, no numbers, no labels.

`colors` param: `[{BG_HEX}, "#2B2F6E", "#FF6B4A", "#12B5A5", "#5B7CFA", "#2BB673", "#FFC94A", "#FFFFFF"]`

**{SCENE}** = a concrete isometric object for the topic, e.g.:
- Agents → a friendly robot at a control panel wired to tool icons
- Prompt injection → a document with a red poisoned line + a shield deflecting an arrow
- Structured output → a form/JSON braces snapping into neat slots
- Caching → a fast lane vs a slow lane with a stopwatch
- Idempotency → a payment card with a "×2" being blocked to "×1"

## Text treatment (locked)
- `templates/hybrid-thumb.html`: indigo scrim on the left, Poppins-ExtraBold white headline,
  keyword in `<hl>` box (dark text on the highlight color), cloud logo + "Sage Academy".
- Title = topic-led + hook, ≤ 2 lines, one highlighted keyword.
- Box spacing fixed: `.t` line-height 1.28, `.hl` padding `.08em .26em` (no overlap).

## Current locked set (01–04, indigo, approved)
01 RAG (h01) · 02 Evals (h03) · 03 Embeddings (h05) · 04 Chunking (matched). Varied BGs start at 05.
