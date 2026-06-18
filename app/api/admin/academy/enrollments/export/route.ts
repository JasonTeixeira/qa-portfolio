import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

type EnrollmentRow = {
  created_at: string;
  track_slug: string;
  product_name: string;
  email: string;
  name: string | null;
  status: string;
  amount_cents: number | null;
  currency: string | null;
  stripe_checkout_session_id: string;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  access_starts_at: string;
  access_expires_at: string | null;
};

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { data, error } = await supabaseAdmin()
    .from('academy_enrollments')
    .select(
      'created_at, track_slug, product_name, email, name, status, amount_cents, currency, stripe_checkout_session_id, stripe_customer_id, stripe_payment_intent_id, access_starts_at, access_expires_at',
    )
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as EnrollmentRow[];
  const csv = [
    [
      'created_at',
      'track_slug',
      'product_name',
      'email',
      'name',
      'status',
      'amount_cents',
      'currency',
      'stripe_checkout_session_id',
      'stripe_customer_id',
      'stripe_payment_intent_id',
      'access_starts_at',
      'access_expires_at',
    ],
    ...rows.map((row) => [
      row.created_at,
      row.track_slug,
      row.product_name,
      row.email,
      row.name ?? '',
      row.status,
      String(row.amount_cents ?? ''),
      row.currency ?? '',
      row.stripe_checkout_session_id,
      row.stripe_customer_id ?? '',
      row.stripe_payment_intent_id ?? '',
      row.access_starts_at,
      row.access_expires_at ?? '',
    ]),
  ]
    .map((row) => row.map(csvCell).join(','))
    .join('\n');

  return new NextResponse(`${csv}\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sage-academy-enrollments.csv"',
      'Cache-Control': 'no-store',
    },
  });
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
