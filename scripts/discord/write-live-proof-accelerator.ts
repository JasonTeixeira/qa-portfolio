import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildDiscordLiveProofAccelerator,
  renderDiscordLiveProofAcceleratorMarkdown,
} from '@/lib/discord/live-proof-accelerator';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const jsonPath = path.join(evidenceDir, 'discord-live-proof-accelerator-latest.json');
const mdPath = path.join(evidenceDir, 'discord-live-proof-accelerator-latest.md');

async function readJson(relativePath: string): Promise<any | null> {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  const [proofSourceVolumeScan, gatewayOperatingPacket, knowledgeReviewQueue] = await Promise.all([
    readJson('docs/evidence/engineering-loop/discord-proof-source-volume-scan-latest.json'),
    readJson('docs/evidence/engineering-loop/gateway-operating-packet-latest.json'),
    readJson('docs/evidence/engineering-loop/discord-knowledge-review-queue-latest.json'),
  ]);

  const report = buildDiscordLiveProofAccelerator({
    generatedAt: new Date().toISOString(),
    proofSourceVolumeScan,
    gatewayOperatingPacket,
    knowledgeReviewQueue,
  });

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(mdPath, renderDiscordLiveProofAcceleratorMarkdown(report));
  console.log(JSON.stringify({
    ok: report.ok,
    status: report.status,
    blockedLaneCount: report.summary.blockedLaneCount,
    nextBestLane: report.summary.nextBestLane,
    nextBestAction: report.summary.nextBestAction,
    evidencePath: path.relative(root, jsonPath),
    markdownPath: path.relative(root, mdPath),
    failures: report.failures,
  }, null, 2));
  if (!report.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
