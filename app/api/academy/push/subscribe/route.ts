import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SubSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(512),
  }),
})

async function currentUserId(): Promise<string | null> {
  const sb = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  return user?.id ?? null
}

/** Store (or refresh) a web-push subscription for the signed-in learner. */
export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, { limit: 20, windowMs: 60_000, prefix: 'push-sub' })
  if (!limited.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = SubSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid_subscription' }, { status: 400 })

  const { endpoint, keys } = parsed.data
  const admin = supabaseAdmin()
  const { error } = await admin.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
      last_used_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  )
  if (error) {
    console.error('[push/subscribe] upsert failed', error)
    return NextResponse.json({ error: 'store_failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

/** Remove a subscription (on unsubscribe / permission revoke). */
export async function DELETE(req: NextRequest) {
  const userId = await currentUserId()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = z.object({ endpoint: z.string().url() }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const admin = supabaseAdmin()
  await admin.from('push_subscriptions').delete().eq('user_id', userId).eq('endpoint', parsed.data.endpoint)
  return NextResponse.json({ ok: true })
}
