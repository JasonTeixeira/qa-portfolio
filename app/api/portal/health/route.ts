import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from('service_catalog').select('id').limit(1);
    return NextResponse.json({
      ok: !error,
      db: error ? 'error: ' + error.message : 'connected',
      env: {
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabase_auth: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      ts: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
