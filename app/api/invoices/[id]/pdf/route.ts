import { NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const portal = await getPortalContext();
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('invoices')
    .select('id, organization_id')
    .eq('id', id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!portal.isAdmin && data.organization_id !== portal.organizationId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json(
    { error: 'PDF generation ships in the next deploy.', invoiceId: id },
    { status: 501 },
  );
}
