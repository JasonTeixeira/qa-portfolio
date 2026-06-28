import { SITE } from '@/lib/email/send'

/**
 * Shared email theme for Sage Academy — built to match the waitlist signup page:
 * near-black background, a gradient top rule, the gradient mark + mono wordmark,
 * a bold display headline with a gradient-accented phrase, and gradient pill CTAs.
 * Inline styles only, with solid fallbacks for clients that drop gradients.
 */

const BG = '#0b0b0e'
const SURFACE = '#141418'
const LINE = '#1e1e24'
const INK = '#f2efe9'
const MUTED = '#9c9ca6'
const FAINT = '#6b6b78'
const FONT =
  "'Hanken Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
const GRAD = 'linear-gradient(100deg,#3d5afe,#6e87ff 55%,#bcd2ff)'
const EDITORIAL = "Georgia,'Times New Roman',serif"

export const eyebrow = (text: string) =>
  `<p style="margin:0 0 18px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#8fa0ff;">${text}</p>`

/** Big display headline; the optional accent phrase renders in an editorial italic (electric). */
export const headline = (text: string, accent?: string) =>
  `<h1 style="margin:0 0 14px;font-family:${FONT};font-size:30px;line-height:1.1;letter-spacing:-0.02em;font-weight:800;color:${INK};">${text}${
    accent
      ? ` <span style="font-family:${EDITORIAL};font-style:italic;font-weight:400;letter-spacing:-0.01em;color:#8fa0ff;">${accent}</span>`
      : ''
  }</h1>`

export const para = (html: string) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${MUTED};">${html}</p>`

export const strong = (t: string) => `<strong style="color:${INK};font-weight:700;">${t}</strong>`

export const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin-top:8px;padding:13px 22px;border-radius:999px;background-color:#3d5afe;background:${GRAD};color:#ffffff;font-family:${FONT};font-weight:700;font-size:15px;text-decoration:none;">${label}</a>`

/** Discord-blurple invite button. */
export const discordButton = (href: string, label = 'Join the founding Discord') =>
  `<a href="${href}" style="display:inline-block;padding:14px 26px;border-radius:999px;background-color:#5865f2;color:#ffffff;font-family:${FONT};font-weight:700;font-size:15px;text-decoration:none;">${label}</a>`

/** A position / founding callout card, echoing the on-site meter. */
export const positionCard = (position: number) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td style="border:1px solid ${LINE};border-radius:14px;background:${SURFACE};padding:20px 22px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${FAINT};">Your position</div>
    <div style="font-family:${FONT};font-size:40px;font-weight:800;letter-spacing:-0.03em;line-height:1;color:#8fa0ff;">#${position.toLocaleString()}</div>
  </td></tr></table>`

/** The referral-link box. */
export const refBox = (refUrl: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;"><tr><td style="border:1px solid ${LINE};border-radius:8px;background:#0e0e12;padding:11px 13px;font-family:'JetBrains Mono',monospace;font-size:13px;color:${MUTED};word-break:break-all;">${refUrl.replace('https://', '')}</td></tr></table>`

export const checklist = (items: string[]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">${items
    .map(
      (it) =>
        `<tr><td style="padding:5px 0;font-family:${FONT};font-size:14px;color:#b6b6c0;line-height:1.5;"><span style="display:inline-block;vertical-align:middle;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d5afe" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>&nbsp;&nbsp;${it}</td></tr>`,
    )
    .join('')}</table>`

/** Full email shell with gradient top rule, header, and footer. */
export function emailShell(inner: string, email: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:${BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};"><tr><td align="center" style="padding:0;">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;">
      <tr><td style="height:4px;background-color:#7c3aed;background:${GRAD};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:34px 30px;background:${BG};">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:26px;"><tr>
          <td style="vertical-align:middle;"><span style="display:inline-block;width:30px;height:30px;border-radius:8px;background-color:#3d5afe;background:linear-gradient(135deg,#3d5afe,#6e87ff 55%,#bcd2ff);color:#fff;font-family:${FONT};font-weight:800;text-align:center;line-height:30px;font-size:16px;">S</span></td>
          <td style="vertical-align:middle;padding-left:10px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${INK};font-weight:600;">Sage&nbsp;Ideas</td>
        </tr></table>
        ${inner}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;border-top:1px solid ${LINE};"><tr><td style="padding-top:16px;font-family:${FONT};font-size:12px;line-height:1.5;color:${FAINT};">
          You're on the Sage Academy founding waitlist · $20/mo locked for founders.<br/>
          <a href="${SITE}/unsubscribe?email=${encodeURIComponent(email)}" style="color:#8a8a94;">Unsubscribe</a>
        </td></tr></table>
      </td></tr>
    </table>
  </td></tr></table>
  </body></html>`
}
