'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  Menu,
  X,
  Github,
  Linkedin,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  Command,
  Sparkles,
  Briefcase,
  BookOpen,
  FlaskConical,
  Users,
  Wrench,
  ShieldCheck,
  Gauge,
  Calculator,
  FileText,
  GitCompare,
  Building2,
  History,
  Mail,
  CircuitBoard,
  Search,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics/events'
import { CtaLink } from '@/components/el'

// ────────────────────────────────────────────────────────────────────────────
// Mega-menu data
// ────────────────────────────────────────────────────────────────────────────

type MegaItem = {
  href: string
  label: string
  description?: string
  badge?: string
  icon?: React.ComponentType<{ className?: string }>
}

type MegaSection = {
  title: string
  items: MegaItem[]
}

const servicesMega: MegaSection[] = [
  {
    title: 'AI Flagship',
    items: [
      {
        href: '/services/ai-implementation-consulting',
        label: 'AI Implementation Consulting',
        description: 'From $1,000 · 2 weeks · Audit',
        icon: Sparkles,
      },
      {
        href: '/services/ai-agent-development',
        label: 'AI Agent Development',
        description: 'From $2,600 · 4 weeks · Build',
        icon: Sparkles,
        badge: 'POPULAR',
      },
      {
        href: '/services/ai-voice-agent',
        label: 'AI Voice Agent',
        description: 'From $1,800 · 3 weeks · Build',
        icon: Sparkles,
      },
      {
        href: '/services/ai-lead-engine',
        label: 'AI Lead Engine',
        description: 'From $2,200 · 4 weeks · Build',
        icon: Sparkles,
      },
      {
        href: '/services/agent-operations-retainer',
        label: 'Agent Operations Retainer',
        description: 'From $600/mo · Operate',
        icon: Sparkles,
      },
    ],
  },
  {
    title: 'Productized engagements',
    items: [
      {
        href: '/services',
        label: 'All services',
        description: 'Productized engagements, fixed scope',
        icon: Briefcase,
      },
      {
        href: '/services#cat-ai-automation',
        label: 'AI & Automation',
        description: 'Audits · pipelines · agents',
        icon: Wrench,
      },
      {
        href: '/services#cat-care',
        label: 'Care plans',
        description: 'Site · brand · content care',
        icon: ShieldCheck,
      },
      {
        href: '/services#cat-platform',
        label: 'Platform & Cloud',
        description: 'AWS · Vercel · Supabase',
        icon: Building2,
      },
    ],
  },
  {
    title: 'By context',
    items: [
      {
        href: '/industries',
        label: 'Browse by industry',
        description: 'Five verticals, routed by problem',
        icon: Building2,
      },
      {
        href: '/capabilities',
        label: 'Capability matrix',
        description: 'What we ship, end-to-end',
        icon: Wrench,
      },
      {
        href: '/pricing',
        label: 'Pricing & comparison',
        description: 'Every tier, side-by-side',
        icon: Briefcase,
      },
    ],
  },
]

