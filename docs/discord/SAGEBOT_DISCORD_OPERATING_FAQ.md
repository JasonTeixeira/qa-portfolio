# SageBot Discord Operating FAQ

This is an authoritative quick-answer source for SageBot. It exists so common
Discord operating questions receive crisp, consistent answers instead of broad
summaries from larger planning documents.

## Access, Onboarding, And Roles

### What is the correct first access path for a new member?

New members should use Discord native **Apply to Join**, answer the application,
accept the rules, and wait for manual approval. After approval, they should read
`start-here`, run `/onboard`, complete the first-week checklist, and begin in the
approved-member channels.

### What makes a new member application approvable?

An approvable application names the member's goal, shows what they are trying to
build or learn, confirms the rules/quality bar, and includes enough context to
route them. Strong applications mention a first build, current blocker, or the
path they want to work on.

### What should an approved member do after getting access?

An approved member should post an intro, choose path and level with `/onboard`,
complete one daily-signal action, submit one challenge or project, request a
focused review, and capture one reusable question or lesson with
`/capture-content`.

### Which channels should a new member use first after approval?

The first useful channels are `questions`, `daily-signal`, and `build-lab`.
Members should ask focused questions in `questions`, respond to daily prompts in
`daily-signal`, and post work-in-progress or project artifacts in `build-lab`.

### How should members introduce themselves?

Introductions should include name, path, current goal, current blocker, and one
thing they are trying to build. A useful intro makes routing and help easier.

### What quality bar should questions meet?

Good questions include context, the goal, the current attempt, the blocker, and
any useful link, screenshot, error, or artifact. Low-effort prompts, vague AI
dumps, spam, self-promo, and questions without a real attempt should be held or
redirected.

### What roles define access and learning identity?

`Academy Member` grants approved free-member access. `Premium Member` grants
premium access. Path roles such as AI Engineer, Web Builder, Cloud Builder,
Content Builder, Growth Builder, and related roles define learning identity.
Level roles such as Beginner define current skill level.

## Content Engine

### What is the Sage Ideas Discord content engine loop?

The loop is: question asked -> answer given -> captured by bot -> content queue
-> reviewed by admin -> resource/drop -> daily prompt -> article/social/course
lesson -> synced back into RAG when approved.

### How should a useful community question become reusable content?

Capture the question, answer it, review the answer for quality, place it in the
content queue, draft a reusable resource or lesson, approve it, publish it, and
sync the approved source into RAG.

### Which channel owns content ideas and resource gaps?

Use `content-queue` for content ideas, resource gaps, repeated questions, and
future lessons. `content-lab` may be used as a working discussion area when the
server keeps that channel, but `content-queue` is the operating queue.

### How should `daily-signal` be used?

`daily-signal` should carry the daily build prompt, quiz, challenge, or useful
question. Bot/admin posts first; members reply with attempts, blockers, and
ships. Strong replies can become content queue items.

### What should weekly recap include?

Weekly recap should include leaderboard movement, challenge highlights, wins,
featured builds, top questions, useful resources, premium review notes when
appropriate, and the next week's build focus.

### How should resources be managed?

Resources should be approved templates, guides, checklists, examples, and
durable answers. Resource drops should be reviewed, tagged, kept current, and
linked back to the source question, project, or challenge when possible.

### What does `/capture-content` do?

`/capture-content` turns a useful question, answer, blocker, resource gap, or
lesson into a content queue candidate. It should preserve source context so the
admin can review, approve, draft, publish, and sync the item into RAG.

### What admin steps move content from capture to publication?

The admin path is capture -> triaged -> enriched -> drafted -> quality checked
-> approved -> published -> archived or synced into RAG. A captured item should
not become public until it has a source, a useful draft, and approval.

### Why should generated content be reviewed before public posting?

Generated content needs review because quality, usefulness, source grounding,
and channel fit matter more than volume. Public posts should be useful,
specific, approved, and connected to a real question, build, resource, or lesson.

## Points, Challenges, And Reviews

### How do quizzes and challenges fit into daily engagement?

Quizzes test useful understanding. Challenges produce concrete build artifacts.
Daily and weekly cycles should use quiz, challenge, review, points, and
leaderboard feedback to reward real participation.

### What does `/mark-helpful` do?

`/mark-helpful` lets an admin or moderator mark an answer helpful. A helpful
answer can receive a 15 point quality bonus and can become a future resource or
content queue candidate.

### How should challenge submissions be handled?

