import 'server-only'
import { headers } from 'next/headers'
import { normalizeLocale, type Locale } from './config'

/** The active locale for the current request, read from the middleware-set header. */
export async function getLocale(): Promise<Locale> {
  const h = await headers()
  return normalizeLocale(h.get('x-locale'))
}
