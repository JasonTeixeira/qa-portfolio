'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Code2,
  TestTube2,
  Cloud,
  TrendingUp,
  Sparkles,
  MessageSquare,
  PenTool,
  Hammer,
  Rocket,
  FileCheck,
  CalendarClock,
  Lightbulb,
  Check,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const services = [
  {
    icon: Code2,
    title: 'Custom Software Development',
    description: 'Full-stack applications built to your specifications. Next.js frontends, .NET/Python backends, databases designed and optimized. You get production-ready code, not prototypes.',
    deliverables: [
      'Complete web applications',
      'API development (REST/GraphQL)',
      'Database design & implementation',
      'Admin dashboards & tools',
      'Mobile-responsive interfaces',
      'Authentication & authorization'
    ],
    examples: 'Nexural Dashboard, AlphaStream ML System, Portfolio Tracker'
  },
  {
    icon: TestTube2,
    title: 'Test Automation Architecture',
    description: 'Build QA frameworks that catch bugs before users do. UI tests, API tests, CI/CD integration, and reporting dashboards. Reduce flaky tests, accelerate release cycles.',
    deliverables: [
      'End-to-end test frameworks',
      'API testing suites',
      'CI/CD pipeline integration',
      'Quality dashboards & metrics',
      'Performance testing',
      'Test strategy consulting'
    ],
    examples: 'HighStrike QA Framework (95% SLA), Home Depot Quality Gates'
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure & DevOps',
    description: 'AWS architecture, Terraform IaC, Docker containerization, and deployment automation. Build cloud systems that scale and cost what they should.',
    deliverables: [
      'AWS architecture design',
      'Infrastructure-as-code (Terraform)',
      'Docker & containerization',
      'CI/CD pipeline setup',
      'Monitoring & alerting',
      'Cost optimization'
    ],
    examples: 'Multi-environment AWS setups, GitHub Actions workflows'
  },
  {
    icon: TrendingUp,
    title: 'Trading Systems Development',
    description: 'Trading platforms, signal systems, and financial data tools. Real-time integrations with brokerages, market data APIs, and backtesting infrastructure.',
    deliverables: [
      'Trading dashboards',
      'Signal generation systems',
      'Brokerage API integrations',
      'Backtesting frameworks',
      'Real-time market data',
      'Risk management tools'
    ],
    examples: 'Nexural Trading Platform, AlphaStream Signals, NinjaTrader Integration'
  }
]

const process = [
  {
    step: 1,
    icon: MessageSquare,
    title: 'Discovery Call',
    description: "30-minute call to understand your needs. What are you building? What's the budget? What's the timeline? No pressure, just clarity."
  },
  {
    step: 2,
    icon: Lightbulb,
    title: 'Proposal & Scope',
    description: "Within 48 hours, you get a detailed proposal: what I'll build, how long it takes, what it costs. Fixed-price or hourly — your choice."
  },
  {
    step: 3,
    icon: PenTool,
    title: 'Architecture Review',
    description: 'Before code: architecture document, data models, tech stack decisions. You approve the blueprint before building starts.'
  },
  {
    step: 4,
    icon: Hammer,
    title: 'Build Phase',
    description: 'Weekly check-ins with working demos. See progress in real-time. Adjust scope if needed. No black-box development.'
  },
  {
    step: 5,
    icon: FileCheck,
    title: 'Testing & QA',
    description: 'Every feature tested. Documentation written. Performance validated. Bug fixes included before handoff.'
  },
  {
    step: 6,
    icon: Rocket,
    title: 'Deploy & Support',
    description: 'Production deployment. Training if needed. 30-day support window for bug fixes. Optional ongoing maintenance packages.'
  }
]

