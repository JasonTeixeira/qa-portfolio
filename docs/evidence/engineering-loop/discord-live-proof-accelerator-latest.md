# Discord Live Proof Accelerator

Generated: 2026-06-30T13:26:02.236Z
Status: proof_acceleration_required
Mutation mode: local_file_evidence_only

This accelerator writes local evidence and command plans only. It does not approve knowledge, sync RAG, publish public proof, mutate Discord, or create premium fulfillments.

## Summary

- Blocked lanes: 4
- Passed lanes: 1
- Total shortfall: 25
- Next best lane: approved_discord_knowledge
- Next best action: Approved Discord knowledge: Create more real source volume from member questions, answers, builds, reviews, wins, and resources.

## Lanes

### Gateway message capture

- Key: gateway_capture
- Status: passed
- Current: 1/1
- Shortfall: 0
- Impact: critical
- Local work: Keep gateway diagnosis, gateway operating packet, classifier, and queue automation in the loop. Surface the current gateway packet in the admin dashboard and local evidence.
- Approval boundary: Requires at least one real non-bot member message in Discord to create fresh capture proof. Does not require publishing, but it does require live member activity.
- Acceptance: Gateway heartbeat is fresh. Message Content Intent is effectively enabled. At least one non-bot non-empty visible message appears in discord_messages.

### Approved Discord knowledge

- Key: approved_discord_knowledge
- Status: needs_source_volume
- Current: 0/10
- Shortfall: 10
- Impact: critical
- Local work: Create more real source volume from member questions, answers, builds, reviews, wins, and resources. Queue operator review packets with required privacy, provenance, and RAG-safe fields. Reject synthetic, low-context, or private material before it can count.
- Approval boundary: Admin must approve reusable Discord knowledge in /admin/discord before it counts. Raw messages, local seed drafts, and dry-run rows do not count as approved live knowledge.
- Acceptance: 10 approved sources exist across questions, answers, content queue, or approved Discord drafts. Every source has privacy status, decision reason, reviewer evidence, and RAG-safe text.

### Discord knowledge synced into RAG

- Key: rag_discord_sources
- Status: needs_source_volume
- Current: 0/10
- Shortfall: 10
- Impact: critical
- Local work: Keep RAG corpus health, source sync dry-runs, and eval packets current. Prepare the guarded sync/eval command sequence once approved knowledge exists.
- Approval boundary: Authoritative RAG sync is a production data mutation and must stay behind explicit approval. Only approved/anonymized Discord knowledge may be synced.
- Acceptance: 10 RAG sources/chunks have approved Discord provenance. RAG eval runs after sync and does not regress groundedness/citation coverage.

### Public proof growth assets

- Key: public_proof_assets
- Status: needs_source_volume
- Current: 0/4
- Shortfall: 4
- Impact: high
- Local work: Draft privacy-safe proof assets from approved Discord knowledge only. Keep public proof readiness and growth attribution checks current.
- Approval boundary: Public proof drafts require explicit admin approval before publishing. Member names/screenshots/private details require separate permission before public use.
- Acceptance: 4 pending-approved or published public proof assets exist. Each asset has source provenance, privacy score, and growth attribution path.

### Premium workflow proof

- Key: premium_workflow_proof
- Status: needs_source_volume
- Current: 0/1
- Shortfall: 1
- Impact: high
- Local work: Keep premium smoke coverage, premium readiness, and admin premium queue evidence current. Prepare one deliberate premium proof scenario without granting live access automatically.
- Approval boundary: A real or explicitly seeded premium review/office-hours fulfillment must be approved before it counts. Role-only premium status does not count as workflow proof.
- Acceptance: At least one premium review or office-hours request is answered/completed. Authorization, SLA/status, fulfillment, and no-free-member-bypass evidence are visible.

## Autonomous Command Plan

- `npm run discord:proof-source-scan`
- `npm run discord:approved-knowledge-packet`
- `npm run discord:proof-candidate-audit`
- `npm run discord:live-proof-accelerator`
- `npm run discord:sageforge-institutional-harness`

## Explicit Approval Command Plan

- `SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle`
- `SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing`
- `npm run discord:register`
- `npm run discord:pin-posts`

## Operator Checklist

- 1. Approved Discord knowledge: current 0/10; shortfall 10.
-    Local work: Create more real source volume from member questions, answers, builds, reviews, wins, and resources.
-    Boundary: Admin must approve reusable Discord knowledge in /admin/discord before it counts.
- 2. Discord knowledge synced into RAG: current 0/10; shortfall 10.
-    Local work: Keep RAG corpus health, source sync dry-runs, and eval packets current.
-    Boundary: Authoritative RAG sync is a production data mutation and must stay behind explicit approval.
- 3. Public proof growth assets: current 0/4; shortfall 4.
-    Local work: Draft privacy-safe proof assets from approved Discord knowledge only.
-    Boundary: Public proof drafts require explicit admin approval before publishing.
- 4. Premium workflow proof: current 0/1; shortfall 1.
-    Local work: Keep premium smoke coverage, premium readiness, and admin premium queue evidence current.
-    Boundary: A real or explicitly seeded premium review/office-hours fulfillment must be approved before it counts.

## Anti-Fake Rules

- Do not count local drafts, smoke rows, dry-run rows, raw captured messages, or generated templates as live proof.
- Do not claim 95-99+ until live proof lanes meet target and final scorecard evidence passes.
- Do not sync raw Discord text into authoritative RAG; sync only approved, anonymized, RAG-safe source material.
- Do not publish public proof assets without explicit admin approval and privacy review.
- Do not count premium role presence as premium workflow proof.
