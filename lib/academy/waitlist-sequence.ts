import { sendEmail, SITE } from '@/lib/email/send'
import {
  emailShell,
  eyebrow,
  headline,
  para,
  strong,
  button,
  discordButton,
  refBox,
  checklist,
} from '@/lib/academy/email-theme'

const DISCORD_INVITE = 'https://discord.gg/KWPMEMJHGk'

/**
 * Academy waitlist nurture sequence. Each step is sent once per subscriber by
 * the /api/cron/academy-sequence cron, deduped via email_log.template_key.
 * Day 0 (welcome) is sent at signup — see lib/academy/waitlist-welcome.ts.
 */

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
        ${eyebrow('Day 2 · what you’ll build')}
        ${headline('You won’t just watch.', 'You’ll build.')}
        ${para(
          'Most “learn to code” programs leave you with notes and no projects. Sage Academy is the opposite — every lesson ends with a real, working thing you keep.',
        )}
        ${para(strong('Three paths, from your first line to a shipped product:'))}
        ${checklist([
          '<strong style="color:#f2efe9;">Code Foundations</strong> — Python, JS/TS, the terminal, Git',
          '<strong style="color:#f2efe9;">AI Engineering</strong> — the LLM API, prompting, RAG, agents',
          '<strong style="color:#f2efe9;">Ship Real Products</strong> — Next.js, Supabase, auth, payments, deploy',
        ])}
        ${button(`${SITE}/learn`, 'Preview the academy')}
        <div style="height:22px;"></div>
        ${para('Builders move faster together — the founding Discord is open now:')}
        ${discordButton(DISCORD_INVITE)}`
      const text = `You won't just watch — you'll build. Three paths: Code Foundations, AI Engineering, Ship Real Products. Preview: ${SITE}/learn\n\nJoin the founding Discord: ${DISCORD_INVITE}`
      return { html: emailShell(inner, email), text }
    },
  },
  {
    key: 'academy_seq_day5',
    minDays: 5,
    subject: 'Want to jump the line?',
    build: ({ email, refCode }) => {
      const refUrl = `${SITE}/learn/waitlist?ref=${refCode}`
      const inner = `
        ${eyebrow('Day 5 · jump the line')}
        ${headline('Move up the founding list.')}
        ${para(
          `Founding spots (and the $20/mo-for-life price) are limited to the first 1,000. Every builder who joins with your link jumps you ${strong('5 spots')} — and unlocks rewards:`,
        )}
        ${checklist([
          '3 referrals: first month free',
          '10: founding price locked for life',
          '25: a 1:1 build session with me',
        ])}
        ${refBox(refUrl)}
        ${button(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent('Sage Academy is coming — learn to build with code & AI, $20/mo. Founding spots open:')}&url=${encodeURIComponent(refUrl)}`,
          'Share & jump the line',
        )}
        <div style="height:22px;"></div>
        ${para('Already in the Discord? If not, that’s where the founding crew is building:')}
        ${discordButton(DISCORD_INVITE)}`
      const text = `Move up the founding list — every friend who joins with your link jumps you 5 spots. Your link: ${refUrl}\n\nJoin the founding Discord: ${DISCORD_INVITE}`
      return { html: emailShell(inner, email), text }
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
