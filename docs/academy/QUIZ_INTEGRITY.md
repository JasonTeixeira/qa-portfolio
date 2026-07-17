# Quiz Integrity — VERIFIED BROKEN academy-wide

**Measured 2026-07-17 across all 632 live quizzes (not a sample, not a judge's claim — a direct
count over `academy_lessons.blocks`).**

## The finding

| Signal | Result | Random baseline |
|---|---|---|
| Correct answer is the **longest option** | **621 / 632 = 98.3%** | ~25% |
| Correct answer sits at **index 1** | **557 / 632 = 88.1%** | ~25% |
| Answer index distribution | `{0: 5, 1: 557, 2: 65, 3: 5}` | ~158 each |

**A learner can score ~98% across the entire academy by picking the longest option without reading
the question. Or ~88% by always picking option B.**

## Why it happened (mechanism, not blame)

The quizzes were authored (and later re-authored per course) with the correct option carrying an
embedded justification — *"Because X, the system Y…"* — while distractors are terse strawmen:
*"No exception was thrown."* Length became a perfect tell. The prior "position-shuffle" pass moved
some answers but never touched the **length asymmetry**, and index 1 remains 88% dominant, so the
shuffle either didn't take or was overwritten by a later authoring pass.

## Why it matters

The academy's entire thesis is **"proof, not vibes"** — mastery is evidence-gated, unlock-gates
certify learning. But:
- the unlock-gate consumes quiz results,
- the quiz can be passed without reading,
- therefore **the gate certifies nothing**, and mastery scores are partly decorative.

This is the product's core claim failing at its own checkpoint. It is worse than a cosmetic bug:
it is the thesis violated in the mechanism.

## The fix (two independent defects — both must be fixed)

1. **Length tell** (the hard one, 621 quizzes): distractors must be *comparably substantive* — each
   plausible-and-wrong for a *stated reason*, at similar length to the correct option. This is real
   content work: a terse strawman can't just be padded, it must become a **credible misconception**
   (ideally the actual mistake a learner makes, drawn from the lesson's own debug block).
2. **Position bias** (mechanical, 557 quizzes): deterministic re-shuffle of `options` with `answer`
   re-pointed, seeded per lesson so it's reproducible and stable across re-applies.

**Order matters:** shuffle AFTER rewriting distractors — otherwise the length tell survives the
shuffle (exactly what happened last time).

## Verification gate (must hold after the fix)

Re-run the count. Require:
- longest-option-wins ≤ ~35% (near random for 4 options, allowing honest variance),
- answer index distribution roughly uniform (no index > ~35%),
- and **no quiz where the correct answer is the longest by more than a small margin**.

This check belongs in the quality harness as a permanent hard-fail (a new dimension: *assessment
integrity*), so it can never silently regress again.
