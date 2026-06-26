export type WorldClassScorecardItem = {
  category: string;
  score: number;
  evidence?: string[];
  knownGaps?: string[];
  nextAction?: string;
  blocker?: {
    owner?: string;
    reason?: string;
    nextAction?: string;
  } | null;
};

export type WorldClassReadinessInput = {
  generatedAt: string;
  averageScore: number;
  worldClassThreshold: number;
  worldClassEligible: boolean;
  scorecard: WorldClassScorecardItem[];
  releaseGates?: Array<{
    name: string;
    passed: boolean;
    evidence?: string;
  }>;
  operatingBlockers: string[];
  requiredOperatingProof: string[];
  ragEvalMissingPreflight?: {
    status?: string;
    ok?: boolean;
    missingEvalCount?: number;
    readyForApprovedEvalCount?: number;
    selectedMatchesCoverage?: boolean;
    approvedCommand?: string;
    releaseMeaning?: string;
  } | null;
  ragEvalRecoveryPlan?: {
    status?: string;
    ok?: boolean;
    missingEvalCount?: number;
    readyMissingEvalCount?: number;
    failedEvalCount?: number;
    approvedCommand?: string;
    releaseMeaning?: string;
  } | null;
  proofSourceRecoveryPlan?: {
    status?: string;
    ok?: boolean;
    totalShortfall?: number;
    blockedLaneCount?: number;
    nextLaneKey?: string | null;
    releaseMeaning?: string;
  } | null;
  gatewayOperatingPacket?: {
    status?: string;
    current?: number;
    target?: number;
    remaining?: number;
    usableMessageState?: string;
    messageContentEnabled?: boolean | null;
    messageContentSignalSource?: string | null;
    heartbeatFresh?: boolean;
    workerId?: string | null;
    nextActions?: string[];
    releaseMeaning?: string | null;
  } | null;
};

export type WorldClassReadinessCategory = {
  category: string;
  score: number;
  status: 'earned_95_plus' | 'strong_but_not_world_class' | 'needs_operating_proof' | 'needs_build_work';
  scoreGapTo95: number;
  nextAction: string;
  blockerReason: string | null;
  evidenceCount: number;
};

export type WorldClassReadinessReport = {
  ok: true;
  version: 'world-class-readiness-v1';
  generatedAt: string;
  releaseDecision: 'do_not_claim_world_class' | 'eligible_for_world_class_claim';
  averageScore: number;
  worldClassThreshold: number;
  worldClassEligible: boolean;
  mutationMode: 'local_file_evidence_only';
  summary: {
    categoryCount: number;
    categoriesAtOrAbove95: number;
    categoriesBelow95: number;
    categoriesBelow85: number;
    maxScoreGapTo95: number;
    operatingBlockers: string[];
    releaseGateCount: number;
    releaseGatesPassed: number;
    releaseGateFailures: string[];
  };
  ragEvalMissingPreflight: {
    status: string;
    ok: boolean;
    missingEvalCount: number;
    readyForApprovedEvalCount: number;
    selectedMatchesCoverage: boolean;
    approvedCommand: string | null;
    releaseMeaning: string | null;
  };
  ragEvalRecoveryPlan: {
    status: string;
    ok: boolean;
    missingEvalCount: number;
    readyMissingEvalCount: number;
    failedEvalCount: number;
    approvedCommand: string | null;
    releaseMeaning: string | null;
  };
  proofSourceRecoveryPlan: {
    status: string;
    ok: boolean;
    totalShortfall: number;
    blockedLaneCount: number;
    nextLaneKey: string | null;
    releaseMeaning: string | null;
  };
  gatewayOperatingPacket: {
    status: string;
    current: number;
    target: number;
    remaining: number;
    usableMessageState: string | null;
    messageContentEnabled: boolean | null;
    messageContentSignalSource: string | null;
    heartbeatFresh: boolean;
    workerId: string | null;
    nextActions: string[];
    releaseMeaning: string | null;
  };
  immediateActionOrder: string[];
  actionPlan: {
    localOnlyCommands: string[];
    explicitApprovalCommands: string[];
    liveOperatorActions: string[];
  };
  operatingProofRequired: string[];
  categories: WorldClassReadinessCategory[];
};

