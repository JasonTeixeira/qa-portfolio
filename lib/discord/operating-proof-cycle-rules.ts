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
};

export type OperatingCycleGate = {
  name: string;
  passed: boolean;
  evidence: string;
  nextAction?: string;
};

export const OPERATING_CYCLE_APPROVED_KNOWLEDGE_TARGET = 10;
export const OPERATING_CYCLE_RAG_DISCORD_SOURCE_TARGET = 10;

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
      passed: input.publicDraftCreated || input.metrics.pendingPublicDrafts > 0,
      evidence: `${input.metrics.pendingPublicDrafts} pending public drafts / ${input.metrics.publishedPublicDrafts} published public drafts`,
      nextAction: 'Create one privacy-gated public proof draft from approved source material.',
    },
    {
      name: 'growth_metrics_tracked',
      passed: input.metrics.applicationsSubmitted >= 0
        && input.metrics.applicationsApproved >= 0
        && input.metrics.approvedMembers >= 0
        && input.metrics.activeMembers7d >= 0
        && input.metrics.premiumMembers >= 0,
      evidence: `${input.metrics.applicationsSubmitted} applications / ${input.metrics.applicationsApproved} approved / ${input.metrics.approvedMembers} members / ${input.metrics.activeMembers7d} active 7d / ${input.metrics.premiumMembers} premium / ${input.metrics.premiumWorkflowProofs} premium workflow proofs`,
    },
    {
      name: 'final_scorecard_current',
      passed: input.finalScorecardAverage !== null,
      evidence: input.finalScorecardAverage === null
        ? 'No final scorecard found'
        : `average ${input.finalScorecardAverage}, blocked below 95: ${input.finalScorecardBlockedBelow95.join(', ') || 'none'}`,
      nextAction: 'Run npm run rag:evaluate and npm run discord:smoke-final-scorecard after operating proof cycle.',
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
