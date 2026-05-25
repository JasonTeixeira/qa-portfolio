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
  cyan: '#0ED3CF',
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
        description: '20+ productized engagements',
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
            <div className="sage-scanlines relative overflow-hidden rounded-xl border border-[#0ED3CF]/40 bg-[#0C0C0E] shadow-[0_0_0_1px_rgba(14,211,207,0.08),0_28px_60px_-20px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(14,211,207,0.25)]">
              {/* Chrome bar */}
              <div className="flex items-center gap-2 border-b border-[#1F1E1B] bg-[#0A0A0B] px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E85D3A]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E5C341]" aria-hidden />
                <span className="h-2.5 w-2.5 rounded-full bg-[#A8C633]" aria-hidden />
                <span className="ml-2 truncate text-[11px] font-medium text-[#78716C] [font-family:var(--font-mono),ui-monospace,monospace]">
                  ~/sage — sageshell — {flatOrdered.length} cmd{flatOrdered.length === 1 ? '' : 's'}
                </span>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#A8C633] [font-family:var(--font-mono),ui-monospace,monospace]">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#A8C633]"
                    style={{ boxShadow: '0 0 8px #A8C633' }}
                    aria-hidden
                  />
                  online
                </span>
              </div>

              {/* Prompt + input */}
              <div className="flex items-center gap-2 border-b border-[#1F1E1B] px-4 py-3 [font-family:var(--font-mono),ui-monospace,monospace]">
                <span aria-hidden className="select-none text-sm">
                  <span className="text-[#A8C633]">sage@ideas</span>
                  <span className="text-[#78716C]">:</span>
                  <span className="text-[#0ED3CF]">~</span>
                  <span className="text-[#78716C]">$ </span>
                </span>
                <input
                  type="text"
                  placeholder="type a verb… book, case fintech, view source"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#F4F2EF] placeholder:text-[#5B5751] outline-none"
                  autoFocus
                  aria-label="Search commands"
                />
                {search ? (
                  <button
                    onClick={() => setSearch('')}
                    className="text-[#5B5751] transition-colors hover:text-[#F4F2EF]"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <kbd className="hidden items-center gap-0.5 rounded border border-[#2A2826] bg-[#15141A] px-1.5 py-0.5 text-[10px] text-[#78716C] sm:flex">
                    {isMac ? <Command className="h-3 w-3" /> : 'Ctrl'}
                    <span>K</span>
                  </kbd>
                )}
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[58vh] overflow-y-auto p-2">
                {flatOrdered.length === 0 ? (
                  <div className="px-3 py-10 text-center [font-family:var(--font-mono),ui-monospace,monospace] text-sm text-[#78716C]">
                    <span className="text-[#E85D3A]">command not found:</span>{' '}
                    <span className="text-[#F4F2EF]">{search}</span>
                    <div className="mt-2 text-xs text-[#5B5751]">try `book`, `work`, or `references`</div>
                  </div>
                ) : (
                  (Object.keys(GROUP_LABELS) as Array<CommandItem['group']>).map((group) => {
                    const items = grouped[group]
                    if (items.length === 0) return null
                    return (
                      <div key={group} className="mb-2 last:mb-0">
                        <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.18em] text-[#5B5751] [font-family:var(--font-mono),ui-monospace,monospace]">
                          {GROUP_LABELS[group]}
                        </div>
                        {items.map((command) => {
                          renderIdx += 1
                          const i = renderIdx
                          const isActive = selectedIndex === i
                          const toneHex = command.tone ? TONE_TO_HEX[command.tone] : '#0ED3CF'
                          return (
                            <button
                              key={command.id}
                              data-cmd-index={i}
                              onClick={command.action}
                              onMouseEnter={() => setSelectedIndex(i)}
                              className={cn(
                                'group/cmd relative w-full rounded-md px-3 py-2 text-left transition-colors',
                                isActive ? 'bg-[#15141A]' : 'hover:bg-[#15141A]/60',
                              )}
                            >
                              {isActive ? (
                                <span
                                  aria-hidden
                                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full"
                                  style={{ backgroundColor: toneHex, boxShadow: `0 0 8px ${toneHex}` }}
                                />
                              ) : null}
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors',
                                    isActive ? 'border-transparent' : 'border-[#2A2826] bg-[#0F0E11]',
                                  )}
                                  style={
                                    isActive
                                      ? {
                                          backgroundColor: `${toneHex}22`,
                                          borderColor: `${toneHex}55`,
                                          color: toneHex,
                                        }
                                      : { color: '#A8A29E' }
                                  }
                                >
                                  {command.icon}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 text-sm [font-family:var(--font-mono),ui-monospace,monospace]">
                                    <span
                                      className="font-medium"
                                      style={{ color: isActive ? toneHex : '#F4F2EF' }}
                                    >
                                      {command.verb}
                                    </span>
                                    <span className="text-[#3D3A37]">·</span>
                                    <span className="truncate text-xs text-[#A8A29E]">
                                      {command.label}
                                    </span>
                                  </div>
                                  {command.description ? (
                                    <div className="mt-0.5 truncate text-xs text-[#78716C]">
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
              <div className="flex items-center justify-between gap-3 border-t border-[#1F1E1B] bg-[#0A0A0B] px-4 py-2.5 text-[11px] text-[#78716C] [font-family:var(--font-mono),ui-monospace,monospace]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-[#2A2826] bg-[#15141A] px-1.5 py-0.5 text-[10px] text-[#A8A29E]">
                      ↑↓
                    </kbd>
                    nav
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-[#2A2826] bg-[#15141A] px-1.5 py-0.5 text-[10px] text-[#A8A29E]">
                      ↵
                    </kbd>
                    exec
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-[#2A2826] bg-[#15141A] px-1.5 py-0.5 text-[10px] text-[#A8A29E]">
                      esc
                    </kbd>
                    quit
                  </span>
                </div>
                <span className="hidden items-center gap-1.5 text-[#5B5751] sm:flex">
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
      className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 text-sm text-[#78716C] bg-[#0F0E11] border border-[#2A2826] rounded-lg hover:border-[#0ED3CF]/40 hover:text-[#F4F2EF] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]"
      aria-label="Open command palette"
    >
      <Search className="h-3.5 w-3.5" />
      <span>search</span>
      <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-[#15141A] border border-[#2A2826] rounded">
        {isMac ? <Command className="h-3 w-3" /> : 'Ctrl'}
        <span>K</span>
      </kbd>
    </button>
  )
}
