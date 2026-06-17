import type { AcquisitionSignalInput } from './types';

export type WebsiteAuditDraft = {
  overallScore: number;
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  conversionScore: number;
  brandScore: number;
  issues: string[];
  opportunities: string[];
  recommendedOffer: string;
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function buildWebsiteAuditDraft(input: AcquisitionSignalInput): WebsiteAuditDraft {
  const issues: string[] = [];
  const opportunities: string[] = [];

  let performanceScore = 78;
  let seoScore = 76;
  let accessibilityScore = 82;
  let conversionScore = 74;
  let brandScore = 78;

  if (input.hasBrokenWebsite) {
    performanceScore -= 22;
    accessibilityScore -= 10;
    issues.push('Visible site quality or reliability issue');
    opportunities.push('Stabilize the site experience and remove trust-breaking friction.');
  }

  if (input.hasWeakSeo) {
    seoScore -= 26;
    issues.push('Search visibility and metadata gap');
    opportunities.push('Create a stronger local/service SEO structure around commercial intent.');
  }

  if (input.hasWeakConversionPath) {
    conversionScore -= 28;
    issues.push('Weak conversion path');
    opportunities.push('Add a clear offer, proof, service path, and low-friction booking CTA.');
  }

  if (input.hasBookingOrCheckoutGap) {
    conversionScore -= 18;
    issues.push('Missing booking or checkout flow');
    opportunities.push('Add booking, intake, or checkout so demand can convert without back-and-forth.');
  }

  if (input.hasOutdatedBrand) {
    brandScore -= 24;
    issues.push('Outdated or inconsistent brand presentation');
    opportunities.push('Modernize the visual system, positioning, and credibility signals.');
  }

  if (issues.length === 0) {
    issues.push('Needs deeper audit evidence before outreach');
    opportunities.push('Run a live Lighthouse/PageSpeed audit and inspect the offer path.');
  }

  const scores = {
    performanceScore: clamp(performanceScore),
    seoScore: clamp(seoScore),
    accessibilityScore: clamp(accessibilityScore),
    conversionScore: clamp(conversionScore),
    brandScore: clamp(brandScore),
  };

  const overallScore = clamp(
    scores.performanceScore * 0.2 +
      scores.seoScore * 0.22 +
      scores.accessibilityScore * 0.14 +
      scores.conversionScore * 0.28 +
      scores.brandScore * 0.16,
  );

  return {
    overallScore,
    ...scores,
    issues,
    opportunities,
    recommendedOffer:
      input.hasWeakConversionPath || input.hasWeakSeo
        ? 'seo_conversion_audit'
        : input.hasOutdatedBrand
          ? 'brand_care'
          : 'site_starter',
  };
}
