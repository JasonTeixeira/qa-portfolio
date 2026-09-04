'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './share.module.css'

/**
 * Share controls for proof surfaces (certificates, public profiles). Copy-link +
 * LinkedIn + X. `addToLinkedIn` switches LinkedIn to the add-to-profile cert flow.
 */
export function ShareRow({
  url,
  text,
  cert,
}: {
  url: string
  text: string
  cert?: { name: string; issuedYear: number; issuedMonth: number; certId: string }
}) {
  const [copied, setCopied] = useState(false)
  // Native share sheet (mobile) — detected client-side to avoid a hydration
  // mismatch; dramatically higher share rate than link buttons on phones.
  const [canNativeShare, setCanNativeShare] = useState(false)
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  async function nativeShare() {
    try {
      await navigator.share({ title: cert ? cert.name : 'Sage Academy', text, url })
    } catch {
      /* user dismissed the share sheet */
    }
  }

  const enc = encodeURIComponent
  const linkedInShare = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`
  const linkedInCert = cert
    ? `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${enc(
        cert.name,
      )}&organizationName=Sage+Academy&issueYear=${cert.issuedYear}&issueMonth=${cert.issuedMonth}&certUrl=${enc(
        url,
      )}&certId=${enc(cert.certId)}`
    : null
  const xShare = `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — the share links still work */
    }
  }

  return (
    <div className={styles.row}>
      {canNativeShare ? (
        <button type="button" className={styles.btn} onClick={nativeShare}>
          <Icon name="arrow-right" size={14} aria-hidden="true" /> Share
        </button>
      ) : null}
      <button type="button" className={styles.btn} onClick={copy}>
        {copied ? (
          <>
            <Icon name="check" size={14} aria-hidden="true" /> Copied
          </>
        ) : (
          'Copy link'
        )}
      </button>
      <a className={styles.btn} href={linkedInCert ?? linkedInShare} target="_blank" rel="noopener noreferrer">
        {cert ? 'Add to LinkedIn' : 'Share on LinkedIn'}
      </a>
      <a className={styles.btn} href={xShare} target="_blank" rel="noopener noreferrer">
        Share on X
      </a>
    </div>
  )
}
