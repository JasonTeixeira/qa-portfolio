'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { markLessonComplete } from '@/app/academy/_actions/progress'
import { verifyLab } from '@/app/academy/_actions/evidence'
import { useSound } from '@/hooks/useSound'
import { Icon } from '@/components/academy/ui/Icon'
import { loadRuntime, normalizeLanguage, RUNTIME_LABEL, RUNTIME_FILE, type LabRuntime } from './runtimes'
import styles from './lab.module.css'

type Status = 'loading' | 'ready' | 'running' | 'error'

export function LabRunner({
  title,
  summary,
  starter,
  stdin,
  language,
  hasCheck,
  backHref,
  courseSlug,
  lessonSlug,
}: {
  title: string
  summary: string
  starter: string
  stdin?: string
  language?: string
  hasCheck?: boolean
  backHref: string
  courseSlug: string
  lessonSlug: string
}) {
  const lang = normalizeLanguage(language)
  const [code, setCode] = useState(starter)
  const [output, setOutput] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  // `passed`/`verified` are driven ONLY by the server verdict — never a client match.
  const [passed, setPassed] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completing, startComplete] = useTransition()
  const { play } = useSound()
  const runtimeRef = useRef<LabRuntime | null>(null)
  // The exact stdout buffer from the most recent run — submitted to the server so
  // it can verify the lab against the server-held `check` string. The expected
  // value never reaches the client.
  const lastOutputRef = useRef<string>('')

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        const rt = await loadRuntime(lang)
        if (cancelled) return
        runtimeRef.current = rt
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    boot()
    return () => { cancelled = true }
  }, [lang])

  const run = async () => {
    const rt = runtimeRef.current
    if (!rt || status === 'running') return
    setStatus('running')
    let buf = ''
    try {
      buf = await rt.run(code, stdin)
      setOutput(buf.length ? buf : '(ran with no output)')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setOutput(msg)
      buf = ''
    }
    // Capture the stdout for server-side verification. Running fresh code
    // invalidates any prior verdict — the learner must re-verify.
    lastOutputRef.current = buf
    setPassed(false)
    setStatus('ready')
  }

  // Server-authoritative verdict: submit the captured stdout; the server re-runs
  // the comparison against its own `check` and returns the only pass/fail that counts.
  const verify = async () => {
    if (verifying || passed) return
    setVerifying(true)
    try {
      const { verified } = await verifyLab(courseSlug, lessonSlug, lastOutputRef.current)
      setPassed(verified)
      if (verified) {
        // Subtle mobile haptic + opt-in success tone on the primary completion
        // moment. Both are no-ops under reduced-motion / when unsupported.
        navigator.vibrate?.(15)
        play('success')
      }
    } finally {
      setVerifying(false)
    }
  }

  const complete = () => {
    startComplete(async () => {
      // verifyLab already recorded the verified-lab evidence; just mark the
      // lesson done. userId is derived server-side from the session.
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
        <Link href={backHref} className={styles.back}><Icon name="arrow-left" size={15} /> Back to lesson</Link>
        <span className={styles.title}><Icon name="bolt" size={14} /> LAB · {title}</span>
        <span className={styles.spacer} />
        <span className={styles.kbdHint} aria-hidden="true"><kbd>⌘</kbd><kbd>↵</kbd> run</span>
        <button type="button" className={styles.reset} onClick={() => { setCode(starter); setOutput(null); setPassed(false); lastOutputRef.current = '' }}>Reset</button>
        <button type="button" className={styles.run} onClick={run} disabled={!runnable} aria-keyshortcuts="Meta+Enter Control+Enter">
          {status === 'loading' ? `Loading ${RUNTIME_LABEL[lang]}…` : status === 'running' ? 'Running…' : (<><Icon name="play" size={14} /> Run</>)}
        </button>
      </header>

      <p className={styles.summary}>{summary}</p>

      {hasCheck ? (
        <div className={styles.checkpoint} data-passed={passed} role="status" aria-live="polite">
          {passed ? (
            completed ? (
              <span className={styles.cpDone}>
                <Icon name="check" size={15} /> Checkpoint complete — saved to your progress.{' '}
                <Link href={backHref} className={styles.cpLink}>Back to lesson <Icon name="arrow-right" size={14} /></Link>
              </span>
            ) : (
              <>
                <span className={styles.cpPass}><Icon name="check" size={15} /> Checkpoint verified! Your solution is correct.</span>
                <button type="button" className={styles.cpComplete} onClick={complete} disabled={completing}>
                  {completing ? 'Saving…' : (<>Mark lesson complete <Icon name="arrow-right" size={14} /></>)}
                </button>
              </>
            )
          ) : (
            <>
              <span className={styles.cpGoal}><Icon name="target" size={15} /> Checkpoint: edit and Run your code, then check your solution.</span>
              <button type="button" className={styles.cpComplete} onClick={verify} disabled={verifying || status !== 'ready'}>
                {verifying ? 'Checking…' : 'Check my solution'}
              </button>
            </>
          )}
        </div>
      ) : null}

      <div className={styles.grid}>
        <section className={styles.editorPane} aria-label="Code editor">
          <div className={styles.paneBar}><span className={styles.dots}><i /><i /><i /></span><span className={styles.fileName}>{RUNTIME_FILE[lang]}</span></div>
          <textarea className={styles.editor} value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={onEditorKeyDown} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-label={`${RUNTIME_LABEL[lang]} code`} />
        </section>
        <section className={styles.outputPane} aria-label="Output">
          <div className={styles.paneBar}><span className={styles.outLabel}><Icon name="chevron-right" size={13} /> output</span>
            {status === 'error' ? <span className={styles.errTag}>runtime failed to load</span> : null}
          </div>
          <pre className={styles.output} data-empty={status !== 'error' && output == null ? 'true' : undefined} role="status" aria-live="polite">
            {status === 'error' ? `Could not load the ${RUNTIME_LABEL[lang]} runtime. Check your connection and reload.`
              : output != null ? output
              : (
                <span className={styles.outEmpty}>
                  <span className={styles.outEmptyMark} aria-hidden="true"><Icon name="play" size={18} /></span>
                  <span className={styles.outEmptyLine}>
                    {status === 'loading' ? `Booting the ${RUNTIME_LABEL[lang]} runtime…` : 'Press Run to execute your code.'}
                  </span>
                </span>
              )}
          </pre>
        </section>
      </div>
    </div>
  )
}
