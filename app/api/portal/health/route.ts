import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  const ts = new Date().toISOString();
  try {
    const sb = supabaseAdmin();
    const { error } = await sb.from('service_catalog').select('id').limit(1);
    if (error) {
      console.error('[portal/health] db check failed', error);
      return NextResponse.json({ ok: false, ts }, { status: 503 });
    }
    return NextResponse.json({ ok: true, ts });
  } catch (e) {
    console.error('[portal/health] health check failed', e);
    return NextResponse.json({ ok: false, ts }, { status: 503 });
  }
}
