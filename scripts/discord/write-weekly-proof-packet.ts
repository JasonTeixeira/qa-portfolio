import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import type { DiscordProofBacklogReport } from '@/lib/discord/proof-backlog';
import type { DiscordProofIntakeReadinessReport } from '@/lib/discord/proof-intake-readiness';
import {
  buildDiscordWeeklyProofPacket,
  renderDiscordWeeklyProofPacketMarkdown,
  validateDiscordWeeklyProofPacket,
} from '@/lib/discord/weekly-proof-packet';

const root = process.cwd();
const backlogPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-backlog-latest.json');
const intakePath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-intake-readiness-latest.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-weekly-proof-packet-latest.json');
const markdownPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-weekly-proof-packet-latest.md');

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, 'utf8')) as T;
}

async function main() {
  const [backlog, intake] = await Promise.all([
    readJson<DiscordProofBacklogReport>(backlogPath),
    readJson<DiscordProofIntakeReadinessReport>(intakePath),
  ]);

  const packet = buildDiscordWeeklyProofPacket({
    generatedAt: new Date().toISOString(),
    backlog,
    intake,
  });
  const validation = validateDiscordWeeklyProofPacket(packet);
  const evidence = {
    ...packet,
    validation,
    ok: packet.ok && validation.ok,
    failures: [...packet.failures, ...validation.failures],
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  await writeFile(markdownPath, renderDiscordWeeklyProofPacketMarkdown(evidence), 'utf8');
  console.log(`Wrote ${path.relative(root, outputPath)} and ${path.relative(root, markdownPath)}`);
  if (!evidence.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
