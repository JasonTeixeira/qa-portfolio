import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

const requiredTabs = ['overview', 'members', 'knowledge', 'content', 'learning', 'jobs', 'premium', 'audit'];
const requiredSurfaces = [
  'Member approval queue',
  'Member intelligence',
  'Member nudge queue',
  'RAG operational health',
  'RAG knowledge approval desk',
  'AI content approval',
  'Challenge review desk',
  'Scheduled automation',
  'Durable job control',
  'Job dead letters',
  'Premium operations',
  'Audit stream',
];

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function count(sb: any, table: string, extra?: (query: any) => any) {
  let query = sb.from(table).select('*', { count: 'exact', head: true });
  if (extra) query = extra(query);
  const { count: value, error } = await query;
  if (error) throw error;
  return value ?? 0;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const page = await readFile(path.join(process.cwd(), 'app', 'admin', 'discord', 'page.tsx'), 'utf8');
  const actions = await readFile(path.join(process.cwd(), 'app', 'admin', 'discord', 'actions.ts'), 'utf8');
  const migration = await readFile(path.join(process.cwd(), 'supabase', 'migrations', '0088_discord_durable_jobs.sql'), 'utf8');

  const liveCounts = {
    members: await count(sb, 'discord_members'),
    member_profiles: await count(sb, 'discord_member_intelligence_profiles'),
    nudge_queue: await count(sb, 'discord_member_nudge_queue', (query) => query.in('status', ['queued', 'approved'])),
    content_queue: await count(sb, 'discord_content_queue'),
    content_drafts: await count(sb, 'discord_content_drafts'),
    rag_sources: await count(sb, 'rag_sources'),
    eval_runs: await count(sb, 'rag_eval_runs'),
    scheduled_runs: await count(sb, 'discord_scheduled_runs'),
    durable_jobs: await count(sb, 'discord_job_registry'),
    durable_runs: await count(sb, 'discord_job_runs'),
    dead_letters: await count(sb, 'discord_job_dead_letters', (query) => query.is('resolved_at', null)),
    premium_reviews: await count(sb, 'discord_premium_review_requests'),
    office_hours: await count(sb, 'discord_office_hours_queue'),
    events: await count(sb, 'discord_events'),
  };
  const checks = {
    tabs_present: requiredTabs.every((tab) => page.includes(`['${tab}',`) || page.includes(`["${tab}",`)),
    required_surfaces_present: requiredSurfaces.every((surface) => page.includes(surface)),
    live_tables_queried: [
      'discord_member_intelligence_profiles',
      'discord_member_nudge_queue',
      'discord_job_registry',
      'discord_job_runs',
      'discord_job_dead_letters',
      'discord_premium_review_requests',
      'discord_office_hours_queue',
    ].every((table) => page.includes(table)),
    safe_actions_authed: [
      'reviewDiscordMemberNudgeAction',
      'retryDiscordJobDeadLetterAction',
      'cancelDiscordJobRunAction',
      'resolveDiscordJobDeadLetterAction',
    ].every((action) => actions.includes(action)) && (actions.match(/requireAdmin/g) ?? []).length >= 4,
    durable_migration_present: migration.includes('create table if not exists public.discord_job_registry')
      && migration.includes('create table if not exists public.discord_job_runs')
      && migration.includes('create table if not exists public.discord_job_dead_letters'),
  };
  const evidence = {
    ok: Object.values(checks).every(Boolean),
    checks,
    liveCounts,
    requiredTabs,
    requiredSurfaces,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-13-admin-cockpit-v2-proof.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exitCode = 1;
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-13-admin-cockpit-v2-proof.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