const OPERATING_BLOCKER_ACTIONS: Record<string, string> = {
  discord_gateway_capture_blocked:
    'Deploy or run the gateway worker with Message Content Intent proven, capture a fresh non-bot message, then rerun gateway capture diagnosis.',
  approved_discord_knowledge_sources_below_target:
    'Approve at least 10 high-signal Discord questions, answers, builds, reviews, wins, or resources as knowledge candidates.',
  rag_discord_sources_below_target:
    'Sync approved Discord candidates into authoritative RAG and rerun retrieval/answer evals.',
  public_proof_assets_below_target:
    'Create and approve four privacy-safe public proof assets from approved Discord source material.',
  public_proof_apply_clicks_below_target:
    'Publish at least one public proof asset with tracked apply/join intent before claiming growth proof.',
  applications_submitted_below_target:
    'Drive at least one measured Discord application from the approval-gated growth funnel.',
  premium_workflow_proof_below_target:
    'Run one premium review, deeper-answer, or office-hours proof path with a real or deliberately seeded premium scenario.',
};

export function classifyWorldClassCategory(item: WorldClassScorecardItem): WorldClassReadinessCategory['status'] {
  if (item.score >= 95 && !item.blocker) return 'earned_95_plus';
  if (item.score >= 90) return 'needs_operating_proof';
  if (item.score >= 85) return 'strong_but_not_world_class';
  return 'needs_build_work';
}

function uniqueActionList(actions: string[]): string[] {
  return [...new Set(actions.map((action) => action.trim()).filter(Boolean))];
}

function actionForOperatingBlocker(blocker: string): string {
  const blockerKey = blocker.split(':')[0] ?? blocker;
  return OPERATING_BLOCKER_ACTIONS[blockerKey] ?? `Resolve operating blocker: ${blocker}.`;
}

function uniqueValues(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
}

