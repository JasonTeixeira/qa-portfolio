import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { requireAdminApi, logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

function siteOrigin(h: Headers) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = String(body?.email ?? '').trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'missing_email' }, { status: 400 });

  const h = await headers();
  const origin = siteOrigin(h);
  const sb = supabaseAdmin();

  const { data: invited, error } = await sb.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/admin`,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Pre-mark profile as admin so first sign-in lands in cockpit.
  if (invited?.user?.id) {
    await sb
      .from('profiles')
      .update({
        app_role: 'admin',
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: guard.userId,
      })
      .eq('id', invited.user.id);
  }

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'team.invite',
    entityType: 'profile',
    entityId: invited?.user?.id ?? null,
    after: { email, role: 'admin' },
  });

  return NextResponse.json({ ok: true, email });
}
