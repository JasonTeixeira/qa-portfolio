import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { createDailyPlannerDraft } from '../../lib/discord/daily-planner';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

function argValue(name: string): string | null {
  const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return inline.split('=').slice(1).join('=').trim() || null;
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1]?.trim() || null : null;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const smoke = process.argv.includes('--smoke');
  const force = process.argv.includes('--force') || smoke;
  const dateArg = argValue('date');
  const date = dateArg ? new Date(`${dateArg}T12:00:00.000Z`) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid --date value: ${dateArg}`);
  const startedAt = new Date().toISOString();
  const result = await createDailyPlannerDraft({
    date,
    force,
    metadata: smoke ? { smoke: true } : {},
  });

  let cleanedUp = false;
  if (smoke && result.draftId) {
    const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false },
    });
    await sb.from('discord_content_drafts').delete().eq('id', result.draftId);
    cleanedUp = true;
  }

  const evidence = {
    ...result,
    ok: result.ok && Boolean(result.draftId) && result.bodyPreview.includes('# Daily Signal'),
    smoke,
    cleanedUp,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, smoke ? 'daily-planner-smoke.json' : 'daily-planner-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exit(1);
}

main().catch(async (error) => {
  const smoke = process.argv.includes('--smoke');
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    smoke,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, smoke ? 'daily-planner-smoke.json' : 'daily-planner-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
