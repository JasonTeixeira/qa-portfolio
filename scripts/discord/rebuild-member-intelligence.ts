import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { rebuildDiscordMemberIntelligenceProfiles } from '../../lib/discord/member-intelligence';

const discordEvidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');
const aiOsEvidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

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
  const runId = Date.now();
  const smokeUsers = {
    premiumLead: `member-intel-premium-lead-${runId}`,
    stuck: `member-intel-stuck-${runId}`,
    inactive: `member-intel-inactive-${runId}`,
  };
  const startedAt = new Date().toISOString();

  try {
    if (smoke) await seedSmokeMembers(sb, smokeUsers);

    const firstRun = await rebuildDiscordMemberIntelligenceProfiles();
    const secondRun = smoke ? await rebuildDiscordMemberIntelligenceProfiles() : null;
    const proof = smoke ? await loadSmokeProof(sb, smokeUsers) : null;
    const ok = smoke
      ? Boolean(
          proof?.premiumLead?.segment === 'premium_lead'
            && proof?.premiumLead?.next_best_action === 'offer_contextual_premium_review_or_member_spotlight'
            && proof?.premiumLead?.segment_confidence >= 80
            && proof?.premiumLead?.total_points >= 80
            && proof?.premiumLead?.onboarding_steps_completed >= 3
            && proof?.stuck?.segment === 'stuck_onboarding'
            && proof?.stuck?.next_nudge_key === 'complete_onboarding'
            && proof?.inactive?.segment === 'at_risk_inactive'
            && proof?.inactive?.next_nudge_key === 'first_action'
            && proof?.stuckNudges.length === 1
            && firstRun.nudgesQueued >= 2
            && secondRun?.nudgesQueued === 0,
        )
      : firstRun.processed >= 0;
    const evidence = {
      ok,
      smoke,
      firstRun,
      secondRun,
      proof: smoke ? proof : null,
      checks: smoke ? {
        profile_rollup: proof?.premiumLead?.segment === 'premium_lead',
        activity_rollup: Number(proof?.premiumLead?.total_points ?? 0) >= 80 && Number(proof?.premiumLead?.onboarding_steps_completed ?? 0) >= 3,
        stuck_segment: proof?.stuck?.segment === 'stuck_onboarding',
        inactive_segment: proof?.inactive?.segment === 'at_risk_inactive',
        inactive_nudge: proof?.inactive?.next_nudge_key === 'first_action',
        nudge_queued: proof?.stuckNudges.length === 1,
        duplicate_rate_limit: secondRun?.nudgesQueued === 0,
        explainable_reasons: Array.isArray(proof?.stuck?.segment_reasons) && proof.stuck.segment_reasons.length > 0,
      } : null,
      startedAt,
      finishedAt: new Date().toISOString(),
    };

    await writeEvidence(smoke, evidence);
    if (!evidence.ok) process.exitCode = 1;
  } finally {
    if (smoke) await cleanupSmokeMembers(sb, Object.values(smokeUsers));
  }
}

