export type LaunchAsset = {
  slug: string;
  title: string;
  url: string;
  campaign: string;
  audience: 'studio-buyer' | 'builder' | 'growth-lead';
  primaryCta: string;
  proofRoute: string;
};

export const programHLaunchAssets: LaunchAsset[] = [
  {
    slug: 'what-an-ai-native-studio-actually-builds',
    title: 'What an AI-Native Studio Actually Builds',
    url: '/blog/what-an-ai-native-studio-actually-builds',
    campaign: 'ai_native_studio_flagship',
    audience: 'studio-buyer',
    primaryCta: '/tools/route-finder',
    proofRoute: '/work/nexural',
  },
  {
    slug: 'the-ai-implementation-audit-before-you-build',
    title: 'The AI Implementation Audit Before You Build',
    url: '/blog/the-ai-implementation-audit-before-you-build',
    campaign: 'ai_audit_before_build',
    audience: 'studio-buyer',
    primaryCta: '/services/ai-implementation-consulting',
    proofRoute: '/services/ai-agent-development',
  },
  {
    slug: 'seo-as-an-engineering-system-not-a-blog-calendar',
    title: 'SEO as an Engineering System, Not a Blog Calendar',
    url: '/blog/seo-as-an-engineering-system-not-a-blog-calendar',
    campaign: 'seo_engineering_system',
    audience: 'growth-lead',
    primaryCta: '/tools/seo-audit',
    proofRoute: '/blog/turning-customer-receipts-into-seo-assets',
  },
  {
    slug: 'build-a-product-surface-and-system-map',
    title: 'Build a Product Surface and System Map',
    url: '/blog/build-a-product-surface-and-system-map',
    campaign: 'surface_system_academy',
    audience: 'builder',
    primaryCta: '/academy',
    proofRoute: '/work/nexural',
  },
];

export function buildUtmUrl(asset: LaunchAsset, source: string, medium: string) {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: asset.campaign,
  });
  return `${asset.url}?${params.toString()}`;
}
