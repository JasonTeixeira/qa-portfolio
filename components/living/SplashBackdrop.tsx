'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { DEFAULT_BACKDROP, visitBackdrop } from '@/components/motion/visitBackdrop'

/**
 * SplashBackdrop — the cinematic splash image. Renders the SSR-stable default
 * first (no hydration mismatch), then swaps to the shared per-visit backdrop on
 * mount. The swap lands in the splash's dark brightness window, so it's unseen,
 * and it matches the hero's pick so the curtain-rise reveal is a clean match cut.
 */
export function SplashBackdrop({ className }: { className?: string }) {
  const [src, setSrc] = useState(DEFAULT_BACKDROP)

  useEffect(() => {
    setSrc(visitBackdrop())
  }, [])

  return <Image src={src} alt="" fill priority sizes="100vw" className={className} />
}
