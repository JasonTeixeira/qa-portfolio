import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildApprovedKnowledgeOperatingPacket,
  renderApprovedKnowledgeOperatingPacketMarkdown,
  validateApprovedKnowledgeOperatingPacket,
} from '@/lib/discord/approved-knowledge-operating-packet';
import type { DiscordProofSourceRecoveryPlan, DiscordProofSourceVolumeScanEvidence } from '@/lib/discord/proof-source-recovery-plan';

const root = process.cwd();
const scanPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-volume-scan-latest.json');
const recoveryPlanPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-recovery-plan-latest.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'approved-knowledge-operating-packet-latest.json');
const markdownPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'approved-knowledge-operating-packet-latest.md');

async function main() {
  const [scan, recoveryPlan] = await Promise.all([
    readJson<DiscordProofSourceVolumeScanEvidence>(scanPath),
    readJson<DiscordProofSourceRecoveryPlan>(recoveryPlanPath),
  ]);
  const packet = buildApprovedKnowledgeOperatingPacket({
    generatedAt: new Date().toISOString(),
    scan,
    recoveryPlan,
  });
  const validation = validateApprovedKnowledgeOperatingPacket(packet);
  const evidence = {
    ...packet,
    validation,
    ok: packet.ok && validation.ok,
    failures: [...packet.failures, ...validation.failures],
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  await writeFile(markdownPath, renderApprovedKnowledgeOperatingPacketMarkdown(evidence), 'utf8');
  console.log(`Wrote ${path.relative(root, outputPath)} and ${path.relative(root, markdownPath)}`);
  if (!evidence.ok) process.exitCode = 1;
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
