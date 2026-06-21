import { NextResponse } from 'next/server';
import { createDailyPlannerDraft, publishApprovedDailySignalDraft } from '@/lib/discord/daily-planner';
import { recordDiscordScheduledRun } from '@/lib/discord/analytics';

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
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') ?? 'draft';
    if (mode === 'publish') {
      const result = await publishApprovedDailySignalDraft({
        source: 'vercel-cron',
        createIfMissing: true,
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 202 });
    }

    const result = await createDailyPlannerDraft({
      metadata: { source: 'vercel-cron' },
    });
    return NextResponse.json(result);
  } catch (err) {
    await recordDiscordScheduledRun({
      runKey: `daily-signal-${new Date().toISOString().slice(0, 10)}`,
      kind: 'daily_signal',
      status: 'failed',
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
    return NextResponse.json({ error: 'Daily signal failed' }, { status: 500 });
  }
}
