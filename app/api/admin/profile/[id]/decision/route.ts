import { NextResponse } from 'next/server';
import { requireAdminApi, logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

async function handle(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  let decision = 'reject';
  const ct = req.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const body = (await req.json().catch(() => ({}))) as { decision?: string };
    decision = body.decision ?? decision;
  } else {
    const fd = await req.formData().catch(() => null);
    if (fd) decision = String(fd.get('decision') ?? decision);
  }

  const sb = supabaseAdmin();
  const { data: prev } = await sb
    .from('profiles')
    .select('app_role, approval_status')
    .eq('id', id)
    .maybeSingle();

  let update: Record<string, string | null>;
  if (decision === 'approve') {
    update = {
      approval_status: 'approved',
      app_role: 'client',
      approved_at: new Date().toISOString(),
      approved_by: guard.userId,
    };
  } else {
    update = {
      approval_status: 'rejected',
      app_role: 'pending',
    };
  }

  const { error } = await sb.from('profiles').update(update).eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: `profile.${decision}`,
    entityType: 'profile',
    entityId: id,
    before: prev,
    after: update,
  });

  // form submit → redirect back to dashboard; api call → JSON
  if (ct.includes('application/json')) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.redirect(new URL('/admin', req.url), { status: 303 });
}

export const POST = handle;
export const PATCH = handle;
