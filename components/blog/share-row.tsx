'use client'

import { useState } from 'react'
import { Linkedin, Twitter, Link as LinkIcon } from 'lucide-react'

export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <span className="text-xs text-[var(--sage-ink-faint)]">Share:</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-2 text-[var(--sage-ink-faint)] transition-colors hover:border-[rgba(61,90,254,0.5)] hover:text-[var(--sage-accent-readable)]"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-2 text-[var(--sage-ink-faint)] transition-colors hover:border-[rgba(61,90,254,0.5)] hover:text-[var(--sage-accent-readable)]"
        aria-label="Share on X"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-2 text-[var(--sage-ink-faint)] transition-colors hover:border-[rgba(61,90,254,0.5)] hover:text-[var(--sage-accent-readable)]"
        aria-label={copied ? 'Copied link' : 'Copy link'}
      >
        {copied ? (
          <span className="block min-w-12 px-1 text-center font-mono text-[10px] uppercase tracking-[0.12em]">
            Copied
          </span>
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
