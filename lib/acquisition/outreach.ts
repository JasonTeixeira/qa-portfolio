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
  auditIssues?: string[];
  auditOpportunities?: string[];
};

export type OutreachDraft = {
  subject: string;
  body: string;
  personalizationNotes: string;
  callToAction: string;
};

function offerLabel(offer: AcquisitionOffer | string | null | undefined) {
  if (!offer) return 'website and growth system';
  return OFFER_LABELS[offer as AcquisitionOffer] ?? offer.replaceAll('_', ' ');
}

export function buildOutreachDraft(input: OutreachDraftInput): OutreachDraft {
  const firstName = input.contactName?.split(/\s+/)[0] || null;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const issue = input.auditIssues?.[0] ?? input.painSummary ?? 'your site could convert more of the demand you already have';
  const opportunity =
    input.auditOpportunities?.[0] ??
    'tighten the offer path, improve trust signals, and make it easier for visitors to take action';
  const offer = offerLabel(input.recommendedOffer);
  const subject = `${input.accountName} website opportunity`;

  const siteLine = input.websiteUrl
    ? `I was looking at ${input.websiteUrl} and noticed ${issue.toLowerCase()}.`
    : `I was reviewing ${input.accountName}'s online presence and noticed ${issue.toLowerCase()}.`;

  return {
    subject,
    callToAction: 'book a 15-minute fit call',
    personalizationNotes: [
      input.industry ? `Industry: ${input.industry}` : null,
      input.contactTitle ? `Contact role: ${input.contactTitle}` : null,
      `Primary angle: ${issue}`,
      `Offer: ${offer}`,
    ]
      .filter(Boolean)
      .join('\n'),
    body: `${greeting}

${siteLine}

The practical fix is not a giant rebuild. I would start by helping ${input.accountName} ${opportunity.toLowerCase()}.

I build fast, clean websites, brand systems, AI-enabled workflows, and lead-generation infrastructure for businesses that need their online presence to turn into real opportunities.

If useful, I can send over a short audit with the top 3 fixes I would make first. Would a quick 15-minute call this week be worth it?`,
  };
}
