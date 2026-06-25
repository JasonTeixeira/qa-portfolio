# Sage Ideas Discord World-Class Proof Operating Controls

This is the operating control layer for the Discord/SageBot system. It defines what evidence has to exist before the system can be scored 95+ in any live operating category.

The rule is simple: local tests prove code quality; live operating proof proves the community system is actually working.

## Current Release Rule

Do not claim the Discord/SageBot system is world-class until all four proof lanes below pass from real operating data:

1. Approved Discord knowledge
2. Discord knowledge synced into RAG
3. Public proof growth assets
4. Premium workflow proof

Dry-run content, synthetic smoke rows, raw unapproved chatter, and private messages do not count as world-class proof.

## Proof Lane 1: Approved Discord Knowledge

Target:
- At least 10 approved Discord knowledge sources.

Counts from:
- `discord_questions.status in ('answered', 'closed')`
- `discord_answers.helpful = true`
- `discord_content_queue.status = 'published'`
- `discord_content_drafts.status in ('approved', 'published')`

Admin action:
- Review captured questions, answers, resources, wins, project submissions, and review requests in `/admin/discord`.
- Approve only items that are accurate, useful, safe to reuse, and not private.
- Reject low-context chatter, vague wins, spam, private requests, or anything that would make weak curriculum.

Safe local command:
- `npm run discord:operating-cycle:dry-run`

Passing evidence:
- `docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json` shows `approvedDiscordKnowledgeSources >= 10`.
- `docs/evidence/engineering-loop/discord-proof-backlog-latest.json` shows the `approved_discord_knowledge` lane as `passed`.

Failure response:
- If the count is zero, the issue is not code. The system needs real member activity and admin approval.
- If candidates exist but are not approved, use the admin dashboard to approve, reject, or request more context.

## Proof Lane 2: Discord Knowledge Synced Into RAG

Target:
- At least 10 Discord RAG sources from approved Discord records.

Counts from:
- `rag_sources` where `source_type in ('discord_question', 'discord_answer', 'discord_content_queue')`
- `rag_sources` where `source_table = 'discord_content_drafts'`

Admin action:
- After weekly approval, run the approved Discord RAG sync.
- Confirm approved Discord items become RAG sources, documents, chunks, and retrievable citations.

Safe local command:
- `npm run discord:operating-cycle:dry-run`

Live command after approval:
- `npm run discord:operating-cycle`

Passing evidence:
- `docs/evidence/discord-ai-os/phase-21-operating-proof-cycle.json` shows `ragDiscordSources >= 10`.
- `/admin/discord` shows the proof backlog lane as passed.
- RAG answers cite approved Discord-derived sources when relevant.

Failure response:
- If approved knowledge exists but RAG sources stay at zero, inspect `runApprovedDiscordRagSourceSync`, `rag_sources`, `rag_documents`, and `rag_chunks`.
- Do not promote raw message captures directly into authoritative RAG.

## Proof Lane 3: Public Proof Growth Assets

Target:
- At least 4 pending or published public proof drafts from approved Discord source material.

Counts from:
- `discord_public_growth_drafts.status = 'pending_approval'`
- `discord_public_growth_drafts.status = 'published'`

Admin action:
- Create one privacy-safe public proof asset per weekly operating cycle.
- Use approved source material only.
- Anonymize member details unless the member explicitly approves attribution.
- Approve or publish only after quality and privacy review.

Safe local command:
- `npm run discord:operating-cycle:dry-run`

Live command after approval:
- `npm run discord:operating-cycle`

Passing evidence:
- Four weekly public proof drafts or published assets exist.
- `discord_growth_events` records the source, campaign, draft, and approval path.
- Applications, approvals, onboarded members, active members, or premium leads can be reviewed against the proof loop.

Failure response:
- If there is no approved source material, do not create generic public proof.
- If draft quality is low, reject it and improve the source material or prompt.

## Proof Lane 4: Premium Workflow Proof

Target:
- At least 1 premium member/request path proves authorization, SLA, and fulfillment behavior.

Counts from:
- `discord_members.premium_member = true`
- Premium workflow tables such as `discord_premium_review_requests`
- Office-hours workflow tables such as `discord_office_hours_queue`

Admin action:
- Run one premium review, deeper answer, or office-hours queue flow with a real premium member or an intentionally seeded premium scenario.
- Confirm non-premium users cannot access premium-only actions.
- Confirm the premium promise is fulfilled with a useful response, review, or queue state.

Safe local command:
- `npm run discord:smoke-premium-workflows`

Passing evidence:
- Premium authorization passes.
- Non-premium authorization fails.
- SLA/status fields update.
- The premium request is visible in `/admin/discord`.

Failure response:
- If Stripe role sync is not available, use a clearly marked seeded premium scenario for local workflow proof only.
- Do not count seeded local proof as a real premium conversion.

## Weekly Operator Sequence

Run this sequence once per week:

1. Review new Discord applications and approve or reject them in Discord.
2. Confirm approved members can see free channels and unapproved members cannot.
3. Review knowledge candidates in `/admin/discord`.
4. Approve at least the highest-signal questions, helpful answers, builds, resources, and wins.
5. Run `npm run discord:operating-cycle:dry-run`.
6. If the dry-run shows approved knowledge is available, run `npm run discord:operating-cycle`.
7. Review any generated public proof draft for accuracy, privacy, and usefulness.
8. Approve or reject the public proof draft.
9. Run `npm run rag:evaluate`.
10. Run `npm run discord:smoke-final-scorecard`.
11. Run `npm run discord:world-class-readiness`.
12. Run `npm run discord:proof-backlog`.
13. Save the evidence artifacts and update the weekly operating notes.

## Release Gate

Before claiming a 95+ posture, run:

```bash
npm run verify:local
```

The claim is still blocked if any of these are true:

- `worldClassEligible` is false.
- Any scorecard category is below 95.
- Any proof backlog lane is blocked.
- Evidence comes only from dry-runs or synthetic smoke data.
- Public proof has not been reviewed for privacy.
- Premium workflow proof is missing.

## Admin Dashboard Expectations

`/admin/discord` should make these visible without requiring log spelunking:

- Current proof backlog status
- Blocked proof lanes
- Current count versus target count
- Source tables used for each count
- Safe local command
- Live action required
- Evidence required

If a lane is blocked, the dashboard should explain the real next action instead of hiding the gap behind a green score.

## Scoring Discipline

Score meaning:

- 70-79: built, but proof is thin.
- 80-89: tested locally with smoke proof.
- 90-94: observable, admin-visible, idempotent, and failure-aware.
- 95-99: live-proven, eval-covered, failure-tested, and backed by real operating evidence.

The current system can keep improving locally, but the final move from strong engineering posture to 95+ requires real weekly usage, approval, RAG sync, public proof, and premium workflow evidence.
