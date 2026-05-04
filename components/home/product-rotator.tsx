'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

export type RotatorItem = {
  src: string
  alt: string
  project: string
  url: string
}

interface ProductRotatorProps {
  items: RotatorItem[]
  /** ms between auto-advances; default 4000 */
  intervalMs?: number
}

export function ProductRotator({ items, intervalMs = 4000 }: ProductRotatorProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = items.length

  useEffect(() => {
    if (paused || total <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [paused, total, intervalMs])

  if (total === 0) return null
  const active = items[index]

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Browser chrome frame */}
      <div className="relative rounded-2xl overflow-hidden border border-[#27272A] bg-[#18181B] shadow-[0_24px_48px_-24px_rgba(6,182,212,0.25)]">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#0F0F12] border-b border-[#27272A]">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="w-3 h-3 rounded-full bg-[#EAB308]" />
          <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
          <div className="ml-3 flex-1 h-7 rounded-md bg-[#18181B] border border-[#27272A] flex items-center px-3">
            <span className="text-[11px] font-mono text-[#71717A] truncate">{active.url}</span>
          </div>
        </div>

        {/* Image stage */}
        <div className="relative aspect-[16/9] bg-[#0A0A0F]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.src}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Indicator dots */}
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {items.map((it, i) => (
                <button
                  key={it.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${it.project}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-6 bg-[#06B6D4]' : 'w-1.5 bg-[#3F3F46] hover:bg-[#52525B]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Currently showing label */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717A]">
          Currently showing
        </div>
        <div className="text-sm text-[#FAFAFA] font-medium truncate">{active.project}</div>
      </div>
    </div>
  )
}
