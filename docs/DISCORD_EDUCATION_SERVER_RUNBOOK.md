# Sage Ideas Discord Education Server Runbook

This is the operating standard for running Sage Ideas Academy as a focused education server.

## Positioning

Sage Ideas Academy is a gated builder room for people learning by shipping AI apps, websites, automations, cloud systems, content engines, and product foundations.

The server should feel small, serious, useful, and easy to navigate. Do not create channels for every topic. Keep the lean 11-channel model and make each room’s job obvious through pinned posts, topics, and bot commands.

## Channel Operating Model

| Channel | Job | Primary action |
| --- | --- | --- |
| `start-here` | Rules, application, first action | `/apply` |
| `daily-signal` | Daily prompt, quiz, challenge | `/daily`, `/quiz`, `/challenge` |
| `questions` | Main Q&A, answers, helpful marks | `/ask`, `/answer`, `/mark-helpful` |
| `build-lab` | Project specs and build work | `/submit-project` |
| `review-queue` | Focused critique | `/request-review` |
| `resources` | Reusable templates and guides | resource drops |
| `wins` | Ships, proof, wins, recap inputs | challenge submissions |
| `premium` | Priority/deeper support | `/premium` |
| `team-ops` | Moderation, approvals, analytics | `/pending`, admin dashboard |

## Approval Standard

Approve members who:

- accept the rules
- have a clear learning/building goal
- name a real first build or improvement
- show enough context to route them

Reject or hold members who:

- give vague answers
- appear to be spam/self-promo
- do not accept rules
- are asking for financial/legal/medical advice
- lower trust or safety before contributing

## First Seven Days

Every approved member should complete the first-week checklist:

1. Post an intro in `questions`.
2. Choose path and level with `/onboard`.
3. Complete one daily signal with `/daily`.
4. Submit one challenge with `/submit-challenge`.
5. Submit one project/spec with `/submit-project`.
6. Request one focused review with `/request-review`.
7. Capture one reusable question/lesson with `/capture-content`.
8. Post one win or next milestone.

Members can inspect progress with `/checklist` and manually mark social steps with `/complete-step`.

## Weekly Cadence

| Day | Operating focus | Bot/community output |
| --- | --- | --- |
| Monday | Weekly build theme | Daily signal and build target |
| Tuesday | Tool/pattern teardown | Quiz + resource |
| Wednesday | Build challenge | Challenge prompt |
| Thursday | Review day | Push review queue |
| Friday | Wins and proof | Showcase prompt |
| Saturday | Content engine | Capture top questions |
| Sunday | Recap | Leaderboard + challenge recap |

## Premium Promise

Premium is optional and should not block basic participation.

Premium members get:

- private premium room access
- priority challenge/review flow
- deeper teardown posts and advanced drops
- weekly office-hours priority when sessions run
- premium notes/replays when available
- early access to templates/checklists before public release

Current founding price: `$29/month`.

## Content Engine Loop

The content machine is:

question asked -> answer given -> captured by bot -> content queue -> resource/drop -> daily prompt -> article/social/course lesson

Admin content workflow:

1. Capture with `/capture-content`.
2. Review in admin Discord dashboard.
3. Move status from `captured` to `triaged`.
4. Draft as resource, article, social post, lesson, or prompt.
5. Mark `published`.
6. Link back into `resources`, `daily-signal`, or a public site route.

## Reputation MVP

The first working reputation loop is:

- `/ask` creates a structured question in `questions` and awards 5 points.
- `/answer` records a useful answer and awards 10 points.
- `/mark-helpful` lets an admin/mod mark an answer helpful and awards a 15 point quality bonus.
- `/award` lets admins manually adjust points for strong reviews, resources, wins, and moderation decisions.
- `/profile`, `/points`, `/leaderboard`, `/rewards`, and `/weekly-winners` make participation visible.

Current persistence status:

- Points use the existing `discord_points_ledger`.
- Full question/answer persistence requires migration `0054_discord_questions_reputation.sql`.
- If the migration is not applied yet, `/ask` and `/answer` still post to Discord and award points, but durable Q&A history is temporarily limited.

## Moderator Runbook

Daily:

- Review pending applications.
- Approve/reject from Discord or `/admin/discord`.
- Watch reports in `team-ops`.
- Remove spam quickly.

Weekly:

- Run/post weekly recap.
- Review leaderboard and challenge submissions.
- Feature useful wins.
- Promote repeated questions into resources.
- Check premium queue and review backlog.

Escalate/remove:

- harassment
- repeated spam
- predatory DMs
- low-effort AI dumps after warning
- off-topic self-promotion
- anything that makes members less willing to share work

## First 5-10 Member Beta Test

Before inviting 100 people, run a small test with 5-10 members.

Watch for:

- Can they understand the application path without help?
- Do they know what to post where?
- Do they run `/onboard`, `/daily`, `/quiz`, and `/challenge`?
- Do review requests include enough context?
- Does `/checklist` make the first week clear?
- Does premium feel clear without feeling pushy?
- Are pinned posts enough to self-serve?

## Gateway Worker Production Runbook

The Discord interaction routes can live on Vercel, but message/reaction tracking needs a long-lived Gateway worker. Vercel serverless functions are not the right place for this socket.

Worker responsibilities:

- connect to Discord Gateway v10
- reconnect with backoff after non-fatal socket closes
- resume the last session when Discord allows it
- write liveness to `discord_gateway_heartbeats`
- persist resume state in `discord_gateway_sessions`
- dead-letter failed event handling to `discord_gateway_dead_letters`
- capture messages, edits, deletes, reactions, and thread updates into the Discord analytics tables

Required worker environment:

- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DISCORD_GATEWAY_WORKER_ID=sagebot-main`
- `DISCORD_GATEWAY_MESSAGE_CONTENT=true` after Message Content Intent is enabled in the Discord Developer Portal

Local verification:

```bash
npm run discord:migration-check
npm run discord:smoke
npm run discord:gateway:once
```

Message-content verification after enabling the privileged intent:

```bash
npm run discord:gateway:once:content
npm run discord:gateway:local -- --message-content
```

Then post a real member message in the main Q&A channel and confirm a new row appears in `discord_messages`. If Discord closes with `4014 Disallowed intent(s)`, the Message Content Intent is still disabled or the bot is requesting an intent it is not allowed to use.

Hosted worker deployment:

1. Apply migrations `0060_discord_gateway_worker.sql` and `0063_discord_gateway_reliability.sql`.
2. Create a Railway service from `Dockerfile.worker` or import `railway.worker.json`.
3. Set the required worker environment variables.
4. Start command is `npm run discord:gateway`.
5. Confirm `/admin/discord` shows a fresh heartbeat for `sagebot-main`.
6. Post a test message and confirm `discord_messages` increments.
7. Confirm open dead letters stay at zero.

Success threshold:

- 80% submit an intro.
- 60% run `/daily`.
- 40% submit a project or challenge.
- At least 3 useful content queue items are captured.
- No member asks where to start after reading `start-here`.
