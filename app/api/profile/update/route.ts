import { NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
  let payload: { full_name?: string; company?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const fullName = (payload.full_name ?? '').trim();
  const company = (payload.company ?? '').trim();
  if (fullName.length > 200 || company.length > 200) {
    return NextResponse.json({ error: 'Field too long' }, { status: 400 });
  }

  const ctx = await getPortalContext();
  const sb = supabaseAdmin();

  const { error } = await sb
    .from('profiles')
    .update({ full_name: fullName, company })
    .eq('id', ctx.user.clerk_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sb
    .from('app_users')
    .update({ full_name: fullName })
    .eq('clerk_id', ctx.user.clerk_id);

  return NextResponse.json({ ok: true });
}
