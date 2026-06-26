import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildDiscordProofSourceRecoveryPlan,
  renderDiscordProofSourceRecoveryPlanMarkdown,
  validateDiscordProofSourceRecoveryPlan,
  type DiscordProofSourceVolumeScanEvidence,
} from '@/lib/discord/proof-source-recovery-plan';

const root = process.cwd();
const scanPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-volume-scan-latest.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-recovery-plan-latest.json');
const markdownPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-recovery-plan-latest.md');

async function main() {
  const scan = JSON.parse(await readFile(scanPath, 'utf8')) as DiscordProofSourceVolumeScanEvidence;
  const plan = buildDiscordProofSourceRecoveryPlan({
    generatedAt: new Date().toISOString(),
    scan,
  });
  const validation = validateDiscordProofSourceRecoveryPlan(plan);
  const evidence = {
    ...plan,
    validation,
    ok: plan.ok && validation.ok,
    failures: validation.failures,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  await writeFile(markdownPath, renderDiscordProofSourceRecoveryPlanMarkdown(plan), 'utf8');
  console.log(`Wrote ${path.relative(root, outputPath)} and ${path.relative(root, markdownPath)}`);
  if (!evidence.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
