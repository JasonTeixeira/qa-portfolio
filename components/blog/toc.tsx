'use client'

import { useEffect, useState } from 'react'
import type { TocNode } from '@/lib/blog-toc'

export function Toc({ nodes }: { nodes: TocNode[] }) {
  const [activeId, setActiveId] = useState(nodes[0]?.id)

  useEffect(() => {
    if (!nodes.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible?.target.id) setActiveId(visible.target.id)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 1] },
    )

    for (const node of nodes) {
      const el = document.getElementById(node.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [nodes])

  if (!nodes.length) return null

  return (
    <nav aria-label="Article sections" className="text-[12px]">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)]">
        On this page
      </p>
      <ol className="space-y-1.5 border-l border-[var(--sage-border)] pl-3">
        {nodes.map((node) => (
          <li key={node.id}>
            <a
              href={`#${node.id}`}
              className={[
                'block leading-snug transition-colors',
                node.level === 3 ? 'pl-3 text-[var(--sage-ink-faint)]' : 'text-[var(--sage-ink-muted)]',
                activeId === node.id ? 'text-[#3D5AFE]' : 'hover:text-[var(--sage-ink)]',
              ].join(' ')}
            >
              {node.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
