import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  buildApplicationPacketExport,
  type ApplicationPacket,
} from '@/lib/revenue-os/application-packets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isApplicationPacket(value: unknown): value is ApplicationPacket {
  if (!value || typeof value !== 'object') return false;
  const packet = value as Partial<ApplicationPacket>;
  return Boolean(
    packet.jobTitle &&
    packet.company &&
    packet.resumeVariant &&
    Array.isArray(packet.targetedBullets) &&
    Array.isArray(packet.checklist) &&
    packet.metadata,
  );
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) return admin;
  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: 'invalid_packet_id' }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('revenue_job_applications')
    .select('id, metadata')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: 'packet_lookup_failed' }, { status: 500 });
  }

  const packet = data?.metadata?.applicationPacket;
  if (!isApplicationPacket(packet)) {
    return NextResponse.json({ ok: false, error: 'packet_not_found' }, { status: 404 });
  }

  const exported = buildApplicationPacketExport({ packet, format: 'markdown' });
  return new NextResponse(exported.body, {
    status: 200,
    headers: {
      'Content-Type': exported.mimeType,
      'Content-Disposition': `attachment; filename="${exported.filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
