import { buildAcquisitionEnrichment, domainFromEmail, domainFromUrl } from './enrichment';
import { scoreAcquisitionAccount } from './scoring';
import type { LeadInput } from '@/lib/leads/capture';
import type { AcquisitionSignalInput, BusinessModel } from './types';

type InboundMetadata = Record<string, unknown> | undefined;

export type InboundAcquisitionInput = Omit<LeadInput, 'notify'> & {
  leadId?: string | null;
};

export type InboundAcquisitionCandidate = {
  lookup: {
    websiteUrl: string | null;
    email: string | null;
    domain: string | null;
  };
  account: Record<string, unknown>;
  contact: Record<string, unknown>;
  metrics: {
    accounts_added: number;
    accounts_qualified: number;
  };
};

const BUDGET_MAP: Record<string, NonNullable<AcquisitionSignalInput['estimatedBudget']>> = {
  '<10k': '5k_10k',
  '10-25k': '10k_25k',
  '25-50k': '25k_plus',
  '50-100k': '25k_plus',
  '100k+': '25k_plus',
  unsure: 'unknown',
};

function cleanString(value: unknown, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function urlFromText(text: string) {
  const match = text.match(/https?:\/\/[^\s),]+/i);
  return normalizeUrl(match?.[0]);
}

function normalizeUrl(value: unknown) {
  const raw = cleanString(value, 2048);
  if (!raw) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function metadataString(metadata: InboundMetadata, keys: string[]) {
  for (const key of keys) {
    const value = cleanString(metadata?.[key]);
    if (value) return value;
  }
  return '';
}

function attributionSource(metadata: InboundMetadata) {
  const attribution = metadata?.attribution;
  if (!attribution || typeof attribution !== 'object') return '';
  return cleanString((attribution as Record<string, unknown>).utmSource, 80);
}

function inferBusinessModel(text: string): BusinessModel {
  if (/\b(dental|clinic|patient|hvac|roof|plumb|landscap|spa|fitness|salon)\b/i.test(text)) {
    return 'local_service';
  }
  if (/\b(law|legal|accounting|consult|agency|advisor|insurance|professional)\b/i.test(text)) {
    return 'professional_service';
  }
  if (/\b(saas|software|platform|api|developer|ai product|agent)\b/i.test(text)) return 'saas';
  if (/\b(ecommerce|shop|store|checkout|retail)\b/i.test(text)) return 'ecommerce';
  if (/\b(health|wellness|therapy|medical)\b/i.test(text)) return 'health_wellness';
  if (/\b(real estate|realtor|property|broker)\b/i.test(text)) return 'real_estate';
  if (/\b(recruit|staffing|talent|hiring)\b/i.test(text)) return 'recruiting';
  if (/\b(course|school|education|academy|training)\b/i.test(text)) return 'education';
  if (/\b(creator|coach|newsletter|media)\b/i.test(text)) return 'creator';
  return 'unknown';
}

function roleFit(role: string) {
  if (/\b(founder|owner|principal|partner)\b/i.test(role)) return 'founder';
  if (/\b(ceo|president|chief|vp|director)\b/i.test(role)) return 'executive';
  if (/\b(marketing|growth|brand)\b/i.test(role)) return 'marketing';
  if (/\b(tech|engineering|cto|developer)\b/i.test(role)) return 'technical';
  if (/\b(recruit|talent)\b/i.test(role)) return 'recruiter';
  return 'unknown';
}

function accountName(input: InboundAcquisitionInput, websiteUrl: string | null) {
  const company = metadataString(input.metadata, ['company', 'companyName', 'business', 'businessName']);
  if (company) return company;
  const domain = domainFromUrl(websiteUrl) ?? domainFromEmail(input.email);
  if (domain) return domain;
  return input.name?.trim() || 'Inbound website lead';
}

export function buildInboundAcquisitionCandidate(
  input: InboundAcquisitionInput,
): InboundAcquisitionCandidate | null {
  if (input.source === 'newsletter') return null;

  const websiteUrl =
    normalizeUrl(input.metadata?.url) ??
    normalizeUrl(input.metadata?.websiteUrl) ??
    normalizeUrl(input.metadata?.website) ??
    urlFromText(input.detail);
  const company = accountName(input, websiteUrl);
  const role = metadataString(input.metadata, ['role', 'title', 'contactTitle']);
  const timeline = metadataString(input.metadata, ['timeline']);
  const sourceDetail = metadataString(input.metadata, ['source']);
  const budget = BUDGET_MAP[input.budget ?? ''] ?? 'unknown';
  const auditScore = Number(input.metadata?.score ?? Number.NaN);
  const text = [input.detail, input.inquiryType, input.budget, company, role, timeline, sourceDetail].join(' ');
  const source: NonNullable<AcquisitionSignalInput['source']> =
    input.source === 'seo_audit' ? 'seo_audit' : 'inbound';

  const signals: AcquisitionSignalInput = {
    businessModel: inferBusinessModel(text),
    websiteUrl,
    source,
    industry: metadataString(input.metadata, ['industry', 'market', 'niche']) || null,
    hasBrokenWebsite: /\b(broken|down|error|bug|not working)\b/i.test(text),
    hasOutdatedBrand: /\b(outdated|dated|brand|rebrand|polished)\b/i.test(text),
    hasWeakSeo: input.source === 'seo_audit' || /\b(seo|search|ranking|visibility|traffic|google)\b/i.test(text),
    hasWeakConversionPath: /\b(conversion|lead|funnel|cta|sales|inbound|new patients?)\b/i.test(text),
    hasBookingOrCheckoutGap: /\b(booking|schedule|appointment|checkout|payment)\b/i.test(text),
    hasRecentHiringSignal: /\b(hiring|recruit|talent|job)\b/i.test(text),
    hasRecentFundingOrLaunch: /\b(launch|funding|funded|opening|growth|this quarter)\b/i.test(text),
    isOwnerOperated: /\b(owner|founder|principal|partner|ceo)\b/i.test(role),
    contactConfidence: input.email ? 90 : 35,
    estimatedBudget: budget,
    location: metadataString(input.metadata, ['location', 'city', 'region']) || null,
    companySize: metadataString(input.metadata, ['companySize', 'employees']) || null,
    sourceConfidence: input.source === 'contact' || input.source === 'checkout' ? 92 : 86,
    notes: input.detail,
  };

  const score = scoreAcquisitionAccount(signals);
  const enrichment = buildAcquisitionEnrichment({
    websiteUrl,
    contactEmail: input.email,
    industry: signals.industry ?? null,
    location: signals.location ?? null,
  });
  const utmSource = attributionSource(input.metadata);
  const tags = [
    'public_funnel',
    input.source,
    source,
    signals.businessModel,
    budget,
    `close_${score.closeProbability}`,
    utmSource ? `utm_${utmSource.toLowerCase().replaceAll(/[^a-z0-9]+/g, '_')}` : '',
    ...enrichment.signals,
  ].filter(Boolean);

  return {
    lookup: {
      websiteUrl,
      email: input.email?.toLowerCase() ?? null,
      domain: domainFromUrl(websiteUrl) ?? domainFromEmail(input.email),
    },
    account: {
      lead_id: input.leadId ?? null,
      name: company,
      website_url: websiteUrl,
      industry: signals.industry,
      location: signals.location,
      company_size: signals.companySize,
      source,
      stage: score.totalScore >= 45 ? 'qualified' : 'prospect',
      priority: score.priority,
      fit_score: score.fitScore,
      urgency_score: score.urgencyScore,
      revenue_score: score.revenueScore,
      total_score: score.totalScore,
      recommended_offer: score.recommendedOffer,
      pain_summary: score.reasons.join('; '),
      next_action:
        source === 'seo_audit'
          ? 'Review the public SEO audit and draft a specific follow-up.'
          : score.nextAction,
      next_action_at: new Date().toISOString(),
      tags,
      metadata: {
        inbound: {
          source: input.source,
          inquiryType: input.inquiryType ?? null,
          budget: input.budget ?? null,
          timeline: timeline || null,
          sourceDetail: sourceDetail || null,
          auditScore: Number.isFinite(auditScore) ? auditScore : null,
        },
        signals,
        score,
        scoreReasons: score.reasons,
        scoreWarnings: score.warnings,
        enrichment,
        originalLeadMetadata: input.metadata ?? {},
      },
    },
    contact: {
      full_name: input.name,
      title: role || null,
      email: input.email?.toLowerCase() ?? null,
      role_fit: roleFit(role),
      confidence: input.email ? 90 : 35,
      is_primary: true,
      source,
      metadata: {
        public_funnel: true,
        source: input.source,
      },
    },
    metrics: {
      accounts_added: 1,
      accounts_qualified: score.totalScore >= 45 ? 1 : 0,
    },
  };
}
