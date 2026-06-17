import type { AcquisitionPriority } from '@/lib/acquisition/types';

export type EmailPrepMessage = {
  id: string;
  status: string;
  subject: string | null;
  body: string;
  accountName: string;
  contactEmail: string | null;
  priority: AcquisitionPriority | string;
};

export type PreparedEmail = {
  id: string;
  accountName: string;
  contactEmail: string;
  subject: string;
  priority: string;
  sendMode: 'manual_review';
  checklist: string[];
};

export type EmailPreparationQueue = {
  readyToSend: PreparedEmail[];
  blocked: Array<{ id: string; accountName: string; reason: string }>;
  summary: {
    ready: number;
    blocked: number;
  };
};

function validEmail(email: string | null): email is string {
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

export function buildEmailPreparationQueue(input: {
  messages: EmailPrepMessage[];
  suppressedEmails?: string[];
}): EmailPreparationQueue {
  const suppressed = new Set((input.suppressedEmails ?? []).map((email) => email.toLowerCase()));
  const readyToSend: PreparedEmail[] = [];
  const blocked: EmailPreparationQueue['blocked'] = [];

  for (const message of input.messages) {
    if (!['ready', 'queued'].includes(message.status)) continue;
    const email = message.contactEmail?.toLowerCase() ?? null;
    if (!validEmail(email)) {
      blocked.push({ id: message.id, accountName: message.accountName, reason: 'missing recipient email' });
      continue;
    }
    if (suppressed.has(email)) {
      blocked.push({ id: message.id, accountName: message.accountName, reason: 'recipient is suppressed' });
      continue;
    }
    if (!message.subject || message.subject.trim().length < 5) {
      blocked.push({ id: message.id, accountName: message.accountName, reason: 'subject is too weak' });
      continue;
    }
    if (message.body.trim().length < 40) {
      blocked.push({ id: message.id, accountName: message.accountName, reason: 'body is too short for professional outreach' });
      continue;
    }

    readyToSend.push({
      id: message.id,
      accountName: message.accountName,
      contactEmail: email,
      subject: message.subject.trim(),
      priority: message.priority,
      sendMode: 'manual_review',
      checklist: [
        'recipient verified',
        'specific business reason included',
        'manual approval required before send',
        'suppression list checked',
      ],
    });
  }

  readyToSend.sort((a, b) => {
    const weight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    return (weight[b.priority] ?? 0) - (weight[a.priority] ?? 0);
  });

  return {
    readyToSend,
    blocked,
    summary: {
      ready: readyToSend.length,
      blocked: blocked.length,
    },
  };
}
