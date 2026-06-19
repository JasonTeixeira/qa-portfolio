'use client'

import { useEffect, useState } from 'react'

type TocItem = { id: string; label: string }

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'section'
  )
}

/**
 * Sticky scroll-spy contents nav for the long case-study read. It discovers the
 * rendered sections from the DOM (so it stays correct across the shared
 * case-study template, where several sections are conditional), assigns anchor
 * ids, and highlights the section currently in view. Desktop sidebar only —
 * matches the existing sticky aside. Native anchors keep it reduced-motion safe.
 */
export function CaseStudyToc() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const root = document.querySelector('[data-cs-main]')
    if (!root) return

    const all = Array.from(root.querySelectorAll('section'))
    // Only top-level sections (skip any <section> nested inside a child component).
    const topLevel = all.filter((s) => !all.some((o) => o !== s && o.contains(s)))

    const seen = new Set<string>()
    const collected: TocItem[] = []
    for (const section of topLevel) {
      const heading = section.querySelector('h2, h3')
      const label = heading?.textContent?.trim()
      if (!label) continue
      let id = section.id || slugify(label)
      while (seen.has(id)) id = `${id}-x`
      seen.add(id)
      if (!section.id) section.id = id
      section.style.scrollMarginTop = '96px'
      collected.push({ id, label })
    }

    setItems(collected)
    if (collected.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id)
      },
      { rootMargin: '-18% 0px -72% 0px', threshold: 0 },
    )
    for (const { id } of collected) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  // Below ~3 sections a contents nav is noise.
  if (items.length < 3) return null

  return (
    <nav
      aria-label="Case study contents"
      className="border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5"
    >
      <p className="mb-4 text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
        contents
      </p>
      <ol className="space-y-0.5">
        {items.map((item, i) => {
          const active = activeId === item.id
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                className={`group flex items-center gap-3 border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                  active
                    ? 'border-[var(--sage-accent)] text-[var(--sage-ink)]'
                    : 'border-transparent text-[var(--sage-ink-faint)] hover:text-[var(--sage-ink-muted)]'
                }`}
              >
                <span className="text-[10px] tabular-nums opacity-70 [font-family:var(--font-mono),ui-monospace,monospace]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="leading-snug">{item.label}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
