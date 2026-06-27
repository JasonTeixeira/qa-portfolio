'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './tutor-panel.module.css'

/**
 * Sage Tutor — a persistent, right-docked master-tutor surface mounted on every
 * academy page. A bottom-right launcher opens a full-height right rail (a bottom
 * sheet on phones). Chat against POST /api/academy/tutor with browser-native
 * voice (dictation in, speech out) layered on top — $0, graceful-degrade when a
 * browser lacks the Web Speech APIs.
 *
 * Disciplined-dark, hairline-ruled, --ac-* tokens, no glow. Fully keyboard
 * operable: focus moves into the panel on open and back to the launcher on
 * close, Esc closes, new tutor replies are announced via an aria-live region.
 */

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  role: ChatRole
  content: string
}

type TutorApiResponse = {
  available: boolean
  reply: string
}

/* --- Minimal Web Speech typings (not in the standard DOM lib) --- */
type SpeechRecognitionResultLike = {
  0: { transcript: string }
  isFinal: boolean
}
type SpeechRecognitionEventLike = {
  resultIndex: number
  results: { length: number; [index: number]: SpeechRecognitionResultLike }
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.webkitSpeechRecognition ?? w.SpeechRecognition ?? null
}

function speechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Derive course/lesson slugs from /academy/learn/<course>/<lesson>. */
function deriveSlugs(pathname: string | null): {
  courseSlug?: string
  lessonSlug?: string
} {
  if (!pathname) return {}
  const segments = pathname.split('/').filter(Boolean)
  // ['academy', 'learn', '<course>', '<lesson>']
  if (segments[0] !== 'academy' || segments[1] !== 'learn') return {}
  return {
    courseSlug: segments[2] || undefined,
    lessonSlug: segments[3] || undefined,
  }
}

const WARMING_REPLY =
  'The tutor is warming up right now — try again in a moment. In the meantime, re-read the lesson summary and jot down the one idea you are least sure about.'

