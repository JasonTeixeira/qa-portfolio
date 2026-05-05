import { NextResponse, type NextRequest } from 'next/server';
import { sendWelcomeEmail } from '@/lib/welcomeEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { to?: string; fullName?: string };
  try {
    body = (await req.json()) as { to?: string; fullName?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const to = (body.to ?? '').trim().toLowerCase();
  const fullName = (body.fullName ?? '').trim();

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const result = await sendWelcomeEmail({ to, fullName });
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 202 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}
