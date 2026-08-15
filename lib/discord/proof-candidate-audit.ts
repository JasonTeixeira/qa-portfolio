import type { DiscordOperatingProofCycleResult } from './operating-proof-cycle';
import type { DiscordProofBacklogReport } from './proof-backlog';
import type { DiscordWeeklyProofPacket } from './weekly-proof-packet';

export type DiscordProofCandidateAuditLane = {
  key: string;
  title: string;
  status: 'passed' | 'blocked';
  currentCount: number;
  targetCount: number;
  remainingCount: number;
  candidateState: 'target_met' | 'needs_review' | 'needs_source_volume';
  candidateCount: number;
  sourceTables: string[];
  adminSurface: string;
  blockers: string[];
  nextReviewAction: string;
  provingCommand: string;
  requiredEvidenceFields: string[];
  criticalEvidenceFields: string[];
};

export type DiscordProofCandidateAudit = {
  ok: boolean;
  version: 'discord-proof-candidate-audit-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  releaseMeaning: string;
  status: 'passed' | 'blocked';
  metricsSnapshot: {
    approvedDiscordKnowledgeSources: number;
    ragDiscordSources: number;
    pendingKnowledgeCandidates: number;
    pendingPublicDrafts: number;
    publishedPublicDrafts: number;
    premiumMembers: number;
    premiumWorkflowProofs: number;
  };
  lanes: DiscordProofCandidateAuditLane[];
  failures: string[];
  nextActions: string[];
};

