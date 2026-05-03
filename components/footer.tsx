'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, ArrowRight } from 'lucide-react'

const studio = [
  { href: '/studio', label: 'Studio' },
  { href: '/founder', label: 'Founder' },
  { href: '/process', label: 'Process' },
  { href: '/trust', label: 'Trust' },
  { href: '/contact', label: 'Contact' },
]

// All 9 productized tiers + 3 monthly retainers.
const services = [
  { href: '/services/audit', label: 'Sage Audit · $750' },
  { href: '/services/ship', label: 'Ship · $2,500' },
  { href: '/services/automate', label: 'Automate · $3,500' },
  { href: '/services/seo-sprint', label: 'SEO Sprint · $1,500' },
  { href: '/services/content-engine', label: 'Content Engine · $1,500/mo' },
  { href: '/services/brand-sprint', label: 'Brand Sprint · $2,500' },
  { href: '/services/scale', label: 'Scale · $1,200/mo' },
  { href: '/services/build', label: 'Build · from $9,500' },
  { href: '/services/operate', label: 'Operate · $2,500/mo' },
  { href: '/services/site-care', label: 'Site Care · $300/mo' },
  { href: '/services/brand-care', label: 'Brand Care · $400/mo' },
  { href: '/services/content-care', label: 'Content Care · $800/mo' },
]

const navigate = [
  { href: '/services', label: 'All Services' },
  { href: '/capabilities', label: 'Capabilities Matrix' },
  { href: '/industries', label: 'Industries' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/work', label: 'Work / Case Studies' },
  { href: '/lab', label: 'The Lab' },
  { href: '/blog', label: 'Insights' },
  { href: '/dashboard', label: 'Live Dashboard' },
  { href: '/stack', label: 'Tech Stack' },
]

const industries = [
  { href: '/industries/fintech', label: 'Fintech' },
  { href: '/industries/saas', label: 'SaaS' },
  { href: '/industries/ecommerce', label: 'Ecommerce' },
  { href: '/industries/healthcare', label: 'Healthcare' },
  { href: '/industries/ai-startups', label: 'AI Startups' },
]

const legal = [
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/terms', label: 'Terms of Service' },
  { href: '/legal/cookies', label: 'Cookie Policy' },
  { href: '/legal/msa', label: 'Master Services Agreement' },
  { href: '/legal/nda', label: 'Mutual NDA Template' },
  { href: '/legal/sow-template', label: 'SOW Template' },
]

const connect = [
  { href: 'mailto:sage@sageideas.dev', label: 'sage@sageideas.dev', icon: Mail },
  { href: 'https://linkedin.com/in/jason-teixeira', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://github.com/JasonTeixeira', label: 'GitHub', icon: Github },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[#09090B] border-t border-[#27272A] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#06B6D4]/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand */}
          <motion.div
            className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="text-xl font-bold text-[#FAFAFA] hover:text-[#06B6D4] transition-colors"
            >
              SAGE IDEAS
            </Link>
            <p className="text-sm text-[#A1A1AA] max-w-sm">
              AI-native studio that builds, automates, and scales B2B businesses. We ship the
              same stack we run our own products on.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {connect.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={item.label}
                  className="p-2 text-[#A1A1AA] hover:text-[#06B6D4] hover:bg-[#18181B] rounded-lg transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 text-sm text-[#06B6D4] hover:text-[#0EA5E9] transition-colors group"
            >
              Book a strategy call
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Services */}
          <FooterColumn title="Services" links={services} />
          {/* Industries */}
          <FooterColumn title="Industries" links={industries} />
          {/* Navigate */}
          <FooterColumn title="Navigate" links={navigate} />
          {/* Studio + Legal — combined column */}
          <FooterColumn title="Studio & Legal" links={[...studio, ...legal]} />
        </div>

        <div className="mt-16 pt-8 border-t border-[#27272A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#71717A]">
          <p>© {year} Sage Ideas LLC. Orlando, FL. All rights reserved.</p>
          <p className="font-mono">Built in-house with Next.js, Vercel, Stripe, and AWS.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-3"
    >
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FAFAFA]">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[#A1A1AA] hover:text-[#06B6D4] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
