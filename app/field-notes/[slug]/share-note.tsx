'use client'

import { useState } from 'react'

/**
 * Minimal stand-in for the design's sage-share widget ("share →" in the
 * byline): native share sheet where available, clipboard copy otherwise.
 */
export function ShareNote({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // User dismissed the share sheet or clipboard was denied — no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      style={{
        background: 'none',
        border: 0,
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-mono), monospace',
        fontSize: 11,
        color: copied ? '#18B663' : '#8FA0FF',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? 'copied ✓' : 'share →'}
    </button>
  )
}
