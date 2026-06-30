# Sage Ideas Discord Operator Brief

Generated: 2026-06-30T13:25:58.409Z
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
- Verification: SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle && SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing
- Evidence required: RAG sources include approved Discord question/answer/content/draft records, not raw unapproved chatter.
- Live action: Run the approved Discord RAG sync after approving knowledge candidates.

### Public proof growth assets

- Status: blocked
- Current: 0/4
- Admin surface: /admin/discord -> Public Proof Sources and Public Growth Drafts panels
- Local check: npm run discord:operating-cycle:dry-run
- Verification: SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle && npm run discord:proof-backlog
- Evidence required: Four weekly proof drafts or published assets with application/source tracking.
- Live action: Create privacy-safe public proof drafts from approved Discord source material and approve/publish them weekly.

### Premium workflow proof

- Status: blocked
- Current: 0/1
- Admin surface: /admin/discord -> Premium, Office Hours, and Member Intelligence panels
- Local check: npm run discord:smoke-premium-workflows
- Verification: npm run discord:smoke-premium-workflows && npm run discord:proof-backlog
- Evidence required: At least one fulfilled premium path proves authorization, SLA, and fulfillment behavior; membership or queued requests alone do not count.
- Live action: Run one premium review, deeper-answer, or office-hours flow with a real or intentionally seeded premium scenario.

## Proof Source Recovery

- Status: blocked
- Blocked lanes: 4
- Total shortfall: 25
- Next lane: approvedDiscordKnowledge
- Lane states:
  - approvedDiscordKnowledge: 0/10, needs_review, shortfall 10, cadence checks 3, acceptance checks 3
  - ragDiscordSources: 0/10, no_source_volume, shortfall 10, cadence checks 3, acceptance checks 3
  - publicProofAssets: 0/4, no_source_volume, shortfall 4, cadence checks 3, acceptance checks 3
  - premiumWorkflowProof: 0/1, needs_fulfillment, shortfall 1, cadence checks 3, acceptance checks 3

## RAG Missing Eval Preflight

- Status: ready_for_explicitly_approved_eval
- OK: yes
- Keys match coverage: yes
- Ready: 0/0
- Sources ready: 0/0
- Terms ready: 0/0
- Approved command after explicit approval: SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing
- Boundary: This preflight checks local source readiness for missing eval keys. It does not seed Supabase, call DeepSeek, run retrieval, write rag_eval_results, or satisfy eval coverage.

## RAG Eval Recovery Plan

- Status: ready
- OK: yes
- Missing eval backlog ready: 0/0
- Failed eval backlog: 0
- Approved command after explicit approval: SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing
- Boundary: This recovery plan reads local RAG eval evidence only. It does not seed Supabase, call DeepSeek, run retrieval, write eval results, or satisfy eval coverage.

## Gateway Capture

- Status: healthy
- OK: yes
- Usable non-bot message count: 1
- Packet status: proven
- Packet target: 1/1
- Packet remaining: 0
- Packet state: fresh_usable_message_proven
- Message content: true via heartbeat
- Heartbeat: fresh (sagebot-main, age 1 minutes)
- Root causes: none reported
- Next actions:
  - Run classifier and content queue jobs only with explicit approval for live Supabase mutation.
  - Review resulting candidates in /admin/discord and approve durable knowledge items.
  - Rerun proof-source scan after approvals.

## Release Gates

- Passed: 17/17
- Failures: none

## Required Command Order

1. `npm run discord:operating-cycle:dry-run`
2. `npm run discord:smoke-premium-workflows`
3. `SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle`
4. `npm run discord:proof-source-recovery-plan`
5. `npm run rag:evaluate:missing-preflight`
6. `npm run rag:evaluate:recovery-plan`
7. `SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing`
8. `npm run rag:evaluate:coverage-readiness`
9. `npm run rag:discord-corpus-readiness`
10. `npm run discord:durable-jobs-readiness`
11. `npm run discord:security-privacy-readiness`
12. `npm run discord:observability-quality-readiness`
13. `npm run discord:channel-matrix-readiness`
14. `npm run discord:content-factory-readiness`
15. `npm run discord:premium-readiness`
16. `npm run discord:public-growth-readiness`
17. `npm run discord:proof-intake-readiness`
18. `npm run discord:weekly-proof-packet`
19. `npm run discord:proof-rehearsal-readiness`
20. `npm run discord:smoke-final-scorecard`
21. `npm run discord:proof-backlog`
22. `npm run discord:proof-candidate-audit`
23. `npm run discord:world-class-readiness`
24. `npm run discord:operator-brief`
25. `npm run discord:gateway-capture-diagnosis`
26. `npm run discord:gateway-operating-packet`
27. `npm run verify:local:evidence`

## Action Plan By Permission Boundary

### Safe Local Commands

- `npm run discord:operating-cycle:dry-run`
- `npm run discord:smoke-premium-workflows`
- `npm run discord:proof-source-recovery-plan`
- `npm run rag:evaluate:missing-preflight`
- `npm run rag:evaluate:recovery-plan`
- `npm run rag:evaluate:coverage-readiness`
- `npm run rag:discord-corpus-readiness`
- `npm run discord:durable-jobs-readiness`
- `npm run discord:security-privacy-readiness`
- `npm run discord:observability-quality-readiness`
- `npm run discord:channel-matrix-readiness`
- `npm run discord:content-factory-readiness`
- `npm run discord:premium-readiness`
- `npm run discord:public-growth-readiness`
- `npm run discord:proof-intake-readiness`
- `npm run discord:weekly-proof-packet`
- `npm run discord:proof-rehearsal-readiness`
- `npm run discord:proof-backlog`
- `npm run discord:proof-candidate-audit`
- `npm run discord:world-class-readiness`
- `npm run discord:operator-brief`
- `npm run discord:gateway-capture-diagnosis`
- `npm run discord:gateway-operating-packet`
- `npm run verify:local:evidence`

### Explicit Approval Commands

- `SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle`
- `SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing`

### Live Operator Actions

- Approve high-signal questions, answers, resources, wins, reviews, or drafts from /admin/discord.
- Run the approved Discord RAG sync after approving knowledge candidates.
- Create privacy-safe public proof drafts from approved Discord source material and approve/publish them weekly.
- Run one premium review, deeper-answer, or office-hours flow with a real or intentionally seeded premium scenario.
- Run classifier and content queue jobs only with explicit approval for live Supabase mutation.
- Review resulting candidates in /admin/discord and approve durable knowledge items.
- Rerun proof-source scan after approvals.
- Run npm run discord:classify-messages, then npm run discord:queue-content to create reviewable candidates.

## Non-Claim Rule

Do not claim world-class, 95+, production-complete, or operating-proof complete until every proof backlog lane is passed from real operating data and the final scorecard is rerun.
