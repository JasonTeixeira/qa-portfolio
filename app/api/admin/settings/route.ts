import { NextResponse } from 'next/server';
import { requireAdminApi, logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

const ALLOWED = new Set([
  'org_name',
  'default_tax_rate',
  'business_hours',
  'logo_url',
  'primary_color',
  'secondary_color',
  'notes',
]);

export async function PATCH(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const update: Record<string, unknown> = { updated_by: guard.userId };
  for (const k of Object.keys(body)) {
    if (ALLOWED.has(k)) update[k] = body[k];
  }

  const sb = supabaseAdmin();
  // Ensure singleton row exists
  await sb.from('studio_settings').upsert({ id: 1 }, { onConflict: 'id' });

  const { data: prev } = await sb.from('studio_settings').select('*').eq('id', 1).maybeSingle();
  const { data, error } = await sb
    .from('studio_settings')
    .update(update)
    .eq('id', 1)
    .select('*')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'studio_settings.update',
    entityType: 'studio_settings',
    entityId: '1',
    before: prev,
    after: data,
  });

  return NextResponse.json(data);
}
