import type { DiscordProofSourceRecoveryPlan, DiscordProofSourceVolumeScanEvidence } from './proof-source-recovery-plan';

export type ApprovedKnowledgePacketField = {
  key: string;
  label: string;
  required: boolean;
  description: string;
};

export type ApprovedKnowledgePacketSlot = {
  slot: number;
  targetSourceType: 'question' | 'answer' | 'review' | 'build' | 'resource' | 'win' | 'draft';
  minimumQualityScore: number;
  requiredEvidence: string[];
  rejectIf: string[];
};

export type ApprovedKnowledgeScoringRubric = {
  maxScore: number;
  passScore: number;
  dimensions: Array<{
    key: string;
    points: number;
    passSignal: string;
    failSignal: string;
  }>;
};

export type ApprovedKnowledgeOperatingPacket = {
  ok: boolean;
  version: 'approved-knowledge-operating-packet-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  releaseMeaning: string;
  status: 'ready_for_collection' | 'needs_source_scan' | 'target_met';
  target: {
    current: number;
    target: number;
    remaining: number;
    reviewableCandidates: number;
    sourceVolumeState: string;
  };
  sourceTables: string[];
  adminSurface: string;
  fields: ApprovedKnowledgePacketField[];
  weeklySlots: ApprovedKnowledgePacketSlot[];
  scoringRubric: ApprovedKnowledgeScoringRubric;
  approvalWorkflow: string[];
  acceptanceChecklist: string[];
  rejectionChecklist: string[];
  privacyChecklist: string[];
  downstreamWorkflow: string[];
  verificationCommands: string[];
  antiFakeRules: string[];
  nextActions: string[];
  failures: string[];
};

function field(key: string, label: string, description: string, required = true): ApprovedKnowledgePacketField {
  return { key, label, description, required };
}

const REQUIRED_FIELDS = [
  field('proof_cycle_key', 'Proof cycle key', 'Weekly operating cycle key, for example 2026-W26.'),
  field('source_table', 'Source table', 'Source table such as discord_questions, discord_answers, discord_content_queue, or discord_content_drafts.'),
  field('source_record_id', 'Source record id', 'Stable source id that lets an admin reopen the exact candidate.'),
  field('source_url_or_path', 'Source URL or path', 'Discord link, admin URL, or evidence path for inspection.'),
  field('source_created_at', 'Source created at', 'Original timestamp proving the source came from the current operating window or reviewed backlog.'),
  field('source_type', 'Source type', 'question, answer, review, build, resource, win, or draft.'),
  field('title', 'Reusable title', 'Short reusable title for future RAG citations, lessons, or resources.'),
  field('summary', 'Reusable summary', 'Two to four sentence summary of the teaching value.'),
  field('member_context_redacted', 'Member context redacted', 'Boolean or note confirming names, credentials, private business details, and screenshots were removed or permissioned.'),
  field('reuse_category', 'Reuse category', 'FAQ, lesson, checklist, challenge, resource, prompt, or content seed.'),
  field('quality_score', 'Quality score', 'Operator score from 0-100 using the packet rubric.'),
  field('rag_safe', 'RAG safe', 'Boolean confirmation that the approved version can be cited later without leaking private context.'),
  field('reviewer', 'Reviewer', 'Admin/operator approving or rejecting the source.'),
  field('reviewed_at', 'Reviewed at', 'ISO timestamp for the approval or rejection decision.'),
  field('decision_reason', 'Decision reason', 'Specific reason the item qualifies or fails the lane.'),
  field('privacy_status', 'Privacy status', 'public, anonymized, permissioned, private_blocked, or rejected.'),
  field('evidence_artifact_path', 'Evidence artifact path', 'Evidence JSON, screenshot, dashboard URL, or audit artifact supporting the claim.'),
  field('operator_attestation', 'Operator attestation', 'Plain-language statement of what was verified and what was not verified.'),
];

const SLOT_TYPES: ApprovedKnowledgePacketSlot['targetSourceType'][] = [
  'question',
  'answer',
  'review',
  'build',
  'resource',
  'win',
  'question',
  'answer',
  'review',
  'draft',
];