function numberValue(value: unknown): number {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function requiredFieldsForLane(packet: DiscordWeeklyProofPacket, key: string): string[] {
  const lane = packet.lanes.find((item) => item.key === key);
  if (!lane) return [];
  return lane.requiredFields
    .filter((field) => field.required)
    .map((field) => field.key);
}

function criticalEvidenceFieldsForLane(key: string): string[] {
  switch (key) {
    case 'gateway_capture':
      return ['worker_id', 'message_content_enabled', 'usable_message_id', 'capture_health'];
    case 'approved_discord_knowledge':
      return ['source_type', 'reuse_category', 'rag_safe'];
    case 'rag_discord_sources':
      return ['rag_source_key', 'chunk_count', 'eval_or_retrieval_proof'];
    case 'public_proof_assets':
      return ['asset_type', 'utm_campaign', 'publish_status', 'growth_tracking_status'];
    case 'premium_workflow_proof':
      return ['premium_path', 'authorization_evidence', 'sla_status', 'fulfillment_summary'];
    default:
      return [];
  }
}

function sourceVolumeForLane(input: {
  laneKey: string;
  operatingCycle: DiscordOperatingProofCycleResult;
  currentCount: number;
}): number {
  const metrics = input.operatingCycle.metricsAfter ?? input.operatingCycle.metricsBefore;
  switch (input.laneKey) {
    case 'gateway_capture':
      return input.currentCount;
    case 'approved_discord_knowledge':
      return numberValue(metrics.pendingKnowledgeCandidates) + input.currentCount;
    case 'rag_discord_sources':
      return numberValue(metrics.approvedDiscordKnowledgeSources);
    case 'public_proof_assets':
      return numberValue(metrics.approvedDiscordKnowledgeSources)
        + numberValue(metrics.pendingPublicDrafts)
        + numberValue(metrics.publishedPublicDrafts);
    case 'premium_workflow_proof':
      return numberValue(metrics.premiumWorkflowProofs);
    default:
      return input.currentCount;
  }
}

function blockersForLane(input: {
  laneKey: string;
  candidateCount: number;
  currentCount: number;
  targetCount: number;
  operatingCycle: DiscordOperatingProofCycleResult;
}): string[] {
  const metrics = input.operatingCycle.metricsAfter ?? input.operatingCycle.metricsBefore;
  const blockers: string[] = [];

  if (input.currentCount >= input.targetCount) return blockers;
  blockers.push(`Current proof is ${input.currentCount}/${input.targetCount}; lane remains blocked until the target is met.`);

  switch (input.laneKey) {
    case 'gateway_capture':
      blockers.push('Gateway capture must show a fresh heartbeat, Message Content Intent metadata, and one usable non-bot non-empty message.');
      break;
    case 'approved_discord_knowledge':
      if (input.candidateCount < input.targetCount) {
        blockers.push(`Approved knowledge plus pending candidates is ${input.candidateCount}/${input.targetCount}; more real member source material is needed.`);
      }
      if (numberValue(metrics.pendingKnowledgeCandidates) <= 0 && input.currentCount < input.targetCount) {
        blockers.push('No pending knowledge candidates are available for admin review.');
        blockers.push('Capture real member questions, helpful answers, builds, reviews, wins, or resources before approving knowledge.');
      }
      break;
    case 'rag_discord_sources':
      if (input.candidateCount < input.targetCount) {
        blockers.push(`Approved Discord knowledge available for RAG sync is ${input.candidateCount}/${input.targetCount}.`);
      }
      if (numberValue(metrics.approvedDiscordKnowledgeSources) <= 0) {
        blockers.push('No approved Discord knowledge exists to sync into authoritative RAG.');
      }
      if (!input.operatingCycle.ragSync?.ok || (
        input.currentCount < input.targetCount
        && numberValue(input.operatingCycle.ragSync?.stats?.sourcesUpserted) <= 0
      )) {
        blockers.push(input.operatingCycle.ragSync?.blocker ?? 'Latest RAG sync did not upsert approved Discord sources.');
      }
      break;
    case 'public_proof_assets':
      if (input.candidateCount < input.targetCount) {
        blockers.push(`Public proof source/draft volume is ${input.candidateCount}/${input.targetCount}.`);
      }
      if (numberValue(metrics.approvedDiscordKnowledgeSources) <= 0) {
        blockers.push('Public proof drafts require approved Discord source material first.');
      }
      if (input.operatingCycle.publicProof?.blocker) {
        blockers.push(input.operatingCycle.publicProof.blocker);
      }
      break;
    case 'premium_workflow_proof':
      if (input.currentCount < input.targetCount) {
        blockers.push('No answered/completed premium review or completed office-hours workflow is visible in current evidence.');
      }
      blockers.push('Premium proof must show authorization, request/SLA state, and fulfillment outcome together; membership or queued requests alone do not count.');
      break;
    default:
      if (input.candidateCount <= 0) blockers.push('No candidate evidence found.');
  }

  return [...new Set(blockers.filter(Boolean))];
}

function nextReviewActionForLane(input: {
  laneKey: string;
  currentCount: number;
  targetCount: number;
  candidateCount: number;
  fallbackAction: string;
}): string {
  if (input.currentCount >= input.targetCount) return 'Maintain proof quality and rerun scorecard after the next operating cycle.';
  if (input.candidateCount > input.currentCount) {
    switch (input.laneKey) {
      case 'gateway_capture':
        return 'Run gateway capture diagnosis and fix worker/intent/message capture before reviewing downstream proof lanes.';
      case 'approved_discord_knowledge':
        return 'Review pending knowledge candidates and approve only reusable, privacy-safe items.';
      case 'rag_discord_sources':
        return 'Run approved Discord RAG sync, then rerun retrieval/eval evidence.';
      case 'public_proof_assets':
        return 'Create or approve one privacy-safe public proof draft from approved Discord material.';
      case 'premium_workflow_proof':
        return 'Fulfill one premium review, deeper answer, or office-hours request with SLA evidence.';
      default:
        return input.fallbackAction;
    }
  }
  return input.fallbackAction;
}

export function buildDiscordProofCandidateAudit(input: {
  generatedAt: string;
  operatingCycle: DiscordOperatingProofCycleResult;
  backlog: DiscordProofBacklogReport;
  weeklyPacket: DiscordWeeklyProofPacket;
}): DiscordProofCandidateAudit {
  const metrics = input.operatingCycle.metricsAfter ?? input.operatingCycle.metricsBefore;
  const failures: string[] = [];

  const lanes = input.backlog.lanes.map((lane) => {
    const remainingCount = Math.max(0, lane.targetCount - lane.currentCount);
    const candidateCount = sourceVolumeForLane({
      laneKey: lane.key,
      operatingCycle: input.operatingCycle,
      currentCount: lane.currentCount,
    });
    const blockers = blockersForLane({
      laneKey: lane.key,
      candidateCount,
      currentCount: lane.currentCount,
      targetCount: lane.targetCount,
      operatingCycle: input.operatingCycle,
    });
    const candidateState = lane.currentCount >= lane.targetCount
      ? 'target_met'
      : candidateCount > lane.currentCount
        ? 'needs_review'
        : 'needs_source_volume';

    const requiredEvidenceFields = requiredFieldsForLane(input.weeklyPacket, lane.key);
    const criticalEvidenceFields = criticalEvidenceFieldsForLane(lane.key);

    return {
      key: lane.key,
      title: lane.title,
      status: lane.status,
      currentCount: lane.currentCount,
      targetCount: lane.targetCount,
      remainingCount,
      candidateState,
      candidateCount,
      sourceTables: lane.sourceTables,
      adminSurface: lane.adminSurface,
      blockers,
      nextReviewAction: nextReviewActionForLane({
        laneKey: lane.key,
        currentCount: lane.currentCount,
        targetCount: lane.targetCount,
        candidateCount,
        fallbackAction: lane.liveActionRequired,
      }),
      provingCommand: lane.verificationCommand,
      requiredEvidenceFields,
      criticalEvidenceFields,
    } satisfies DiscordProofCandidateAuditLane;
  });

  if (lanes.length !== 5) failures.push('wrong_lane_count');
  if (input.weeklyPacket.mutationMode !== 'local_file_evidence_only') failures.push('weekly_packet_not_local_only');
  if (!lanes.every((lane) => lane.requiredEvidenceFields.includes('privacy_status'))) failures.push('missing_privacy_status_field');
  if (!lanes.every((lane) => lane.requiredEvidenceFields.includes('decision_reason'))) failures.push('missing_decision_reason_field');
  for (const lane of lanes) {
    for (const field of lane.criticalEvidenceFields) {
      if (!lane.requiredEvidenceFields.includes(field)) failures.push(`${lane.key}:missing_critical_${field}`);
    }
  }
  if (!lanes.every((lane) => lane.nextReviewAction.length > 20)) failures.push('thin_next_review_action');
  if (!lanes.every((lane) => lane.provingCommand.length > 0)) failures.push('missing_proving_command');

  return {
    ok: failures.length === 0,
    version: 'discord-proof-candidate-audit-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'Candidate audit reads current evidence and explains what can be reviewed next. It does not create, approve, sync, publish, or satisfy operating proof.',
    status: lanes.every((lane) => lane.status === 'passed') ? 'passed' : 'blocked',
    metricsSnapshot: {
      approvedDiscordKnowledgeSources: numberValue(metrics.approvedDiscordKnowledgeSources),
      ragDiscordSources: numberValue(metrics.ragDiscordSources),
      pendingKnowledgeCandidates: numberValue(metrics.pendingKnowledgeCandidates),
      pendingPublicDrafts: numberValue(metrics.pendingPublicDrafts),
      publishedPublicDrafts: numberValue(metrics.publishedPublicDrafts),
      premiumMembers: numberValue(metrics.premiumMembers),
      premiumWorkflowProofs: numberValue(metrics.premiumWorkflowProofs),
    },
    lanes,
    failures,
    nextActions: lanes
      .filter((lane) => lane.status === 'blocked')
      .map((lane) => lane.nextReviewAction),
  };
}

export function validateDiscordProofCandidateAudit(audit: DiscordProofCandidateAudit): {
  ok: boolean;
  failures: string[];
} {
  const failures = [...audit.failures];
  if (audit.version !== 'discord-proof-candidate-audit-v1') failures.push('wrong_version');
  if (audit.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (!audit.releaseMeaning.includes('does not create, approve, sync, publish, or satisfy operating proof')) {
    failures.push('missing_non_mutation_disclaimer');
  }
  if (audit.lanes.length !== 5) failures.push('wrong_lane_count');
  if (!audit.lanes.every((lane) => lane.remainingCount === Math.max(0, lane.targetCount - lane.currentCount))) {
    failures.push('remaining_count_mismatch');
  }
  if (!audit.lanes.every((lane) => ['target_met', 'needs_review', 'needs_source_volume'].includes(lane.candidateState))) {
    failures.push('invalid_candidate_state');
  }
  if (!audit.lanes.every((lane) => lane.requiredEvidenceFields.includes('privacy_status'))) {
    failures.push('missing_privacy_status_field');
  }
  if (!audit.lanes.every((lane) => lane.requiredEvidenceFields.includes('decision_reason'))) {
    failures.push('missing_decision_reason_field');
  }
  for (const lane of audit.lanes) {
    if (lane.criticalEvidenceFields.length < 3) failures.push(`${lane.key}:critical_fields_too_thin`);
    for (const field of lane.criticalEvidenceFields) {
      if (!lane.requiredEvidenceFields.includes(field)) failures.push(`${lane.key}:missing_critical_${field}`);
    }
  }
  return {
    ok: audit.ok === true && failures.length === 0,
    failures,
  };
}

export function renderDiscordProofCandidateAuditMarkdown(audit: DiscordProofCandidateAudit): string {
  return [
    '# Sage Ideas Discord Proof Candidate Audit',
    '',
    `Generated: ${audit.generatedAt}`,
    `Mutation mode: ${audit.mutationMode}`,
    `Status: ${audit.status}`,
    `Audit OK: ${audit.ok ? 'yes' : 'no'}`,
    '',
    '## Release Meaning',
    '',
    audit.releaseMeaning,
    '',
    '## Metrics Snapshot',
    '',
    ...Object.entries(audit.metricsSnapshot).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Candidate Lanes',
    '',
    ...audit.lanes.flatMap((lane) => [
      `### ${lane.title}`,
      '',
      `- Key: ${lane.key}`,
      `- Status: ${lane.status}`,
      `- Candidate state: ${lane.candidateState}`,
      `- Current: ${lane.currentCount}/${lane.targetCount}`,
      `- Candidate count: ${lane.candidateCount}`,
      `- Remaining: ${lane.remainingCount}`,
      `- Admin surface: ${lane.adminSurface}`,
      `- Proving command: ${lane.provingCommand}`,
      `- Required fields: ${lane.requiredEvidenceFields.join(', ')}`,
      `- Critical lane fields: ${lane.criticalEvidenceFields.join(', ')}`,
      '',
      'Blockers:',
      ...(lane.blockers.length ? lane.blockers.map((blocker) => `- ${blocker}`) : ['- None from local evidence.']),
      '',
      `Next review action: ${lane.nextReviewAction}`,
      '',
    ]),
    '## Next Actions',
    '',
    ...(audit.nextActions.length ? audit.nextActions.map((action) => `- ${action}`) : ['None.']),
    '',
    '## Validation Failures',
    '',
    ...(audit.failures.length ? audit.failures.map((failure) => `- ${failure}`) : ['None.']),
    '',
  ].join('\n');
}
