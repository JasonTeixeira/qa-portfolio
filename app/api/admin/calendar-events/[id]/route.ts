import { NextResponse } from 'next/server';
import { requireAdminApi, logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

const ALLOWED = new Set([
  'title',
  'description',
  'starts_at',
  'ends_at',
  'all_day',
  'event_type',
  'location',
  'engagement_id',
  'visible_to_client',
]);

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
  const { data: prev } = await sb.from('calendar_events').select('*').eq('id', id).maybeSingle();
  const { data, error } = await sb
    .from('calendar_events')
    .update(update)
    .eq('id', id)
    .select(
      'id, title, description, starts_at, ends_at, event_type, location, all_day, engagement_id, visible_to_client',
    )
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'calendar_event.update',
    entityType: 'calendar_event',
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
  const { data: prev } = await sb.from('calendar_events').select('*').eq('id', id).maybeSingle();
  const { error } = await sb.from('calendar_events').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'calendar_event.delete',
    entityType: 'calendar_event',
    entityId: id,
    before: prev,
  });

  return NextResponse.json({ ok: true });
}
