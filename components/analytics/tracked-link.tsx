'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { track } from './posthog-provider'

type Props = ComponentProps<typeof Link> & {
  event: string
  eventProps?: Record<string, unknown>
}

export function TrackedLink({ event, eventProps, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        track(event, eventProps)
        onClick?.(e)
      }}
    />
  )
}
