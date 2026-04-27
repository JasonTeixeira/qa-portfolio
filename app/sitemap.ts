import { MetadataRoute } from 'next'
import { caseStudies } from '@/data/case-studies'
import { blogPosts } from '@/lib/blogData'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sageideas.dev'

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/services',
    '/projects',
    '/case-studies',
    '/blog',
    '/contact',
    '/resume',
    '/platform',
    '/dashboard',
    '/artifacts',
    '/stack',
    '/start',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
    priority: route === '' ? 1 : route === '/services' || route === '/projects' || route === '/platform' ? 0.9 : 0.8,
  }))

  // Dynamic case study pages
  const caseStudyPages = caseStudies.map((study) => ({
    url: `${baseUrl}/case-studies/${study.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Dynamic blog post pages
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...caseStudyPages, ...blogPages]
}
