import { NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ctx = await getPortalContext();
  const body = await req.json();

  const { signature_data, signer_name, signer_email, user_agent } = body;
  if (!signature_data) {
    return NextResponse.json({ error: 'Missing signature data' }, { status: 400 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] ??
    req.headers.get('x-real-ip') ??
    'unknown';

  const sb = supabaseAdmin();

  // Verify document
  const { data: doc } = await sb.from('documents').select('*').eq('id', id).single();
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  if (!ctx.isAdmin && doc.organization_id !== ctx.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Insert signature audit
  const { error: auditErr } = await sb.from('signature_audits').insert({
    document_id: id,
    signer_id: ctx.user.id,
    signer_name,
    signer_email,
    signature_data,
    ip_address: ip,
    user_agent,
  });
  if (auditErr) return NextResponse.json({ error: auditErr.message }, { status: 500 });

  // Update doc status
  await sb
    .from('documents')
    .update({ status: 'signed', signed_at: new Date().toISOString() })
    .eq('id', id);

  // Activity event
  await sb.from('activity').insert({
    organization_id: doc.organization_id,
    engagement_id: doc.engagement_id,
    actor_id: ctx.user.id,
    type: 'document.signed',
    payload: { document_id: id, document_title: doc.title },
  });

  return NextResponse.json({ ok: true });
}
