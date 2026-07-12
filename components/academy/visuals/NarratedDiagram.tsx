'use client'

/**
 * NarratedDiagram — the narration ENGINE for Sage system-maps.
 *
 * Wrap any SageDiagram spec with a STORYBOARD (an ordered list of beats) and the
 * figure explains itself: each beat spotlights the nodes/edges it's about (all
 * others recede), fires their dataflow pulses, and shows the narration line as a
 * caption, auto-advancing on a timeline. Author once per diagram; reuse the same
 * engine for every lesson, concept, and project across the app.
 *
 * VOICE-SYNC-READY: each beat carries `ms` — today a fixed hold, tomorrow the
 * exact duration of that line's TTS audio. When the voice engine lands, drive
 * `setBeat` from audio segment boundaries (onended / timeupdate) instead of the
 * timer and the diagram animates in lockstep with the narration. The spotlight
 * model doesn't change — only what advances the beat.
 */
import * as React from 'react'
import { useReducedMotion } from 'framer-motion'
import { SageDiagram, type SageDiagramProps, type SpotlightSpec, edgeKey } from './SageDiagram'

// Tiny inline transport glyphs (self-contained — no icon-set dependency).
const Glyph = ({ d, fill }: { d: string; fill?: boolean }) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
)
const PrevG = () => <Glyph d="M15 6l-6 6 6 6" />
const NextG = () => <Glyph d="M9 6l6 6-6 6" />
const VoiceOnG = () => <Glyph d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
const VoiceOffG = () => <Glyph d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" />
const PlayG = () => <Glyph d="M8 5l11 7-11 7z" fill />
const PauseG = () => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
    <rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
)

/** One narration beat: what the voice says + what the diagram emphasizes + how long. */
export type DiagramBeat = {
  /** The narration line — spoken by the voice engine; shown as a caption now. */
  say: string
  /** Node ids to spotlight this beat. */
  nodes?: string[]
  /** Edges to spotlight this beat, as [from, to] pairs. */
  edges?: [string, string][]
  /** Beat length (ms). Voice-sync: the TTS segment duration. Default 3600. */
  ms?: number
  /** Public URL of this beat's narration audio (Jason's cloned voice). When present
   *  and voice is on, the audio becomes the clock — the beat advances on `ended`. */
  audio?: string
}
export type DiagramStoryboard = DiagramBeat[]

const DEFAULT_MS = 3600

type Props = Omit<SageDiagramProps, 'spotlight' | 'instant'> & {
  storyboard: DiagramStoryboard
  /** Autoplay + loop on mount (off under reduced-motion). Default true. */
  autoplay?: boolean
}

