'use client'

import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { locales, localeNames, localeHrefLang, isRtl } from '@/lib/i18n/config'
import { useLocale } from './locale-provider'
import { localizeHref, canonicalPath } from '@/lib/i18n/href'

/**
 * Language switcher — links the current page to its equivalent in every locale
 * (preserves the path so the reader stays where they are). Accessible disclosure
 * menu; closes on outside click / Escape.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  const active = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const here = canonicalPath(pathname || '/')

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sage-border,rgba(255,255,255,0.14))] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-muted,#cbd0d6)] transition-colors hover:border-[var(--sage-accent,#3D5AFE)] hover:text-white"
      >
        <span aria-hidden>🌐</span>
        {active.toUpperCase()}
        <span aria-hidden className={`transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 z-50 mt-2 max-h-[60vh] w-44 overflow-auto rounded-[10px] border border-[var(--sage-border,rgba(255,255,255,0.14))] bg-[#0e0e12] p-1.5 shadow-2xl"
        >
          {locales.map((locale) => {
            const isActive = locale === active
            return (
              <li key={locale} role="option" aria-selected={isActive}>
                {/* Plain <a> = full page load on language change, so <html lang/dir>,
                    RTL, fonts, and server-rendered translations all reset correctly. */}
                <a
                  href={localizeHref(here, locale)}
                  hrefLang={localeHrefLang[locale]}
                  dir={isRtl(locale) ? 'rtl' : 'ltr'}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-[6px] px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--sage-accent,#3D5AFE)]/15 text-white'
                      : 'text-[var(--sage-ink-muted,#cbd0d6)] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{localeNames[locale]}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-60">{locale}</span>
                </a>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
