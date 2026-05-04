'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Calendar, Tag, Share2, Linkedin, Twitter, LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'
import { blogPosts } from '@/lib/blogData'
import { marked } from 'marked'

export default function BlogPostPage() {
  const params = useParams()
  const postSlug = params.slug as string

  // Find by slug first, fall back to ID for backwards compatibility
  const post = blogPosts.find(p => p.slug === postSlug) ||
    blogPosts.find(p => String(p.id) === postSlug)

  if (!post) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#FAFAFA] mb-4">Post Not Found</h1>
          <p className="text-[#A1A1AA] mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE]">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    )
  }

  const htmlContent = marked.parse(post.fullContent || post.content) as string
  const postUrl = `https://www.sageideas.dev/blog/${post.slug}`

  // Find related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3)

  // JSON-LD BlogPosting schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: 'Jason Teixeira',
      url: 'https://www.sageideas.dev/about',
    },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      '@type': 'Organization',
      name: 'Sage Ideas LLC',
      url: 'https://www.sageideas.dev',
    },
    mainEntityOfPage: postUrl,
    keywords: post.tags.join(', '),
    articleSection: post.category,
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* OG Meta (client-side won't be crawled, but good for sharing tools) */}
      <title>{post.title} | Jason Teixeira</title>

      <div className="min-h-screen pt-24 pb-20">
        {/* Breadcrumb */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#71717A]">
            <Link href="/" className="hover:text-[#06B6D4] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#06B6D4] transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-[#A1A1AA] truncate max-w-xs">{post.title}</span>
          </nav>
        </section>

        {/* Header */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel>{post.category}</SectionLabel>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAFAFA] leading-tight">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#71717A]">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs font-mono text-[#A1A1AA] bg-[#18181B] border border-[#27272A] px-2.5 py-1 rounded-lg">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Social Share */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs text-[#71717A]">Share:</span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-[#71717A] hover:text-[#06B6D4] hover:border-[#06B6D4]/50 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-[#71717A] hover:text-[#06B6D4] hover:border-[#06B6D4]/50 transition-colors"
                aria-label="Share on X"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(postUrl) }}
                className="p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-[#71717A] hover:text-[#06B6D4] hover:border-[#06B6D4]/50 transition-colors"
                aria-label="Copy link"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none
              prose-headings:text-[#FAFAFA] prose-headings:font-bold
              prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-6
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-[#06B6D4]
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-[#A1A1AA] prose-p:leading-relaxed prose-p:mb-4
              prose-li:text-[#A1A1AA] prose-li:leading-relaxed
              prose-strong:text-[#FAFAFA]
              prose-code:text-[#06B6D4] prose-code:bg-[#18181B] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-[#18181B] prose-pre:border prose-pre:border-[#27272A] prose-pre:rounded-xl prose-pre:p-6
              prose-a:text-[#06B6D4] prose-a:no-underline hover:prose-a:text-[#22D3EE]
              prose-ul:my-4 prose-ol:my-4
              prose-blockquote:border-l-[#06B6D4] prose-blockquote:text-[#A1A1AA]
              prose-hr:border-[#27272A]
              prose-table:text-sm
              prose-th:text-[#FAFAFA] prose-th:bg-[#18181B] prose-th:p-3
              prose-td:text-[#A1A1AA] prose-td:p-3 prose-td:border-[#27272A]"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <h3 className="text-xl font-bold text-[#FAFAFA] mb-6">More in {post.category}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-[#06B6D4]/50 transition-all"
                >
                  <span className="text-xs font-mono text-[#06B6D4]">{related.category}</span>
                  <h4 className="text-sm font-semibold text-[#FAFAFA] mt-2 line-clamp-2">{related.title}</h4>
                  <span className="text-xs text-[#71717A] mt-2 block">{related.readTime}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 bg-[#18181B] border border-[#27272A] rounded-2xl text-center"
          >
            <h3 className="text-2xl font-bold text-[#FAFAFA] mb-3">Want to see this in action?</h3>
            <p className="text-[#A1A1AA] mb-6">Check out the projects and case studies behind these articles.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold">
                <Link href="/projects">View Projects</Link>
              </Button>
              <Button asChild variant="outline" className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent">
                <Link href="/case-studies">Read Case Studies</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  )
}