export function NarratedDiagram({ storyboard, autoplay = true, ...diagram }: Props) {
  const reduce = useReducedMotion()
  const [beat, setBeat] = React.useState(0)
  const [playing, setPlaying] = React.useState(autoplay && !reduce)
  // Voice off by default: browser autoplay policy blocks audio until a user gesture
  // (the toggle IS that gesture). The animation still autoplays silently.
  const [voice, setVoice] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const current = storyboard[beat]
  const total = storyboard.length
  const hasVoice = storyboard.some((b) => b.audio)

  const spotlight = React.useMemo<SpotlightSpec>(
    () => ({
      nodes: current?.nodes ?? [],
      edges: (current?.edges ?? []).map(([f, t]) => edgeKey(f, t)),
    }),
    [current],
  )

  // Auto-advance. VOICE ON + a beat has audio → the audio is the clock (advance on
  // `ended`, so the diagram animates in lockstep with Jason's narration). Otherwise
  // → the fixed ms timer. If audio playback is blocked/fails, fall back to the timer.
  React.useEffect(() => {
    if (!playing || !current) return
    const advance = () => setBeat((n) => (n + 1) % total)
    const el = audioRef.current

    if (voice && current.audio && el) {
      let timer: ReturnType<typeof setTimeout> | undefined
      el.src = current.audio
      el.currentTime = 0
      el.addEventListener('ended', advance)
      const p = el.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => { timer = setTimeout(advance, current.ms ?? DEFAULT_MS) })
      }
      return () => {
        el.removeEventListener('ended', advance)
        el.pause()
        if (timer) clearTimeout(timer)
      }
    }

    const id = setTimeout(advance, current.ms ?? DEFAULT_MS)
    return () => clearTimeout(id)
  }, [playing, beat, current, total, voice])

  const go = (n: number) => {
    setPlaying(false)
    setBeat(((n % total) + total) % total)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SageDiagram {...diagram} spotlight={spotlight} instant />

      {/* Caption track — the narration line (this is what the voice speaks). */}
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: 66,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 18px',
          background: 'var(--ac-surface, #111115)',
          border: '1px solid var(--ac-rule, #1E1E24)',
          borderRadius: 14,
        }}
      >
        <span
          aria-hidden
          style={{
            flexShrink: 0,
            fontFamily: 'var(--ac-font-mono, monospace)',
            fontSize: 10.5,
            letterSpacing: '0.12em',
            color: 'var(--ac-accent-text, #83AFFF)',
            textTransform: 'uppercase',
          }}
        >
          {String(beat + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
        <p
          key={beat}
          style={{
            margin: 0,
            fontFamily: 'var(--ac-font-display, Georgia, serif)',
            fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.35rem)',
            lineHeight: 1.4,
            color: 'var(--ac-ink, #F2EFE9)',
            animation: reduce ? undefined : 'ac-caption-in 0.4s ease both',
          }}
        >
          {current?.say}
        </p>
      </div>

      {/* Transport — play/pause, step, and beat scrubber. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={() => go(beat - 1)} aria-label="Previous beat" style={btn}>
          <PrevG />
        </button>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause narration' : 'Play narration'}
          style={{ ...btn, background: 'var(--ac-accent, #3D5AFE)', color: '#fff', borderColor: 'transparent' }}
        >
          {playing ? <PauseG /> : <PlayG />}
        </button>
        <button type="button" onClick={() => go(beat + 1)} aria-label="Next beat" style={btn}>
          <NextG />
        </button>
        {hasVoice && (
          <button
            type="button"
            onClick={() => { const nv = !voice; setVoice(nv); if (nv) setPlaying(true) }}
            aria-label={voice ? 'Turn narration voice off' : 'Turn narration voice on'}
            aria-pressed={voice}
            title={voice ? "Jason's voice on" : 'Play in Jason’s voice'}
            style={{ ...btn, borderColor: voice ? 'var(--ac-accent, #3D5AFE)' : undefined, color: voice ? 'var(--ac-accent-text, #83AFFF)' : undefined }}
          >
            {voice ? <VoiceOnG /> : <VoiceOffG />}
          </button>
        )}
        <div style={{ display: 'flex', gap: 6, marginLeft: 6 }}>
          {storyboard.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Beat ${i + 1}`}
              aria-current={i === beat}
              style={{
                width: i === beat ? 26 : 9,
                height: 9,
                padding: 0,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                transition: 'width 0.25s ease, background 0.25s ease',
                background: i === beat ? 'var(--ac-accent, #3D5AFE)' : 'var(--ac-rule-strong, #2A2A33)',
              }}
            />
          ))}
        </div>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--ac-font-mono, monospace)',
            fontSize: 10,
            color: 'var(--ac-ink-faint, #9598A2)',
          }}
        >
          {playing ? 'narrating' : 'paused'} · {hasVoice ? (voice ? 'Jason’s voice' : 'voice ready') : 'voice-sync ready'}
        </span>
      </div>

      {/* Hidden narration audio element — the transport drives it when voice is on. */}
      {hasVoice && <audio ref={audioRef} preload="auto" playsInline />}

      <style>{`@keyframes ac-caption-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

const btn: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 34,
  height: 34,
  borderRadius: 10,
  border: '1px solid var(--ac-rule, #1E1E24)',
  background: 'var(--ac-surface, #111115)',
  color: 'var(--ac-ink, #F2EFE9)',
  cursor: 'pointer',
}
