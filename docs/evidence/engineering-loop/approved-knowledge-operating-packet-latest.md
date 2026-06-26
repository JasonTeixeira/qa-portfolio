# Approved Discord Knowledge Operating Packet

Generated: 2026-06-26T18:48:22.258Z
Status: ready_for_collection
Mutation mode: local_file_evidence_only

This approved-knowledge packet defines the weekly review contract for the next proof lane. It does not approve records, sync RAG, publish content, call AI models, mutate Supabase, or satisfy operating proof.

## Target

- Current: 0/10
- Remaining: 10
- Reviewable candidates: 0
- Source volume state: no_source_volume
- Admin surface: /admin/discord -> RAG knowledge approval desk, Content Queue, Drafts, Questions, Challenges

## Required Fields

- proof_cycle_key: Weekly operating cycle key, for example 2026-W26.
- source_table: Source table such as discord_questions, discord_answers, discord_content_queue, or discord_content_drafts.
- source_record_id: Stable source id that lets an admin reopen the exact candidate.
- source_url_or_path: Discord link, admin URL, or evidence path for inspection.
- source_created_at: Original timestamp proving the source came from the current operating window or reviewed backlog.
- source_type: question, answer, review, build, resource, win, or draft.
- title: Short reusable title for future RAG citations, lessons, or resources.
- summary: Two to four sentence summary of the teaching value.
- member_context_redacted: Boolean or note confirming names, credentials, private business details, and screenshots were removed or permissioned.
- reuse_category: FAQ, lesson, checklist, challenge, resource, prompt, or content seed.
- quality_score: Operator score from 0-100 using the packet rubric.
- rag_safe: Boolean confirmation that the approved version can be cited later without leaking private context.
- reviewer: Admin/operator approving or rejecting the source.
- reviewed_at: ISO timestamp for the approval or rejection decision.
- decision_reason: Specific reason the item qualifies or fails the lane.
- privacy_status: public, anonymized, permissioned, private_blocked, or rejected.
- evidence_artifact_path: Evidence JSON, screenshot, dashboard URL, or audit artifact supporting the claim.
- operator_attestation: Plain-language statement of what was verified and what was not verified.

## Weekly Slots

- Slot 1: question, minimum quality 80
- Slot 2: answer, minimum quality 80
- Slot 3: review, minimum quality 80
- Slot 4: build, minimum quality 80
- Slot 5: resource, minimum quality 80
- Slot 6: win, minimum quality 80
- Slot 7: question, minimum quality 80
- Slot 8: answer, minimum quality 80
- Slot 9: review, minimum quality 80
- Slot 10: draft, minimum quality 80

## Scoring Rubric

Pass score: 80/100
- specific_problem_or_artifact (20): The source includes a concrete problem, artifact, build, decision, blocker, or review target.
- reusable_teaching_value (20): The source can become a FAQ, checklist, lesson, challenge, resource, or future RAG answer.
- context_completeness (15): The approved version has enough context to cite without asking the original member for missing details.
- privacy_and_permission (20): The source is public, anonymized, or permissioned and contains no credentials or private business/member data.
- operator_decision_quality (15): Reviewer, timestamp, privacy status, decision reason, and evidence artifact are present.
- downstream_fit (10): The source has a clear downstream path into RAG, daily content, quiz/challenge, resource, or public proof.

## Approval Workflow

- Open /admin/discord and review captured questions, answers, content queue items, drafts, builds, wins, and resources.
- Reject low-context, private, moderation-sensitive, synthetic, or unsupported candidates immediately.
- For each candidate worth keeping, fill every required field in this packet before approving it as durable knowledge.
- Use the anonymized/approved text as the future RAG/content source; do not reuse raw private Discord text.
- Stop at 10 approved items for the weekly lane, then run source scan and operating-cycle dry-run evidence.

## Acceptance Checklist

- Source has a specific problem, answer, artifact, review, decision, build, win, or resource.
- Source can teach a future member without relying on private context.
- Source has explicit downstream fit: RAG, FAQ, lesson, checklist, challenge, resource, content, or public proof.
- Quality score is at least 80/100 using the packet rubric.
- Privacy status is public, anonymized, or permissioned.
- Reviewer, reviewed_at, decision_reason, source id, and evidence artifact are present.
- The approved version is RAG-safe and excludes credentials, private business context, and member-identifying details.

## Reject If

- Raw captured message without admin review.
- Synthetic smoke row, dry-run draft, or deleted cleanup row.
- Greeting, introduction, generic praise, or low-context comment.
- Private, identifying, credential-like, moderation-sensitive, or off-topic content.
- Unsupported claim that would require external verification before reuse.
- AI-generated draft with no approved source material behind it.

## Privacy Checklist

- Default to anonymized member references.
- Remove names, emails, handles, screenshots, credentials, client names, payment details, and private business context.
- Use permissioned status only when explicit approval exists and the evidence path records it.
- Keep private/member-sensitive premium or DM material out of public proof unless separately permissioned.
- If privacy is uncertain, mark private_blocked or rejected and do not sync to RAG.

## Downstream Workflow

- After 10 approved knowledge items exist, run npm run discord:proof-source-scan.
- Run npm run discord:operating-cycle:dry-run to verify approvedDiscordKnowledge reaches 10/10.
- With explicit approval for Supabase/RAG mutations, sync approved Discord candidates into authoritative RAG.
- With explicit approval for non-dry RAG eval, run the guarded eval command and final scorecard.
- Use only approved knowledge sources when creating public proof assets or weekly content claims.

## Verification Commands

- `npm run discord:approved-knowledge-packet`
- `npm run discord:proof-source-scan`
- `npm run discord:proof-source-recovery-plan`
- `npm run discord:operating-cycle:dry-run`
- `SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing`

## Anti-Fake Rules

- This packet is not operating proof; it is the review contract for collecting operating proof.
- Do not count raw discord_messages rows, smoke rows, deleted rows, dry-run drafts, or generated templates.
- Do not count approved knowledge unless every required field, privacy status, decision reason, and evidence artifact is present.
- Do not sync Discord-derived RAG from raw or private text; sync only the approved/anonymized version.
- Do not claim 95+ content/RAG/growth posture until approved knowledge is synced, evaluated, and used in public proof cycles.

## Next Actions

- Approve 10 more high-signal Discord knowledge items with this packet.
- Create source volume by asking members useful questions, reviewing builds, and capturing helpful answers/resources.
- Reject low-context, private, generic, or synthetic candidates instead of trying to fill the target with weak proof.
- Rerun npm run discord:proof-source-scan after approvals.
