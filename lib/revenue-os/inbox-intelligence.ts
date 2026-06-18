export type InboxReplyIntent =
  | 'meeting_intent'
  | 'objection'
  | 'not_interested'
  | 'wrong_person'
  | 'neutral'
  | 'unsubscribe';

export type InboxReplyClassification = {
  intent: InboxReplyIntent;
  sentiment: 'positive' | 'neutral' | 'negative';
  extractedSignals: string[];
  followUpSuggestion: string;
  crmPatch: {
    stage: 'follow_up' | 'meeting' | 'lost' | 'do_not_contact';
    next_action: string;
  };
};

export function classifyInboxReply(input: {
  from: string;
  subject: string;
  body: string;
  receivedAt?: string;
}): InboxReplyClassification {
  const body = input.body.toLowerCase();
  const extractedSignals: string[] = [];
  if (/budget|price|cost|expensive|not huge/.test(body)) extractedSignals.push('budget constraint');
  if (/thursday|monday|tuesday|wednesday|friday|times|calendar|call|meet/.test(body)) extractedSignals.push('scheduling intent');
  if (/booking|website|seo|flow|conversion/.test(body)) extractedSignals.push('problem acknowledged');
  if (/wrong person|not the right person|talk to|speak with|contact/.test(body)) extractedSignals.push('routing/referral');

  if (/unsubscribe|remove me|stop emailing/.test(body)) {
    return {
      intent: 'unsubscribe',
      sentiment: 'negative',
      extractedSignals,
      followUpSuggestion: 'Do not reply. Add sender to suppression.',
      crmPatch: { stage: 'do_not_contact', next_action: 'Suppressed from inbox reply.' },
    };
  }

  if (/wrong person|not the right person|talk to|speak with|contact/.test(body)) {
    return {
      intent: 'wrong_person',
      sentiment: 'neutral',
      extractedSignals,
      followUpSuggestion: 'Ask for the right owner or decision maker and suppress this contact if requested.',
      crmPatch: { stage: 'follow_up', next_action: 'Find referred decision maker.' },
    };
  }

  if (/not interested|no thanks|not a fit/.test(body)) {
    return {
      intent: 'not_interested',
      sentiment: 'negative',
      extractedSignals,
      followUpSuggestion: 'Send no further sequence messages.',
      crmPatch: { stage: 'lost', next_action: 'Mark not interested.' },
    };
  }

  if (/send times|calendar|call|meet|available|thursday/.test(body)) {
    return {
      intent: 'meeting_intent',
      sentiment: 'positive',
      extractedSignals,
      followUpSuggestion: 'Reply with two concise meeting windows, including Thursday if available.',
      crmPatch: { stage: 'meeting', next_action: 'Send meeting times and booking link.' },
    };
  }

  if (/how much|price|budget|later|maybe/.test(body)) {
    return {
      intent: 'objection',
      sentiment: 'neutral',
      extractedSignals,
      followUpSuggestion: 'Answer the objection directly and offer a low-friction audit step.',
      crmPatch: { stage: 'follow_up', next_action: 'Reply to objection with proof and next step.' },
    };
  }

  return {
    intent: 'neutral',
    sentiment: 'neutral',
    extractedSignals,
    followUpSuggestion: 'Ask one clarifying question and keep the thread human.',
    crmPatch: { stage: 'follow_up', next_action: 'Send contextual follow-up.' },
  };
}

export type InboxReplyInput = {
  externalMessageId: string;
  threadId: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
};

