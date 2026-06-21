import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { embedTextLocal, LOCAL_EMBEDDING_DIMENSIONS, LOCAL_EMBEDDING_MODEL, vectorToSql } from '../../lib/rag/embeddings';

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
  const startedAt = new Date().toISOString();
  const runKey = `rag-local-embed-${startedAt.replace(/[:.]/g, '-')}`;
  const { data: run, error: runError } = await sb.from('rag_ingestion_runs').insert({
    run_key: runKey,
    status: 'running',
    source_types: ['rag_chunks'],
    metadata: {
      phase: 'phase_3_local_embeddings',
      embedding_provider: 'local',
      embedding_model: LOCAL_EMBEDDING_MODEL,
      dimensions: LOCAL_EMBEDDING_DIMENSIONS,
    },
  }).select('id').single();
  if (runError) throw runError;

  let status: 'completed' | 'failed' = 'completed';
  let error: string | null = null;
  const stats = {
    chunksSeen: 0,
    chunksEmbedded: 0,
    chunksSkipped: 0,
    failures: 0,
  };

  try {
    const { data: chunks, error: chunkError } = await sb
      .from('rag_chunks')
      .select('id, content_hash, content, embedding_local_model, metadata')
      .order('created_at', { ascending: true })
      .limit(2000);
    if (chunkError) throw chunkError;
    stats.chunksSeen = chunks?.length ?? 0;

    for (const chunk of chunks ?? []) {
      const existingHash = typeof chunk.metadata?.embedding_local_content_hash === 'string'
        ? chunk.metadata.embedding_local_content_hash
        : null;
      if (chunk.embedding_local_model === LOCAL_EMBEDDING_MODEL && existingHash === chunk.content_hash) {
        stats.chunksSkipped += 1;
        continue;
      }

      const embedding = await embedTextLocal(chunk.content);
      const metadata = {
        ...(chunk.metadata ?? {}),
        embedding_local_content_hash: chunk.content_hash,
        embedding_local_dimensions: embedding.dimensions,
      };
      const { error: updateError } = await sb.from('rag_chunks').update({
        embedding_local: vectorToSql(embedding.vector),
        embedding_local_model: LOCAL_EMBEDDING_MODEL,
        embedding_local_updated_at: new Date().toISOString(),
        metadata,
        updated_at: new Date().toISOString(),
      }).eq('id', chunk.id);
      if (updateError) throw updateError;
      stats.chunksEmbedded += 1;
    }
  } catch (err) {
    status = 'failed';
    error = err instanceof Error ? err.message : String(err);
    stats.failures += 1;
  }

  await sb.from('rag_ingestion_runs').update({
    status,
    chunks_embedded: stats.chunksEmbedded,
    chunks_skipped: stats.chunksSkipped,
    failures: stats.failures,
    error,
    metadata: {
      phase: 'phase_3_local_embeddings',
      embedding_provider: 'local',
      embedding_model: LOCAL_EMBEDDING_MODEL,
      dimensions: LOCAL_EMBEDDING_DIMENSIONS,
    },
    finished_at: new Date().toISOString(),
  }).eq('id', run.id);

  const { count: embeddedCount } = await sb
    .from('rag_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding_local', 'is', null);
  const evidence = {
    ok: status === 'completed',
    runKey,
    status,
    model: LOCAL_EMBEDDING_MODEL,
    dimensions: LOCAL_EMBEDDING_DIMENSIONS,
    stats,
    embeddedCount: embeddedCount ?? null,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'local-embedding-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (status !== 'completed') process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
