import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface AuditRequestBody {
  url?: unknown
}

export interface AuditScores {
  performance: number | null
  accessibility: number | null
  bestPractices: number | null
  seo: number | null
}

export interface AuditMetrics {
  lcp: string | null
  cls: string | null
  tbt: string | null
  fcp: string | null
}

export interface AuditIssue {
  id: string
  title: string
  displayValue?: string
}

export interface AuditResponse {
  scores: AuditScores
  metrics: AuditMetrics
  topIssues: AuditIssue[]
  finalUrl: string
}

/** Minimal slice of the PageSpeed Insights v5 response we consume. */
interface PsiCategory {
  score?: number | null
}

interface PsiAudit {
  id?: string
  title?: string
  score?: number | null
  scoreDisplayMode?: string
  displayValue?: string
}

interface PsiResponse {
  lighthouseResult?: {
    finalDisplayedUrl?: string
    finalUrl?: string
    categories?: {
      performance?: PsiCategory
      accessibility?: PsiCategory
      'best-practices'?: PsiCategory
      seo?: PsiCategory
    }
    audits?: Record<string, PsiAudit>
  }
}

/* ------------------------------------------------------------------ */
/* URL validation — treat the input as hostile.                       */
/* We never fetch the target ourselves; the string is only forwarded  */
/* to Google PSI, but we still refuse private/internal targets.       */
/* ------------------------------------------------------------------ */

const PRIVATE_IP_PATTERNS: readonly RegExp[] = [
  /^127\./, // loopback
  /^10\./, // RFC1918
  /^172\.(1[6-9]|2\d|3[01])\./, // RFC1918 172.16.0.0/12
  /^192\.168\./, // RFC1918
  /^0\./, // "this network"
  /^169\.254\./, // link-local
]

/** Returns a sanitized http(s) URL string, or null when the input is not acceptable. */
function validateTargetUrl(raw: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(raw.trim())
  } catch {
    return null
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

  // Strip embedded credentials — never forward user:pass@host anywhere.
  parsed.username = ''
  parsed.password = ''

  const host = parsed.hostname.toLowerCase().replace(/\.$/, '')

  if (host === 'localhost' || host.endsWith('.localhost')) return null
  // IPv6 literals (URL hostname keeps brackets off but may contain ':') — reject outright.
  if (host.includes(':')) return null
  // Bare intranet hostnames (no dot) are never public sites.
  if (!host.includes('.')) return null
  if (PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(host))) return null

  return parsed.toString()
}

/* ------------------------------------------------------------------ */
/* Rate limiting — in-memory, per IP.                                 */
/* NOTE: this Map resets on every deploy / per serverless instance,   */
/* so the limit is best-effort rather than global. Fine for launch.   */
/* ------------------------------------------------------------------ */

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

const rateBuckets = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (rateBuckets.get(ip) ?? []).filter(
    (stamp) => now - stamp < RATE_LIMIT_WINDOW_MS,
  )
  if (recent.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, recent)
    return true
  }
  rateBuckets.set(ip, [...recent, now])
  return false
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

/* ------------------------------------------------------------------ */
/* PSI result shaping                                                 */
/* ------------------------------------------------------------------ */

const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const PSI_TIMEOUT_MS = 25_000

/** Audits that are surfaced as CWV chips — excluded from the findings list. */
const METRIC_AUDIT_IDS: ReadonlySet<string> = new Set([
  'largest-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'first-contentful-paint',
  'speed-index',
  'interactive',
])

function toScore(category: PsiCategory | undefined): number | null {
  const score = category?.score
  return typeof score === 'number' ? Math.round(score * 100) : null
}

function metricDisplay(audits: Record<string, PsiAudit>, id: string): string | null {
  const value = audits[id]?.displayValue
  return typeof value === 'string' && value.length > 0 ? value : null
}

