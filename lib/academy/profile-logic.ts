/**
 * Pure profile/handle logic — NO 'server-only', NO DB. Unit-testable.
 * Handle slugification + validation + uniqueness candidate generation; the DB
 * layer (profiles.ts) resolves the first free candidate.
 */

export const HANDLE_MIN = 3
export const HANDLE_MAX = 24

/** Route segments + sensitive words that must never become a public handle. */
export const RESERVED_HANDLES = new Set([
  'admin', 'api', 'academy', 'login', 'signup', 'logout', 'dashboard', 'review',
  'leagues', 'catalog', 'build', 'resources', 'evidence', 'certificate', 'onboarding',
  'u', 'og', 'efficacy', 'me', 'settings', 'new', 'edit', 'support', 'help', 'sage',
])

export function slugifyHandle(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, HANDLE_MAX)
    .replace(/-+$/g, '')
}

export function isValidHandle(h: string): boolean {
  if (h.length < HANDLE_MIN || h.length > HANDLE_MAX) return false
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(h)) return false
  return !RESERVED_HANDLES.has(h)
}

/** Turn an email/name seed into a valid base handle (padded + de-reserved). */
export function deriveHandle(seed: string): string {
  let base = slugifyHandle(seed)
  if (base.length < HANDLE_MIN) base = slugifyHandle(`${base}-learner`)
  if (RESERVED_HANDLES.has(base)) base = `${base}-1`
  return base.slice(0, HANDLE_MAX)
}

/** Ordered uniqueness candidates: base, base-2, base-3, … (all length-clamped). */
export function handleCandidates(base: string, max = 50): string[] {
  const out = [base]
  for (let i = 2; i <= max; i++) {
    const suffix = `-${i}`
    out.push(`${base.slice(0, HANDLE_MAX - suffix.length)}${suffix}`)
  }
  return out
}
