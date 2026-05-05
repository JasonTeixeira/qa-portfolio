import { NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ALLOWED_DIGEST = new Set(['off', 'daily', 'weekly']);

export async function PATCH(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const digest = typeof payload.digest_frequency === 'string' ? payload.digest_frequency : 'daily';
  if (!ALLOWED_DIGEST.has(digest)) {
    return NextResponse.json({ error: 'Invalid digest frequency' }, { status: 400 });
  }

  const update = {
    email_message: !!payload.email_message,
    email_deliverable: !!payload.email_deliverable,
    email_invoice: !!payload.email_invoice,
    email_status_report: !!payload.email_status_report,
    email_marketing: !!payload.email_marketing,
    digest_frequency: digest,
  };

  const ctx = await getPortalContext();
  const sb = supabaseAdmin();

  const { error } = await sb
    .from('notification_preferences')
    .upsert({ user_id: ctx.user.clerk_id, ...update }, { onConflict: 'user_id' });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
