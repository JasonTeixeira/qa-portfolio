'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, MapPin, Layers, Shield, Network, ArrowRight, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'
import { ProfessionalAvatar } from '@/components/professional-avatar'

const timeline = [
  {
    period: '2021 - 2026',
    company: 'HighStrike',
    role: 'Trading Strategy Developer & Finance Analyst (Contract)',
    achievements: [
      'Developed trading strategies, indicators, and quantitative research tools for a fintech startup',
      'Built internal web applications and dashboards using Python and JavaScript',
      'Analyzed financial data to support investment decisions and trading operations',
      'Created internal business tools for a 14-person company, automating manual workflows',
      'Self-taught across Python, JavaScript, SQL, and data analysis during this role'
    ]
  },
  {
    period: '2021 - Present',
    company: 'Self-Employed',
    role: 'Freelance Developer & Technical Projects',
    achievements: [
      'Built 30+ projects on GitHub spanning full-stack apps, trading systems, and cloud infrastructure',
      'Delivered applications and tools for private clients',
      'Created a fintech ecosystem with 185 database tables, 69 API endpoints, and Stripe billing',
      'Built an ML-powered trading signal system with 200+ indicators and 5 ML models',
      'Active futures trader: 8 symbols on NinjaTrader'
    ]
  },
  {
    period: '2016 - 2021',
    company: 'Sage Ideas LLC',
    role: 'Founder & General Contractor',
    achievements: [
      'Founded and operated a construction company in central Florida',
      'Home Depot contractor — designed and installed kitchens, bathrooms, and full remodels',
      'Managed projects end-to-end: budgets, timelines, subcontractors, client delivery',
      'Built the project management and client communication skills I bring to software'
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
    description: 'I build entire systems, not just features. The Nexural platform has 185 database tables, 69 API endpoints, Stripe billing, AI-powered bots, and real-time trading integrations. I designed and built all of it solo — from database schema to deployed production app. Every project on this portfolio is something I actually built.'
  },
  {
    icon: Shield,
    title: 'Evidence Over Claims',
    description: "Every project on this site has a GitHub repo, a test suite, or a live deployment you can inspect. 20+ projects with real, readable code. A live telemetry dashboard. 51 blog posts with working examples. I don't just say I can build — I show you the running system."
  },
  {
    icon: Network,
    title: 'Non-Traditional Path, Real-World Thinking',
    description: "I ran a construction company, managed remodeling projects, then transitioned into fintech development where I built trading systems and research tools for 5 years. This background gives me project management discipline, client communication skills, and a problem-solving mindset that comes from building things in the real world."
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
                {"I'm Jason Teixeira — a developer and finance analyst with a non-traditional path into tech. I started tinkering with computers at 8, ran a construction company for five years, then spent another five years building trading strategies, applications, and research tools at HighStrike, a fintech startup."}
              </p>
              <p>
                Now I build production-grade software independently through Sage Ideas LLC. I designed and built the entire Nexural ecosystem — a fintech platform with 185 database tables, 69 API endpoints, AI-powered bots, and Stripe billing — from zero to production, completely self-taught. I bring the resourcefulness of an entrepreneur and the discipline of someone who has managed real-world projects from start to finish.
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
                  <p className="text-[#FAFAFA] font-medium">B.S. Finance — Kean University</p>
                  <p className="text-[#FAFAFA] font-medium">B.S. Computer Science — Full Sail University</p>
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
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">Entrepreneurship & Project Management (2016-2021)</h3>
              <p className="text-[#A1A1AA]">
                {"I founded Sage Ideas LLC as a construction company and worked as a Home Depot contractor across central Florida — designing and installing kitchens, bathrooms, and managing full home remodels. Running my own business taught me project management, client delivery, budgeting, and the discipline of shipping real work on deadline. These are the same skills that make me effective as a developer."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">Fintech Development (2021-2026)</h3>
              <p className="text-[#A1A1AA]">
                {"At HighStrike, I worked as a trading strategy developer and finance analyst on a 14-person team. I built internal web applications, dashboards, trading indicators, and business tools. Everything was self-taught on the job. This is where I went from someone who could code to someone who could build real applications that a business depended on."}
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
                I pivoted Sage Ideas LLC into a software company and built the Nexural ecosystem from scratch — a complete fintech platform with a trading dashboard, AI-powered Discord bot (30+ commands, GPT-4o integration), research engine, alert system, newsletter studio, and strategy tracker. 185 database tables. 69 API endpoints. Stripe billing. All designed and built by me. I also wrote a 120,000+ word book on trading — because understanding the domain makes the software better. Now I am looking for a team where I can bring this drive and keep growing as an engineer.
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
