import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { evaluateAndPersistDiscordContentDraft } from '../../lib/discord/content-quality';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function argValue(name: string): string | null {
  const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return inline.split('=').slice(1).join('=').trim() || null;
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1]?.trim() || null : null;
}

async function main() {
  const smoke = process.argv.includes('--smoke');
  const limitArg = Number(argValue('limit') ?? 100);
  const requestedLimit = Number.isFinite(limitArg) ? Math.max(1, Math.min(250, limitArg)) : 100;
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const startedAt = new Date().toISOString();
  let smokeDraftId: string | null = null;
  let ids: string[] = [];

  try {
    if (smoke) {
      const { data, error } = await sb.from('discord_content_drafts').insert({
        draft_type: 'daily_signal',
        target_channel_base_name: 'daily-signal',
        title: 'Quality smoke draft',
        body: '# Daily Signal\n**Build prompt:** Build one approval-gated workflow.\n**Question:** What action should require review?\n**Challenge:** Map the approval point.\nDeliverable: Post the trigger, owner, and failure path.',
        status: 'pending_approval',
      }).select('id').single();
      if (error) throw error;
      smokeDraftId = String(data.id);
      ids = [smokeDraftId];
    } else {
      const draftId = argValue('draft-id');
      if (draftId) ids = [draftId];
      else {
        const { data, error } = await sb
          .from('discord_content_drafts')
          .select('id')
          .in('status', ['draft', 'pending_approval'])
          .order('created_at', { ascending: false })
          .limit(requestedLimit);
        if (error) throw error;
        ids = (data ?? []).map((row) => String(row.id));
      }
    }

    const results = [];
    for (const id of ids) {
      const evaluation = await evaluateAndPersistDiscordContentDraft(id);
      results.push({ draftId: id, evaluationId: evaluation.evaluationId, score: evaluation.score, passed: evaluation.passed, reasons: evaluation.reasons });
    }
    const evidence = {
      ok: results.length > 0 && results.every((result) => typeof result.score === 'number'),
      smoke,
      requestedLimit,
      evaluated: results.length,
      results,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await mkdir(evidenceDir, { recursive: true });
    const evidencePath = path.join(evidenceDir, smoke ? 'content-quality-smoke.json' : 'content-quality-run.json');
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
    if (!evidence.ok) process.exitCode = 1;
  } finally {
    if (smokeDraftId) await sb.from('discord_content_drafts').delete().eq('id', smokeDraftId);
  }
}

main().catch(async (error) => {
  const smoke = process.argv.includes('--smoke');
  const evidence = { ok: false, smoke, error: error instanceof Error ? error.message : String(error), finishedAt: new Date().toISOString() };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, smoke ? 'content-quality-smoke.json' : 'content-quality-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
