'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { blogPosts } from '@/lib/blogData'

export function BlogContent() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>Blog</SectionLabel>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA]">
            Engineering & Architecture
          </h1>
          <p className="mt-6 text-lg text-[#A1A1AA] max-w-2xl">
            Technical writing on systems architecture, automation, cloud infrastructure, and software engineering.
          </p>
        </motion.div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={`/blog/${post.id}`}
                className="group block h-full bg-[#18181B] border border-[#27272A] rounded-2xl hover:border-[#06B6D4]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden"
              >
                {post.coverImage && (
                  <div className="relative w-full h-40 bg-[#09090B]">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}
                <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#71717A]">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-[#FAFAFA] mb-3 group-hover:text-[#06B6D4] transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-[#A1A1AA] mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-xs font-mono text-[#71717A] bg-[#27272A] px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
                  <span className="text-xs text-[#71717A]">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="inline-flex items-center text-sm font-medium text-[#06B6D4] group-hover:text-[#22D3EE] transition-colors">
                    Read Article
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
