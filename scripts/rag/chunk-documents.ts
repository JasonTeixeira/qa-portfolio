import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { chunkRagDocument } from '../../lib/rag/chunking';

type SupabaseClient = ReturnType<typeof createClient<any>>;

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
  const runKey = `rag-chunk-${startedAt.replace(/[:.]/g, '-')}`;
  const { data: run, error: runError } = await sb.from('rag_ingestion_runs').insert({
    run_key: runKey,
    status: 'running',
    source_types: ['rag_documents'],
    metadata: { phase: 'phase_3_chunking', embedding_provider: null },
  }).select('id').single();
  if (runError) throw runError;

  const stats = {
    documentsSeen: 0,
    documentsChunked: 0,
    chunksUpserted: 0,
    obsoleteChunksDeleted: 0,
    failures: 0,
  };
  let status: 'completed' | 'failed' = 'completed';
  let error: string | null = null;

  try {
    const { data: documents, error: docError } = await sb
      .from('rag_documents')
      .select('id, source_id, document_key, title, body, body_hash, status')
      .neq('status', 'ignored')
      .order('created_at', { ascending: true })
      .limit(2000);
    if (docError) throw docError;

    stats.documentsSeen = documents?.length ?? 0;
    for (const document of documents ?? []) {
      const chunks = chunkRagDocument({
        documentKey: document.document_key,
        title: document.title,
        body: document.body,
      });
      const chunkKeys = chunks.map((chunk) => chunk.chunk_key);

      if (chunks.length) {
        const rows = chunks.map((chunk) => ({
          document_id: document.id,
          source_id: document.source_id,
          ingestion_run_id: run.id,
          chunk_key: chunk.chunk_key,
          chunk_index: chunk.chunk_index,
          content: chunk.content,
          content_hash: chunk.content_hash,
          token_estimate: chunk.token_estimate,
          embedding: null,
          embedding_model: null,
          metadata: { ...chunk.metadata, document_body_hash: document.body_hash },
          updated_at: new Date().toISOString(),
        }));
        const { data: upserted, error: chunkError } = await sb
          .from('rag_chunks')
          .upsert(rows, { onConflict: 'chunk_key' })
          .select('id');
        if (chunkError) throw chunkError;
        stats.chunksUpserted += upserted?.length ?? 0;
      }

      const deleted = await deleteObsoleteChunks(sb, document.id, chunkKeys);
      stats.obsoleteChunksDeleted += deleted;

      const { error: updateError } = await sb
        .from('rag_documents')
        .update({ status: 'chunked', updated_at: new Date().toISOString() })
        .eq('id', document.id);
      if (updateError) throw updateError;
      stats.documentsChunked += 1;
    }
  } catch (err) {
    status = 'failed';
    error = err instanceof Error ? err.message : String(err);
    stats.failures += 1;
  }

  await sb.from('rag_ingestion_runs').update({
    status,
    documents_upserted: stats.documentsChunked,
    chunks_upserted: stats.chunksUpserted,
    failures: stats.failures,
    error,
    metadata: {
      phase: 'phase_3_chunking',
      embedding_provider: null,
      embedding_status: 'not_configured',
      obsolete_chunks_deleted: stats.obsoleteChunksDeleted,
    },
    finished_at: new Date().toISOString(),
  }).eq('id', run.id);

  const { count: totalChunks } = await sb.from('rag_chunks').select('*', { count: 'exact', head: true });
  const evidence = {
    ok: status === 'completed',
    runKey,
    status,
    stats,
    totalChunks: totalChunks ?? null,
    embeddingStatus: 'not_configured',
    note: 'Chunks are created from real sources. Embeddings remain null until a real embedding provider is configured and proven.',
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'chunk-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (status !== 'completed') process.exit(1);
}

async function deleteObsoleteChunks(sb: SupabaseClient, documentId: string, keepChunkKeys: string[]): Promise<number> {
  let query = sb.from('rag_chunks').delete({ count: 'exact' }).eq('document_id', documentId);
  if (keepChunkKeys.length) query = query.not('chunk_key', 'in', `(${keepChunkKeys.map((key) => `"${key}"`).join(',')})`);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
