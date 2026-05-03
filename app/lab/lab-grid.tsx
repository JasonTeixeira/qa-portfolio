'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { GlowCard } from '@/components/glow-card'
import { type LabProduct } from '@/data/lab/products'

const statusStyles: Record<string, string> = {
  Production: 'text-green-400 bg-green-500/20 border-green-500/30',
  Beta: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  Alpha: 'text-violet-400 bg-violet-500/20 border-violet-500/30',
  'Pre-launch': 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
}

const statusDot: Record<string, string> = {
  Production: 'bg-green-400',
  Beta: 'bg-amber-400',
  Alpha: 'bg-violet-400',
  'Pre-launch': 'bg-cyan-400',
}

interface LabGridProps {
  products: LabProduct[]
}

export function LabGrid({ products }: LabGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, i) => (
        <motion.div
          key={product.slug}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
        >
          <GlowCard className="h-full flex flex-col p-6">
            {/* Status + category */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border ${
                  statusStyles[product.status] ?? statusStyles['Pre-launch']
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusDot[product.status] ?? statusDot['Pre-launch']}`}
                />
                {product.status}
              </span>
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wide">
                {product.category}
              </span>
            </div>

            {/* Name + tagline */}
            <h3 className="text-[#FAFAFA] font-bold text-xl">{product.name}</h3>
            <p className="mt-2 text-[#71717A] text-sm leading-relaxed flex-1">{product.tagline}</p>

            {/* Stack chips */}
            <div className="flex flex-wrap gap-1.5 mt-4 mb-5">
              {product.stack.slice(0, 4).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#27272A] text-[#A1A1AA]">
                  {s}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              href={`/lab/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-[#06B6D4] text-sm font-medium hover:gap-2.5 transition-all duration-200"
            >
              View tearsheet <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </GlowCard>
        </motion.div>
      ))}
    </div>
  )
}
