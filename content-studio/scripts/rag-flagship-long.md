# RAG, done right — FLAGSHIP (full lesson)

**One idea:** *Answer from the source — or don't answer.*
**Track:** School I · AI Engineering (flagship #1). **Voice:** Jason clone, dry/warm/scarred, 1:1 (TEACHING_VOICE.md).
**Length:** whatever the content needs (content + messaging first; ~5–7 min expected).
**Visual rule:** every beat's centerpiece is a warehouse primitive (P.*), text is small support, cue-synced to the spoken word, dwell after each.

Beats (narration ‖ visual = warehouse primitive ‖ key):

1. **cold open / the scar** — "I once shipped a chatbot to production. Three days in, it told a customer we had a thirty-day refund policy. Confident. Clean. We had never had one." ‖ `chat()` bot lie → slam ✗ ‖ MADE IT UP
2. **not a malfunction** — "It didn't malfunction. It did the most human thing there is — it didn't know, so it filled the silence. And your AI is one line of code away from the exact same bug." ‖ `flow(Ask → Model[no source] → Answer ✗)` ‖ —
3. **the stakes** — "In a demo, that's cute. In production, it's a lie told to a paying customer — in the exact same confident voice it uses for the truth." ‖ two `chat` bubbles, both "100% sure", one ✓ one ✗ ‖ same confidence
4. **the wrong fix** — "Most people reach for a bigger, smarter model. That's the trap. A bigger brain doesn't lie less — it lies more convincingly. This was never a knowledge problem. It's an honesty problem." ‖ `flow(7B ✗ , 70B ✗)` ‖ honesty, not smarts
5. **the reframe** — "So here's the shift. Stop asking the model what it knows. Hand it the source, and make it answer from that. It's the difference between a closed-book exam and an open-book one." ‖ closed/open `book` split ‖ answer from the source
6. **what RAG is** — "That's RAG. Retrieval-augmented generation. Fancy name, simple move: fetch the right page first, then answer from it — and cite it. Two moves. Let's build both." ‖ `flow(Retrieve → Answer +cite[1])` ‖ retrieve → answer + cite
7. **retrieval: chunk** — "First, retrieval. You can't hand the model your whole library, so you slice the docs into chunks — small, self-contained passages." ‖ doc → grid of chunks ‖ chunk
8. **retrieval: embed** — "Each chunk becomes a vector — a list of numbers that captures its meaning. Close in meaning, close in space." ‖ `scatter()` chunks as points ‖ embed → vectors
9. **retrieval: search** — "The question becomes a vector too. Then you grab the handful of chunks sitting nearest it — nearest-neighbor search. The top few. Top-k." ‖ `scatter()` + query point + top-k ring ‖ top-k
10. **the answer step** — "Now you staple those passages to the question and tell the model, in plain words: answer using only this — and cite it." ‖ `codeBlock()` prompt assembly ‖ answer from THIS
11. **worked example (right)** — "Same refund question. But now it's holding the actual policy page. And look — it's right. And it points at the exact line it used." ‖ `chat` good + `doc` highlight [1] ‖ grounded · cited
12. **re-hook / hot take** — "Most tutorials stop right here. Retrieve, answer, done. That's the easy half — and it's exactly why their demos dazzle and their production quietly lies." ‖ a "tutorial" card cracking ‖ the easy half
13. **the trap** — "Because ask it something your docs don't cover, and a naive RAG still invents an answer. Retrieval comes back empty — and it answers anyway." ‖ `flow(Ask → ∅ → Answer ✗)` ‖ still guessing
14. **the guardrail** — "The fix is one line. If the answer isn't in the retrieved context — don't answer. Just say: that's not in the documents." ‖ `diff()` + gate ‖ or don't answer
15. **why it matters** — "An AI that will look you in the eye and admit it doesn't know? That is the whole difference between a demo and something you'd put in front of a real customer." ‖ split demo ✗ / prod ✓ ‖ —
16. **but prove it** — "Which raises the uncomfortable question: how do you know it's grounded? You don't take its word for it." ‖ big "?" over answer ‖ how do you know?
17. **faithfulness eval** — "You run a faithfulness check. Every claim in the answer gets traced back to a source passage. Supported, it's green. Unsupported — a red flag you can catch before your customer does." ‖ claims → doc §refs + `gauge()` ‖ trace every claim
18. **a number, not a vibe** — "Now 'is it any good' stops being a vibe and becomes a number — one you can set a threshold on and gate a deploy behind." ‖ `gauge()` 100% + `kpi()` deploy gate ‖ gate the deploy
19. **failure: chunking** — "Two things quietly wreck RAG. First, bad chunks. Split a thought down the middle, and retrieval hands the model half an idea." ‖ doc torn at wrong seam ‖ chunk on meaning
20. **failure: relevance** — "Second — nearest isn't always most relevant. So you re-rank the top hits, and you keep measuring. Distance is a guess; the eval is the truth." ‖ `scatter()` wrong-near flagged ‖ distance ≠ relevance
21. **recap** — "So, the whole thing — four moves. Retrieve the page. Answer from it. Refuse when you can't. Verify it's grounded." ‖ `steps()` 4-item checklist ‖ the four moves
22. **handle + CTA** — "Answer from the source — or don't answer. That's RAG that survives production. You can build this exact system, free, in your browser, at sageideas dot dev slash academy. And I'm curious — what's the worst hallucination you've ever shipped? Tell me below. Proof, not paper. I'll see you in the next one." ‖ full system `flow` + handle + logo ‖ Answer from the source — or don't answer

**Re-teach test:** viewer tells a friend — "RAG is just: give the AI the source, let it cite, and let it say 'I don't know' — then measure that it actually did." ✓