export function buildWorldClassReadinessReport(input: WorldClassReadinessInput): WorldClassReadinessReport {
  const operatingBlockers = uniqueActionList(input.operatingBlockers);
  const releaseGates = Array.isArray(input.releaseGates) ? input.releaseGates : [];
  const releaseGateFailures = releaseGates
    .filter((gate) => gate.passed !== true)
    .map((gate) => gate.name);
  const categories = input.scorecard
    .map((item) => {
      const blockerReason = item.blocker?.reason || item.knownGaps?.[0] || null;
      return {
        category: item.category,
        score: item.score,
        status: classifyWorldClassCategory(item),
        scoreGapTo95: Math.max(0, input.worldClassThreshold - item.score),
        nextAction: item.blocker?.nextAction || item.nextAction || 'Collect stronger evidence and rerun the scorecard.',
        blockerReason,
        evidenceCount: item.evidence?.length ?? 0,
      };
    })
    .sort((a, b) => {
      if (b.scoreGapTo95 !== a.scoreGapTo95) return b.scoreGapTo95 - a.scoreGapTo95;
      return a.category.localeCompare(b.category);
    });

  const categoriesAtOrAbove95 = categories.filter((item) => item.score >= input.worldClassThreshold).length;
  const categoriesBelow95 = categories.filter((item) => item.score < input.worldClassThreshold).length;
  const categoriesBelow85 = categories.filter((item) => item.score < 85).length;
  const maxScoreGapTo95 = categories.reduce((max, item) => Math.max(max, item.scoreGapTo95), 0);

  const blockerActions = operatingBlockers.map(actionForOperatingBlocker);
  const ragEvalPreflight = input.ragEvalMissingPreflight ?? null;
  const ragEvalRecoveryPlan = input.ragEvalRecoveryPlan ?? null;
  const proofSourceRecoveryPlan = input.proofSourceRecoveryPlan ?? null;
  const gatewayOperatingPacket = input.gatewayOperatingPacket ?? null;
  const gatewayReadyForFreshMessageAction = gatewayOperatingPacket?.status === 'ready_for_fresh_message'
    ? gatewayOperatingPacket.nextActions?.[0] ?? 'Post one fresh non-bot member message, then rerun gateway capture diagnosis and the gateway operating packet.'
    : null;
  const adjustedBlockerActions = blockerActions.map((action) => (
    gatewayReadyForFreshMessageAction && action.includes('gateway worker')
      ? gatewayReadyForFreshMessageAction
      : action
  ));
  const ragEvalActions = releaseGateFailures.some((failure) => failure.includes('rag_eval'))
    ? [
        'Run npm run rag:evaluate:recovery-plan to review the local missing/failed eval backlog before any approved eval execution.',
        'Run npm run rag:evaluate:missing-preflight before any approved missing-eval execution to confirm local source coverage is still ready.',
        (ragEvalRecoveryPlan?.approvedCommand ?? ragEvalPreflight?.approvedCommand)
          ? `With explicit approval, run ${ragEvalRecoveryPlan?.approvedCommand ?? ragEvalPreflight?.approvedCommand} to close missing RAG eval coverage.`
          : 'With explicit approval, run the missing RAG eval command after confirming the execution packet.',
      ]
    : [];
  const gatewayOperatingActions = gatewayReadyForFreshMessageAction
    ? [gatewayReadyForFreshMessageAction]
    : [];
  const proofRecoveryActions = proofSourceRecoveryPlan?.totalShortfall
    ? [
        'Run npm run discord:proof-source-scan, then npm run discord:proof-source-recovery-plan to refresh source-volume blockers.',
        proofSourceRecoveryPlan.nextLaneKey
          ? `Work the next proof lane: ${proofSourceRecoveryPlan.nextLaneKey}.`
          : 'Work the next blocked proof-source lane from the recovery plan.',
      ]
    : [];
  const categoryActions = categories
    .filter((item) => item.score < input.worldClassThreshold)
    .slice(0, 8)
    .map((item) => item.nextAction);
  const immediateActionOrder = uniqueActionList([
    ...ragEvalActions,
    ...gatewayOperatingActions,
    ...proofRecoveryActions,
    ...adjustedBlockerActions,
    ...categoryActions,
  ]);
  const guardedRagEvalCommand = ragEvalRecoveryPlan?.approvedCommand ?? ragEvalPreflight?.approvedCommand ?? null;
  const actionPlan = {
    localOnlyCommands: uniqueValues([
      releaseGateFailures.some((failure) => failure.includes('rag_eval')) ? 'npm run rag:evaluate:recovery-plan' : null,
      releaseGateFailures.some((failure) => failure.includes('rag_eval')) ? 'npm run rag:evaluate:missing-preflight' : null,
      gatewayOperatingPacket ? 'npm run discord:gateway-capture-diagnosis && npm run discord:gateway-operating-packet' : null,
      proofSourceRecoveryPlan?.totalShortfall ? 'npm run discord:proof-source-scan && npm run discord:proof-source-recovery-plan' : null,
      'npm run discord:proof-backlog && npm run discord:proof-candidate-audit',
      'npm run discord:world-class-readiness && npm run discord:operator-brief && npm run verify:local:evidence',
    ]),
    explicitApprovalCommands: uniqueValues([
      guardedRagEvalCommand,
      proofSourceRecoveryPlan?.totalShortfall ? 'npm run discord:operating-cycle' : null,
    ]),
    liveOperatorActions: uniqueActionList([
      ...gatewayOperatingActions,
      ...adjustedBlockerActions,
    ]),
  };

  return {
    ok: true,
    version: 'world-class-readiness-v1',
    generatedAt: input.generatedAt,
    releaseDecision: input.worldClassEligible && releaseGateFailures.length === 0
      ? 'eligible_for_world_class_claim'
      : 'do_not_claim_world_class',
    averageScore: input.averageScore,
    worldClassThreshold: input.worldClassThreshold,
    worldClassEligible: input.worldClassEligible,
    mutationMode: 'local_file_evidence_only',
    summary: {
      categoryCount: categories.length,
      categoriesAtOrAbove95,
      categoriesBelow95,
      categoriesBelow85,
      maxScoreGapTo95,
      operatingBlockers,
      releaseGateCount: releaseGates.length,
      releaseGatesPassed: releaseGates.filter((gate) => gate.passed === true).length,
      releaseGateFailures,
    },
    ragEvalMissingPreflight: {
      status: ragEvalPreflight?.status ?? 'missing',
      ok: ragEvalPreflight?.ok === true,
      missingEvalCount: ragEvalPreflight?.missingEvalCount ?? 0,
      readyForApprovedEvalCount: ragEvalPreflight?.readyForApprovedEvalCount ?? 0,
      selectedMatchesCoverage: ragEvalPreflight?.selectedMatchesCoverage === true,
      approvedCommand: ragEvalPreflight?.approvedCommand ?? null,
      releaseMeaning: ragEvalPreflight?.releaseMeaning ?? null,
    },
    ragEvalRecoveryPlan: {
      status: ragEvalRecoveryPlan?.status ?? 'missing',
      ok: ragEvalRecoveryPlan?.ok === true,
      missingEvalCount: ragEvalRecoveryPlan?.missingEvalCount ?? 0,
      readyMissingEvalCount: ragEvalRecoveryPlan?.readyMissingEvalCount ?? 0,
      failedEvalCount: ragEvalRecoveryPlan?.failedEvalCount ?? 0,
      approvedCommand: ragEvalRecoveryPlan?.approvedCommand ?? null,
      releaseMeaning: ragEvalRecoveryPlan?.releaseMeaning ?? null,
    },
    proofSourceRecoveryPlan: {
      status: proofSourceRecoveryPlan?.status ?? 'missing',
      ok: proofSourceRecoveryPlan?.ok === true,
      totalShortfall: proofSourceRecoveryPlan?.totalShortfall ?? 0,
      blockedLaneCount: proofSourceRecoveryPlan?.blockedLaneCount ?? 0,
      nextLaneKey: proofSourceRecoveryPlan?.nextLaneKey ?? null,
      releaseMeaning: proofSourceRecoveryPlan?.releaseMeaning ?? null,
    },
    gatewayOperatingPacket: {
      status: gatewayOperatingPacket?.status ?? 'missing',
      current: gatewayOperatingPacket?.current ?? 0,
      target: gatewayOperatingPacket?.target ?? 1,
      remaining: gatewayOperatingPacket?.remaining ?? 1,
      usableMessageState: gatewayOperatingPacket?.usableMessageState ?? null,
      messageContentEnabled: gatewayOperatingPacket?.messageContentEnabled ?? null,
      messageContentSignalSource: gatewayOperatingPacket?.messageContentSignalSource ?? null,
      heartbeatFresh: gatewayOperatingPacket?.heartbeatFresh === true,
      workerId: gatewayOperatingPacket?.workerId ?? null,
      nextActions: gatewayOperatingPacket?.nextActions ?? [],
      releaseMeaning: gatewayOperatingPacket?.releaseMeaning ?? null,
    },
    immediateActionOrder,
    actionPlan,
    operatingProofRequired: input.requiredOperatingProof,
    categories,
  };
}

