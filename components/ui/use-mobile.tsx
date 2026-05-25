import * as React from 'react'

const MOBILE_BREAKPOINT = 768
const MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

// Subscribe to viewport-width changes via matchMedia. Implemented with
// useSyncExternalStore (instead of useEffect + setState) so React's
// react-hooks/set-state-in-effect lint rule is satisfied and SSR has a
// deterministic snapshot.
function subscribe(onChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mql = window.matchMedia(MEDIA_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(MEDIA_QUERY).matches
}

// Default to "not mobile" on the server. The first client paint will still
// reconcile to the real value before any user interaction.
function getServerSnapshot(): boolean {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
