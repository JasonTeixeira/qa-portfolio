import { NextResponse } from 'next/server'
import { pushPublicKey } from '@/lib/notifications/push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Public VAPID key for the browser to subscribe with (null when push isn't configured). */
export async function GET() {
  return NextResponse.json({ key: pushPublicKey() })
}
