'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Surface, MonoLabel } from '@/components/el'
import { type LabProduct } from '@/data/lab/products'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'

const statusStyles: Record<string, string> = {
  Production: 'text-[#A8C633] bg-[#A8C633]/10 border-[#A8C633]/30',
  Beta: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
  Alpha: 'text-[var(--sage-ink-muted)] bg-[var(--sage-surface-3)] border-[var(--sage-border-strong)]',
  'Pre-launch': 'text-[#3D5AFE] bg-[#3D5AFE]/10 border-[#3D5AFE]/30',
}

const statusDot: Record<string, string> = {
  Production: 'bg-[#A8C633]',
  Beta: 'bg-[#F59E0B]',
  Alpha: 'bg-[var(--sage-ink-faint)]',
  'Pre-launch': 'bg-[#3D5AFE]',
}

interface LabGridProps {
  products: LabProduct[]
}

export function LabGrid({ products }: LabGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, i) => (
        <motion.div
          key={product.slug}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.06, ease: EASE_OUT_QUINT }}
        >
          <Surface level={2} interactive ticks className="h-full flex flex-col p-6">
            {/* Status + category */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[10px] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.18em] border ${
                  statusStyles[product.status] ?? statusStyles['Pre-launch']
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusDot[product.status] ?? statusDot['Pre-launch']}`}
                  aria-hidden
                />
                {product.status}
              </span>
              <MonoLabel tone="faint">{product.category}</MonoLabel>
            </div>

            {/* Name + tagline */}
            <h3 className="text-[var(--sage-ink)] text-base">{product.name}</h3>
            <p className="mt-2 text-sm text-[var(--sage-ink-muted)] leading-relaxed">{product.tagline}</p>

            {/* Description */}
            <p className="mt-3 text-xs text-[var(--sage-ink-faint)] leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Metrics row */}
            {product.metrics && product.metrics.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--sage-border)]">
                {product.metrics.slice(0, 3).map((m) => (
                  <div key={m.label} className="min-w-0">
                    <div className="text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace] text-sm tabular-nums truncate">
                      {m.value}
                    </div>
                    <MonoLabel tone="faint" className="truncate block">{m.label}</MonoLabel>
                  </div>
                ))}
              </div>
            )}

            {/* Stack chips */}
            <div className="flex flex-wrap gap-1.5 mt-4 mb-5 flex-1 content-start">
              {product.stack.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-[3px] text-[10px] [font-family:var(--font-mono),ui-monospace,monospace] bg-[var(--sage-surface-3)] border border-[var(--sage-border)] text-[var(--sage-ink-muted)]"
                >
                  {s}
                </span>
              ))}
              {product.stack.length > 5 && (
                <span className="px-2 py-0.5 rounded-[3px] text-[10px] [font-family:var(--font-mono),ui-monospace,monospace] text-[var(--sage-ink-faint)]">
                  +{product.stack.length - 5}
                </span>
              )}
            </div>

            {/* CTA */}
            <Link
              href={`/lab/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace] hover:gap-2.5 transition-all duration-200 mt-auto"
            >
              View tearsheet <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </Surface>
        </motion.div>
      ))}
    </div>
  )
}
