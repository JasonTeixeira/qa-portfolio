'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, FileText, Github, CheckCircle2, Building2, GraduationCap, Award, Info } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { Button } from '@/components/ui/button'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

interface Props {
  capabilities: string[]
  roleParams: string[]
}

const experience = [
  {
    role: 'Founder & Principal Engineer',
    company: 'Sage Ideas LLC',
    period: '2024–Present',
    summary:
      'Founded and operate the studio. Six products in production across fintech, trades tech, edtech, and developer tooling. 106 public repositories, 1,438 commits in the last 12 months. Full-stack from UI to infrastructure.',
  },
  {
    role: 'Fintech Engineer',
    company: 'HighStrike',
    period: '2021–2026',
    summary:
      'Built and maintained production-grade trading infrastructure: market data ingestion, real-time pricing systems, portfolio management APIs, and billing integrations. Five years across the full stack on systems that handled production load during volatile trading sessions.',
  },
]

const education = [
  { degree: 'B.S. Computer Science', school: 'Full Sail University' },
  { degree: 'B.S. Finance', school: 'Kean University' },
]

const certGroups = [
  {
    provider: 'ISTQB',
    certs: ['Certified Tester Foundation Level (CTFL)', 'Test Automation Engineer (TAE)', 'Certified Tester AI Testing (CT-AI)'],
  },
  {
    provider: 'Amazon Web Services',
    certs: [
      'Cloud Practitioner',
      'Solutions Architect — Associate',
      'Developer — Associate',
      'SysOps Administrator — Associate',
      'DevOps Engineer — Professional',
    ],
  },
  {
    provider: 'Cisco',
    certs: ['CCNA (Routing & Switching)'],
  },
]

