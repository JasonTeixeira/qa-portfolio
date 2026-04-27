'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Monitor, TestTube2, Briefcase, Quote } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'
import { ProjectCard } from '@/components/project-card'
import { MetricCounter } from '@/components/metric-counter'
import { TypingTerminal } from '@/components/typing-terminal'
import { FloatingOrbs } from '@/components/floating-orbs'
import { GlowCard } from '@/components/glow-card'
import { ProfessionalAvatar } from '@/components/professional-avatar'
import { featuredProjects } from '@/data/projects'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const capabilities = [
  {
    icon: Monitor,
    title: 'Production Systems',
    description: 'Full-stack web applications, trading platforms, cloud infrastructure, and AI-powered tools. Next.js, .NET, Python, AWS.',
    tags: ['Next.js', '.NET', 'Python', 'AWS'],
    href: '/projects',
    linkText: 'See Projects',
    accent: 'cyan' as const
  },
  {
    icon: TestTube2,
    title: 'Automation & Quality',
    description: 'Test frameworks, CI/CD pipelines, quality telemetry dashboards, and monitoring systems. 13 frameworks built.',
    tags: ['Selenium', 'Playwright', 'Docker', 'GitHub Actions'],
    href: '/case-studies',
    linkText: 'See Case Studies',
    accent: 'cyan' as const
  },
  {
    icon: Briefcase,
    title: 'Services & Consulting',
    description: 'Custom software development, automation architecture, cloud infrastructure setup, and trading system development.',
    tags: ['Custom Dev', 'Consulting', 'Architecture'],
    href: '/services',
    linkText: 'View Services',
    accent: 'violet' as const
  }
]

const metrics = [
  { value: '20+', label: 'Projects Built' },
  { value: '500+', label: 'Tests in Production' },
  { value: '$10M+', label: 'Daily Volume Supported' },
  { value: '82%', label: 'Pipeline Time Cut' },
  { value: '2,300+', label: 'Stores Impacted' },
  { value: '185', label: 'Database Tables' },
  { value: '69', label: 'API Endpoints' },
  { value: '9', label: 'Certifications' }
]

const companies = ['The Home Depot', 'HighStrike', 'AWS', 'NinjaTrader']

