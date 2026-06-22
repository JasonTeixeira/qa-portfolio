import { NextResponse } from 'next/server';
import { recordDiscordScheduledRun } from '@/lib/discord/analytics';
import { createWeeklyRecapDraft, publishApprovedWeeklyRecapDraft } from '@/lib/discord/weekly-automation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}` || req.headers.get('x-cron-secret') === secret;
}

function weekKey(now: Date): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') ?? 'draft';
    if (mode === 'publish') {
      const result = await publishApprovedWeeklyRecapDraft({
        source: 'vercel-cron-weekly-publish',
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 202 });
    }

    const result = await createWeeklyRecapDraft({
      metadata: { source: 'vercel-cron-weekly' },
    });
    return NextResponse.json(result);
  } catch (err) {
    await recordDiscordScheduledRun({
      runKey: `weekly-recap-${weekKey(new Date())}`,
      kind: 'weekly_recap',
      status: 'failed',
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
    return NextResponse.json({ error: 'Weekly recap failed' }, { status: 500 });
  }
}
