'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Folder, FileText, Award, Cpu, Download, Mail } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'

const steps = [
  {
    number: '1',
    title: 'See what I\'ve built',
    description: '27+ projects spanning full-stack, trading, cloud, and automation.',
    icon: Folder,
    href: '/projects',
    color: 'cyan'
  },
  {
    number: '2',
    title: 'Read how I build',
    description: 'Deep dive into the Nexural ecosystem — 185 tables, 69 APIs, 7 systems.',
    icon: FileText,
    href: '/case-studies/nexural-ecosystem',
    color: 'cyan'
  },
  {
    number: '3',
    title: 'Check my credentials',
    description: '9 certifications, enterprise experience, and career timeline.',
    icon: Award,
    href: '/about#certifications',
    color: 'cyan'
  },
  {
    number: '4',
    title: 'See my tech stack',
    description: '50+ technologies across the full stack.',
    icon: Cpu,
    href: '/stack',
    color: 'cyan'
  },
  {
    number: '5',
    title: 'Download my resume',
    description: 'Get the full picture in PDF format.',
    icon: Download,
    href: '/resume',
    color: 'cyan'
  },
  {
    number: '6',
    title: 'Get in touch',
    description: 'Let\'s discuss opportunities or projects.',
    icon: Mail,
    href: '/contact',
    color: 'violet'
  }
]

export default function StartPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <SectionLabel>Quick Tour</SectionLabel>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA]">
            Start Here
          </h1>
          <p className="mt-6 text-xl text-[#A1A1AA] max-w-xl mx-auto">
            {"Here's the fastest way to see what I can do. 60 seconds to explore."}
          </p>
        </motion.div>
      </section>

      {/* Steps */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={step.href}
                className={`group block h-full p-6 bg-[#18181B] border rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                  step.color === 'violet'
                    ? 'border-[#8B5CF6]/20 hover:border-[#8B5CF6]/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]'
                    : 'border-[#27272A] hover:border-[#06B6D4]/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    step.color === 'violet'
                      ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
                      : 'bg-[#06B6D4]/10 text-[#06B6D4]'
                  }`}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold text-[#FAFAFA] mb-2 group-hover:${
                      step.color === 'violet' ? 'text-[#8B5CF6]' : 'text-[#06B6D4]'
                    } transition-colors`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#A1A1AA]">{step.description}</p>
                  </div>
                </div>
                <div className={`mt-4 flex items-center text-sm font-medium ${
                  step.color === 'violet' ? 'text-[#8B5CF6]' : 'text-[#06B6D4]'
                }`}>
                  Explore
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
