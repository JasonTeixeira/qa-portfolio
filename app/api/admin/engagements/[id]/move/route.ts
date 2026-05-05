import { NextResponse } from 'next/server';
import { requireAdminApi, logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

const STAGES = new Set([
  'discovery',
  'proposal',
  'contract',
  'active',
  'review',
  'complete',
  'archived',
]);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = (await req.json().catch(() => null)) as
    | { pipeline_stage?: string; kanban_position?: number }
    | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const stage = String(body.pipeline_stage ?? '');
  if (!STAGES.has(stage)) {
    return NextResponse.json({ error: 'invalid_stage' }, { status: 400 });
  }
  const position = Number.isFinite(body.kanban_position) ? Number(body.kanban_position) : 0;

  const sb = supabaseAdmin();
  const { data: prev } = await sb
    .from('engagements')
    .select('id, pipeline_stage, kanban_position')
    .eq('id', id)
    .maybeSingle();

  const { data, error } = await sb
    .from('engagements')
    .update({ pipeline_stage: stage, kanban_position: position })
    .eq('id', id)
    .select('id, pipeline_stage, kanban_position')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'engagement.move',
    entityType: 'engagement',
    entityId: id,
    before: prev,
    after: data,
  });

  return NextResponse.json(data);
}
