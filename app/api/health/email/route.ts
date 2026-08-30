import { NextResponse, type NextRequest } from 'next/server'
import { sendEmail, FROM } from '@/lib/email/send'

export const dynamic = 'force-dynamic'

/**
 * Email health check.
 *   GET /api/health/email
 *     → reports whether Resend is configured (key + audience) without sending.
 *   GET /api/health/email?to=you@email.com&secret=<CRON_SECRET>
 *     → sends a real test email so you can confirm delivery end-to-end.
 * The live send is gated by CRON_SECRET so it can't be abused as an open relay.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const config = {
    resendKeyPresent: !!process.env.RESEND_API_KEY,
    audienceConfigured: !!process.env.RESEND_AUDIENCE_ID,
    from: FROM,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.sageideas.dev',
    newsletterSecretSet: !!(process.env.NEWSLETTER_SECRET || process.env.CRON_SECRET),
  }

  const to = url.searchParams.get('to')
  if (!to) {
    return NextResponse.json({
      ok: config.resendKeyPresent,
      config,
      hint: config.resendKeyPresent
        ? 'Configured. Add ?to=you@email.com&secret=<CRON_SECRET> to send a live test.'
        : 'Set RESEND_API_KEY (and verify the sending domain in Resend). Then re-check.',
    })
  }

  const secret = url.searchParams.get('secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, config, error: 'Live test-send requires ?secret=<CRON_SECRET>.' },
      { status: 401 },
    )
  }

  const send = await sendEmail({
    to,
    subject: 'Sage Ideas — email health check ✓',
    templateKey: 'health-check',
    html: '<p style="font-family:sans-serif">If you can read this, Resend delivery is working. ✓</p>',
    text: 'If you can read this, Resend delivery is working.',
  })

  return NextResponse.json({ ok: send.ok, config, send }, { status: send.ok ? 200 : 502 })
}
