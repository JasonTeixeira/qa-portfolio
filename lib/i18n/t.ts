import 'server-only'
import { getLocale } from './server'
import { getMessages, translate } from './messages'

/**
 * Server-side translator — the Server Component mirror of the client `useT()`
 * hook. Reads the active locale from the `x-locale` request header (set by
 * proxy.ts), loads that locale's message catalog once, and returns a `t()`
 * that looks up each English source string (falling back to English when a
 * key is missing).
 *
 *   const t = await getT()
 *   <h1>{t('Ship the proof.')}</h1>
 *
 * Keys are the literal English strings; add them to lib/i18n/messages/en.json
 * and run `npm run i18n:messages` to populate every locale.
 */
export async function getT(): Promise<(source: string) => string> {
  const messages = getMessages(await getLocale())
  return (source: string) => translate(messages, source)
}
