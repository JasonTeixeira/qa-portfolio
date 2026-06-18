export type AdaptiveSequenceEvent = {
  type: 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'complained' | 'unsubscribed';
  occurredAt: string;
};

export type AdaptiveSequencePlan = {
  accountName: string;
  persona: string;
  industry: string;
  offer: string;
  status: 'active' | 'stopped';
  stopReason: string | null;
  nextStep: null | {
    step: number;
    branchReason: string;
    scheduledAt: string;
    subject: string;
  };
  steps: Array<{
    step: number;
    delayDays: number;
    branchReason: string;
    subject: string;
  }>;
  events: AdaptiveSequenceEvent[];
};

function addDays(iso: string, days: number) {
  return new Date(new Date(iso).getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function buildAdaptiveSequencePlan(input: {
  accountName: string;
  persona: string;
  industry: string;
  offer: string;
  startAt?: string;
}): AdaptiveSequencePlan {
  return {
    accountName: input.accountName,
    persona: input.persona,
    industry: input.industry,
    offer: input.offer,
    status: 'active',
    stopReason: null,
    nextStep: {
      step: 1,
      branchReason: 'first_touch',
      scheduledAt: input.startAt ?? new Date().toISOString(),
      subject: `${input.accountName} ${input.offer.replaceAll('_', ' ')}`,
    },
    steps: [
      { step: 1, delayDays: 0, branchReason: 'first_touch', subject: `${input.accountName} opportunity` },
      { step: 2, delayDays: 3, branchReason: 'opened_no_reply', subject: `Re: ${input.accountName}` },
      { step: 3, delayDays: 7, branchReason: 'no_engagement', subject: `Close the loop` },
    ],
    events: [],
  };
}

export function advanceAdaptiveSequence(
  plan: AdaptiveSequencePlan,
  event: AdaptiveSequenceEvent,
): AdaptiveSequencePlan {
  const stopReasons: Partial<Record<AdaptiveSequenceEvent['type'], string>> = {
    replied: 'reply_received',
    bounced: 'bounce_received',
    complained: 'complaint_received',
    unsubscribed: 'unsubscribe_received',
  };
  if (stopReasons[event.type]) {
    return {
      ...plan,
      status: 'stopped',
      stopReason: stopReasons[event.type] ?? null,
      nextStep: null,
      events: [...plan.events, event],
    };
  }
  const branchReason = event.type === 'opened' || event.type === 'clicked' ? 'opened_no_reply' : 'no_engagement';
  const next = plan.steps.find((step) => step.branchReason === branchReason && step.step > (plan.nextStep?.step ?? 0));
  return {
    ...plan,
    nextStep: next
      ? {
          step: next.step,
          branchReason: next.branchReason,
          scheduledAt: addDays(event.occurredAt, next.delayDays),
          subject: next.subject,
        }
      : null,
    events: [...plan.events, event],
  };
}
