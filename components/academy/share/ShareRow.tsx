'use client'

import { useState } from 'react'
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
      <button type="button" className={styles.btn} onClick={copy}>
        {copied ? '✓ Copied' : '⧉ Copy link'}
      </button>
      <a className={styles.btn} href={linkedInCert ?? linkedInShare} target="_blank" rel="noopener noreferrer">
        in {cert ? 'Add to LinkedIn' : 'Share on LinkedIn'}
      </a>
      <a className={styles.btn} href={xShare} target="_blank" rel="noopener noreferrer">
        𝕏 Share
      </a>
    </div>
  )
}
