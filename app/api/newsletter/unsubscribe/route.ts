import { NextResponse, type NextRequest } from 'next/server'
import { normalizeEmail, isValidEmail } from '@/lib/newsletter'
import { unsubscribeContact } from '@/lib/newsletter-audience'
import { SITE } from '@/lib/email/send'

export const dynamic = 'force-dynamic'

function redirect(path: string) {
  return NextResponse.redirect(new URL(path, SITE), { status: 302 })
}

// One-click unsubscribe (from the List-Unsubscribe header ?email=…). Removal is
// low-risk and standard to allow by email alone; marks the Resend contact
// unsubscribed (no-op if no audience configured).
export async function GET(req: NextRequest) {
  const email = normalizeEmail(new URL(req.url).searchParams.get('email') ?? '')
  if (isValidEmail(email)) await unsubscribeContact(email)
  return redirect('/field-notes?unsubscribed=1')
}

export async function POST(req: NextRequest) {
  // Resend/Gmail one-click unsubscribe sends POST.
  const email = normalizeEmail(new URL(req.url).searchParams.get('email') ?? '')
  if (isValidEmail(email)) await unsubscribeContact(email)
  return NextResponse.json({ ok: true })
}
