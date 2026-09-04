# Sage Academy — 50-Video Content Slate

Research-driven. Every video maps to (a) real 2026 search demand, (b) a teachable
**runnable proof** (the brand wedge), and (c) a specific academy course or Lab it
drives to. Built from four research passes: search-demand, the 2026 AI landscape,
YouTube format/positioning, and the real course/Lab inventory.

---

## The strategy (why this is a *system*, not 50 uploads)

**The wedge no competitor owns.** The AI-education niche splits into hype-grifters
("INSANE new AI!!") and a smaller substance crowd — but *almost nobody closes the
loop from claim → runnable proof*. That gap is our entire brand: **every video
ends in something the viewer can run and verify.** Thumbnails show the artifact
(terminal output, a passing test, a diff) — never a reaction face.

**The two-tier flywheel** (from the format research):
- **Discovery layer — "Proof in 100 Seconds"** (Shorts): one concept, ends on a
  runnable snippet + a link to the full lesson. Cheap, evergreen, endlessly
  discoverable. *Reach.*
- **Curriculum layer — numbered long-form series** (8–14 min): the real teaching,
  build-with-me (show it break, then fix), ends in a Lab. *Retention + subs.*
- Shorts → long-form → **one specific runnable proof on sageideas.dev**. Never
  "subscribe" as the CTA — always a named Lab / free lesson / cert check.

**The demand center of gravity (2026):** the market moved from *prompting* to
*building & operating agentic systems* — MCP, agent frameworks, evals,
observability, and above all the **demo→production gap (70–95% agent failure
rates)**: high search, underserved, deep, durable. That's our flagship season.

**Every episode embodies the Sage Method** — frame → route → map → decide →
prove — so the format is repeatable and on-brand by construction.

**Format legend:** `L` = long-form 8–14 min · `S` = Short 45–90s (9:16).

---

## SEASON 0 — Launch batch (assets already exist)

Re-cut from the six founder-narrated explainers already in `public/video/academy/`.
Ship these day one to seed the channel while Series 1 is produced.

| # | Title | Fmt | Asset | → CTA |
|---|-------|-----|-------|-------|
| 0a | Why Sage Academy exists — judgment over syntax | S/L | `sa-founder` | Free Course 00 |
| 0b | RAG — how AI reads your data | S | `sa-rag` | `/academy/concepts` what-is-rag |
| 0c | Evals — how you know it works | S | `sa-evals` | Lab: eval harness |
| 0d | Agents — how AI takes action | S | `sa-agents` | Agents & Tool Use |
| 0e | The Method — the loop senior engineers run | S | `sa-method` | Free Course 00 |
| 0f | Prove it — no vibes | S | `sa-proof` | `/academy/proof-not-paper` |

---

## SERIES 1 — "Agents in Production" (flagship · L · build-with-me)

The #1 demand + the #1 gap. Each video breaks an agent under real conditions,
then fixes it on camera. This is the season that defines the channel.

| # | Title (proof-framed) | Searches for | Proof on screen | → CTA |
|---|------|------|------|------|
| 1 | Your AI agent works in the demo. Here's why it dies in production. | "why do AI agents fail" | agent loop + live failure → fix | Agents & Tool Use |
| 2 | I gave an AI a tool. It called it wrong 40% of the time. Here's the fix. | "function calling reliability" | bad tool args rejected before run | Lab: function-calling router |
| 3 | Prompt injection broke my agent in 10 seconds — then I built a firewall. | "prompt injection defense" | live red-team → blocked | Lab: prompt-injection firewall |
| 4 | Building an MCP server from scratch (why every AI team is doing this now). | "what is MCP / build MCP server" | connect a live MCP server <15 min | AI Engineering: RAG & Eval |
| 5 | One task, three agent architectures: single vs orchestrator vs crew. | "LangGraph vs CrewAI" | same task 3 ways, tradeoffs | Architecture & System Design |
| 6 | How to put a human-approval gate on an autonomous agent. | "human in the loop agent" | approval gate stops a bad action | Lab: tool-using agent + guardrail |
| 7 | Your agent doesn't know when to stop. Let's fix the stopping logic. | "agent infinite loop" | loop control + budget cap | Agents & Tool Use |
| 8 | I traced why my agent lied — here's the observability setup. | "LLM observability / tracing" | trace a bad answer to its cause | Observability & Reliability |

