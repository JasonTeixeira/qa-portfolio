'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Github, Linkedin, FileDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CommandPaletteHint } from '@/components/command-palette'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/blog', label: 'Blog' },
  { href: '/platform', label: 'Platform' },
  { href: '/hire', label: 'Hire Me' },
]

const mobileExtraLinks = [
  { href: '/contact', label: 'Contact' },
  { href: '/blog', label: 'Blog' },
  { href: '/dashboard', label: 'Quality Telemetry Dashboard' },
  { href: '/artifacts', label: 'Artifacts & Evidence' },
  { href: '/stack', label: 'Tech Stack' },
  { href: '/start', label: 'Start Here' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
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
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[#FAFAFA] hover:text-[#06B6D4] transition-colors relative group"
          >
            <span className="relative z-10">SAGE IDEAS</span>
            <span className="absolute inset-0 bg-[#06B6D4]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm transition-colors rounded-lg',
                    isActive
                      ? 'text-[#06B6D4]'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
                  )}
                >
                  {link.label}
                  {isActive && (
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

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <CommandPaletteHint />
            <Link
              href="https://github.com/JasonTeixeira"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#18181B] rounded-lg transition-all"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="https://linkedin.com/in/jason-teixeira"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#18181B] rounded-lg transition-all"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent ml-2"
            >
              <Link href="/resume">
                <FileDown className="h-4 w-4 mr-2" />
                Resume
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B] rounded-lg transition-all"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-[#27272A]">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'block px-4 py-3 rounded-lg transition-colors',
                          isActive
                            ? 'text-[#06B6D4] bg-[#06B6D4]/10'
                            : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]'
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                })}
                {mobileExtraLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navLinks.length + index) * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block px-4 py-3 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B] rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 px-4 flex items-center gap-4"
                >
                  <Link
                    href="https://github.com/JasonTeixeira"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#18181B] rounded-lg transition-all"
                  >
                    <Github className="h-5 w-5" />
                  </Link>
                  <Link
                    href="https://linkedin.com/in/jason-teixeira"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#18181B] rounded-lg transition-all"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="px-4 pt-2"
                >
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
                  >
                    <Link href="/resume">
                      <FileDown className="h-4 w-4 mr-2" />
                      Resume
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
