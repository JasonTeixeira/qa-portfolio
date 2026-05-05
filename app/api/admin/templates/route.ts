import { NextResponse } from 'next/server';
import { requireAdminApi, logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const title = String(body.title ?? '').trim();
  if (!title) return NextResponse.json({ error: 'missing_title' }, { status: 400 });

  const slug =
    String(body.slug ?? '').trim() ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const insert = {
    title,
    slug,
    category: (body.category as string) || 'other',
    body_md: (body.body_md as string) ?? '',
    active: body.active !== false,
    created_by: guard.userId,
  };

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('contract_templates')
    .insert(insert)
    .select('id, slug, title, category, body_md, active, version, updated_at')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'template.create',
    entityType: 'contract_template',
    entityId: data?.id ?? null,
    after: data,
  });

  return NextResponse.json(data);
}
