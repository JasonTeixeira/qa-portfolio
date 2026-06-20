import { sendEmail, SITE } from '@/lib/email/send'
import {
  emailShell,
  eyebrow,
  headline,
  para,
  strong,
  button,
  positionCard,
  refBox,
  checklist,
} from '@/lib/academy/email-theme'

type Args = { email: string; position: number; refCode: string }

/** Builds the founding-waitlist welcome email (subject + html + text). */
export function buildAcademyWelcomeEmail({ email, position, refCode }: Args) {
  const refUrl = `${SITE}/learn/waitlist?ref=${refCode}`
  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    'Sage Academy is coming — project-based courses + labs to learn code & AI, $20/mo. Founding spots are open:',
  )}&url=${encodeURIComponent(refUrl)}`

  const inner = `
    ${eyebrow('Founding cohort · you’re in')}
    ${headline('Most people who learn to code never ship.', 'You just made the first move.')}
    ${para(
      `You’re in early — exactly where you want to be. Founding members lock ${strong('$20/mo for life')}, get the first month free, and help shape what we build first.`,
    )}
    ${positionCard(position)}
    ${para(`Move up by inviting builders — ${strong('every friend who joins with your link jumps you 5 spots.')}`)}
    ${refBox(refUrl)}
    ${button(tweet, 'Share & move up →')}
    <div style="height:26px;"></div>
    ${para('What you’re building toward:')}
    ${checklist([
      'Project-based courses — you build real things, not watch slides',
      'Guided labs with starter code and checkpoints',
      'Code & AI: from your first line to a deployed product',
    ])}
    ${para(`I’ll email you the moment the doors open. Thanks for being early.<br/>${strong('— Jason, Sage Ideas')}`)}
  `

  const text = `You're on the Sage Academy founding list.

Your position: #${position}
Move up — every friend who joins with your link jumps you 5 spots:
${refUrl}

Founding members lock $20/mo for life, get the first month free, and help shape what we build first.

I'll email you the moment the doors open.
— Jason, Sage Ideas`

  return {
    subject: 'You’re on the Sage Academy founding list',
    html: emailShell(inner, email),
    text,
  }
}

/**
 * Branded founding-waitlist welcome email. Confirms the signup, shows the
 * member's position, and hands them their referral link so the loop starts
 * in the inbox too.
 */
export async function sendAcademyWaitlistWelcome({ email, position, refCode }: Args) {
  const { subject, html, text } = buildAcademyWelcomeEmail({ email, position, refCode })
  return sendEmail({
    to: email,
    subject,
    html,
    text,
    templateKey: 'academy_waitlist_welcome',
    metadata: { source: 'academy_waitlist', position, refCode },
  })
}
