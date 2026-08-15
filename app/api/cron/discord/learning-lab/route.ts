import { NextResponse } from 'next/server';
import { recordDiscordScheduledRun } from '@/lib/discord/analytics';
import {
  createScheduledLearningLabDraft,
  learningLabRunKey,
  publishApprovedLearningLabItems,
  type LearningLabCadence,
} from '@/lib/discord/learning-lab-scheduler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}` || req.headers.get('x-cron-secret') === secret;
}

function parseCadence(value: string | null): LearningLabCadence {
  return value === 'weekly' ? 'weekly' : 'daily';
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') ?? 'draft';
  const cadence = parseCadence(url.searchParams.get('cadence'));
  const date = url.searchParams.get('date') ? new Date(`${url.searchParams.get('date')}T12:00:00.000Z`) : new Date();
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  try {
    if (mode === 'publish') {
      const result = await publishApprovedLearningLabItems({
        cadence,
        date,
        source: `vercel-cron-learning-lab-${cadence}-publish`,
      });
      return NextResponse.json(result, { status: result.ok ? 200 : 202 });
    }

    const result = await createScheduledLearningLabDraft({
      cadence,
      date,
      metadata: { source: `vercel-cron-learning-lab-${cadence}` },
    });
    return NextResponse.json(result);
  } catch (err) {
    await recordDiscordScheduledRun({
      runKey: learningLabRunKey({ cadence, date }),
      kind: 'learning_lab',
      status: 'failed',
      metadata: {
        source: `vercel-cron-learning-lab-${cadence}`,
        error: err instanceof Error ? err.message : String(err),
      },
    });
    return NextResponse.json({ error: 'Learning lab job failed' }, { status: 500 });
  }
}
