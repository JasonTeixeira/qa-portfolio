import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from('service_catalog').select('id').limit(1);
    if (error) {
      console.error('[portal/health] db check failed', error);
    }
    return NextResponse.json({
      ok: !error,
      db: error ? 'error' : 'connected',
      env: {
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_auth: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[portal/health] health check failed', e);
    return NextResponse.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
