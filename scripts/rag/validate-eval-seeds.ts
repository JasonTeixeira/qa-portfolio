import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  collectLocalRagEvalSourceTitles,
  validateRagEvalSeeds,
} from '../../lib/rag/eval-seed-validation';

async function main() {
  const startedAt = new Date().toISOString();
  const knownSources = await collectLocalRagEvalSourceTitles();
  const validation = validateRagEvalSeeds({ knownSources });
  const evidence = {
    ...validation,
    startedAt,
    finishedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
  };

  const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'rag');
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(path.join(evidenceDir, 'eval-seed-quality.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));
  if (!validation.ok) process.exit(1);
}

main().catch(async (error) => {
  const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'rag');
  await mkdir(evidenceDir, { recursive: true });
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await writeFile(path.join(evidenceDir, 'eval-seed-quality.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
});