---

## SERIES 2 — "Build With Me: Real, Tested, Résumé-Ready" (L · the Labs)

The 35 Labs are ready-made episodes — each already has a spec, a résumé line, and
a pass/fail proof. Film the build, end on the green check, CTA to the exact Lab.

| # | Title | Searches for | Proof on screen | → Lab |
|---|-------|------|------|------|
| 9 | Build a payment API that literally cannot double-charge. | "idempotency key tutorial" | retNx → 1 charge, test passes | Idempotent charge API ★ |
| 10 | Ground a chatbot in your own docs — with citations and "I don't know". | "build RAG with citations" | grounded answer + abstention | RAG grounded docs ★ |
| 11 | Build an eval harness that catches a regression before your users do. | "how to do LLM evals" | judge score gates a bad change | Eval harness ★ |
| 12 | Build a semantic cache and cut your LLM bill 10×. | "llm caching cost" | cache hit, cost delta shown | Semantic cache |
| 13 | Add a re-ranker to your RAG and prove recall@k went up. | "rerank RAG cross encoder" | recall@k before/after | Cross-encoder re-ranker |
| 14 | A rate limiter that survives a burst (token bucket). | "rate limiter tutorial" | burst → throttled, not dropped | Rate limiter |
| 15 | A job queue that never loses work (durable queue + DLQ). | "durable job queue" | crash mid-job → work recovered | Job queue + DLQ |
| 16 | Add a database column without taking the site down. | "zero downtime migration" | migrate under live writes | Zero-downtime migration |
| 17 | Build a login that survives an attack. | "secure auth flow" | brute-force + fixation blocked | Auth that survives attack |
| 18 | Rotate a secret with zero downtime — nobody notices. | "secret rotation zero downtime" | rotate while serving traffic | Secret rotation |
| 19 | Build a hallucination detector that flags ungrounded claims. | "detect LLM hallucination" | ungrounded claim flagged | Hallucination detector |
| 20 | Structured output that never breaks your parser. | "structured output json schema" | raw fails → constrained passes | Structured-output extractor |

★ = interactive in-browser Lab (viewers can run it right on the site).

---

## SERIES 3 — "Proof in 100 Seconds" (S · discovery/reference)

The evergreen reference layer. One idea, one runnable snippet, one link. This is
the reach engine that feeds every long-form series.

| # | Title | Searches for | → CTA |
|---|-------|------|------|
| 21 | What is RAG, really? | "what is RAG" | Series 2 #10 |
| 22 | What are embeddings? (highest-demand, lowest-supply skill) | "what are embeddings" | RAG & Retrieval |
| 23 | What is an eval? | "what is an LLM eval" | Series 2 #11 |
| 24 | What is an AI agent? | "what is an AI agent" | Series 1 |
| 25 | What is MCP? | "what is model context protocol" | Series 1 #4 |
| 26 | Vector search vs keyword — why you need both. | "hybrid search" | Series 2 #13 |
| 27 | Context engineering vs prompt engineering. | "context engineering" | The LLM API |
| 28 | What is idempotency? | "what is idempotency" | Series 2 #9 |
| 29 | How does ChatGPT actually work? (tokens + attention) | "how does ChatGPT work" | The LLM API |
| 30 | Prompt injection in 100 seconds. | "what is prompt injection" | Series 1 #3 |
| 31 | RAG vs fine-tuning — when to use which. | "RAG vs fine tuning" | AI Engineering |
| 32 | What is LoRA fine-tuning? | "what is LoRA" | AI Engineering |
| 33 | Stop paying for reasoning you don't need (model routing). | "llm model routing cost" | Series 6 #50 |
| 34 | Function calling in 100 seconds. | "llm function calling" | Series 2 #20 |
| 35 | Run an AI model on your own laptop (local LLMs). | "run LLM locally ollama" | The LLM API |
| 36 | What is LLM observability? | "llm observability" | Series 1 #8 |

---

## SERIES 4 — "How Senior Engineers Think" (L/S · the judgment wedge)

The academy's core thesis and its single strongest differentiator. Drives to the
free Course 00 first lesson.

