import { OFFER_LABELS } from '@/lib/acquisition/resources';
import type { AcquisitionOffer } from '@/lib/acquisition/types';

export type PersonalizedOutreachV2Input = {
  accountName: string;
  websiteUrl?: string | null;
  contactName?: string | null;
  contactTitle?: string | null;
  industry?: string | null;
  offer?: AcquisitionOffer | string | null;
  source?: string | null;
  voice?: string | null;
  evidence: {
    auditScore?: number | null;
    issues?: string[];
    opportunities?: string[];
    leadSignals?: string[];
  };
};

export type PersonalizedOutreachV2Draft = {
  subject: string;
  body: string;
  sendMode: 'manual_review';
  qualityScore: number;
  spamRiskScore: number;
  checklist: string[];
  followUps: Array<{
    delayDays: number;
    subject: string;
    body: string;
  }>;
  metadata: {
    composerVersion: 'outreach_v2';
    evidenceCount: number;
    source: string | null;
    voice: string | null;
  };
};

function clean(value: string | null | undefined) {
  return (value ?? '').trim().replace(/\s+/g, ' ').replace(/[.]+$/g, '');
}

function firstName(value: string | null | undefined) {
  return clean(value).split(/\s+/)[0] || null;
}

function offerLabel(offer: PersonalizedOutreachV2Input['offer']) {
  if (!offer) return 'website growth audit';
  return OFFER_LABELS[offer as AcquisitionOffer] ?? String(offer).replaceAll('_', ' ');
}

function scoreQuality(input: PersonalizedOutreachV2Input) {
  const issueCount = input.evidence.issues?.filter(Boolean).length ?? 0;
  const opportunityCount = input.evidence.opportunities?.filter(Boolean).length ?? 0;
  const signalCount = input.evidence.leadSignals?.filter(Boolean).length ?? 0;
  let score = 35;
  if (input.accountName) score += 8;
  if (input.websiteUrl) score += 10;
  if (input.contactName) score += 10;
  if (input.contactTitle) score += 6;
  if (input.industry) score += 6;
  if (input.evidence.auditScore != null) score += 10;
  if (issueCount > 0) score += 14;
  if (opportunityCount > 0) score += 12;
  if (signalCount > 0) score += 7;
  if (input.voice) score += 4;
  return Math.max(0, Math.min(100, score));
}

function scoreSpamRisk(input: PersonalizedOutreachV2Input, body: string) {
  let risk = 18;
  const lower = body.toLowerCase();
  if (/guarantee|risk[- ]free|limited time|act now|free money/.test(lower)) risk += 30;
  if ((body.match(/!/g) ?? []).length > 1) risk += 10;
  if (body.length > 1_300) risk += 12;
  if (!input.evidence.issues?.length) risk += 14;
  if (!input.websiteUrl) risk += 8;
  if (input.contactName && input.evidence.issues?.length) risk -= 8;
  if (input.evidence.opportunities?.length) risk -= 6;
  return Math.max(0, Math.min(100, risk));
}

export function composePersonalizedOutreachV2(input: PersonalizedOutreachV2Input): PersonalizedOutreachV2Draft {
  const issue = clean(input.evidence.issues?.[0]) || 'the conversion path could be clearer';
  const opportunity = clean(input.evidence.opportunities?.[0]) || 'make the offer, proof, and booking path easier to act on';
  const greeting = firstName(input.contactName) ? `Hi ${firstName(input.contactName)},` : 'Hi,';
  const offer = offerLabel(input.offer);
  const subject = `${input.accountName} ${offer}`;
  const siteLine = input.websiteUrl
    ? `I reviewed ${input.websiteUrl} and found one specific thing worth tightening: ${issue}.`
    : `I reviewed ${input.accountName}'s online presence and found one specific thing worth tightening: ${issue}.`;
  const evidenceLine = [
    input.evidence.auditScore != null ? `audit score ${input.evidence.auditScore}/100` : null,
    input.source ? `source ${input.source}` : null,
    ...(input.evidence.leadSignals ?? []).slice(0, 2),
  ].filter(Boolean).join('; ');

  const body = `${greeting}

${siteLine}

The first practical fix I would make is simple: ${opportunity}.

${evidenceLine ? `The reason this looks actionable: ${evidenceLine}.` : 'The reason this looks actionable is that the issue is visible before a long discovery process.'}

I build fast websites, brand systems, AI workflows, and lead-generation infrastructure for service businesses. If useful, I can send a short audit with the top 3 fixes I would make first.

Would a 15-minute fit call this week be worth it?`;

  const checklist = [
    'manual approval required before send',
    input.websiteUrl ? 'specific website evidence included' : null,
    input.evidence.issues?.length ? 'visible problem referenced' : null,
    input.evidence.opportunities?.length ? 'specific first fix included' : null,
    input.contactName ? 'contact name personalized' : null,
    'one clear call to action',
  ].filter((item): item is string => Boolean(item));

  const qualityScore = scoreQuality(input);
  const spamRiskScore = scoreSpamRisk(input, body);

  return {
    subject,
    body,
    sendMode: 'manual_review',
    qualityScore,
    spamRiskScore,
    checklist,
    followUps: [
      {
        delayDays: 3,
        subject: `Re: ${subject}`,
        body: `${greeting}

Quick follow-up. The reason I reached out was specific: ${issue}.

If this is on your radar, I can send the top 3 fixes I would make first. If not, no worries.`,
      },
      {
        delayDays: 7,
        subject: `Re: ${subject}`,
        body: `${greeting}

Last note from me. I think the fastest win for ${input.accountName} is to ${opportunity}.

Worth sending over the short version?`,
      },
    ],
    metadata: {
      composerVersion: 'outreach_v2',
      evidenceCount: (input.evidence.issues?.length ?? 0) + (input.evidence.opportunities?.length ?? 0) + (input.evidence.leadSignals?.length ?? 0),
      source: input.source ?? null,
      voice: input.voice ?? null,
    },
  };
}
