import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { buildDiscordProofBacklogReport } from '@/lib/discord/proof-backlog';
import type { OperatingCycleMetrics } from '@/lib/discord/operating-proof-cycle-rules';

const root = process.cwd();
const operatingCyclePath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-21-operating-proof-cycle.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-backlog-latest.json');

async function main() {
  const operatingCycle = JSON.parse(await readFile(operatingCyclePath, 'utf8'));
  const metrics = operatingCycle.metricsAfter ?? operatingCycle.metricsBefore;
  if (!metrics) {
    throw new Error('Operating cycle evidence is missing metrics.');
  }

  const report = buildDiscordProofBacklogReport({
    generatedAt: new Date().toISOString(),
    metrics: metrics as OperatingCycleMetrics,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
