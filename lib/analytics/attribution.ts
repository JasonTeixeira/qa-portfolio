export const ATTRIBUTION_COOKIE = 'sage_ft'
export const ATTRIBUTION_MAX_AGE_SECONDS = 60 * 60 * 24 * 180

export type Attribution = {
  landingPage: string
  referrer: string
  capturedAt: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  gclid?: string
  fbclid?: string
}

const PARAM_MAP: Array<[keyof Attribution, string]> = [
  ['utmSource', 'utm_source'],
  ['utmMedium', 'utm_medium'],
  ['utmCampaign', 'utm_campaign'],
  ['utmTerm', 'utm_term'],
  ['utmContent', 'utm_content'],
  ['gclid', 'gclid'],
  ['fbclid', 'fbclid'],
]

function clean(value: string | null | undefined, max = 500): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

export function extractAttributionFromUrl(
  href: string,
  referrer = '',
  now: Date = new Date(),
): Attribution {
  const url = new URL(href)
  const attribution: Attribution = {
    landingPage: `${url.pathname}${url.search}`,
    referrer: clean(referrer, 1000) ?? '',
    capturedAt: now.toISOString(),
  }

  for (const [key, param] of PARAM_MAP) {
    const value = clean(url.searchParams.get(param))
    if (value) attribution[key] = value
  }

  return attribution
}

export function serializeAttribution(attribution: Attribution): string {
  return encodeURIComponent(JSON.stringify(attribution))
}

export function parseAttributionCookie(raw: string | undefined | null): Attribution | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Attribution>
    if (!parsed.landingPage || !parsed.capturedAt) return null
    const attribution: Attribution = {
      landingPage: String(parsed.landingPage).slice(0, 500),
      referrer: String(parsed.referrer ?? '').slice(0, 1000),
      capturedAt: String(parsed.capturedAt),
    }
    for (const key of ['utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent', 'gclid', 'fbclid'] as const) {
      const value = clean(parsed[key])
      if (value) attribution[key] = value
    }
    return attribution
  } catch {
    return null
  }
}

export function mergeAttributionMetadata(
  metadata: Record<string, unknown> | undefined,
  attribution: Attribution | null,
): Record<string, unknown> {
  return attribution ? { ...(metadata ?? {}), attribution } : { ...(metadata ?? {}) }
}