async function writeEvidence(smoke: boolean, evidence: Record<string, unknown>) {
  await mkdir(discordEvidenceDir, { recursive: true });
  const evidencePath = path.join(discordEvidenceDir, smoke ? 'member-intelligence-smoke.json' : 'member-intelligence-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

  let phaseEvidencePath: string | null = null;
  if (smoke) {
    await mkdir(aiOsEvidenceDir, { recursive: true });
    phaseEvidencePath = path.join(aiOsEvidenceDir, 'phase-12-member-intelligence-v2-proof.json');
    await writeFile(phaseEvidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  }
  console.log(JSON.stringify({ ...evidence, evidencePath, phaseEvidencePath }, null, 2));
}

async function seedSmokeMembers(sb: any, users: Record<'premiumLead' | 'stuck' | 'inactive', string>) {
  const now = new Date();
  const inactiveSeenAt = new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString();

  await must(sb.from('discord_members').upsert([
    {
      discord_user_id: users.premiumLead,
      username: 'member-intel-premium-lead',
      academy_member: true,
      premium_member: false,
      path_key: 'ai_apps',
      level_key: 'builder',
      primary_goal: 'Ship useful AI apps from community signals.',
      preferred_support: 'premium_curious',
      last_seen_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      discord_user_id: users.stuck,
      username: 'member-intel-stuck',
      academy_member: true,
      premium_member: false,
      path_key: null,
      level_key: null,
      primary_goal: 'I need help finding the right path.',
      preferred_support: 'community',
      last_seen_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      discord_user_id: users.inactive,
      username: 'member-intel-inactive',
      academy_member: true,
      premium_member: false,
      path_key: 'websites',
      level_key: 'beginner',
      primary_goal: 'Improve a website project.',
      preferred_support: 'community',
      last_seen_at: inactiveSeenAt,
      updated_at: inactiveSeenAt,
    },
  ], { onConflict: 'discord_user_id' }), 'seed discord members');

  await must(sb.from('discord_member_onboarding_steps').upsert([
    { discord_user_id: users.premiumLead, discord_username: 'member-intel-premium-lead', step_key: 'intro', completed_at: now.toISOString() },
    { discord_user_id: users.premiumLead, discord_username: 'member-intel-premium-lead', step_key: 'path', completed_at: now.toISOString() },
    { discord_user_id: users.premiumLead, discord_username: 'member-intel-premium-lead', step_key: 'challenge', completed_at: now.toISOString() },
    { discord_user_id: users.inactive, discord_username: 'member-intel-inactive', step_key: 'intro', completed_at: inactiveSeenAt },
    { discord_user_id: users.inactive, discord_username: 'member-intel-inactive', step_key: 'path', completed_at: inactiveSeenAt },
    { discord_user_id: users.inactive, discord_username: 'member-intel-inactive', step_key: 'daily', completed_at: inactiveSeenAt },
  ], { onConflict: 'discord_user_id,step_key' }), 'seed onboarding steps');

  await must(sb.from('discord_points_ledger').insert([
    { discord_user_id: users.premiumLead, discord_username: 'member-intel-premium-lead', points: 45, reason: 'smoke', source: 'member_intelligence_smoke', created_at: now.toISOString() },
    { discord_user_id: users.premiumLead, discord_username: 'member-intel-premium-lead', points: 40, reason: 'smoke', source: 'member_intelligence_smoke', created_at: now.toISOString() },
    { discord_user_id: users.inactive, discord_username: 'member-intel-inactive', points: 20, reason: 'smoke', source: 'member_intelligence_smoke', created_at: inactiveSeenAt },
  ]), 'seed points ledger');

  const { data: question, error } = await sb.from('discord_questions').insert({
    discord_user_id: users.premiumLead,
    discord_username: 'member-intel-premium-lead',
    question: 'How should I scope this AI project?',
    context: 'Smoke test',
    status: 'answered',
  }).select('id').single();
  if (error) throw error;
  await must(sb.from('discord_answers').insert([
    {
      question_id: question.id,
      discord_user_id: users.premiumLead,
      discord_username: 'member-intel-premium-lead',
      answer: 'Start with one user, one input, one output, and one acceptance test.',
      helpful: true,
      points_awarded: 10,
    },
    {
      question_id: question.id,
      discord_user_id: users.premiumLead,
      discord_username: 'member-intel-premium-lead',
      answer: 'Ship the smallest demo that proves the workflow before adding automations.',
      helpful: true,
      points_awarded: 10,
    },
  ]), 'seed answers');
}

async function loadSmokeProof(sb: any, users: Record<'premiumLead' | 'stuck' | 'inactive', string>) {
  const profileSelect = 'discord_user_id, username, segment, segment_confidence, segment_reasons, next_best_action, risk_flags, strengths, next_nudge_key, next_nudge_reason, total_points, current_streak, onboarding_steps_completed, metadata, timeline';
  const [premiumLead, stuck, inactive, stuckNudges, allNudges] = await Promise.all([
    sb.from('discord_member_intelligence_profiles').select(profileSelect).eq('discord_user_id', users.premiumLead).maybeSingle(),
    sb.from('discord_member_intelligence_profiles').select(profileSelect).eq('discord_user_id', users.stuck).maybeSingle(),
    sb.from('discord_member_intelligence_profiles').select(profileSelect).eq('discord_user_id', users.inactive).maybeSingle(),
    sb.from('discord_member_nudge_queue').select('id, nudge_key, status, priority, reason, rate_limit_until').eq('discord_user_id', users.stuck).order('created_at', { ascending: true }),
    sb.from('discord_member_nudge_queue').select('id, discord_user_id, nudge_key, status, priority').in('discord_user_id', Object.values(users)),
  ]);
  for (const result of [premiumLead, stuck, inactive, stuckNudges, allNudges]) {
    if (result.error) throw result.error;
  }
  return {
    premiumLead: premiumLead.data,
    stuck: stuck.data,
    inactive: inactive.data,
    stuckNudges: stuckNudges.data ?? [],
    allNudges: allNudges.data ?? [],
  };
}

async function cleanupSmokeMembers(sb: any, discordUserIds: string[]) {
  await sb.from('discord_member_nudge_queue').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_member_intelligence_profiles').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_answers').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_questions').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_challenge_submissions').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_project_submissions').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_points_ledger').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_member_streaks').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_member_onboarding_steps').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_premium_review_requests').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_office_hours_queue').delete().in('discord_user_id', discordUserIds);
  await sb.from('discord_members').delete().in('discord_user_id', discordUserIds);
}

async function must(query: PromiseLike<{ error?: { message: string } | null }>, label: string) {
  const result = await query;
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result;
}

main().catch(async (error) => {
  const smoke = process.argv.includes('--smoke');
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    smoke,
    finishedAt: new Date().toISOString(),
  };
  await writeEvidence(smoke, evidence);
  process.exit(1);
});
