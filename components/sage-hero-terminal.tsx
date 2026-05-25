'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BootSequence, type BootStep, NeonButton, Sigil, AsciiRule } from '@/components/sage'

interface Project {
  name: string
  url: string
  screenshot: string
  accent: string
}

interface SageHeroTerminalProps {
  logoMark?: React.ReactNode
  projects?: Project[]
}

const DEFAULT_PROJECTS: Project[] = [
  { name: 'Nexural', url: 'nexural.dev', screenshot: '/work/screens/nexural-1.png', accent: '#0ED3CF' },
  { name: 'AlphaStream', url: 'alphastream.io', screenshot: '/work/screens/alphastream-1.png', accent: '#E85D3A' },
  { name: 'Jobpoise', url: 'jobpoise.app', screenshot: '/work/screens/jobpoise-1.png', accent: '#A8C633' },
  { name: 'Quality Telemetry', url: 'telemetry.sageideas.dev', screenshot: '/work/screens/quality-telemetry-1.png', accent: '#C7236E' },
]

/**
 * SageHeroTerminal — Phase 4 hero replacement.
 *
 * Replaces the browser-frame screenshot hero with a terminal boot sequence
 * that streams the studio's identity, capability set, and recent work as
 * filesystem entries. Designed for ~95vh, single H1, single primary CTA.
 *
 * Accessibility:
 * - The H1 carries the marketing headline as the accessible name.
 * - The animated terminal block uses aria-hidden so screen readers don't
 *   try to read every typed character; an aria-live="polite" summary is
 *   provided after the animation completes (handled by the static
 *   structured content below).
 */
