import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

// Update this once your custom domain is live.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sageideas.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = [
    '',
    '/about',
    '/platform',
    '/dashboard',
    '/projects',
    '/artifacts',
    '/blog',
    '/contact',
  ];

  // Note: project/blog detail pages are static and could be enumerated here,
  // but keeping this concise is fine for a portfolio.
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));
}
