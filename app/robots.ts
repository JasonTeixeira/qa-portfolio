import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/portal/',
          '/login',
          '/signup',
          '/checkout/',
          '/onboarding',
          '/pending-approval',
        ],
      },
    ],
    sitemap: 'https://www.sageideas.dev/sitemap.xml',
    host: 'https://www.sageideas.dev',
  }
}