export default function SageHeroTerminal({
  logoMark,
  projects = DEFAULT_PROJECTS,
}: SageHeroTerminalProps) {
  const [bootDone, setBootDone] = React.useState(false)

  const steps: BootStep[] = React.useMemo(
    () => [
      { kind: 'comment', text: 'sage-os v3 · build 2026.5 · provenance-verified', holdMs: 120 },
      { kind: 'prompt', text: 'whoami', holdMs: 220 },
      {
        kind: 'output',
        text: (
          <>
            <span style={{ color: '#F4F2EF' }}>jason teixeira</span>
            <span style={{ color: '#5B5751' }}> · </span>
            <span style={{ color: '#A8C633' }}>founding engineer</span>
            <span style={{ color: '#5B5751' }}> · </span>
            <span style={{ color: '#0ED3CF' }}>sage ideas studio</span>
          </>
        ),
        holdMs: 240,
      },
      { kind: 'prompt', text: 'cat capabilities.json | jq .', holdMs: 260 },
      {
        kind: 'output',
        text: (
          <>
            <span style={{ color: '#5B5751' }}>{'{ '}</span>
            <span style={{ color: '#0ED3CF' }}>{'"ai"'}</span>
            <span style={{ color: '#5B5751' }}>{': '}</span>
            <span style={{ color: '#A8C633' }}>{'"agents · voice · automation"'}</span>
            <span style={{ color: '#5B5751' }}>{', '}</span>
            <span style={{ color: '#0ED3CF' }}>{'"web"'}</span>
            <span style={{ color: '#5B5751' }}>{': '}</span>
            <span style={{ color: '#A8C633' }}>{'"shipped fast · cared for"'}</span>
            <span style={{ color: '#5B5751' }}>{' }'}</span>
          </>
        ),
        holdMs: 260,
      },
      { kind: 'prompt', text: 'ls -la work/ | head -4', holdMs: 220 },
      ...projects.flatMap<BootStep>((p) => [
        {
          kind: 'output' as const,
          text: (
            <span style={{ display: 'inline-block' }}>
              <span style={{ color: '#5B5751' }}>-rwxr-xr-x </span>
              <span style={{ color: p.accent }}>sage </span>
              <span style={{ color: '#5B5751' }}>shipped </span>
              <span style={{ color: '#F4F2EF' }}>{p.name}</span>
              <span style={{ color: '#5B5751' }}> → </span>
              <span style={{ color: p.accent }}>{p.url}</span>
            </span>
          ),
          speedMs: 8,
          holdMs: 80,
        },
      ]),
      { kind: 'prompt', text: 'sage --status', holdMs: 240 },
      {
        kind: 'ok',
        text: (
          <>
            studio online · accepting Q3 engagements · response &lt; 24h
          </>
        ),
        holdMs: 300,
      },
      { kind: 'prompt', text: './book', holdMs: 400 },
    ],
    [projects],
  )

  return (
    <section
      aria-label="Sage Ideas Studio — introduction"
      className="relative min-h-[92vh] w-full overflow-hidden bg-[#09090B] pt-24 pb-12 sm:pt-28 lg:pt-32"
    >
      {/* Background atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="sage-grid-noise absolute inset-0 opacity-50" />
        <div
          className="absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full opacity-25 blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(14,211,207,0.6) 0%, transparent 60%)' }}
        />
        <div
          className="absolute -bottom-40 left-[-10%] h-[460px] w-[460px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(232,93,58,0.55) 0%, transparent 60%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-8">
        {/* Left — headline + meta */}
        <div className="flex flex-col justify-center">
          {/* SR-only H1: single, real headline */}
          <h1 className="sr-only">
            Sage Ideas — a studio that ships production AI and web systems with the receipts to prove it
          </h1>

          {/* Brand + sigil row */}
          <div className="mb-8 flex items-center gap-3">
            {logoMark}
            <span className="text-[15px] font-semibold tracking-[0.08em] text-[#F4F2EF]">SAGE IDEAS</span>
            <span className="mx-1 h-3 w-px bg-[#2A2826]" aria-hidden />
            <Sigil status="online" label="ACCEPTING" />
          </div>

          <AsciiRule label="// identity 01" className="mb-6" />

          {/* Visual headline — display serif */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
            className="mb-3 text-[44px] leading-[0.95] tracking-[-0.02em] text-[#F4F2EF] sm:text-[58px] lg:text-[72px]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span>Ships </span>
            <span className="italic text-[#0ED3CF] sage-text-bloom-cyan">production</span>
            <span> systems.</span>
            <br />
            <span>Carries the </span>
            <span className="italic text-[#E85D3A]">receipts</span>
            <span>.</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 max-w-[52ch] text-base leading-relaxed text-[#B8B0AB] sm:text-lg"
          >
            A two-person studio that builds AI agents, voice systems, and web platforms for
            founders who measure outcomes — not promises. Twenty productized engagements,
            transparent pricing, callable references.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3"
          >
            <NeonButton href="/book" tone="cyan" size="lg" bloom>
              ./book
            </NeonButton>
            <Link
              href="/work"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#2A2826] text-[#A8A29E] hover:text-[#F4F2EF] hover:border-[#3D3A37] transition-colors text-sm [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide"
            >
              <span>ls work/</span>
              <span aria-hidden>→</span>
            </Link>
          </motion.div>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-[#78716C] [font-family:var(--font-mono),ui-monospace,monospace]">
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-1 w-1 rounded-full bg-[#A8C633]" />
              20+ engagements shipped
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-1 w-1 rounded-full bg-[#0ED3CF]" />
              &lt; 24h response
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="h-1 w-1 rounded-full bg-[#E85D3A]" />
              callable references
            </span>
          </div>
        </div>

        {/* Right — boot terminal */}
        <div className="flex items-center">
          <div className="w-full">
            <BootSequence
              steps={steps}
              speedMs={14}
              startDelayMs={400}
              chromeLabel="~/sage — sageshell — boot"
              scanlines
              onComplete={() => setBootDone(true)}
              className="w-full sage-bloom-cyan"
            />
            {/* SR-only summary, announced when boot is done */}
            <span aria-live="polite" className="sr-only">
              {bootDone
                ? `Sage Ideas studio is online. Capabilities include AI agents, voice systems, and production web platforms. Recent work: ${projects.map((p) => p.name).join(', ')}. Accepting engagements.`
                : ''}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
