'use client'

import { useEffect, useState } from 'react'
import styles from './leagues.module.css'

/** Whole-unit remaining time, clamped at zero. */
function remaining(targetMs: number, nowMs: number): { d: number; h: number; m: number; s: number; done: boolean } {
  const ms = Math.max(0, targetMs - nowMs)
  const totalSec = Math.floor(ms / 1000)
  return {
    d: Math.floor(totalSec / 86400),
    h: Math.floor((totalSec % 86400) / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
    done: ms <= 0,
  }
}

/** Compact "1d 4h 12m" label; drops leading zero units, keeps it tight under 1h. */
function label(t: ReturnType<typeof remaining>): string {
  if (t.done) return 'Resetting now'
  if (t.d > 0) return `${t.d}d ${t.h}h ${t.m}m`
  if (t.h > 0) return `${t.h}h ${t.m}m`
  if (t.m > 0) return `${t.m}m ${String(t.s).padStart(2, '0')}s`
  return `${t.s}s`
}

/**
 * Live league-reset countdown. Ticks on the real client clock and clears its
 * interval on unmount. Honors prefers-reduced-motion by not pulsing — the text
 * still updates (a static, never-updating timer would be a worse a11y outcome).
 * The reset target is a server-passed ISO timestamp; we never hardcode a date.
 */
export function LeagueCountdown({ resetAt }: { resetAt: string }) {
  const targetMs = new Date(resetAt).getTime()
  // First paint matches the server (no client clock yet) to avoid hydration drift;
  // the interval takes over on mount.
  const [nowMs, setNowMs] = useState<number>(() => targetMs)

  useEffect(() => {
    if (!Number.isFinite(targetMs)) return
    setNowMs(Date.now())
    const id = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  if (!Number.isFinite(targetMs)) return null

  const t = remaining(targetMs, nowMs)
  return (
    <span className={styles.countdown}>
      <span className={styles.countdownDot} aria-hidden="true" />
      <span className={styles.countdownLabel}>League ends in </span>
      <strong className={styles.countdownValue}>{label(t)}</strong>
    </span>
  )
}
