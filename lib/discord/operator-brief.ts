import type { DiscordProofBacklogReport } from './proof-backlog';
import type { DiscordProofSourceRecoveryPlan } from './proof-source-recovery-plan';

export type DiscordOperatorBriefInput = {
  generatedAt: string;
  scorecard: {
    averageScore?: number | null;
    summary?: {
      averageScore?: number | null;
      worldClassEligible?: boolean | null;
    };
    worldClassEligible?: boolean | null;
  };
  operatingCycle: {
    status?: string | null;
  };
  proofBacklog: DiscordProofBacklogReport;
  proofSourceRecoveryPlan?: DiscordProofSourceRecoveryPlan | null;
  readiness: {
    releaseDecision?: string | null;
    summary?: {
      releaseGateCount?: number | null;
      releaseGatesPassed?: number | null;
      releaseGateFailures?: string[] | null;
    } | null;
  };
  proofRehearsal: {
    ok?: boolean | null;
    lanes?: unknown[] | null;
    releaseMeaning?: string | null;
  };
  gatewayCapture?: {
    ok?: boolean | null;
    diagnosis?: {
      status?: string | null;
      rootCauses?: string[] | null;
      nextActions?: string[] | null;
    } | null;
    counts?: Record<string, number> | null;
  } | null;
};

export type DiscordOperatorBrief = {
  ok: true;
  version: 'discord-operator-brief-v1';
  generatedAt: string;
  mutationMode: 'local_file_evidence_only';
  releaseDecision: string;
  averageScore: number | null;
  worldClassEligible: boolean;
  currentReality: string;
  blockedLaneCount: number;
  proofLanes: DiscordProofBacklogReport['lanes'];
  weeklyChecklist: DiscordProofBacklogReport['weeklyChecklist'];
  proofSourceRecoveryPlan: {
    status: 'passed' | 'blocked' | 'missing';
    blockedLaneCount: number;
    totalShortfall: number;
    nextLane: string | null;
    laneStates: Array<{
      key: string;
      status: string;
      sourceVolumeState: string;
      current: number;
      target: number;
      shortfall: number;
    }>;
  };
  proofRehearsal: {
    ok: boolean;
    laneCount: number;
    releaseMeaning: string | null;
  };
  gatewayCapture: {
    ok: boolean;
    status: string;
    rootCauses: string[];
    nextActions: string[];
    usableMessageCount: number | null;
  };
  releaseGates: {
    total: number;
    passed: number;
    failures: string[];
  };
  commandOrder: string[];
  nonClaimRule: string;
};

export type DiscordOperatorBriefValidation = {
  ok: boolean;
  failures: string[];
};

export const DISCORD_OPERATOR_BRIEF_NON_CLAIM_RULE =
  'Do not claim world-class, 95+, production-complete, or operating-proof complete until every proof backlog lane is passed from real operating data and the final scorecard is rerun.';

function uniqueCommands(commands: Array<string | null | undefined>): string[] {
  return [...new Set(commands.map((command) => command?.trim()).filter((command): command is string => Boolean(command)))];
}

