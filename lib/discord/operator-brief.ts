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
  ragEvalMissingPreflight?: {
    ok?: boolean | null;
    status?: string | null;
    selectedMatchesCoverage?: boolean | null;
    missingEvalKeys?: string[] | null;
    summary?: {
      missingEvalCount?: number | null;
      sourceReadyCount?: number | null;
      termCoverageReadyCount?: number | null;
      readyForApprovedEvalCount?: number | null;
      blockerCount?: number | null;
    } | null;
    approvedCommand?: string | null;
    releaseMeaning?: string | null;
  } | null;
  ragEvalRecoveryPlan?: {
    ok?: boolean | null;
    status?: string | null;
    coverage?: {
      missingEvalCount?: number | null;
      missingEvalKeys?: string[] | null;
    } | null;
    latestEval?: {
      failedCount?: number | null;
    } | null;
    missingEvalBacklog?: Array<{ readyForApprovedEval?: boolean | null }> | null;
    failedEvalBacklog?: unknown[] | null;
    approvedCommand?: string | null;
    releaseMeaning?: string | null;
  } | null;
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
  gatewayOperatingPacket?: {
    ok?: boolean | null;
    status?: string | null;
    target?: {
      current?: number | null;
      target?: number | null;
      remaining?: number | null;
      usableMessageState?: string | null;
    } | null;
    messageContentSignal?: {
      effectiveEnabled?: boolean | null;
      source?: string | null;
    } | null;
    heartbeat?: {
      workerId?: string | null;
      fresh?: boolean | null;
      ageMinutes?: number | null;
    } | null;
    nextActions?: string[] | null;
    releaseMeaning?: string | null;
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
      collectionCadenceCount: number;
      acceptanceChecklistCount: number;
    }>;
  };
  ragEvalMissingPreflight: {
    ok: boolean;
    status: string;
    selectedMatchesCoverage: boolean;
    missingEvalCount: number;
    sourceReadyCount: number;
    termCoverageReadyCount: number;
    readyForApprovedEvalCount: number;
    blockerCount: number;
    approvedCommand: string | null;
    releaseMeaning: string | null;
  };
  ragEvalRecoveryPlan: {
    ok: boolean;
    status: string;
    missingEvalCount: number;
    failedEvalCount: number;
    readyMissingEvalCount: number;
    approvedCommand: string | null;
    releaseMeaning: string | null;
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
  gatewayOperatingPacket: {
    ok: boolean;
    status: string;
    current: number;
    target: number;
    remaining: number;
    usableMessageState: string | null;
    messageContentEnabled: boolean | null;
    messageContentSignalSource: string | null;
    heartbeatFresh: boolean;
    workerId: string | null;
    heartbeatAgeMinutes: number | null;
    nextActions: string[];
    releaseMeaning: string | null;
  };
  releaseGates: {
    total: number;
    passed: number;
    failures: string[];
  };
  actionPlan: {
    localOnlyCommands: string[];
    explicitApprovalCommands: string[];
    liveOperatorActions: string[];
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

function commandRequiresExplicitApproval(command: string): boolean {
  return command.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved')
    || command === 'npm run discord:operating-cycle'
    || command === 'npm run discord:operating-cycle:full';
}

export function buildDiscordOperatorBrief(input: DiscordOperatorBriefInput): DiscordOperatorBrief {
  const blockedLanes = input.proofBacklog.lanes.filter((lane) => lane.status === 'blocked');
  const gatewayCaptureStatus = input.gatewayCapture?.diagnosis?.status ?? 'unknown';
  const gatewayCaptureRootCauses = input.gatewayCapture?.diagnosis?.rootCauses ?? [];
  const gatewayCaptureNextActions = input.gatewayCapture?.diagnosis?.nextActions ?? [];
  const usableMessageCount = typeof input.gatewayCapture?.counts?.['discord_messages.non_bot_non_empty'] === 'number'
    ? input.gatewayCapture.counts['discord_messages.non_bot_non_empty']
    : null;
  const gatewayOperatingPacket = {
    ok: input.gatewayOperatingPacket?.ok === true,
    status: input.gatewayOperatingPacket?.status ?? 'missing',
    current: Number(input.gatewayOperatingPacket?.target?.current ?? 0),
    target: Number(input.gatewayOperatingPacket?.target?.target ?? 1),
    remaining: Number(input.gatewayOperatingPacket?.target?.remaining ?? 1),
    usableMessageState: input.gatewayOperatingPacket?.target?.usableMessageState ?? null,
    messageContentEnabled: input.gatewayOperatingPacket?.messageContentSignal?.effectiveEnabled ?? null,
    messageContentSignalSource: input.gatewayOperatingPacket?.messageContentSignal?.source ?? null,
    heartbeatFresh: input.gatewayOperatingPacket?.heartbeat?.fresh === true,
    workerId: input.gatewayOperatingPacket?.heartbeat?.workerId ?? null,
    heartbeatAgeMinutes: typeof input.gatewayOperatingPacket?.heartbeat?.ageMinutes === 'number'
      ? input.gatewayOperatingPacket.heartbeat.ageMinutes
      : null,
    nextActions: input.gatewayOperatingPacket?.nextActions ?? [],
    releaseMeaning: input.gatewayOperatingPacket?.releaseMeaning ?? null,
  };
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
      collectionCadenceCount: lane.collectionCadence?.length ?? 0,
      acceptanceChecklistCount: lane.acceptanceChecklist?.length ?? 0,
    })),
  };
  const missingEvalSummary = input.ragEvalMissingPreflight?.summary ?? {};
  const ragEvalMissingPreflight = {
    ok: input.ragEvalMissingPreflight?.ok === true,
    status: input.ragEvalMissingPreflight?.status ?? 'missing',
    selectedMatchesCoverage: input.ragEvalMissingPreflight?.selectedMatchesCoverage === true,
    missingEvalCount: Number(missingEvalSummary.missingEvalCount ?? input.ragEvalMissingPreflight?.missingEvalKeys?.length ?? 0),
    sourceReadyCount: Number(missingEvalSummary.sourceReadyCount ?? 0),
    termCoverageReadyCount: Number(missingEvalSummary.termCoverageReadyCount ?? 0),
    readyForApprovedEvalCount: Number(missingEvalSummary.readyForApprovedEvalCount ?? 0),
    blockerCount: Number(missingEvalSummary.blockerCount ?? 0),
    approvedCommand: input.ragEvalMissingPreflight?.approvedCommand ?? null,
    releaseMeaning: input.ragEvalMissingPreflight?.releaseMeaning ?? null,
  };
  const ragEvalRecoveryPlan = {
    ok: input.ragEvalRecoveryPlan?.ok === true,
    status: input.ragEvalRecoveryPlan?.status ?? 'missing',
    missingEvalCount: Number(input.ragEvalRecoveryPlan?.coverage?.missingEvalCount ?? input.ragEvalRecoveryPlan?.coverage?.missingEvalKeys?.length ?? 0),
    failedEvalCount: Number(input.ragEvalRecoveryPlan?.latestEval?.failedCount ?? input.ragEvalRecoveryPlan?.failedEvalBacklog?.length ?? 0),
    readyMissingEvalCount: (input.ragEvalRecoveryPlan?.missingEvalBacklog ?? []).filter((item) => item.readyForApprovedEval === true).length,
    approvedCommand: input.ragEvalRecoveryPlan?.approvedCommand ?? null,
    releaseMeaning: input.ragEvalRecoveryPlan?.releaseMeaning ?? null,
  };
  const commandOrder = uniqueCommands([
    ...input.proofBacklog.weeklyChecklist.map((step) => step.safeLocalCommand),
    ...input.proofBacklog.weeklyChecklist.map((step) => step.liveCommand),
    'npm run discord:proof-source-recovery-plan',
    'npm run rag:evaluate:missing-preflight',
    'npm run rag:evaluate:recovery-plan',
    ragEvalMissingPreflight.approvedCommand,
    'npm run rag:evaluate:coverage-readiness',
    'npm run rag:discord-corpus-readiness',
    'npm run discord:durable-jobs-readiness',
    'npm run discord:security-privacy-readiness',
    'npm run discord:observability-quality-readiness',
    'npm run discord:content-factory-readiness',
    'npm run discord:premium-readiness',
    'npm run discord:public-growth-readiness',
    'npm run discord:proof-intake-readiness',
    'npm run discord:weekly-proof-packet',
    'npm run discord:proof-rehearsal-readiness',
    'npm run discord:smoke-final-scorecard',
    'npm run discord:proof-backlog',
    'npm run discord:proof-candidate-audit',
    'npm run discord:world-class-readiness',
    'npm run discord:operator-brief',
    'npm run discord:gateway-capture-diagnosis',
    'npm run discord:gateway-operating-packet',
    'npm run verify:local:evidence',
  ]);
  const localOnlyCommands = uniqueCommands([
    ...input.proofBacklog.weeklyChecklist.map((step) => step.safeLocalCommand),
    'npm run discord:proof-source-recovery-plan',
    'npm run rag:evaluate:missing-preflight',
    'npm run rag:evaluate:recovery-plan',
    'npm run rag:evaluate:coverage-readiness',
    'npm run rag:discord-corpus-readiness',
    'npm run discord:durable-jobs-readiness',
    'npm run discord:security-privacy-readiness',
    'npm run discord:observability-quality-readiness',
    'npm run discord:content-factory-readiness',
    'npm run discord:premium-readiness',
    'npm run discord:public-growth-readiness',
    'npm run discord:proof-intake-readiness',
    'npm run discord:weekly-proof-packet',
    'npm run discord:proof-rehearsal-readiness',
    'npm run discord:proof-backlog',
    'npm run discord:proof-candidate-audit',
    'npm run discord:world-class-readiness',
    'npm run discord:operator-brief',
    'npm run discord:gateway-capture-diagnosis',
    'npm run discord:gateway-operating-packet',
    'npm run verify:local:evidence',
  ]).filter((command) => !commandRequiresExplicitApproval(command));
  const explicitApprovalCommands = uniqueCommands([
    ...input.proofBacklog.weeklyChecklist.map((step) => step.liveCommand),
    ragEvalMissingPreflight.approvedCommand,
  ]).filter(commandRequiresExplicitApproval);
  const liveOperatorActions = uniqueCommands([
    ...blockedLanes.map((lane) => lane.liveActionRequired),
    ...gatewayOperatingPacket.nextActions,
    ...gatewayCaptureNextActions,
  ]).filter((action) => action.length > 0);
  const gatewayCaptureBlocked = gatewayCaptureStatus === 'blocked' || usableMessageCount === 0 || gatewayOperatingPacket.remaining > 0;
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
    ragEvalMissingPreflight,
    ragEvalRecoveryPlan,
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
    gatewayOperatingPacket,
    releaseGates: {
      total: releaseGateCount,
      passed: releaseGatesPassed,
      failures: releaseGateFailures,
    },
    actionPlan: {
      localOnlyCommands,
      explicitApprovalCommands,
      liveOperatorActions,
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
  if (!brief.commandOrder.includes('npm run rag:discord-corpus-readiness')) failures.push('missing_discord_corpus_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:durable-jobs-readiness')) failures.push('missing_durable_jobs_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:security-privacy-readiness')) failures.push('missing_security_privacy_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:observability-quality-readiness')) failures.push('missing_observability_quality_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:content-factory-readiness')) failures.push('missing_content_factory_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:premium-readiness')) failures.push('missing_premium_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:public-growth-readiness')) failures.push('missing_public_growth_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:proof-intake-readiness')) failures.push('missing_proof_intake_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:weekly-proof-packet')) failures.push('missing_weekly_proof_packet_command');
  if (!brief.commandOrder.includes('npm run discord:proof-rehearsal-readiness')) failures.push('missing_proof_rehearsal_readiness_command');
  if (!brief.commandOrder.includes('npm run discord:proof-candidate-audit')) failures.push('missing_proof_candidate_audit_command');
  if (!brief.commandOrder.includes('npm run discord:gateway-capture-diagnosis')) failures.push('missing_gateway_capture_diagnosis_command');
  if (!brief.commandOrder.includes('npm run discord:gateway-operating-packet')) failures.push('missing_gateway_operating_packet_command');
  if (!brief.commandOrder.includes('npm run verify:local:evidence')) failures.push('missing_local_evidence_verification_command');
  if (!brief.actionPlan?.localOnlyCommands?.some((command) => command.includes('discord:proof-backlog'))) failures.push('action_plan_missing_safe_backlog_command');
  if (brief.actionPlan?.localOnlyCommands?.some(commandRequiresExplicitApproval)) failures.push('action_plan_local_commands_include_approval_command');
  if (brief.releaseGates.failures.includes('rag_eval_coverage_readiness') && !brief.actionPlan?.explicitApprovalCommands?.some((command) => command.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved'))) failures.push('action_plan_missing_guarded_rag_eval_command');
  if (blockedLanes.length > 0 && !brief.actionPlan?.liveOperatorActions?.length) failures.push('action_plan_missing_live_operator_actions');
  if (brief.releaseGates.total <= 0) failures.push('missing_release_gate_summary');
  if (brief.releaseGates.passed > brief.releaseGates.total) failures.push('invalid_release_gate_counts');
  if (brief.releaseGates.failures.length > 0 && !brief.currentReality.includes('real operating proof is still missing')) failures.push('release_gate_failure_reality_not_explicit');
  if (blockedLanes.length > 0 && !brief.currentReality.includes('real operating proof is still missing')) failures.push('blocked_reality_not_explicit');
  if (brief.proofSourceRecoveryPlan.status === 'missing') failures.push('missing_proof_source_recovery_plan');
  if (brief.proofSourceRecoveryPlan.status === 'blocked' && brief.proofSourceRecoveryPlan.totalShortfall <= 0) failures.push('blocked_recovery_plan_without_shortfall');
  if (brief.proofSourceRecoveryPlan.status === 'blocked' && !brief.proofSourceRecoveryPlan.nextLane) failures.push('blocked_recovery_plan_without_next_lane');
  if (brief.proofSourceRecoveryPlan.laneStates.length > 0 && brief.proofSourceRecoveryPlan.blockedLaneCount !== brief.proofSourceRecoveryPlan.laneStates.filter((lane) => lane.status === 'blocked').length) failures.push('recovery_blocked_lane_count_mismatch');
  if (brief.proofSourceRecoveryPlan.laneStates.some((lane) => lane.collectionCadenceCount < 3)) failures.push('recovery_lane_missing_collection_cadence');
  if (brief.proofSourceRecoveryPlan.laneStates.some((lane) => lane.acceptanceChecklistCount < 3)) failures.push('recovery_lane_missing_acceptance_checklist');
  if (!brief.commandOrder.includes('npm run rag:evaluate:missing-preflight')) failures.push('missing_rag_eval_missing_preflight_command');
  if (!brief.commandOrder.includes('npm run rag:evaluate:recovery-plan')) failures.push('missing_rag_eval_recovery_plan_command');
  if (!brief.commandOrder.some((command) => command.includes('npm run rag:evaluate:missing'))) failures.push('missing_approved_missing_eval_command');
  if (brief.releaseGates.failures.includes('rag_eval_coverage_readiness')) {
    if (brief.ragEvalMissingPreflight.status === 'missing') failures.push('missing_rag_eval_preflight');
    if (brief.ragEvalMissingPreflight.missingEvalCount <= 0) failures.push('rag_eval_preflight_without_missing_count');
    if (brief.ragEvalMissingPreflight.readyForApprovedEvalCount !== brief.ragEvalMissingPreflight.missingEvalCount) failures.push('rag_eval_preflight_not_ready_for_all_missing_keys');
    if (!brief.ragEvalMissingPreflight.selectedMatchesCoverage) failures.push('rag_eval_preflight_keys_do_not_match_coverage');
    if (!brief.ragEvalMissingPreflight.releaseMeaning?.includes('does not seed Supabase')) failures.push('rag_eval_preflight_claim_boundary_missing');
    if (brief.ragEvalRecoveryPlan.status === 'missing') failures.push('missing_rag_eval_recovery_plan');
    if (brief.ragEvalRecoveryPlan.missingEvalCount !== brief.ragEvalMissingPreflight.missingEvalCount) failures.push('rag_eval_recovery_missing_count_mismatch');
    if (brief.ragEvalRecoveryPlan.readyMissingEvalCount !== brief.ragEvalRecoveryPlan.missingEvalCount) failures.push('rag_eval_recovery_not_ready_for_all_missing_keys');
    if (!brief.ragEvalRecoveryPlan.releaseMeaning?.includes('does not seed Supabase')) failures.push('rag_eval_recovery_claim_boundary_missing');
  }
  if (brief.gatewayCapture.status === 'blocked' && !brief.currentReality.includes('gateway capture')) failures.push('gateway_capture_blocker_not_explicit');
  if (brief.gatewayOperatingPacket.remaining > 0 && !brief.gatewayOperatingPacket.nextActions.length) failures.push('gateway_operating_packet_missing_next_action');
  if (brief.gatewayOperatingPacket.status !== 'missing' && !brief.gatewayOperatingPacket.releaseMeaning?.includes('does not run the worker')) failures.push('gateway_operating_packet_claim_boundary_missing');
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
      ...brief.proofSourceRecoveryPlan.laneStates.map((lane) => `  - ${lane.key}: ${lane.current}/${lane.target}, ${lane.sourceVolumeState}, shortfall ${lane.shortfall}, cadence checks ${lane.collectionCadenceCount}, acceptance checks ${lane.acceptanceChecklistCount}`),
    ] : ['- Lane states: none']),
    '',
    '## RAG Missing Eval Preflight',
    '',
    `- Status: ${brief.ragEvalMissingPreflight.status}`,
    `- OK: ${brief.ragEvalMissingPreflight.ok ? 'yes' : 'no'}`,
    `- Keys match coverage: ${brief.ragEvalMissingPreflight.selectedMatchesCoverage ? 'yes' : 'no'}`,
    `- Ready: ${brief.ragEvalMissingPreflight.readyForApprovedEvalCount}/${brief.ragEvalMissingPreflight.missingEvalCount}`,
    `- Sources ready: ${brief.ragEvalMissingPreflight.sourceReadyCount}/${brief.ragEvalMissingPreflight.missingEvalCount}`,
    `- Terms ready: ${brief.ragEvalMissingPreflight.termCoverageReadyCount}/${brief.ragEvalMissingPreflight.missingEvalCount}`,
    `- Approved command after explicit approval: ${brief.ragEvalMissingPreflight.approvedCommand ?? 'none'}`,
    `- Boundary: ${brief.ragEvalMissingPreflight.releaseMeaning ?? 'none'}`,
    '',
    '## RAG Eval Recovery Plan',
    '',
    `- Status: ${brief.ragEvalRecoveryPlan.status}`,
    `- OK: ${brief.ragEvalRecoveryPlan.ok ? 'yes' : 'no'}`,
    `- Missing eval backlog ready: ${brief.ragEvalRecoveryPlan.readyMissingEvalCount}/${brief.ragEvalRecoveryPlan.missingEvalCount}`,
    `- Failed eval backlog: ${brief.ragEvalRecoveryPlan.failedEvalCount}`,
    `- Approved command after explicit approval: ${brief.ragEvalRecoveryPlan.approvedCommand ?? 'none'}`,
    `- Boundary: ${brief.ragEvalRecoveryPlan.releaseMeaning ?? 'none'}`,
    '',
    '## Gateway Capture',
    '',
    `- Status: ${brief.gatewayCapture.status}`,
    `- OK: ${brief.gatewayCapture.ok ? 'yes' : 'no'}`,
    `- Usable non-bot message count: ${brief.gatewayCapture.usableMessageCount ?? 'unknown'}`,
    `- Packet status: ${brief.gatewayOperatingPacket.status}`,
    `- Packet target: ${brief.gatewayOperatingPacket.current}/${brief.gatewayOperatingPacket.target}`,
    `- Packet remaining: ${brief.gatewayOperatingPacket.remaining}`,
    `- Packet state: ${brief.gatewayOperatingPacket.usableMessageState ?? 'unknown'}`,
    `- Message content: ${String(brief.gatewayOperatingPacket.messageContentEnabled)} via ${brief.gatewayOperatingPacket.messageContentSignalSource ?? 'unknown'}`,
    `- Heartbeat: ${brief.gatewayOperatingPacket.heartbeatFresh ? 'fresh' : 'not fresh'} (${brief.gatewayOperatingPacket.workerId ?? 'unknown'}, age ${brief.gatewayOperatingPacket.heartbeatAgeMinutes ?? 'unknown'} minutes)`,
    ...(brief.gatewayCapture.rootCauses.length ? [
      '- Root causes:',
      ...brief.gatewayCapture.rootCauses.map((cause) => `  - ${cause}`),
    ] : ['- Root causes: none reported']),
    ...((brief.gatewayOperatingPacket.nextActions.length ? brief.gatewayOperatingPacket.nextActions : brief.gatewayCapture.nextActions).length ? [
      '- Next actions:',
      ...(brief.gatewayOperatingPacket.nextActions.length ? brief.gatewayOperatingPacket.nextActions : brief.gatewayCapture.nextActions).map((action) => `  - ${action}`),
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
    '## Action Plan By Permission Boundary',
    '',
    '### Safe Local Commands',
    '',
    ...brief.actionPlan.localOnlyCommands.map((command) => `- \`${command}\``),
    '',
    '### Explicit Approval Commands',
    '',
    ...(brief.actionPlan.explicitApprovalCommands.length ? brief.actionPlan.explicitApprovalCommands.map((command) => `- \`${command}\``) : ['- None']),
    '',
    '### Live Operator Actions',
    '',
    ...(brief.actionPlan.liveOperatorActions.length ? brief.actionPlan.liveOperatorActions.map((action) => `- ${action}`) : ['- None']),
    '',
    '## Non-Claim Rule',
    '',
    brief.nonClaimRule,
    '',
  ].join('\n');
}
