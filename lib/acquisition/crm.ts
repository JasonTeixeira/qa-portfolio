import type { AcquisitionStage } from './types';

export type OutreachOutcomeStatus = 'ready' | 'sent' | 'replied' | 'booked' | 'declined' | 'bounced' | 'archived';

export type OutreachOutcomeTransition = {
  messagePatch: Record<string, string | null>;
  accountPatch: {
    stage?: AcquisitionStage;
    next_action?: string;
    next_action_at?: string | null;
  };
  metricPatch: Record<string, number>;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

export function buildOutreachOutcomeTransition(
  status: OutreachOutcomeStatus,
  now = new Date(),
): OutreachOutcomeTransition {
  const timestamp = now.toISOString();
  const messagePatch: Record<string, string | null> = { status };
  if (status === 'sent') messagePatch.sent_at = timestamp;
  if (status === 'replied' || status === 'booked') messagePatch.replied_at = timestamp;

  if (status === 'ready') {
    return {
      messagePatch,
      accountPatch: {
        stage: 'drafted',
        next_action: 'Draft approved. Verify contact details, then mark sent after manual send.',
        next_action_at: null,
      },
      metricPatch: {},
    };
  }

  if (status === 'sent') {
    return {
      messagePatch,
      accountPatch: {
        stage: 'contacted',
        next_action: 'Wait for reply, then follow up with one useful proof point.',
        next_action_at: addDays(now, 3),
      },
      metricPatch: { messages_sent: 1 },
    };
  }

  if (status === 'replied') {
    return {
      messagePatch,
      accountPatch: {
        stage: 'follow_up',
        next_action: 'Reply received. Respond personally and push for a short fit call.',
        next_action_at: timestamp,
      },
      metricPatch: { replies: 1 },
    };
  }

  if (status === 'booked') {
    return {
      messagePatch,
      accountPatch: {
        stage: 'meeting',
        next_action: 'Meeting booked. Prepare audit evidence, offer fit, and next-step proposal.',
        next_action_at: null,
      },
      metricPatch: { meetings_booked: 1 },
    };
  }

  if (status === 'declined') {
    return {
      messagePatch,
      accountPatch: {
        stage: 'lost',
        next_action: 'Declined. Archive the angle and avoid further outreach unless they re-engage.',
        next_action_at: null,
      },
      metricPatch: {},
    };
  }

  if (status === 'bounced') {
    return {
      messagePatch,
      accountPatch: {
        stage: 'qualified',
        next_action: 'Email bounced. Find a better contact before sending again.',
        next_action_at: addDays(now, 1),
      },
      metricPatch: {},
    };
  }

  return {
    messagePatch,
    accountPatch: {
      next_action: 'Archived. No active outreach step.',
      next_action_at: null,
    },
    metricPatch: {},
  };
}