function pickTopIssues(audits: Record<string, PsiAudit>): AuditIssue[] {
  const failing = Object.values(audits).filter((audit): audit is PsiAudit & {
    id: string
    title: string
    score: number
  } => {
    if (typeof audit.id !== 'string' || typeof audit.title !== 'string') return false
    if (typeof audit.score !== 'number' || audit.score >= 0.9) return false
    if (METRIC_AUDIT_IDS.has(audit.id)) return false
    const mode = audit.scoreDisplayMode ?? 'numeric'
    return mode === 'numeric' || mode === 'binary' || mode === 'metricSavings'
  })

  return failing
    .sort((a, b) => a.score - b.score)
    .slice(0, 6)
    .map((audit) => ({
      id: audit.id,
      title: audit.title,
      ...(typeof audit.displayValue === 'string' && audit.displayValue.length > 0
        ? { displayValue: audit.displayValue }
        : {}),
    }))
}

/* ------------------------------------------------------------------ */
/* Handler                                                            */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: AuditRequestBody
  try {
    body = (await request.json()) as AuditRequestBody
  } catch {
    return NextResponse.json({ error: 'Send JSON like { "url": "https://example.com" }.' }, {
      status: 400,
    })
  }

  if (typeof body.url !== 'string' || body.url.length === 0 || body.url.length > 2048) {
    return NextResponse.json({ error: 'Provide a site URL as a string.' }, { status: 400 })
  }

  const target = validateTargetUrl(body.url)
  if (target === null) {
    return NextResponse.json(
      { error: 'That needs to be a public http(s) URL — internal and local addresses are off-limits.' },
      { status: 400 },
    )
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: 'Rate limit reached — 5 teardowns per hour. Come back in a bit, or book a call for the deep version.' },
      { status: 429 },
    )
  }

  const params = new URLSearchParams({ url: target, strategy: 'mobile' })
  for (const category of ['performance', 'accessibility', 'best-practices', 'seo']) {
    params.append('category', category)
  }
  const apiKey = process.env.PAGESPEED_API_KEY
  if (apiKey) params.append('key', apiKey)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PSI_TIMEOUT_MS)

  let psi: PsiResponse
  try {
    const response = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
    if (!response.ok) {
      console.error(`[agency-audit] PSI responded ${response.status} for ${target}`)
      return NextResponse.json(
        { error: 'PageSpeed Insights could not analyze that URL. Check it loads publicly and try again.' },
        { status: 502 },
      )
    }
    psi = (await response.json()) as PsiResponse
  } catch (error: unknown) {
    const isAbort = error instanceof Error && error.name === 'AbortError'
    console.error(`[agency-audit] PSI ${isAbort ? 'timed out' : 'failed'} for ${target}`, error)
    return NextResponse.json(
      {
        error: isAbort
          ? 'The scan took too long (Lighthouse gave up after ~25s). Try again — slow first runs happen.'
          : 'Could not reach PageSpeed Insights. Try again in a minute.',
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }

  const lighthouse = psi.lighthouseResult
  if (!lighthouse?.categories) {
    console.error(`[agency-audit] PSI returned no lighthouseResult for ${target}`)
    return NextResponse.json(
      { error: 'PageSpeed Insights returned an empty report for that URL.' },
      { status: 502 },
    )
  }

  const audits = lighthouse.audits ?? {}

  const payload: AuditResponse = {
    scores: {
      performance: toScore(lighthouse.categories.performance),
      accessibility: toScore(lighthouse.categories.accessibility),
      bestPractices: toScore(lighthouse.categories['best-practices']),
      seo: toScore(lighthouse.categories.seo),
    },
    metrics: {
      lcp: metricDisplay(audits, 'largest-contentful-paint'),
      cls: metricDisplay(audits, 'cumulative-layout-shift'),
      tbt: metricDisplay(audits, 'total-blocking-time'),
      fcp: metricDisplay(audits, 'first-contentful-paint'),
    },
    topIssues: pickTopIssues(audits),
    finalUrl: lighthouse.finalDisplayedUrl ?? lighthouse.finalUrl ?? target,
  }

  return NextResponse.json(payload)
}