| # | Title | Searches for | Proof on screen | → CTA |
|---|-------|------|------|------|
| 37 | Junior vs senior engineer? It's one skill: framing. | "how to think like a senior engineer" | messy incident → falsifiable question | Free Course 00 |
| 38 | How to read a codebase you've never seen. | "understand large codebase" | build a defensible map | Concept Maps |
| 39 | Debug to the exact line and reason — not vibes. | "how to debug systematically" | mystery bug → one line + why | Lab: debug-to-the-line |
| 40 | Weak vs gold: your solution, graded like a reviewer would. | "code review standards" | same answer, two grades | Concept Maps |
| 41 | How to defend a technical decision under tradeoffs. | "engineering decision making" | decision memo a reviewer accepts | Free Course 00 |
| 42 | The loop senior engineers run on autopilot. | "engineering judgment" | frame→route→map→decide→prove | Free Course 00 |

---

## SERIES 5 — "The AI Engineer Career Map" (L/S · meta + career-switcher)

Targets the two beginner audiences the demand data surfaced (confused
career-switchers; no-code builders) and carries the anti-cert brand piece.

| # | Title | Searches for | → CTA |
|---|-------|------|------|
| 43 | AI Engineer vs ML Engineer vs Data Scientist — the real difference. | "AI engineer vs ML engineer" | Interview & Career |
| 44 | What AI engineering interviews actually test (5 clusters). | "AI engineer interview questions" | Interview & Career |
| 45 | Forget the certificate. Build proof a hiring manager can run. | "AI certificate worth it" | `/academy/proof-not-paper` |
| 46 | Build an AI portfolio that gets callbacks (not another to-do app). | "AI portfolio projects" | The Labs |
| 47 | Is prompt engineering dead? Here's what to learn instead. | "is prompt engineering dead" | Context engineering / AI Eng |

---

## SERIES 6 — "System Design for AI Apps" (L · rising interview demand)

System-design loops now include LLM questions; orchestration (not model quality)
is where production breaks. Maps to the Architecture & System Design flagship.

| # | Title | Searches for | Proof on screen | → CTA |
|---|-------|------|------|------|
| 48 | Design a production RAG system (whiteboard → running). | "RAG system design" | diagram → working service | Architecture & System Design |
| 49 | Design an AI agent system that won't fall over. | "AI system design interview" | retries, fallbacks, budgets | Architecture & System Design |
| 50 | Cut your AI app's cost 5× with model routing (with the dashboard). | "reduce LLM cost" | router + cost dashboard delta | Observability & Reliability |

---

## Release system (how to run it solo)

**Sequencing — build the reference layer, then the flagship:**
1. **Weeks 1–2:** ship Season 0 (exists) + the first 6 of Series 3 (100-second
   proofs). Cheap, fast, seeds search discovery + gives the algorithm data.
2. **Weeks 3–8:** Series 1 flagship, one long-form/week, each supported by 1–2
   Shorts cut from it (the "wait, what?" moment → link to the full video).
3. **Ongoing:** alternate a Series 2 "Build With Me" (a Lab) with a Series 4/5/6
   long-form; keep one Series 3 Short shipping between every long-form.

**One source → every cut.** Each long-form yields: 1 thumbnail (the engine),
2–3 Shorts (9:16), and 1 in-lesson embed on the matching academy page.

**The proof-first production checklist (every video):**
- [ ] Title names a concrete, verifiable claim (not "X explained")
- [ ] Thumbnail shows the artifact (test pass / diff / terminal) — engine-rendered
- [ ] The concept **breaks on camera** before it works (build-with-me credibility)
- [ ] Ends in a runnable proof + one named CTA (a Lab / free lesson / cert check)
- [ ] Embedded in the matching academy lesson; description links the free lesson

**Funnel math (from the research):** Shorts→long-form viewers are worth ~40%
more lifetime; long-form→site viewers are the ones who convert. So the CTA is
never "subscribe" — it's always the specific proof waiting on sageideas.dev.

## Production status

- **Thumbnail engine:** live (`templates/thumbnail.html`). RAG + Evals rendered.
- **Next:** 9:16 Shorts engine · channel avatar + banner · first flagship
  (Series 1 #1 or #4 MCP) via hyperframes · Higgsfield hero/b-roll (greenlit).
