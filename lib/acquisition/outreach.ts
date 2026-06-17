import { OFFER_LABELS } from './resources';
import type { AcquisitionOffer } from './types';

export type OutreachDraftInput = {
  accountName: string;
  websiteUrl?: string | null;
  contactName?: string | null;
  contactTitle?: string | null;
  industry?: string | null;
  painSummary?: string | null;
  recommendedOffer?: AcquisitionOffer | string | null;
  source?: string | null;
  companySize?: string | null;
  notes?: string | null;
  closeProbability?: number | null;
  confidence?: number | null;
  scoreReasons?: string[];
  scoreWarnings?: string[];
  auditIssues?: unknown[];
  auditOpportunities?: unknown[];
  auditScore?: number | null;
  publicReportShareId?: string | null;
};

export type OutreachDraft = {
  subject: string;
  body: string;
  personalizationNotes: string;
  callToAction: string;
  metadata: {
    qualityScore: number;
    angle: string;
    proofPoints: string[];
    risks: string[];
    followUpBody: string;
  };
};

function offerLabel(offer: AcquisitionOffer | string | null | undefined) {
  if (!offer) return 'website and growth system';
  return OFFER_LABELS[offer as AcquisitionOffer] ?? offer.replaceAll('_', ' ');
}

function evidenceText(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const primary = record.check ?? record.title ?? record.label;
  const detail = record.detail;
  if (typeof primary === 'string' && typeof detail === 'string') return `${primary}: ${detail}`;
  if (typeof primary === 'string') return primary;
  if (typeof detail === 'string') return detail;
  return null;
}

function cleanSentence(value: string) {
  return value.trim().replace(/\s+/g, ' ').replace(/[.。]+$/g, '');
}

function lowerFirst(value: string) {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function strongestAngle(input: OutreachDraftInput) {
  const role = input.contactTitle?.toLowerCase() ?? '';
  const offer = offerLabel(input.recommendedOffer);
  if (role.includes('owner') || role.includes('founder') || role.includes('ceo')) {
    return `owner-level ${offer} opportunity`;
  }
  if (input.industry) return `${input.industry} ${offer} opportunity`;
  return `${offer} opportunity`;
}

function buildProofPoints(input: OutreachDraftInput, issue: string, opportunity: string) {
  return [
    input.auditScore != null ? `Audit score: ${input.auditScore}/100` : null,
    issue ? `Observed issue: ${cleanSentence(issue)}` : null,
    opportunity ? `First fix: ${cleanSentence(opportunity)}` : null,
    input.closeProbability != null ? `Close fit: ${input.closeProbability}%` : null,
    input.source ? `Lead source: ${input.source}` : null,
  ].filter((item): item is string => Boolean(item));
}

function qualityScore(input: OutreachDraftInput, proofPoints: string[]) {
  let score = 35;
  if (input.contactName) score += 12;
  if (input.contactTitle) score += 8;
  if (input.websiteUrl) score += 10;
  if (input.industry) score += 8;
  if (input.auditScore != null || input.auditIssues?.length) score += 14;
  if (input.auditOpportunities?.length) score += 8;
  if (input.closeProbability != null) score += 5;
  if (proofPoints.length >= 3) score += 5;
  return Math.max(0, Math.min(100, score));
}

export function buildOutreachDraft(input: OutreachDraftInput): OutreachDraft {
  const firstName = input.contactName?.split(/\s+/)[0] || null;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const issue =
    evidenceText(input.auditIssues?.[0]) ??
    input.painSummary ??
    'your site could convert more of the demand you already have';
  const opportunity =
    evidenceText(input.auditOpportunities?.[0]) ??
    'tighten the offer path, improve trust signals, and make it easier for visitors to take action';
  const offer = offerLabel(input.recommendedOffer);
  const angle = strongestAngle(input);
  const proofPoints = buildProofPoints(input, issue, opportunity);
  const risks = [
    ...(input.scoreWarnings ?? []),
    !input.contactName ? 'missing contact name' : null,
    !input.auditIssues?.length ? 'missing live audit issue evidence' : null,
  ].filter((item): item is string => Boolean(item));
  const score = qualityScore(input, proofPoints);
  const subject = `${input.accountName} ${angle}`;

  const siteLine = input.websiteUrl
    ? `I reviewed ${input.websiteUrl} and noticed ${lowerFirst(cleanSentence(issue))}.`
    : `I reviewed ${input.accountName}'s online presence and noticed ${lowerFirst(cleanSentence(issue))}.`;
  const proofLine = proofPoints.length
    ? `The specific evidence I would anchor on: ${proofPoints.slice(0, 3).join('; ')}.`
    : 'The specific angle is based on visible website and conversion friction.';
  const reportLine = input.publicReportShareId
    ? `I also have a short shareable audit report ready if useful.`
    : `I can turn this into a short audit report if it would be useful.`;
  const followUpBody = `${greeting}

Quick follow-up on the note below. The reason I reached out is specific: ${cleanSentence(issue)}.

If this is on your radar, I can send the top 3 fixes I would make first. If not, no worries.`;

  return {
    subject,
    callToAction: 'book a 15-minute fit call',
    personalizationNotes: [
      input.industry ? `Industry: ${input.industry}` : null,
      input.contactTitle ? `Contact role: ${input.contactTitle}` : null,
      input.source ? `Source: ${input.source}` : null,
      input.companySize ? `Company size: ${input.companySize}` : null,
      input.closeProbability != null ? `Close probability: ${input.closeProbability}%` : null,
      input.confidence != null ? `Score confidence: ${input.confidence}%` : null,
      `Personalization quality: ${score}/100`,
      `Angle: ${angle}`,
      `Primary angle: ${issue}`,
      `Offer: ${offer}`,
      proofPoints.length ? `Proof points:\n- ${proofPoints.join('\n- ')}` : null,
      risks.length ? `Risks:\n- ${risks.join('\n- ')}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
    body: `${greeting}

${siteLine}

${proofLine}

The practical fix is not a giant rebuild. I would start by helping ${input.accountName} ${lowerFirst(cleanSentence(opportunity))}.

I build fast, clean websites, brand systems, AI-enabled workflows, and lead-generation infrastructure for businesses that need their online presence to turn into real opportunities.

${reportLine} Would a quick 15-minute call this week be worth it?`,
    metadata: {
      qualityScore: score,
      angle,
      proofPoints,
      risks,
      followUpBody,
    },
  };
}