export function FounderAnimations({ capabilities, roleParams }: Props) {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp} className="max-w-3xl">
          <SectionLabel>For Hiring Managers</SectionLabel>
          <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-bold text-[#FAFAFA] leading-tight">
            For hiring managers.
          </h1>
          <p className="mt-6 text-xl text-[#A1A1AA] leading-relaxed font-medium">
            Fintech engineer. Studio founder. Open to select opportunities.
          </p>
          <p className="mt-6 text-lg text-[#A1A1AA] leading-relaxed">
            This page exists for hiring managers. If you found Sage Ideas through the studio&apos;s work and want to
            understand who&apos;s behind it — this is the straightforward version.
          </p>
        </motion.div>
      </section>

      {/* Two-track frame */}
      <section className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div {...fadeInUp}>
            <SectionLabel>Two Tracks</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-8">
              The studio is the primary thing. I&apos;m also open to the right role.
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GlowCard className="h-full border-l-2 border-l-[#06B6D4]">
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-[#06B6D4]" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#06B6D4]">Studio</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#FAFAFA] mb-3">Sage Ideas LLC</h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">
                    The studio is the primary engagement — building AI-native products, infrastructure, and automations
                    for founders and growth-stage companies. This isn&apos;t a placeholder while searching for a job; it&apos;s
                    a functioning business with live products and paying clients.
                  </p>
                </div>
              </GlowCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlowCard className="h-full border-l-2 border-l-[#8B5CF6]" glowColor="violet">
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-[#8B5CF6]" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#8B5CF6]">Open Roles</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#FAFAFA] mb-3">Strong-fit staff-level roles</h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">
                    I&apos;m selectively open to staff or principal IC engineering roles where the fit is strong. Strong fit
                    means: AI-forward team, serious engineering culture, equity participation, and a company building
                    something I&apos;d want to use. The studio continues as a side operation — I&apos;m transparent about this
                    in every conversation.
                  </p>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Background */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp}>
          <SectionLabel>Background</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-10">The background.</h2>
        </motion.div>

        {/* Experience */}
        <div className="space-y-6 max-w-3xl mb-12">
          {experience.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlowCard>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-[#FAFAFA]">{exp.role}</p>
                      <p className="text-sm text-[#06B6D4]">{exp.company}</p>
                    </div>
                    <span className="text-xs font-mono text-[#71717A] bg-[#27272A] px-3 py-1 rounded-full whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{exp.summary}</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        {/* Education */}
        <motion.div {...fadeInUp} className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-[#06B6D4]" />
            <h3 className="text-lg font-semibold text-[#FAFAFA]">Education</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {education.map((edu) => (
              <div
                key={edu.degree}
                className="px-4 py-2 bg-[#0F0F12] border border-[#27272A] rounded-xl"
              >
                <p className="text-sm font-medium text-[#FAFAFA]">{edu.degree}</p>
                <p className="text-xs text-[#71717A]">{edu.school}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div {...fadeInUp}>
          <p className="text-sm text-[#71717A]">
            <span className="text-[#A1A1AA] font-medium">Languages:</span>{' '}
            English (native) · Portuguese (fluent) · Spanish (fluent)
          </p>
        </motion.div>
      </section>

      {/* Certifications */}
      <section className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div {...fadeInUp}>
            <SectionLabel>Certifications</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-3">9 active certifications.</h2>
            <p className="text-[#A1A1AA] mb-10 max-w-2xl">
              Not collected for resume decoration — each one reflects a domain where depth matters. All active and maintained.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl">
            {certGroups.map((group, i) => (
              <motion.div
                key={group.provider}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-5 bg-[#09090B] border border-[#27272A] rounded-xl"
              >
                <p className="text-xs font-mono uppercase tracking-widest text-[#06B6D4] mb-4">{group.provider}</p>
                <ul className="space-y-2">
                  {group.certs.map((cert) => (
                    <li key={cert} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                      <CheckCircle2 className="h-4 w-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What I'd bring */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp}>
          <SectionLabel>Capabilities</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-10">What I&apos;d bring.</h2>
        </motion.div>
        <div className="max-w-3xl space-y-3">
          {capabilities.map((cap, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-start gap-3 p-4 bg-[#0F0F12] border border-[#27272A] rounded-xl"
            >
              <CheckCircle2 className="h-5 w-5 text-[#06B6D4] mt-0.5 flex-shrink-0" />
              <span className="text-[#A1A1AA]">{cap}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What I'm looking for */}
      <section className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div {...fadeInUp}>
            <SectionLabel>Role Parameters</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-10">What I&apos;m looking for.</h2>
          </motion.div>
          <div className="max-w-3xl space-y-3 mb-10">
            {roleParams.map((param, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-start gap-3 p-4 bg-[#09090B] border border-[#27272A] rounded-xl"
              >
                <ArrowRight className="h-5 w-5 text-[#06B6D4] mt-0.5 flex-shrink-0" />
                <span className="text-[#A1A1AA]">{param}</span>
              </motion.div>
            ))}
          </div>

          {/* Comp banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-4 p-5 bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded-xl max-w-3xl"
          >
            <Info className="h-5 w-5 text-[#06B6D4] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[#FAFAFA] font-medium">Comp range and target roles available on request</p>
              <p className="text-sm text-[#A1A1AA] mt-1">
                I share specifics directly — not in a public listing. Reach out at{' '}
                <a href="mailto:sage@sageideas.dev" className="text-[#06B6D4] hover:text-[#22D3EE]">
                  sage@sageideas.dev
                </a>{' '}
                and I&apos;ll respond with the full picture.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How to start a conversation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp}>
          <SectionLabel>Next Steps</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-10">How to start a conversation.</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          {[
            {
              step: '01',
              title: 'Send a quick note',
              body: 'Email sage@sageideas.dev with the role details — company, title, and why you think it\'s a match. I respond to well-matched inquiries within 48 hours. No recruiters as first contact.',
              cta: 'Send a message',
              href: 'mailto:sage@sageideas.dev',
              external: false,
            },
            {
              step: '02',
              title: "We'll do a 30-minute intro",
              body: "If there's mutual interest, we'll schedule a 30-minute intro call. No interview prep required — just a direct conversation about the role, the team, and whether the fit is real.",
              cta: 'Book a call',
              href: '/book',
              external: false,
            },
          ].map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlowCard className="h-full">
                <div className="p-8">
                  <span className="text-4xl font-bold text-[#27272A] font-mono">{step.step}</span>
                  <h3 className="mt-3 text-xl font-semibold text-[#FAFAFA] mb-3">{step.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed mb-6">{step.body}</p>
                  <Link
                    href={step.href}
                    className="inline-flex items-center text-[#06B6D4] hover:text-[#22D3EE] text-sm font-medium transition-colors group"
                  >
                    {step.cta}
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-sm text-[#71717A] max-w-xl"
        >
          References available on request. I don&apos;t use recruiters as a first-contact channel.
        </motion.p>
      </section>

      {/* Footer CTA strip */}
      <section className="bg-[#0F0F12] border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <Button
              asChild
              className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold"
            >
              <a href="mailto:sage@sageideas.dev">
                <Mail className="mr-2 h-4 w-4" />
                Email directly
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
            >
              <Link href="/resume">
                <FileText className="mr-2 h-4 w-4" />
                Resume PDF
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
            >
              <a href="https://github.com/JasonTeixeira" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
            <span className="text-[#71717A] text-sm ml-auto hidden sm:block">
              Also:{' '}
              <Link href="/studio" className="text-[#06B6D4] hover:text-[#22D3EE]">
                See the studio →
              </Link>
            </span>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
