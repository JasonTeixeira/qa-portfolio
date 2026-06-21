import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { rebuildDiscordMemberIntelligenceProfiles } from '../../lib/discord/member-intelligence';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const smoke = process.argv.includes('--smoke');
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const smokeUserId = `member-intel-smoke-${Date.now()}`;
  const startedAt = new Date().toISOString();

  try {
    if (smoke) await seedSmokeMember(sb, smokeUserId);
    const result = await rebuildDiscordMemberIntelligenceProfiles();
    const { data: profile } = smoke
      ? await sb.from('discord_member_intelligence_profiles').select('*').eq('discord_user_id', smokeUserId).maybeSingle()
      : { data: null };
    const evidence = {
      ok: result.processed >= (smoke ? 1 : 0) && (!smoke || profile?.segment === 'premium_candidate'),
      processed: result.processed,
      smoke,
      smokeProfile: profile ? {
        discord_user_id: profile.discord_user_id,
        segment: profile.segment,
        next_best_action: profile.next_best_action,
        total_points: profile.total_points,
        helpful_answer_count: profile.helpful_answer_count,
        strengths: profile.strengths,
      } : null,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await mkdir(evidenceDir, { recursive: true });
    const evidencePath = path.join(evidenceDir, smoke ? 'member-intelligence-smoke.json' : 'member-intelligence-run.json');
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
    if (!evidence.ok) process.exitCode = 1;
  } finally {
    if (smoke) await cleanupSmokeMember(sb, smokeUserId);
  }
}

async function seedSmokeMember(sb: any, discordUserId: string) {
  await sb.from('discord_members').upsert({
    discord_user_id: discordUserId,
    username: 'member-intel-smoke',
    academy_member: true,
    premium_member: false,
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'discord_user_id' });
  await sb.from('discord_points_ledger').insert([
    { discord_user_id: discordUserId, discord_username: 'member-intel-smoke', points: 40, reason: 'smoke', source: 'member_intelligence_smoke' },
    { discord_user_id: discordUserId, discord_username: 'member-intel-smoke', points: 40, reason: 'smoke', source: 'member_intelligence_smoke' },
  ]);
  const { data: question, error } = await sb.from('discord_questions').insert({
    discord_user_id: discordUserId,
    discord_username: 'member-intel-smoke',
    question: 'How should I scope this AI project?',
    context: 'Smoke test',
  }).select('id').single();
  if (error) throw error;
  await sb.from('discord_answers').insert({
    question_id: question.id,
    discord_user_id: discordUserId,
    discord_username: 'member-intel-smoke',
    answer: 'Start with one user, one input, one output, and one acceptance test.',
    helpful: true,
    points_awarded: 10,
  });
}

async function cleanupSmokeMember(sb: any, discordUserId: string) {
  await sb.from('discord_member_intelligence_profiles').delete().eq('discord_user_id', discordUserId);
  await sb.from('discord_answers').delete().eq('discord_user_id', discordUserId);
  await sb.from('discord_questions').delete().eq('discord_user_id', discordUserId);
  await sb.from('discord_points_ledger').delete().eq('discord_user_id', discordUserId);
  await sb.from('discord_member_streaks').delete().eq('discord_user_id', discordUserId);
  await sb.from('discord_members').delete().eq('discord_user_id', discordUserId);
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
  const evidencePath = path.join(evidenceDir, smoke ? 'member-intelligence-smoke.json' : 'member-intelligence-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
