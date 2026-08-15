import { createPublicKey, timingSafeEqual, verify } from 'node:crypto';

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

export type DiscordSignatureInput = {
  publicKey: string;
  signature: string | null;
  timestamp: string | null;
  body: string;
  nowMs?: number;
  maxAgeSeconds?: number;
};

function hexToBuffer(value: string, expectedBytes: number): Buffer | null {
  if (!/^[0-9a-f]+$/i.test(value)) return null;
  if (value.length !== expectedBytes * 2) return null;
  return Buffer.from(value, 'hex');
}

export function verifyDiscordRequestSignature(input: DiscordSignatureInput): boolean {
  if (!input.signature || !input.timestamp) return false;
  if (!timestampFresh(input.timestamp, input.nowMs ?? Date.now(), input.maxAgeSeconds ?? 300)) return false;

  const publicKeyBytes = hexToBuffer(input.publicKey.trim(), 32);
  const signatureBytes = hexToBuffer(input.signature.trim(), 64);
  if (!publicKeyBytes || !signatureBytes) return false;

  const message = Buffer.from(`${input.timestamp}${input.body}`, 'utf8');
  const publicKey = createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, publicKeyBytes]),
    format: 'der',
    type: 'spki',
  });

  try {
    return verify(null, message, publicKey, signatureBytes);
  } catch {
    return false;
  }
}

export function timestampFresh(timestamp: string, nowMs = Date.now(), maxAgeSeconds = 300): boolean {
  if (!/^\d+$/.test(timestamp)) return false;
  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs)) return false;
  return Math.abs(nowMs - timestampMs) <= Math.max(1, maxAgeSeconds) * 1000;
}

export function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
