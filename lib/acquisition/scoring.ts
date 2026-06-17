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

function priorityFor(totalScore: number): AcquisitionPriority {
  if (totalScore >= 74) return 'urgent';
  if (totalScore >= 72) return 'high';
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
  let fitScore = 18;
  let urgencyScore = 10;
  let revenueScore = BUDGET_POINTS[input.estimatedBudget ?? 'unknown'];

  if (input.websiteUrl) {
    fitScore += 8;
    reasons.push('has a website to audit and improve');
  }

  if (input.hasBrokenWebsite) {
    fitScore += 18;
    urgencyScore += 20;
    reasons.push('visible website quality issue');
  }

  if (input.hasOutdatedBrand) {
    fitScore += 12;
    urgencyScore += 8;
    reasons.push('brand presence looks dated');
  }

  if (input.hasWeakSeo) {
    fitScore += 12;
    urgencyScore += 10;
    reasons.push('SEO visibility gap');
  }

  if (input.hasWeakConversionPath) {
    fitScore += 14;
    urgencyScore += 14;
    revenueScore += 8;
    reasons.push('conversion path can be improved');
  }

  if (input.hasBookingOrCheckoutGap) {
    fitScore += 10;
    urgencyScore += 12;
    reasons.push('missing booking or checkout path');
  }

  if (input.hasRecentHiringSignal) {
    urgencyScore += 12;
    revenueScore += 10;
    reasons.push('recent hiring signal');
  }

  if (input.hasRecentFundingOrLaunch) {
    urgencyScore += 16;
    revenueScore += 14;
    reasons.push('recent launch or growth signal');
  }

  if (input.isOwnerOperated) {
    fitScore += 8;
    reasons.push('owner-operated decision path');
  }

  if ((input.contactConfidence ?? 0) >= 80) {
    urgencyScore += 8;
    reasons.push('high-confidence contact');
  } else if ((input.contactConfidence ?? 0) >= 50) {
    urgencyScore += 4;
    reasons.push('usable contact confidence');
  }

  const normalizedFit = clamp(fitScore);
  const normalizedUrgency = clamp(urgencyScore);
  const normalizedRevenue = clamp(revenueScore);
  const totalScore = clamp(normalizedFit * 0.45 + normalizedUrgency * 0.3 + normalizedRevenue * 0.25);
  const recommendedOffer = offerFor(input);

  return {
    fitScore: normalizedFit,
    urgencyScore: normalizedUrgency,
    revenueScore: normalizedRevenue,
    totalScore,
    priority: priorityFor(totalScore),
    recommendedOffer,
    reasons,
    nextAction:
      totalScore >= 72
        ? 'Draft a specific audit-led email with one concrete fix and a call booking CTA.'
        : 'Collect one more proof point before outreach.',
  };
}
