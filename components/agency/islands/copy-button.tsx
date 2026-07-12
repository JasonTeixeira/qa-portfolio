'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const COPIED_RESET_MS = 2000

interface CopyButtonProps {
  /** The exact text placed on the clipboard. */
  text: string
}

/**
 * Tiny copy-to-clipboard affordance for code panels — COPY → ✓ COPIED.
 * Absolutely positioned top-right; the parent panel owns position: relative.
 */
export function CopyButton({ text }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setIsCopied(false), COPIED_RESET_MS)
    } catch {
      // Clipboard unavailable (permissions / non-secure context) — leave the
      // button in its resting state rather than claiming a copy that didn't happen.
    }
  }, [text])

  return (
    <button
      type="button"
      className="ag-copy-btn"
      onClick={handleCopy}
      aria-live="polite"
      data-copied={isCopied ? 'true' : undefined}
    >
      {isCopied ? '✓ COPIED' : 'COPY'}
    </button>
  )
}
