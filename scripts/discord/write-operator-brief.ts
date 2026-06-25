import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const evidenceRoot = path.join(root, 'docs', 'evidence', 'engineering-loop');
const scorecardPath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-20-final-scorecard.json');
const operatingCyclePath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-21-operating-proof-cycle.json');
const proofBacklogPath = path.join(evidenceRoot, 'discord-proof-backlog-latest.json');
const readinessPath = path.join(evidenceRoot, 'world-class-readiness-latest.json');
const proofRehearsalPath = path.join(evidenceRoot, 'proof-rehearsal-readiness-latest.json');
const jsonOutputPath = path.join(evidenceRoot, 'discord-operator-brief-latest.json');
const markdownOutputPath = path.join(evidenceRoot, 'discord-operator-brief-latest.md');

async function readJsonFile(filePath: string): Promise<any> {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function linesForLane(lane: any): string[] {
  return [
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
  ];
}

function renderMarkdown(brief: any): string {
  const blockedLanes = brief.proofLanes.filter((lane: any) => lane.status === 'blocked');
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
    blockedLanes.length ? blockedLanes.flatMap(linesForLane).join('\n') : 'No blocked proof lanes.',
    '## Required Command Order',
    '',
    ...brief.commandOrder.map((command: string, index: number) => `${index + 1}. \`${command}\``),
    '',
    '## Non-Claim Rule',
    '',
    brief.nonClaimRule,
    '',
  ].join('\n');
}

async function main() {
  const [scorecard, operatingCycle, proofBacklog, readiness, proofRehearsal] = await Promise.all([
    readJsonFile(scorecardPath),
    readJsonFile(operatingCyclePath),
    readJsonFile(proofBacklogPath),
    readJsonFile(readinessPath),
    readJsonFile(proofRehearsalPath),
  ]);
  const blockedLanes = proofBacklog.lanes.filter((lane: any) => lane.status === 'blocked');
  const commandOrder = Array.from(new Set([
    ...proofBacklog.weeklyChecklist.map((step: any) => step.safeLocalCommand).filter(Boolean),
    ...proofBacklog.weeklyChecklist.map((step: any) => step.liveCommand).filter(Boolean),
    'npm run rag:evaluate',
    'npm run discord:smoke-final-scorecard',
    'npm run discord:world-class-readiness',
    'npm run discord:proof-backlog',
  ]));
  const brief = {
    ok: true,
    version: 'discord-operator-brief-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    releaseDecision: readiness.releaseDecision ?? 'do_not_claim_world_class',
    averageScore: scorecard.averageScore ?? scorecard.summary?.averageScore ?? null,
    worldClassEligible: Boolean(scorecard.worldClassEligible ?? scorecard.summary?.worldClassEligible),
    currentReality: operatingCycle.status === 'blocked'
      ? 'The local system is verified, but real operating proof is still missing. Close the blocked proof lanes with real approved community activity before claiming 95+.'
      : 'The latest operating cycle passed. Keep running weekly proof and scorecard checks.',
    blockedLaneCount: blockedLanes.length,
    proofLanes: proofBacklog.lanes,
    weeklyChecklist: proofBacklog.weeklyChecklist,
    proofRehearsal: {
      ok: proofRehearsal.ok === true,
      laneCount: Array.isArray(proofRehearsal.lanes) ? proofRehearsal.lanes.length : 0,
      releaseMeaning: proofRehearsal.releaseMeaning,
    },
    commandOrder,
    nonClaimRule: 'Do not claim world-class, 95+, production-complete, or operating-proof complete until every proof backlog lane is passed from real operating data and the final scorecard is rerun.',
  };

  await mkdir(evidenceRoot, { recursive: true });
  await writeFile(jsonOutputPath, `${JSON.stringify(brief, null, 2)}\n`);
  await writeFile(markdownOutputPath, renderMarkdown(brief));
  console.log(`Wrote ${path.relative(root, jsonOutputPath)} and ${path.relative(root, markdownOutputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
