'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, MapPin, Layers, Shield, Network, ArrowRight, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'
import { ProfessionalAvatar } from '@/components/professional-avatar'

const timeline = [
  {
    period: '2024 - Present',
    company: 'Sage Ideas LLC',
    role: 'Founder & Systems Architect',
    achievements: [
      'Built Nexural ecosystem: 7 interconnected fintech systems',
      '185 database tables, 69/69 APIs passing, Stripe billing live',
      'Nexural Discord AI Engine: 30+ commands, 12 phases, GPT-4o',
      'AlphaStream: ML signal system, 200+ indicators, 5 models',
      'Wrote 120K+ word trading book (24 chapters, editorial phase)',
      'Active futures trader: 8 symbols on NinjaTrader'
    ]
  },
  {
    period: '2023 - 2024',
    company: 'HighStrike',
    role: 'QA Automation Engineer',
    achievements: [
      'Fintech platform: $10M+ daily volume, 50K+ daily trades',
      'Built test frameworks achieving <1% flaky test rate',
      '95% uptime SLA enforcement',
      'Prevented multiple potential multi-million dollar errors'
    ]
  },
  {
    period: '2019 - 2023',
    company: 'The Home Depot',
    role: 'Cloud Automation Engineer',
    achievements: [
      'Enterprise scale: 2,300+ stores, millions of customers',
      'CI/CD pipelines and infrastructure-as-code (Terraform)',
      'Quality gates and automated deployment systems',
      'Fortune 50 impact'
    ]
  }
]

const certifications = [
  { name: 'ISTQB CTFL', issuer: 'ISTQB', year: '2024' },
  { name: 'ISTQB TAE', issuer: 'ISTQB', year: '2024' },
  { name: 'ISTQB CT-AI', issuer: 'ISTQB', year: '2024' },
  { name: 'AWS Cloud Essentials', issuer: 'AWS', year: '2024' },
  { name: 'AWS Serverless', issuer: 'AWS', year: '2024' },
  { name: 'AWS Migration Foundations', issuer: 'AWS', year: '2024' },
  { name: 'AWS Braket', issuer: 'AWS', year: '2024' },
  { name: 'AWS Cloud Practitioner', issuer: 'AWS', year: '2024' },
  { name: 'Cisco Networking', issuer: 'Cisco', year: '2024' }
]

const differentiators = [
  {
    icon: Layers,
    title: 'I Build End-to-End',
    description: 'Most engineers specialize in one layer. I architect entire systems. The Nexural platform has 185 database tables, 69 API endpoints, Stripe billing, AI-powered bots, and real-time trading integrations. I designed and built all of it — database to deploy.'
  },
  {
    icon: Shield,
    title: 'Evidence Over Claims',
    description: "Every project on this site has a GitHub repo, a test suite, or a live deployment behind it. I built 13 testing frameworks because I believe in proof. I don't say I can build something — I show you the running system."
  },
  {
    icon: Network,
    title: 'Cross-Domain Thinking',
    description: "Enterprise retail (Home Depot), fintech trading (HighStrike), cloud infrastructure, AI/ML, cybersecurity, quantitative analysis. I don't just know one vertical — I bring pattern recognition across domains to solve problems others haven't seen."
  }
]

