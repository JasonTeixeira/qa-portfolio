import { notFound } from 'next/navigation'

/**
 * Catch-all 404 for the main site. With multiple root layouts (the (main)
 * group + /agency), Next.js no longer routes unmatched URLs through the
 * group's not-found.tsx on its own — the default framework 404 would render
 * instead. This catch-all claims every otherwise-unmatched URL for the (main)
 * root layout and delegates to app/(main)/not-found.tsx ("failed its check"),
 * preserving the pre-restructure behavior. /agency/* is unaffected: its own
 * [...missing] catch-all is more specific and wins.
 */
export default function NotFoundCatchAll(): never {
  notFound()
}
