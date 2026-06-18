'use client'

import { useRef, useState } from 'react'

import { trackEvent } from '@/lib/analytics/events'
import styles from './LivingSystemsHome.module.css'

export function LivingSoundControl() {
  const [active, setActive] = useState(false)
  const contextRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<Array<AudioNode & { stop?: () => void }>>([])

  const stop = () => {
    nodesRef.current.forEach((node) => {
      if ('stop' in node) {
        try {
          node.stop?.()
        } catch {
          // Oscillators may already be stopped.
        }
      }
      node.disconnect?.()
    })
    nodesRef.current = []
    contextRef.current?.close()
    contextRef.current = null
    setActive(false)
    trackEvent('sound_enabled', { location: 'home', state: 'off' })
  }

  const start = async () => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return

    const context = new AudioContextCtor()
    contextRef.current = context
    const master = context.createGain()
    master.gain.value = 0.035
    master.connect(context.destination)

    const notes = [55, 82.41, 110, 164.81]
    notes.forEach((frequency, index) => {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = index % 2 === 0 ? 'sawtooth' : 'triangle'
      osc.frequency.value = frequency
      gain.gain.value = index === 0 ? 0.32 : 0.12
      osc.connect(gain)
      gain.connect(master)
      osc.start()
      nodesRef.current.push(osc, gain)
    })

    const pulse = context.createOscillator()
    const pulseGain = context.createGain()
    pulse.type = 'square'
    pulse.frequency.value = 2.2
    pulseGain.gain.value = 0.015
    pulse.connect(pulseGain)
    pulseGain.connect(master)
    pulse.start()
    nodesRef.current.push(pulse, pulseGain, master)

    await context.resume()
    setActive(true)
    trackEvent('sound_enabled', { location: 'home', state: 'on' })
  }

  return (
    <button
      type="button"
      className={`${styles.soundControl} ${active ? styles.soundControlActive : ''}`}
      onClick={() => (active ? stop() : start())}
      aria-pressed={active}
    >
      <span aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <b>{active ? 'Sound on' : 'Sound off'}</b>
    </button>
  )
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
