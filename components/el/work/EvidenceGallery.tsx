import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { RegistrationTicks } from '@/components/el'

export type EvidenceItem = {
  src: string
  caption: string
  kind: 'diagram' | 'screenshot' | 'terminal' | 'dashboard' | 'report'
  aspect?: 'video' | 'square' | 'wide' | 'portrait'
  label?: string
}

const ASPECT_CLASS: Record<NonNullable<EvidenceItem['aspect']>, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  wide: 'aspect-[16/7]',
  portrait: 'aspect-[3/4]',
}

const KIND_LABEL: Record<EvidenceItem['kind'], string> = {
  diagram: 'architecture',
  screenshot: 'screenshot',
  terminal: 'terminal',
  dashboard: 'dashboard',
  report: 'report',
}

interface EvidenceGalleryProps {
  items: EvidenceItem[]
  columns?: 1 | 2
  className?: string
}

/**
 * EvidenceGallery — Engineered Luxury proof strip. Hairline-framed figures on
 * the surface ramp with mono kind/label chrome and registration ticks. The
 * caption is the deliverable; restrained, institutional, no colored accents
 * per kind. Server component — entrance handled by the parent Reveal.
 */
export function EvidenceGallery({ items, columns = 2, className }: EvidenceGalleryProps) {
  if (!items || items.length === 0) return null

  const colClass = columns === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'

  return (
    <div className={cn('grid gap-4', colClass, className)}>
      {items.map((item, i) => {
        const aspect = item.aspect ?? (item.kind === 'diagram' ? 'wide' : 'video')
        return (
          <figure
            key={item.src + i}
            className="group relative rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] transition-colors hover:border-[var(--sage-border-hover)]"
          >
            <RegistrationTicks />
            {/* Chrome */}
            <div className="flex items-center justify-between border-b border-[var(--sage-border)] px-4 py-3">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]">
                {KIND_LABEL[item.kind]}
              </span>
              {item.label && (
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
                  {item.label}
                </span>
              )}
            </div>
            <div className={cn('relative overflow-hidden bg-[var(--sage-bg)]', ASPECT_CLASS[aspect])}>
              <Image
                src={item.src}
                alt={item.caption}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain transition-transform duration-700 group-hover:scale-[1.015]"
              />
            </div>
            <figcaption className="border-t border-[var(--sage-border)] px-4 py-4 text-sm leading-[1.6] text-[var(--sage-ink-muted)]">
              {item.caption}
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}
