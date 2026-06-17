export type AcquisitionStage =
  | 'prospect'
  | 'qualified'
  | 'drafted'
  | 'contacted'
  | 'follow_up'
  | 'meeting'
  | 'proposal'
  | 'won'
  | 'lost'
  | 'do_not_contact';

export type AcquisitionPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AcquisitionChannel = 'email' | 'linkedin' | 'phone' | 'referral' | 'x' | 'other';

export type AcquisitionOffer =
  | 'site_starter'
  | 'site_care'
  | 'brand_care'
  | 'ai_development'
  | 'seo_conversion_audit'
  | 'lead_generation_system'
  | 'job_search_system'
  | 'custom';

export type BusinessModel =
  | 'local_service'
  | 'professional_service'
  | 'creator'
  | 'saas'
  | 'ecommerce'
  | 'health_wellness'
  | 'real_estate'
  | 'recruiting'
  | 'education'
  | 'unknown';

export type AcquisitionSignalInput = {
  businessModel?: BusinessModel;
  websiteUrl?: string | null;
  source?: 'manual' | 'bulk_import' | 'directory' | 'referral' | 'github' | 'linkedin' | 'job_board' | 'inbound' | 'seo_audit' | 'other';
  industry?: string | null;
  hasBrokenWebsite?: boolean;
  hasOutdatedBrand?: boolean;
  hasWeakSeo?: boolean;
  hasWeakConversionPath?: boolean;
  hasBookingOrCheckoutGap?: boolean;
  hasRecentHiringSignal?: boolean;
  hasRecentFundingOrLaunch?: boolean;
  isOwnerOperated?: boolean;
  contactConfidence?: number;
  estimatedBudget?: 'under_2k' | '2k_5k' | '5k_10k' | '10k_25k' | '25k_plus' | 'unknown';
  location?: string | null;
  companySize?: string | null;
  sourceConfidence?: number;
  notes?: string | null;
};

export type AcquisitionScore = {
  modelVersion: 'v2';
  fitScore: number;
  urgencyScore: number;
  revenueScore: number;
  totalScore: number;
  closeProbability: number;
  confidence: number;
  priority: AcquisitionPriority;
  recommendedOffer: AcquisitionOffer;
  reasons: string[];
  warnings: string[];
  segments: {
    market: number;
    problem: number;
    access: number;
    timing: number;
    value: number;
  };
  nextAction: string;
};
