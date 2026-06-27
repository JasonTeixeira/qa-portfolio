import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * The instrumentation spine's WRITE path — the typed, best-effort emitter for
 * product-analytics events (academy_events, 0111). This is how the engagement
 * loop gets MEASURED so categories can be proven, not just design-scored.
 *
 * Anti-cheat parity with the evidence spine (lib/academy/evidence-events.ts):
 * writes go through the service role, and `userId` MUST come from the
 * authenticated server caller (auth.getUser()), NEVER from client/route/form
 * input — a spoofed id would write to another learner's stream and inflate
 * their retention/activation.
 *
 * BEST-EFFORT CONTRACT: emitting is fire-and-forget. It is wrapped in try/catch,
 * NEVER throws, and NEVER blocks or breaks the user action it instruments. A
 * failed emit logs and is swallowed — measurement must not degrade product.
 *
 * NO PII: props carry counts / ids / enums only — never emails, never message
 * text. Props are bounded (non-primitive values dropped, key count capped).
 */

/** The instrumented events — one per real surface in the engagement loop (see emit callsites). */
export type AcademyEventName =
  | 'lesson_completed'
  | 'review_completed'
  | 'badge_earned'
  | 'bonus_claimed'
  | 'goal_set'
  | 'first_win'
  | 'tutor_turn'

/** A primitive prop value — the only shapes we persist (no nested objects, no PII strings by convention). */
type PropValue = string | number | boolean

/** Cap on the number of prop keys persisted per event — keeps the row bounded. */
const MAX_PROP_KEYS = 12

/**
 * Drop anything that isn't a string/number/boolean (objects, arrays, null,
 * undefined, functions), then cap the key count. Pure + defensive: even a buggy
 * caller can't write an unbounded or non-primitive payload. Never mutates input.
 */
function boundProps(props?: Record<string, PropValue>): Record<string, PropValue> {
  if (!props) return {}
  const bounded: Record<string, PropValue> = {}
  let kept = 0
  for (const key of Object.keys(props)) {
    if (kept >= MAX_PROP_KEYS) break
    const value = props[key]
    const t = typeof value
    if (t === 'string' || t === 'number' || t === 'boolean') {
      bounded[key] = value
      kept += 1
    }
  }
  return bounded
}

/**
 * Emit one academy analytics event. Best-effort: never throws, never blocks.
 *
 * @param userId server-resolved authenticated user id (NEVER from client input)
 * @param name   one of the instrumented AcademyEventName values
 * @param props  optional bounded, PII-free primitive props (counts/ids/enums)
 */
export async function emitAcademyEvent(
  userId: string,
  name: AcademyEventName,
  props?: Record<string, PropValue>,
): Promise<void> {
  try {
    if (!userId) return // no authenticated subject → nothing to measure (never throw)
    const admin = supabaseAdmin()
    const { error } = await admin.from('academy_events').insert({
      user_id: userId,
      name,
      props: boundProps(props),
    })
    if (error) {
      console.error('[academy/events] emit failed', { name, error: error.message })
    }
  } catch (err) {
    // Measurement must never break the action it instruments.
    console.error('[academy/events] emit threw (swallowed)', { name, err })
  }
}
