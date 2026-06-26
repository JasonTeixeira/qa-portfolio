export type OperatingCycleMetrics = {
  approvedDiscordKnowledgeSources: number;
  ragDiscordSources: number;
  pendingKnowledgeCandidates: number;
  pendingPublicDrafts: number;
  publishedPublicDrafts: number;
  approvedMembers: number;
  onboardedMembers: number;
  activeMembers7d: number;
  premiumMembers: number;
  premiumWorkflowProofs: number;
  applicationsSubmitted: number;
  applicationsApproved: number;
  publicProofApplyClicks: number;
};

export type OperatingCycleGate = {
  name: string;
  passed: boolean;
  evidence: string;
  nextAction?: string;
};

export const OPERATING_CYCLE_APPROVED_KNOWLEDGE_TARGET = 10;
export const OPERATING_CYCLE_RAG_DISCORD_SOURCE_TARGET = 10;
export const OPERATING_CYCLE_APPLICATION_ACTIVITY_TARGET = 1;
export const OPERATING_CYCLE_PUBLIC_PROOF_ASSET_TARGET = 4;

export function buildOperatingCycleKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const day = Math.floor((Number(date) - Number(start)) / 86_400_000) + 1;
  const week = Math.ceil((day + start.getUTCDay()) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function operatingCycleGates(input: {
  metrics: OperatingCycleMetrics;
  ragSyncOk: boolean;
  publicDraftCreated: boolean;
  finalScorecardAverage: number | null;
  finalScorecardBlockedBelow95: string[];
}): OperatingCycleGate[] {
  return [
    {
      name: 'approved_knowledge_available',
      passed: input.metrics.approvedDiscordKnowledgeSources >= OPERATING_CYCLE_APPROVED_KNOWLEDGE_TARGET,
      evidence: `${input.metrics.approvedDiscordKnowledgeSources}/${OPERATING_CYCLE_APPROVED_KNOWLEDGE_TARGET} approved Discord knowledge sources available`,
      nextAction: 'Approve high-signal questions, helpful answers, resources, wins, or content queue items.',
    },
    {
      name: 'approved_knowledge_synced_to_rag',
      passed: input.ragSyncOk && input.metrics.ragDiscordSources >= OPERATING_CYCLE_RAG_DISCORD_SOURCE_TARGET,
      evidence: `${input.metrics.ragDiscordSources}/${OPERATING_CYCLE_RAG_DISCORD_SOURCE_TARGET} Discord RAG sources after sync`,
      nextAction: 'Run approved Discord RAG sync after weekly approvals.',
    },
    {
      name: 'public_proof_draft_created',
      passed: input.metrics.pendingPublicDrafts + input.metrics.publishedPublicDrafts >= OPERATING_CYCLE_PUBLIC_PROOF_ASSET_TARGET,
      evidence: `${input.metrics.pendingPublicDrafts + input.metrics.publishedPublicDrafts}/${OPERATING_CYCLE_PUBLIC_PROOF_ASSET_TARGET} public proof drafts or published assets (${input.metrics.pendingPublicDrafts} pending / ${input.metrics.publishedPublicDrafts} published)`,
      nextAction: 'Create four privacy-gated weekly public proof drafts from approved source material.',
    },
    {
      name: 'growth_metrics_tracked',
      passed: input.metrics.applicationsSubmitted >= OPERATING_CYCLE_APPLICATION_ACTIVITY_TARGET
        && input.metrics.publicProofApplyClicks >= OPERATING_CYCLE_APPLICATION_ACTIVITY_TARGET
        && input.metrics.applicationsApproved >= 0
        && input.metrics.approvedMembers > 0
        && input.metrics.activeMembers7d > 0
        && input.metrics.premiumMembers >= 0,
      evidence: `${input.metrics.publicProofApplyClicks}/${OPERATING_CYCLE_APPLICATION_ACTIVITY_TARGET} public proof apply clicks / ${input.metrics.applicationsSubmitted}/${OPERATING_CYCLE_APPLICATION_ACTIVITY_TARGET} applications / ${input.metrics.applicationsApproved} approved / ${input.metrics.approvedMembers} members / ${input.metrics.activeMembers7d} active 7d / ${input.metrics.premiumMembers} premium / ${input.metrics.premiumWorkflowProofs} premium workflow proofs`,
      nextAction: 'Run public proof/growth cycles until at least one apply click and one application are attributed while active-member counts remain visible.',
    },
    {
      name: 'final_scorecard_current',
      passed: input.finalScorecardAverage !== null,
      evidence: input.finalScorecardAverage === null
        ? 'No final scorecard found'
        : `average ${input.finalScorecardAverage}, blocked below 95: ${input.finalScorecardBlockedBelow95.join(', ') || 'none'}`,
      nextAction: 'After explicit approval, run SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate and npm run discord:smoke-final-scorecard after the operating proof cycle.',
    },
    {
      name: 'world_class_score_threshold',
      passed: Number(input.finalScorecardAverage ?? 0) >= 95 && input.finalScorecardBlockedBelow95.length === 0,
      evidence: input.finalScorecardAverage === null
        ? 'No final scorecard found'
        : `average ${input.finalScorecardAverage}, blocked below 95: ${input.finalScorecardBlockedBelow95.join(', ') || 'none'}`,
      nextAction: 'Complete four real operating cycles with approved Discord knowledge, public proof, growth metrics, premium fulfillment, and rerun the final scorecard.',
    },
  ];
}

export function operatingCycleStatus(gates: OperatingCycleGate[]): 'passed' | 'blocked' {
  return gates.every((gate) => gate.passed) ? 'passed' : 'blocked';
}

export function operatingCycleNextActions(gates: OperatingCycleGate[]): string[] {
  return gates
    .filter((gate) => !gate.passed && gate.nextAction)
    .map((gate) => gate.nextAction as string);
}
