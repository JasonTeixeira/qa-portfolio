export type EmailSafetyMessage = {
  id: string;
  recipientEmail: string | null;
  sequenceKey: string | null;
  status: 'manual_review' | 'approved' | 'scheduled' | 'sent' | 'blocked' | 'archived';
};

export type EmailSuppressionRule = {
  email?: string | null;
  domain?: string | null;
  reason: string;
};

export type EmailProviderSafetyEvent = {
  messageId: string;
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'complained' | 'unsubscribed';
  recipientEmail: string | null;
  occurredAt: string;
};

export type EmailDomainHealth = {
  domain: string;
  status: 'healthy' | 'limited' | 'paused';
  dailyCap: number;
  sentToday: number;
  remainingToday: number;
  bounceRate: number;
  complaintRate: number;
  reasons: string[];
};

export type EmailSafetyDecision = {
  messageId: string;
  recipientEmail: string | null;
  sequenceKey: string | null;
  allowed: boolean;
  reason: string;
};

export type EmailSuppressionEvent = {
  email: string;
  reason: 'manual_suppression' | 'domain_suppression' | 'bounce_received' | 'complaint_received' | 'unsubscribe_received';
  source: 'operator' | 'provider_event';
  occurredAt: string;
  messageId: string | null;
};

export type EmailSequenceStop = {
  sequenceKey: string;
  reason: 'reply_received' | 'bounce_received' | 'complaint_received' | 'unsubscribe_received' | 'domain_paused';
  messageId: string | null;
  occurredAt: string;
};

export type EmailSafetyRun = {
  runKey: string;
  domainHealth: EmailDomainHealth;
  safeToSend: EmailSafetyDecision[];
  blocked: EmailSafetyDecision[];
  suppressionEvents: EmailSuppressionEvent[];
  sequenceStops: EmailSequenceStop[];
  persistence: {
    safetyReport: {
      run_key: string;
      domain: string;
      status: EmailDomainHealth['status'];
      scorecard: {
        totalMessages: number;
        safeToSend: number;
        blocked: number;
        suppressionEvents: number;
        sequenceStops: number;
        remainingToday: number;
        safetyReserve: number;
      };
      metadata: Record<string, unknown>;
    };
    domainHealth: Record<string, unknown>;
    suppressionEvents: Array<Record<string, unknown>>;
    sequenceStops: Array<Record<string, unknown>>;
  };
};

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

function domainFromEmail(email: string | null) {
  return email?.split('@')[1] ?? null;
}

function buildDomainHealth(input: {
  domain: string;
  dailyCap: number;
  sentToday: number;
  bounceRate: number;
  complaintRate: number;
}): EmailDomainHealth {
  const reasons: string[] = [];
  if (input.sentToday >= input.dailyCap) reasons.push('daily cap reached');
  if (input.bounceRate >= 8) reasons.push('bounce rate is too high');
  if (input.complaintRate >= 0.5) reasons.push('complaint rate is too high');
  const status: EmailDomainHealth['status'] = reasons.some((reason) => /too high/.test(reason))
    ? 'paused'
    : reasons.length > 0
      ? 'limited'
      : 'healthy';
  return {
    domain: input.domain,
    status,
    dailyCap: input.dailyCap,
    sentToday: input.sentToday,
    remainingToday: Math.max(0, input.dailyCap - input.sentToday),
    bounceRate: input.bounceRate,
    complaintRate: input.complaintRate,
    reasons,
  };
}

function suppressionReasonFor(input: {
  email: string | null;
  suppressions: EmailSuppressionRule[];
}) {
  if (!input.email) return null;
  const domain = domainFromEmail(input.email);
  const direct = input.suppressions.find((rule) => normalizeEmail(rule.email) === input.email);
  if (direct) return { reason: 'manual_suppression' as const, detail: direct.reason };
  const domainRule = input.suppressions.find((rule) => rule.domain?.trim().toLowerCase() === domain);
  if (domainRule) return { reason: 'domain_suppression' as const, detail: domainRule.reason };
  return null;
}

function stopReasonForEvent(type: EmailProviderSafetyEvent['type']): EmailSequenceStop['reason'] | null {
  if (type === 'replied') return 'reply_received';
  if (type === 'bounced') return 'bounce_received';
  if (type === 'complained') return 'complaint_received';
  if (type === 'unsubscribed') return 'unsubscribe_received';
  return null;
}

function suppressionReasonForEvent(type: EmailProviderSafetyEvent['type']): EmailSuppressionEvent['reason'] | null {
  if (type === 'bounced') return 'bounce_received';
  if (type === 'complained') return 'complaint_received';
  if (type === 'unsubscribed') return 'unsubscribe_received';
  return null;
}

