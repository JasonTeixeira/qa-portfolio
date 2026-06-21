# Sage Ideas Discord Community Operating System

This is the source of truth for the Sage Ideas Discord. The server should feel focused, not sprawling. Roles carry member identity and learning path; channels stay limited and operational.

## Principle

Do not create a channel for every topic. Use a small set of rooms with clear jobs:

- onboarding
- daily signal
- building
- review
- content capture
- live sessions
- resources
- wins/showcase
- premium
- team ops

## Lean Server Structure

### Public Channels

| Channel | Purpose | Posting |
| --- | --- | --- |
| `start-here` | Welcome, rules, first action, and how to use SageBot. | Admin/bot read-only |
| `introductions` | New member intros with project, skill level, and blocker. | Members |
| `daily-signal` | Daily build prompt, AI pattern, and community question. | Bot/admin first, replies allowed |
| `build-lab` | Project specs, shipping updates, technical questions, and build help. | Members |
| `review-queue` | Design, code, AI, SEO, cloud, and architecture review requests. | Members via `/request-review` |
| `content-lab` | Captured questions, lessons, content ideas, resource gaps, and growth work. | Members/bot |
| `live-room` | Office-hours queue, live session notes, and replay follow-up. | Members/admin |
| `resources` | Templates, stack guides, reading list, prompts, tools, and resource drops. | Admin/bot read-mostly |
| `wins-showcase` | Ships, wins, proof screenshots, launches, weekly recap. | Members/bot |

### Private Channels

| Channel | Purpose | Access |
| --- | --- | --- |
| `premium` | Premium critique, advanced drops, replays, and deeper help. | `Premium Member`, admins, bot |
| `team-ops` | Moderation, reports, analytics review, and admin operations. | Admin/moderator/bot |

## Roles

### Access Roles

- `Academy Member` - base community access after onboarding.
- `Premium Member` - premium channel access and Stripe-synced benefits.
- `Mentor` - trusted helper who can answer and guide.
- `Contributor` - advanced member with strong shipping history.

### Level Roles

- `Beginner`
- `Academy Member`
- `Builder`
- `Contributor`
- `Mentor`

### Path Roles

- `AI Engineer`
- `Builder`
- `Web Builder`
- `Cloud Builder`
- `Content Builder`
- `Growth Builder`

Path roles are used for context and mentions, not channel sprawl. Members can discuss all paths inside `build-lab`, `review-queue`, and `content-lab`.

## SageBot Commands

| Command | Job | Primary Channel |
| --- | --- | --- |
| `/apply` | Submit member application after reading and accepting rules. | ephemeral response + `team-ops` |
| `/approve` | Approve a pending application and grant `Academy Member`. | `team-ops` |
| `/reject` | Reject a pending application. | `team-ops` |
| `/pending` | Show pending applications for review. | ephemeral response |
| `/onboard` | Select path and level, assign roles, persist member state. | ephemeral response |
| `/choose-path` | Update path role. | ephemeral response |
| `/submit-project` | Submit project spec into the build pipeline. | `build-lab` |
| `/request-review` | Route code/design/AI/SEO/cloud/architecture review. | `review-queue` |
| `/capture-content` | Turn a question, lesson, or win into a content-engine input. | `content-lab` |
| `/daily-prompt` | Preview or post the daily signal. | `daily-signal` |
| `/weekly-recap` | Preview or post weekly community recap. | `wins-showcase` |
| `/resource` | Route people to resources or content capture. | `resources` / `content-lab` |
| `/office-hours` | Submit a live-session question. | `live-room` |
| `/report` | Route moderation or quality issues privately. | `team-ops` |
| `/premium` | Create Stripe checkout for premium membership. | ephemeral response |
| `/daily` | Show today’s prompt, quiz, and challenge. | ephemeral response |
| `/checklist` | Show first-week onboarding progress. | ephemeral response |
| `/complete-step` | Manually mark a first-week checklist step complete. | ephemeral response |
| `/quiz` | Show or answer today’s quiz and award points. | ephemeral response |
| `/challenge` | Show today’s build challenge. | ephemeral response |
| `/submit-challenge` | Submit today’s challenge artifact and award points. | `wins-showcase` |
| `/points` | Show personal points, rank, and streak. | ephemeral response |
| `/rank` | Alias for personal rank. | ephemeral response |
| `/leaderboard` | Show the community points leaderboard. | public response |
| `/streak` | Alias for streak and points status. | ephemeral response |
| `/weekly` | Preview weekly recap, leaderboard, and content queue. | ephemeral response |
| `/content-queue` | Preview captured ideas for posts/resources/lessons. | ephemeral response |