export function buildDiscordOperatorBrief(input: DiscordOperatorBriefInput): DiscordOperatorBrief {
  const blockedLanes = input.proofBacklog.lanes.filter((lane) => lane.status === 'blocked');
  const gatewayCaptureStatus = input.gatewayCapture?.diagnosis?.status ?? 'unknown';
  const gatewayCaptureRootCauses = input.gatewayCapture?.diagnosis?.rootCauses ?? [];
  const gatewayCaptureNextActions = input.gatewayCapture?.diagnosis?.nextActions ?? [];
  const usableMessageCount = typeof input.gatewayCapture?.counts?.['discord_messages.non_bot_non_empty'] === 'number'
    ? input.gatewayCapture.counts['discord_messages.non_bot_non_empty']
    : null;
  const releaseGateCount = Number(input.readiness.summary?.releaseGateCount ?? 0);
  const releaseGatesPassed = Number(input.readiness.summary?.releaseGatesPassed ?? 0);
  const releaseGateFailures = Array.isArray(input.readiness.summary?.releaseGateFailures)
    ? input.readiness.summary.releaseGateFailures
    : [];
  const recoveryLanes = Array.isArray(input.proofSourceRecoveryPlan?.lanes) ? input.proofSourceRecoveryPlan.lanes : [];
  const recoveryPlanStatus: DiscordOperatorBrief['proofSourceRecoveryPlan']['status'] = input.proofSourceRecoveryPlan?.status ?? 'missing';
  const proofSourceRecoveryPlan = {
    status: recoveryPlanStatus,
    blockedLaneCount: recoveryLanes.filter((lane) => lane.status === 'blocked').length,
    totalShortfall: Number(input.proofSourceRecoveryPlan?.summary?.totalShortfall ?? 0),
    nextLane: input.proofSourceRecoveryPlan?.summary?.nextLane ?? null,
    laneStates: recoveryLanes.map((lane) => ({
      key: lane.key,
      status: lane.status,
      sourceVolumeState: lane.sourceVolumeState,
      current: lane.current,
      target: lane.target,
      shortfall: lane.shortfall,
    })),
  };
  const commandOrder = uniqueCommands([
    ...input.proofBacklog.weeklyChecklist.map((step) => step.safeLocalCommand),
    ...input.proofBacklog.weeklyChecklist.map((step) => step.liveCommand),
    'npm run discord:proof-source-recovery-plan',
    'npm run rag:evaluate',
    'npm run discord:smoke-final-scorecard',
    'npm run discord:world-class-readiness',
    'npm run discord:proof-backlog',
    'npm run discord:operator-brief',
    'npm run discord:content-factory-readiness',
    'npm run discord:proof-intake-readiness',
    'npm run discord:weekly-proof-packet',
    'npm run discord:gateway-capture-diagnosis',
  ]);
  const gatewayCaptureBlocked = gatewayCaptureStatus === 'blocked' || usableMessageCount === 0;
  return {
    ok: true,
    version: 'discord-operator-brief-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseDecision: input.readiness.releaseDecision ?? 'do_not_claim_world_class',
    averageScore: input.scorecard.averageScore ?? input.scorecard.summary?.averageScore ?? null,
    worldClassEligible: Boolean(input.scorecard.worldClassEligible ?? input.scorecard.summary?.worldClassEligible),
    currentReality: input.operatingCycle.status === 'blocked' || gatewayCaptureBlocked
      ? 'The local system is verified, but real operating proof is still missing. Close gateway capture and blocked proof lanes with real approved community activity before claiming 95+.'
      : 'The latest operating cycle passed. Keep running weekly proof and scorecard checks.',
    blockedLaneCount: blockedLanes.length,
    proofLanes: input.proofBacklog.lanes,
    weeklyChecklist: input.proofBacklog.weeklyChecklist,
    proofSourceRecoveryPlan,
    proofRehearsal: {
      ok: input.proofRehearsal.ok === true,
      laneCount: Array.isArray(input.proofRehearsal.lanes) ? input.proofRehearsal.lanes.length : 0,
      releaseMeaning: input.proofRehearsal.releaseMeaning ?? null,
    },
    gatewayCapture: {
      ok: input.gatewayCapture?.ok === true,
      status: gatewayCaptureStatus,
      rootCauses: gatewayCaptureRootCauses,
      nextActions: gatewayCaptureNextActions,
      usableMessageCount,
    },
    releaseGates: {
      total: releaseGateCount,
      passed: releaseGatesPassed,
      failures: releaseGateFailures,
    },
    commandOrder,
    nonClaimRule: DISCORD_OPERATOR_BRIEF_NON_CLAIM_RULE,
  };
}

export function validateDiscordOperatorBrief(brief: DiscordOperatorBrief): DiscordOperatorBriefValidation {
  const failures: string[] = [];
  const blockedLanes = brief.proofLanes.filter((lane) => lane.status === 'blocked');
  if (brief.version !== 'discord-operator-brief-v1') failures.push('wrong_version');
  if (brief.mutationMode !== 'local_file_evidence_only') failures.push('wrong_mutation_mode');
  if (brief.blockedLaneCount !== blockedLanes.length) failures.push('blocked_lane_count_mismatch');
  if (brief.worldClassEligible && brief.releaseDecision !== 'eligible_for_world_class_claim') failures.push('eligible_decision_mismatch');
  if (!brief.worldClassEligible && brief.releaseDecision !== 'do_not_claim_world_class') failures.push('non_eligible_decision_mismatch');
  if (!brief.nonClaimRule.includes('Do not claim world-class')) failures.push('missing_non_claim_rule');
  if (!brief.commandOrder.includes('npm run discord:operator-brief')) failures.push('missing_operator_brief_refresh_command');
  if (!brief.commandOrder.includes('npm run discord:proof-backlog')) failures.push('missing_proof_backlog_command');
  if (!brief.commandOrder.includes('npm run discord:proof-source-recovery-plan')) failures.push('missing_proof_source_recovery_plan_command');
  if (!brief.commandOrder.includes('npm run discord:content-factory-readiness')) failures.push('missing_content_factory_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:proof-intake-readiness')) failures.push('missing_proof_intake_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:weekly-proof-packet')) failures.push('missing_weekly_proof_packet_command');
  if (!brief.commandOrder.includes('npm run discord:gateway-capture-diagnosis')) failures.push('missing_gateway_capture_diagnosis_command');
  if (brief.releaseGates.total <= 0) failures.push('missing_release_gate_summary');
  if (brief.releaseGates.passed > brief.releaseGates.total) failures.push('invalid_release_gate_counts');
  if (brief.releaseGates.failures.length > 0 && !brief.currentReality.includes('real operating proof is still missing')) failures.push('release_gate_failure_reality_not_explicit');
  if (blockedLanes.length > 0 && !brief.currentReality.includes('real operating proof is still missing')) failures.push('blocked_reality_not_explicit');
  if (brief.proofSourceRecoveryPlan.status === 'missing') failures.push('missing_proof_source_recovery_plan');
  if (brief.proofSourceRecoveryPlan.status === 'blocked' && brief.proofSourceRecoveryPlan.totalShortfall <= 0) failures.push('blocked_recovery_plan_without_shortfall');
  if (brief.proofSourceRecoveryPlan.status === 'blocked' && !brief.proofSourceRecoveryPlan.nextLane) failures.push('blocked_recovery_plan_without_next_lane');
  if (brief.proofSourceRecoveryPlan.laneStates.length > 0 && brief.proofSourceRecoveryPlan.blockedLaneCount !== brief.proofSourceRecoveryPlan.laneStates.filter((lane) => lane.status === 'blocked').length) failures.push('recovery_blocked_lane_count_mismatch');
  if (brief.gatewayCapture.status === 'blocked' && !brief.currentReality.includes('gateway capture')) failures.push('gateway_capture_blocker_not_explicit');
  if (brief.weeklyChecklist.length !== blockedLanes.length) failures.push('weekly_checklist_blocked_lane_mismatch');
  return {
    ok: failures.length === 0,
    failures,
  };
}

