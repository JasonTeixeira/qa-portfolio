'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { markLessonComplete } from '@/app/academy/_actions/progress'
import styles from './lab.module.css'

const PYODIDE_VERSION = '0.26.4'
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<any>
  }
}

type Status = 'loading' | 'ready' | 'running' | 'error'

export function LabRunner({
  title,
  summary,
  starter,
  check,
  backHref,
  courseSlug,
  lessonSlug,
}: {
  title: string
  summary: string
  starter: string
  check?: string
  backHref: string
  courseSlug: string
  lessonSlug: string
}) {
  const [code, setCode] = useState(starter)
  const [output, setOutput] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [passed, setPassed] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completing, startComplete] = useTransition()
  const pyodideRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script')
            s.src = `${PYODIDE_BASE}pyodide.js`
            s.onload = () => resolve()
            s.onerror = () => reject(new Error('Failed to load Python runtime'))
            document.head.appendChild(s)
          })
        }
        const py = await window.loadPyodide!({ indexURL: PYODIDE_BASE })
        if (cancelled) return
        pyodideRef.current = py
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    boot()
    return () => { cancelled = true }
  }, [])

  const run = async () => {
    const py = pyodideRef.current
    if (!py || status === 'running') return
    setStatus('running')
    let buf = ''
    py.setStdout({ batched: (s: string) => (buf += s + '\n') })
    py.setStderr({ batched: (s: string) => (buf += s + '\n') })
    try {
      await py.runPythonAsync(code)
      setOutput(buf.length ? buf : '(ran with no output)')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setOutput((buf ? buf + '\n' : '') + msg)
      buf = ''
    }
    if (check && buf.toLowerCase().includes(check.trim().toLowerCase())) setPassed(true)
    setStatus('ready')
  }

  const complete = () => {
    startComplete(async () => {
      const res = await markLessonComplete(courseSlug, lessonSlug)
      if (res.ok) setCompleted(true)
    })
  }

  const runnable = status === 'ready'

  // ⌘/Ctrl + Enter runs the code from inside the editor.
  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run() }
  }

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <Link href={backHref} className={styles.back}>← Back to lesson</Link>
        <span className={styles.title}>⬡ LAB · {title}</span>
        <span className={styles.spacer} />
        <span className={styles.kbdHint} aria-hidden="true"><kbd>⌘</kbd><kbd>↵</kbd> run</span>
        <button type="button" className={styles.reset} onClick={() => { setCode(starter); setOutput(null); setPassed(false) }}>Reset</button>
        <button type="button" className={styles.run} onClick={run} disabled={!runnable} aria-keyshortcuts="Meta+Enter Control+Enter">
          {status === 'loading' ? 'Loading Python…' : status === 'running' ? 'Running…' : '▶ Run'}
        </button>
      </header>

      <p className={styles.summary}>{summary}</p>

      {check ? (
        <div className={styles.checkpoint} data-passed={passed} role="status" aria-live="polite">
          {passed ? (
            completed ? (
              <span className={styles.cpDone}>
                ✓ Checkpoint complete — saved to your progress.{' '}
                <Link href={backHref} className={styles.cpLink}>Back to lesson →</Link>
              </span>
            ) : (
              <>
                <span className={styles.cpPass}>✓ Checkpoint passed! Your output matches.</span>
                <button type="button" className={styles.cpComplete} onClick={complete} disabled={completing}>
                  {completing ? 'Saving…' : 'Mark lesson complete →'}
                </button>
              </>
            )
          ) : (
            <span className={styles.cpGoal}>🎯 Checkpoint: edit the code and Run until the output is correct.</span>
          )}
        </div>
      ) : null}

      <div className={styles.grid}>
        <section className={styles.editorPane} aria-label="Code editor">
          <div className={styles.paneBar}><span className={styles.dots}><i /><i /><i /></span><span className={styles.fileName}>main.py</span></div>
          <textarea className={styles.editor} value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={onEditorKeyDown} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-label="Python code" />
        </section>
        <section className={styles.outputPane} aria-label="Output">
          <div className={styles.paneBar}><span className={styles.outLabel}>▸ output</span>
            {status === 'error' ? <span className={styles.errTag}>runtime failed to load</span> : null}
          </div>
          <pre className={styles.output} role="status" aria-live="polite">
            {status === 'loading' ? 'Booting the Python runtime…'
              : status === 'error' ? 'Could not load the Python runtime. Check your connection and reload.'
              : output ?? 'Press Run to execute your code.'}
          </pre>
        </section>
      </div>
    </div>
  )
}
