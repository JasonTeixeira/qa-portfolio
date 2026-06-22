import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { awardDiscordPoints, getLeaderboard } from '@/lib/discord/engagement';
import { createWeeklyRecapDraft, discordWeekKey } from '@/lib/discord/weekly-automation';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

function requireEnv(name: string): string {
  const value = process.env[name]?.replace(/\\n/g, '').trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const startedAt = new Date().toISOString();
  const now = new Date('2099-01-14T12:00:00.000Z');
  const weekKey = discordWeekKey(now);
  const users = [
    { id: 'smoke-weekly-leader-1', username: 'weekly-leader-one', points: 35 },
    { id: 'smoke-weekly-leader-2', username: 'weekly-leader-two', points: 20 },
    { id: 'smoke-weekly-leader-3', username: 'weekly-leader-three', points: 10 },
  ];

  await cleanup(sb, weekKey, users.map((user) => user.id));

  for (const user of users) {
    await awardDiscordPoints({
      discordUserId: user.id,
      username: user.username,
      points: user.points,
      reason: 'weekly_leaderboard_smoke',
      source: 'weekly_smoke',
      actionKey: `weekly-smoke:${weekKey}:${user.id}`,
      metadata: { week_key: weekKey },
    });
  }

  const beforeDraftLeaderboard = await getLeaderboard(5);
  const draft = await createWeeklyRecapDraft({ now, metadata: { smoke: true, smoke_run: 'weekly_leaderboard_recap' } });

  const [{ data: snapshot }, { data: draftRow }, { data: ledgerRows }] = await Promise.all([
    sb
      .from('discord_leaderboard_snapshots')
      .select('id, period_key, period_start, period_end, rankings')
      .eq('period_key', weekKey)
      .maybeSingle(),
    sb
      .from('discord_content_drafts')
      .select('id, draft_type, target_channel_base_name, status, title, body, metadata, quality_score')
      .eq('id', draft.draftId)
      .maybeSingle(),
    sb
      .from('discord_points_ledger')
      .select('discord_user_id, points, source, action_key')
      .in('discord_user_id', users.map((user) => user.id)),
  ]);

  const rankings = Array.isArray(snapshot?.rankings) ? snapshot.rankings as Array<Record<string, unknown>> : [];
  const topSmoke = rankings.find((row) => row.discordUserId === users[0].id || row.discord_user_id === users[0].id);
  const draftMetadata = draftRow?.metadata && typeof draftRow.metadata === 'object'
    ? draftRow.metadata as Record<string, unknown>
    : {};
  const ok = Boolean(snapshot?.id)
    && snapshot?.period_key === weekKey
    && rankings.length >= 3
    && Number(topSmoke?.points ?? 0) === users[0].points
    && draft.ok
    && draft.leaderboardSnapshotId === snapshot?.id
    && draft.leaderboardCount >= 3
    && draftRow?.draft_type === 'weekly_recap'
    && draftRow?.target_channel_base_name === 'wins-showcase'
    && draftRow?.status === 'pending_approval'
    && String(draftRow?.body ?? '').includes('# Weekly Recap')
    && String(draftRow?.body ?? '').includes('**Leaderboard**')
    && draftMetadata.leaderboard_snapshot_id === snapshot?.id
    && Number(draftRow?.quality_score ?? 0) >= 80
    && (ledgerRows ?? []).length === users.length
    && beforeDraftLeaderboard.some((row) => row.discordUserId === users[0].id && row.points === users[0].points);

  await cleanup(sb, weekKey, users.map((user) => user.id), draft.draftId);

  const evidence = {
    ok,
    cleanedUp: true,
    weekKey,
    seededUsers: users,
    beforeDraftLeaderboard,
    draft,
    snapshot: snapshot ? {
      id: snapshot.id,
      periodKey: snapshot.period_key,
      rankingsCount: rankings.length,
      topSmoke,
    } : null,
    draftRow: draftRow ? {
      id: draftRow.id,
      draftType: draftRow.draft_type,
      targetChannelBaseName: draftRow.target_channel_base_name,
      status: draftRow.status,
      qualityScore: draftRow.quality_score,
      metadata: draftMetadata,
    } : null,
    ledgerCount: ledgerRows?.length ?? 0,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'weekly-leaderboard-recap-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!ok) process.exit(1);
}

async function cleanup(sb: SupabaseClient, weekKey: string, discordUserIds: string[], draftId?: string) {
  await Promise.all([
    sb.from('discord_leaderboard_snapshots').delete().eq('period_key', weekKey),
    sb.from('discord_points_ledger').delete().in('discord_user_id', discordUserIds),
    sb.from('discord_member_streaks').delete().in('discord_user_id', discordUserIds),
    draftId
      ? sb.from('discord_content_drafts').delete().eq('id', draftId)
      : sb.from('discord_content_drafts').delete().contains('metadata', { smoke_run: 'weekly_leaderboard_recap' }),
  ]);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'weekly-leaderboard-recap-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
