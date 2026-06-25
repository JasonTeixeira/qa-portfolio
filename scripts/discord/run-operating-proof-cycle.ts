import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { runDiscordOperatingProofCycle } from '@/lib/discord/operating-proof-cycle';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const result = await runDiscordOperatingProofCycle(sb, {
    dryRun: hasFlag('--dry-run'),
    draftType: hasFlag('--linkedin') ? 'linkedin' : hasFlag('--article') ? 'article' : 'newsletter',
  });
  const evidence = {
    ...result,
    note: result.ok
      ? 'Operating cycle passed. Approved Discord knowledge was synced, growth metrics were tracked, and public proof workflow is active.'
      : 'Operating cycle ran, but one or more operating gates still need real community volume or admin action.',
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-21-operating-proof-cycle.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok && !hasFlag('--allow-blocked')) process.exitCode = 1;
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    status: 'failed',
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-21-operating-proof-cycle.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
