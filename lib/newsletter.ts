import crypto from 'node:crypto';

export type NewsletterStatus = 'pending' | 'active' | 'unsubscribed';

export interface NewsletterSubscriber {
  pk: string; // SUB#<email>
  sk: string; // SUB
  email: string;
  status: NewsletterStatus;
  source?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  confirmedAt?: string; // ISO
  unsubscribedAt?: string; // ISO
  confirmTokenHash?: string; // sha256
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function subscriberPk(email: string): string {
  return `SUB#${normalizeEmail(email)}`;
}

export const subscriberSk = 'SUB';
