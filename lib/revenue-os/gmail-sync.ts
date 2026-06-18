import type { InboxReplyInput } from './inbox-intelligence';

export type GmailApiMessageListItem = {
  id: string;
  threadId?: string;
};

export type GmailApiMessagePart = {
  mimeType?: string;
  body?: {
    data?: string;
  };
  parts?: GmailApiMessagePart[];
};

export type GmailApiMessage = GmailApiMessageListItem & {
  snippet?: string;
  payload?: GmailApiMessagePart & {
    headers?: Array<{ name: string; value: string }>;
  };
  internalDate?: string;
};

export type GmailSyncPlan = {
  provider: 'gmail';
  configured: boolean;
  listUrl: string;
  query: string;
  maxResults: number;
  warnings: string[];
};

export function buildGmailReplySyncPlan(input: {
  accessToken?: string | null;
  userId?: string;
  newerThanDays?: number;
  maxResults?: number;
  fromAddress?: string;
}) {
  const userId = input.userId ?? 'me';
  const maxResults = Math.min(Math.max(input.maxResults ?? 25, 1), 100);
  const queryParts = [
    'in:inbox',
    input.newerThanDays ? `newer_than:${input.newerThanDays}d` : 'newer_than:14d',
    input.fromAddress ? `from:${input.fromAddress}` : '',
  ].filter(Boolean);
  const query = queryParts.join(' ');
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  });
  const warnings = input.accessToken ? [] : ['GOOGLE_GMAIL_ACCESS_TOKEN missing; Gmail sync will stay in dry-run mode.'];

  return {
    provider: 'gmail' as const,
    configured: Boolean(input.accessToken),
    listUrl: `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(userId)}/messages?${params.toString()}`,
    query,
    maxResults,
    warnings,
  } satisfies GmailSyncPlan;
}

function header(message: GmailApiMessage, name: string) {
  return message.payload?.headers?.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

function decodeBase64Url(value: string) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function findTextPart(part?: GmailApiMessagePart): string | null {
  if (!part) return null;
  if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64Url(part.body.data);
  for (const child of part.parts ?? []) {
    const found = findTextPart(child);
    if (found) return found;
  }
  return null;
}

export function normalizeGmailMessageToInboxReply(message: GmailApiMessage): InboxReplyInput {
  const dateHeader = header(message, 'Date');
  const receivedAt = message.internalDate
    ? new Date(Number(message.internalDate)).toISOString()
    : dateHeader
      ? new Date(dateHeader).toISOString()
      : new Date().toISOString();
  return {
    externalMessageId: message.id,
    threadId: message.threadId ?? message.id,
    from: header(message, 'From'),
    subject: header(message, 'Subject'),
    body: findTextPart(message.payload) ?? message.snippet ?? '',
    receivedAt,
  };
}

export async function fetchGmailInboxReplies(input: {
  accessToken: string;
  userId?: string;
  newerThanDays?: number;
  maxResults?: number;
  fromAddress?: string;
  fetchImpl?: typeof fetch;
}) {
  const fetcher = input.fetchImpl ?? fetch;
  const plan = buildGmailReplySyncPlan(input);
  if (!plan.configured) return { plan, replies: [] as InboxReplyInput[] };

  const headers = { Authorization: `Bearer ${input.accessToken}` };
  const listResponse = await fetcher(plan.listUrl, { headers });
  if (!listResponse.ok) {
    throw new Error(`Gmail list failed: ${listResponse.status}`);
  }
  const listJson = await listResponse.json() as { messages?: GmailApiMessageListItem[] };
  const messages = listJson.messages ?? [];
  const replies: InboxReplyInput[] = [];

  for (const item of messages) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(input.userId ?? 'me')}/messages/${encodeURIComponent(item.id)}?format=full`;
    const detailResponse = await fetcher(url, { headers });
    if (!detailResponse.ok) {
      throw new Error(`Gmail message ${item.id} failed: ${detailResponse.status}`);
    }
    replies.push(normalizeGmailMessageToInboxReply(await detailResponse.json() as GmailApiMessage));
  }

  return { plan, replies };
}
