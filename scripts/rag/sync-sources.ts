import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { parseFrontmatter } from '../../lib/frontmatter';
import { normalizeRagSource, type NormalizedRagRecord, type RagSourceInput } from '../../lib/rag/source-normalizer';

type SupabaseClient = ReturnType<typeof createClient<any>>;

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
    source_types: ['discord_message', 'discord_question', 'discord_answer', 'discord_content_queue', 'blog_post', 'resource'],
    metadata: { phase: 'phase_2_source_registry' },
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
    const inputs = [
      ...(await discordMessageInputs(sb)),
      ...(await discordQuestionInputs(sb)),
      ...(await discordAnswerInputs(sb)),
      ...(await discordContentQueueInputs(sb)),
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
    metadata: { phase: 'phase_2_source_registry', by_type: stats.byType },
    finished_at: new Date().toISOString(),
  }).eq('id', run.id);

  await mkdir(evidenceDir, { recursive: true });
  const evidence = {
    ok: status === 'completed',
    runKey,
    status,
    stats,
    blocker: stats.byType.discord_message || stats.byType.discord_question || stats.byType.discord_answer || stats.byType.discord_content_queue
      ? null
      : 'No Discord knowledge-source rows were available to sync. Message Content Intent/member activity still required for Discord corpus.',
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

async function discordMessageInputs(sb: SupabaseClient): Promise<RagSourceInput[]> {
  const { data, error } = await sb
    .from('discord_messages')
    .select('discord_message_id, guild_id, channel_id, channel_base_name, author_user_id, author_username, content, detected_kind, captured_at, link_count, attachment_count')
    .eq('author_bot', false)
    .is('deleted_at', null)
    .neq('content', '')
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    sourceType: 'discord_message',
    externalId: row.discord_message_id,
    title: `Discord ${row.detected_kind ?? 'message'} in ${row.channel_base_name ?? row.channel_id}`,
    body: row.content,
    sourceTable: 'discord_messages',
    sourceRecordId: row.discord_message_id,
    authorUserId: row.author_user_id,
    authorName: row.author_username,
    channelId: row.channel_id,
    channelBaseName: row.channel_base_name,
    sourceCreatedAt: row.captured_at,
    metadata: { guild_id: row.guild_id, detected_kind: row.detected_kind, link_count: row.link_count, attachment_count: row.attachment_count },
  }));
}

async function discordQuestionInputs(sb: SupabaseClient): Promise<RagSourceInput[]> {
  const { data, error } = await sb
    .from('discord_questions')
    .select('id, discord_user_id, discord_username, question, context, status, channel_base_name, message_id, created_at')
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    sourceType: 'discord_question',
    externalId: row.id,
    title: `Discord question: ${String(row.question).slice(0, 80)}`,
    body: [row.question, row.context].filter(Boolean).join('\n\nContext:\n'),
    sourceTable: 'discord_questions',
    sourceRecordId: row.id,
    authorUserId: row.discord_user_id,
    authorName: row.discord_username,
    channelBaseName: row.channel_base_name,
    sourceCreatedAt: row.created_at,
    metadata: { status: row.status, message_id: row.message_id },
  }));
}

async function discordAnswerInputs(sb: SupabaseClient): Promise<RagSourceInput[]> {
  const { data, error } = await sb
    .from('discord_answers')
    .select('id, question_id, discord_user_id, discord_username, answer, helpful, points_awarded, message_id, created_at')
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    sourceType: 'discord_answer',
    externalId: row.id,
    title: `Discord answer ${row.helpful ? '(helpful)' : ''}`.trim(),
    body: row.answer,
    sourceTable: 'discord_answers',
    sourceRecordId: row.id,
    authorUserId: row.discord_user_id,
    authorName: row.discord_username,
    sourceCreatedAt: row.created_at,
    qualityScore: row.helpful ? 90 : 70,
    metadata: { question_id: row.question_id, helpful: row.helpful, points_awarded: row.points_awarded, message_id: row.message_id },
  }));
}

async function discordContentQueueInputs(sb: SupabaseClient): Promise<RagSourceInput[]> {
  const { data, error } = await sb
    .from('discord_content_queue')
    .select('id, source, discord_user_id, discord_username, channel_base_name, idea, angle, status, priority, created_at, metadata')
    .neq('status', 'archived')
    .limit(1000);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    sourceType: 'discord_content_queue',
    externalId: row.id,
    title: `Content queue: ${String(row.idea).slice(0, 80)}`,
    body: [row.idea, row.angle].filter(Boolean).join('\n\nAngle:\n'),
    sourceTable: 'discord_content_queue',
    sourceRecordId: row.id,
    authorUserId: row.discord_user_id,
    authorName: row.discord_username,
    channelBaseName: row.channel_base_name,
    sourceCreatedAt: row.created_at,
    qualityScore: row.priority,
    metadata: { source: row.source, status: row.status, metadata: row.metadata },
  }));
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
