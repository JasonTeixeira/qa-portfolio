'use client'

import { useState } from 'react'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './leagues.module.css'

/**
 * "copy invite" button for the cohort card. Copies the REAL referral link to the
 * clipboard (same link the referral page issues). Clipboard-blocked contexts fail
 * silently — the link text stays visible beside the button so it's still usable.
 */
export function CopyInvite({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — the visible link is the fallback */
    }
  }

  return (
    <button type="button" className={styles.copyBtn} onClick={copy} aria-live="polite">
      {copied ? (
        <>
          <Icon name="check" size={14} aria-hidden="true" /> copied
        </>
      ) : (
        'copy invite'
      )}
    </button>
  )
}