export function buildEmailSafetyRun(input: {
  runKey: string;
  domain: string;
  dailyCap: number;
  sentToday: number;
  bounceRate: number;
  complaintRate: number;
  messages: EmailSafetyMessage[];
  suppressions: EmailSuppressionRule[];
  providerEvents: EmailProviderSafetyEvent[];
}): EmailSafetyRun {
  const domainHealth = buildDomainHealth(input);
  const eventByMessageId = new Map(input.providerEvents.map((event) => [event.messageId, event]));
  const blocked: EmailSafetyDecision[] = [];
  const safeToSend: EmailSafetyDecision[] = [];
  const suppressionEvents: EmailSuppressionEvent[] = [];
  const sequenceStopsByKey = new Map<string, EmailSequenceStop>();
  const safetyReserve = domainHealth.remainingToday > 2 ? 2 : 0;
  let remaining = Math.max(0, domainHealth.remainingToday - safetyReserve);

  for (const message of input.messages) {
    const email = normalizeEmail(message.recipientEmail);
    const suppression = suppressionReasonFor({ email, suppressions: input.suppressions });
    const event = eventByMessageId.get(message.id);
    const eventStopReason = event ? stopReasonForEvent(event.type) : null;
    const eventSuppressionReason = event ? suppressionReasonForEvent(event.type) : null;

    if (suppression && email) {
      suppressionEvents.push({
        email,
        reason: suppression.reason,
        source: 'operator',
        occurredAt: new Date().toISOString(),
        messageId: message.id,
      });
    }

    if (eventSuppressionReason && email && event) {
      suppressionEvents.push({
        email,
        reason: eventSuppressionReason,
        source: 'provider_event',
        occurredAt: event.occurredAt,
        messageId: message.id,
      });
    }

    if (eventStopReason && message.sequenceKey && event) {
      const current = sequenceStopsByKey.get(message.sequenceKey);
      if (!current || event.occurredAt < current.occurredAt) {
        sequenceStopsByKey.set(message.sequenceKey, {
          sequenceKey: message.sequenceKey,
          reason: eventStopReason,
          messageId: message.id,
          occurredAt: event.occurredAt,
        });
      }
    }

    if (!email) {
      blocked.push({ messageId: message.id, recipientEmail: email, sequenceKey: message.sequenceKey, allowed: false, reason: 'missing_recipient' });
      continue;
    }
    if (!['approved', 'scheduled'].includes(message.status)) {
      blocked.push({ messageId: message.id, recipientEmail: email, sequenceKey: message.sequenceKey, allowed: false, reason: 'requires_manual_approval' });
      continue;
    }
    if (suppression) {
      blocked.push({ messageId: message.id, recipientEmail: email, sequenceKey: message.sequenceKey, allowed: false, reason: suppression.reason });
      continue;
    }
    if (eventStopReason) {
      blocked.push({ messageId: message.id, recipientEmail: email, sequenceKey: message.sequenceKey, allowed: false, reason: eventStopReason });
      continue;
    }
    if (domainHealth.status === 'paused') {
      blocked.push({ messageId: message.id, recipientEmail: email, sequenceKey: message.sequenceKey, allowed: false, reason: 'domain_paused' });
      if (message.sequenceKey) {
        sequenceStopsByKey.set(message.sequenceKey, {
          sequenceKey: message.sequenceKey,
          reason: 'domain_paused',
          messageId: message.id,
          occurredAt: new Date().toISOString(),
        });
      }
      continue;
    }
    if (remaining <= 0) {
      blocked.push({ messageId: message.id, recipientEmail: email, sequenceKey: message.sequenceKey, allowed: false, reason: 'daily_cap_reached' });
      continue;
    }
    safeToSend.push({ messageId: message.id, recipientEmail: email, sequenceKey: message.sequenceKey, allowed: true, reason: 'safe' });
    remaining -= 1;
  }

  const sequenceStops = [...sequenceStopsByKey.values()];
  return {
    runKey: input.runKey,
    domainHealth,
    safeToSend,
    blocked,
    suppressionEvents,
    sequenceStops,
    persistence: {
      safetyReport: {
        run_key: input.runKey,
        domain: domainHealth.domain,
        status: domainHealth.status,
        scorecard: {
          totalMessages: input.messages.length,
          safeToSend: safeToSend.length,
          blocked: blocked.length,
          suppressionEvents: suppressionEvents.length,
          sequenceStops: sequenceStops.length,
          remainingToday: remaining,
          safetyReserve,
        },
        metadata: {
          domainHealth,
          safeToSend,
          blocked,
          safetyReserve,
        },
      },
      domainHealth: {
        run_key: input.runKey,
        domain: domainHealth.domain,
        status: domainHealth.status,
        daily_cap: domainHealth.dailyCap,
        sent_today: domainHealth.sentToday,
        remaining_today: domainHealth.remainingToday,
        bounce_rate: domainHealth.bounceRate,
        complaint_rate: domainHealth.complaintRate,
        reasons: domainHealth.reasons,
        metadata: { runKey: input.runKey, program: '5_email_safety' },
      },
      suppressionEvents: suppressionEvents.map((event) => ({
        run_key: input.runKey,
        email: event.email,
        reason: event.reason,
        source: event.source,
        occurred_at: event.occurredAt,
        message_id: event.messageId,
        metadata: { runKey: input.runKey, program: '5_email_safety' },
      })),
      sequenceStops: sequenceStops.map((stop) => ({
        run_key: input.runKey,
        sequence_key: stop.sequenceKey,
        reason: stop.reason,
        message_id: stop.messageId,
        occurred_at: stop.occurredAt,
        metadata: { runKey: input.runKey, program: '5_email_safety' },
      })),
    },
  };
}
