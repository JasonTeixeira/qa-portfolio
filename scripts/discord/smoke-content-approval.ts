import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

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

  const { data: draft, error: insertError } = await sb.from('discord_content_drafts').insert({
    draft_type: 'daily_signal',
    target_channel_base_name: 'daily-signal',
    title: 'Smoke approval draft',
    body: 'Draft a useful daily prompt from one real member question. This is a smoke test and should never publish.',
    model: 'smoke-test',
    prompt_version: 'smoke_v1',
    quality_score: 88,
    status: 'pending_approval',
    metadata: { smoke: true },
  }).select('id, status').single();
  if (insertError) throw insertError;

  const { error: approveError } = await sb.from('discord_content_drafts').update({
    status: 'approved',
    reviewer_email: 'smoke@test.local',
    review_note: 'Smoke approval verified.',
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', draft.id);
  if (approveError) throw approveError;

  const { data: approved, error: readError } = await sb
    .from('discord_content_drafts')
    .select('id, status, reviewer_email, review_note, quality_score')
    .eq('id', draft.id)
    .single();
  if (readError) throw readError;

  await sb.from('discord_content_drafts').delete().eq('id', draft.id);

  const evidence = {
    ok: approved.status === 'approved' && approved.reviewer_email === 'smoke@test.local',
    draft: approved,
    cleanedUp: true,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'content-approval-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exit(1);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : typeof error === 'object' && error ? JSON.stringify(error) : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'content-approval-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
