import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deepSeekChat } from '../../lib/rag/deepseek';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'rag');

async function main() {
  const startedAt = new Date().toISOString();
  const result = await deepSeekChat({
    messages: [
      { role: 'system', content: 'You are a deterministic smoke test responder.' },
      { role: 'user', content: 'Reply with exactly: rag-ok' },
    ],
    temperature: 0,
    maxTokens: 8,
  });

  const ok = result.content.trim().toLowerCase() === 'rag-ok';
  const evidence = {
    ok,
    provider: 'deepseek',
    model: result.model,
    expected: 'rag-ok',
    received: result.content,
    usage: result.usage,
    startedAt,
    finishedAt: new Date().toISOString(),
  };

  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'deepseek-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!ok) process.exit(1);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    provider: 'deepseek',
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'deepseek-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
