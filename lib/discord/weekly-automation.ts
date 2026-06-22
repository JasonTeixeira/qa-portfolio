import { createDiscordContentDraft } from './content-approval';
import { createLeaderboardSnapshot } from './engagement';
import { buildWeeklyRecapContent } from './sage-commands';

export const DISCORD_WEEKLY_RECAP_PROMPT_VERSION = 'discord-weekly-recap-automation-v1';

export type WeeklyRecapDraftInput = {
  now?: Date;
  metadata?: Record<string, unknown>;
};

export type WeeklyRecapDraftResult = {
  ok: boolean;
  draftId: string;
  weekKey: string;
  leaderboardSnapshotId: string;
  leaderboardCount: number;
  qualityScore: number;
  bodyPreview: string;
};

export function discordWeekKey(now = new Date()): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function scoreWeeklyRecap(body: string): number {
  let score = 30;
  if (body.includes('# Weekly Recap')) score += 10;
  if (/\*\*Leaderboard\*\*/i.test(body)) score += 15;
  if (/\*\*Challenge recap\*\*/i.test(body)) score += 15;
  if (/\*\*Content queue\*\*/i.test(body)) score += 10;
  if (/\*\*Open questions\*\*/i.test(body)) score += 10;
  if (body.length >= 500) score += 10;
  return Math.max(0, Math.min(100, score));
}

export async function createWeeklyRecapDraft(input: WeeklyRecapDraftInput = {}): Promise<WeeklyRecapDraftResult> {
  const now = input.now ?? new Date();
  const weekKey = discordWeekKey(now);
  const leaderboardSnapshot = await createLeaderboardSnapshot({ now, periodKey: weekKey, limit: 10 });
  const body = await buildWeeklyRecapContent();
  const qualityScore = scoreWeeklyRecap(body);
  const draft = await createDiscordContentDraft({
    draftType: 'weekly_recap',
    targetChannelBaseName: 'wins-showcase',
    title: `Weekly Recap - ${weekKey}`,
    body,
    promptVersion: DISCORD_WEEKLY_RECAP_PROMPT_VERSION,
    qualityScore,
    status: 'pending_approval',
    metadata: {
      week_key: weekKey,
      leaderboard_snapshot_id: leaderboardSnapshot.id,
      leaderboard_count: leaderboardSnapshot.rankings.length,
      source: 'discord_weekly_recap_automation',
      ...(input.metadata ?? {}),
    },
  });
  return {
    ok: true,
    draftId: draft.id,
    weekKey,
    leaderboardSnapshotId: leaderboardSnapshot.id,
    leaderboardCount: leaderboardSnapshot.rankings.length,
    qualityScore,
    bodyPreview: body.slice(0, 300),
  };
}
