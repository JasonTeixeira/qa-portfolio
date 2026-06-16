'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { trackEvent, type EventName } from '@/lib/analytics/events'

type Props = ComponentProps<typeof Link> & {
  event: EventName
  eventProps?: Record<string, unknown>
}

export function TrackedLink({ event, eventProps, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        trackEvent(event, eventProps as never)
        onClick?.(e)
      }}
    />
  )
}
