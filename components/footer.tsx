'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/blog', label: 'Blog' },
]

const resources = [
  { href: '/stack', label: 'Tech Stack' },
  { href: '/resume', label: 'Resume' },
  { href: '/start', label: 'Start Here' },
]

const connect = [
  { href: 'mailto:sage@sageideas.org', label: 'sage@sageideas.org', icon: Mail },
  { href: 'https://linkedin.com/in/jason-teixeira', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://github.com/JasonTeixeira', label: 'GitHub', icon: Github },
]

export function Footer() {
  return (
    <footer className="bg-[#09090B] border-t border-[#27272A] relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06B6D4]/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-xl font-bold text-[#FAFAFA] hover:text-[#06B6D4] transition-colors">
              SAGE IDEAS
            </Link>
            <p className="text-sm text-[#A1A1AA]">
              Systems Architect & Full-Stack Engineer building production platforms, trading systems, and automation frameworks.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: 'https://github.com/JasonTeixeira', icon: Github, label: 'GitHub' },
                { href: 'https://linkedin.com/in/jason-teixeira', icon: Linkedin, label: 'LinkedIn' },
                { href: 'mailto:sage@sageideas.org', icon: Mail, label: 'Email' },
              ].map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="p-2 text-[#71717A] hover:text-[#06B6D4] hover:bg-[#18181B] rounded-lg transition-all"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-4">Navigation</h3>
            <ul className="space-y-3">
              {navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A1A1AA] hover:text-[#06B6D4] transition-colors inline-flex items-center group"
                  >
                    {link.label}
                    <ArrowRight className="ml-1 h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-4">Resources</h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A1A1AA] hover:text-[#06B6D4] transition-colors inline-flex items-center group"
                  >
                    {link.label}
                    <ArrowRight className="ml-1 h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <span className="text-xs text-[#71717A] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#10B981] rounded-full status-dot" />
                  Orlando, FL (Remote-First)
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Column 4: CTA */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-[#FAFAFA]">{"Let's Work Together"}</h3>
            <p className="text-sm text-[#A1A1AA]">
              Available for full-time roles and consulting projects. {"Let's"} build something great.
            </p>
            <Button
              asChild
              className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold w-full btn-glow"
            >
              <Link href="/contact">
                Get In Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-12 pt-8 border-t border-[#27272A] flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm text-[#71717A]">
            &copy; {new Date().getFullYear()} Jason Teixeira / Sage Ideas LLC. All rights reserved.
          </p>
          <p className="text-sm text-[#71717A] flex items-center gap-2">
            Built with
            <span className="inline-flex gap-1">
              <span className="px-2 py-0.5 bg-[#18181B] rounded text-[#A1A1AA] text-xs font-mono">Next.js</span>
              <span className="px-2 py-0.5 bg-[#18181B] rounded text-[#A1A1AA] text-xs font-mono">Tailwind</span>
              <span className="px-2 py-0.5 bg-[#18181B] rounded text-[#A1A1AA] text-xs font-mono">Framer</span>
            </span>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
