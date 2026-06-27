'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Tasteful, synthesized UI sound. WebAudio only — no asset files, no autoplay.
 * Tones are short and soft (institutional, not gamey). Sound is OPT-IN: muted by
 * default and gated behind both an explicit localStorage preference AND the OS
 * reduced-motion setting (reduced-motion → always silent).
 */

const STORAGE_KEY = 'academy-sound'
const STORAGE_EVENT = 'academy-sound-change'

export type SoundName = 'tick' | 'success' | 'levelup' | 'earn'

// --- preference store (cross-component reactive via useSyncExternalStore) ---

function readEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

function writeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    // storage unavailable (private mode / blocked) — fail silent, stay muted
  }
  // notify same-tab subscribers; storage events only fire cross-tab.
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(STORAGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(STORAGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

function getServerSnapshot(): boolean {
  return false // default OFF — institutional, opt-in
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// --- WebAudio synthesis -----------------------------------------------------

// A single lazily-created AudioContext, resumed on first user-driven play.
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioCtx) {
    try {
      audioCtx = new Ctor()
    } catch {
      return null
    }
  }
  return audioCtx
}

type Tone = { freq: number; durationMs: number; peak: number; type: OscillatorType }

const TONES: Record<SoundName, Tone[]> = {
  // soft single blip
  tick: [{ freq: 660, durationMs: 70, peak: 0.05, type: 'sine' }],
  // gentle two-note rise
  success: [
    { freq: 587.33, durationMs: 90, peak: 0.06, type: 'sine' },
    { freq: 880, durationMs: 130, peak: 0.06, type: 'sine' },
  ],
  // brighter three-note arpeggio for level-up
  levelup: [
    { freq: 523.25, durationMs: 90, peak: 0.06, type: 'triangle' },
    { freq: 659.25, durationMs: 90, peak: 0.06, type: 'triangle' },
    { freq: 987.77, durationMs: 160, peak: 0.06, type: 'triangle' },
  ],
  // restrained reward chord for an earn-moment reveal — a rooted perfect-fifth
  // rise that resolves up an octave. Confident, not celebratory-loud.
  earn: [
    { freq: 440, durationMs: 110, peak: 0.055, type: 'sine' },
    { freq: 659.25, durationMs: 110, peak: 0.055, type: 'sine' },
    { freq: 880, durationMs: 200, peak: 0.05, type: 'sine' },
  ],
}

function playTone(ctx: AudioContext, tone: Tone, startAt: number): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = tone.type
  osc.frequency.setValueAtTime(tone.freq, startAt)

  const dur = tone.durationMs / 1000
  // quick attack, smooth exponential release — no clicks, no harshness
  gain.gain.setValueAtTime(0, startAt)
  gain.gain.linearRampToValueAtTime(tone.peak, startAt + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startAt)
  osc.stop(startAt + dur + 0.02)
}

// --- public hook ------------------------------------------------------------

export interface UseSound {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  toggle: () => void
  /** Play a UI sound. No-op when muted or when reduced-motion is set. */
  play: (name: SoundName) => void
}

export function useSound(): UseSound {
  const enabled = useSyncExternalStore(subscribe, readEnabled, getServerSnapshot)

  const setEnabled = useCallback((next: boolean) => {
    writeEnabled(next)
  }, [])

  const toggle = useCallback(() => {
    writeEnabled(!readEnabled())
  }, [])

  const play = useCallback(
    (name: SoundName) => {
      // Never play when muted or when the user prefers reduced motion.
      if (!readEnabled() || prefersReducedMotion()) return
      const ctx = getAudioContext()
      if (!ctx) return
      // Resume if the context was suspended (autoplay policy) — only happens on
      // an explicit user action, so this is allowed.
      if (ctx.state === 'suspended') void ctx.resume()

      const tones = TONES[name]
      let cursor = ctx.currentTime
      for (const tone of tones) {
        playTone(ctx, tone, cursor)
        cursor += tone.durationMs / 1000
      }
    },
    [],
  )

  return { enabled, setEnabled, toggle, play }
}
