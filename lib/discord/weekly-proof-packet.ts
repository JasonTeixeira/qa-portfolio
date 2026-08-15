import type { DiscordProofBacklogReport } from './proof-backlog';
import type { DiscordProofIntakeReadinessReport } from './proof-intake-readiness';

export type DiscordWeeklyProofPacketLane = {
  key: string;
  title: string;
  status: 'passed' | 'blocked';
  currentCount: number;
  targetCount: number;
  remainingCount: number;
  adminSurface: string;
  sourceTables: string[];
  requiredFields: Array<{ key: string; label: string; description: string; required: boolean }>;
  acceptanceChecks: string[];
  rejectionChecks: string[];
  privacyChecks: string[];
  qualityGates: string[];
  nonProofExamples: string[];
  verificationCommands: string[];
  evidencePaths: string[];
  intakeTemplate: Record<string, string>;
};

export type DiscordWeeklyProofExecutionStep = {
  priority: number;
  laneKey: string;
  laneTitle: string;
  status: 'passed' | 'blocked';
  dependency: string | null;
  operatorAction: string;
  adminSurface: string;
  verificationCommand: string;
  requiredEvidenceFields: string[];
  exitCriteria: string[];
  doNotCount: string[];
};

export type DiscordWeeklyProofPacket = {
  ok: boolean;
  version: 'discord-weekly-proof-packet-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  releaseMeaning: string;
  backlogStatus: 'passed' | 'blocked';
  lanes: DiscordWeeklyProofPacketLane[];
  executionPlan: DiscordWeeklyProofExecutionStep[];
  weeklyIntakeOrder: string[];
  nextActions: string[];
  failures: string[];
};

