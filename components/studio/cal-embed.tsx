'use client'

import Cal, { getCalApi } from '@calcom/embed-react'
import { useEffect } from 'react'

export function CalEmbed({ calLink = 'sage-ideas/discovery' }: { calLink?: string }) {
  useEffect(() => {
    ;(async () => {
      const cal = await getCalApi()
      cal('ui', {
        theme: 'dark',
        styles: { branding: { brandColor: '#06B6D4' } },
      })
    })()
  }, [])

  return (
    <Cal
      calLink={calLink}
      style={{ width: '100%', height: '100%', minHeight: 700 }}
      config={{ layout: 'month_view' }}
    />
  )
}