function MicIcon() {
  return (
    <svg className={styles.toggleIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SpeakIcon() {
  return (
    <svg className={styles.toggleIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path d="M16 9a3.5 3.5 0 0 1 0 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg className={styles.sendIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12l16-8-6 16-3-6-7-2Z" fill="currentColor" />
    </svg>
  )
}

export function AiTutorPanel() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [listening, setListening] = useState(false)
  const [speak, setSpeak] = useState(false)
  const [liveText, setLiveText] = useState('')

  const launcherRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const speakRef = useRef(false)
  const titleId = useId()

  // Detect browser voice support AFTER mount — SSR and the first client render
  // must be identical (both false) or the hydration mismatch breaks interactivity.
  const [voiceInSupported, setVoiceInSupported] = useState(false)
  const [voiceOutSupported, setVoiceOutSupported] = useState(false)
  useEffect(() => {
    setVoiceInSupported(getSpeechRecognitionCtor() !== null)
    setVoiceOutSupported(speechSynthesisSupported())
  }, [])

  // Keep a ref of the speak toggle so the async reply handler reads the latest value.
  useEffect(() => {
    speakRef.current = speak
    if (!speak && voiceOutSupported) window.speechSynthesis.cancel()
  }, [speak, voiceOutSupported])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    stopListening()
    if (voiceOutSupported) window.speechSynthesis.cancel()
    launcherRef.current?.focus()
  }, [stopListening, voiceOutSupported])

  // Move focus into the panel on open.
  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  // Esc closes from anywhere in the panel.
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  // Auto-scroll the thread to the newest message.
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, pending])

  // Cancel any in-flight speech when the component unmounts.
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      if (speechSynthesisSupported()) window.speechSynthesis.cancel()
    }
  }, [])

  const speakReply = useCallback(
    (text: string) => {
      if (!speakRef.current || !speechSynthesisSupported()) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    },
    [],
  )

  const send = useCallback(async () => {
    const message = draft.trim()
    if (!message || pending) return

    stopListening()
    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    const { courseSlug, lessonSlug } = deriveSlugs(pathname)

    setMessages((prev) => [...prev, { role: 'user', content: message }])
    setDraft('')
    setPending(true)

    try {
      const res = await fetch('/api/academy/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, courseSlug, lessonSlug }),
      })
      const data = (await res.json().catch(() => null)) as TutorApiResponse | null
      const reply = data?.reply?.trim() || WARMING_REPLY
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      setLiveText(reply)
      speakReply(reply)
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: WARMING_REPLY }])
      setLiveText(WARMING_REPLY)
    } finally {
      setPending(false)
    }
  }, [draft, pending, messages, pathname, stopListening, speakReply])

  function onTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return
    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true

    let finalTranscript = ''
    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (result.isFinal) finalTranscript += result[0].transcript
        else interim += result[0].transcript
      }
      setDraft((finalTranscript + interim).trimStart())
    }
    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)
      textareaRef.current?.focus()
    }
    recognition.onerror = () => {
      recognitionRef.current = null
      setListening(false)
    }

    recognitionRef.current = recognition
    setListening(true)
    recognition.start()
  }, [])

  function toggleMic() {
    if (listening) stopListening()
    else startListening()
  }

  function toggleSpeak() {
    setSpeak((prev) => !prev)
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={`${styles.launcher} ${open ? styles.launcherHidden : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className={styles.launcherMark} aria-hidden="true">
          ◆
        </span>
        <span className={styles.launcherLabel}>Sage Tutor</span>
      </button>

      {open ? (
        <div
          className={styles.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <div
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
          >
            <header className={styles.header}>
              <span className={styles.headerMark} aria-hidden="true">
                ◆
              </span>
              <span className={styles.headerText}>
                <span id={titleId} className={styles.title}>
                  Sage Tutor
                </span>
                <span className={styles.subtitle}>Ask · talk · learn</span>
              </span>
              <button
                ref={closeRef}
                type="button"
                className={styles.close}
                onClick={close}
                aria-label="Close tutor"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className={styles.thread} ref={threadRef}>
              {messages.length === 0 && !pending ? (
                <div className={styles.empty}>
                  <span className={styles.emptyMark} aria-hidden="true">
                    ◆
                  </span>
                  <p className={styles.emptyText}>
                    Ask me anything about this lesson — or how to learn it.
                  </p>
                </div>
              ) : null}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`${styles.row} ${m.role === 'user' ? styles.rowUser : styles.rowTutor}`}
                >
                  <span className={styles.roleTag}>
                    {m.role === 'assistant' ? (
                      <>
                        <span aria-hidden="true">◆</span> Tutor
                      </>
                    ) : (
                      'You'
                    )}
                  </span>
                  <div
                    className={`${styles.bubble} ${
                      m.role === 'user' ? styles.bubbleUser : styles.bubbleTutor
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {pending ? (
                <div className={`${styles.row} ${styles.rowTutor}`}>
                  <span className={styles.roleTag}>
                    <span aria-hidden="true">◆</span> Tutor
                  </span>
                  <div className={`${styles.bubble} ${styles.bubbleTutor} ${styles.pending}`} aria-label="Tutor is thinking">
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </div>
                </div>
              ) : null}
            </div>

            <div aria-live="polite" className={styles.srOnly}>
              {liveText}
            </div>

            <div className={styles.composer}>
              <div className={styles.tools}>
                <button
                  type="button"
                  className={`${styles.toggle} ${
                    voiceInSupported ? '' : styles.toggleHidden
                  } ${listening ? styles.toggleListening : ''}`}
                  aria-pressed={listening}
                  aria-label={listening ? 'Stop dictation' : 'Start dictation'}
                  onClick={toggleMic}
                >
                  <MicIcon />
                  {listening ? 'Listening' : 'Mic'}
                </button>
                <button
                  type="button"
                  className={`${styles.toggle} ${
                    voiceOutSupported ? '' : styles.toggleHidden
                  } ${speak ? styles.toggleOn : ''}`}
                  aria-pressed={speak}
                  aria-label={speak ? 'Turn off spoken replies' : 'Turn on spoken replies'}
                  onClick={toggleSpeak}
                >
                  <SpeakIcon />
                  {speak ? 'Voice on' : 'Voice'}
                </button>
              </div>

              <div className={styles.inputRow}>
                <label htmlFor="tutor-composer" className={styles.srOnly}>
                  Message the tutor
                </label>
                <textarea
                  id="tutor-composer"
                  ref={textareaRef}
                  className={styles.textarea}
                  placeholder="Ask the tutor…"
                  value={draft}
                  rows={1}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onTextareaKeyDown}
                />
                <button
                  type="button"
                  className={styles.send}
                  onClick={() => void send()}
                  disabled={pending || draft.trim().length === 0}
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