export function validateWorldClassReadinessReport(report: WorldClassReadinessReport): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  const releaseGateFailures = report.summary.releaseGateFailures ?? [];
  const categories = report.categories ?? [];
  const categoriesBelowThreshold = categories.filter((category) => category.score < report.worldClassThreshold);

  if (report.ok !== true) failures.push('report_not_ok');
  if (report.version !== 'world-class-readiness-v1') failures.push('invalid_version');
  if (report.mutationMode !== 'local_file_evidence_only') failures.push('invalid_mutation_mode');
  if (report.summary.categoryCount !== categories.length) failures.push('category_count_mismatch');
  if (report.summary.categoriesBelow95 !== categoriesBelowThreshold.length) failures.push('categories_below_threshold_mismatch');
  if (report.summary.releaseGateFailures.length !== report.summary.releaseGateCount - report.summary.releaseGatesPassed) {
    failures.push('release_gate_count_mismatch');
  }

  if (releaseGateFailures.length > 0 && report.releaseDecision === 'eligible_for_world_class_claim') {
    failures.push('eligible_despite_release_gate_failures');
  }
  if (categoriesBelowThreshold.length > 0 && report.releaseDecision === 'eligible_for_world_class_claim') {
    failures.push('eligible_despite_categories_below_threshold');
  }
  if (report.summary.operatingBlockers.length > 0 && report.releaseDecision === 'eligible_for_world_class_claim') {
    failures.push('eligible_despite_operating_blockers');
  }
  if (report.releaseDecision === 'eligible_for_world_class_claim' && report.worldClassEligible !== true) {
    failures.push('eligible_decision_without_scorecard_eligibility');
  }
  if (report.releaseDecision === 'eligible_for_world_class_claim' && report.averageScore < report.worldClassThreshold) {
    failures.push('eligible_decision_with_average_below_threshold');
  }

  const ragGateFailed = releaseGateFailures.some((failure) => failure.includes('rag_eval'));
  if (ragGateFailed) {
    if (report.ragEvalMissingPreflight.ok !== true) failures.push('missing_rag_eval_preflight');
    if (report.ragEvalMissingPreflight.selectedMatchesCoverage !== true) failures.push('rag_eval_preflight_keys_do_not_match_coverage');
    if (report.ragEvalMissingPreflight.missingEvalCount !== report.ragEvalMissingPreflight.readyForApprovedEvalCount) {
      failures.push('rag_eval_preflight_not_ready_for_all_missing_keys');
    }
    if (!report.ragEvalMissingPreflight.approvedCommand?.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved')) {
      failures.push('rag_eval_preflight_missing_guarded_approved_command');
    }
    if (!report.ragEvalMissingPreflight.releaseMeaning?.includes('does not')) {
      failures.push('rag_eval_preflight_missing_non_claim_disclaimer');
    }
    if (report.ragEvalRecoveryPlan.ok !== true) failures.push('missing_rag_eval_recovery_plan');
    if (report.ragEvalRecoveryPlan.missingEvalCount !== report.ragEvalRecoveryPlan.readyMissingEvalCount) {
      failures.push('rag_eval_recovery_not_ready_for_all_missing_keys');
    }
    if (!report.ragEvalRecoveryPlan.approvedCommand?.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved')) {
      failures.push('rag_eval_recovery_missing_guarded_approved_command');
    }
  }

  if (report.proofSourceRecoveryPlan.totalShortfall > 0) {
    if (report.proofSourceRecoveryPlan.ok !== true) failures.push('missing_proof_source_recovery_plan');
    if (report.proofSourceRecoveryPlan.blockedLaneCount < 1) failures.push('proof_source_recovery_missing_blocked_lanes');
    if (!report.proofSourceRecoveryPlan.releaseMeaning?.includes('does not')) {
      failures.push('proof_source_recovery_missing_non_claim_disclaimer');
    }
  }

  if (report.gatewayOperatingPacket.status === 'ready_for_fresh_message') {
    if (report.gatewayOperatingPacket.messageContentEnabled !== true) failures.push('gateway_ready_without_message_content_signal');
    if (report.gatewayOperatingPacket.heartbeatFresh !== true) failures.push('gateway_ready_without_fresh_heartbeat');
    if (report.gatewayOperatingPacket.remaining < 1) failures.push('gateway_ready_without_remaining_target');
    if (!report.gatewayOperatingPacket.nextActions.some((action) => action.includes('fresh non-bot member message'))) {
      failures.push('gateway_ready_missing_fresh_message_action');
    }
    if (!report.gatewayOperatingPacket.releaseMeaning?.includes('does not')) {
      failures.push('gateway_packet_missing_non_claim_disclaimer');
    }
  }

  if (report.summary.operatingBlockers.length > 0 && report.immediateActionOrder.length === 0) {
    failures.push('operating_blockers_without_immediate_actions');
  }
  if (report.summary.operatingBlockers.length > 0) {
    if (!report.actionPlan?.localOnlyCommands?.some((command) => command.includes('discord:proof-backlog'))) {
      failures.push('action_plan_missing_safe_local_backlog_command');
    }
    if (!report.actionPlan?.liveOperatorActions?.length) {
      failures.push('action_plan_missing_live_operator_actions');
    }
  }
  if (ragGateFailed && !report.actionPlan?.explicitApprovalCommands?.some((command) => command.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved'))) {
    failures.push('action_plan_missing_guarded_rag_eval_command');
  }
  if (report.actionPlan?.localOnlyCommands?.some((command) => command.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved') || command.includes('discord:operating-cycle'))) {
    failures.push('action_plan_local_commands_include_mutating_command');
  }
  if (categoriesBelowThreshold.some((category) => category.evidenceCount < 1)) {
    failures.push('category_below_threshold_missing_evidence_reference');
  }

  return {
    ok: failures.length === 0,
    failures,
  };
}