export function buildInboxIntelligenceRun(input: {
  runKey: string;
  tenantId?: string;
  account: {
    id: string;
    name: string;
    stage: string;
  };
  contact?: {
    id?: string | null;
    email?: string | null;
    fullName?: string | null;
  };
  emailQueue: Array<{
    id: string;
    recipientEmail?: string | null;
    subject?: string | null;
    sequenceKey?: string | null;
    providerMessageId?: string | null;
  }>;
  replies: InboxReplyInput[];
}) {
  const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase();
  const contactEmail = normalize(input.contact?.email);
  const queueByEmail = new Map(input.emailQueue.map((item) => [normalize(item.recipientEmail), item]));
  const queueByProviderId = new Map(
    input.emailQueue
      .filter((item) => item.providerMessageId)
      .map((item) => [String(item.providerMessageId), item]),
  );
  const sequenceStopsByKey = new Map<string, {
    run_key: string;
    sequence_key: string;
    reason: 'reply_received';
    message_id: string | null;
    occurred_at: string;
    metadata: Record<string, unknown>;
  }>();
  const now = new Date().toISOString();

  const threads = input.replies.map((reply) => {
    const matched = normalize(reply.from) === contactEmail;
    return {
      thread_key: reply.threadId,
      provider: 'gmail',
      account_id: matched ? input.account.id : null,
      contact_id: matched ? input.contact?.id ?? null : null,
      sender_email: reply.from,
      subject: reply.subject,
      status: 'open',
      last_message_at: reply.receivedAt,
      metadata: {
        runKey: input.runKey,
        tenantId: input.tenantId ?? null,
        accountName: input.account.name,
      },
    };
  });

  const messages = input.replies.map((reply) => ({
    thread_key: reply.threadId,
    provider: 'gmail',
    external_message_id: reply.externalMessageId,
    direction: 'inbound',
    sender_email: reply.from,
    subject: reply.subject,
    body_preview: reply.body.slice(0, 500),
    received_at: reply.receivedAt,
    metadata: {
      runKey: input.runKey,
      tenantId: input.tenantId ?? null,
    },
  }));

  const classifications = input.replies.map((reply) => {
    const queueMatch = queueByProviderId.get(reply.externalMessageId)
      ?? queueByEmail.get(normalize(reply.from))
      ?? null;
    const matched = normalize(reply.from) === contactEmail || Boolean(queueMatch);
    const classification = classifyInboxReply({
      from: reply.from,
      subject: reply.subject,
      body: reply.body,
      receivedAt: reply.receivedAt,
    });

    if (queueMatch?.sequenceKey) {
      sequenceStopsByKey.set(queueMatch.sequenceKey, {
        run_key: input.runKey,
        sequence_key: queueMatch.sequenceKey,
        reason: 'reply_received',
        message_id: queueMatch.id,
        occurred_at: reply.receivedAt,
        metadata: {
          runKey: input.runKey,
          tenantId: input.tenantId ?? null,
          replyExternalMessageId: reply.externalMessageId,
          recipientEmail: queueMatch.recipientEmail,
        },
      });
    }

    return {
      run_key: input.runKey,
      thread_key: reply.threadId,
      external_message_id: reply.externalMessageId,
      matchedAccountId: matched ? input.account.id : null,
      matchedContactId: matched ? input.contact?.id ?? null : null,
      matchedQueueId: queueMatch?.id ?? null,
      intent: classification.intent,
      sentiment: classification.sentiment,
      extractedSignals: classification.extractedSignals,
      crmPatch: classification.crmPatch,
      followUpSuggestion: classification.followUpSuggestion,
      confidence: matched ? 92 : 62,
      metadata: {
        runKey: input.runKey,
        tenantId: input.tenantId ?? null,
        replyFrom: reply.from,
      },
    };
  });

  const actionSuggestions = classifications.map((classification) => {
    const actionType =
      classification.intent === 'meeting_intent'
        ? 'book_meeting'
        : classification.intent === 'unsubscribe'
          ? 'suppress_contact'
          : classification.intent === 'wrong_person'
            ? 'find_decision_maker'
            : classification.intent === 'not_interested'
              ? 'mark_lost'
              : 'reply_follow_up';
    return {
      run_key: input.runKey,
      account_id: classification.matchedAccountId,
      contact_id: classification.matchedContactId,
      classification_external_message_id: classification.external_message_id,
      action_type: actionType,
      actionType,
      priority: classification.intent === 'meeting_intent' ? 95 : classification.intent === 'unsubscribe' ? 90 : 70,
      suggestion: classification.followUpSuggestion,
      status: 'open',
      metadata: {
        runKey: input.runKey,
        tenantId: input.tenantId ?? null,
        intent: classification.intent,
      },
    };
  });

  const crmUpdates = classifications
    .filter((classification) => classification.matchedAccountId && classification.intent !== 'wrong_person')
    .map((classification) => ({
      accountId: classification.matchedAccountId as string,
      stage: classification.crmPatch.stage,
      nextAction: classification.crmPatch.next_action,
      nextActionAt: new Date(Date.parse(now) + 24 * 60 * 60 * 1000).toISOString(),
      sourceExternalMessageId: classification.external_message_id,
    }));

  const sequenceStops = Array.from(sequenceStopsByKey.values());
  const matchedReplies = classifications.filter((classification) => classification.matchedAccountId).length;
  const meetingIntent = classifications.filter((classification) => classification.intent === 'meeting_intent').length;
  const objectionCount = classifications.filter((classification) => classification.intent === 'objection').length;
  const suppressionIntent = classifications.filter((classification) => classification.intent === 'unsubscribe').length;

  return {
    runKey: input.runKey,
    tenantId: input.tenantId ?? null,
    threads,
    messages,
    classifications,
    actionSuggestions,
    crmUpdates,
    sequenceStops,
    persistence: {
      inboxRun: {
        run_key: input.runKey,
        tenant_id: input.tenantId ?? null,
        provider: 'gmail',
        status: 'completed',
        scorecard: {
          totalReplies: input.replies.length,
          matchedReplies,
          meetingIntent,
          objections: objectionCount,
          suppressionIntent,
          sequenceStops: sequenceStops.length,
          actionSuggestions: actionSuggestions.length,
        },
        metadata: {
          runKey: input.runKey,
          tenantId: input.tenantId ?? null,
          proof: true,
          program: '6_inbox_reply_intelligence',
        },
      },
      inboxThreads: threads,
      inboxMessages: messages,
      inboxClassifications: classifications.map((classification) => ({
        run_key: classification.run_key,
        thread_key: classification.thread_key,
        external_message_id: classification.external_message_id,
        account_id: classification.matchedAccountId,
        contact_id: classification.matchedContactId,
        email_queue_id: classification.matchedQueueId,
        intent: classification.intent,
        sentiment: classification.sentiment,
        confidence: classification.confidence,
        extracted_signals: classification.extractedSignals,
        crm_patch: classification.crmPatch,
        follow_up_suggestion: classification.followUpSuggestion,
        metadata: classification.metadata,
      })),
      actionSuggestions: actionSuggestions.map((suggestion) => ({
        run_key: suggestion.run_key,
        account_id: suggestion.account_id,
        contact_id: suggestion.contact_id,
        classification_external_message_id: suggestion.classification_external_message_id,
        action_type: suggestion.action_type,
        priority: suggestion.priority,
        suggestion: suggestion.suggestion,
        status: suggestion.status,
        metadata: suggestion.metadata,
      })),
      sequenceStops,
    },
  };
}
