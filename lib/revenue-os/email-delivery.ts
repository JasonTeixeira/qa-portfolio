import { Resend } from 'resend';

export type RevenueEmailQueueItem = {
  id: string;
  status: 'manual_review' | 'approved' | 'scheduled' | 'sent' | 'blocked' | 'archived';
  recipientEmail: string | null;
  subject: string | null;
  body: string;
};

export type RevenueEmailDeliveryPlan =
  | {
      allowed: false;
      reason: 'missing_recipient' | 'requires_manual_approval' | 'suppressed_recipient' | 'archived_or_blocked';
    }
  | {
      allowed: true;
      provider: 'resend';
      idempotencyKey: string;
      payload: {
        from: string;
        to: string;
        subject: string;
        html: string;
        text: string;
        replyTo: string;
        headers: Record<string, string>;
      };
    };

export type RevenueEmailSendResult =
  | { ok: true; providerMessageId: string; mode: 'resend' | 'test' }
  | { ok: false; reason: string };

export type ResendWebhookEvent = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string | string[];
    subject?: string;
    [key: string]: unknown;
  };
};

export type RevenueWebhookMapping = {
  providerMessageId: string;
  recipientEmail: string | null;
  subject: string | null;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'complained' | 'unsubscribed';
  queueStatus: 'sent' | 'blocked' | null;
  occurredAt: string;
  requiresSuppression: boolean;
  suppression: { email: string; reason: string } | null;
  raw: ResendWebhookEvent;
};

const EVENT_MAP: Record<string, RevenueWebhookMapping['eventType']> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.replied': 'replied',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.unsubscribed': 'unsubscribed',
};

const DEFAULT_FROM = 'Sage Ideas <sage@sageideas.dev>';
const DEFAULT_REPLY_TO = 'sage@sageideas.dev';
const DEFAULT_SITE = 'https://www.sageideas.dev';

function normalizeEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase();
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function toHtml(body: string) {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.trim().replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replace(/\n/g, '<br />')}</p>`)
    .join('');
}

export function buildRevenueEmailDeliveryPlan(input: {
  queueItem: RevenueEmailQueueItem;
  suppressed: boolean;
  siteUrl?: string;
  from?: string;
  replyTo?: string;
}): RevenueEmailDeliveryPlan {
  const recipient = normalizeEmail(input.queueItem.recipientEmail);
  if (!recipient) return { allowed: false, reason: 'missing_recipient' };
  if (input.suppressed) return { allowed: false, reason: 'suppressed_recipient' };
  if (['blocked', 'archived', 'sent'].includes(input.queueItem.status)) {
    return { allowed: false, reason: 'archived_or_blocked' };
  }
  if (!['approved', 'scheduled'].includes(input.queueItem.status)) {
    return { allowed: false, reason: 'requires_manual_approval' };
  }

  const siteUrl = (input.siteUrl ?? DEFAULT_SITE).replace(/\/+$/, '');
  const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(recipient)}`;
  return {
    allowed: true,
    provider: 'resend',
    idempotencyKey: `revenue-email-${input.queueItem.id}`,
    payload: {
      from: input.from ?? DEFAULT_FROM,
      to: recipient,
      subject: input.queueItem.subject ?? 'Sage Ideas',
      html: toHtml(input.queueItem.body),
      text: input.queueItem.body,
      replyTo: input.replyTo ?? DEFAULT_REPLY_TO,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    },
  };
}

export async function sendRevenueEmailWithResend(input: {
  plan: RevenueEmailDeliveryPlan;
  apiKey?: string | null;
  sendMode?: 'test' | 'resend';
}): Promise<RevenueEmailSendResult> {
  if (!input.plan.allowed) return { ok: false, reason: input.plan.reason };
  const mode = input.sendMode ?? (process.env.REVENUE_EMAIL_SEND_MODE === 'resend' ? 'resend' : 'test');
  if (mode === 'test') {
    return { ok: true, providerMessageId: `test_${input.plan.idempotencyKey}`, mode: 'test' };
  }
  const apiKey = input.apiKey ?? process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: 'missing_resend_api_key' };

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send(
    input.plan.payload,
    { idempotencyKey: input.plan.idempotencyKey } as Parameters<typeof resend.emails.send>[1],
  );
  if (error) return { ok: false, reason: error.message };
  return { ok: true, providerMessageId: data?.id ?? '', mode: 'resend' };
}

export function mapResendWebhookToRevenueEmailEvent(event: ResendWebhookEvent): RevenueWebhookMapping | null {
  const eventType = EVENT_MAP[event.type];
  const providerMessageId = event.data?.email_id ?? '';
  if (!eventType || !providerMessageId) return null;
  const rawRecipient = Array.isArray(event.data?.to) ? event.data?.to[0] : event.data?.to;
  const recipientEmail = normalizeEmail(rawRecipient);
  const requiresSuppression = ['bounced', 'complained', 'unsubscribed'].includes(eventType);
  const queueStatus = requiresSuppression ? 'blocked' : ['sent', 'delivered'].includes(eventType) ? 'sent' : null;

  return {
    providerMessageId,
    recipientEmail,
    subject: event.data?.subject ?? null,
    eventType,
    queueStatus,
    occurredAt: event.created_at ?? new Date().toISOString(),
    requiresSuppression,
    suppression: requiresSuppression && recipientEmail
      ? { email: recipientEmail, reason: `resend ${eventType}` }
      : null,
    raw: event,
  };
}
