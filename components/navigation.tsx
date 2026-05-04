'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Github, Linkedin, LogIn, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { CommandPaletteHint } from '@/components/command-palette'
import { cn } from '@/lib/utils'

const primaryLinks: { href: string; label: string; badge?: string }[] = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/services#cat-ai-flagship', label: 'AI Agents', badge: 'FLAGSHIP' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/blog', label: 'Insights' },
]

const mobileExtraLinks: { href: string; label: string; badge?: string }[] = [
  { href: '/pov', label: 'POV' },
  { href: '/capabilities', label: 'Capabilities' },
  { href: '/industries', label: 'Industries' },
  { href: '/lab', label: 'Lab' },
  { href: '/process', label: 'Process' },
  { href: '/trust', label: 'Trust' },
  { href: '/studio', label: 'Studio' },
  { href: '/founder', label: 'Founder' },
  { href: '/contact', label: 'Contact' },
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A] shadow-lg shadow-black/10'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[#FAFAFA] hover:text-[#06B6D4] transition-colors relative group flex items-center gap-2"
            aria-label="Sage Ideas — Home"
          >
            <span className="relative z-10">SAGE IDEAS</span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-[0.18em] text-[#71717A] border border-[#27272A] rounded px-1.5 py-0.5">
              Studio
            </span>
          </Link>

          {/* Desktop primary nav */}
          <div className="hidden lg:flex items-center gap-1">
            {primaryLinks.map((link) => {
              const cleanHref = link.href.split('#')[0]
              const isActive =
                pathname === cleanHref ||
                (cleanHref !== '/' && pathname.startsWith(cleanHref + '/'))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm transition-colors rounded-lg inline-flex items-center gap-1.5',
                    isActive
                      ? 'text-[#06B6D4]'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
                  )}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                      {link.badge}
                    </span>
                  )}
                  {isActive && !link.href.includes('#') && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#06B6D4]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3">
            <CommandPaletteHint />
            <Link
              href="/founder"
              className="text-xs text-[#71717A] hover:text-[#FAFAFA] transition-colors px-2"
            >
              Founder
            </Link>
            <Link
              href="https://github.com/JasonTeixeira"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
            >
              <Github className="w-4 h-4" />
            </Link>
            <SignedOut>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Client Login
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
              >
                <Link href="/portal/home">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Portal
                </Link>
              </Button>
            </SignedIn>
            <Button
              asChild
              size="sm"
              className="bg-[#06B6D4] hover:bg-[#0891B2] text-[#09090B] font-medium"
            >
              <Link href="/book">Book a Call</Link>
            </Button>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: { avatarBox: 'w-8 h-8 ring-1 ring-[#3F3F46]' },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-[#FAFAFA] hover:bg-[#18181B] rounded-lg transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden bg-[#09090B] border-t border-[#27272A]"
            >
              <div className="py-4 px-2 space-y-1">
                {[...primaryLinks, ...mobileExtraLinks].map((link) => {
                  const isActive = pathname === link.href
                  const badge = 'badge' in link ? link.badge : undefined
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center justify-between gap-2 px-4 py-3 text-sm rounded-lg transition-colors',
                        isActive
                          ? 'text-[#06B6D4] bg-[#18181B]'
                          : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
                      )}
                    >
                      <span>{link.label}</span>
                      {badge && (
                        <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                          {badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
                <div className="pt-3 border-t border-[#27272A] mt-3 flex items-center gap-3 px-2">
                  <Link
                    href="https://github.com/JasonTeixeira"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA]"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </Link>
                  <Link
                    href="https://linkedin.com/in/jason-teixeira"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA]"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </Link>
                  <SignedOut>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
                    >
                      <Link href="/login">
                        <LogIn className="h-4 w-4 mr-1" />
                        Login
                      </Link>
                    </Button>
                  </SignedOut>
                  <SignedIn>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
                    >
                      <Link href="/portal/home">
                        <LayoutDashboard className="h-4 w-4 mr-1" />
                        Portal
                      </Link>
                    </Button>
                  </SignedIn>
                  <Button
                    asChild
                    size="sm"
                    className="ml-auto bg-[#06B6D4] hover:bg-[#0891B2] text-[#09090B] font-medium"
                  >
                    <Link href="/book">Book a Call</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
