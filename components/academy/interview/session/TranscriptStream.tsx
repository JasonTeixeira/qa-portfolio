'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { InitialTurn, MarloweFrame } from './types'
import styles from './session.module.css'

/** A rendered transcript line. Marlowe (interviewer) vs the candidate. */
type Line = {
  speaker: 'interviewer' | 'candidate'
  content: string
  /** mm:ss display stamp. */
  time: string
}

/** mm:ss from whole seconds. */
function mmss(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

type Props = {
  sessionId: string
  startedAtMs: number
  initialTurns: InitialTurn[]
  styleLabel: string
}

/**
 * The interviewer side of the live mock — Marlowe's identity, the streaming
 * transcript, and the candidate's input. On mount it opens the round by POSTing an
 * empty message to the SSE route (Marlowe greets + poses the first question); every
 * candidate submit POSTs `{sessionId, message}` and streams Marlowe's reply token by
 * token. The `available:false` degrade frame is surfaced honestly (Marlowe fell back)
 * rather than swallowed.
 */
export function TranscriptStream({ sessionId, startedAtMs, initialTurns, styleLabel }: Props) {
  const [lines, setLines] = useState<Line[]>(() =>
    initialTurns.map((t) => ({
      speaker: t.speaker,
      content: t.content,
      time: mmss(typeof t.tsSeconds === 'number' ? t.tsSeconds : 0),
    })),
  )
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState('')
  const [thinking, setThinking] = useState(false)
  const [degraded, setDegraded] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const openedRef = useRef(false)
  const busyRef = useRef(false)

  const elapsed = useCallback(() => Math.round((Date.now() - startedAtMs) / 1000), [startedAtMs])

  // Keep the transcript pinned to the newest line.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, streaming, thinking])

  /** POST one turn and consume the SSE stream, appending Marlowe's reply. */
  const runTurn = useCallback(
    async (message: string) => {
      if (busyRef.current) return
      busyRef.current = true
      setThinking(true)
      setDegraded(null)
      setStreaming('')

      let assembled = ''
      let finalReply = ''
      let available = true
      try {
        const res = await fetch('/api/academy/interview/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message }),
        })
        const body = res.body
        if (!res.ok || !body) throw new Error(`stream failed (${res.status})`)

        const reader = body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let nl: number
          while ((nl = buffer.indexOf('\n\n')) !== -1) {
            const rawFrame = buffer.slice(0, nl)
            buffer = buffer.slice(nl + 2)
            const dataLine = rawFrame.split('\n').find((l) => l.startsWith('data:'))
            if (!dataLine) continue
            let frame: MarloweFrame | null = null
            try {
              frame = JSON.parse(dataLine.slice(5).trim()) as MarloweFrame
            } catch {
              frame = null
            }
            if (!frame) continue
            if (frame.type === 'token') {
              assembled += frame.value
              setStreaming(assembled)
            } else if (frame.type === 'done') {
              finalReply = frame.reply ?? ''
              available = frame.available
            }
          }
        }
      } catch {
        available = false
        finalReply = ''
      }

      const reply = (assembled.trim() || finalReply.trim())
      if (reply) {
        setLines((prev) => [...prev, { speaker: 'interviewer', content: reply, time: mmss(elapsed()) }])
      }
      if (!available) {
        setDegraded(
          finalReply.trim() ||
            'Marlowe fell back for a moment — your turn was saved. Try sending again.',
        )
      }
      setStreaming('')
      setThinking(false)
      busyRef.current = false
    },
    [sessionId, elapsed],
  )

  // Open the round once: only when this is a fresh session with no prior turns.
  useEffect(() => {
    if (openedRef.current) return
    openedRef.current = true
    if (initialTurns.length === 0) void runTurn('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = () => {
    const message = draft.trim()
    if (!message || busyRef.current) return
    setLines((prev) => [...prev, { speaker: 'candidate', content: message, time: mmss(elapsed()) }])
    setDraft('')
    void runTurn(message)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={styles.left}>
      <div className={styles.identity}>
        <span className={styles.orb} aria-hidden />
        <div>
          <div className={styles.identityName}>Marlowe</div>
          <div className={styles.identitySub}>your interviewer · style: {styleLabel} · will interrupt</div>
        </div>
        <span className={styles.eq} data-idle={!thinking || undefined} aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </span>
      </div>

      <div className={styles.transcript} ref={scrollRef} aria-live="polite" aria-label="Live transcript">
        <div className={styles.transcriptLabel}>Live transcript</div>

        {lines.map((line, i) => {
          const isMe = line.speaker === 'candidate'
          return (
            <div key={i} className={styles.turn} data-me={isMe || undefined}>
              <span className={`${styles.avatar} ${isMe ? styles.avatarMe : styles.avatarM}`} aria-hidden>
                {isMe ? 'YOU' : 'M'}
              </span>
              <div className={styles.bubbleWrap}>
                <div className={styles.bubble}>{line.content}</div>
                <div className={styles.stamp}>{line.time}</div>
              </div>
            </div>
          )
        })}

        {streaming ? (
          <div className={styles.turn}>
            <span className={`${styles.avatar} ${styles.avatarM}`} aria-hidden>
              M
            </span>
            <div className={styles.bubbleWrap}>
              <div className={styles.bubble}>{streaming}</div>
            </div>
          </div>
        ) : null}

        {degraded ? <div className={styles.degrade}>{degraded}</div> : null}

        <div className={styles.thinking}>
          {thinking && !streaming ? (
            <>
              <span className={styles.thinkingOrb} aria-hidden />
              <span className={styles.thinkingText}>Marlowe is thinking…</span>
            </>
          ) : (
            <span className={styles.thinkingText}>{thinking ? '' : 'Marlowe is listening…'}</span>
          )}
        </div>
      </div>

      <div className={styles.composer}>
        <div className={styles.composerRow}>
          <textarea
            className={styles.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Answer Marlowe in your own words…"
            rows={2}
            disabled={thinking}
            aria-label="Your answer"
          />
          <button type="button" className={styles.send} onClick={submit} disabled={thinking || !draft.trim()}>
            Send
          </button>
        </div>
        <div className={styles.composerHint}>
          typed sessions are scored on everything except speech analytics · Enter to send, Shift+Enter for a new line
        </div>
      </div>
    </div>
  )
}
