import type { SupabaseClient } from '@supabase/supabase-js';
import {
  DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
  collectApprovedDiscordRagInputs,
  type DiscordAuthoritativeSyncStats,
} from '@/lib/rag/discord-authoritative-sources';
import { normalizeRagSource, type NormalizedRagRecord, type RagSourceInput } from '@/lib/rag/source-normalizer';

export type RagSourceSyncResult = {
  ok: boolean;
  runKey: string;
  status: 'completed' | 'failed';
  approvalPolicy: string;
  approvedDiscordStats: DiscordAuthoritativeSyncStats | null;
  stats: {
    sourcesSeen: number;
    sourcesUpserted: number;
    documentsUpserted: number;
    failures: number;
    byType: Record<string, number>;
  };
  blocker: string | null;
  sampleSources: Array<{
    source_key: string;
    source_type: string;
    title: string | null;
    token_estimate: number;
  }>;
  evidencePath?: string;
  error?: string | null;
};

export async function runApprovedDiscordRagSourceSync(
  sb: SupabaseClient<any>,
  options: { trigger?: string } = {},
): Promise<RagSourceSyncResult> {
  const approvedDiscord = await collectApprovedDiscordRagInputs(sb);
  return runRagSourceSyncFromInputs(sb, approvedDiscord.inputs, {
    trigger: options.trigger ?? 'admin_dashboard',
    sourceTypes: ['discord_question', 'discord_answer', 'discord_content_queue', 'lesson', 'admin_note', 'resource'],
    approvedDiscordStats: approvedDiscord.stats,
  });
}

export async function runRagSourceSyncFromInputs(
  sb: SupabaseClient<any>,
  inputs: RagSourceInput[],
  options: {
    trigger: string;
    sourceTypes: string[];
    approvedDiscordStats: DiscordAuthoritativeSyncStats | null;
  },
): Promise<RagSourceSyncResult> {
  const runKey = `rag-source-sync-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const { data: run, error: runError } = await sb.from('rag_ingestion_runs').insert({
    run_key: runKey,
    status: 'running',
    source_types: options.sourceTypes,
    metadata: {
      phase: 'phase_5_authoritative_discord_rag',
      approval_policy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
      trigger: options.trigger,
    },
  }).select('id').single();
  if (runError) throw runError;

  let status: 'completed' | 'failed' = 'completed';
  let error: string | null = null;
  let records: NormalizedRagRecord[] = [];
  const stats = {
    sourcesSeen: 0,
    sourcesUpserted: 0,
    documentsUpserted: 0,
    failures: 0,
    byType: {} as Record<string, number>,
  };

  try {
    stats.sourcesSeen = inputs.length;
    records = inputs.map(normalizeRagSource).filter((item): item is NormalizedRagRecord => Boolean(item));
    for (const record of records) {
      stats.byType[record.source.source_type] = (stats.byType[record.source.source_type] ?? 0) + 1;
    }

    if (records.length) {
      const { data: sources, error: sourceError } = await sb
        .from('rag_sources')
        .upsert(records.map((record) => record.source), { onConflict: 'source_key' })
        .select('id, source_key');
      if (sourceError) throw sourceError;
      stats.sourcesUpserted = sources?.length ?? 0;
      const sourceIds = new Map((sources ?? []).map((source: any) => [source.source_key, source.id]));
      const documents = records.map((record) => ({
        ...record.document,
        source_id: sourceIds.get(record.source.source_key),
      })).filter((document) => document.source_id);
      const { data: docs, error: docError } = await sb
        .from('rag_documents')
        .upsert(documents, { onConflict: 'document_key' })
        .select('id');
      if (docError) throw docError;
      stats.documentsUpserted = docs?.length ?? 0;
    }
  } catch (err) {
    status = 'failed';
    error = err instanceof Error ? err.message : String(err);
    stats.failures += 1;
  }

  await sb.from('rag_ingestion_runs').update({
    status,
    sources_seen: stats.sourcesSeen,
    sources_upserted: stats.sourcesUpserted,
    documents_upserted: stats.documentsUpserted,
    failures: stats.failures,
    error,
    metadata: {
      phase: 'phase_5_authoritative_discord_rag',
      approval_policy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
      approved_discord_stats: options.approvedDiscordStats,
      by_type: stats.byType,
      trigger: options.trigger,
    },
    finished_at: new Date().toISOString(),
  }).eq('id', run.id);

  return {
    ok: status === 'completed',
    runKey,
    status,
    approvalPolicy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
    approvedDiscordStats: options.approvedDiscordStats,
    stats,
    blocker: hasApprovedDiscordSource(stats.byType)
      ? null
      : 'No approved Discord knowledge-source rows were available to sync. Raw/unapproved Discord rows are intentionally excluded from authoritative RAG.',
    sampleSources: records.slice(0, 5).map((record) => ({
      source_key: record.source.source_key,
      source_type: record.source.source_type,
      title: record.source.title,
      token_estimate: record.document.token_estimate,
    })),
    error,
  };
}

function hasApprovedDiscordSource(byType: Record<string, number>): boolean {
  return Boolean(byType.discord_question || byType.discord_answer || byType.discord_content_queue || byType.lesson || byType.admin_note);
}
