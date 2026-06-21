import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { embedTextLocal } from '../../lib/rag/embeddings';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'rag');

async function main() {
  const startedAt = new Date().toISOString();
  const result = await embedTextLocal('RAG smoke test for local education Discord search.');
  const magnitude = Math.sqrt(result.vector.reduce((sum, value) => sum + value * value, 0));
  const evidence = {
    ok: result.dimensions === 384 && magnitude > 0.99 && magnitude < 1.01,
    provider: 'local',
    model: result.model,
    dimensions: result.dimensions,
    normalizedMagnitude: Number(magnitude.toFixed(6)),
    sampleFirstFive: result.vector.slice(0, 5).map((value) => Number(value.toFixed(6))),
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'local-embeddings-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exit(1);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    provider: 'local',
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'local-embeddings-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