const testimonials = [
  {
    quote: "Test frameworks used by 50+ engineers across enterprise teams. Reduced regression testing time by 70% and prevented 12+ breaking changes from reaching production.",
    author: "Impact at Scale",
    company: "The Home Depot (2,300+ stores)",
  },
  {
    quote: "Built test automation for a platform processing $10M+ daily trading volume. Achieved <1% flaky test rate, 95% uptime SLA, and prevented multiple potential multi-million dollar trading errors.",
    author: "Fintech Reliability",
    company: "HighStrike Trading Platform",
  },
]

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const isHeroInView = useInView(heroRef, { once: true })

  return (
    <div className="min-h-screen noise-overlay">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 grid-pattern-animated" />
        <FloatingOrbs />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="lg:col-span-3 space-y-8"
              initial="initial"
              animate={isHeroInView ? "animate" : "initial"}
              variants={stagger}
            >
              {/* Availability Badge */}
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 text-sm text-[#A1A1AA] bg-[#18181B]/80 backdrop-blur-sm border border-[#27272A] rounded-full py-1.5 px-4">
                  <span className="w-2 h-2 bg-[#10B981] rounded-full status-dot" />
                  Available for hire & consulting
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#FAFAFA] leading-tight text-shadow-glow"
              >
                I Build <span className="gradient-text-animated">Systems</span> That Scale
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                className="text-lg sm:text-xl text-[#A1A1AA] max-w-xl leading-relaxed"
              >
                Automation architect and full-stack engineer with enterprise and fintech experience. From cloud infrastructure to trading platforms — I design, build, ship, and automate.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold px-8 btn-glow"
                >
                  <Link href="/projects">
                    View My Work
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent/50 backdrop-blur-sm px-8"
                >
                  <Link href="/contact">
                    Get In Touch
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-mono text-[#71717A]"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#06B6D4] rounded-full" />
                  20+ Projects
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full" />
                  9 Certifications
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                  120K+ Word Book
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full" />
                  Fortune 50 Experience
                </span>
              </motion.div>

              {/* Quick Access */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-3 pt-2"
              >
                <Link href="/hire" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded-full px-3 py-1 hover:bg-[#10B981]/20 transition-colors">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                  Hire Me
                </Link>
                <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-full px-3 py-1 hover:bg-[#8B5CF6]/20 transition-colors">
                  Platform Engineering
                </Link>
                <Link href="/artifacts" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-full px-3 py-1 hover:bg-[#F59E0B]/20 transition-colors">
                  Artifacts & Evidence
                </Link>
              </motion.div>
            </motion.div>

            {/* Right - Terminal */}
            <motion.div
              className="lg:col-span-2 flex flex-col items-center"
              initial={{ opacity: 0, x: 30, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <TypingTerminal />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-[#3F3F46] rounded-full flex justify-center"
            animate={{ borderColor: ['#3F3F46', '#06B6D4', '#3F3F46'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-2.5 bg-[#06B6D4] rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-[#18181B]/50 border-y border-[#27272A] py-8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm text-[#71717A]">Experience building for</span>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {companies.map((company, index) => (
                <motion.span
                  key={company}
                  className="text-[#A1A1AA] font-medium hover:text-[#FAFAFA] transition-colors cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {company}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What I Build */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel>Capabilities</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] text-balance">
              What I Build
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {capabilities.map((cap, index) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlowCard glowColor={cap.accent} className="h-full">
                  <div className="p-6">
                    <cap.icon className={`h-10 w-10 mb-4 ${
                      cap.accent === 'violet' ? 'text-[#8B5CF6]' : 'text-[#06B6D4]'
                    }`} />
                    <h3 className="text-xl font-semibold text-[#FAFAFA] mb-3">{cap.title}</h3>
                    <p className="text-[#A1A1AA] text-sm mb-4">{cap.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {cap.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-mono text-[#71717A] bg-[#27272A] px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={cap.href}
                      className={`inline-flex items-center text-sm font-medium transition-colors ${
                        cap.accent === 'violet'
                          ? 'text-[#8B5CF6] hover:text-[#A78BFA]'
                          : 'text-[#06B6D4] hover:text-[#22D3EE]'
                      }`}
                    >
                      {cap.linkText}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 sm:py-32 bg-[#09090B] relative">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel>Selected Work</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] text-balance">
              Projects That Ship
            </h2>
            <p className="mt-4 text-[#A1A1AA]">A few highlights from 20+ projects.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.slice(0, 6).map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/projects"
              className="inline-flex items-center text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors group"
            >
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-24 sm:py-32 bg-[#18181B] relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/5 via-transparent to-[#8B5CF6]/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel>Impact</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] text-balance">
              Results That Speak
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <MetricCounter value={metric.value} label={metric.label} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] text-balance">
              Proven Impact
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GlowCard>
                  <div className="p-8">
                    <Quote className="h-8 w-8 text-[#06B6D4]/30 mb-4" />
                    <p className="text-[#A1A1AA] text-lg leading-relaxed mb-6">
                      {`"${testimonial.quote}"`}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center">
                        <span className="text-[#09090B] font-bold">
                          {testimonial.author.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[#FAFAFA] font-medium">{testimonial.author}</p>
                        <p className="text-sm text-[#71717A]">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="py-24 sm:py-32 bg-[#09090B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Employer Path */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <GlowCard className="border-l-2 border-l-[#06B6D4]">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-[#FAFAFA] mb-4">Looking to Hire?</h3>
                  <p className="text-[#A1A1AA] mb-6">
                    {"I'm open to remote full-time roles in automation engineering, platform engineering, and full-stack development. I bring enterprise scale (Home Depot) and fintech precision (HighStrike) to every team."}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      asChild
                      className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold btn-glow"
                    >
                      <Link href="/resume">Download Resume</Link>
                    </Button>
                    <Link
                      href="/hire"
                      className="inline-flex items-center text-[#06B6D4] hover:text-[#22D3EE] font-medium transition-colors"
                    >
                      See What I Bring
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </GlowCard>
            </motion.div>

            {/* Client Path */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <GlowCard glowColor="violet" className="border-l-2 border-l-[#8B5CF6]">
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-[#FAFAFA] mb-4">Need Something Built?</h3>
                  <p className="text-[#A1A1AA] mb-6">
                    I help businesses build custom software, automate operations, and ship trading tools. From MVP to production — I architect, build, and deploy.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      asChild
                      className="bg-[#8B5CF6] text-white hover:bg-[#A78BFA] font-semibold"
                    >
                      <Link href="/services">View Services</Link>
                    </Button>
                    <Link
                      href="/contact?type=consulting"
                      className="inline-flex items-center text-[#8B5CF6] hover:text-[#A78BFA] font-medium transition-colors"
                    >
                      Get a Quote
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
