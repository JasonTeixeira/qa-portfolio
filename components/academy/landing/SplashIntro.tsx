'use client'

import { useEffect, useState } from 'react'

/**
 * First-land brand moment: a sub-2s full-screen reveal that dissolves into the
 * homepage and hands off to the hero's cinematic entrance. Guards:
 *  - once per session (sessionStorage) — never nags returning visitors,
 *  - prefers-reduced-motion → skipped entirely (content is instant),
 *  - skippable (click / any key / Escape),
 *  - the DOM content underneath is always present, so SEO/crawlers are unaffected.
 * While it plays it sets html.sage-splash-active so the hero delays its reveal
 * until the splash begins dissolving (see the injected CSS below).
 */
const SESSION_KEY = 'sage-splash-v1'
const TOTAL_MS = 2100

export function SplashIntro() {
  const [phase, setPhase] = useState<'hidden' | 'playing' | 'out'>('hidden')

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let seen = false
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      seen = false
    }
    if (reduce || seen) return

    document.documentElement.classList.add('sage-splash-active')
    setPhase('playing')
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* private mode — still play this once */
    }

    const outAt = window.setTimeout(() => setPhase('out'), TOTAL_MS - 550)
    const doneAt = window.setTimeout(() => {
      setPhase('hidden')
      document.documentElement.classList.remove('sage-splash-active')
    }, TOTAL_MS)

    const skip = () => {
      window.clearTimeout(outAt)
      setPhase('out')
      window.setTimeout(() => {
        setPhase('hidden')
        document.documentElement.classList.remove('sage-splash-active')
      }, 480)
    }
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })

    return () => {
      window.clearTimeout(outAt)
      window.clearTimeout(doneAt)
      document.documentElement.classList.remove('sage-splash-active')
    }
  }, [])

  return (
    <>
      {/* Hero cinematic-entrance CSS. Applies to elements the hero marks with
          [data-reveal]; delayed while the splash is active so they animate in as
          it dissolves. Reduced-motion users get instant, un-animated content. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
@media (prefers-reduced-motion: no-preference) {
  [data-reveal] { opacity: 0; animation: sageReveal 0.9s cubic-bezier(0.16,1,0.3,1) both; animation-delay: calc(var(--reveal-i, 0) * 90ms + 120ms); }
  html.sage-splash-active [data-reveal] { animation-delay: calc(var(--reveal-i, 0) * 90ms + 1500ms); }
  @keyframes sageReveal { from { opacity: 0; transform: translateY(16px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
}
@keyframes sageSplashMark { 0% { opacity: 0; transform: scale(0.6) rotate(-8deg); } 55% { opacity: 1; transform: scale(1.06) rotate(0deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }
@keyframes sageSplashWord { from { opacity: 0; transform: translateY(10px); letter-spacing: 0.4em; } to { opacity: 1; transform: none; letter-spacing: 0.02em; } }
@keyframes sageSplashLine { from { opacity: 0; } to { opacity: 0.9; } }
`,
        }}
      />
      {phase !== 'hidden' && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'grid',
            placeItems: 'center',
            background:
              'radial-gradient(120% 90% at 50% 40%, #101018 0%, #0B0B0E 60%), #0B0B0E',
            opacity: phase === 'out' ? 0 : 1,
            transform: phase === 'out' ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity 520ms ease, transform 620ms cubic-bezier(0.16,1,0.3,1)',
            pointerEvents: phase === 'out' ? 'none' : 'auto',
          }}
        >
          {/* atmospheric wash */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(50% 40% at 50% 45%, rgba(61,90,254,0.18) 0%, transparent 70%)',
              opacity: phase === 'out' ? 0 : 1,
              transition: 'opacity 520ms ease',
            }}
          />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
            <span
              style={{
                display: 'grid',
                placeItems: 'center',
                width: 76,
                height: 76,
                borderRadius: 20,
                background: '#3D5AFE',
                color: '#fff',
                fontSize: 34,
                boxShadow: '0 0 60px rgba(61,90,254,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
                animation: 'sageSplashMark 0.9s cubic-bezier(0.16,1,0.3,1) both',
              }}
            >
              ◆
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif), Georgia, serif',
                fontSize: 'clamp(30px, 5vw, 46px)',
                fontWeight: 600,
                color: '#F2EFE9',
                letterSpacing: '0.02em',
                animation: 'sageSplashWord 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both',
              }}
            >
              Sage Academy
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: '#8FA0FF',
                animation: 'sageSplashLine 0.6s ease 0.7s both',
              }}
            >
              Judgment · proven
            </span>
          </div>
        </div>
      )}
    </>
  )
}
