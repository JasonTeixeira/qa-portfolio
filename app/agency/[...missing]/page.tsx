import { notFound } from 'next/navigation'

// Belt-and-suspenders 404 routing. Segment-level not-found.tsx only handles
// notFound() thrown inside /agency — an unknown /agency/* path would otherwise
// fall through to the root (off-brand) app/not-found.tsx. The host proxy
// rewrites unknown agency-subdomain paths onto /agency/<x>, which lands here;
// calling notFound() renders the branded app/agency/not-found.tsx with a 404.
export default function AgencyCatchAll() {
  notFound()
}
