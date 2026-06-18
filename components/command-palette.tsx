'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Home,
  User,
  Briefcase,
  FolderKanban,
  FileText,
  Mail,
  FileDown,
  Code2,
  Rocket,
  BookOpen,
  X,
  Command,
  Phone,
  ExternalLink,
  Github,
  Linkedin,
  Sparkles,
  ArrowRight,
  Cpu,
  CircuitBoard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  /** Terminal-style verb the user types/sees, e.g. "book", "case <slug>". */
  verb: string
  /** Short human label, used as secondary description. */
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
  /** Logical grouping. */
  group: 'navigate' | 'case-studies' | 'services' | 'connect' | 'system'
  /** Optional tone for the icon chip. */
  tone?: 'cyan' | 'coral' | 'lime' | 'magenta'
}

const GROUP_LABELS: Record<CommandItem['group'], string> = {
  navigate: '// navigate',
  'case-studies': '// case studies',
  services: '// services',
  connect: '// connect',
  system: '// system',
}

const TONE_TO_HEX: Record<NonNullable<CommandItem['tone']>, string> = {
  cyan: '#3D5AFE',
  coral: '#E85D3A',
  lime: '#A8C633',
  magenta: '#C7236E',
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isMac, setIsMac] = useState(true)
  const listRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    setIsMac(
      typeof navigator !== 'undefined' &&
        navigator.platform.toUpperCase().indexOf('MAC') >= 0,
    )
  }, [])

  const navigate = useCallback(
    (path: string) => {
      router.push(path)
      setIsOpen(false)
      setSearch('')
    },
    [router],
  )

  const openExternal = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    setIsOpen(false)
    setSearch('')
  }, [])

  const commands: CommandItem[] = useMemo(
    () => [
      // ── navigate ────────────────────────────────────────────────
      {
        id: 'home',
        verb: 'cd ~',
        label: 'Home',
        description: 'Return to root',
        icon: <Home className="h-4 w-4" />,
        action: () => navigate('/'),
        keywords: ['homepage', 'main', 'start', 'index'],
        group: 'navigate',
        tone: 'cyan',
      },
      {
        id: 'work',
        verb: 'ls work/',
        label: 'Work',
        description: 'Case studies and receipts',
        icon: <FolderKanban className="h-4 w-4" />,
        action: () => navigate('/work'),
        keywords: ['portfolio', 'projects', 'case studies', 'evidence'],
        group: 'navigate',
        tone: 'cyan',
      },
      {
        id: 'services',
        verb: 'ls services/',
        label: 'Services',
        description: 'Productized engagements, fixed scope',
        icon: <Briefcase className="h-4 w-4" />,
        action: () => navigate('/services'),
        keywords: ['consulting', 'engagements', 'offerings'],
        group: 'navigate',
        tone: 'cyan',
      },
      {
        id: 'pricing',
        verb: 'cat pricing.md',
        label: 'Pricing',
        description: 'Productized tiers and care retainers',
        icon: <FileDown className="h-4 w-4" />,
        action: () => navigate('/pricing'),
        keywords: ['pricing', 'tiers', 'cost', 'rates', 'price'],
        group: 'navigate',
        tone: 'cyan',
      },
      {
        id: 'lab',
        verb: 'cd lab/',
        label: 'Lab',
        description: 'Experiments and tools',
        icon: <Sparkles className="h-4 w-4" />,
        action: () => navigate('/lab'),
        keywords: ['lab', 'experiments', 'demos'],
        group: 'navigate',
        tone: 'magenta',
      },
      {
        id: 'engineering-os',
        verb: 'cat engineering-os',
        label: 'Engineering OS',
        description: 'Public proof of the internal resource factory',
        icon: <CircuitBoard className="h-4 w-4" />,
        action: () => navigate('/engineering-os'),
        keywords: ['engineering os', 'resource factory', 'proof', 'registry', 'qa'],
        group: 'navigate',
        tone: 'lime',
      },
      {
        id: 'about',
        verb: 'whoami',
        label: 'About',
        description: 'Bio, background, capabilities',
        icon: <User className="h-4 w-4" />,
        action: () => navigate('/about'),
        keywords: ['bio', 'background', 'story', 'about'],
        group: 'navigate',
        tone: 'cyan',
      },
      {
        id: 'pov',
        verb: 'cat manifesto.md',
        label: 'POV',
        description: 'The 30-second rollback rule and how the studio thinks',
        icon: <BookOpen className="h-4 w-4" />,
        action: () => navigate('/pov'),
        keywords: ['pov', 'opinion', 'manifesto', 'rollback', 'philosophy', 'essay'],
        group: 'navigate',
        tone: 'lime',
      },
      {
        id: 'stack',
        verb: 'cat stack.json',
        label: 'Tech Stack',
        description: 'The toolchain in production',
        icon: <Cpu className="h-4 w-4" />,
        action: () => navigate('/stack'),
        keywords: ['technologies', 'tools', 'skills', 'stack', 'platform'],
        group: 'navigate',
        tone: 'lime',
      },

      // ── case-studies ────────────────────────────────────────────
      {
        id: 'case-fintech',
        verb: 'case fintech',
        label: 'Fintech case study',
        description: 'Open the fintech engagement deep dive',
        icon: <FileText className="h-4 w-4" />,
        action: () => navigate('/services/fintech'),
        keywords: ['fintech', 'finance', 'trading', 'case'],
        group: 'case-studies',
        tone: 'coral',
      },
      {
        id: 'case-trading',
        verb: 'case trading-systems',
        label: 'Trading Systems',
        description: 'Low-latency systems and infrastructure',
        icon: <FileText className="h-4 w-4" />,
        action: () => navigate('/services/trading-systems'),
        keywords: ['trading', 'systems', 'latency', 'infra'],
        group: 'case-studies',
        tone: 'coral',
      },
      {
        id: 'case-cloud',
        verb: 'case cloud',
        label: 'Cloud Infrastructure',
        description: 'AWS · Vercel · Supabase deployments',
        icon: <FileText className="h-4 w-4" />,
        action: () => navigate('/services/cloud-infrastructure'),
        keywords: ['cloud', 'aws', 'infra', 'deploy'],
        group: 'case-studies',
        tone: 'coral',
      },
      {
        id: 'case-ai',
        verb: 'case ai-development',
        label: 'AI Development',
        description: 'Agents, voice, automation',
        icon: <FileText className="h-4 w-4" />,
        action: () => navigate('/services/ai-development'),
        keywords: ['ai', 'agents', 'automation', 'gpt', 'llm'],
        group: 'case-studies',
        tone: 'coral',
      },

      // ── services ────────────────────────────────────────────────
      {
        id: 'svc-ai-impl',
        verb: 'engage ai-implementation',
        label: 'AI Implementation Consulting',
        description: 'From $1,000 · 2 weeks · Audit',
        icon: <Sparkles className="h-4 w-4" />,
        action: () => navigate('/services/ai-implementation-consulting'),
        keywords: ['ai', 'implementation', 'audit', 'consulting'],
        group: 'services',
        tone: 'magenta',
      },
      {
        id: 'svc-ai-agent',
        verb: 'engage ai-agent',
        label: 'AI Agent Development',
        description: 'From $2,600 · 4 weeks · Build',
        icon: <Sparkles className="h-4 w-4" />,
        action: () => navigate('/services/ai-agent-development'),
        keywords: ['agent', 'ai', 'build', 'automation'],
        group: 'services',
        tone: 'magenta',
      },
      {
        id: 'svc-site-care',
        verb: 'engage site-care',
        label: 'Site Care',
        description: 'Ongoing site reliability + updates',
        icon: <Briefcase className="h-4 w-4" />,
        action: () => navigate('/services/site-care'),
        keywords: ['care', 'retainer', 'maintenance', 'site'],
        group: 'services',
        tone: 'magenta',
      },
      {
        id: 'svc-starter',
        verb: 'engage site-starter',
        label: 'Site Starter',
        description: 'Marketing site shipped fast',
        icon: <Rocket className="h-4 w-4" />,
        action: () => navigate('/services/site-starter'),
        keywords: ['starter', 'marketing', 'site', 'launch'],
        group: 'services',
        tone: 'magenta',
      },

      // ── connect ─────────────────────────────────────────────────
      {
        id: 'book',
        verb: 'book',
        label: 'Book an intro call',
        description: 'Schedule a 20-min discovery',
        icon: <Phone className="h-4 w-4" />,
        action: () => navigate('/book'),
        keywords: ['call', 'book', 'intro', 'schedule', 'meeting'],
        group: 'connect',
        tone: 'lime',
      },
      {
        id: 'contact',
        verb: 'mail',
        label: 'Contact',
        description: 'Send a message',
        icon: <Mail className="h-4 w-4" />,
        action: () => navigate('/contact'),
        keywords: ['email', 'message', 'contact', 'reach'],
        group: 'connect',
        tone: 'lime',
      },
      {
        id: 'references',
        verb: 'references',
        label: 'References',
        description: 'Callable client references',
        icon: <User className="h-4 w-4" />,
        action: () => navigate('/references'),
        keywords: ['references', 'clients', 'testimonials', 'callable'],
        group: 'connect',
        tone: 'lime',
      },

      // ── system ──────────────────────────────────────────────────
      {
        id: 'view-source',
        verb: 'view source',
        label: 'View source on GitHub',
        description: 'Open this portfolio on GitHub',
        icon: <Github className="h-4 w-4" />,
        action: () => openExternal('https://github.com/JasonTeixeira/sageideas.dev'),
        keywords: ['source', 'github', 'code', 'repo'],
        group: 'system',
        tone: 'cyan',
      },
      {
        id: 'linkedin',
        verb: 'linkedin',
        label: 'LinkedIn',
        description: 'Open the LinkedIn profile',
        icon: <Linkedin className="h-4 w-4" />,
        action: () => openExternal('https://www.linkedin.com/in/jasonteixeira/'),
        keywords: ['linkedin', 'social', 'profile'],
        group: 'system',
        tone: 'cyan',
      },
      {
        id: 'trust',
        verb: 'cat trust.md',
        label: 'Trust',
        description: 'Security, compliance, policies',
        icon: <Code2 className="h-4 w-4" />,
        action: () => navigate('/trust'),
        keywords: ['trust', 'security', 'compliance', 'policies'],
        group: 'system',
        tone: 'cyan',
      },
    ],
    [navigate, openExternal],
  )

  const filteredCommands = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => {
      return (
        c.verb.toLowerCase().includes(q) ||
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.keywords?.some((k) => k.toLowerCase().includes(q))
      )
    })
  }, [commands, search])

  // Group filtered commands by group, preserving order.
  const grouped = useMemo(() => {
    const groups: Record<CommandItem['group'], CommandItem[]> = {
      navigate: [],
      'case-studies': [],
      services: [],
      connect: [],
      system: [],
    }
    for (const c of filteredCommands) groups[c.group].push(c)
    return groups
  }, [filteredCommands])

  // Flat order for arrow navigation must match render order.
  const flatOrdered = useMemo(() => {
    return [
      ...grouped.navigate,
      ...grouped['case-studies'],
      ...grouped.services,
      ...grouped.connect,
      ...grouped.system,
    ]
  }, [grouped])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < flatOrdered.length - 1 ? prev + 1 : 0,
        )
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : flatOrdered.length - 1,
        )
      }
      if (e.key === 'Enter' && flatOrdered[selectedIndex]) {
        e.preventDefault()
        flatOrdered[selectedIndex].action()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, flatOrdered, selectedIndex])

  // Reset selection when search changes.
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Keep the active item in view.
  useEffect(() => {
    if (!isOpen) return
    const list = listRef.current
    if (!list) return
    const active = list.querySelector<HTMLButtonElement>(`[data-cmd-index="${selectedIndex}"]`)
    if (active) active.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex, isOpen])

  let renderIdx = -1

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="command-palette-backdrop fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setIsOpen(false)
              setSearch('')
            }}
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-label="Command palette"
            aria-modal="true"
            className="fixed top-[14%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
          >
            {/* EL surface: near-black bg, hairline border, no neon glow */}
            <div className="relative overflow-hidden rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-bg)] shadow-[0_28px_60px_-20px_rgba(0,0,0,0.92),0_0_0_1px_rgba(255,255,255,0.03)]">
              {/* Chrome bar — EL instrument header */}
              <div className="flex items-center gap-2 border-b border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-4 py-2.5 [font-family:var(--font-mono),ui-monospace,monospace]">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-[#3D5AFE] [animation:status-dot_2.4s_ease-in-out_infinite] motion-reduce:animate-none" aria-hidden />
                  <span className="absolute inset-0 rounded-full bg-[#3D5AFE]" aria-hidden />
                </span>
                <span className="ml-1 truncate text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)]">
                  sageshell&nbsp;·&nbsp;{flatOrdered.length}&nbsp;cmd{flatOrdered.length === 1 ? '' : 's'}
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-[#3D5AFE]/80">
                  online
                </span>
              </div>

              {/* Prompt + input */}
              <div className="flex items-center gap-2 border-b border-[var(--sage-border)] px-4 py-3 [font-family:var(--font-mono),ui-monospace,monospace]">
                <span aria-hidden className="select-none text-[13px]">
                  <span className="text-[var(--sage-ink-muted)]">sage@ideas</span>
                  <span className="text-[var(--sage-ink-faint)]">:</span>
                  <span className="text-[#3D5AFE]">~</span>
                  <span className="text-[var(--sage-ink-faint)]">$ </span>
                </span>
                <input
                  type="text"
                  placeholder="type a verb… book, case fintech, view source"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] outline-none"
                  autoFocus
                  aria-label="Search commands"
                />
                {search ? (
                  <button
                    onClick={() => setSearch('')}
                    className="text-[var(--sage-ink-faint)] transition-colors hover:text-[var(--sage-ink)]"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <kbd className="hidden items-center gap-0.5 rounded-[2px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--sage-ink-faint)] sm:flex">
                    {isMac ? <Command className="h-3 w-3" /> : 'Ctrl'}
                    <span>K</span>
                  </kbd>
                )}
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[58vh] overflow-y-auto p-2">
                {flatOrdered.length === 0 ? (
                  <div className="px-3 py-10 text-center [font-family:var(--font-mono),ui-monospace,monospace] text-[13px] text-[var(--sage-ink-muted)]">
                    <span className="text-[var(--sage-coral)]">command not found:</span>{' '}
                    <span className="text-[var(--sage-ink)]">{search}</span>
                    <div className="mt-2 text-[11px] text-[var(--sage-ink-faint)]">try `book`, `work`, or `references`</div>
                  </div>
                ) : (
                  (Object.keys(GROUP_LABELS) as Array<CommandItem['group']>).map((group) => {
                    const items = grouped[group]
                    if (items.length === 0) return null
                    return (
                      <div key={group} className="mb-2 last:mb-0">
                        <div className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
                          {GROUP_LABELS[group]}
                        </div>
                        {items.map((command) => {
                          renderIdx += 1
                          const i = renderIdx
                          const isActive = selectedIndex === i
                          const toneHex = command.tone ? TONE_TO_HEX[command.tone] : '#3D5AFE'
                          return (
                            <button
                              key={command.id}
                              data-cmd-index={i}
                              onClick={command.action}
                              onMouseEnter={() => setSelectedIndex(i)}
                              className={cn(
                                'group/cmd relative w-full rounded-[2px] px-3 py-2 text-left transition-colors',
                                isActive
                                  ? 'bg-[var(--sage-surface-2)]'
                                  : 'hover:bg-[var(--sage-surface-1)]',
                              )}
                            >
                              {isActive ? (
                                <span
                                  aria-hidden
                                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full"
                                  style={{ backgroundColor: toneHex }}
                                />
                              ) : null}
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border transition-colors',
                                    isActive
                                      ? 'border-transparent'
                                      : 'border-[var(--sage-border)] bg-[var(--sage-surface-1)]',
                                  )}
                                  style={
                                    isActive
                                      ? {
                                          backgroundColor: `${toneHex}1a`,
                                          borderColor: `${toneHex}40`,
                                          color: toneHex,
                                        }
                                      : { color: 'var(--sage-ink-muted)' }
                                  }
                                >
                                  {command.icon}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 text-[13px] [font-family:var(--font-mono),ui-monospace,monospace]">
                                    <span
                                      className="font-medium"
                                      style={{ color: isActive ? toneHex : 'var(--sage-ink)' }}
                                    >
                                      {command.verb}
                                    </span>
                                    <span className="text-[var(--sage-border-hover)]">·</span>
                                    <span className="truncate text-[11px] text-[var(--sage-ink-muted)]">
                                      {command.label}
                                    </span>
                                  </div>
                                  {command.description ? (
                                    <div className="mt-0.5 truncate text-[11px] text-[var(--sage-ink-faint)]">
                                      {command.description}
                                    </div>
                                  ) : null}
                                </div>
                                {isActive ? (
                                  <ArrowRight
                                    className="h-3.5 w-3.5"
                                    style={{ color: toneHex }}
                                    aria-hidden
                                  />
                                ) : null}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-4 py-2.5 text-[11px] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded-[2px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--sage-ink-muted)]">
                      ↑↓
                    </kbd>
                    nav
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded-[2px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--sage-ink-muted)]">
                      ↵
                    </kbd>
                    exec
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded-[2px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--sage-ink-muted)]">
                      esc
                    </kbd>
                    quit
                  </span>
                </div>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <ExternalLink className="h-3 w-3" />
                  enter to execute
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Keyboard shortcut hint — used by the marketing nav.
export function CommandPaletteHint() {
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  return (
    <button
      onClick={() => {
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: true,
          ctrlKey: true,
          bubbles: true,
        })
        document.dispatchEvent(event)
      }}
      className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 text-[12px] text-[var(--sage-ink-faint)] bg-[var(--sage-surface-1)] border border-[var(--sage-border)] rounded-[3px] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink-muted)] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]"
      aria-label="Open command palette"
    >
      <Search className="h-3.5 w-3.5" />
      <span>search</span>
      <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-[var(--sage-surface-2)] border border-[var(--sage-border-strong)] rounded-[2px] text-[var(--sage-ink-faint)]">
        {isMac ? <Command className="h-3 w-3" /> : 'Ctrl'}
        <span>K</span>
      </kbd>
    </button>
  )
}
