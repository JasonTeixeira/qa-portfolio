import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export type RevenueApiScope =
  | 'leads:write'
  | 'jobs:write'
  | 'events:write'
  | 'audits:write'
  | 'outcomes:write'
  | 'exports:read'
  | 'webhooks:write'
  | '*';

export type RevenueApiKeyRecord = {
  id: string;
  tenantKey: string;
  keyHash: string;
  scopes: string[];
  status: 'active' | 'revoked' | 'expired';
  expiresAt?: string | null;
};

function normalizeTenantKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function hashRevenueApiKey(secret: string) {
  return createHash('sha256').update(secret).digest('hex');
}

export function buildRevenueApiKey(input: {
  tenantKey: string;
  scopes: RevenueApiScope[];
  entropy?: string;
}) {
  const tenantKey = normalizeTenantKey(input.tenantKey);
  const random = input.entropy
    ? createHash('sha256').update(`${tenantKey}:${input.entropy}`).digest('base64url').slice(0, 40)
    : randomBytes(32).toString('base64url');
  const secret = `rosk_live_${random}`;
  return {
    tenantKey,
    secret,
    keyHash: hashRevenueApiKey(secret),
    prefix: secret.slice(0, 16),
    lastFour: secret.slice(-4),
    scopes: [...new Set(input.scopes)],
  };
}

export function verifyRevenueApiKey(input: {
  presentedKey: string | null | undefined;
  records: RevenueApiKeyRecord[];
  now?: string;
}) {
  if (!input.presentedKey) return null;
  const presentedHash = hashRevenueApiKey(input.presentedKey);
  const nowMs = input.now ? new Date(input.now).getTime() : Date.now();
  for (const record of input.records) {
    if (record.status !== 'active') continue;
    if (record.expiresAt && new Date(record.expiresAt).getTime() <= nowMs) continue;
    if (safeEqual(record.keyHash, presentedHash)) return record;
  }
  return null;
}

export function hasRevenueApiScope(scopes: string[], required: RevenueApiScope) {
  return scopes.includes('*') || scopes.includes(required);
}

export function parseBearerApiKey(authorization: string | null) {
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function signRevenueWebhookPayload(input: {
  secret: string;
  timestamp: string;
  body: string;
}) {
  return createHmac('sha256', input.secret).update(`${input.timestamp}.${input.body}`).digest('hex');
}

export function verifyRevenueWebhookSignature(input: {
  secret: string;
  timestamp: string | null;
  body: string;
  signature: string | null;
  toleranceSeconds?: number;
  now?: string;
}) {
  if (!input.timestamp || !input.signature) return { ok: false as const, reason: 'missing_signature' };
  const eventTime = new Date(input.timestamp).getTime();
  if (!Number.isFinite(eventTime)) return { ok: false as const, reason: 'invalid_timestamp' };
  const now = input.now ? new Date(input.now).getTime() : Date.now();
  const toleranceMs = (input.toleranceSeconds ?? 300) * 1000;
  if (Math.abs(now - eventTime) > toleranceMs) return { ok: false as const, reason: 'stale_signature' };
  const expected = signRevenueWebhookPayload({
    secret: input.secret,
    timestamp: input.timestamp,
    body: input.body,
  });
  return safeEqual(expected, input.signature)
    ? { ok: true as const }
    : { ok: false as const, reason: 'invalid_signature' };
}

export function buildIdempotencyKey(input: {
  tenantKey: string;
  resource: string;
  externalId?: string | null;
  idempotencyKey?: string | null;
}) {
  const tenantKey = normalizeTenantKey(input.tenantKey);
  const stableId = input.idempotencyKey || input.externalId;
  if (stableId) return `${tenantKey}:${input.resource}:${String(stableId).trim()}`;
  return `${tenantKey}:${input.resource}:${Date.now()}`;
}

export function hashRequestBody(body: string) {
  return createHash('sha256').update(body).digest('hex');
}

export function csvEscape(value: unknown) {
  const text = value == null ? '' : String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}
