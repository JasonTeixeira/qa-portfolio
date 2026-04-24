'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { caseStudies } from '@/data/case-studies'

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>Case Studies</SectionLabel>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA]">
            How I Build
          </h1>
          <p className="mt-6 text-lg text-[#A1A1AA] max-w-2xl">
            Deep dives into architecture decisions, technical challenges, and measurable results. Each case study covers the full journey from problem to production.
          </p>
        </motion.div>
      </section>

      {/* Case Study Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <motion.article
              key={study.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/case-studies/${study.slug}`}>
                <div className={`p-6 lg:p-8 bg-[#18181B] border border-[#27272A] rounded-2xl hover:border-[#06B6D4]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  <div className="grid lg:grid-cols-5 gap-8 items-center">
                    {/* Image Side */}
                    <div className={`lg:col-span-2 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                      <div className="aspect-video bg-[#27272A] rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/10 to-[#8B5CF6]/10" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-bold text-[#71717A]">{study.number}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className={`lg:col-span-3 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                      <span className="text-xs font-mono text-[#06B6D4] uppercase tracking-wider">
                        Case Study {study.number}
                      </span>
                      <h2 className="mt-2 text-2xl lg:text-3xl font-bold text-[#FAFAFA] group-hover:text-[#06B6D4] transition-colors">
                        {study.title}
                      </h2>
                      <p className="mt-2 text-[#A1A1AA]">{study.subtitle}</p>
                      <p className="mt-4 text-sm text-[#71717A] line-clamp-2">{study.summary}</p>

                      {/* Metrics */}
                      <div className="mt-6 grid grid-cols-4 gap-4">
                        {study.metrics.map((metric) => (
                          <div key={metric.label} className="text-center p-3 bg-[#27272A] rounded-lg">
                            <div className="text-lg font-bold text-[#FAFAFA]">{metric.value}</div>
                            <div className="text-xs text-[#71717A]">{metric.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {study.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-mono text-[#71717A] bg-[#27272A] px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="mt-6">
                        <span className="inline-flex items-center text-sm font-medium text-[#06B6D4] group-hover:text-[#22D3EE] transition-colors">
                          Read Case Study
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
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
