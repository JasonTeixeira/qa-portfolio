import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { mapResendWebhookToRevenueEmailEvent } from '@/lib/revenue-os/email-delivery';
import {
  buildResendWebhookEventId,
  verifyResendWebhookSignature,
} from '@/lib/revenue-os/webhook-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ResendEvent = {
  type: string;
  created_at?: string;
  data?: {
    email_id?: string;
    to?: string | string[];
    subject?: string;
    [key: string]: unknown;
  };
};

const STATUS_MAP: Record<string, string> = {
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.unsubscribed': 'complained',
};

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[email-webhook] RESEND_WEBHOOK_SECRET missing');
    return NextResponse.json({ error: 'webhook_not_configured' }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = verifyResendWebhookSignature({
    secret,
    svixId: req.headers.get('svix-id'),
    svixTimestamp: req.headers.get('svix-timestamp'),
    svixSignature: req.headers.get('svix-signature'),
    rawBody,
  });
  if (!signature.ok) {
    console.warn('[email-webhook] invalid signature', signature.reason);
    return NextResponse.json({ error: signature.reason }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody) as ResendEvent;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const status = STATUS_MAP[event.type];
  const messageId = event.data?.email_id ?? '';
  if (!status || !messageId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const sb = supabaseAdmin();
  const { data: existing } = await sb
    .from('email_log')
    .select('id, metadata')
    .eq('provider_message_id', messageId)
    .maybeSingle();

  const prevMeta = ((existing?.metadata as Record<string, unknown> | null) ?? {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...prevMeta };
  if (event.type === 'email.opened') {
    merged.open_count = ((merged.open_count as number) ?? 0) + 1;
    merged.last_opened_at = event.created_at ?? new Date().toISOString();
  } else if (event.type === 'email.clicked') {
    merged.click_count = ((merged.click_count as number) ?? 0) + 1;
    merged.last_clicked_at = event.created_at ?? new Date().toISOString();
  } else {
    merged[`${status}_at`] = event.created_at ?? new Date().toISOString();
    if (event.data) merged[`${status}_data`] = event.data;
  }

  if (existing?.id) {
    // Don't downgrade a terminal status by overwriting with a transient one.
    const isTerminal = ['bounced', 'complained', 'failed'].includes(status);
    const update: Record<string, unknown> = { metadata: merged };
    if (isTerminal || status === 'delivered') update.status = status;
    await sb.from('email_log').update(update).eq('id', existing.id);
  } else {
    // Webhook arrived without a prior log row — record it for trace.
    const recipient = Array.isArray(event.data?.to) ? event.data?.to?.[0] : (event.data?.to ?? '');
    await sb.from('email_log').insert({
      recipient: recipient ?? 'unknown',
      subject: event.data?.subject ?? null,
      status,
      provider_message_id: messageId,
      metadata: merged,
    });
  }

  const revenueEvent = mapResendWebhookToRevenueEmailEvent(event);
  if (revenueEvent) {
    const providerEventId = buildResendWebhookEventId({
      svixId: req.headers.get('svix-id') ?? 'missing',
      eventType: event.type,
      providerMessageId: revenueEvent.providerMessageId,
    });
    const { data: duplicate } = await sb
      .from('revenue_email_events')
      .select('id')
      .eq('provider_event_id', providerEventId)
      .maybeSingle();
    if (duplicate?.id) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const { data: queueItem } = await sb
      .from('revenue_email_queue')
      .select('id, sequence_key, metadata')
      .eq('provider_message_id', revenueEvent.providerMessageId)
      .maybeSingle();

    if (queueItem?.id) {
      await sb.from('revenue_email_events').insert({
        email_queue_id: queueItem.id,
        provider_event_id: providerEventId,
        event_type: revenueEvent.eventType,
        occurred_at: revenueEvent.occurredAt,
        requires_suppression: revenueEvent.requiresSuppression,
        metadata: {
          provider: 'resend',
          providerMessageId: revenueEvent.providerMessageId,
          recipientEmail: revenueEvent.recipientEmail,
          raw: revenueEvent.raw,
        },
      });

      const patch: Record<string, unknown> = {
        metadata: {
          ...(((queueItem.metadata as Record<string, unknown> | null) ?? {}) as Record<string, unknown>),
          lastProviderEvent: {
            type: revenueEvent.eventType,
            occurredAt: revenueEvent.occurredAt,
            requiresSuppression: revenueEvent.requiresSuppression,
          },
        },
      };
      if (revenueEvent.queueStatus) patch.status = revenueEvent.queueStatus;
      if (revenueEvent.queueStatus === 'sent') patch.sent_at = revenueEvent.occurredAt;
      await sb.from('revenue_email_queue').update(patch).eq('id', queueItem.id);

      if (revenueEvent.requiresSuppression && queueItem.sequence_key) {
        const reason = revenueEvent.eventType === 'bounced'
          ? 'bounce_received'
          : revenueEvent.eventType === 'complained'
            ? 'complaint_received'
            : revenueEvent.eventType === 'unsubscribed'
              ? 'unsubscribe_received'
              : null;
        if (reason) {
          await sb.from('revenue_sequence_stop_events').insert({
            run_key: ((queueItem.metadata as Record<string, unknown> | null)?.runKey as string | undefined)
              ?? `webhook-${new Date().toISOString().slice(0, 10)}`,
            sequence_key: queueItem.sequence_key,
            reason,
            message_id: queueItem.id,
            occurred_at: revenueEvent.occurredAt,
            metadata: {
              provider: 'resend',
              providerMessageId: revenueEvent.providerMessageId,
              providerEventId,
              recipientEmail: revenueEvent.recipientEmail,
              source: 'resend_webhook',
            },
          });
        }
      }
    }

    if (revenueEvent.suppression) {
      const { data: existingSuppression } = await sb
        .from('acquisition_suppression_list')
        .select('id')
        .eq('email', revenueEvent.suppression.email)
        .maybeSingle();
      if (!existingSuppression?.id) {
        await sb.from('acquisition_suppression_list').insert({
            email: revenueEvent.suppression.email,
            reason: revenueEvent.suppression.reason,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

// Reject other methods explicitly (returns 405 for GET/etc)
export async function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