## Onboarding Flow

### `start-here` Copy

Welcome to Sage Ideas Academy.

This community is for people building real AI apps, websites, automations, content systems, cloud systems, and product foundations. The standard is simple: ship useful work, ask specific questions, show your thinking, and help others move faster.

Start here:

1. Read the quality bar and rules.
2. Run `/apply` and answer the application questions.
3. Confirm rules acceptance in the command.
4. Wait for manual approval.
5. After approval, run `/onboard`.
6. Post in `introductions` using the template below.
7. Submit your first project with `/submit-project`.
8. Ask for focused critique with `/request-review`.

### Quality Bar

- Ask with context: goal, current attempt, blocker, and link/screenshot when possible.
- Share work in progress. Do not wait until it is polished.
- No spam, vague self-promo, fake urgency, low-effort AI dumps, or financial/legal/medical advice.
- Respect critique. The goal is stronger work, not softer feedback.
- Keep threads useful enough that a future member can learn from them.

### Member Intro Template

```text
Name:
Path:
Current level:
What I am building:
What I want to get better at:
Current blocker:
One link or screenshot, if useful:
```

### First Project Template

```text
Project:
User/problem:
Smallest useful version:
Stack:
Acceptance criteria:
What is out of scope:
What I need reviewed:
Link/screenshot:
```

### Path Next Steps

| Path | First useful action |
| --- | --- |
| AI Apps | Build one AI feature with structured input, validated output, and a human approval gate. |
| Full-Stack Development | Ship a small authenticated app with one database-backed workflow. |
| Websites + Design | Redesign one conversion section with clear hierarchy, proof, and CTA. |
| Cloud + DevOps | Deploy one project with env vars, logs, health checks, and rollback notes. |
| AI Agents + Automation | Automate one repeated workflow with explicit tool boundaries and failure handling. |
| SEO + Content Engine | Turn one useful answer into a search-targeted article and two social posts. |
| Ads + Growth | Build one offer page with audience, pain, proof, objection handling, and CTA. |
| Architecture + Systems | Map one system with users, data, auth, API boundaries, jobs, and observability. |

### Premium Upsell Position

Premium should not block basic participation. It should sit after value is visible:

- In `start-here`, mention premium as optional deeper critique.
- In `weekly-recap`, include one line: premium members get deeper review, replays, and priority critique.
- `/premium` should stay private/ephemeral so checkout is not spammed into public channels.

### Welcome Behavior

Current implementation is interaction-based, not automatic join-DM based. The first reliable version is approval-gated:

- user enters server
- only `start-here` is visible before approval
- `start-here` tells them to run `/apply`
- user accepts rules and answers application questions
- admin/mod reviews in `team-ops` with `/pending`
- admin/mod runs `/approve` or `/reject`
- approved user receives `Academy Member`
- approved user runs `/onboard`
- bot assigns path/level roles from dropdowns
- user posts intro
- user submits first project

Future version:

- add Discord guild member event handling if we move beyond slash-command interactions
- send a DM welcome only after validating Discord permissions and privacy expectations

## Content Foundation

### Weekly Themes

| Day | Theme | Output |
| --- | --- | --- |
| Monday | Build brief | Weekly target, project spec, acceptance criteria |
| Tuesday | Tool teardown | AI/tool/workflow breakdown |
| Wednesday | Office-hours queue | Questions and blockers |
| Thursday | Review day | Design/code/AI/SEO/cloud/architecture critique |
| Friday | Ship showcase | Screenshots, demos, proof, lessons |
| Saturday | Content engine | Turn questions and wins into posts/articles |
| Sunday | Weekly recap | Recap, metrics, next-week planning |

### Daily Post Calendar

Daily signal format:

```text
# Daily Signal
Build prompt:
AI tool/pattern:
Question:
```

The daily post should be useful without requiring a long reply. Good prompts produce a small artifact: spec, screenshot, test, teardown, checklist, diagram, or before/after.

### Office-Hours Cadence

- Collect questions in `live-room` all week.
- Run one weekly session when enough questions exist.
- Use this format: context, project, blocker, attempted solution, desired feedback.
- After the session, post notes or replay links in `live-room`; premium replay links can go in `premium`.

### Build Challenge Cadence

Monthly challenge:

1. Week 1: project spec and acceptance criteria.
2. Week 2: first working version.
3. Week 3: review and polish.
4. Week 4: ship proof and write the lesson.

### Review Template

```text
Review type:
Goal:
Audience/user:
What changed:
What feels weak:
Link/screenshot:
Specific question:
```

### Resource Drops

Resource drops should live in `resources` and follow this format:

