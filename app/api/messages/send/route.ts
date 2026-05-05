import { NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let payload: { engagementId?: string; threadId?: string; body?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const body = (payload.body ?? '').trim();
  const engagementId = payload.engagementId;
  const threadId = payload.threadId;

  if (!body) return NextResponse.json({ error: 'Empty message' }, { status: 400 });
  if (body.length > 8000) return NextResponse.json({ error: 'Message too long' }, { status: 400 });
  if (!engagementId || !threadId) {
    return NextResponse.json({ error: 'Missing engagementId or threadId' }, { status: 400 });
  }

  const ctx = await getPortalContext();
  const sb = supabaseAdmin();

  const { data: thread } = await sb
    .from('threads')
    .select('id, engagement_id, organization_id')
    .eq('id', threadId)
    .maybeSingle();
  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  if (thread.engagement_id !== engagementId) {
    return NextResponse.json({ error: 'Thread does not match engagement' }, { status: 400 });
  }
  if (!ctx.isAdmin && thread.organization_id !== ctx.organizationId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: inserted, error } = await sb
    .from('messages')
    .insert({ thread_id: threadId, sender_id: ctx.user.id, body })
    .select('id, thread_id, body, sender_id, created_at')
    .single();
  if (error || !inserted) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });
  }

  await sb
    .from('threads')
    .update({ last_message_at: inserted.created_at })
    .eq('id', threadId);

  await sb
    .from('message_read_receipts')
    .upsert(
      { message_id: inserted.id, user_id: ctx.user.clerk_id },
      { onConflict: 'message_id,user_id', ignoreDuplicates: true },
    );

  return NextResponse.json({ message: inserted });
}
