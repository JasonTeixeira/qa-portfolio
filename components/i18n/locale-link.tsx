'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { useLocale } from './locale-provider'
import { localizeHref } from '@/lib/i18n/href'

/**
 * Drop-in replacement for next/link that keeps the reader inside their locale —
 * internal hrefs are auto-prefixed with the active locale (no-op for English).
 */
export function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useLocale()
  const localized = typeof href === 'string' ? localizeHref(href, locale) : href
  return <Link href={localized} {...props} />
}
