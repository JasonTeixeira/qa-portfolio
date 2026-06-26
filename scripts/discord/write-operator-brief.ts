import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildDiscordOperatorBrief,
  renderDiscordOperatorBriefMarkdown,
  validateDiscordOperatorBrief,
} from '@/lib/discord/operator-brief';

const root = process.cwd();
const evidenceRoot = path.join(root, 'docs', 'evidence', 'engineering-loop');
const scorecardPath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-20-final-scorecard.json');
const operatingCyclePath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-21-operating-proof-cycle.json');
const proofBacklogPath = path.join(evidenceRoot, 'discord-proof-backlog-latest.json');
const proofSourceRecoveryPlanPath = path.join(evidenceRoot, 'discord-proof-source-recovery-plan-latest.json');
const readinessPath = path.join(evidenceRoot, 'world-class-readiness-latest.json');
const proofRehearsalPath = path.join(evidenceRoot, 'proof-rehearsal-readiness-latest.json');
const gatewayCapturePath = path.join(evidenceRoot, 'discord-gateway-capture-diagnosis-latest.json');
const jsonOutputPath = path.join(evidenceRoot, 'discord-operator-brief-latest.json');
const markdownOutputPath = path.join(evidenceRoot, 'discord-operator-brief-latest.md');

async function readJsonFile(filePath: string): Promise<any> {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function main() {
  const [scorecard, operatingCycle, proofBacklog, proofSourceRecoveryPlan, readiness, proofRehearsal, gatewayCapture] = await Promise.all([
    readJsonFile(scorecardPath),
    readJsonFile(operatingCyclePath),
    readJsonFile(proofBacklogPath),
    readJsonFile(proofSourceRecoveryPlanPath),
    readJsonFile(readinessPath),
    readJsonFile(proofRehearsalPath),
    readJsonFile(gatewayCapturePath),
  ]);
  const brief = buildDiscordOperatorBrief({
    generatedAt: new Date().toISOString(),
    scorecard,
    operatingCycle,
    proofBacklog,
    proofSourceRecoveryPlan,
    readiness,
    proofRehearsal,
    gatewayCapture,
  });
  const validation = validateDiscordOperatorBrief(brief);
  if (!validation.ok) {
    throw new Error(`Operator brief validation failed: ${validation.failures.join(', ')}`);
  }

  await mkdir(evidenceRoot, { recursive: true });
  await writeFile(jsonOutputPath, `${JSON.stringify(brief, null, 2)}\n`);
  await writeFile(markdownOutputPath, renderDiscordOperatorBriefMarkdown(brief));
  console.log(`Wrote ${path.relative(root, jsonOutputPath)} and ${path.relative(root, markdownOutputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
