import { sendEmail, SITE } from '@/lib/email/send'

type Args = { email: string; position: number; refCode: string }

/**
 * Branded founding-waitlist welcome email. Dark, on-brand, inline-styled (email
 * clients ignore stylesheets). Confirms the signup, shows their position, and
 * hands them their referral link so the loop starts in the inbox too.
 */
export async function sendAcademyWaitlistWelcome({ email, position, refCode }: Args) {
  const refUrl = `${SITE}/learn/waitlist?ref=${refCode}`
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    'Sage Academy is coming — project-based courses + labs to learn code & AI, $20/mo. Founding spots are open:',
  )}&url=${encodeURIComponent(refUrl)}`

  const html = `<!doctype html><html><body style="margin:0;background:#0b0b0e;">
  <div style="max-width:540px;margin:0 auto;padding:40px 28px;background:#0b0b0e;color:#f2efe9;font-family:'Hanken Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
      <span style="display:inline-block;width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#3d5afe,#7c3aed 55%,#ff2d9b);color:#fff;font-weight:800;text-align:center;line-height:30px;">S</span>
      <span style="font-weight:800;font-size:16px;letter-spacing:-0.01em;">Sage Academy</span>
    </div>

    <h1 style="margin:0 0 8px;font-size:28px;line-height:1.1;letter-spacing:-0.02em;font-weight:800;">You’re on the founding list.</h1>
    <p style="margin:0 0 24px;color:#9c9ca6;font-size:15px;line-height:1.55;">
      You’re in early — which is exactly where you want to be. Founding members lock <strong style="color:#f2efe9;">$20/mo for life</strong>, get the first month free, and help shape what we build first.
    </p>

    <div style="border:1px solid #2a2a33;border-radius:14px;padding:20px;margin-bottom:24px;background:#141418;">
      <div style="font-family:monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8a8a94;">Your position</div>
      <div style="font-size:40px;font-weight:800;letter-spacing:-0.03em;background:linear-gradient(120deg,#3d5afe,#ff2d9b);-webkit-background-clip:text;background-clip:text;color:#8fa0ff;">#${position.toLocaleString()}</div>
      <p style="margin:10px 0 14px;color:#b6b6c0;font-size:14px;line-height:1.5;">Move up by inviting builders — <strong style="color:#f2efe9;">every friend who joins with your link jumps you 5 spots.</strong></p>
      <div style="font-family:monospace;font-size:13px;color:#9c9ca6;word-break:break-all;background:#0b0b0e;border:1px solid #1e1e24;border-radius:8px;padding:10px 12px;">${refUrl.replace('https://', '')}</div>
      <a href="${tweet}" style="display:inline-block;margin-top:14px;padding:11px 18px;border-radius:999px;background:linear-gradient(100deg,#3d5afe,#ff2d9b);color:#fff;font-weight:700;font-size:14px;text-decoration:none;">Share &amp; move up →</a>
    </div>

    <p style="margin:0 0 6px;color:#9c9ca6;font-size:14px;">What you’re building toward:</p>
    <ul style="margin:0 0 24px;padding-left:18px;color:#b6b6c0;font-size:14px;line-height:1.7;">
      <li>Project-based courses — you build real things, not watch slides</li>
      <li>Guided labs with starter code and checkpoints</li>
      <li>Code &amp; AI: from your first line to a deployed product</li>
    </ul>

    <p style="margin:0 0 24px;color:#9c9ca6;font-size:15px;line-height:1.6;">
      I’ll email you the moment the doors open. Thanks for being early.<br/>
      <strong style="color:#f2efe9;">— Jason, Sage Ideas</strong>
    </p>

    <hr style="border:none;border-top:1px solid #1e1e24;margin:0 0 16px;" />
    <p style="margin:0;color:#6b6b78;font-size:12px;line-height:1.5;">
      You’re getting this because you joined the Sage Academy waitlist.
      <a href="${SITE}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#8a8a94;">Unsubscribe</a>.
    </p>
  </div></body></html>`

  const text = `You're on the Sage Academy founding list.

Your position: #${position}
Move up — every friend who joins with your link jumps you 5 spots:
${refUrl}

Founding members lock $20/mo for life, get the first month free, and help shape what we build first.

I'll email you the moment the doors open.
— Jason, Sage Ideas`

  return sendEmail({
    to: email,
    subject: 'You’re on the Sage Academy founding list',
    html,
    text,
    templateKey: 'academy_waitlist_welcome',
    metadata: { source: 'academy_waitlist', position, refCode },
  })
}
