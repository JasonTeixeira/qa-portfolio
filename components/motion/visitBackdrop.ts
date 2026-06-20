'use client'

/**
 * visitBackdrop — one shared cinematic backdrop per page load.
 *
 * The splash, the intent gate, and the hero all read this so they show the SAME
 * landscape within a visit (the splash -> hero match cut stays coherent), while
 * it varies across visits. The pick is memoized at module scope (one value per
 * page load, reset on a full reload) and avoids repeating the immediately
 * previous visit's image, so consecutive loads feel different.
 *
 * Drop more files into ART (target ~50) and every surface rotates through them.
 */

const ART = [
  '/art/inkwash-cliffs.png',
  '/art/sunset-pagoda.png',
]

/** SSR-stable default — components render this first, then swap on mount. */
export const DEFAULT_BACKDROP = ART[0]

const LAST_KEY = 'sage-last-bg'

let cached: string | null = null

export function visitBackdrop(): string {
  if (cached) return cached
  if (typeof window === 'undefined') return DEFAULT_BACKDROP

  let last: string | null = null
  try {
    last = window.localStorage.getItem(LAST_KEY)
  } catch {
    last = null
  }

  const pool = ART.length > 1 ? ART.filter((art) => art !== last) : ART
  const pick = pool[Math.floor(Math.random() * pool.length)]

  try {
    window.localStorage.setItem(LAST_KEY, pick)
  } catch {
    // Storage denied — still returns a valid pick, just may repeat next visit.
  }

  cached = pick
  return pick
}
