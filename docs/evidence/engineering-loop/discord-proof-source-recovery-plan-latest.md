# Discord Proof Source Recovery Plan

Generated: 2026-06-26T05:09:00.169Z
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
- State: no_source_volume
- Admin surface: /admin/discord -> Content Queue, Drafts, Knowledge/RAG
- Safe local command: `npm run discord:proof-source-scan`
- Live action: Collect and approve high-signal member questions, helpful answers, project submissions, reviews, wins, and resources.
- Verification: `npm run discord:proof-source-scan && npm run discord:operating-cycle:dry-run`

Evidence to collect:
- Specific member question with goal, attempt, blocker, and reusable teaching value.
- Helpful answer or review that explains a decision, risk, or build pattern.
- Project/resource/win that can become a lesson without exposing private data.

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
- Verification: `npm run discord:operating-cycle && npm run rag:evaluate && npm run discord:smoke-final-scorecard`

Evidence to collect:
- Approved Discord source synced into rag_sources with approved provenance.
- Generated document/chunk tied back to an approved question, answer, queue item, or draft.
- Retrieval/eval evidence showing the synced source is citeable.

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
- Verification: `npm run discord:operating-cycle && npm run discord:proof-source-scan`

Evidence to collect:
- Approved Discord source with public-sharing status anonymized or explicit.
- Public proof draft with source provenance and a clear lesson/proof angle.
- Growth event or application attribution tied to the proof cycle.

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

Do not count:
- Premium interest without a fulfilled workflow.
- Premium role alone.
- Queued requests with no answer/completion outcome.

## Anti-Fake Rules

- Do not count dry-run, smoke, synthetic, rejected, or raw unapproved rows as operating proof.
- Do not sync raw Discord messages into authoritative RAG without admin approval and privacy review.
- Do not publish public proof without explicit anonymized/approved sharing status.
- Do not count premium role membership as premium workflow fulfillment.
