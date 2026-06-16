import type { NextRequest } from 'next/server'
import { ATTRIBUTION_COOKIE, parseAttributionCookie } from './attribution'

export function readAttributionFromRequest(request: NextRequest) {
  return parseAttributionCookie(request.cookies.get(ATTRIBUTION_COOKIE)?.value)
}
