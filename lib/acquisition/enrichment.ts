export type AcquisitionEnrichment = {
  domain: string | null;
  hasWebsite: boolean;
  emailDomainMatchesWebsite: boolean | null;
  signals: string[];
  recommendedNextAction: string;
};

const FREE_EMAIL_DOMAINS = new Set([
  'aol.com',
  'gmail.com',
  'hotmail.com',
  'icloud.com',
  'outlook.com',
  'proton.me',
  'protonmail.com',
  'yahoo.com',
]);

export function domainFromUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

export function domainFromEmail(value: string | null | undefined) {
  return value?.split('@')[1]?.trim().toLowerCase() || null;
}

export function buildAcquisitionEnrichment(input: {
  websiteUrl?: string | null;
  contactEmail?: string | null;
  industry?: string | null;
  location?: string | null;
}): AcquisitionEnrichment {
  const domain = domainFromUrl(input.websiteUrl);
  const emailDomain = domainFromEmail(input.contactEmail);
  const signals: string[] = [];

  if (domain) signals.push('website domain captured');
  if (input.industry) signals.push('industry segment captured');
  if (input.location) signals.push('location captured');
  if (emailDomain && !FREE_EMAIL_DOMAINS.has(emailDomain)) signals.push('business email captured');

  const emailDomainMatchesWebsite = domain && emailDomain ? emailDomain === domain : null;
  if (emailDomainMatchesWebsite) signals.push('contact email matches website domain');
  if (emailDomain && FREE_EMAIL_DOMAINS.has(emailDomain)) signals.push('free email requires contact verification');

  return {
    domain,
    hasWebsite: Boolean(domain),
    emailDomainMatchesWebsite,
    signals,
    recommendedNextAction:
      domain && emailDomainMatchesWebsite !== false
        ? 'Run website audit, verify the decision-maker, then draft outreach.'
        : 'Verify website/contact data before outreach.',
  };
}

export function nextFollowUpDate(days = 3, from = new Date()) {
  const date = new Date(from);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(14, 0, 0, 0);
  return date.toISOString();
}
