import { NextResponse } from 'next/server';
import { requireAdminApi, logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

const ALLOWED = new Set(['title', 'slug', 'category', 'body_md', 'active']);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const update: Record<string, unknown> = {};
  for (const k of Object.keys(body)) {
    if (ALLOWED.has(k)) update[k] = body[k];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no_fields' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: prev } = await sb
    .from('contract_templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  // bump version on body change
  if ('body_md' in update && prev && prev.body_md !== update.body_md) {
    update.version = (prev.version ?? 1) + 1;
  }

  const { data, error } = await sb
    .from('contract_templates')
    .update(update)
    .eq('id', id)
    .select('id, slug, title, category, body_md, active, version, updated_at')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'template.update',
    entityType: 'contract_template',
    entityId: id,
    before: prev,
    after: data,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const sb = supabaseAdmin();
  const { data: prev } = await sb
    .from('contract_templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  const { error } = await sb.from('contract_templates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'template.delete',
    entityType: 'contract_template',
    entityId: id,
    before: prev,
  });

  return NextResponse.json({ ok: true });
}
