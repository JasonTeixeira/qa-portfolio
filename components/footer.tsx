import Link from 'next/link'
import { Mail, Linkedin, Github } from 'lucide-react'
import { Hairline, MonoLabel } from '@/components/el'

// ────────────────────────────────────────────────────────────────────────────
// Link data — same content as before, EL presentation
// ────────────────────────────────────────────────────────────────────────────

const servicesBuild = [
  { href: '/services/build', label: 'Build' },
  { href: '/services/ship', label: 'Ship' },
  { href: '/services/app-development', label: 'App Development' },
  { href: '/services/automate', label: 'Automate' },
  { href: '/services/brand-sprint', label: 'Brand Sprint' },
]

const servicesGrow = [
  { href: '/services/audit', label: 'Sage Audit' },
  { href: '/services/seo-sprint', label: 'SEO Sprint' },
  { href: '/services/content-engine', label: 'Content Engine' },
  { href: '/services/scale', label: 'Scale' },
]

const servicesOperate = [
  { href: '/services/operate', label: 'Operate' },
  { href: '/services/site-care', label: 'Site Care' },
  { href: '/services/brand-care', label: 'Brand Care' },
  { href: '/services/content-care', label: 'Content Care' },
]

const studio = [
  { href: '/services', label: 'All Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/work', label: 'Case Studies' },
  { href: '/lab', label: 'The Lab' },
  { href: '/engineering-os', label: 'Engineering OS' },
  { href: '/blog', label: 'Insights' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/studio', label: 'The Studio' },
  { href: '/founder', label: 'Founder' },
  { href: '/process', label: 'Process' },
  { href: '/trust', label: 'Trust' },
  { href: '/contact', label: 'Contact' },
]

const legal = [
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/cookies', label: 'Cookies' },
  { href: '/legal/msa', label: 'MSA' },
  { href: '/legal/nda', label: 'NDA' },
  { href: '/legal/sow-template', label: 'SOW' },
]

// ────────────────────────────────────────────────────────────────────────────
// Footer column — EL presentation
// ────────────────────────────────────────────────────────────────────────────

function FooterColumn({
  title,
  links,
  className = '',
}: {
  title: string
  links: { href: string; label: string }[]
  className?: string
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <MonoLabel tone="faint" as="p" className="text-[10px]">
        // {title}
      </MonoLabel>
      <Hairline />
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center min-h-[32px] text-[13px] text-[var(--sage-ink-faint)] hover:text-[var(--sage-ink-muted)] transition-colors duration-150"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// EL Footer — server component (no 'use client')
// ────────────────────────────────────────────────────────────────────────────

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative w-full bg-[var(--sage-surface-1)] border-t border-[var(--sage-border)] overflow-hidden"
      aria-label="Site footer"
    >
      {/* Grain atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'var(--sage-grain)', backgroundSize: '160px 160px' }}
      />

      {/* Accent depth — barely-there top-right wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'var(--sage-depth-accent)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-[2.5fr_1fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-6">
            {/* Wordmark */}
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group"
              aria-label="Sage Ideas — Home"
            >
              <img src="/brand/sage-logo.png" alt="" className="h-7 w-auto" aria-hidden />
              <span className="text-[13px] uppercase tracking-[0.18em] text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace] group-hover:text-[#0ED3CF] transition-colors">
                SAGE IDEAS
              </span>
            </Link>

            {/* Hairline accent lead */}
            <Hairline accentLead />

            {/* Studio blurb */}
            <p className="text-[13px] text-[var(--sage-ink-faint)] leading-relaxed max-w-[24ch]">
              AI-native studio that builds, automates, and scales B2B businesses. We ship
              the same stack we run our own products on.
            </p>

            {/* Book CTA — ghost variant */}
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-5 h-10 rounded-[3px] border border-[var(--sage-border-strong)] text-[12px] uppercase tracking-[0.10em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)] transition-colors duration-200 group"
            >
              Book a strategy call
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>

            {/* Social icons */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                href="mailto:sage@sageideas.dev"
                aria-label="Email Sage Ideas"
                className="p-2 rounded-[2px] border border-[var(--sage-border)] text-[var(--sage-ink-faint)] hover:text-[#0ED3CF] hover:border-[var(--sage-border-hover)] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" aria-hidden />
              </Link>
              <Link
                href="https://linkedin.com/in/jason-teixeira"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sage Ideas on LinkedIn"
                className="p-2 rounded-[2px] border border-[var(--sage-border)] text-[var(--sage-ink-faint)] hover:text-[#0ED3CF] hover:border-[var(--sage-border-hover)] transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" aria-hidden />
              </Link>
              <Link
                href="https://github.com/JasonTeixeira"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sage Ideas on GitHub"
                className="p-2 rounded-[2px] border border-[var(--sage-border)] text-[var(--sage-ink-faint)] hover:text-[#0ED3CF] hover:border-[var(--sage-border-hover)] transition-colors"
              >
                <Github className="w-3.5 h-3.5" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Service columns */}
          <FooterColumn title="Build" links={servicesBuild} />
          <FooterColumn title="Grow" links={servicesGrow} />
          <FooterColumn title="Operate" links={servicesOperate} />
          <FooterColumn title="Studio" links={studio} />
        </div>

        {/* Bottom bar */}
        <div className="mt-16">
          <Hairline />
          <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <MonoLabel tone="faint" as="p" className="text-[11px]">
              © {year} Sage Ideas LLC · Orlando, FL
            </MonoLabel>
            <nav aria-label="Legal links">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {legal.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[11px] [font-family:var(--font-mono),ui-monospace,monospace] text-[var(--sage-ink-faint)] hover:text-[var(--sage-ink-muted)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
