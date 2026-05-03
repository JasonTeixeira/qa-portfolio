'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Calendar, UserCheck, ArrowRight, ExternalLink } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { Button } from '@/components/ui/button'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const cards = [
  {
    icon: Mail,
    label: 'Email',
    title: 'Drop a direct message',
    body: 'For project inquiries, questions about the studio, or anything you want to discuss directly. Well-matched inquiries get a response within 48 hours.',
    cta: 'sage@sageideas.dev',
    href: 'mailto:sage@sageideas.dev',
    external: false,
    accent: 'cyan' as const,
  },
  {
    icon: Calendar,
    label: 'Book',
    title: 'Schedule a strategy call',
    body: 'Book a 30-minute strategy call to talk through your project, timeline, and which engagement tier fits best. No pitch, no pressure — just an honest conversation.',
    cta: 'Book a call',
    href: '/book',
    external: false,
    accent: 'cyan' as const,
  },
  {
    icon: UserCheck,
    label: 'Hiring',
    title: 'Hiring managers',
    body: "If you found Sage Ideas through the studio's work and want to understand who's behind it, the founder page has everything you need — background, capabilities, and role parameters.",
    cta: 'Meet the founder',
    href: '/founder',
    external: false,
    accent: 'violet' as const,
  },
]

export function ContactRelaunchContent() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp} className="max-w-2xl">
          <SectionLabel>Contact</SectionLabel>
          <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-bold text-[#FAFAFA] leading-tight">
            Get in touch.
          </h1>
          <p className="mt-6 text-lg text-[#A1A1AA] leading-relaxed">
            Three ways to reach Sage Ideas — pick the one that fits your situation.
          </p>
        </motion.div>
      </section>

      {/* Three-column card grid */}
      <section className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full"
              >
                <GlowCard glowColor={card.accent} className="h-full">
                  <div className="p-8 flex flex-col h-full">
                    <div className="p-3 bg-[#06B6D4]/10 rounded-xl w-fit mb-6">
                      <card.icon className="h-6 w-6 text-[#06B6D4]" />
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-mono uppercase tracking-widest text-[#71717A]">{card.label}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-[#FAFAFA] mb-3">{card.title}</h2>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed flex-1 mb-8">{card.body}</p>
                    <Button
                      asChild
                      className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold w-full"
                    >
                      <Link href={card.href}>
                        {card.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-sm text-[#71717A] leading-relaxed">
            Any information you share with Sage Ideas is handled per our{' '}
            <Link href="/legal/privacy" className="text-[#06B6D4] hover:text-[#22D3EE] underline underline-offset-2">
              Privacy Policy
            </Link>
            . We collect only what we need to respond to your inquiry and never sell personal information to third parties.
            For questions about your data, contact{' '}
            <a href="mailto:sage@sageideas.dev" className="text-[#06B6D4] hover:text-[#22D3EE]">
              sage@sageideas.dev
            </a>
            .
          </p>
        </motion.div>
      </section>
    </div>
  )
}