const faqs = [
  {
    question: 'What are your rates?',
    answer: "I work on either fixed-price projects or hourly consulting. Fixed-price starts at $5K for small projects, $15K-50K for full applications. Hourly consulting is $150/hr. I'll recommend which model fits your project during the discovery call."
  },
  {
    question: 'How long do projects typically take?',
    answer: 'Small tools (landing pages, simple APIs): 1-2 weeks. Medium applications (dashboards, CRUD apps): 4-8 weeks. Complex systems (trading platforms, multi-service architectures): 2-4 months. I provide realistic timelines upfront.'
  },
  {
    question: 'Do you work with early-stage startups?',
    answer: "Yes, but I'm selective. I look for founders who know what they want to build and have budget allocated. I don't do equity-only deals or vague \"build me an app\" engagements."
  },
  {
    question: 'What tech stack do you work with?',
    answer: 'Primary: Next.js, React, TypeScript, Python, .NET Core, PostgreSQL, AWS. I also work with: Node.js, FastAPI, Docker, Terraform, NinjaTrader (C#), Discord.js, and various AI/ML tools.'
  },
  {
    question: "What's your communication style?",
    answer: "Weekly async updates (Loom videos, written summaries) plus real-time access via Slack/Discord for questions. I don't disappear — you always know project status."
  },
  {
    question: 'Do you provide ongoing maintenance?',
    answer: 'Yes. After project completion, I offer monthly maintenance packages: monitoring, bug fixes, small feature additions. Rates depend on system complexity.'
  }
]

