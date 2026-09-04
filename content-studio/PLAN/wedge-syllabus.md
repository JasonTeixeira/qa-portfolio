# Wedge Syllabus — the first ~18 videos (ordered)

The launch batch. Wedge = **AI Engineering** (lead) + **LLM Internals** + **Prompt/Context** +
two broad-appeal **System Design / Backend Craft** hits. Ordered as a real syllabus, not random.
Mix of lengths (content decides). Each flagship spawns a Short. Every row = a warehouse-built video.

Tier: F = flagship (6–10m) · S = standard (3–6m) · ▸Short derived.

### AI Engineering (School I — the wedge lead)
| # | Tier | Title | The one idea | Signature visual (warehouse) |
|---|------|-------|--------------|------------------------------|
| 1 | F | **RAG, done right** ✅ | answer from the source — or don't answer | flow + vector `scatter` + faithfulness `gauge` |
| 2 | F | **Evals for LLMs** | you can't ship what you can't measure | rubric `table` + `gauge` + score `bars` |
| 3 | S | **Embeddings & vector search** | "nearest" is not "relevant" | `scatter` meaning-space + re-rank |
| 4 | S | **Chunking** | the boring choice that decides RAG quality | doc→chunks grid + overlap window |
| 5 | F | **Agents** | a loop with tools — and a leash | `cycle` (plan→act→observe) + `sequence` |
| 6 | S | **Prompt injection** | untrusted input is code | `flow` with a poisoned node + gate |
| 7 | S | **Structured output** | make the model return JSON you can trust | schema `codeBlock` + validate `diff` |
| 8 | S | **Context windows** | lost in the middle — pack context on purpose | `heatmap` attention-over-position |

### LLM Internals (School I)
| # | Tier | Title | The one idea | Signature visual |
|---|------|-------|--------------|------------------|
| 9 | S | **Tokens** | the model doesn't see letters — it sees tokens | text→token `chips` + count |
| 10 | F | **Attention, intuitively** | how a model looks back at what it read | `network`/weighted edges heatmap |
| 11 | S | **Temperature & sampling** | the knob everyone misreads | distribution `histogram` reshaping |
| 12 | S | **Why models hallucinate** | it optimizes plausible, not true | `scatter` plausible-vs-true |

### Prompt & Context Engineering (School I)
| # | Tier | Title | The one idea | Signature visual |
|---|------|-------|--------------|------------------|
| 13 | S | **Anatomy of a good prompt** | role · task · constraints · examples | labeled `codeBlock` build-up |
| 14 | S | **Few-shot vs fine-tune** | when examples beat training | decision `tree` + cost `kpi` |

### System Design / Backend Craft (broad-appeal hooks)
| # | Tier | Title | The one idea | Signature visual |
|---|------|-------|--------------|------------------|
| 15 | F | **Caching** | your cache isn't fast — it's lying | `sequence` stale-read + TTL `gauge` |
| 16 | S | **Load balancing** | a bad health check is worse than none | `flow` LB→dead node + health |
| 17 | S | **Idempotency** | why your payment charged twice | `sequence` double-fire + key |
| 18 | S | **Rate limiting** | protect the system from its own users | token-bucket `gauge` + `bars` |

## Batch plan
- **Ship order = table order** (it's a syllabus). 1 is built; 2–4 next (AI Eng depth), then 15/17 for broad reach.
- **Mix:** ~4 flagships + ~14 standards → a full-looking track fast without 18× flagship cost.
- **Each →** script (to spine) → timestamped VO → warehouse-built beats → render → 3-ratio thumb → Short cut → upload + academy lesson.
- Reuse: every one pulls from `library/primitives.js` — no new plumbing, just data + script.
