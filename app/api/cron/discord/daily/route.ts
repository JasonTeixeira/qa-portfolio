import { NextResponse } from 'next/server';
import { postDailySignal } from '@/lib/discord/sage-commands';
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
    const messageId = await postDailySignal('vercel-cron');
    return NextResponse.json({ ok: true, messageId });
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
