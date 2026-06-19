'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/events'

declare global {
  interface Window {
    gsap?: {
      registerPlugin: (...plugins: unknown[]) => void
      to: (target: unknown, vars: Record<string, unknown>) => unknown
      fromTo: (target: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown>) => unknown
      utils?: { toArray: (target: string) => Element[] }
    }
    ScrollTrigger?: {
      create: (vars: Record<string, unknown>) => unknown
      refresh: () => void
    }
  }
}

export function LivingSystemsMotion() {
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const narrow = window.matchMedia('(max-width: 940px)').matches
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches
    let cleanupFns: Array<() => void> = []
    let raf = 0
    let splashTracked = false
    let splashDone = false
    const splashStorageKey = 'sage_living_os_boot_seen'
    const splashEligible = (() => {
      if (reduced) return false
      try {
        return window.sessionStorage.getItem(splashStorageKey) !== 'true'
      } catch {
        return true
      }
    })()

    const trackSplash = (reason: 'timeout' | 'reduced_motion' | 'loaded' | 'library_failure' | 'skipped') => {
      if (splashTracked) return
      splashTracked = true
      trackEvent('splash_skipped', { reason })
    }

    const showEverything = (reason: 'timeout' | 'reduced_motion' | 'loaded' | 'library_failure' | 'skipped') => {
      splashDone = true
      body.classList.remove('living-intro')
      body.classList.add('living-visible')
      document.querySelectorAll('[data-living-reveal]').forEach((el) => {
        el.classList.add('is-in')
      })
      const loader = document.querySelector('[data-living-loader]')
      loader?.classList.add('is-done')
      trackSplash(reason)
    }

    if (splashEligible) {
      body.classList.add('living-intro')
    }

    const timeout = window.setTimeout(() => {
      if (!splashDone) showEverything('timeout')
    }, 4200)

    const setBootProgress = (progress: number, status: string, activeIndex: number) => {
      const bar = document.querySelector<HTMLElement>('[data-living-boot-progress]')
      const statusEl = document.querySelector<HTMLElement>('[data-living-boot-status]')
      const modules = Array.from(document.querySelectorAll<HTMLElement>('[data-living-boot-module]'))
      bar?.style.setProperty('transform', `scaleX(${progress})`)
      if (statusEl) statusEl.textContent = status
      modules.forEach((module, index) => {
        module.classList.toggle('is-live', index <= activeIndex)
      })
    }

    const playSplash = () => new Promise<'loaded' | 'skipped'>((resolve) => {
      if (!splashEligible) {
        resolve('loaded')
        return
      }

      const skip = document.querySelector<HTMLButtonElement>('[data-living-splash-skip]')
      const done = (reason: 'loaded' | 'skipped') => {
        try {
          window.sessionStorage.setItem(splashStorageKey, 'true')
        } catch {
          // Non-critical: private mode or storage-denied browsers still get a safe boot.
        }
        skip?.removeEventListener('click', onSkip)
        resolve(reason)
      }
      const onSkip = () => done('skipped')
      skip?.addEventListener('click', onSkip)
      cleanupFns.push(() => skip?.removeEventListener('click', onSkip))

      const steps: Array<[number, number, string, number]> = [
        [90, 0.22, 'Mounting studio route', 0],
        [420, 0.42, 'Loading academy path', 1],
        [780, 0.62, 'Indexing proof layer', 2],
        [1120, 0.8, 'Priming diagnostic tools', 3],
        [1520, 1, 'Opening content engine', 4],
      ]
      const timers = steps.map(([delay, progress, status, activeIndex]) =>
        window.setTimeout(() => setBootProgress(progress, status, activeIndex), delay),
      )
      const finish = window.setTimeout(() => done('loaded'), 2180)
      cleanupFns.push(() => {
        timers.forEach((timer) => window.clearTimeout(timer))
        window.clearTimeout(finish)
      })
    })

    const tickClock = () => {
      const clock = document.querySelector<HTMLElement>('[data-living-clock]')
      if (!clock) return
      clock.textContent = new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    }
    tickClock()
    const clockTimer = window.setInterval(tickClock, 15000)

    const peelHandlers = Array.from(document.querySelectorAll<HTMLElement>('[data-living-card]')).map((card) => {
      const button = card.querySelector<HTMLButtonElement>('[data-living-peel]')
      const label = card.querySelector<HTMLElement>('[data-living-peel-label]')
      const setSystem = (on: boolean) => {
        card.classList.toggle('is-system', on)
        if (label) label.textContent = on ? 'Surface' : 'System'
        button?.setAttribute('aria-label', on ? 'Show product surface' : 'Reveal system view')
      }
      card.dataset.systemSetter = 'true'
      const onClick = (event: Event) => {
        event.preventDefault()
        setSystem(!card.classList.contains('is-system'))
      }
      const onEnter = () => !card.classList.contains('is-pinned-on') && setSystem(true)
      const onLeave = () => !card.classList.contains('is-pinned-on') && setSystem(false)
      button?.addEventListener('click', onClick)
      if (!coarse) {
        card.addEventListener('mouseenter', onEnter)
        card.addEventListener('mouseleave', onLeave)
      }
      return () => {
        button?.removeEventListener('click', onClick)
        card.removeEventListener('mouseenter', onEnter)
        card.removeEventListener('mouseleave', onLeave)
      }
    })
    cleanupFns = cleanupFns.concat(peelHandlers)

    const countUp = (el: HTMLElement) => {
      const target = Number(el.dataset.count ?? '0')
      const suffix = el.dataset.suffix ?? ''
      if (!target || el.dataset.counted === 'true') return
      el.dataset.counted = 'true'
      if (reduced) {
        el.textContent = `${target}${suffix}`
        return
      }
      el.textContent = `0${suffix}`
      const start = performance.now()
      const frame = (now: number) => {
        const progress = Math.min((now - start) / 1200, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        el.textContent = `${Math.round(target * eased)}${suffix}`
        if (progress < 1) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          entry.target.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('[data-living-reveal]').forEach((el) => observer.observe(el))
    cleanupFns.push(() => observer.disconnect())

    const initStatic = () => {
      showEverything(reduced ? 'reduced_motion' : 'library_failure')
      document.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp)
    }

    const initEnhanced = async () => {
      if (reduced) {
        initStatic()
        return
      }
      let gsap: typeof import('gsap')['gsap']
      let ScrollTrigger: typeof import('gsap/ScrollTrigger')['ScrollTrigger']
      try {
        // Bundled locally (code-split), not a runtime CDN — motion never depends
        // on an external host being reachable.
        gsap = (await import('gsap')).gsap
        ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger
      } catch {
        initStatic()
        return
      }
      if (!gsap || !ScrollTrigger) {
        initStatic()
        return
      }

      gsap.registerPlugin(ScrollTrigger)
      body.classList.add('living-ready')
      const splashReason = await playSplash()
      showEverything(splashReason)

      const progress = document.querySelector('[data-living-progress]')
      if (progress) {
        gsap.to(progress, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.25 },
        })
      }

      document.querySelectorAll('[data-living-parallax]').forEach((el) => {
        gsap.to(el, {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
        })
      })

      if (!narrow && !coarse) {
        const reel = document.querySelector<HTMLElement>('[data-living-reel]')
        const stage = document.querySelector<HTMLElement>('[data-living-stage]')
        const rail = document.querySelector<HTMLElement>('[data-living-reel-rail]')
        const cur = document.querySelector<HTMLElement>('[data-living-reel-cur]')
        const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-living-scene]'))
        if (reel && stage && scenes.length) {
          body.classList.add('living-reel')
          reel.style.setProperty('--reel-len', String(scenes.length * 100))
          scenes.forEach((scene) => scene.classList.add('is-pinned-on'))

          const render = (progressValue: number) => {
            rail?.style.setProperty('transform', `scaleX(${progressValue})`)
            const raw = Math.min(progressValue * scenes.length, scenes.length - 0.001)
            const activeIndex = Math.floor(raw)
            const local = raw - activeIndex
            if (cur) cur.textContent = String(activeIndex + 1).padStart(2, '0')

            scenes.forEach((scene, index) => {
              const isActive = index === activeIndex
              const isNext = index === activeIndex + 1
              const handoff = Math.max(0, (local - 0.78) / 0.22)
              const opacity = Math.max(isActive ? 1 - handoff : isNext ? handoff : 0, 0.001)
              const xray = isActive && local > 0.34
              scene.style.opacity = opacity.toFixed(3)
              scene.style.pointerEvents = isActive ? 'auto' : 'none'
              scene.classList.toggle('is-system', xray)
              scene.classList.toggle('is-live-scene', isActive)
              scene.style.setProperty('--scene-y', `${isActive ? (1 - Math.min(local / 0.2, 1)) * 28 : 18}px`)
              scene.querySelectorAll<HTMLElement>('[data-count]').forEach((count) => {
                if (isActive && local > 0.08) countUp(count)
              })
            })
          }
          const updateReel = () => {
            const stageTop = stage.getBoundingClientRect().top + window.scrollY
            const end = reel.getBoundingClientRect().top + window.scrollY + reel.offsetHeight - window.innerHeight
            const span = Math.max(end - stageTop, 1)
            render(Math.min(Math.max((window.scrollY - stageTop) / span, 0), 1))
          }
          const onScroll = () => requestAnimationFrame(updateReel)
          render(0)
          updateReel()
          window.addEventListener('scroll', onScroll, { passive: true })
          window.addEventListener('resize', updateReel)
          cleanupFns.push(() => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', updateReel)
          })
        }
      }

      ScrollTrigger.refresh()
    }

    initEnhanced()

    const onMove = (event: MouseEvent) => {
      const cursor = document.querySelector<HTMLElement>('[data-living-cursor]')
      if (!cursor || coarse) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    cleanupFns.push(() => window.removeEventListener('mousemove', onMove))

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(clockTimer)
      cancelAnimationFrame(raf)
      cleanupFns.forEach((fn) => fn())
      root.classList.remove('living-ready')
      body.classList.remove('living-ready', 'living-reel', 'living-visible')
    }
  }, [])

  return null
}
