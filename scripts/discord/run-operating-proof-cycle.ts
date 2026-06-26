import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { runDiscordOperatingProofCycle } from '@/lib/discord/operating-proof-cycle';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');
const OPERATING_CYCLE_APPROVAL_ENV = 'SAGE_ALLOW_DISCORD_OPERATING_CYCLE';
const OPERATING_CYCLE_APPROVAL_VALUE = 'approved';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function assertOperatingCycleApproved(dryRun: boolean) {
  if (dryRun) return;
  if (process.env[OPERATING_CYCLE_APPROVAL_ENV] === OPERATING_CYCLE_APPROVAL_VALUE) return;
  throw new Error(
    `Non-dry Discord operating cycle blocked. Set ${OPERATING_CYCLE_APPROVAL_ENV}=${OPERATING_CYCLE_APPROVAL_VALUE} only after explicit approval; this command can sync approved Discord knowledge, create public proof drafts, and write Supabase operating-cycle rows.`,
  );
}

async function loadLocalFinalScorecardEvidence() {
  const evidencePath = path.join(evidenceDir, 'phase-20-final-scorecard.json');
  const payload = JSON.parse(await readFile(evidencePath, 'utf8'));
  const averageScore = payload.averageScore ?? payload.summary?.averageScore ?? payload.scorecardValidation?.averageScore ?? null;
  const blockedBelow95 = payload.blockedBelow95 ?? payload.summary?.blockedBelow95 ?? payload.scorecardValidation?.blockedBelow95 ?? [];
  return {
    averageScore: averageScore === null || averageScore === undefined ? null : Number(averageScore),
    blockedBelow95: Array.isArray(blockedBelow95) ? blockedBelow95.map(String) : [],
    latestRunKey: payload.runKey ? String(payload.runKey) : null,
  };
}

async function main() {
  const dryRun = hasFlag('--dry-run');
  assertOperatingCycleApproved(dryRun);
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const result = await runDiscordOperatingProofCycle(sb, {
    dryRun,
    draftType: hasFlag('--linkedin') ? 'linkedin' : hasFlag('--article') ? 'article' : 'newsletter',
    finalScorecardOverride: dryRun ? await loadLocalFinalScorecardEvidence() : undefined,
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
