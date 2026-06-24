import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { parseFrontmatter } from '../../lib/frontmatter';
import { normalizeRagSource, type NormalizedRagRecord, type RagSourceInput } from '../../lib/rag/source-normalizer';
import {
  DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
  collectApprovedDiscordRagInputs,
  type DiscordAuthoritativeSyncStats,
} from '../../lib/rag/discord-authoritative-sources';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'rag');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const runKey = `rag-source-sync-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const { data: run, error: runError } = await sb.from('rag_ingestion_runs').insert({
    run_key: runKey,
    status: 'running',
    source_types: ['discord_question', 'discord_answer', 'discord_content_queue', 'blog_post', 'resource', 'lesson', 'admin_note'],
    metadata: { phase: 'phase_5_authoritative_discord_rag', approval_policy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION },
  }).select('id').single();
  if (runError) throw runError;

  let status: 'completed' | 'failed' = 'completed';
  let error: string | null = null;
  let records: NormalizedRagRecord[] = [];
  let approvedDiscordStats: DiscordAuthoritativeSyncStats | null = null;
  const stats = {
    sourcesSeen: 0,
    sourcesUpserted: 0,
    documentsUpserted: 0,
    failures: 0,
    byType: {} as Record<string, number>,
  };

  try {
    const approvedDiscord = await collectApprovedDiscordRagInputs(sb);
    approvedDiscordStats = approvedDiscord.stats;
    const inputs = [
      ...approvedDiscord.inputs,
      ...(await blogPostInputs()),
      ...(await resourceInputs()),
    ];
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
      approved_discord_stats: approvedDiscordStats,
      by_type: stats.byType,
    },
    finished_at: new Date().toISOString(),
  }).eq('id', run.id);

  await mkdir(evidenceDir, { recursive: true });
  const evidence = {
    ok: status === 'completed',
    runKey,
    status,
    approvalPolicy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
    approvedDiscordStats,
    stats,
    blocker: stats.byType.discord_question || stats.byType.discord_answer || stats.byType.discord_content_queue || stats.byType.lesson || stats.byType.admin_note
      ? null
      : 'No approved Discord knowledge-source rows were available to sync. Raw/unapproved Discord rows are intentionally excluded from authoritative RAG.',
    sampleSources: records.slice(0, 5).map((record) => ({
      source_key: record.source.source_key,
      source_type: record.source.source_type,
      title: record.source.title,
      token_estimate: record.document.token_estimate,
    })),
  };
  const evidencePath = path.join(evidenceDir, 'source-sync-sample.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (status !== 'completed') process.exit(1);
}

async function blogPostInputs(): Promise<RagSourceInput[]> {
  const dir = path.join(root, 'content', 'blog');
  const files = (await readdir(dir)).filter((file) => file.endsWith('.mdx'));
  const inputs: RagSourceInput[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), 'utf8');
    const { data, content } = parseFrontmatter(raw);
    const slug = String(data.slug ?? file.replace(/\.mdx$/, ''));
    const title = String(data.title ?? slug);
    inputs.push({
      sourceType: 'blog_post',
      externalId: slug,
      title,
      body: `# ${title}\n\n${String(data.description ?? data.excerpt ?? '')}\n\n${content}`,
      sourceUrl: `/blog/${slug}`,
      sourceTable: 'content/blog',
      sourceRecordId: file,
      sourceCreatedAt: typeof data.datePublished === 'string' ? data.datePublished : typeof data.date === 'string' ? data.date : null,
      metadata: { file, category: data.category ?? null, cluster: data.cluster ?? null, tags: data.tags ?? [] },
    });
  }
  return inputs;
}

async function resourceInputs(): Promise<RagSourceInput[]> {
  const files = [
    'docs/DISCORD_EDUCATION_SERVER_RUNBOOK.md',
    'docs/DISCORD_COMMUNITY_OPERATING_SYSTEM.md',
    'docs/specs/rag-system-build-plan.txt',
  ];
  const inputs: RagSourceInput[] = [];
  for (const file of files) {
    const body = await readFile(path.join(root, file), 'utf8');
    inputs.push({
      sourceType: 'resource',
      externalId: file,
      title: path.basename(file),
      body,
      sourceUrl: `/${file}`,
      sourceTable: 'docs',
      sourceRecordId: file,
      metadata: { file },
    });
  }
  return inputs;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
