# Discord Proof Source Recovery Plan

Generated: 2026-06-29T20:10:18.069Z
Status: blocked
Mutation mode: local_file_evidence_only

This recovery plan reads source-volume evidence and writes local guidance only. It does not approve, sync, publish, assign roles, call AI models, or satisfy operating proof.

## Summary

- Lanes: 4
- Blocked lanes: 4
- Total shortfall: 25
- Next lane: approvedDiscordKnowledge

## Lane Plan

### approvedDiscordKnowledge

- Status: blocked
- Count: 0/10
- Shortfall: 10
- State: needs_review
- Admin surface: /admin/discord -> Content Queue, Drafts, Knowledge/RAG
- Safe local command: `npm run discord:proof-source-scan`
- Live action: Collect and approve high-signal member questions, helpful answers, project submissions, reviews, wins, and resources.
- Verification: `npm run discord:proof-source-scan && npm run discord:operating-cycle:dry-run`

Evidence to collect:
- Specific member question with goal, attempt, blocker, and reusable teaching value.
- Helpful answer or review that explains a decision, risk, or build pattern.
- Project/resource/win that can become a lesson without exposing private data.

Collection cadence:
- Daily: review captured questions, answers, builds, reviews, wins, and resources for reusable teaching value.
- Weekly: approve at least two privacy-safe knowledge candidates until the lane reaches 10/10.
- Monthly: remove stale, private, or low-context candidates that should not become durable knowledge.

Acceptance checklist:
- Source has a concrete problem, artifact, decision, or teaching moment.
- Source is privacy-safe, anonymized, or explicitly approved for internal reuse.
- Admin decision reason explains why the source belongs in future answers or lessons.

Do not count:
- Raw unapproved Discord chatter.
- Generic praise, greetings, low-context messages, or private member details.
- Synthetic smoke rows or dry-run drafts.

### ragDiscordSources

- Status: blocked
- Count: 0/10
- Shortfall: 10
- State: no_source_volume
- Admin surface: /admin/discord -> RAG Health, Corpus Health, Eval Runs
- Safe local command: `npm run discord:proof-source-scan`
- Live action: After approved knowledge exists, run approved Discord RAG sync and re-run eval/scorecard.
- Verification: `SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle && SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing`

Evidence to collect:
- Approved Discord source synced into rag_sources with approved provenance.
- Generated document/chunk tied back to an approved question, answer, queue item, or draft.
- Retrieval/eval evidence showing the synced source is citeable.

Collection cadence:
- Weekly: run approved-source sync only after the approved knowledge lane has new material.
- After each sync: re-run retrieval and eval evidence before using score improvement claims.
- Monthly: audit Discord-derived RAG sources for stale, rejected, or privacy-sensitive material.

Acceptance checklist:
- RAG source points to an approved Discord question, answer, queue item, or content draft.
- Document/chunk text is citeable and does not include raw private chatter.
- Retrieval evidence shows the source can be selected for relevant questions.

Do not count:
- Raw discord_messages rows.
- Rejected, deleted, private, or low-quality source material.
- RAG sources without approved Discord provenance.

### publicProofAssets

- Status: blocked
- Count: 0/4
- Shortfall: 4
- State: no_source_volume
- Admin surface: /admin/discord -> Public Proof Sources, Public Growth Drafts
- Safe local command: `npm run discord:proof-source-scan`
- Live action: Create privacy-safe weekly proof drafts from approved Discord source material and approve/publish them manually.
- Verification: `SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle && npm run discord:proof-source-scan`

Evidence to collect:
- Approved Discord source with public-sharing status anonymized or explicit.
- Public proof draft with source provenance and a clear lesson/proof angle.
- Growth event or application attribution tied to the proof cycle.

Collection cadence:
- Weekly: select one approved source that can become a privacy-safe public lesson or proof asset.
- Weekly: approve or reject the public proof draft before publishing anywhere external.
- After publishing: record apply clicks, applications, and source attribution for that proof cycle.

Acceptance checklist:
- Public proof asset references approved source provenance without leaking private member data.
- Draft has a clear lesson, outcome, or proof angle rather than generic promotional copy.
- Growth event tracking is attached before the asset counts toward the public proof target.

Do not count:
- Public posts detached from approved source material.
- Member names, screenshots, or details without explicit permission.
- Generic social content that does not prove the community system.

### premiumWorkflowProof

- Status: blocked
- Count: 0/1
- Shortfall: 1
- State: needs_fulfillment
- Admin surface: /admin/discord -> Premium, Office Hours, Member Intelligence
- Safe local command: `npm run discord:smoke-premium-workflows`
- Live action: Fulfill one premium review, deeper answer, or office-hours workflow with visible authorization and outcome.
- Verification: `npm run discord:smoke-premium-workflows && npm run discord:proof-source-scan`

Evidence to collect:
- Premium authorization or deliberately seeded premium scenario.
- Submitted artifact/question with status answered, completed, or fulfilled.
- Logged SLA/outcome proving premium fulfillment without free-member bypass.

Collection cadence:
- Weekly: review premium members, open review requests, deeper-answer requests, and office-hours queue.
- Per request: record authorization, requested outcome, SLA state, and final response status.
- Monthly: audit premium fulfillment quality and economics before changing the premium promise.

Acceptance checklist:
- Proof shows premium authorization or a deliberately seeded premium test scenario.
- Request has a submitted artifact/question and a completed or answered outcome.
- SLA/outcome is logged without granting premium-only workflows to unqualified free members.

Do not count:
- Premium interest without a fulfilled workflow.
- Premium role alone.
- Queued requests with no answer/completion outcome.

## Anti-Fake Rules

- Do not count dry-run, smoke, synthetic, rejected, or raw unapproved rows as operating proof.
- Do not sync raw Discord messages into authoritative RAG without admin approval and privacy review.
- Do not publish public proof without explicit anonymized/approved sharing status.
- Do not count premium role membership as premium workflow fulfillment.
