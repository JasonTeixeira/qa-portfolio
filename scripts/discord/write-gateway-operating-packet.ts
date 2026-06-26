import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildGatewayOperatingPacket,
  renderGatewayOperatingPacketMarkdown,
  validateGatewayOperatingPacket,
  type GatewayCaptureDiagnosisEvidence,
} from '@/lib/discord/gateway-operating-packet';

const root = process.cwd();
const diagnosisPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-gateway-capture-diagnosis-latest.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'gateway-operating-packet-latest.json');
const markdownPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'gateway-operating-packet-latest.md');

async function main() {
  const diagnosis = await readJson<GatewayCaptureDiagnosisEvidence>(diagnosisPath);
  const packet = buildGatewayOperatingPacket({
    generatedAt: new Date().toISOString(),
    diagnosis,
  });
  const validation = validateGatewayOperatingPacket(packet);
  const evidence = {
    ...packet,
    validation,
    ok: packet.ok && validation.ok,
    failures: [...packet.failures, ...validation.failures],
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  await writeFile(markdownPath, renderGatewayOperatingPacketMarkdown(evidence), 'utf8');
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
