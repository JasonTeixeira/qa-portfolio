export type ManualReviewSequenceInput = {
  accountName: string;
  contactEmail: string;
  offer: string;
  startDate?: Date;
};

export type ManualReviewSequence = {
  accountName: string;
  contactEmail: string;
  offer: string;
  safetyChecks: string[];
  steps: Array<{
    step: number;
    subject: string;
    body: string;
    scheduledAt: string;
    status: 'manual_review';
  }>;
};

export type DeliverabilityEvent = {
  messageId: string;
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'complained' | 'unsubscribed';
  occurredAt: string;
  detail: string | null;
  requiresSuppression: boolean;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

export function buildManualReviewSequence(input: ManualReviewSequenceInput): ManualReviewSequence {
  const start = input.startDate ?? new Date();
  const offerLabel = input.offer.replaceAll('_', ' ');
  return {
    accountName: input.accountName,
    contactEmail: input.contactEmail.toLowerCase(),
    offer: input.offer,
    safetyChecks: [
      'suppression list check before every send',
      'manual approval required before dispatch',
      'unsubscribe path required before production sending',
      'do not auto-submit sensitive job or demographic answers',
    ],
    steps: [
      {
        step: 1,
        subject: `${input.accountName} ${offerLabel} opportunity`,
        body: `Manual review: send a specific first-touch note about ${offerLabel}.`,
        scheduledAt: addDays(start, 0),
        status: 'manual_review',
      },
      {
        step: 2,
        subject: `Following up on ${input.accountName}`,
        body: 'Manual review: follow up with one proof point and a lighter CTA.',
        scheduledAt: addDays(start, 3),
        status: 'manual_review',
      },
      {
        step: 3,
        subject: `Close the loop`,
        body: 'Manual review: final polite close-the-loop message.',
        scheduledAt: addDays(start, 7),
        status: 'manual_review',
      },
    ],
  };
}

export function buildDeliverabilityEvent(input: {
  messageId: string;
  type: DeliverabilityEvent['type'];
  occurredAt?: string;
  detail?: string | null;
}): DeliverabilityEvent {
  return {
    messageId: input.messageId,
    type: input.type,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    detail: input.detail ?? null,
    requiresSuppression: ['bounced', 'complained', 'unsubscribed'].includes(input.type),
  };
}
