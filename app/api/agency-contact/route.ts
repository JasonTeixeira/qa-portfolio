import { NextResponse, type NextRequest } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

/* Follows the Resend from-address pattern in lib/welcomeEmail.ts */
const FROM = 'Sage Ideas <sage@sageideas.dev>'
const TO = 'sage@sageideas.dev'

const NEEDS = ['ai-workflow', 'test-coverage', 'release-gates', 'other'] as const
type Need = (typeof NEEDS)[number]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const NAME_MIN = 2
const NAME_MAX = 80
const MESSAGE_MIN = 20
const MESSAGE_MAX = 2000
const COMPANY_MAX = 200
const EMAIL_MAX = 254

/* ---- in-memory rate limit: 3 requests / hour / IP ---- */
const RATE_LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000
const RATE_MAP_SWEEP_AT = 500

const hitsByIp = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hitsByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)

  if (recent.length >= RATE_LIMIT) {
    hitsByIp.set(ip, recent)
    return true
  }

  hitsByIp.set(ip, [...recent, now])

  if (hitsByIp.size > RATE_MAP_SWEEP_AT) {
    for (const [key, stamps] of hitsByIp) {
      if (stamps.every((t) => now - t >= WINDOW_MS)) hitsByIp.delete(key)
    }
  }

  return false
}

/* ---- validation ---- */

interface ContactPayload {
  name: string
  email: string
  company: string
  need: Need
  message: string
  website: string
}

type ParseResult = { ok: true; payload: ContactPayload } | { ok: false; error: string }

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function parseBody(raw: unknown): ParseResult {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'Invalid request body.' }
  }

  const body = raw as Record<string, unknown>
  const name = asTrimmedString(body.name)
  const email = asTrimmedString(body.email)
  const company = asTrimmedString(body.company)
  const need = asTrimmedString(body.need)
  const message = asTrimmedString(body.message)
  const website = asTrimmedString(body.website)

  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    return { ok: false, error: `Name must be ${NAME_MIN}–${NAME_MAX} characters.` }
  }
  if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'That email address does not look valid.' }
  }
  if (company.length > COMPANY_MAX) {
    return { ok: false, error: `Company must be under ${COMPANY_MAX} characters.` }
  }
  if (!(NEEDS as readonly string[]).includes(need)) {
    return { ok: false, error: 'Pick one of the listed project types.' }
  }
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    return {
      ok: false,
      error: `Message must be ${MESSAGE_MIN}–${MESSAGE_MAX} characters.`,
    }
  }

  return {
    ok: true,
    payload: { name, email, company, need: need as Need, message, website },
  }
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/* ---- handler ---- */

export async function POST(request: NextRequest): Promise<NextResponse> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = parseBody(raw)
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 })
  }

  const { payload } = parsed

  // Honeypot tripped: pretend success, send nothing.
  if (payload.website !== '') {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const ip = clientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many messages from this connection. Try again in an hour, or email sage@sageideas.dev directly.' },
      { status: 429 },
    )
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Client degrades to mailto.
    return NextResponse.json({ ok: false, fallback: true }, { status: 200 })
  }

  const timestamp = new Date().toISOString()
  const text = [
    `name: ${payload.name}`,
    `email: ${payload.email}`,
    `company: ${payload.company || '—'}`,
    `need: ${payload.need}`,
    `ip: ${ip}`,
    `timestamp: ${timestamp}`,
    '',
    'message:',
    payload.message,
  ].join('\n')

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: payload.email,
      subject: `[agency] ${payload.need} — ${payload.name}`,
      text,
    })

    if (error) {
      console.error('[agency-contact] resend error:', error.message)
      return NextResponse.json(
        { ok: false, error: 'The message did not go through. Email sage@sageideas.dev directly.' },
        { status: 502 },
      )
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown'
    console.error('[agency-contact] send threw:', message)
    return NextResponse.json(
      { ok: false, error: 'The message did not go through. Email sage@sageideas.dev directly.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