```text
Resource:
Use when:
How to apply:
Common mistake:
Related command or channel:
```

### Content Capture Process

Every useful community moment should be captured with `/capture-content`:

- a strong question
- a repeated blocker
- a before/after
- a project decision
- a tradeoff
- a member win
- a resource gap

Weekly, turn the best captures into:

- one article or build note
- one X/LinkedIn post
- one Discord resource drop
- one future daily prompt

### Future Content Taxonomy

- AI apps
- full-stack apps
- websites and design
- agents and automation
- SEO and content systems
- ads and growth
- cloud and DevOps
- architecture and systems

## Premium Monetization

The code path exists. Finish the commercial setup with real Stripe data:

1. Decide premium price and cadence.
2. Create or locate the Stripe Price ID.
3. Set `STRIPE_PRICE_DISCORD_PREMIUM` in Vercel.
4. Confirm `Premium Member` exists in Discord.
5. Run `/premium` in Discord.
6. Complete checkout with a real/test account depending on environment.
7. Confirm Stripe webhook assigns `Premium Member`.
8. Cancel/update subscription and confirm role removal or status update.

Do not invent a price in code. Stripe price is a business decision and belongs in Stripe/Vercel config.

## Server Operations

### Posting Permissions

| Surface | Rule |
| --- | --- |
| `start-here` | Admin/bot only |
| `daily-signal` | Bot/admin posts, members reply |
| `resources` | Admin/bot posts, members can request gaps in `content-lab` |
| `premium` | Premium members and admin |
| `team-ops` | Admin/moderator/bot only |
| All other public rooms | Members can post |

### Moderator Role

Create a moderator/admin role with permission to:

- manage messages
- timeout members
- view `team-ops`
- manage threads
- mention role groups carefully

Do not give broad admin permissions unless needed.

### Bot Permissions

SageBot needs:

- read channels/view channels
- send messages
- use slash commands
- manage roles below its highest role
- read message history

For premium sync, the bot role must sit above `Premium Member`.

### Spam / Report Process

1. Member runs `/report`.
2. Bot posts report into `team-ops`.
3. Moderator reviews context.
4. Action is taken: ignore, remind, delete, timeout, remove.
5. Repeated issues become a written rule or onboarding clarification.

### Operating Cadence

Daily:

- bot posts `daily-signal`
- skim `build-lab`, `review-queue`, `content-lab`
- capture strong questions

Weekly:

- run office-hours if enough questions exist
- post weekly recap
- promote top ships
- convert best community moments into content
- review premium conversions and onboarding completion

Monthly:

- refresh resource drops
- review analytics
- prune stale rules/resources
- launch one build challenge

## Analytics Roadmap

Current tables:

- `discord_members`
- `discord_events`
- `discord_scheduled_runs`
- `discord_quizzes`
- `discord_quiz_attempts`
- `discord_challenges`
- `discord_challenge_submissions`
- `discord_points_ledger`
- `discord_leaderboard_snapshots`
- `discord_content_queue`
- `discord_member_streaks`
- `discord_member_applications`

Next useful dashboard metrics:

- new members by path
- onboarding completion rate
- command usage by command
- daily/weekly post success rate
- premium checkout starts and completions
- active members
- top content captures
- review requests by type
- office-hours questions submitted
- project submissions by path

## What Is Done vs Next

Done:

- signed Discord interaction endpoint
- slash-command registry
- role assignment by path/level
- Supabase member/event/run persistence
- daily and weekly cron routes
- premium checkout/webhook code path
- admin analytics surface

Next:

- create/verify lean channels and roles in Discord
- enforce approval-gated permissions with `npm run discord:approval-gate`
- set `STRIPE_PRICE_DISCORD_PREMIUM`
- post `start-here` content
- test `/onboard`, `/submit-project`, `/request-review`, `/capture-content`, `/premium`
- run one weekly cycle and use the analytics to adjust

## First 100 Members To 10k-Ready Path

Do not build for imaginary scale by adding channel sprawl. Build for scale by making every interaction structured:

1. First 100 members: use slash commands, daily prompts, quizzes, challenges, points, and the admin content queue.
2. 100 to 1,000 members: add moderation automation, queue triage, premium review SLAs, and leaderboard snapshots.
3. 1,000+ members: add a persistent Discord Gateway worker for message/reaction/member events that slash commands cannot observe.
4. 10k-ready: separate the worker from the web app, add job queues, rate limits, replay-safe event ingestion, and moderator workflows.

The core loop stays the same at every stage:

```text
question asked -> answer given -> captured by bot -> content queue -> resource/drop -> daily prompt -> article/social/course lesson
```
