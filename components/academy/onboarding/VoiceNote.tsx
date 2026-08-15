'use client'

import { useEffect, useRef, useState } from 'react'
import { WELCOME_AUDIO, type WelcomeClipKey } from '@/lib/academy/welcome-audio'
import styles from './voice-note.module.css'

type Props = {
  /** Which welcome/onboarding clip to play, keyed into WELCOME_AUDIO. */
  clip: WelcomeClipKey
  /** Button label. Defaults to the operator-narrated framing. */
  label?: string
}

/**
 * A designed, click-to-play narration control. Plays the matching clip in Jason's
 * voice from Supabase Storage. Deliberately does NOT autoplay — browsers block it and
 * an unsolicited voice is hostile; the learner opts in. Pauses cleanly, resets on end,
 * and stops itself on unmount so a clip never trails a step transition.
 */
export function VoiceNote({ clip, label = 'Hear it from Jason' }: Props) {
  const { url } = WELCOME_AUDIO[clip]
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    return () => {
      if (el) {
        el.pause()
        el.currentTime = 0
      }
    }
  }, [])

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
      return
    }
    el.currentTime = 0
    const p = el.play()
    setPlaying(true)
    if (p?.catch) p.catch(() => setPlaying(false))
  }

  return (
    <button
      type="button"
      className={styles.note}
      data-playing={playing}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Pause narration' : `Play narration: ${label}`}
    >
      <span className={styles.glyph} aria-hidden="true">
        {playing ? (
          <svg viewBox="0 0 16 16" width="14" height="14">
            <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor" />
            <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M5 3.2v9.6a.6.6 0 0 0 .92.5l7.2-4.8a.6.6 0 0 0 0-1L5.92 2.7A.6.6 0 0 0 5 3.2Z" fill="currentColor" />
          </svg>
        )}
      </span>
      <span className={styles.label}>{playing ? 'Playing…' : label}</span>
      <span className={styles.wave} aria-hidden="true">
        <i /><i /><i /><i />
      </span>
      <audio
        ref={audioRef}
        src={url}
        preload="none"
        playsInline
        onEnded={() => setPlaying(false)}
      />
    </button>
  )
}