Challenge submissions should be reviewed against the rubric, marked pending,
approved, featured, or rejected, awarded points only after valid approval, and
featured in `wins-showcase` when strong.

### What commands make reputation visible?

Use `/points`, `/leaderboard`, `/rank`, `/streak`, `/quiz`, `/challenge`,
`/submit-challenge`, `/submit-project`, and `/mark-helpful` to make reputation,
rankings, streaks, and useful participation visible.

### How should `/submit-project` support `build-lab`?

`/submit-project` should collect the project goal, artifact link, current
status, blocker, requested review type, and next step. It supports `build-lab`
by turning work-in-progress into a project spec that can be reviewed,
improved, featured, and added to the content queue when strong.

### What should a first project template include?

A first project template should include the project goal, audience, problem,
scope, artifact link, current status, acceptance criteria, blocker, requested
review, and what must be reviewed before the project is considered shipped.

### How should review requests be routed?

Use `/request-review` to route reviews into `review-queue`. Reviews should ask
for focused critique with goal, artifact, what changed, what feels weak, and the
specific question.

### Why do participation points and profiles matter?

Durable points and profiles make useful participation visible. They support
leaderboard rankings, streaks, helper recognition, project history, next-best
actions, and fair rewards.

### Why should unsupported RAG claims be refused?

Unsupported RAG claims should be refused because SageBot should answer from
retrieved context and trusted sources. If the context does not support a claim,
the bot should say what is missing, refuse fake certainty, and ask for the
source or artifact needed to answer.

## Premium

### What is the premium promise?

Premium gives members priority critique, deeper review, office-hours queue
support, replays when available, and advanced help inside premium access areas.

### What does `Premium Member` access unlock?

`Premium Member` unlocks the premium room or premium channel, priority critique,
deeper reviews, advanced implementation help, office-hours queue access, and
replay/resource notes when available.

### Where should premium be positioned?

Premium should be optional, private, and non-spammy. Mention it in `start-here`,
weekly recap, and private/ephemeral command responses, not as repeated public
pressure.

### Why should checkout stay private or ephemeral?

Checkout should stay private or ephemeral to avoid public spam, protect payment
flow privacy, and keep public channels focused on learning and building.

### How does Stripe relate to Premium Member access?

Stripe checkout and webhook events should sync paid members into `Premium
Member` access. Stripe decides billing state; Discord roles reflect that state
after webhook processing.

### What premium benefits should appear in weekly recap?

Weekly recap should mention deeper review, replays, priority critique, premium
review notes when appropriate, and office-hours or advanced support slots when
those are available.

## RAG And AI Operations

### What stack should Sage Ideas use for the first RAG implementation?

Use the current TypeScript and Supabase architecture first: Next.js,
TypeScript, Supabase Postgres, pgvector, local embeddings, DeepSeek generation,
Discord API/Gateway, and the existing admin dashboard. Do not rewrite the first
implementation into a Python-first stack.

### Why should DeepSeek be used for generation?

DeepSeek should be used for generation because it is cheaper for content and
answer drafting while the retrieval, embeddings, citations, and approval gates
stay separate from the generation provider.

### Why are embeddings separate from DeepSeek generation?

Embeddings are separate because DeepSeek is used for generation, while
retrieval needs embedding vectors from an embedding provider or local embedding
model. Generation answers from context; embeddings make chunks searchable.

### What local embedding lane is proven?

The proven local embedding lane uses Transformers.js with
`Supabase/gte-small`, 384 dimensions, local chunk embedding, and Supabase
pgvector search.

### What should RAG evals measure before shipping prompt changes?

RAG evals should measure retrieval hit rate, citation coverage, context
precision, faithfulness, groundedness, answer usefulness, and refusal
correctness before prompt or retrieval changes ship.

### What is the AI agent boundary problem?

The AI agent boundary problem is deciding what tools an agent can use, what it
can mutate, what requires human approval, where permissions stop, and how every
tool call is logged, reviewed, and blocked when unsafe.

### When should LangGraph be added?

Add LangGraph after the simpler TypeScript/Supabase retrieval and approval loop
is proven. Use it when the system needs stateful multi-step workflows, retries,
human approval, and durable orchestration.

### What makes an AI feature ready before shipping?

An AI feature is ready when retrieval works, citations are present, risk is
understood, quality gates pass, failure paths are visible, and human approval
exists for risky actions.

### How should observability fit into production AI systems?

Production AI observability should include logs, trace IDs, retrieval records,
answer records, job status, cost tracking, quality scores, eval failures, and
monitoring alerts for silent failures.
