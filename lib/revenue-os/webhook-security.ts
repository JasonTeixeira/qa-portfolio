import crypto from 'node:crypto';

export type ResendWebhookSignatureInput = {
  secret: string;
  svixId: string | null | undefined;
  svixTimestamp: string | null | undefined;
  svixSignature: string | null | undefined;
  rawBody: string;
  now?: Date;
  toleranceSeconds?: number;
};

export type ResendWebhookSignatureResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'missing_headers'
        | 'invalid_timestamp'
        | 'stale_timestamp'
        | 'invalid_secret'
        | 'invalid_signature';
    };

function getSecretBytes(secret: string) {
  if (!secret) return null;
  if (!secret.startsWith('whsec_')) return Buffer.from(secret);
  try {
    return Buffer.from(secret.slice(6), 'base64');
  } catch {
    return null;
  }
}

export function verifyResendWebhookSignature(
  input: ResendWebhookSignatureInput,
): ResendWebhookSignatureResult {
  if (!input.svixId || !input.svixTimestamp || !input.svixSignature) {
    return { ok: false, reason: 'missing_headers' };
  }

  const timestampSeconds = Number(input.svixTimestamp);
  if (!Number.isFinite(timestampSeconds)) return { ok: false, reason: 'invalid_timestamp' };

  const toleranceSeconds = input.toleranceSeconds ?? 300;
  const nowSeconds = Math.floor((input.now ?? new Date()).getTime() / 1000);
  if (Math.abs(nowSeconds - timestampSeconds) > toleranceSeconds) {
    return { ok: false, reason: 'stale_timestamp' };
  }

  const secretBytes = getSecretBytes(input.secret);
  if (!secretBytes) return { ok: false, reason: 'invalid_secret' };

  const signedContent = `${input.svixId}.${input.svixTimestamp}.${input.rawBody}`;
  const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  const signatures = input.svixSignature
    .split(' ')
    .map((signature) => signature.split(',')[1])
    .filter(Boolean);

  const valid = signatures.some((signature) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  });

  return valid ? { ok: true } : { ok: false, reason: 'invalid_signature' };
}

export function buildResendWebhookEventId(input: {
  svixId: string;
  eventType: string;
  providerMessageId: string;
}) {
  return `resend:${input.svixId}:${input.eventType}:${input.providerMessageId}`;
}
