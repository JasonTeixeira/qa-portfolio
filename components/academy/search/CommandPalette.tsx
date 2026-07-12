'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { searchAcademy } from '@/app/(main)/academy/_actions/search'
import type { RankedSearchItem, SearchItemKind } from '@/lib/academy/search-logic'

/**
 * ⌘K / Ctrl-K global command palette for the academy — searches courses,
 * lessons, and topics. Token-styled, restrained (no glow). Fully keyboard
 * operable: a combobox input controls a listbox via aria-activedescendant;
 * arrows move the active option, Enter navigates, Esc closes. Focus moves to
 * the input on open and returns to the trigger on close, and is trapped within
 * the dialog while open. Honest empty states — never fabricates results.
 */

const DEBOUNCE_MS = 160

const KIND_LABEL: Record<SearchItemKind, string> = {
  course: 'Course',
  lesson: 'Lesson',
  topic: 'Topic',
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RankedSearchItem[]>([])
  const [active, setActive] = useState(0)
  const [pending, setPending] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const listId = useId()
  const optionId = (index: number) => `${listId}-option-${index}`

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setResults([])
    setActive(0)
    // Return focus to the trigger that opened the palette.
    triggerRef.current?.focus()
  }, [])

  // Global ⌘K / Ctrl-K to open.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Move focus to the input when the dialog opens.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Debounced search against the server action. Stale responses are discarded.
  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (!q) {
      setResults([])
      setActive(0)
      setPending(false)
      return
    }
    setPending(true)
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const found = await searchAcademy(q)
        if (cancelled) return
        setResults(found)
        setActive(0)
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setPending(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, open])

  function go(item: RankedSearchItem | undefined) {
    if (!item) return
    close()
    router.push(item.href)
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      go(results[active])
    }
  }

  // Trap focus inside the dialog while open (Tab/Shift-Tab cycle).
  function onDialogKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab') return
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'input, button, [href], [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable || focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const showEmpty = open && query.trim().length > 0 && !pending && results.length === 0

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Search the academy"
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ac-rule)] bg-[color:var(--ac-surface)] px-3 py-1.5 text-[12px] font-medium text-[color:var(--ac-ink-soft)] transition-colors hover:border-[color:var(--ac-rule-strong)] hover:text-[var(--ac-ink)]"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Search</span>
        <kbd
          aria-hidden
          className="hidden rounded-[4px] border border-[color:var(--ac-rule)] px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--ac-ink-faint)] sm:inline"
        >
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
          onMouseDown={(e) => {
            // Click on the backdrop (not the panel) closes.
            if (e.target === e.currentTarget) close()
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Academy search"
            onKeyDown={onDialogKeyDown}
            className="relative w-full max-w-xl overflow-hidden rounded-[var(--ac-radius)] border border-[color:var(--ac-rule-strong)] bg-[color:var(--ac-surface)] shadow-[var(--ac-shadow)]"
          >
            <div className="flex items-center gap-3 border-b border-[color:var(--ac-rule)] px-4">
              <SearchIcon />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={results.length ? optionId(active) : undefined}
                aria-label="Search courses, lessons, and topics"
                placeholder="Search courses, lessons, topics…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                className="h-12 w-full bg-transparent text-[15px] text-[var(--ac-ink)] outline-none placeholder:text-[color:var(--ac-ink-faint)]"
              />
            </div>

            <ul
              id={listId}
              role="listbox"
              aria-label="Search results"
              className="max-h-[50vh] overflow-y-auto py-1"
            >
              {results.map((item, index) => {
                const isActive = index === active
                return (
                  <li
                    key={`${item.kind}:${item.href}`}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      go(item)
                    }}
                    className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-[14px] ${
                      isActive
                        ? 'bg-[color-mix(in_srgb,var(--ac-accent)_14%,transparent)] text-[var(--ac-ink)]'
                        : 'text-[color:var(--ac-ink-soft)]'
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ac-ink-faint)]">
                      {KIND_LABEL[item.kind]}
                    </span>
                  </li>
                )
              })}
            </ul>

            {showEmpty ? (
              <p className="px-4 py-6 text-center text-[13px] text-[color:var(--ac-ink-faint)]">
                No matches for “{query.trim()}”.
              </p>
            ) : null}

            {open && !query.trim() ? (
              <p className="px-4 py-6 text-center text-[13px] text-[color:var(--ac-ink-faint)]">
                Search across courses, lessons, and topics.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-[color:var(--ac-ink-faint)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}