const resourcesMega: MegaSection[] = [
  {
    title: 'Read',
    items: [
      {
        href: '/blog',
        label: 'Journal',
        description: 'Field reports, build logs, and playbooks',
        icon: BookOpen,
      },
      {
        href: '/academy',
        label: 'Academy',
        description: 'Courses and practical builder systems',
        icon: BookOpen,
        badge: 'FORMING',
      },
      {
        href: '/pov',
        label: 'POV',
        description: 'Opinions, hot takes, principles',
        icon: BookOpen,
      },
      {
        href: '/changelog',
        label: 'Changelog',
        description: 'What we shipped recently',
        icon: History,
      },
      {
        href: '/compare',
        label: 'Compare',
        description: 'Sage vs in-house, Big-4, AI platforms',
        icon: GitCompare,
      },
    ],
  },
  {
    title: 'Use',
    items: [
      {
        href: '/tools/seo-audit',
        label: 'Free SEO Audit',
        description: 'Instant on-page SEO report — no account required',
        icon: Search,
        badge: 'FREE',
      },
      {
        href: '/lab/ai-readiness',
        label: 'AI Readiness Score',
        description: '10-question diagnostic with personalized roadmap',
        icon: Gauge,
      },
      {
        href: '/lab/calculators',
        label: 'ROI calculators',
        description: 'SDR, support, RAG, voice, churn',
        icon: Calculator,
      },
      {
        href: '/lab/templates',
        label: 'Free templates',
        description: 'Prompt library, eval harness, RFP, more',
        icon: FileText,
      },
      {
        href: '/lab',
        label: 'Lab products',
        description: 'What we built and operate ourselves',
        icon: FlaskConical,
      },
      {
        href: '/engineering-os',
        label: 'Engineering OS',
        description: 'Public proof of the internal resource factory',
        icon: CircuitBoard,
      },
      {
        href: '/how-it-works',
        label: 'How it works',
        description: 'Our process, demystified',
        icon: Wrench,
      },
      {
        href: '/trust',
        label: 'Trust center',
        description: 'Security, evals, compliance',
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: 'About',
    items: [
      {
        href: '/founder',
        label: 'Founder',
        description: 'Who runs this studio',
        icon: Users,
      },
      {
        href: '/studio',
        label: 'The studio',
        description: 'How we operate',
        icon: Building2,
      },
      {
        href: '/contact',
        label: 'Contact',
        description: 'Reach us directly',
        icon: Mail,
      },
    ],
  },
]

const mobileFlat: { href: string; label: string; section?: string }[] = [
  { href: '/services', label: 'Services', section: 'PRIMARY' },
  { href: '/work', label: 'Work', section: 'PRIMARY' },
  { href: '/academy', label: 'Academy', section: 'PRIMARY' },
  { href: '/pricing', label: 'Pricing', section: 'PRIMARY' },
  { href: '/services#cat-ai-flagship', label: 'AI Flagship', section: 'PRIMARY' },
  { href: '/blog', label: 'Journal', section: 'RESOURCES' },
  { href: '/pov', label: 'POV', section: 'RESOURCES' },
  { href: '/tools/seo-audit', label: 'Free SEO Audit', section: 'RESOURCES' },
  { href: '/lab/ai-readiness', label: 'AI Readiness Score', section: 'RESOURCES' },
  { href: '/lab/calculators', label: 'ROI calculators', section: 'RESOURCES' },
  { href: '/lab/templates', label: 'Free templates', section: 'RESOURCES' },
  { href: '/lab', label: 'Lab products', section: 'RESOURCES' },
  { href: '/engineering-os', label: 'Engineering OS', section: 'RESOURCES' },
  { href: '/compare', label: 'Compare', section: 'RESOURCES' },
  { href: '/how-it-works', label: 'How it works', section: 'RESOURCES' },
  { href: '/changelog', label: 'Changelog', section: 'RESOURCES' },
  { href: '/capabilities', label: 'Capabilities', section: 'COMPANY' },
  { href: '/industries', label: 'Industries', section: 'COMPANY' },
  { href: '/trust', label: 'Trust', section: 'COMPANY' },
  { href: '/founder', label: 'Founder', section: 'COMPANY' },
  { href: '/studio', label: 'Studio', section: 'COMPANY' },
  { href: '/contact', label: 'Contact', section: 'COMPANY' },
]

// ────────────────────────────────────────────────────────────────────────────
// EL Mega-menu dropdown
// ────────────────────────────────────────────────────────────────────────────

function MegaDropdown({
  label,
  sections,
  isOpen,
  onOpen,
  onClose,
}: {
  label: string
  sections: MegaSection[]
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}) {
  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-2 text-[12px] uppercase tracking-[0.10em] rounded-[3px] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]',
          isOpen
            ? 'text-[var(--sage-ink)] bg-[var(--sage-surface-3)]'
            : 'text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]'
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            'w-3 h-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.13, ease: 'easeOut' }}
            className="fixed left-1/2 top-[68px] z-50 w-[min(1040px,calc(100vw-32px))] -translate-x-1/2"
          >
            <div
              className="relative overflow-hidden rounded-[8px] border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.96)] shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(242,239,233,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.035) 1px, transparent 1px)',
                  backgroundSize: '54px 54px',
                }}
              />
              <div className="relative border-b border-[var(--sage-border)] px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--sage-accent-readable)]">
                  {label === 'Services' ? 'Choose the build path' : 'Browse the operating system'}
                </p>
              </div>
              <div className="relative grid grid-cols-3 divide-x divide-[var(--sage-border)]">
                {sections.map((section) => (
                  <div key={section.title} className="p-5">
                    {/* Mono section label */}
                    <p className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-[0.22em] text-[var(--sage-ink-faint)] mb-3.5">
                      {'// '}{section.title}
                    </p>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className="group flex items-start gap-2.5 rounded-[6px] border border-transparent px-2.5 py-2.5 transition-colors duration-150 hover:border-[var(--sage-border)] hover:bg-[rgba(61,90,254,0.08)]"
                            >
                              {Icon && (
                                <span
                                  className="shrink-0 w-6 h-6 rounded-[2px] bg-[var(--sage-surface-1)] border border-[var(--sage-border)] flex items-center justify-center group-hover:border-[var(--sage-border-hover)] transition-colors"
                                >
                                  <Icon className="w-3 h-3 text-[var(--sage-ink-faint)] group-hover:text-[var(--sage-brand)] transition-colors" />
                                </span>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[13px] font-semibold text-[var(--sage-ink-muted)] group-hover:text-[var(--sage-ink)] transition-colors whitespace-nowrap">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[9px] [font-family:var(--font-mono),ui-monospace,monospace] tracking-[0.16em] px-1.5 py-px rounded-[2px] bg-[var(--sage-brand)]/10 text-[var(--sage-brand)] border border-[var(--sage-brand)]/25">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-[11px] text-[var(--sage-ink-faint)] mt-0.5 leading-snug">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              {/* Footer strip */}
              <div className="relative border-t border-[var(--sage-border)] px-5 py-3 flex items-center justify-between gap-4 bg-[rgba(11,11,14,0.72)]">
                <p className="text-[11px] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
                  Not sure where to start? Book a free 30-min call →
                </p>
                <Link
                  href="/book"
                  onClick={() => {
                    onClose()
                    trackEvent('booking_click', { location: 'nav_mega' })
                  }}
                  className="text-[11px] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.14em] text-[var(--sage-accent-readable)] hover:text-[var(--sage-ink)] transition-colors whitespace-nowrap"
                >
                  ./book
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Top-level Navigation
// ────────────────────────────────────────────────────────────────────────────

type OpenMenu = null | 'services' | 'resources'

export function Navigation({ isSignedIn = false }: { isSignedIn?: boolean } = {}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const [isMac, setIsMac] = useState(true)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
    setOpenMenu(null)
  }, [pathname])

  useEffect(() => {
    setIsMac(
      typeof navigator !== 'undefined' &&
        navigator.platform.toUpperCase().indexOf('MAC') >= 0
    )
  }, [])

  // Hover-intent: small delay before closing so user can move into the panel
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120)
  }
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const openWith = (menu: OpenMenu) => {
    cancelClose()
    setOpenMenu(menu)
  }

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(path + '/')
  }

  const triggerCommandPalette = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || openMenu || isMobileOpen
          ? 'bg-[rgba(11,11,14,0.92)] backdrop-blur-2xl border-b border-[var(--sage-border-strong)]'
          : 'bg-[rgba(11,11,14,0.68)] backdrop-blur-xl border-b border-[rgba(242,239,233,0.06)]'
      )}
    >
      <nav
        className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-[68px] items-center justify-between gap-3">

          {/* Wordmark — left */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label="Sage Ideas — Home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[var(--sage-border)] bg-[rgba(20,20,24,0.82)]">
              <img src="/brand/sage-logo.png" alt="" width="16" height="24" className="h-6 w-auto" aria-hidden />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[13px] uppercase tracking-[0.18em] text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace] transition-colors duration-200 group-hover:text-[var(--sage-accent-readable)]">
                SAGE IDEAS
              </span>
              <span className="mt-1 hidden text-[9px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] xl:block">
                AI-native studio
              </span>
            </span>
          </Link>

          {/* Center cluster — primary nav */}
          <div className="hidden items-center gap-1 rounded-full border border-[var(--sage-border)] bg-[rgba(20,20,24,0.58)] p-1 lg:flex">
            <MegaDropdown
              label="Services"
              sections={servicesMega}
              isOpen={openMenu === 'services'}
              onOpen={() => openWith('services')}
              onClose={scheduleClose}
            />
            <Link
              href="/work"
              onClick={() => trackEvent('cta_click', { location: 'nav', label: 'Work', href: '/work' })}
              className={cn(
                'whitespace-nowrap px-3 py-2 text-[12px] uppercase tracking-[0.10em] rounded-full transition-colors [font-family:var(--font-mono),ui-monospace,monospace]',
                isActive('/work')
                  ? 'text-[var(--sage-brand)] bg-[var(--sage-surface-3)]'
                  : 'text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]'
              )}
            >
              Work
            </Link>
            <Link
              href="/academy"
              onClick={() => trackEvent('cta_click', { location: 'nav', label: 'Academy', href: '/academy' })}
              className={cn(
                'whitespace-nowrap px-3 py-2 text-[12px] uppercase tracking-[0.10em] rounded-full transition-colors [font-family:var(--font-mono),ui-monospace,monospace]',
                isActive('/academy')
                  ? 'text-[var(--sage-brand)] bg-[var(--sage-surface-3)]'
                  : 'text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]'
              )}
            >
              Academy
            </Link>
            <Link
              href="/pricing"
              onClick={() => trackEvent('cta_click', { location: 'nav', label: 'Pricing', href: '/pricing' })}
              className={cn(
                'whitespace-nowrap px-3 py-2 text-[12px] uppercase tracking-[0.10em] rounded-full transition-colors [font-family:var(--font-mono),ui-monospace,monospace]',
                isActive('/pricing')
                  ? 'text-[var(--sage-brand)] bg-[var(--sage-surface-3)]'
                  : 'text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]'
              )}
            >
              Pricing
            </Link>
            <MegaDropdown
              label="Resources"
              sections={resourcesMega}
              isOpen={openMenu === 'resources'}
              onOpen={() => openWith('resources')}
              onClose={scheduleClose}
            />
          </div>

          {/* Right cluster */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">

            {/* Command palette trigger — terminal-styled, hairline-bordered */}
            <button
              type="button"
              onClick={triggerCommandPalette}
              aria-label="Open command palette"
              className="group hidden items-center gap-2 rounded-full border border-[var(--sage-border)] bg-[rgba(20,20,24,0.72)] px-3 py-2 text-[var(--sage-ink-muted)] transition-colors hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)] xl:inline-flex [font-family:var(--font-mono),ui-monospace,monospace]"
            >
              <span className="sr-only">Open command palette</span>
              <span aria-hidden className="select-none text-[11px]">
                <span className="text-[var(--sage-lime)]">$</span>{' '}
                <span className="text-[var(--sage-ink-muted)] transition-colors">type a verb</span>
              </span>
              <kbd aria-hidden className="hidden xl:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-[var(--sage-surface-1)] border border-[var(--sage-border)] rounded-[2px] text-[var(--sage-ink-faint)]">
                {isMac ? <Command className="h-2.5 w-2.5" /> : 'Ctrl'}
                <span>K</span>
              </kbd>
            </button>

            {/* Live status sigil */}
            <span
              role="status"
              aria-label="Studio status: accepting work"
              className="hidden 2xl:inline-flex items-center gap-2 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--sage-accent-readable)] [font-family:var(--font-mono),ui-monospace,monospace]"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-[var(--sage-accent)]"
                style={{ boxShadow: '0 0 8px var(--sage-accent)' }}
              />
              accepting
            </span>

            {/* Login / Portal — ghost link styled to EL */}
            {isSignedIn ? (
              <Link
                href="/auth/redirect"
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 text-[12px] uppercase tracking-[0.10em] rounded-full border border-[var(--sage-border)] text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:border-[var(--sage-border-hover)] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]'
                )}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Portal
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 text-[12px] uppercase tracking-[0.10em] rounded-full border border-[var(--sage-border)] text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:border-[var(--sage-border-hover)] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]'
                )}
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </Link>
            )}

            {/* Primary CTA — solid teal from kit */}
            <CtaLink
              href="/book"
              variant="solid"
              event="booking_click"
              eventProps={{ location: 'nav' }}
              className="h-10 rounded-full text-[12px] px-5"
            >
              ./book
            </CtaLink>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)] rounded-full transition-colors"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="lg:hidden overflow-hidden border-t border-[var(--sage-border)]"
            >
              <div className="py-5 px-2 space-y-5 max-h-[calc(100vh-68px)] overflow-y-auto overscroll-contain bg-[rgba(11,11,14,0.96)]">
                {(['PRIMARY', 'RESOURCES', 'COMPANY'] as const).map((sec) => (
                  <div key={sec}>
                    {/* Mono section label */}
                    <p className="text-[10px] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.22em] text-[var(--sage-ink-faint)] px-4 mb-1.5">
                      {'// '}{sec === 'PRIMARY' ? 'Explore' : sec.charAt(0) + sec.slice(1).toLowerCase()}
                    </p>
                    {/* Hairline under label */}
                    <div className="h-px mx-4 bg-[var(--sage-border)] mb-2" />
                    <div className="space-y-px">
                      {mobileFlat
                        .filter((l) => l.section === sec)
                        .map((link) => {
                          const active =
                            pathname === link.href ||
                            (link.href !== '/' &&
                              pathname.startsWith(link.href.split('#')[0] + '/'))
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={cn(
                                'flex items-center justify-between px-4 py-3 min-h-[44px] text-[13px] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.08em] rounded-[3px] transition-colors',
                                active
                                  ? 'text-[var(--sage-brand)] bg-[var(--sage-surface-3)]'
                                  : 'text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]'
                              )}
                            >
                              <span>{link.label}</span>
                              {active && (
                                <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--sage-brand)]" />
                              )}
                            </Link>
                          )
                        })}
                    </div>
                  </div>
                ))}

                {/* Mobile footer actions */}
                <div className="pt-4 border-t border-[var(--sage-border)] flex items-center gap-3 px-2 pb-[env(safe-area-inset-bottom,8px)]">
                  <Link
                    href="https://github.com/JasonTeixeira"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[var(--sage-ink-faint)] hover:text-[var(--sage-ink-muted)] transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </Link>
                  <Link
                    href="https://linkedin.com/in/jason-teixeira"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[var(--sage-ink-faint)] hover:text-[var(--sage-ink-muted)] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </Link>
                  {isSignedIn ? (
                    <Link
                      href="/auth/redirect"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.10em] rounded-[3px] border border-[var(--sage-border)] text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] transition-colors"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Portal
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.10em] rounded-[3px] border border-[var(--sage-border)] text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] transition-colors"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Login
                    </Link>
                  )}
                  <CtaLink
                    href="/book"
                    variant="solid"
                    event="booking_click"
                    eventProps={{ location: 'nav_mobile' }}
                    className="ml-auto h-11 text-[12px] px-5"
                  >
                    Book a Call
                  </CtaLink>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
