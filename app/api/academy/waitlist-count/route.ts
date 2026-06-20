import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Real, live count of the academy founding waitlist (source-tagged). */
export async function GET() {
  try {
    const sb = supabaseAdmin()
    const { count, error } = await sb
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'academy_waitlist')
    if (error) {
      console.error('waitlist count error', error)
      return NextResponse.json({ count: 0 }, { status: 200 })
    }
    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}
