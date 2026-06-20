import { sendEmail, SITE } from '@/lib/email/send'

/**
 * Academy waitlist nurture sequence. Each step is sent once per subscriber by
 * the /api/cron/academy-sequence cron, deduped via email_log.template_key.
 * Day 0 (welcome) is sent at signup — see lib/academy/waitlist-welcome.ts.
 */

function shell(inner: string, email: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0b0b0e;">
  <div style="max-width:540px;margin:0 auto;padding:40px 28px;background:#0b0b0e;color:#f2efe9;font-family:'Hanken Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
      <span style="display:inline-block;width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#3d5afe,#7c3aed 55%,#ff2d9b);color:#fff;font-weight:800;text-align:center;line-height:30px;">S</span>
      <span style="font-weight:800;font-size:16px;">Sage Academy</span>
    </div>
    ${inner}
    <hr style="border:none;border-top:1px solid #1e1e24;margin:28px 0 16px;" />
    <p style="margin:0;color:#6b6b78;font-size:12px;line-height:1.5;">
      You're on the Sage Academy founding waitlist.
      <a href="${SITE}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#8a8a94;">Unsubscribe</a>.
    </p>
  </div></body></html>`
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin-top:18px;padding:12px 20px;border-radius:999px;background:linear-gradient(100deg,#3d5afe,#ff2d9b);color:#fff;font-weight:700;font-size:14px;text-decoration:none;">${label}</a>`

export type SeqStep = {
  /** Stable key used for dedup in email_log. */
  key: string
  /** Minimum age (days since signup) before this step fires. */
  minDays: number
  subject: string
  build: (args: { email: string; refCode: string }) => { html: string; text: string }
}

export const ACADEMY_SEQUENCE: SeqStep[] = [
  {
    key: 'academy_seq_day2',
    minDays: 2,
    subject: 'What you’ll actually build in Sage Academy',
    build: ({ email }) => {
      const inner = `
        <h1 style="margin:0 0 10px;font-size:24px;line-height:1.15;letter-spacing:-0.02em;font-weight:800;">You won’t just watch. You’ll build.</h1>
        <p style="margin:0 0 16px;color:#9c9ca6;font-size:15px;line-height:1.6;">Most “learn to code” programs leave you with notes and no projects. Sage Academy is the opposite — every lesson ends with a real, working thing you keep.</p>
        <p style="margin:0 0 8px;color:#f2efe9;font-size:15px;font-weight:600;">Three paths, from your first line to a shipped product:</p>
        <ul style="margin:0 0 8px;padding-left:18px;color:#b6b6c0;font-size:14px;line-height:1.8;">
          <li><strong style="color:#f2efe9;">Code Foundations</strong> — Python, JS/TS, the terminal, Git</li>
          <li><strong style="color:#f2efe9;">AI Engineering</strong> — the LLM API, prompting, RAG, agents</li>
          <li><strong style="color:#f2efe9;">Ship Real Products</strong> — Next.js, Supabase, auth, payments, deploy</li>
        </ul>
        ${btn(`${SITE}/learn`, 'Preview the academy →')}`
      const text = `You won't just watch — you'll build. Three paths: Code Foundations, AI Engineering, Ship Real Products. Preview: ${SITE}/learn`
      return { html: shell(inner, email), text }
    },
  },
  {
    key: 'academy_seq_day5',
    minDays: 5,
    subject: 'Want to jump the line?',
    build: ({ email, refCode }) => {
      const refUrl = `${SITE}/learn/waitlist?ref=${refCode}`
      const inner = `
        <h1 style="margin:0 0 10px;font-size:24px;line-height:1.15;letter-spacing:-0.02em;font-weight:800;">Move up the founding list.</h1>
        <p style="margin:0 0 16px;color:#9c9ca6;font-size:15px;line-height:1.6;">Founding spots (and the $20/mo-for-life price) are limited to the first 1,000. Every builder who joins with your link jumps you <strong style="color:#f2efe9;">5 spots</strong> — and unlocks rewards:</p>
        <ul style="margin:0 0 8px;padding-left:18px;color:#b6b6c0;font-size:14px;line-height:1.8;">
          <li>3 referrals → first month free</li>
          <li>10 → founding price locked for life</li>
          <li>25 → a 1:1 build session with me</li>
        </ul>
        <p style="margin:14px 0 0;font-family:monospace;font-size:13px;color:#9c9ca6;word-break:break-all;background:#141418;border:1px solid #1e1e24;border-radius:8px;padding:10px 12px;">${refUrl.replace('https://', '')}</p>
        ${btn(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Sage Academy is coming — learn to build with code & AI, $20/mo. Founding spots open:')}&url=${encodeURIComponent(refUrl)}`, 'Share & jump the line →')}`
      const text = `Move up the founding list — every friend who joins with your link jumps you 5 spots. Your link: ${refUrl}`
      return { html: shell(inner, email), text }
    },
  },
]

export async function sendSequenceStep(step: SeqStep, sub: { email: string; refCode: string }) {
  const { html, text } = step.build(sub)
  return sendEmail({
    to: sub.email,
    subject: step.subject,
    html,
    text,
    templateKey: step.key,
    metadata: { source: 'academy_waitlist', step: step.key },
  })
}
