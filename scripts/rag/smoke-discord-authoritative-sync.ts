import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { collectApprovedDiscordRagInputs, DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION } from '../../lib/rag/discord-authoritative-sources';
import { normalizeRagSource, type NormalizedRagRecord } from '../../lib/rag/source-normalizer';

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
  const runId = `phase5-${Date.now()}`;
  const insertedQueueIds: string[] = [];
  const insertedDraftIds: string[] = [];
  const sourceKeysToClean: string[] = [];

  try {
    const { data: approvedQueue, error: approvedQueueError } = await sb.from('discord_content_queue').insert({
      source: 'phase_5_authoritative_rag_smoke',
      discord_user_id: `smoke-approved-${runId}`,
      discord_username: 'Phase 5 Approved Smoke',
      channel_base_name: 'content-queue',
      idea: `Approved authoritative RAG queue idea ${runId}`,
      angle: 'This row is published and must become an authoritative Discord content queue source.',
      status: 'published',
      priority: 88,
      metadata: { smoke_run_id: runId, approved_for_rag: true },
    }).select('id').single();
    if (approvedQueueError) throw approvedQueueError;
    insertedQueueIds.push(approvedQueue.id);

    const { data: blockedQueue, error: blockedQueueError } = await sb.from('discord_content_queue').insert({
      source: 'phase_5_authoritative_rag_smoke',
      discord_user_id: `smoke-blocked-${runId}`,
      discord_username: 'Phase 5 Blocked Smoke',
      channel_base_name: 'content-queue',
      idea: `Blocked unapproved RAG queue idea ${runId}`,
      angle: 'This row is only captured and must not become an authoritative source.',
      status: 'captured',
      priority: 99,
      metadata: { smoke_run_id: runId, approved_for_rag: false },
    }).select('id').single();
    if (blockedQueueError) throw blockedQueueError;
    insertedQueueIds.push(blockedQueue.id);

    const { data: approvedDraft, error: approvedDraftError } = await sb.from('discord_content_drafts').insert({
      draft_type: 'lesson',
      target_channel_base_name: 'resources',
      title: `Approved authoritative RAG lesson ${runId}`,
      body: `# Approved authoritative RAG lesson ${runId}\n\nThis approved lesson explains why only reviewed Discord knowledge should become retrievable source material.`,
      citations: [],
      content_queue_id: approvedQueue.id,
      model: 'smoke',
      prompt_version: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
      quality_score: 92,
      status: 'approved',
      reviewer_email: 'phase5-smoke@sageideas.dev',
      reviewed_at: new Date().toISOString(),
      metadata: { smoke_run_id: runId, policy_passed: true, source_table: 'discord_content_queue', source_record_id: approvedQueue.id },
    }).select('id').single();
    if (approvedDraftError) throw approvedDraftError;
    insertedDraftIds.push(approvedDraft.id);

    const { data: blockedDraft, error: blockedDraftError } = await sb.from('discord_content_drafts').insert({
      draft_type: 'lesson',
      target_channel_base_name: 'resources',
      title: `Blocked rejected RAG lesson ${runId}`,
      body: `# Blocked rejected RAG lesson ${runId}\n\nThis rejected lesson must not enter authoritative RAG even with a high quality score.`,
      citations: [],
      content_queue_id: blockedQueue.id,
      model: 'smoke',
      prompt_version: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
      quality_score: 95,
      status: 'rejected',
      reviewer_email: 'phase5-smoke@sageideas.dev',
      reviewed_at: new Date().toISOString(),
      metadata: { smoke_run_id: runId, policy_passed: true, source_table: 'discord_content_queue', source_record_id: blockedQueue.id },
    }).select('id').single();
    if (blockedDraftError) throw blockedDraftError;
    insertedDraftIds.push(blockedDraft.id);

    const approvedQueueSourceKey = `discord_content_queue:${approvedQueue.id}`;
    const blockedQueueSourceKey = `discord_content_queue:${blockedQueue.id}`;
    const approvedDraftSourceKey = `lesson:discord_content_draft:${approvedDraft.id}`;
    const blockedDraftSourceKey = `lesson:discord_content_draft:${blockedDraft.id}`;
    sourceKeysToClean.push(approvedQueueSourceKey, approvedDraftSourceKey);

    const collected = await collectApprovedDiscordRagInputs(sb);
    const records = collected.inputs
      .filter((input) => {
        const metadata = input.metadata ?? {};
        return metadata.approval_policy === DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION
          && (
            input.sourceRecordId === approvedQueue.id
            || input.sourceRecordId === approvedDraft.id
            || input.sourceRecordId === blockedQueue.id
            || input.sourceRecordId === blockedDraft.id
          );
      })
      .map(normalizeRagSource)
      .filter((record): record is NormalizedRagRecord => Boolean(record));

    if (records.length) {
      const { data: sources, error: sourceError } = await sb
        .from('rag_sources')
        .upsert(records.map((record) => record.source), { onConflict: 'source_key' })
        .select('id, source_key');
      if (sourceError) throw sourceError;
      const sourceIds = new Map((sources ?? []).map((source: any) => [source.source_key, source.id]));
      const documents = records.map((record) => ({
        ...record.document,
        source_id: sourceIds.get(record.source.source_key),
      })).filter((document) => document.source_id);
      const { error: documentError } = await sb.from('rag_documents').upsert(documents, { onConflict: 'document_key' });
      if (documentError) throw documentError;
    }

    const { data: ragSources, error: ragSourceError } = await sb
      .from('rag_sources')
      .select('source_key, source_type, source_record_id, metadata')
      .in('source_key', [approvedQueueSourceKey, blockedQueueSourceKey, approvedDraftSourceKey, blockedDraftSourceKey]);
    if (ragSourceError) throw ragSourceError;

    const { data: ragDocuments, error: ragDocumentError } = await sb
      .from('rag_documents')
      .select('document_key')
      .in('document_key', [`doc:${approvedQueueSourceKey}`, `doc:${approvedDraftSourceKey}`]);
    if (ragDocumentError) throw ragDocumentError;

    const presentKeys = new Set((ragSources ?? []).map((source: any) => source.source_key));
    const approvedPresent = presentKeys.has(approvedQueueSourceKey) && presentKeys.has(approvedDraftSourceKey);
    const blockedAbsent = !presentKeys.has(blockedQueueSourceKey) && !presentKeys.has(blockedDraftSourceKey);
    const documentsPresent = new Set((ragDocuments ?? []).map((document: any) => document.document_key)).size === 2;
    const ok = approvedPresent && blockedAbsent && documentsPresent;

    const evidence = {
      ok,
      runId,
      approvalPolicy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
      approvedSourceKeys: [approvedQueueSourceKey, approvedDraftSourceKey],
      blockedSourceKeys: [blockedQueueSourceKey, blockedDraftSourceKey],
      collectorStats: collected.stats,
      collectedSourceKeys: records.map((record) => record.source.source_key),
      ragSourceKeys: [...presentKeys],
      approvedPresent,
      blockedAbsent,
      documentsPresent,
      finishedAt: new Date().toISOString(),
    };
    await writeEvidence(evidence);
    console.log(JSON.stringify(evidence, null, 2));
    if (!ok) process.exitCode = 1;
  } finally {
    await Promise.all([
      sourceKeysToClean.length ? sb.from('rag_sources').delete().in('source_key', sourceKeysToClean) : Promise.resolve(),
      insertedDraftIds.length ? sb.from('discord_content_drafts').delete().in('id', insertedDraftIds) : Promise.resolve(),
      insertedQueueIds.length ? sb.from('discord_content_queue').delete().in('id', insertedQueueIds) : Promise.resolve(),
    ]);
  }
}

async function writeEvidence(evidence: Record<string, unknown>) {
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'discord-authoritative-sync-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify({ ...evidence, evidencePath }, null, 2)}\n`);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    approvalPolicy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await writeEvidence(evidence);
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
});
