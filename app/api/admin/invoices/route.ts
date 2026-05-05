import { NextResponse } from 'next/server';
import { requireAdminApi, logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

interface LineItemInput {
  description: string;
  quantity: number;
  unit_price: number;
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = (await req.json().catch(() => null)) as
    | {
        engagement_id: string;
        organization_id: string | null;
        number?: string | null;
        due_date?: string | null;
        tax_pct?: number;
        notes?: string | null;
        line_items: LineItemInput[];
      }
    | null;

  if (!body || !body.engagement_id) {
    return NextResponse.json({ error: 'missing_engagement' }, { status: 400 });
  }
  const items = (body.line_items ?? []).filter((it) => it.description?.trim());
  if (items.length === 0) {
    return NextResponse.json({ error: 'no_line_items' }, { status: 400 });
  }

  const subtotal = items.reduce(
    (s, it) => s + Number(it.quantity ?? 0) * Number(it.unit_price ?? 0),
    0,
  );
  const taxPct = Number(body.tax_pct ?? 0);
  const tax = subtotal * (taxPct / 100);
  const total = subtotal + tax;

  const sb = supabaseAdmin();
  const insert = {
    engagement_id: body.engagement_id,
    organization_id: body.organization_id ?? null,
    number: body.number ?? null,
    status: 'draft',
    amount: subtotal,
    subtotal,
    tax,
    total,
    due_date: body.due_date ?? null,
    notes: body.notes ?? null,
  };

  const { data: inv, error: invErr } = await sb
    .from('invoices')
    .insert(insert)
    .select('id')
    .maybeSingle();
  if (invErr || !inv) {
    return NextResponse.json({ error: invErr?.message ?? 'insert_failed' }, { status: 400 });
  }

  const lineRows = items.map((it, i) => ({
    invoice_id: inv.id,
    description: it.description,
    quantity: Number(it.quantity ?? 1),
    unit_price: Number(it.unit_price ?? 0),
    amount: Number(it.quantity ?? 1) * Number(it.unit_price ?? 0),
    position: i,
  }));

  const { error: liErr } = await sb.from('invoice_line_items').insert(lineRows);
  if (liErr) {
    // Best-effort cleanup; don't strand a half-created invoice.
    await sb.from('invoices').delete().eq('id', inv.id);
    return NextResponse.json({ error: liErr.message }, { status: 400 });
  }

  await logAudit({
    actorId: guard.userId,
    actorEmail: guard.email,
    action: 'invoice.create',
    entityType: 'invoice',
    entityId: inv.id,
    after: { ...insert, line_items: lineRows },
  });

  return NextResponse.json({ id: inv.id });
}
