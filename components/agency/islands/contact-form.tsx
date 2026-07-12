'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'

type Need = 'ai-workflow' | 'test-coverage' | 'release-gates' | 'other'

type Phase = 'idle' | 'sending' | 'success' | 'error' | 'fallback'

interface FormValues {
  name: string
  email: string
  company: string
  need: Need
  message: string
  website: string
}

interface ApiResponse {
  ok: boolean
  fallback?: boolean
  error?: string
}

const NEED_OPTIONS: ReadonlyArray<{ value: Need; label: string }> = [
  { value: 'ai-workflow', label: 'AI Workflow Build' },
  { value: 'test-coverage', label: 'Test Coverage Sprint' },
  { value: 'release-gates', label: 'Release Gate Setup' },
  { value: 'other', label: 'Other / not sure yet' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const NAME_MIN = 2
const NAME_MAX = 80
const MESSAGE_MIN = 20
const MESSAGE_MAX = 2000

const INITIAL_VALUES: FormValues = {
  name: '',
  email: '',
  company: '',
  need: 'ai-workflow',
  message: '',
  website: '',
}

const GENERIC_ERROR =
  'The message did not go through. Email sage@sageideas.dev directly.'

/* Mirrors the server-side rules in app/api/agency-contact/route.ts */
function validate(values: FormValues): string | null {
  const name = values.name.trim()
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    return `Name must be ${NAME_MIN}–${NAME_MAX} characters.`
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    return 'That email address does not look valid.'
  }
  const message = values.message.trim()
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    return `Message must be ${MESSAGE_MIN}–${MESSAGE_MAX} characters — a little context goes a long way.`
  }
  return null
}

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ): void {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (phase === 'sending') return

    const clientError = validate(values)
    if (clientError) {
      setErrorMsg(clientError)
      setPhase('idle')
      return
    }

    setErrorMsg('')
    setPhase('sending')

    try {
      const res = await fetch('/api/agency-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          need: values.need,
          message: values.message.trim(),
          website: values.website,
        }),
      })

      const data = (await res.json().catch(() => null)) as ApiResponse | null

      if (res.ok && data?.ok) {
        setPhase('success')
        return
      }
      if (res.ok && data?.fallback) {
        setPhase('fallback')
        return
      }
      setErrorMsg(data?.error ?? GENERIC_ERROR)
      setPhase('error')
    } catch {
      setErrorMsg(GENERIC_ERROR)
      setPhase('error')
    }
  }

  const isSending = phase === 'sending'

  if (phase === 'success') {
    return (
      <div className="ag-form-success" role="status" aria-live="polite">
        <p className="ag-form-success-kicker">// TRANSMISSION LOG</p>
        <p className="ag-form-success-line">
          ✓ RECEIVED — I read every message. Expect a reply from sage@sageideas.dev.
        </p>
      </div>
    )
  }

  if (phase === 'fallback') {
    return (
      <div className="ag-form-fallback" role="status" aria-live="polite">
        <p className="ag-form-fallback-line">
          FORM TRANSPORT OFFLINE — email me directly and it lands in the same inbox.
        </p>
        <a href="mailto:sage@sageideas.dev" className="ag-btn ag-btn--solid">
          ✉ SAGE@SAGEIDEAS.DEV
        </a>
      </div>
    )
  }

  return (
    <form className="ag-form" onSubmit={handleSubmit} noValidate>
      <div className="ag-form-row">
        <div className="ag-form-field">
          <label htmlFor="agc-name" className="ag-form-label">
            NAME
          </label>
          <input
            id="agc-name"
            name="name"
            type="text"
            className="ag-form-input"
            value={values.name}
            onChange={handleChange}
            minLength={NAME_MIN}
            maxLength={NAME_MAX}
            autoComplete="name"
            required
          />
        </div>
        <div className="ag-form-field">
          <label htmlFor="agc-email" className="ag-form-label">
            EMAIL
          </label>
          <input
            id="agc-email"
            name="email"
            type="email"
            className="ag-form-input"
            value={values.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="ag-form-row">
        <div className="ag-form-field">
          <label htmlFor="agc-company" className="ag-form-label">
            COMPANY <span className="ag-form-label-opt">(OPTIONAL)</span>
          </label>
          <input
            id="agc-company"
            name="company"
            type="text"
            className="ag-form-input"
            value={values.company}
            onChange={handleChange}
            maxLength={200}
            autoComplete="organization"
          />
        </div>
        <div className="ag-form-field">
          <label htmlFor="agc-need" className="ag-form-label">
            WHAT DO YOU NEED?
          </label>
          <select
            id="agc-need"
            name="need"
            className="ag-form-select"
            value={values.need}
            onChange={handleChange}
          >
            {NEED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ag-form-field">
        <label htmlFor="agc-message" className="ag-form-label">
          MESSAGE
        </label>
        <textarea
          id="agc-message"
          name="message"
          className="ag-form-textarea"
          rows={5}
          value={values.message}
          onChange={handleChange}
          minLength={MESSAGE_MIN}
          maxLength={MESSAGE_MAX}
          required
        />
      </div>

      {/* Honeypot — humans never see or tab into this. */}
      <div className="ag-form-hp" aria-hidden="true">
        <label htmlFor="agc-website">Website</label>
        <input
          id="agc-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={handleChange}
        />
      </div>

      <div className="ag-form-status" aria-live="polite">
        {phase === 'error' && (
          <p className="ag-form-error">
            {errorMsg}{' '}
            <a href="mailto:sage@sageideas.dev" className="ag-form-error-link">
              sage@sageideas.dev
            </a>
          </p>
        )}
        {phase === 'idle' && errorMsg !== '' && <p className="ag-form-error">{errorMsg}</p>}
      </div>

      <button type="submit" className="ag-btn ag-btn--solid ag-form-submit" disabled={isSending}>
        {isSending ? 'TRANSMITTING…' : 'SEND IT →'}
      </button>
    </form>
  )
}
