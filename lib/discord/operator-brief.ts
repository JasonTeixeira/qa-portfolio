import type { DiscordProofBacklogReport } from './proof-backlog';

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
  readiness: {
    releaseDecision?: string | null;
  };
  proofRehearsal: {
    ok?: boolean | null;
    lanes?: unknown[] | null;
    releaseMeaning?: string | null;
  };
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
  proofRehearsal: {
    ok: boolean;
    laneCount: number;
    releaseMeaning: string | null;
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
  const commandOrder = uniqueCommands([
    ...input.proofBacklog.weeklyChecklist.map((step) => step.safeLocalCommand),
    ...input.proofBacklog.weeklyChecklist.map((step) => step.liveCommand),
    'npm run rag:evaluate',
    'npm run discord:smoke-final-scorecard',
    'npm run discord:world-class-readiness',
    'npm run discord:proof-backlog',
    'npm run discord:operator-brief',
    'npm run discord:content-factory-readiness',
  ]);
  return {
    ok: true,
    version: 'discord-operator-brief-v1',
    generatedAt: input.generatedAt,
    mutationMode: 'local_file_evidence_only',
    releaseDecision: input.readiness.releaseDecision ?? 'do_not_claim_world_class',
    averageScore: input.scorecard.averageScore ?? input.scorecard.summary?.averageScore ?? null,
    worldClassEligible: Boolean(input.scorecard.worldClassEligible ?? input.scorecard.summary?.worldClassEligible),
    currentReality: input.operatingCycle.status === 'blocked'
      ? 'The local system is verified, but real operating proof is still missing. Close the blocked proof lanes with real approved community activity before claiming 95+.'
      : 'The latest operating cycle passed. Keep running weekly proof and scorecard checks.',
    blockedLaneCount: blockedLanes.length,
    proofLanes: input.proofBacklog.lanes,
    weeklyChecklist: input.proofBacklog.weeklyChecklist,
    proofRehearsal: {
      ok: input.proofRehearsal.ok === true,
      laneCount: Array.isArray(input.proofRehearsal.lanes) ? input.proofRehearsal.lanes.length : 0,
      releaseMeaning: input.proofRehearsal.releaseMeaning ?? null,
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
  if (!brief.commandOrder.includes('npm run discord:content-factory-readiness')) failures.push('missing_content_factory_readiness_command');
  if (blockedLanes.length > 0 && !brief.currentReality.includes('real operating proof is still missing')) failures.push('blocked_reality_not_explicit');
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
