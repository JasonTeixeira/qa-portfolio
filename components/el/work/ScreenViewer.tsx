'use client'

import * as React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { RegistrationTicks } from '@/components/el'

export type ScreenShot = {
  src: string
  alt: string
  caption?: string
}

interface ScreenViewerProps {
  screens: ScreenShot[]
}

/**
 * ScreenViewer — Engineered Luxury restyle of the product-screen carousel.
 * A hairline-framed stage on the surface ramp, mono counter + index chrome,
 * ruled thumbnail register. Keyboard + swipe navigable, AA-contrast controls.
 */
export function ScreenViewer({ screens }: ScreenViewerProps) {
  const [index, setIndex] = React.useState(0)
  const total = screens.length
  const touchStartX = React.useRef<number | null>(null)

  const goTo = React.useCallback(
    (next: number) => {
      if (total === 0) return
      setIndex(((next % total) + total) % total)
    },
    [total],
  )

  const next = React.useCallback(() => goTo(index + 1), [goTo, index])
  const prev = React.useCallback(() => goTo(index - 1), [goTo, index])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)()
    touchStartX.current = null
  }

  if (total === 0) return null
  const active = screens[index]

  return (
    <div className="w-full">
      <div
        className="relative aspect-video w-full overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Product screenshots"
      >
        <RegistrationTicks />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={active.src}
              alt={active.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 960px"
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous screen"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-bg)]/80 text-[var(--sage-ink)] backdrop-blur-sm transition-colors hover:border-[#0ED3CF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ED3CF]/60"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next screen"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-bg)]/80 text-[var(--sage-ink)] backdrop-blur-sm transition-colors hover:border-[#0ED3CF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ED3CF]/60"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute right-3 top-3 rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-bg)]/80 px-2.5 py-1 text-[10px] tabular-nums tracking-[0.18em] text-[var(--sage-ink-muted)] backdrop-blur-sm [font-family:var(--font-mono),ui-monospace,monospace]">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      </div>

      {active.caption && (
        <p className="mt-4 max-w-3xl text-sm leading-[1.6] text-[var(--sage-ink-muted)]">
          {active.caption}
        </p>
      )}

      {total > 1 && (
        <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
          {screens.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show screen ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-video w-32 shrink-0 overflow-hidden rounded-[2px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ED3CF]/60 ${
                i === index
                  ? 'border-[#0ED3CF] ring-1 ring-[#0ED3CF]/40'
                  : 'border-[var(--sage-border)] opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={s.src} alt="" aria-hidden fill sizes="128px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