export function ServicesContent() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <SectionLabel>Services</SectionLabel>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA]">
            What I Build For You
          </h1>
          <p className="mt-6 text-lg text-[#A1A1AA]">
            {"I help businesses, startups, and trading firms build production-grade software. From web applications to trading systems to test automation — you get working software, not slide decks."}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild className="bg-[#8B5CF6] text-white hover:bg-[#A78BFA] btn-glow">
              <Link href="/start">
                <Sparkles className="mr-2 h-4 w-4" />
                Start a Project
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent">
              <a href="https://cal.com/jason-teixeira-8elz3z" target="_blank" rel="noopener noreferrer">
                <CalendarClock className="mr-2 h-4 w-4" />
                Book a Call
              </a>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid lg:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
            <GlowCard glowColor="violet" className="h-full">
              <div className="p-8 flex items-start gap-6">
                <div className="p-3 bg-[#8B5CF6]/10 rounded-xl shrink-0">
                  <service.icon className="h-8 w-8 text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">{service.title}</h3>
                  <p className="text-[#A1A1AA] mb-6">{service.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-[#71717A] mb-2">Deliverables:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {service.deliverables.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                          <Check className="h-3 w-3 text-[#10B981]" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-[#27272A]">
                    <p className="text-xs text-[#71717A]">
                      <span className="text-[#06B6D4]">Examples:</span> {service.examples}
                    </p>
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-[#18181B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel>Process</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">
              How We Work Together
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative p-6 bg-[#09090B] border border-[#27272A] rounded-2xl"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#06B6D4] rounded-full flex items-center justify-center text-sm font-bold text-[#09090B]">
                  {step.step}
                </div>
                <step.icon className="h-8 w-8 text-[#06B6D4] mb-4 mt-2" />
                <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2">{step.title}</h3>
                <p className="text-sm text-[#A1A1AA]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">
              Common Questions
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`faq-${index}`}
                  className="bg-[#18181B] border border-[#27272A] rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left text-[#FAFAFA] hover:text-[#06B6D4]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#A1A1AA]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
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
            {/* Solo vs Agency */}
            <div className="mb-16 max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-6 text-center">Why a Solo Architect, Not an Agency</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 bg-[#06B6D4]/5 border border-[#06B6D4]/20 rounded-xl">
                  <p className="text-sm font-semibold text-[#06B6D4] mb-3">Working With Me</p>
                  <ul className="space-y-2 text-sm text-[#A1A1AA]">
                    <li className="flex items-start gap-2"><span className="text-[#10B981] mt-0.5">+</span>One person designs, builds, and deploys — no handoff delays</li>
                    <li className="flex items-start gap-2"><span className="text-[#10B981] mt-0.5">+</span>$150/hr — no account managers, no project coordinators billing you</li>
                    <li className="flex items-start gap-2"><span className="text-[#10B981] mt-0.5">+</span>Direct communication — you talk to the person writing the code</li>
                    <li className="flex items-start gap-2"><span className="text-[#10B981] mt-0.5">+</span>Faster decisions — architecture choices in hours, not committees</li>
                    <li className="flex items-start gap-2"><span className="text-[#10B981] mt-0.5">+</span>Domain expertise — I trade the same markets my software serves</li>
                  </ul>
                </div>
                <div className="p-5 bg-[#18181B] border border-[#27272A] rounded-xl">
                  <p className="text-sm font-semibold text-[#71717A] mb-3">Typical Agency</p>
                  <ul className="space-y-2 text-sm text-[#71717A]">
                    <li className="flex items-start gap-2"><span className="text-[#71717A] mt-0.5">-</span>Sales team sells, junior devs build — knowledge gaps</li>
                    <li className="flex items-start gap-2"><span className="text-[#71717A] mt-0.5">-</span>$200-400/hr blended rate — layers of overhead</li>
                    <li className="flex items-start gap-2"><span className="text-[#71717A] mt-0.5">-</span>Communication through project managers — telephone game</li>
                    <li className="flex items-start gap-2"><span className="text-[#71717A] mt-0.5">-</span>Decisions need stakeholder alignment — weeks of meetings</li>
                    <li className="flex items-start gap-2"><span className="text-[#71717A] mt-0.5">-</span>Generalists — no domain depth in trading or fintech</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Not For Section */}
            <div className="mb-16 max-w-2xl mx-auto text-left">
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-4">Who This Is Not For</h3>
              <p className="text-sm text-[#A1A1AA] mb-4">
                {"I'm selective about projects to ensure quality. I'm probably not the right fit if you need:"}
              </p>
              <ul className="space-y-2 text-sm text-[#71717A]">
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✕</span>
                  WordPress sites, Shopify themes, or no-code customizations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✕</span>
                  {"Equity-only compensation or \"build it and we'll pay you later\" arrangements"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✕</span>
                  {"Vague requirements (\"just build me an app\") without defined scope"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444] mt-1">✕</span>
                  Rush projects with unrealistic deadlines and no room for quality
                </li>
              </ul>
            </div>

            {/* Proof Section */}
            <div className="mb-16 max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-6 text-center">Proof, Not Promises</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <Link href="/case-studies/nexural-ecosystem" className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-[#06B6D4]/50 transition-colors">
                  <span className="text-[#06B6D4] font-mono text-xs">Custom Software →</span>
                  <p className="text-[#FAFAFA] mt-1 font-medium">Nexural Platform</p>
                  <p className="text-[#71717A] mt-1">185 tables, 69 APIs, Stripe billing, 7 phases</p>
                </Link>
                <Link href="/case-studies/testing-frameworks" className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-[#06B6D4]/50 transition-colors">
                  <span className="text-[#06B6D4] font-mono text-xs">Test Automation →</span>
                  <p className="text-[#FAFAFA] mt-1 font-medium">13 Testing Frameworks</p>
                  <p className="text-[#71717A] mt-1">500+ tests, 82% faster pipelines, {"<1%"} flaky</p>
                </Link>
                <Link href="/case-studies/aws-landing-zone" className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-[#06B6D4]/50 transition-colors">
                  <span className="text-[#06B6D4] font-mono text-xs">Cloud Infrastructure →</span>
                  <p className="text-[#FAFAFA] mt-1 font-medium">AWS Landing Zone</p>
                  <p className="text-[#71717A] mt-1">Multi-account, Terraform, SCPs, CI gates</p>
                </Link>
                <Link href="/case-studies/alphastream" className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-[#06B6D4]/50 transition-colors">
                  <span className="text-[#06B6D4] font-mono text-xs">Trading Systems →</span>
                  <p className="text-[#FAFAFA] mt-1 font-medium">AlphaStream ML</p>
                  <p className="text-[#71717A] mt-1">200+ indicators, 5 ML models, real-time signals</p>
                </Link>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">
              Ready to Build Something?
            </h2>
            <p className="text-[#A1A1AA] mb-8 max-w-2xl mx-auto">
              {"Start with a 30-minute discovery call. We'll discuss your project, timeline, and budget. No pressure, just clarity on whether we're a good fit."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] btn-glow px-8 font-semibold">
                <a href="https://cal.com/jason-teixeira-8elz3z" target="_blank" rel="noopener noreferrer">
                  Book a Discovery Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent px-8">
                <Link href="/contact">
                  Send a Message
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
