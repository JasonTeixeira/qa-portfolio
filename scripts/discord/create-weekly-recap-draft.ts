import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { createWeeklyRecapDraft } from '../../lib/discord/weekly-automation';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const smoke = process.argv.includes('--smoke');
  const startedAt = new Date().toISOString();
  const result = await createWeeklyRecapDraft({ metadata: smoke ? { smoke: true } : {} });

  let cleanedUp = false;
  if (smoke) {
    const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false },
    });
    await Promise.all([
      sb.from('discord_content_drafts').delete().eq('id', result.draftId),
      sb.from('discord_leaderboard_snapshots').delete().eq('id', result.leaderboardSnapshotId),
    ]);
    cleanedUp = true;
  }

  const evidence = {
    ...result,
    ok: result.ok && result.bodyPreview.includes('# Weekly Recap') && result.qualityScore >= 80,
    smoke,
    cleanedUp,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, smoke ? 'weekly-recap-smoke.json' : 'weekly-recap-run.json');
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
  const evidencePath = path.join(evidenceDir, smoke ? 'weekly-recap-smoke.json' : 'weekly-recap-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
