'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { proofPoints, type ProofPoint } from '@/data/social-proof/testimonials'
import { slideUp, stagger } from '@/lib/motion/presets'

// ── types ─────────────────────────────────────────────────────────────────────

export type ProofGridProps = {
  /** Optional eyebrow label above the heading (monospace, uppercased). */
  eyebrow?: string
  /** Optional heading. Omit to render the grid without a header. */
  heading?: string
  /**
   * Which proof points to show.
   * Defaults to the full `proofPoints` array.
   */
  points?: ProofPoint[]
  /** Extra class names applied to the outer <div> wrapper. */
  className?: string
}

// ── kind meta ─────────────────────────────────────────────────────────────────

const KIND_META: Record<ProofPoint['kind'], { dot: string; label: string; accent: string }> = {
  shipped:   { dot: 'var(--sage-lime)',  label: 'shipped',   accent: 'var(--sage-lime)' },
  reference: { dot: 'var(--sage-brand)', label: 'reference', accent: 'var(--sage-brand)' },
  principle: { dot: 'var(--sage-coral)', label: 'principle', accent: 'var(--sage-coral)' },
}

// ── component ─────────────────────────────────────────────────────────────────

/**
 * ProofGrid — verifiable proof points (shipped work, callable references,
 * first principles). No composite or fabricated quotes.
 *
 * Extracted from the homepage "The receipts" section so the same honest
 * evidence block can appear on /pricing, /services, and tier pages.
 */
export function ProofGrid({
  eyebrow = 'Verifiable record',
  heading,
  points = proofPoints,
  className = '',
}: ProofGridProps) {
  return (
    <div className={className}>
      {(eyebrow || heading) && (
        <div className="mb-10">
          {eyebrow && (
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#3D5AFE]">
              {eyebrow}
            </p>
          )}
          {heading && (
            <h2
              className="mt-1 text-xl sm:text-2xl font-normal text-[#F4F2EF]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {heading}
            </h2>
          )}
        </div>
      )}

      <motion.ul
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0"
      >
        {points.map((point) => {
          const kindMeta = KIND_META[point.kind]

          const inner = (
            <motion.div
              variants={slideUp}
              className="group relative flex flex-col gap-3 rounded-xl border border-[#2A2826] bg-[#12110F] p-6 transition-colors duration-200 hover:border-[#3D3A37] hover:bg-[#1A1917] focus-within:border-[#3D3A37]"
            >
              {/* kind badge */}
              <span className="inline-flex items-center gap-1.5 self-start">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ background: kindMeta.dot }}
                />
                <span
                  className="text-[9px] font-mono uppercase tracking-[0.2em]"
                  style={{ color: kindMeta.accent }}
                >
                  {kindMeta.label}
                </span>
              </span>

              {/* label */}
              <p
                className="text-base font-normal text-[#F4F2EF] leading-snug group-hover:text-white transition-colors duration-150"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {point.label}
              </p>

              {/* detail */}
              <p className="text-xs font-mono text-[#78716C] leading-relaxed">
                {point.detail}
              </p>

              {/* hover arrow */}
              {point.href && (
                <span
                  aria-hidden
                  className="absolute right-5 bottom-5 text-[#3D3A37] text-xs font-mono transition-all duration-150 group-hover:text-[#3D5AFE] group-hover:translate-x-0.5"
                >
                  →
                </span>
              )}
            </motion.div>
          )

          return (
            <li key={point.label}>
              {point.href ? (
                <Link href={point.href} className="block rounded-xl focus-visible:ring-2 focus-visible:ring-[#3D5AFE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]">
                  {inner}
                </Link>
              ) : inner}
            </li>
          )
        })}
      </motion.ul>
    </div>
  )
}