export function renderDiscordOperatorBriefMarkdown(brief: DiscordOperatorBrief): string {
  const blockedLanes = brief.proofLanes.filter((lane) => lane.status === 'blocked');
  return [
    '# Sage Ideas Discord Operator Brief',
    '',
    `Generated: ${brief.generatedAt}`,
    `Release decision: ${brief.releaseDecision}`,
    `Average score: ${brief.averageScore}/100`,
    `World-class eligible: ${brief.worldClassEligible ? 'yes' : 'no'}`,
    '',
    '## Current Reality',
    '',
    brief.currentReality,
    '',
    '## Blocked Proof Lanes',
    '',
    blockedLanes.length ? blockedLanes.flatMap((lane) => [
      `### ${lane.title}`,
      '',
      `- Status: ${lane.status}`,
      `- Current: ${lane.currentCount}/${lane.targetCount}`,
      `- Admin surface: ${lane.adminSurface}`,
      `- Local check: ${lane.safeLocalCommand ?? 'none'}`,
      `- Verification: ${lane.verificationCommand}`,
      `- Evidence required: ${lane.evidenceRequired}`,
      `- Live action: ${lane.liveActionRequired}`,
      '',
    ]).join('\n') : 'No blocked proof lanes.',
    '## Proof Source Recovery',
    '',
    `- Status: ${brief.proofSourceRecoveryPlan.status}`,
    `- Blocked lanes: ${brief.proofSourceRecoveryPlan.blockedLaneCount}`,
    `- Total shortfall: ${brief.proofSourceRecoveryPlan.totalShortfall}`,
    `- Next lane: ${brief.proofSourceRecoveryPlan.nextLane ?? 'none'}`,
    ...(brief.proofSourceRecoveryPlan.laneStates.length ? [
      '- Lane states:',
      ...brief.proofSourceRecoveryPlan.laneStates.map((lane) => `  - ${lane.key}: ${lane.current}/${lane.target}, ${lane.sourceVolumeState}, shortfall ${lane.shortfall}`),
    ] : ['- Lane states: none']),
    '',
    '## Gateway Capture',
    '',
    `- Status: ${brief.gatewayCapture.status}`,
    `- OK: ${brief.gatewayCapture.ok ? 'yes' : 'no'}`,
    `- Usable non-bot message count: ${brief.gatewayCapture.usableMessageCount ?? 'unknown'}`,
    ...(brief.gatewayCapture.rootCauses.length ? [
      '- Root causes:',
      ...brief.gatewayCapture.rootCauses.map((cause) => `  - ${cause}`),
    ] : ['- Root causes: none reported']),
    ...(brief.gatewayCapture.nextActions.length ? [
      '- Next actions:',
      ...brief.gatewayCapture.nextActions.map((action) => `  - ${action}`),
    ] : ['- Next actions: none reported']),
    '',
    '## Release Gates',
    '',
    `- Passed: ${brief.releaseGates.passed}/${brief.releaseGates.total}`,
    ...(brief.releaseGates.failures.length ? [
      '- Failures:',
      ...brief.releaseGates.failures.map((failure) => `  - ${failure}`),
    ] : ['- Failures: none']),
    '',
    '## Required Command Order',
    '',
    ...brief.commandOrder.map((command, index) => `${index + 1}. \`${command}\``),
    '',
    '## Non-Claim Rule',
    '',
    brief.nonClaimRule,
    '',
  ].join('\n');
}
