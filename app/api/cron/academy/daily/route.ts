import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { runStreakReminders } from '@/lib/notifications/academy-notify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function safeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return safeEq(req.headers.get('authorization') ?? '', `Bearer ${secret}`) || safeEq(req.headers.get('x-cron-secret') ?? '', secret)
}

/** Daily academy cron — streak-save reminders (timezone + send-window + cap aware). */
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const summary = await runStreakReminders()
    return NextResponse.json({ ok: true, ...summary })
  } catch (err) {
    console.error('[cron/academy/daily] failed', err)
    return NextResponse.json({ ok: false, error: 'run_failed' }, { status: 500 })
  }
}