export function buildApprovedKnowledgeOperatingPacket(input: {
  generatedAt: string;
  scan: DiscordProofSourceVolumeScanEvidence;
  recoveryPlan: DiscordProofSourceRecoveryPlan;
}): ApprovedKnowledgeOperatingPacket {
  const lane = input.scan.laneReadiness?.approvedDiscordKnowledge;
  const recoveryLane = input.recoveryPlan.lanes.find((item) => item.key === 'approvedDiscordKnowledge');
  const current = Number(lane?.current ?? recoveryLane?.current ?? 0);
  const target = Number(lane?.target ?? recoveryLane?.target ?? 10);
  const remaining = Math.max(0, target - current);
  const reviewableCandidates = Number(lane?.reviewableCandidates ?? 0);
  const status = remaining === 0 ? 'target_met' : lane ? 'ready_for_collection' : 'needs_source_scan';
  const weeklySlots = SLOT_TYPES.map((targetSourceType, index) => ({
    slot: index + 1,
    targetSourceType,
    minimumQualityScore: 80,
    requiredEvidence: [
      'source_record_id',
      'source_created_at',
      'source_url_or_path',
      'decision_reason',
      'privacy_status',
      'operator_attestation',
    ],
    rejectIf: [
      'raw_unapproved_message',
      'private_or_identifying_context_without_permission',
      'generic_low_context_or_praise_only',
      'synthetic_smoke_or_dry_run_row',
    ],
  }));

  const packet: ApprovedKnowledgeOperatingPacket = {
    ok: true,
    version: 'approved-knowledge-operating-packet-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This approved-knowledge packet defines the weekly review contract for the next proof lane. It does not approve records, sync RAG, publish content, call AI models, mutate Supabase, or satisfy operating proof.',
    status,
    target: {
      current,
      target,
      remaining,
      reviewableCandidates,
      sourceVolumeState: recoveryLane?.sourceVolumeState ?? (reviewableCandidates > 0 ? 'needs_review' : 'no_source_volume'),
    },
    sourceTables: ['discord_questions', 'discord_answers', 'discord_content_queue', 'discord_content_drafts', 'discord_challenge_submissions'],
    adminSurface: '/admin/discord -> RAG knowledge approval desk, Content Queue, Drafts, Questions, Challenges',
    fields: REQUIRED_FIELDS,
    weeklySlots,
    scoringRubric: {
      maxScore: 100,
      passScore: 80,
      dimensions: [
        {
          key: 'specific_problem_or_artifact',
          points: 20,
          passSignal: 'The source includes a concrete problem, artifact, build, decision, blocker, or review target.',
          failSignal: 'The source is generic, social, vague, or has no reusable teaching surface.',
        },
        {
          key: 'reusable_teaching_value',
          points: 20,
          passSignal: 'The source can become a FAQ, checklist, lesson, challenge, resource, or future RAG answer.',
          failSignal: 'The source only makes sense in the original thread and cannot teach a future member.',
        },
        {
          key: 'context_completeness',
          points: 15,
          passSignal: 'The approved version has enough context to cite without asking the original member for missing details.',
          failSignal: 'The source depends on missing files, screenshots, private context, or unexplained shorthand.',
        },
        {
          key: 'privacy_and_permission',
          points: 20,
          passSignal: 'The source is public, anonymized, or permissioned and contains no credentials or private business/member data.',
          failSignal: 'The source includes identifying, private, sensitive, or moderation-heavy material.',
        },
        {
          key: 'operator_decision_quality',
          points: 15,
          passSignal: 'Reviewer, timestamp, privacy status, decision reason, and evidence artifact are present.',
          failSignal: 'Approval reason is missing, generic, or cannot be reproduced from source evidence.',
        },
        {
          key: 'downstream_fit',
          points: 10,
          passSignal: 'The source has a clear downstream path into RAG, daily content, quiz/challenge, resource, or public proof.',
          failSignal: 'No downstream use is defined, so the source would become dormant inventory.',
        },
      ],
    },
    approvalWorkflow: [
      'Open /admin/discord and review captured questions, answers, content queue items, drafts, builds, wins, and resources.',
      'Reject low-context, private, moderation-sensitive, synthetic, or unsupported candidates immediately.',
      'For each candidate worth keeping, fill every required field in this packet before approving it as durable knowledge.',
      'Use the anonymized/approved text as the future RAG/content source; do not reuse raw private Discord text.',
      'Stop at 10 approved items for the weekly lane, then run source scan and operating-cycle dry-run evidence.',
    ],
    acceptanceChecklist: [
      'Source has a specific problem, answer, artifact, review, decision, build, win, or resource.',
      'Source can teach a future member without relying on private context.',
      'Source has explicit downstream fit: RAG, FAQ, lesson, checklist, challenge, resource, content, or public proof.',
      'Quality score is at least 80/100 using the packet rubric.',
      'Privacy status is public, anonymized, or permissioned.',
      'Reviewer, reviewed_at, decision_reason, source id, and evidence artifact are present.',
      'The approved version is RAG-safe and excludes credentials, private business context, and member-identifying details.',
    ],
    rejectionChecklist: [
      'Raw captured message without admin review.',
      'Synthetic smoke row, dry-run draft, or deleted cleanup row.',
      'Greeting, introduction, generic praise, or low-context comment.',
      'Private, identifying, credential-like, moderation-sensitive, or off-topic content.',
      'Unsupported claim that would require external verification before reuse.',
      'AI-generated draft with no approved source material behind it.',
    ],
    privacyChecklist: [
      'Default to anonymized member references.',
      'Remove names, emails, handles, screenshots, credentials, client names, payment details, and private business context.',
      'Use permissioned status only when explicit approval exists and the evidence path records it.',
      'Keep private/member-sensitive premium or DM material out of public proof unless separately permissioned.',
      'If privacy is uncertain, mark private_blocked or rejected and do not sync to RAG.',
    ],
    downstreamWorkflow: [
      'After 10 approved knowledge items exist, run npm run discord:proof-source-scan.',
      'Run npm run discord:operating-cycle:dry-run to verify approvedDiscordKnowledge reaches 10/10.',
      'With explicit approval for Supabase/RAG mutations, sync approved Discord candidates into authoritative RAG.',
      'With explicit approval for non-dry RAG eval, run the guarded eval command and final scorecard.',
      'Use only approved knowledge sources when creating public proof assets or weekly content claims.',
    ],
    verificationCommands: [
      'npm run discord:approved-knowledge-packet',
      'npm run discord:proof-source-scan',
      'npm run discord:proof-source-recovery-plan',
      'npm run discord:operating-cycle:dry-run',
      'SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing',
    ],
    antiFakeRules: [
      'This packet is not operating proof; it is the review contract for collecting operating proof.',
      'Do not count raw discord_messages rows, smoke rows, deleted rows, dry-run drafts, or generated templates.',
      'Do not count approved knowledge unless every required field, privacy status, decision reason, and evidence artifact is present.',
      'Do not sync Discord-derived RAG from raw or private text; sync only the approved/anonymized version.',
      'Do not claim 95+ content/RAG/growth posture until approved knowledge is synced, evaluated, and used in public proof cycles.',
    ],
    nextActions: remaining === 0
      ? [
        'Run npm run discord:proof-source-scan to refresh source-volume evidence.',
        'Run npm run discord:operating-cycle:dry-run to confirm the lane remains 10/10.',
        'Request explicit approval before syncing approved Discord knowledge into RAG or running non-dry RAG eval.',
      ]
      : [
        `Approve ${remaining} more high-signal Discord knowledge item${remaining === 1 ? '' : 's'} with this packet.`,
        reviewableCandidates > 0
          ? `Review ${reviewableCandidates} candidate${reviewableCandidates === 1 ? '' : 's'} already visible in source-volume evidence.`
          : 'Create source volume by asking members useful questions, reviewing builds, and capturing helpful answers/resources.',
        'Reject low-context, private, generic, or synthetic candidates instead of trying to fill the target with weak proof.',
        'Rerun npm run discord:proof-source-scan after approvals.',
      ],
    failures: [],
  };

  const validation = validateApprovedKnowledgeOperatingPacket(packet);
  return {
    ...packet,
    ok: validation.ok,
    failures: validation.failures,
  };
}

