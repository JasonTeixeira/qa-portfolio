import { NextResponse } from 'next/server';
import { requireAdminApi, logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

const TYPES = new Set([
  'meeting',
  'milestone',
  'deadline',
  'internal',
  'client_call',
  'review',
  'other',
]);

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const title = String(body.title ?? '').trim();
  const starts_at = String(body.starts_at ?? '');
  const ends_at = String(body.ends_at ?? '');
  if (!title || !starts_at || !ends_at) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }
  const event_type = TYPES.has(String(body.event_type)) ? String(body.event_type) : 'meeting';

  const insert = {
    title,
    description: (body.description as string) || null,
    starts_at,
    ends_at,
    all_day: !!body.all_day,
    event_type,
    location: (body.location as string) || null,
    engagement_id: (body.engagement_id as string) || null,
    visible_to_client: body.visible_to_client !== false,
    owner_id: guard.userId,
  };

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('calendar_events')
    .insert(insert)
    .select(
      'id, title, description, starts_at, ends_at, event_type, location, all_day, engagement_id, visible_to_client',
    )
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'calendar_event.create',
    entityType: 'calendar_event',
    entityId: data?.id ?? null,
    after: data,
  });

  return NextResponse.json(data);
}
