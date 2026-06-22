import { NextResponse } from 'next/server'
import { syncBlogDocuments } from '@/lib/blog/search-sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Mirrors the MDX posts into blog_documents for server-side search. Runs on a Vercel
// cron (see vercel.json) and is callable manually with the CRON_SECRET. Same auth
// shape as the other cron routes in this app.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }
  const auth = req.headers.get('authorization') ?? ''
  const headerSecret = req.headers.get('x-cron-secret') ?? ''
  if (auth !== `Bearer ${secret}` && headerSecret !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncBlogDocuments()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'sync failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// Allow POST too (manual triggers / external schedulers).
export const POST = GET