export function AboutContent() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Photo Side */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-8">
              <ProfessionalAvatar size="xl" showGlow />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-[#A1A1AA]">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Orlando, FL · Remote-First</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="https://github.com/JasonTeixeira"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-[#71717A] hover:text-[#06B6D4] hover:border-[#06B6D4]/50 transition-colors"
                >
                  <Github className="h-5 w-5" />
                </Link>
                <Link
                  href="https://linkedin.com/in/jason-teixeira"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-[#71717A] hover:text-[#06B6D4] hover:border-[#06B6D4]/50 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link
                  href="mailto:sage@sageideas.org"
                  className="p-2 bg-[#18181B] border border-[#27272A] rounded-lg text-[#71717A] hover:text-[#06B6D4] hover:border-[#06B6D4]/50 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SectionLabel>About</SectionLabel>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-[#FAFAFA]">
              The Builder Behind the Code
            </h1>
            <div className="mt-6 space-y-4 text-[#A1A1AA]">
              <p>
                {"I'm Jason Teixeira — a systems architect and full-stack engineer who builds production-grade software. From enterprise QA systems serving 2,300+ Home Depot stores to real-time trading platforms processing $10M+ daily at HighStrike — I've operated at scale and under pressure."}
              </p>
              <p>
                Today I run Sage Ideas LLC, where I architect and build software systems for businesses, trading firms, and startups. I founded and built the entire Nexural ecosystem — a fintech platform with 185 database tables, 69 API endpoints, AI-powered bots, and Stripe billing — from zero to production, as sole architect.
              </p>
            </div>

            {/* Quick Facts */}
            <div className="mt-8 p-6 bg-[#18181B] border border-[#27272A] rounded-xl">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#71717A]">Company</span>
                  <p className="text-[#FAFAFA] font-medium">Sage Ideas LLC</p>
                </div>
                <div>
                  <span className="text-[#71717A]">Languages</span>
                  <p className="text-[#FAFAFA] font-medium">English · Portuguese · Spanish</p>
                </div>
                <div>
                  <span className="text-[#71717A]">Education</span>
                  <p className="text-[#FAFAFA] font-medium">Dual B.S. Degrees</p>
                </div>
                <div>
                  <span className="text-[#71717A]">Certifications</span>
                  <p className="text-[#FAFAFA] font-medium">9 (ISTQB, AWS, Cisco)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* My Story */}
      <section className="py-24 bg-[#18181B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel>The Journey</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">
              How I Got Here
            </h2>
          </motion.div>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">Enterprise Foundations (2019-2023)</h3>
              <p className="text-[#A1A1AA]">
                {"I cut my teeth at The Home Depot, where I built cloud automation and CI/CD pipelines at Fortune 50 scale. When your code affects 2,300+ stores and millions of customers, you learn to build systems that don't break. I learned rigor, process, and what production-grade really means."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">Fintech Precision (2023-2024)</h3>
              <p className="text-[#A1A1AA]">
                {"At HighStrike, I built test automation for a platform processing $10M+ in daily trading volume and 50K+ daily trades. A bug here doesn't just cause a bad UX — it causes real financial loss. I built frameworks that achieved <1% flaky test rate and a 95% uptime SLA. My test systems prevented multiple potential multi-million dollar trading errors."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">Building My Own (2024-Present)</h3>
              <p className="text-[#A1A1AA]">
                I founded Sage Ideas LLC and built the Nexural ecosystem from scratch — a complete fintech platform with a trading dashboard, AI-powered Discord bot (30+ commands, GPT-4o integration), research engine (71+ metrics), alert system, newsletter studio, and strategy tracker. 185 database tables. 69 API endpoints. 61 test suites. Stripe billing. All designed, architected, and built by me. I also wrote a 120,000+ word book on trading — because understanding the domain makes the software better.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Career Timeline */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel>Experience</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">
              Career Timeline
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#27272A]" />

            <div className="space-y-8">
              {timeline.map((entry, index) => (
                <motion.div
                  key={entry.company}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative pl-12"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-2.5 top-2 w-3 h-3 bg-[#06B6D4] rounded-full border-2 border-[#09090B]" />

                  <div className="p-6 bg-[#18181B] border border-[#27272A] rounded-xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-mono text-[#06B6D4]">{entry.period}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#FAFAFA]">{entry.company}</h3>
                    <p className="text-[#A1A1AA] mb-4">{entry.role}</p>
                    <ul className="space-y-2">
                      {entry.achievements.map((achievement) => (
                        <li key={achievement} className="text-sm text-[#A1A1AA] flex items-start gap-2">
                          <span className="text-[#06B6D4] mt-1">•</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-24 bg-[#18181B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel>Credentials</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">
              Certifications
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="p-4 bg-[#09090B] border border-[#27272A] rounded-xl flex items-center gap-4"
              >
                <div className="p-2 bg-[#06B6D4]/10 rounded-lg">
                  <Award className="h-6 w-6 text-[#06B6D4]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#FAFAFA]">{cert.name}</h3>
                  <p className="text-xs text-[#71717A]">{cert.issuer} · {cert.year}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets Me Apart */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel>Why Me</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">
              What Makes Me Different
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {differentiators.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-6 bg-[#18181B] border border-[#27272A] rounded-2xl hover:border-[#06B6D4]/50 transition-all duration-300"
              >
                <item.icon className="h-10 w-10 text-[#06B6D4] mb-4" />
                <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">{item.title}</h3>
                <p className="text-sm text-[#A1A1AA]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#18181B]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">
              {"Let's Work Together"}
            </h2>
            <p className="text-[#A1A1AA] mb-8">
              {"Whether you're hiring or you need something built."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                className="bg-[#8B5CF6] text-white hover:bg-[#A78BFA] font-semibold px-8 btn-glow"
              >
                <Link href="/services">
                  View Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold px-8"
              >
                <Link href="/resume">
                  Download Resume
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent px-8"
              >
                <Link href="/contact">
                  Contact Me
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
