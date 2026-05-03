'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { GlowCard } from '@/components/glow-card'
import { type CaseStudy } from '@/data/work/case-studies'

const CATEGORIES = ['All', 'Fintech', 'AI/ML', 'Infrastructure', 'Product', 'DevTools'] as const
type FilterCategory = (typeof CATEGORIES)[number]

const gradients: Record<string, string> = {
  Fintech: 'from-cyan-500/20 via-blue-500/10 to-transparent',
  'AI/ML': 'from-violet-500/20 via-purple-500/10 to-transparent',
  Infrastructure: 'from-amber-500/20 via-orange-500/10 to-transparent',
  Product: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  DevTools: 'from-rose-500/20 via-pink-500/10 to-transparent',
}

interface WorkGridProps {
  studies: CaseStudy[]
}

export function WorkGrid({ studies }: WorkGridProps) {
  const [active, setActive] = useState<FilterCategory>('All')

  const filtered = active === 'All' ? studies : studies.filter((s) => s.category === active)

  return (
    <div>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-all duration-200 ${
              active === cat
                ? 'bg-[#06B6D4] border-[#06B6D4] text-[#09090B]'
                : 'border-[#27272A] text-[#71717A] hover:border-[#06B6D4]/50 hover:text-[#A1A1AA]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Case study cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((study, i) => (
          <motion.div
            key={study.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <GlowCard className="h-full flex flex-col">
              {/* Thumbnail */}
              <div className={`h-40 bg-gradient-to-br ${gradients[study.category] ?? 'from-zinc-800/40 to-transparent'} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-end p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#09090B]/70 text-[#06B6D4] border border-[#06B6D4]/30">
                    {study.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6 gap-3">
                <h3 className="text-[#FAFAFA] font-semibold text-lg leading-snug">{study.title}</h3>
                <p className="text-[#71717A] text-sm leading-relaxed">{study.kicker}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto mb-3">
                  {study.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#27272A] text-[#A1A1AA]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/work/${study.slug}`}
                  className="inline-flex items-center gap-1.5 text-[#06B6D4] text-sm font-medium hover:gap-2.5 transition-all duration-200"
                >
                  Read case study <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
