'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  ChevronDown,
  Command,
  Briefcase,
  BookOpen,
  Users,
  Wrench,
  ShieldCheck,
  Gauge,
  Building2,
  Mail,
  CircuitBoard,
  Search,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics/events'
import { CtaLink } from '@/components/el'
import { SageLivingMark } from '@/components/brand/sage-living-mark'

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

type RouteConsoleMode = 'services' | 'resources'

const servicesMega: MegaSection[] = [
  {
    title: 'AI services',
    items: [
      {
        href: '/services/ai-implementation-consulting',
        label: 'AI Implementation Consulting',
        description: 'From $1,000 · 2 weeks · Audit',
        icon: CircuitBoard,
      },
      {
        href: '/services/ai-agent-development',
        label: 'AI Agent Development',
        description: 'From $2,600 · 4 weeks · Build',
        icon: CircuitBoard,
        badge: 'POPULAR',
      },
      {
        href: '/services/ai-voice-agent',
        label: 'AI Voice Agent',
        description: 'From $1,800 · 3 weeks · Build',
        icon: CircuitBoard,
      },
    ],
  },
  {
    title: 'Engagements',
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
    ],
  },
  {
    title: 'Explore',
    items: [
      {
        href: '/pricing',
        label: 'Pricing & comparison',
        description: 'Every tier, side-by-side',
        icon: Briefcase,
      },
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
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        href: '/tools/route-finder',
        label: 'Route Finder',
        description: 'Find the right studio, audit, AI, or academy path',
        icon: Gauge,
        badge: 'NEW',
      },
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
    ],
  },
  {
    title: 'Studio',
    items: [
      {
        href: '/founder',
        label: 'Founder',
        description: 'Who runs this studio',
        icon: Users,
      },
      {
        href: '/how-it-works',
        label: 'How it works',
        description: 'Our process, demystified',
        icon: Wrench,
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

const routeConsoleMetrics = {
  services: [
    ['route', 'audit -> build'],
    ['scope', 'fixed or custom'],
    ['handoff', 'operator-led'],
  ],
  resources: [
    ['learn', 'academy'],
    ['use', 'tools'],
    ['proof', 'build record'],
  ],
} as const

const mobileRouteCards = [
  {
    href: '/services',
    label: 'Hire the studio',
    description: 'AI, apps, SaaS, brand, web, and growth built as one system.',
    icon: Briefcase,
  },
  {
    href: '/academy',
    label: 'Learn the system',
    description: 'Courses, templates, and build notes for do-it-yourself operators.',
    icon: BookOpen,
  },
  {
    href: '/tools/seo-audit',
    label: 'Run free audit',
    description: 'Find SEO and conversion leaks before you spend on traffic.',
    icon: Search,
  },
  {
    href: '/work',
    label: 'See proof',
    description: 'Real products, case studies, and the systems underneath them.',
    icon: CircuitBoard,
  },
] as const

const utilityRoutes = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Build record' },
  { href: '/lab', label: 'Lab' },
  { href: '/compare', label: 'Compare' },
  { href: '/industries', label: 'Industries' },
  { href: '/founder', label: 'Founder' },
  { href: '/contact', label: 'Contact' },
] as const

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
  onOpen: (trigger: 'hover' | 'click') => void
  onClose: () => void
}) {
  const mode: RouteConsoleMode = label === 'Services' ? 'services' : 'resources'
  const firstItem = sections[0]?.items[0]
  const [activeItem, setActiveItem] = useState<MegaItem | undefined>(firstItem)
  const active = activeItem ?? firstItem

  useEffect(() => {
    if (isOpen) setActiveItem(firstItem)
  }, [firstItem, isOpen])

  return (
    <div
      className="relative"
      onMouseEnter={() => onOpen('hover')}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen('click'))}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] rounded-[12px] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]',
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
          <>
            <motion.div
              aria-hidden="true"
              className="fixed inset-0 top-[78px] z-40 bg-[rgba(11,11,14,0.68)] backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-[88px] z-50 w-[min(1240px,calc(100vw-32px))] -translate-x-1/2"
            >
              <div className="relative overflow-hidden rounded-[18px] border border-[rgba(242,239,233,0.13)] bg-[rgba(12,12,16,0.94)] shadow-[0_38px_140px_rgba(0,0,0,0.9)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(242,239,233,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.032) 1px, transparent 1px)',
                    backgroundSize: '46px 46px',
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#3D5AFE,#7C3AED,#FF2D9B,transparent)]"
                />
                <div className="relative grid lg:grid-cols-[330px_minmax(0,1fr)_286px]">
                  <div className="border-b border-[var(--sage-border)] p-5 lg:border-b-0 lg:border-r">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--sage-accent-readable)]">
                      {mode === 'services' ? 'Route console' : 'Resource console'}
                    </p>
                    <h2 className="mt-3 max-w-[10ch] text-[clamp(2rem,1.3rem_+_2vw,3.45rem)] font-extrabold leading-[0.92] tracking-[-0.035em] text-[var(--sage-ink)] [font-family:var(--font-display),var(--font-sans),sans-serif]">
                      {mode === 'services' ? 'Choose the build path.' : 'Open the growth loop.'}
                    </h2>
                    <p className="mt-4 max-w-[34ch] text-sm leading-6 text-[var(--sage-ink-muted)]">
                      {mode === 'services'
                        ? 'Route the buyer by intent: audit, sprint, build, or operate. Every path has a next action.'
                        : 'Learn, inspect, compare, and reuse the system. Resources are designed to turn attention into qualified demand.'}
                    </p>
                    <RouteConsoleMap mode={mode} activeLabel={active?.label ?? label} />
                    <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-[8px] border border-[var(--sage-border)] bg-[var(--sage-border)]">
                      {routeConsoleMetrics[mode].map(([metric, value]) => (
                        <div className="bg-[#0B0B0E] p-3" key={metric}>
                          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)]">{metric}</span>
                          <p className="mt-1 text-[12px] font-semibold text-[var(--sage-ink)]">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-[var(--sage-border)] p-4 lg:border-b-0 lg:border-r">
                    <div className="grid gap-3 md:grid-cols-3">
                      {sections.map((section, sectionIndex) => (
                        <div key={section.title} className="min-w-0">
                          <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--sage-ink-faint)]">
                            0{sectionIndex + 1} / {section.title}
                          </p>
                          <motion.ul
                            className="space-y-1"
                            initial="hidden"
                            animate="show"
                            variants={{
                              hidden: {},
                              show: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
                            }}
                          >
                            {section.items.map((item) => {
                              const Icon = item.icon
                              const isActiveItem = active?.href === item.href
                              return (
                                <motion.li
                                  key={item.href}
                                  variants={{
                                    hidden: { opacity: 0, y: 8 },
                                    show: { opacity: 1, y: 0 },
                                  }}
                                >
                                  <Link
                                    href={item.href}
                                    onMouseEnter={() => setActiveItem(item)}
                                    onFocus={() => setActiveItem(item)}
                                    onClick={() => {
                                      onClose()
                                      trackEvent('route_console_click', {
                                        mode,
                                        label: item.label,
                                        href: item.href,
                                        lane: section.title,
                                      })
                                      trackEvent('cta_click', {
                                        location: `route_console_${mode}`,
                                        label: item.label,
                                        href: item.href,
                                      })
                                    }}
                                    className={cn(
                                      'group relative flex min-h-[64px] items-start gap-3 rounded-[10px] border px-3 py-3 transition-all duration-200',
                                      isActiveItem
                                        ? 'border-[rgba(61,90,254,0.48)] bg-[rgba(61,90,254,0.11)] text-[var(--sage-ink)] shadow-[inset_0_0_0_1px_rgba(61,90,254,0.15)]'
                                        : 'border-transparent text-[var(--sage-ink-muted)] hover:border-[rgba(242,239,233,0.1)] hover:bg-[rgba(242,239,233,0.035)] hover:text-[var(--sage-ink)]',
                                    )}
                                  >
                                    {Icon && (
                                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[rgba(242,239,233,0.1)] bg-[#0B0B0E]">
                                        <Icon className={cn('h-4 w-4 transition-colors', isActiveItem ? 'text-[var(--sage-accent-readable)]' : 'text-[var(--sage-ink-faint)] group-hover:text-[var(--sage-accent-readable)]')} />
                                      </span>
                                    )}
                                    <span className="min-w-0">
                                      <span className="flex items-center gap-1.5">
                                        <span className="truncate text-[13px] font-semibold">{item.label}</span>
                                        {item.badge && (
                                          <span className="rounded-[3px] border border-[rgba(61,90,254,0.34)] bg-[rgba(61,90,254,0.12)] px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                                            {item.badge}
                                          </span>
                                        )}
                                      </span>
                                      {item.description && (
                                        <span className="mt-1 block text-[11px] leading-snug text-[var(--sage-ink-faint)]">
                                          {item.description}
                                        </span>
                                      )}
                                    </span>
                                  </Link>
                                </motion.li>
                              )
                            })}
                          </motion.ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--sage-ink-faint)]">
                      active route
                    </p>
                    <div className="mt-3 rounded-[12px] border border-[rgba(242,239,233,0.1)] bg-[rgba(20,20,24,0.72)] p-4">
                      <p className="text-lg font-semibold leading-tight text-[var(--sage-ink)]">{active?.label}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--sage-ink-muted)]">
                        {active?.description ?? 'Choose a route to inspect the next step.'}
                      </p>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {[
                        { href: '/tools/seo-audit', label: 'Run audit', description: 'Free tool' },
                        { href: '/contact?intent=diagnose', label: 'Choose path', description: 'Diagnostic intake' },
                        { href: '/book', label: 'Book call', description: 'Direct route' },
                      ].map((item) => (
                        <Link
                          href={item.href}
                          key={item.label}
                          onClick={() => {
                            onClose()
                            trackEvent('route_console_click', {
                              mode,
                              label: item.label,
                              href: item.href,
                              lane: 'active_route',
                            })
                            trackEvent(item.href === '/book' ? 'booking_click' : 'cta_click', {
                              location: `route_console_${mode}`,
                              label: item.label,
                            })
                          }}
                          className="group flex items-center justify-between rounded-[10px] border border-[rgba(242,239,233,0.1)] bg-[#0B0B0E] px-3 py-3 transition-colors hover:border-[rgba(61,90,254,0.46)] hover:bg-[rgba(61,90,254,0.08)]"
                        >
                          <span>
                            <span className="block text-sm font-semibold text-[var(--sage-ink)]">{item.label}</span>
                            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">{item.description}</span>
                          </span>
                          <span className="text-[var(--sage-accent-readable)] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                        </Link>
                      ))}
                    </div>
                    <p className="mt-4 border-t border-[var(--sage-border)] pt-4 font-mono text-[10px] uppercase leading-5 tracking-[0.16em] text-[var(--sage-ink-faint)]">
                      Surface {'->'} system. Every route should reveal the offer, the engine, and the next move.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function RouteConsoleMap({
  mode,
  activeLabel,
}: {
  mode: RouteConsoleMode
  activeLabel: string
}) {
  const nodes =
    mode === 'services'
      ? [
          [52, 118, 'audit'],
          [154, 64, 'sprint'],
          [278, 104, 'build'],
          [352, 168, 'operate'],
        ]
      : [
          [54, 144, 'read'],
          [150, 76, 'learn'],
          [262, 94, 'tool'],
          [354, 148, 'proof'],
        ]

  return (
    <div className="mt-5 overflow-hidden rounded-[12px] border border-[rgba(242,239,233,0.1)] bg-[#0B0B0E]">
      <svg viewBox="0 0 410 230" className="h-[180px] w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`nav-flow-${mode}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3D5AFE" />
            <stop offset="0.55" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#FF2D9B" />
          </linearGradient>
        </defs>
        <path d="M42 128 C110 52 176 48 230 92 C282 134 314 176 374 132" fill="none" stroke="rgba(242,239,233,0.13)" strokeWidth="1" />
        <motion.path
          key={`${mode}-${activeLabel}`}
          d="M42 128 C110 52 176 48 230 92 C282 134 314 176 374 132"
          fill="none"
          stroke={`url(#nav-flow-${mode})`}
          strokeLinecap="round"
          strokeWidth="3"
          strokeDasharray="12 14"
          initial={{ strokeDashoffset: 180 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        />
        {nodes.map(([x, y, label], index) => (
          <g key={label}>
            <motion.circle
              cx={x}
              cy={y}
              r={index === 1 ? 7 : 6}
              fill="#0B0B0E"
              stroke={`url(#nav-flow-${mode})`}
              strokeWidth="2"
              animate={{ scale: index === 1 ? [1, 1.18, 1] : 1 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <text x={x} y={Number(y) + 25} fill="rgba(242,239,233,0.52)" fontSize="10" fontFamily="monospace" textAnchor="middle">
              {label}
            </text>
          </g>
        ))}
      </svg>
      <div className="border-t border-[var(--sage-border)] px-4 py-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--sage-ink-faint)]">inspecting</span>
        <p className="mt-1 truncate text-sm font-semibold text-[var(--sage-ink)]">{activeLabel}</p>
      </div>
    </div>
  )
}

function NavPulseRail() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
      <span className="sage-nav-pulse block h-px w-full bg-[linear-gradient(90deg,transparent,#3D5AFE,#7C3AED,#FF2D9B,transparent)]" />
    </span>
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
  const trackedOpenRef = useRef<OpenMenu>(null)
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

  // Escape closes any open menu — fixes the keyboard trap in the mega-menu/drawer (WCAG 2.1.2).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setIsMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

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

  const openRouteConsole = (menu: Exclude<OpenMenu, null>, trigger: 'hover' | 'click') => {
    openWith(menu)
    if (trackedOpenRef.current === menu) return
    trackedOpenRef.current = menu
    trackEvent('route_console_open', { mode: menu, trigger })
  }

  const closeRouteConsole = () => {
    trackedOpenRef.current = null
    scheduleClose()
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
          ? 'bg-[rgba(11,11,14,0.94)] backdrop-blur-2xl border-b border-[rgba(242,239,233,0.13)] shadow-[0_18px_80px_rgba(0,0,0,0.52)]'
          : 'bg-[rgba(11,11,14,0.82)] backdrop-blur-xl border-b border-[rgba(242,239,233,0.08)]'
      )}
    >
      <NavPulseRail />
      <nav
        className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-[78px] items-center justify-between gap-4">

          {/* Wordmark — left */}
          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-3"
          >
            <SageLivingMark />
            <span className="flex flex-col leading-none">
              <span className="text-[14px] font-semibold uppercase tracking-[0.22em] text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace] transition-colors duration-200 group-hover:text-[var(--sage-accent-readable)]">
                SAGE IDEAS
              </span>
              <span className="mt-1.5 hidden text-[9px] uppercase tracking-[0.20em] text-[var(--sage-ink-faint)] xl:block">
                Product · brand · AI systems
              </span>
            </span>
          </Link>

          {/* Center cluster — primary nav */}
          <div className="hidden items-center gap-1 rounded-[18px] border border-[rgba(242,239,233,0.12)] bg-[rgba(20,20,24,0.76)] p-1.5 shadow-[inset_0_1px_0_rgba(242,239,233,0.05),0_20px_70px_rgba(0,0,0,0.24)] lg:flex">
            <MegaDropdown
              label="Services"
              sections={servicesMega}
              isOpen={openMenu === 'services'}
              onOpen={(trigger) => openRouteConsole('services', trigger)}
              onClose={closeRouteConsole}
            />
            <Link
              href="/work"
              onClick={() => trackEvent('cta_click', { location: 'nav', label: 'Work', href: '/work' })}
              className={cn(
                'whitespace-nowrap px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] rounded-[12px] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]',
                isActive('/work')
                  ? 'text-[var(--sage-accent-readable)] bg-[var(--sage-surface-3)]'
                  : 'text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]'
              )}
            >
              Work
            </Link>
            <Link
              href="/academy"
              onClick={() => trackEvent('cta_click', { location: 'nav', label: 'Academy', href: '/academy' })}
              className={cn(
                'whitespace-nowrap px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] rounded-[12px] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]',
                isActive('/academy')
                  ? 'text-[var(--sage-accent-readable)] bg-[var(--sage-surface-3)]'
                  : 'text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]'
              )}
            >
              Academy
            </Link>
            <Link
              href="/pricing"
              onClick={() => trackEvent('cta_click', { location: 'nav', label: 'Pricing', href: '/pricing' })}
              className={cn(
                'whitespace-nowrap px-4 py-2.5 text-[12px] uppercase tracking-[0.12em] rounded-[12px] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]',
                isActive('/pricing')
                  ? 'text-[var(--sage-accent-readable)] bg-[var(--sage-surface-3)]'
                  : 'text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]'
              )}
            >
              Pricing
            </Link>
            <MegaDropdown
              label="Resources"
              sections={resourcesMega}
              isOpen={openMenu === 'resources'}
              onOpen={(trigger) => openRouteConsole('resources', trigger)}
              onClose={closeRouteConsole}
            />
          </div>

          {/* Right cluster */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">

            {/* Command palette trigger — terminal-styled, hairline-bordered */}
            <button
              type="button"
              onClick={triggerCommandPalette}
              aria-label="Open command palette"
              className="group hidden h-11 items-center gap-2 rounded-[14px] border border-[rgba(242,239,233,0.12)] bg-[rgba(20,20,24,0.72)] px-3 text-[var(--sage-ink-muted)] transition-colors hover:border-[rgba(61,90,254,0.42)] hover:text-[var(--sage-ink)] xl:inline-flex [font-family:var(--font-mono),ui-monospace,monospace]"
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
                  'inline-flex h-11 items-center gap-1.5 rounded-[14px] border border-[rgba(242,239,233,0.12)] px-3 text-[12px] uppercase tracking-[0.12em] text-[var(--sage-ink-muted)] transition-colors hover:border-[rgba(61,90,254,0.42)] hover:text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]'
                )}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Portal
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  'inline-flex h-11 items-center gap-1.5 rounded-[14px] border border-[rgba(242,239,233,0.12)] px-3 text-[12px] uppercase tracking-[0.12em] text-[var(--sage-ink-muted)] transition-colors hover:border-[rgba(61,90,254,0.42)] hover:text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]'
                )}
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </Link>
            )}

            {/* Primary CTA — solid teal from kit */}
            <Link
              href="/book"
              onClick={() => trackEvent('booking_click', { location: 'nav' })}
              className="group inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#3D5AFE] px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_16px_42px_rgba(61,90,254,0.34)] transition-transform hover:-translate-y-0.5 hover:bg-[#536BFF] [font-family:var(--font-mono),ui-monospace,monospace]"
            >
              Book a call
              <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => {
              const nextOpen = !isMobileOpen
              setIsMobileOpen(nextOpen)
              if (nextOpen) {
                trackEvent('route_console_open', { mode: 'mobile', trigger: 'mobile_toggle' })
              }
            }}
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 top-[78px] z-50 max-h-[calc(100svh-78px)] overflow-y-auto border-t border-[var(--sage-border)] bg-[rgba(11,11,14,0.98)] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+18px)] pt-4 shadow-[0_34px_120px_rgba(0,0,0,0.88)] lg:hidden"
            >
              <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
                <div
                  className="h-full w-full"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(242,239,233,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,233,0.032) 1px, transparent 1px)',
                    backgroundSize: '42px 42px',
                  }}
                />
              </div>
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--sage-accent-readable)]">
                  Route console
                </p>
                <h2 className="mt-3 max-w-[10ch] text-[3rem] font-extrabold leading-[0.9] tracking-[-0.035em] text-[var(--sage-ink)] [font-family:var(--font-display),var(--font-sans),sans-serif]">
                  Choose the path.
                </h2>
                <RouteConsoleMap mode="services" activeLabel="Mobile route console" />

                <div className="mt-4 grid gap-2">
	                  {mobileRouteCards.map((item, index) => {
	                    const Icon = item.icon
	                    const href = item.href as string
	                    const active =
	                      pathname === href ||
	                      (href !== '/' && pathname.startsWith(href.split('#')[0] + '/'))
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.035, duration: 0.22, ease: 'easeOut' }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => {
                            trackEvent('route_console_click', {
                              mode: 'mobile',
                              label: item.label,
                              href: item.href,
                              lane: 'primary',
                            })
                            trackEvent('cta_click', {
                              location: 'mobile_route_console',
                              label: item.label,
                              href: item.href,
                            })
                          }}
                          className={cn(
                            'group flex min-h-[92px] items-start gap-3 rounded-[14px] border p-4 transition-colors',
                            active
                              ? 'border-[rgba(61,90,254,0.52)] bg-[rgba(61,90,254,0.12)]'
                              : 'border-[rgba(242,239,233,0.1)] bg-[rgba(20,20,24,0.72)] hover:border-[rgba(61,90,254,0.45)] hover:bg-[rgba(61,90,254,0.08)]',
                          )}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(242,239,233,0.1)] bg-[#0B0B0E]">
                            <Icon className="h-5 w-5 text-[var(--sage-accent-readable)]" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-lg font-semibold leading-tight text-[var(--sage-ink)]">{item.label}</span>
                            <span className="mt-1 block text-sm leading-5 text-[var(--sage-ink-muted)]">{item.description}</span>
                          </span>
                          <span className="ml-auto text-[var(--sage-accent-readable)]" aria-hidden>→</span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="mt-5 rounded-[14px] border border-[rgba(242,239,233,0.1)] bg-[#0B0B0E] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--sage-ink-faint)]">
                    Utility routes
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {utilityRoutes.map((item) => (
                      <Link
                        href={item.href}
                        key={item.href}
                        onClick={() => {
                          trackEvent('route_console_click', {
                            mode: 'mobile',
                            label: item.label,
                            href: item.href,
                            lane: 'utility',
                          })
                        }}
                        className="rounded-[10px] border border-[rgba(242,239,233,0.08)] px-3 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-muted)] transition-colors hover:border-[rgba(61,90,254,0.38)] hover:text-[var(--sage-ink)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="sticky bottom-0 -mx-4 mt-5 border-t border-[var(--sage-border)] bg-[rgba(11,11,14,0.94)] px-4 py-3 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    {isSignedIn ? (
                      <Link
                        href="/auth/redirect"
                        className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[var(--sage-border)] px-3 text-[11px] uppercase tracking-[0.10em] text-[var(--sage-ink-muted)] transition-colors hover:text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Portal
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[var(--sage-border)] px-3 text-[11px] uppercase tracking-[0.10em] text-[var(--sage-ink-muted)] transition-colors hover:text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        Login
                      </Link>
                    )}
                    <Link
                      href="/tools/seo-audit"
                      onClick={() => {
                        trackEvent('route_console_click', {
                          mode: 'mobile',
                          label: 'Run audit',
                          href: '/tools/seo-audit',
                          lane: 'sticky',
                        })
                      }}
                      className="inline-flex h-11 items-center rounded-full border border-[var(--sage-border)] px-3 text-[11px] uppercase tracking-[0.10em] text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]"
                    >
                      Run audit
                    </Link>
                    <CtaLink
                      href="/book"
                      variant="solid"
                      event="booking_click"
                      eventProps={{ location: 'nav_mobile' }}
                      className="ml-auto h-11 rounded-full px-4 text-[12px]"
                    >
                      Book a call
                    </CtaLink>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
