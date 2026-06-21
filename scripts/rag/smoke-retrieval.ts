import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { retrieveRagChunks } from '../../lib/rag/retrieval';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'rag');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const query = process.argv.slice(2).join(' ').trim() || 'How should we onboard Discord members and keep the community high quality?';
  const startedAt = new Date().toISOString();
  const results = await retrieveRagChunks(sb, query, { limit: 5 });
  const evidence = {
    ok: results.length > 0 && results.some((result) => result.vector_score > 0),
    query,
    resultCount: results.length,
    topResults: results.map((result) => ({
      chunk_id: result.chunk_id,
      title: result.title,
      source_type: result.source_type,
      source_url: result.source_url,
      vector_score: Number(result.vector_score.toFixed(6)),
      keyword_score: Number(result.keyword_score.toFixed(6)),
      hybrid_score: Number(result.hybrid_score.toFixed(6)),
    })),
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'retrieval-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exit(1);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'retrieval-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
