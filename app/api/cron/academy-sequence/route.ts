import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { ACADEMY_SEQUENCE, sendSequenceStep } from '@/lib/academy/waitlist-sequence'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PER_STEP_CAP = 80 // safety cap per run to avoid timeouts

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return (
    req.headers.get('authorization') === `Bearer ${secret}` ||
    req.headers.get('x-cron-secret') === secret
  )
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = supabaseAdmin()
  const now = Date.now()
  const results: Record<string, number> = {}

  for (const step of ACADEMY_SEQUENCE) {
    const cutoff = new Date(now - step.minDays * 86400000).toISOString()

    // Candidates: signed up at least `minDays` ago.
    const { data: candidates, error: candErr } = await sb
      .from('academy_waitlist')
      .select('email, ref_code')
      .lte('created_at', cutoff)
      .order('created_at', { ascending: true })
      .limit(PER_STEP_CAP * 3)
    if (candErr || !candidates?.length) {
      results[step.key] = 0
      continue
    }

    // Who already received this step (dedup via email_log).
    const { data: sentRows } = await sb
      .from('email_log')
      .select('recipient')
      .eq('template_key', step.key)
    const sent = new Set((sentRows ?? []).map((r) => (r.recipient as string)?.toLowerCase()))

    const due = candidates
      .filter((c) => !sent.has((c.email as string)?.toLowerCase()))
      .slice(0, PER_STEP_CAP)

    let count = 0
    for (const c of due) {
      try {
        await sendSequenceStep(step, { email: c.email as string, refCode: c.ref_code as string })
        count++
      } catch {
        // Individual send failure shouldn't abort the run.
      }
    }
    results[step.key] = count
  }

  return NextResponse.json({ ok: true, sent: results })
}