export function validateApprovedKnowledgeOperatingPacket(packet: ApprovedKnowledgeOperatingPacket) {
  const failures: string[] = [];
  if (packet.version !== 'approved-knowledge-operating-packet-v1') failures.push('wrong_version');
  if (packet.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (!packet.releaseMeaning.includes('does not approve records')) failures.push('missing_non_mutation_disclaimer');
  if (packet.target.target < 10) failures.push('target_too_low');
  if (packet.target.remaining !== Math.max(0, packet.target.target - packet.target.current)) failures.push('remaining_mismatch');
  if (packet.fields.filter((item) => item.required).length < 15) failures.push('insufficient_required_fields');
  for (const required of ['source_record_id', 'decision_reason', 'privacy_status', 'operator_attestation', 'rag_safe']) {
    if (!packet.fields.some((item) => item.key === required && item.required)) failures.push(`missing_required_field:${required}`);
  }
  if (packet.weeklySlots.length !== packet.target.target) failures.push('weekly_slot_count_mismatch');
  if (packet.weeklySlots.some((slot) => slot.minimumQualityScore < packet.scoringRubric.passScore)) failures.push('slot_quality_below_rubric');
  if (packet.scoringRubric.maxScore !== 100 || packet.scoringRubric.passScore < 80) failures.push('weak_scoring_rubric');
  if (packet.scoringRubric.dimensions.reduce((sum, item) => sum + item.points, 0) !== packet.scoringRubric.maxScore) failures.push('rubric_points_mismatch');
  if (packet.acceptanceChecklist.length < 6) failures.push('acceptance_checklist_too_thin');
  if (packet.rejectionChecklist.length < 5) failures.push('rejection_checklist_too_thin');
  if (packet.privacyChecklist.length < 5) failures.push('privacy_checklist_too_thin');
  if (packet.downstreamWorkflow.length < 5) failures.push('downstream_workflow_too_thin');
  if (!packet.verificationCommands.every(ragEvalCommandIsGuarded)) failures.push('unguarded_rag_eval_command');
  if (!packet.antiFakeRules.some((rule) => rule.includes('not operating proof'))) failures.push('missing_not_proof_rule');
  if (!packet.antiFakeRules.some((rule) => rule.includes('raw discord_messages'))) failures.push('missing_raw_message_rule');
  if (!packet.antiFakeRules.some((rule) => rule.includes('required field'))) failures.push('missing_required_field_rule');
  return {
    ok: failures.length === 0,
    failures,
  };
}

export function renderApprovedKnowledgeOperatingPacketMarkdown(packet: ApprovedKnowledgeOperatingPacket): string {
  return [
    '# Approved Discord Knowledge Operating Packet',
    '',
    `Generated: ${packet.generatedAt}`,
    `Status: ${packet.status}`,
    `Mutation mode: ${packet.mutationMode}`,
    '',
    packet.releaseMeaning,
    '',
    '## Target',
    '',
    `- Current: ${packet.target.current}/${packet.target.target}`,
    `- Remaining: ${packet.target.remaining}`,
    `- Reviewable candidates: ${packet.target.reviewableCandidates}`,
    `- Source volume state: ${packet.target.sourceVolumeState}`,
    `- Admin surface: ${packet.adminSurface}`,
    '',
    '## Required Fields',
    '',
    ...packet.fields.filter((item) => item.required).map((item) => `- ${item.key}: ${item.description}`),
    '',
    '## Weekly Slots',
    '',
    ...packet.weeklySlots.map((slot) => `- Slot ${slot.slot}: ${slot.targetSourceType}, minimum quality ${slot.minimumQualityScore}`),
    '',
    '## Scoring Rubric',
    '',
    `Pass score: ${packet.scoringRubric.passScore}/${packet.scoringRubric.maxScore}`,
    ...packet.scoringRubric.dimensions.map((item) => `- ${item.key} (${item.points}): ${item.passSignal}`),
    '',
    '## Approval Workflow',
    '',
    ...packet.approvalWorkflow.map((item) => `- ${item}`),
    '',
    '## Acceptance Checklist',
    '',
    ...packet.acceptanceChecklist.map((item) => `- ${item}`),
    '',
    '## Reject If',
    '',
    ...packet.rejectionChecklist.map((item) => `- ${item}`),
    '',
    '## Privacy Checklist',
    '',
    ...packet.privacyChecklist.map((item) => `- ${item}`),
    '',
    '## Downstream Workflow',
    '',
    ...packet.downstreamWorkflow.map((item) => `- ${item}`),
    '',
    '## Verification Commands',
    '',
    ...packet.verificationCommands.map((item) => `- \`${item}\``),
    '',
    '## Anti-Fake Rules',
    '',
    ...packet.antiFakeRules.map((item) => `- ${item}`),
    '',
    '## Next Actions',
    '',
    ...packet.nextActions.map((item) => `- ${item}`),
    '',
  ].join('\n');
}

function ragEvalCommandIsGuarded(command: string): boolean {
  return !command.includes('npm run rag:evaluate')
    || command.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved')
    || command.includes('--dry-run')
    || command.includes(':seed-dry-run')
    || command.includes(':missing-plan')
    || command.includes(':coverage-readiness')
    || command.includes(':execution-packet')
    || command.includes(':missing-preflight')
    || command.includes(':recovery-plan');
}
