import { MODEL_OFFER_MAP } from './resources';
import type {
  AcquisitionOffer,
  AcquisitionPriority,
  AcquisitionScore,
  AcquisitionSignalInput,
} from './types';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const BUDGET_POINTS: Record<NonNullable<AcquisitionSignalInput['estimatedBudget']>, number> = {
  under_2k: 8,
  '2k_5k': 18,
  '5k_10k': 30,
  '10k_25k': 42,
  '25k_plus': 55,
  unknown: 15,
};

const MARKET_MODEL_POINTS: Record<NonNullable<AcquisitionSignalInput['businessModel']>, number> = {
  local_service: 20,
  professional_service: 24,
  creator: 16,
  saas: 22,
  ecommerce: 24,
  health_wellness: 18,
  real_estate: 20,
  recruiting: 22,
  education: 18,
  unknown: 10,
};

const SOURCE_QUALITY_POINTS: Record<NonNullable<AcquisitionSignalInput['source']>, number> = {
  referral: 18,
  inbound: 18,
  seo_audit: 16,
  directory: 12,
  linkedin: 12,
  github: 12,
  job_board: 10,
  manual: 9,
  bulk_import: 7,
  other: 6,
};

function priorityFor(totalScore: number): AcquisitionPriority {
  if (totalScore >= 60) return 'urgent';
  if (totalScore >= 52) return 'high';
  if (totalScore >= 45) return 'medium';
  return 'low';
}

function offerFor(input: AcquisitionSignalInput): AcquisitionOffer {
  if (input.hasRecentHiringSignal || input.hasRecentFundingOrLaunch) return 'ai_development';
  if (input.hasWeakConversionPath || input.hasWeakSeo) return 'seo_conversion_audit';
  if (input.hasOutdatedBrand) return 'brand_care';
  if (input.hasBrokenWebsite || input.hasBookingOrCheckoutGap) return 'site_starter';
  return MODEL_OFFER_MAP[input.businessModel ?? 'unknown'];
}

export function scoreAcquisitionAccount(input: AcquisitionSignalInput): AcquisitionScore {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let market = MARKET_MODEL_POINTS[input.businessModel ?? 'unknown'];
  let problem = 0;
  let access = SOURCE_QUALITY_POINTS[input.source ?? 'manual'];
  let timing = 8;
  let value = BUDGET_POINTS[input.estimatedBudget ?? 'unknown'];

  if (input.industry) {
    market += 4;
    reasons.push(`${input.industry} segment identified`);
  } else {
    warnings.push('missing industry');
  }

  if (input.location) {
    market += 3;
    reasons.push('local market context captured');
  }

  if (input.websiteUrl) {
    market += 8;
    problem += 4;
    reasons.push('has a website to audit and improve');
  } else {
    warnings.push('missing website');
  }

  if (input.hasBrokenWebsite) {
    problem += 28;
    timing += 18;
    reasons.push('visible website quality issue');
  }

  if (input.hasOutdatedBrand) {
    problem += 12;
    timing += 8;
    reasons.push('brand presence looks dated');
  }

  if (input.hasWeakSeo) {
    problem += 18;
    timing += 9;
    reasons.push('SEO visibility gap');
  }

  if (input.hasWeakConversionPath) {
    problem += 24;
    timing += 12;
    value += 8;
    reasons.push('conversion path can be improved');
  }

  if (input.hasBookingOrCheckoutGap) {
    problem += 18;
    timing += 10;
    value += 5;
    reasons.push('missing booking or checkout path');
  }

  if (input.hasRecentHiringSignal) {
    timing += 14;
    value += 10;
    reasons.push('recent hiring signal');
  }

  if (input.hasRecentFundingOrLaunch) {
    timing += 18;
    value += 14;
    reasons.push('recent launch or growth signal');
  }

  if (input.isOwnerOperated) {
    access += 12;
    reasons.push('owner-operated decision path');
  }

  if ((input.contactConfidence ?? 0) >= 80) {
    access += 20;
    reasons.push('high-confidence contact');
  } else if ((input.contactConfidence ?? 0) >= 50) {
    access += 10;
    reasons.push('usable contact confidence');
  } else {
    warnings.push('weak contact confidence');
  }

  if ((input.sourceConfidence ?? 0) >= 80) {
    access += 6;
    reasons.push('high-confidence source');
  }

  if (/\\b(11-50|51-200|200\\+|enterprise|mid-market)\\b/i.test(input.companySize ?? '')) {
    value += 8;
    reasons.push('team size suggests budget capacity');
  }

  const normalizedMarket = clamp(market);
  const normalizedProblem = clamp(problem);
  const normalizedAccess = clamp(access);
  const normalizedTiming = clamp(timing);
  const normalizedValue = clamp(value);
  const normalizedFit = clamp(normalizedMarket * 0.55 + normalizedProblem * 0.45);
  const normalizedUrgency = clamp(normalizedTiming * 0.6 + normalizedProblem * 0.4);
  const normalizedRevenue = normalizedValue;
  const totalScore = clamp(
    normalizedMarket * 0.18 +
      normalizedProblem * 0.32 +
      normalizedAccess * 0.2 +
      normalizedTiming * 0.18 +
      normalizedValue * 0.12,
  );
  const closeProbability = clamp(totalScore * 0.62 + normalizedAccess * 0.18 + normalizedValue * 0.2);
  const confidence = clamp(
    30 +
      (input.websiteUrl ? 18 : 0) +
      ((input.contactConfidence ?? 0) >= 80 ? 22 : (input.contactConfidence ?? 0) >= 50 ? 12 : 0) +
      (input.industry ? 8 : 0) +
      (input.location ? 6 : 0) +
      Math.min(16, reasons.length * 2),
  );
  const recommendedOffer = offerFor(input);

  return {
    modelVersion: 'v2',
    fitScore: normalizedFit,
    urgencyScore: normalizedUrgency,
    revenueScore: normalizedRevenue,
    totalScore,
    closeProbability,
    confidence,
    priority: priorityFor(totalScore),
    recommendedOffer,
    reasons,
    warnings,
    segments: {
      market: normalizedMarket,
      problem: normalizedProblem,
      access: normalizedAccess,
      timing: normalizedTiming,
      value: normalizedValue,
    },
    nextAction:
      totalScore >= 60
        ? 'Draft a specific audit-led email with one concrete fix and a call booking CTA.'
        : totalScore >= 60
          ? 'Run a live audit, verify the primary contact, then draft a specific outreach message.'
          : 'Collect one more proof point before outreach.',
  };
}
