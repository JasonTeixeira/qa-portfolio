import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import type { DiscordOperatingProofCycleResult } from '@/lib/discord/operating-proof-cycle';
import type { DiscordProofBacklogReport } from '@/lib/discord/proof-backlog';
import type { DiscordWeeklyProofPacket } from '@/lib/discord/weekly-proof-packet';
import {
  buildDiscordProofCandidateAudit,
  renderDiscordProofCandidateAuditMarkdown,
  validateDiscordProofCandidateAudit,
} from '@/lib/discord/proof-candidate-audit';

const root = process.cwd();
const operatingCyclePath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-21-operating-proof-cycle.json');
const backlogPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-backlog-latest.json');
const weeklyPacketPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-weekly-proof-packet-latest.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-candidate-audit-latest.json');
const markdownPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-candidate-audit-latest.md');

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, 'utf8')) as T;
}

async function main() {
  const [operatingCycle, backlog, weeklyPacket] = await Promise.all([
    readJson<DiscordOperatingProofCycleResult>(operatingCyclePath),
    readJson<DiscordProofBacklogReport>(backlogPath),
    readJson<DiscordWeeklyProofPacket>(weeklyPacketPath),
  ]);

  const audit = buildDiscordProofCandidateAudit({
    generatedAt: new Date().toISOString(),
    operatingCycle,
    backlog,
    weeklyPacket,
  });
  const validation = validateDiscordProofCandidateAudit(audit);
  const evidence = {
    ...audit,
    validation,
    ok: audit.ok && validation.ok,
    failures: [...audit.failures, ...validation.failures],
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  await writeFile(markdownPath, renderDiscordProofCandidateAuditMarkdown(evidence), 'utf8');
  console.log(`Wrote ${path.relative(root, outputPath)} and ${path.relative(root, markdownPath)}`);
  if (!evidence.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
