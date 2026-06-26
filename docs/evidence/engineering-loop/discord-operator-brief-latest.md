# Sage Ideas Discord Operator Brief

Generated: 2026-06-26T01:48:56.454Z
Release decision: do_not_claim_world_class
Average score: 83/100
World-class eligible: no

## Current Reality

The local system is verified, but real operating proof is still missing. Close gateway capture and blocked proof lanes with real approved community activity before claiming 95+.

## Blocked Proof Lanes

### Approved Discord knowledge

- Status: blocked
- Current: 0/10
- Admin surface: /admin/discord -> Content Queue, Drafts, and Knowledge Candidate review panels
- Local check: npm run discord:operating-cycle:dry-run
- Verification: npm run discord:operating-cycle:dry-run && npm run discord:proof-backlog
- Evidence required: At least 10 approved Discord knowledge sources before RAG sync and scorecard improvement.
- Live action: Approve high-signal questions, answers, resources, wins, reviews, or drafts from /admin/discord.

### Discord knowledge synced into RAG

- Status: blocked
- Current: 0/10
- Admin surface: /admin/discord -> RAG Health, Corpus Health, and Eval Runs panels
- Local check: npm run discord:operating-cycle:dry-run
- Verification: npm run discord:operating-cycle && npm run rag:evaluate && npm run discord:smoke-final-scorecard
- Evidence required: RAG sources include approved Discord question/answer/content/draft records, not raw unapproved chatter.
- Live action: Run the approved Discord RAG sync after approving knowledge candidates.

### Public proof growth assets

- Status: blocked
- Current: 0/4
- Admin surface: /admin/discord -> Public Proof Sources and Public Growth Drafts panels
- Local check: npm run discord:operating-cycle:dry-run
- Verification: npm run discord:operating-cycle && npm run discord:proof-backlog
- Evidence required: Four weekly proof drafts or published assets with application/source tracking.
- Live action: Create privacy-safe public proof drafts from approved Discord source material and approve/publish them weekly.

### Premium workflow proof

- Status: blocked
- Current: 0/1
- Admin surface: /admin/discord -> Premium, Office Hours, and Member Intelligence panels
- Local check: npm run discord:smoke-premium-workflows
- Verification: npm run discord:smoke-premium-workflows && npm run discord:proof-backlog
- Evidence required: At least one premium member/request path proves authorization, SLA, and fulfillment behavior.
- Live action: Run one premium review, deeper-answer, or office-hours flow with a real or intentionally seeded premium scenario.

## Gateway Capture

- Status: blocked
- OK: yes
- Usable non-bot message count: 0
- Root causes:
  - Latest gateway heartbeat does not expose Message Content Intent metadata.
  - Non-bot messages exist, but message content is empty.
- Next actions:
  - Confirm the deployed worker is running the current heartbeat metadata build and has DISCORD_GATEWAY_MESSAGE_CONTENT=true.
  - Confirm Message Content Intent is enabled both in Discord Developer Portal and worker env, then capture a fresh message.

## Required Command Order

1. `npm run discord:operating-cycle:dry-run`
2. `npm run discord:smoke-premium-workflows`
3. `npm run discord:operating-cycle`
4. `npm run rag:evaluate`
5. `npm run discord:smoke-final-scorecard`
6. `npm run discord:world-class-readiness`
7. `npm run discord:proof-backlog`
8. `npm run discord:operator-brief`
9. `npm run discord:content-factory-readiness`
10. `npm run discord:proof-intake-readiness`
11. `npm run discord:weekly-proof-packet`
12. `npm run discord:gateway-capture-diagnosis`

## Non-Claim Rule

Do not claim world-class, 95+, production-complete, or operating-proof complete until every proof backlog lane is passed from real operating data and the final scorecard is rerun.
