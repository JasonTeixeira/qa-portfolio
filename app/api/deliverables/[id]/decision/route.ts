import { NextResponse } from 'next/server';
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let payload: { decision?: unknown; comment?: unknown };
  try {
    payload = (await req.json()) as { decision?: unknown; comment?: unknown };
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const decision =
    payload.decision === 'approved' ||
    payload.decision === 'rejected' ||
    payload.decision === 'changes_requested'
      ? payload.decision
      : null;
  if (!decision) {
    return NextResponse.json({ error: 'invalid_decision' }, { status: 400 });
  }
  const comment = typeof payload.comment === 'string' ? payload.comment : null;

  const sb = supabaseAdmin();

  // Fetch deliverable + engagement to enforce membership.
  const { data: deliv } = await sb
    .from('deliverables')
    .select('id, engagement_id, status')
    .eq('id', id)
    .maybeSingle();

  if (!deliv) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Check user is admin or member of the engagement's org.
  const { data: profile } = await sb
    .from('profiles')
    .select('app_role')
    .eq('id', user.id)
    .maybeSingle();
  const isAdmin = profile?.app_role === 'admin';

  if (!isAdmin) {
    const { data: eng } = await sb
      .from('engagements')
      .select('organization_id')
      .eq('id', deliv.engagement_id)
      .maybeSingle();
    const { data: appUser } = await sb
      .from('app_users')
      .select('id')
      .eq('clerk_id', user.id)
      .maybeSingle();
    if (!appUser || !eng?.organization_id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const { data: membership } = await sb
      .from('org_memberships')
      .select('id')
      .eq('user_id', appUser.id)
      .eq('organization_id', eng.organization_id)
      .maybeSingle();
    if (!membership) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  }

  // Insert approval row.
  await sb.from('deliverable_approvals').insert({
    deliverable_id: id,
    approver_id: user.id,
    decision,
    comment,
  });

  // Mirror onto deliverable record.
  if (decision === 'approved') {
    await sb
      .from('deliverables')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        rejection_reason: null,
      })
      .eq('id', id);
  } else if (decision === 'rejected') {
    await sb
      .from('deliverables')
      .update({
        status: 'rejected',
        rejection_reason: comment,
      })
      .eq('id', id);
  } else {
    // changes_requested
    await sb
      .from('deliverables')
      .update({
        status: 'changes_requested',
        rejection_reason: comment,
      })
      .eq('id', id);
  }

  return NextResponse.json({ ok: true });
}
