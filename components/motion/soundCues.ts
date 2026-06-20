'use client'

/**
 * soundCues — a tiny, asset-free UI sound layer built on the Web Audio API.
 *
 * Synthesizes short, soft cues (no files to ship) for interface moments:
 * hovering a target, confirming a choice, a gentle intro chime. Cues only
 * fire after a user gesture (browser autoplay policy) and respect a persisted
 * mute flag, so they never play uninvited on first paint.
 */

export type Cue = 'hover' | 'select' | 'confirm' | 'chime'

const MUTE_KEY = 'sage-sfx-muted'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  return ctx
}

export function isSfxMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function setSfxMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
  } catch {
    // Storage denied (private mode) — cues simply stay at their default state.
  }
}

// Cue → ordered notes (Hz), gain, and per-note duration (seconds).
const VOICES: Record<Cue, { notes: number[]; gain: number; dur: number; type: OscillatorType }> = {
  hover: { notes: [880], gain: 0.025, dur: 0.1, type: 'sine' },
  select: { notes: [659.25], gain: 0.07, dur: 0.22, type: 'sine' },
  confirm: { notes: [523.25, 783.99], gain: 0.085, dur: 0.3, type: 'sine' },
  chime: { notes: [523.25, 659.25, 783.99], gain: 0.06, dur: 0.5, type: 'triangle' },
}

/**
 * Play a UI cue. No-ops when muted, when Web Audio is unavailable, or before
 * the audio context can be resumed (pre-gesture). Always best-effort.
 */
export function playCue(cue: Cue): void {
  if (isSfxMuted()) return
  const ac = audio()
  if (!ac) return
  if (ac.state === 'suspended') ac.resume().catch(() => {})

  const voice = VOICES[cue]
  const start = ac.currentTime
  const step = voice.dur * 0.55

  voice.notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    const at = start + i * step
    osc.type = voice.type
    osc.frequency.setValueAtTime(freq, at)
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(voice.gain, at + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + voice.dur)
    osc.connect(gain).connect(ac.destination)
    osc.start(at)
    osc.stop(at + voice.dur + 0.05)
  })
}
