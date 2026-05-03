'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ExternalLink, FlaskConical, Wrench } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { type CaseStudy } from '@/data/work/case-studies'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

interface Props {
  study: CaseStudy
}

const categoryColors: Record<string, string> = {
  Fintech: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'AI/ML': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Infrastructure: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Product: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  DevTools: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
}

export function CaseStudyContent({ study }: Props) {
  const catColor = categoryColors[study.category] ?? 'text-[#A1A1AA] bg-[#27272A] border-[#27272A]'

  return (
    <div className="min-h-screen bg-[#09090B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Back link */}
        <div className="mb-10">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-[#71717A] text-sm hover:text-[#A1A1AA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All case studies
          </Link>
        </div>

        {/* Hero */}
        <motion.section {...fadeIn} transition={{ duration: 0.6 }} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest border ${catColor}`}>
              {study.category}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA] tracking-tight leading-tight max-w-4xl">
            {study.title}
          </h1>
          <p className="mt-4 text-xl text-[#A1A1AA] max-w-3xl">{study.tagline}</p>

          {/* Kicker metrics row */}
          <div className="mt-8 flex flex-wrap gap-4">
            {study.metrics.slice(0, 4).map((m) => (
              <div
                key={m.label}
                className="px-5 py-3 rounded-xl bg-[#0F0F12] border border-[#27272A] text-center"
              >
                <div className="text-2xl font-bold text-[#06B6D4]">{m.value}</div>
                <div className="text-xs text-[#71717A] mt-0.5 font-mono uppercase tracking-wide">{m.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Two-column layout */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-16 items-start">
          {/* Sticky sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 space-y-6 mb-12 lg:mb-0">
            {/* Client */}
            <GlowCard className="p-5">
              <div className="text-[#71717A] text-xs font-mono uppercase tracking-widest mb-2">Client</div>
              <div className="text-[#FAFAFA] text-sm font-medium">{study.client}</div>
            </GlowCard>

            {/* Tags */}
            <GlowCard className="p-5">
              <div className="text-[#71717A] text-xs font-mono uppercase tracking-widest mb-3">Stack</div>
              <div className="flex flex-wrap gap-1.5">
                {study.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#27272A] text-[#A1A1AA]">
                    {tag}
                  </span>
                ))}
              </div>
            </GlowCard>

            {/* All metrics */}
            <GlowCard className="p-5">
              <div className="text-[#71717A] text-xs font-mono uppercase tracking-widest mb-3">Key metrics</div>
              <div className="space-y-2.5">
                {study.metrics.map((m) => (
                  <div key={m.label} className="flex justify-between items-center gap-2">
                    <span className="text-[#71717A] text-xs">{m.label}</span>
                    <span className="text-[#06B6D4] text-sm font-mono font-semibold">{m.value}</span>
                  </div>
                ))}
              </div>
            </GlowCard>

            {/* Related lab */}
            {study.relatedLab && (
              <GlowCard className="p-5">
                <div className="text-[#71717A] text-xs font-mono uppercase tracking-widest mb-2">Lab entry</div>
                <Link
                  href={`/lab/${study.relatedLab}`}
                  className="inline-flex items-center gap-1.5 text-[#06B6D4] text-sm hover:gap-2.5 transition-all duration-200"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  View tearsheet
                </Link>
              </GlowCard>
            )}
          </aside>

          {/* Main content */}
          <main className="space-y-14">
            {/* Problem */}
            <motion.section {...fadeIn} transition={{ duration: 0.5, delay: 0.1 }}>
              <SectionLabel>Problem</SectionLabel>
              <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA]">The challenge</h2>
              <div className="mt-4 space-y-4">
                {study.problem.map((p, i) => (
                  <p key={i} className="text-[#A1A1AA] leading-relaxed">{p}</p>
                ))}
              </div>
            </motion.section>

            {/* Approach */}
            <motion.section {...fadeIn} transition={{ duration: 0.5, delay: 0.15 }}>
              <SectionLabel>Approach</SectionLabel>
              <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA]">How we built it</h2>
              <div className="mt-4 space-y-4">
                {study.approach.map((p, i) => (
                  <p key={i} className="text-[#A1A1AA] leading-relaxed">{p}</p>
                ))}
              </div>
            </motion.section>

            {/* Build */}
            <motion.section {...fadeIn} transition={{ duration: 0.5, delay: 0.2 }}>
              <SectionLabel>Build</SectionLabel>
              <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA]">What shipped</h2>
              <div className="mt-4 space-y-4">
                {study.build.map((p, i) => (
                  <p key={i} className="text-[#A1A1AA] leading-relaxed">{p}</p>
                ))}
              </div>
            </motion.section>

            {/* Outcome */}
            <motion.section {...fadeIn} transition={{ duration: 0.5, delay: 0.25 }}>
              <SectionLabel>Outcome</SectionLabel>
              <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA]">Results</h2>
              <div className="mt-4 space-y-4">
                {study.outcome.map((p, i) => (
                  <p key={i} className="text-[#A1A1AA] leading-relaxed">{p}</p>
                ))}
              </div>
            </motion.section>

            {/* Artifacts */}
            {study.artifacts && study.artifacts.length > 0 && (
              <motion.section {...fadeIn} transition={{ duration: 0.5, delay: 0.3 }}>
                <SectionLabel>Artifacts</SectionLabel>
                <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA]">Available</h2>
                <ul className="mt-4 space-y-2">
                  {study.artifacts.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#A1A1AA] text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#06B6D4] shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}
          </main>
        </div>

        {/* Dual CTA strip */}
        <motion.section
          {...fadeIn}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-24 pt-12 border-t border-[#27272A]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/services/build"
              className="group flex items-center justify-between p-6 rounded-2xl bg-[#0F0F12] border border-[#27272A] hover:border-[#06B6D4]/50 transition-all duration-200"
            >
              <div>
                <div className="text-[#71717A] text-xs font-mono uppercase tracking-widest mb-1">Start a project</div>
                <div className="text-[#FAFAFA] font-semibold">Build something like this</div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#06B6D4] group-hover:translate-x-1 transition-transform" />
            </Link>

            {study.relatedLab ? (
              <Link
                href={`/lab/${study.relatedLab}`}
                className="group flex items-center justify-between p-6 rounded-2xl bg-[#0F0F12] border border-[#27272A] hover:border-[#06B6D4]/50 transition-all duration-200"
              >
                <div>
                  <div className="text-[#71717A] text-xs font-mono uppercase tracking-widest mb-1">Lab tearsheet</div>
                  <div className="text-[#FAFAFA] font-semibold">Explore the Lab entry</div>
                </div>
                <FlaskConical className="w-5 h-5 text-[#06B6D4] group-hover:scale-110 transition-transform" />
              </Link>
            ) : study.ctaPrimary ? (
              <a
                href={study.ctaPrimary.href}
                target={study.ctaPrimary.href.startsWith('http') ? '_blank' : undefined}
                rel={study.ctaPrimary.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-center justify-between p-6 rounded-2xl bg-[#0F0F12] border border-[#27272A] hover:border-[#06B6D4]/50 transition-all duration-200"
              >
                <div>
                  <div className="text-[#71717A] text-xs font-mono uppercase tracking-widest mb-1">External</div>
                  <div className="text-[#FAFAFA] font-semibold">{study.ctaPrimary.label}</div>
                </div>
                <ExternalLink className="w-5 h-5 text-[#06B6D4]" />
              </a>
            ) : null}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