function templateValue(fieldKey: string): string {
  if (fieldKey === 'reviewed_at') return '<ISO timestamp>';
  if (fieldKey === 'source_created_at') return '<ISO timestamp>';
  if (fieldKey === 'privacy_status') return '<public | anonymized | permissioned | private_blocked | rejected>';
  if (fieldKey === 'proof_cycle_key') return '<YYYY-W##>';
  if (fieldKey === 'rag_safe') return '<true | false>';
  if (fieldKey === 'chunk_count') return '<number>';
  if (fieldKey === 'operator_attestation') return '<what was verified and what remains unverified>';
  return `<${fieldKey}>`;
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

function executionDependency(laneKey: string): string | null {
  switch (laneKey) {
    case 'gateway_capture':
      return null;
    case 'approved_discord_knowledge':
      return 'gateway_capture';
    case 'rag_discord_sources':
      return 'approved_discord_knowledge';
    case 'public_proof_assets':
      return 'approved_discord_knowledge';
    case 'premium_workflow_proof':
      return 'premium_member_or_seeded_premium_scenario';
    default:
      return null;
  }
}

function operatorActionForLane(lane: DiscordWeeklyProofPacketLane): string {
  if (lane.status === 'passed') return `Maintain ${lane.title} evidence and rerun the scorecard after the next operating cycle.`;
  switch (lane.key) {
    case 'gateway_capture':
      return 'Post or request one fresh non-bot member message, then confirm gateway capture stores non-empty content.';
    case 'approved_discord_knowledge':
      return 'Review captured questions, answers, builds, reviews, wins, and resources; approve only reusable privacy-safe knowledge.';
    case 'rag_discord_sources':
      return 'After approved knowledge exists, run the approved Discord RAG sync and verify chunks/retrieval evidence.';
    case 'public_proof_assets':
      return 'Create one privacy-safe public proof draft from approved Discord knowledge and keep it approval-gated until review.';
    case 'premium_workflow_proof':
      return 'Fulfill one real or explicitly seeded premium review, deeper answer, or office-hours workflow with SLA and authorization evidence.';
    default:
      return `Collect evidence for ${lane.title}.`;
  }
}

function exitCriteriaForLane(lane: DiscordWeeklyProofPacketLane): string[] {
  const shared = [
    `Target reaches ${lane.targetCount}/${lane.targetCount}.`,
    'Reviewer, timestamp, evidence artifact path, decision reason, and operator attestation are present.',
  ];
  switch (lane.key) {
    case 'gateway_capture':
      return [
        ...shared,
        'Fresh heartbeat and Message Content Intent evidence are present.',
        'At least one non-bot non-empty non-deleted message is visible in capture evidence.',
      ];
    case 'approved_discord_knowledge':
      return [
        ...shared,
        'Approved items are specific, reusable, and privacy-safe.',
        'Rejected or low-context items are excluded from the count.',
      ];
    case 'rag_discord_sources':
      return [
        ...shared,
        'Every RAG source traces back to an approved Discord knowledge item.',
        'Retrieval or eval evidence proves the synced source can be cited.',
      ];
    case 'public_proof_assets':
      return [
        ...shared,
        'Each public asset traces to approved Discord source material.',
        'UTM or growth tracking status is recorded before counting conversion proof.',
      ];
    case 'premium_workflow_proof':
      return [
        ...shared,
        'Authorization, request/SLA state, and fulfilled outcome are present together.',
        'Role membership alone is not counted as workflow fulfillment.',
      ];
    default:
      return shared;
  }
}

function buildExecutionPlan(lanes: DiscordWeeklyProofPacketLane[]): DiscordWeeklyProofExecutionStep[] {
  return lanes
    .map((lane, index) => ({
      priority: lane.status === 'blocked' ? index + 1 : index + 100,
      laneKey: lane.key,
      laneTitle: lane.title,
      status: lane.status,
      dependency: executionDependency(lane.key),
      operatorAction: operatorActionForLane(lane),
      adminSurface: lane.adminSurface,
      verificationCommand: lane.verificationCommands[0] ?? '',
      requiredEvidenceFields: Object.keys(lane.intakeTemplate),
      exitCriteria: exitCriteriaForLane(lane),
      doNotCount: lane.nonProofExamples.slice(0, 5),
    }))
    .sort((a, b) => a.priority - b.priority);
}

export function buildDiscordWeeklyProofPacket(input: {
  generatedAt: string;
  backlog: DiscordProofBacklogReport;
  intake: DiscordProofIntakeReadinessReport;
}): DiscordWeeklyProofPacket {
  const failures: string[] = [];
  const lanes = input.backlog.lanes.map((backlogLane) => {
    const intakeLane = input.intake.lanes.find((lane) => lane.key === backlogLane.key);
    if (!intakeLane) {
      failures.push(`${backlogLane.key}:missing_intake_lane`);
    }

    const requiredFields = intakeLane?.requiredFields ?? [];
    const intakeTemplate = Object.fromEntries(
      requiredFields
        .filter((field) => field.required)
        .map((field) => [field.key, templateValue(field.key)]),
    );

    return {
      key: backlogLane.key,
      title: backlogLane.title,
      status: backlogLane.status,
      currentCount: backlogLane.currentCount,
      targetCount: backlogLane.targetCount,
      remainingCount: Math.max(0, backlogLane.targetCount - backlogLane.currentCount),
      adminSurface: intakeLane?.adminSurface ?? backlogLane.adminSurface,
      sourceTables: intakeLane?.sourceTables ?? backlogLane.sourceTables,
      requiredFields,
      acceptanceChecks: intakeLane?.acceptanceChecks ?? backlogLane.qualifyingEvidence,
      rejectionChecks: intakeLane?.rejectionChecks ?? backlogLane.rejectionRules,
      privacyChecks: intakeLane?.privacyChecks ?? [],
      qualityGates: intakeLane?.qualityGates ?? [],
      nonProofExamples: intakeLane?.nonProofExamples ?? [],
      verificationCommands: intakeLane?.verificationCommands ?? [backlogLane.verificationCommand],
      evidencePaths: intakeLane?.evidencePaths ?? [],
      intakeTemplate,
    };
  });

  const intakeKeys = new Set(input.intake.lanes.map((lane) => lane.key));
  for (const intakeLane of input.intake.lanes) {
    if (!input.backlog.lanes.some((lane) => lane.key === intakeLane.key)) {
      failures.push(`${intakeLane.key}:missing_backlog_lane`);
    }
  }

  if (lanes.length !== 5) failures.push('wrong_lane_count');
  if (input.intake.mutationMode !== 'local_file_evidence_only') failures.push('intake_not_local_only');
  if (input.backlog.mutationMode !== 'local_file_evidence_only') failures.push('backlog_not_local_only');
  if (!lanes.every((lane) => intakeKeys.has(lane.key))) failures.push('lane_key_mismatch');
  if (!lanes.every((lane) => Object.keys(lane.intakeTemplate).length >= 8)) failures.push('template_too_thin');
  if (!lanes.every((lane) => lane.privacyChecks.length >= 2)) failures.push('privacy_checks_too_thin');
  if (!lanes.every((lane) => lane.qualityGates.length >= 4)) failures.push('quality_gates_too_thin');
  if (!lanes.every((lane) => lane.nonProofExamples.length >= 4)) failures.push('non_proof_examples_too_thin');
  if (!lanes.every((lane) => lane.verificationCommands.every(ragEvalCommandIsGuarded))) failures.push('unguarded_rag_eval_command');
  const executionPlan = buildExecutionPlan(lanes);
  if (!executionPlan.every((step) => step.operatorAction.length > 40)) failures.push('thin_execution_operator_action');
  if (!executionPlan.every((step) => step.exitCriteria.length >= 4)) failures.push('thin_execution_exit_criteria');
  if (!executionPlan.every((step) => step.requiredEvidenceFields.includes('privacy_status'))) failures.push('execution_missing_privacy_status');
  if (!executionPlan.every((step) => step.doNotCount.length >= 4)) failures.push('execution_missing_anti_fake_rules');

  return {
    ok: failures.length === 0,
    version: 'discord-weekly-proof-packet-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'Weekly proof packet is an operator collection template. It does not create or satisfy operating proof without real approved Discord, RAG, public proof, and premium records.',
    backlogStatus: input.backlog.status,
    lanes,
    executionPlan,
    weeklyIntakeOrder: input.intake.weeklyIntakeOrder,
    nextActions: input.backlog.nextActions,
    failures,
  };
}

export function validateDiscordWeeklyProofPacket(packet: DiscordWeeklyProofPacket): {
  ok: boolean;
  failures: string[];
} {
  const failures = [...packet.failures];
  if (packet.version !== 'discord-weekly-proof-packet-v1') failures.push('wrong_version');
  if (packet.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (!packet.releaseMeaning.includes('does not create or satisfy operating proof')) failures.push('missing_non_proof_disclaimer');
  if (packet.lanes.length !== 5) failures.push('wrong_lane_count');
  if (!packet.lanes.every((lane) => lane.remainingCount === Math.max(0, lane.targetCount - lane.currentCount))) {
    failures.push('remaining_count_mismatch');
  }
  if (!packet.lanes.every((lane) => lane.intakeTemplate.privacy_status)) failures.push('missing_privacy_template');
  if (!packet.lanes.every((lane) => lane.intakeTemplate.evidence_artifact_path)) failures.push('missing_evidence_artifact_template');
  if (!packet.lanes.every((lane) => lane.intakeTemplate.operator_attestation)) failures.push('missing_operator_attestation_template');
  if (!packet.weeklyIntakeOrder.some((step) => step.includes('sync only approved items into RAG'))) failures.push('missing_approved_rag_step');
  if (!packet.lanes.every((lane) => lane.qualityGates.length >= 4)) failures.push('quality_gates_too_thin');
  if (!packet.lanes.every((lane) => lane.nonProofExamples.length >= 4)) failures.push('non_proof_examples_too_thin');
  if (packet.executionPlan.length !== packet.lanes.length) failures.push('execution_plan_lane_mismatch');
  if (!packet.executionPlan.every((step) => step.requiredEvidenceFields.includes('privacy_status'))) failures.push('execution_missing_privacy_status');
  if (!packet.executionPlan.every((step) => step.requiredEvidenceFields.includes('operator_attestation'))) failures.push('execution_missing_operator_attestation');
  if (!packet.executionPlan.every((step) => step.exitCriteria.length >= 4)) failures.push('thin_execution_exit_criteria');
  if (!packet.executionPlan.every((step) => step.doNotCount.length >= 4)) failures.push('execution_missing_anti_fake_rules');
  return {
    ok: packet.ok === true && failures.length === 0,
    failures,
  };
}

export function renderDiscordWeeklyProofPacketMarkdown(packet: DiscordWeeklyProofPacket): string {
  return [
    '# Sage Ideas Discord Weekly Proof Packet',
    '',
    `Generated: ${packet.generatedAt}`,
    `Mutation mode: ${packet.mutationMode}`,
    `Backlog status: ${packet.backlogStatus}`,
    `Packet OK: ${packet.ok ? 'yes' : 'no'}`,
    '',
    '## Release Meaning',
    '',
    packet.releaseMeaning,
    '',
    '## Weekly Intake Order',
    '',
    ...packet.weeklyIntakeOrder.map((step, index) => `${index + 1}. ${step}`),
    '',
    '## Execution Plan',
    '',
    ...packet.executionPlan.flatMap((step) => [
      `### ${step.priority}. ${step.laneTitle}`,
      '',
      `- Lane: ${step.laneKey}`,
      `- Status: ${step.status}`,
      `- Dependency: ${step.dependency ?? 'none'}`,
      `- Operator action: ${step.operatorAction}`,
      `- Admin surface: ${step.adminSurface}`,
      `- Verify: ${step.verificationCommand}`,
      `- Required evidence fields: ${step.requiredEvidenceFields.join(', ')}`,
      '',
      'Exit criteria:',
      ...step.exitCriteria.map((item) => `- ${item}`),
      '',
      'Do not count:',
      ...step.doNotCount.map((item) => `- ${item}`),
      '',
    ]),
    '',
    '## Proof Lanes',
    '',
    ...packet.lanes.flatMap((lane) => [
      `### ${lane.title}`,
      '',
      `- Key: ${lane.key}`,
      `- Status: ${lane.status}`,
      `- Current: ${lane.currentCount}/${lane.targetCount}`,
      `- Remaining: ${lane.remainingCount}`,
      `- Admin surface: ${lane.adminSurface}`,
      `- Source tables: ${lane.sourceTables.join(', ')}`,
      `- Verify: ${lane.verificationCommands.join(' && ')}`,
      `- Evidence paths: ${lane.evidencePaths.join(', ')}`,
      '',
      'Required intake template:',
      '```json',
      JSON.stringify(lane.intakeTemplate, null, 2),
      '```',
      '',
      'Accept:',
      ...lane.acceptanceChecks.map((item) => `- ${item}`),
      '',
      'Reject:',
      ...lane.rejectionChecks.map((item) => `- ${item}`),
      '',
      'Privacy:',
      ...lane.privacyChecks.map((item) => `- ${item}`),
      '',
      'Quality gates:',
      ...lane.qualityGates.map((item) => `- ${item}`),
      '',
      'Does not count as proof:',
      ...lane.nonProofExamples.map((item) => `- ${item}`),
      '',
    ]),
    '## Next Actions',
    '',
    ...(packet.nextActions.length ? packet.nextActions.map((action) => `- ${action}`) : ['None.']),
    '',
    '## Validation Failures',
    '',
    ...(packet.failures.length ? packet.failures.map((failure) => `- ${failure}`) : ['None.']),
    '',
  ].join('\n');
}
