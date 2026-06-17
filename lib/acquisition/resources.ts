import type { AcquisitionOffer, BusinessModel } from './types';

export type LeadGenerationResource = {
  name: string;
  category:
    | 'lead_source'
    | 'enrichment'
    | 'verification'
    | 'outreach'
    | 'crm'
    | 'analytics'
    | 'automation'
    | 'research';
  priority: 'core' | 'recommended' | 'optional';
  useCase: string;
};

export const LEAD_GENERATION_RESOURCES: LeadGenerationResource[] = [
  {
    name: 'Google Business Profile search',
    category: 'lead_source',
    priority: 'core',
    useCase: 'Find local businesses with weak websites, missing booking flows, or outdated presence.',
  },
  {
    name: 'BuiltWith / Wappalyzer',
    category: 'enrichment',
    priority: 'recommended',
    useCase: 'Identify stale CMS, missing analytics, weak ecommerce stacks, and migration opportunities.',
  },
  {
    name: 'PageSpeed Insights / Lighthouse',
    category: 'verification',
    priority: 'core',
    useCase: 'Produce objective website-performance evidence before drafting outreach.',
  },
  {
    name: 'Hunter / Apollo / Clay',
    category: 'enrichment',
    priority: 'optional',
    useCase: 'Cross-check decision-maker contact data when free sources are not enough.',
  },
  {
    name: 'Resend / AWS SES',
    category: 'outreach',
    priority: 'recommended',
    useCase: 'Send approved campaigns with verified domains, suppression handling, and bounce tracking.',
  },
  {
    name: 'Supabase',
    category: 'crm',
    priority: 'core',
    useCase: 'Own the local CRM, audit trail, campaign status, and metric history.',
  },
  {
    name: 'PostHog / Vercel Analytics',
    category: 'analytics',
    priority: 'recommended',
    useCase: 'Measure inbound funnel quality from audits, service pages, and booking calls.',
  },
  {
    name: 'Exa / search MCP',
    category: 'research',
    priority: 'recommended',
    useCase: 'Research companies, recent signals, competitors, hiring, launches, and personalization facts.',
  },
  {
    name: 'GitHub MCP',
    category: 'research',
    priority: 'recommended',
    useCase: 'Qualify technical companies and developer-facing prospects from public repo activity.',
  },
  {
    name: 'Playwright',
    category: 'automation',
    priority: 'core',
    useCase: 'Run repeatable website checks, screenshots, form smoke tests, and dashboard verification.',
  },
];

export const OFFER_LABELS: Record<AcquisitionOffer, string> = {
  site_starter: 'Website starter',
  site_care: 'Website care plan',
  brand_care: 'Brand and online presence',
  ai_development: 'AI application build',
  seo_conversion_audit: 'SEO and conversion audit',
  lead_generation_system: 'Lead-generation system',
  job_search_system: 'Job-search automation system',
  custom: 'Custom build',
};

export const MODEL_OFFER_MAP: Record<BusinessModel, AcquisitionOffer> = {
  local_service: 'site_starter',
  professional_service: 'seo_conversion_audit',
  creator: 'brand_care',
  saas: 'ai_development',
  ecommerce: 'seo_conversion_audit',
  health_wellness: 'site_starter',
  real_estate: 'brand_care',
  recruiting: 'lead_generation_system',
  education: 'ai_development',
  unknown: 'seo_conversion_audit',
};
