import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildDiscordContentFactoryReadinessReport,
  validateDiscordContentFactoryReadinessReport,
} from '@/lib/discord/content-factory-readiness';

const root = process.cwd();
const sourcePath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-22-content-factory-dry-run.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'content-factory-readiness-latest.json');

async function main() {
  const sourceEvidence = JSON.parse(await readFile(sourcePath, 'utf8'));
  const report = buildDiscordContentFactoryReadinessReport({
    generatedAt: new Date().toISOString(),
    evidence: sourceEvidence,
  });
  const validation = validateDiscordContentFactoryReadinessReport(report);
  if (!validation.ok) {
    throw new Error(`Content factory readiness validation failed: ${validation.failures.join(', ')}`);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
