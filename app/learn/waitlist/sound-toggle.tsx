'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './waitlist.module.css'

/**
 * SoundToggle — opt-in ambient soundscape (off by default, so it's never forced
 * or gimmicky). Synthesizes a soft, slowly-evolving pad via Web Audio — no audio
 * file needed. Drop a real track and swap the graph for an <audio> later.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)

  const start = () => {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    masterRef.current = master

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 560
    filter.Q.value = 3
    filter.connect(master)

    // A soft, consonant drone (A2 · E3 · A3 · C#4).
    const freqs = [110, 164.81, 220, 277.18]
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = i % 2 ? 'sine' : 'triangle'
      osc.frequency.value = f
      osc.detune.value = (i - 1) * 4
      const g = ctx.createGain()
      g.gain.value = 0.16 / (i + 1)
      osc.connect(g).connect(filter)
      osc.start()
    })

    // Slow filter movement so it breathes instead of sitting static.
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.05
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 200
    lfo.connect(lfoGain).connect(filter.frequency)
    lfo.start()

    master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2)
  }

  const stop = () => {
    const ctx = ctxRef.current
    const master = masterRef.current
    if (!ctx) return
    if (master) master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
    window.setTimeout(() => {
      ctx.close().catch(() => {})
      ctxRef.current = null
      masterRef.current = null
    }, 600)
  }

  const toggle = () => {
    if (on) {
      stop()
      setOn(false)
    } else {
      start()
      setOn(true)
    }
  }

  useEffect(() => () => { ctxRef.current?.close().catch(() => {}) }, [])

  return (
    <button
      type="button"
      className={`${styles.sound} ${on ? styles.soundOn : ''}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn ambient sound off' : 'Turn ambient sound on'}
    >
      <span className={styles.soundBars} aria-hidden="true"><i /><i /><i /></span>
      {on ? 'Sound on' : 'Sound'}
    </button>
  )
}
