import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildDiscordChannelMatrixReadinessReport,
  validateDiscordChannelMatrixReadinessReport,
} from '@/lib/discord/channel-matrix-readiness';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-channel-matrix-readiness-latest.json');

async function main() {
  const report = buildDiscordChannelMatrixReadinessReport({
    generatedAt: new Date().toISOString(),
  });
  const validation = validateDiscordChannelMatrixReadinessReport(report);
  if (!validation.ok) {
    throw new Error(`Discord channel matrix readiness validation failed: ${validation.failures.join(', ')}`);
  }
  const evidence = {
    ...report,
    validation: {
      ...validation,
      validator: 'discord-channel-matrix-readiness-validator-v1',
      validatedAt: new Date().toISOString(),
    },
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
