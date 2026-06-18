import { track } from '@/components/analytics/posthog-provider'

export const EVENT_NAMES = [
  'cta_click',
  'contact_submit',
  'pricing_view',
  'service_view',
  'checkout_start',
  'checkout_complete',
  'lead_magnet_start',
  'lead_magnet_complete',
  'booking_click',
  'newsletter_signup',
  'decision_tree_complete',
  'work_archive_lab_click',
  'case_study_cta_primary',
  'case_study_cta_secondary',
  'route_finder_start',
  'route_finder_step',
  'route_finder_complete',
  'route_finder_cta_click',
  'route_console_open',
  'route_console_click',
  'sound_enabled',
  'splash_skipped',
  'academy_track_selected',
  'experiment_viewed',
] as const

export type EventName = (typeof EVENT_NAMES)[number]

export const GA4_CONVERSION_EVENTS = [
  'contact_submit',
  'checkout_start',
  'lead_magnet_complete',
  'newsletter_signup',
  'route_finder_complete',
] as const satisfies readonly EventName[]

export function isValidEvent(name: string): name is EventName {
  return (EVENT_NAMES as readonly string[]).includes(name)
}

type Payloads = {
  cta_click: { location: string; label: string; href?: string }
  contact_submit: { inquiryType?: string; budget?: string }
  pricing_view: { surface: string }
  service_view: { slug: string }
  checkout_start: { slug: string; priceCents: number }
  checkout_complete: { slug: string }
  lead_magnet_start: { tool: 'seo_audit' }
  lead_magnet_complete: { tool: 'seo_audit'; score: number }
  booking_click: { location: string }
  newsletter_signup: { source: string }
  decision_tree_complete: { stage: string; pain: string }
  work_archive_lab_click: Record<string, never>
  case_study_cta_primary: { slug?: string }
  case_study_cta_secondary: { slug?: string }
  route_finder_start: { source?: string }
  route_finder_step: { field: 'goal' | 'stage' | 'budget' | 'timeline'; value: string; route: string }
  route_finder_complete: { route: string; score: number; goal: string; stage: string; budget: string; timeline: string }
  route_finder_cta_click: { route: string; label: string; href: string; location: 'result' | 'form' }
  route_console_open: { mode: 'services' | 'resources' | 'mobile'; trigger: 'hover' | 'click' | 'mobile_toggle' }
  route_console_click: { mode: 'services' | 'resources' | 'mobile'; label: string; href: string; lane?: string }
  sound_enabled: { location: 'home'; state: 'on' | 'off' }
  splash_skipped: { reason: 'timeout' | 'reduced_motion' | 'loaded' | 'library_failure' | 'skipped' }
  academy_track_selected: { slug: string; title: string; location: 'academy_index' | 'academy_track' | 'article' }
  experiment_viewed: { flag: string; variant: 'control' | 'treatment' }
}

export function trackEvent<E extends EventName>(name: E, props: Payloads[E]): void {
  track(name, props as Record<string, unknown>)
  trackGa4Event(name, props as Record<string, unknown>)
}

function trackGa4Event(name: EventName, props: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  try {
    window.gtag('event', name, {
      ...props,
      conversion: (GA4_CONVERSION_EVENTS as readonly string[]).includes(name),
    })
  } catch {
    // Analytics should never interfere with conversion actions.
  }
}
