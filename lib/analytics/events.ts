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
] as const

export type EventName = (typeof EVENT_NAMES)[number]

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
}

export function trackEvent<E extends EventName>(name: E, props: Payloads[E]): void {
  track(name, props as Record<string, unknown>)
}
