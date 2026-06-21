import { NextResponse } from 'next/server';
import { recordDiscordScheduledRun } from '@/lib/discord/analytics';
import { publishApprovedDailySignalDraft } from '@/lib/discord/daily-planner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}` || req.headers.get('x-cron-secret') === secret;
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await publishApprovedDailySignalDraft({
      source: 'vercel-cron-publish',
      createIfMissing: false,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 202 });
  } catch (err) {
    await recordDiscordScheduledRun({
      runKey: `daily-signal-${new Date().toISOString().slice(0, 10)}`,
      kind: 'daily_signal',
      status: 'failed',
      metadata: {
        source: 'vercel-cron-publish',
        error: err instanceof Error ? err.message : String(err),
      },
    });
    return NextResponse.json({ error: 'Daily signal publish failed' }, { status: 500 });
  }
}
