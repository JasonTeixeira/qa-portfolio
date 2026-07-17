'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { loadPythonRuntime, type LabRuntime } from '@/components/academy/lab/runtimes'
import { saveArtifact } from '@/app/academy/interview/_actions'
import type { SeedTest } from './types'
import styles from './session.module.css'

type Props = {
  sessionId: string
  seedCode: string | null
  seedTests: SeedTest[]
}

/** The pass/fail outcome for one test after a run. */
type TestResult = { name: string; passed: boolean; hidden: boolean }

/** A rare in-band delimiter so candidate stdout never collides with our markers. */
const MARK = '§TR§'

/** Base64-encode a JSON payload safely for embedding in a Python literal (unicode-safe). */
function encodePayload(tests: { name: string; expr: string }[]): string {
  const json = JSON.stringify(tests)
  return btoa(unescape(encodeURIComponent(json)))
}

/**
 * Build the Python program: the candidate's code, then a harness that evaluates
 * each test's boolean `expr` in isolation and prints one deterministic marker line
 * per test. The exprs are passed base64-encoded (never rendered), so quoting in a
 * test expression can't break the harness, and a per-test try/except turns any
 * failure into a clean FAIL rather than aborting the whole run.
 */
function buildProgram(userCode: string, tests: SeedTest[]): string {
  const payload = encodePayload(tests.map((t) => ({ name: t.name, expr: t.expr })))
  return (
    `${userCode}\n\n` +
    `import json as __ivjson, base64 as __ivb64\n` +
    `__iv_tests = __ivjson.loads(__ivb64.b64decode("${payload}").decode("utf-8"))\n` +
    `for __iv_t in __iv_tests:\n` +
    `    try:\n` +
    `        __iv_ok = bool(eval(__iv_t["expr"]))\n` +
    `    except Exception:\n` +
    `        __iv_ok = False\n` +
    `    print("${MARK}" + __iv_t["name"] + "${MARK}" + ("1" if __iv_ok else "0"))\n`
  )
}

/** Parse the harness marker lines out of raw stdout into a name→passed map. */
function parseResults(stdout: string): Map<string, boolean> {
  const out = new Map<string, boolean>()
  for (const line of stdout.split('\n')) {
    if (!line.startsWith(MARK)) continue
    const rest = line.slice(MARK.length)
    const sep = rest.lastIndexOf(MARK)
    if (sep === -1) continue
    const name = rest.slice(0, sep)
    out.set(name, rest.slice(sep + MARK.length) === '1')
  }
  return out
}

/**
 * The coding workspace — the hero of the mock. An editable Python editor seeded with
 * `scenario.seed_code`, a "Run tests" button that runs the VISIBLE suite as a live
 * checklist plus the HIDDEN test(s) in-browser (Pyodide), and the honest verification
 * signal: `caught_the_lie` is true only when the submission passes the hidden test —
 * a solution that only greens the visible suite got fooled. Each run persists a `code`
 * artifact (filename, code, per-test results, caught_the_lie) that the committee grader
 * weighs. Hidden test EXPRESSIONS are never rendered — only a name + pass/fail after a run.
 */
export function CodingWorkspace({ sessionId, seedCode, seedTests }: Props) {
  const starter = seedCode ?? '# Write your solution here.\n'
  const [code, setCode] = useState(starter)
  const [status, setStatus] = useState<'loading' | 'ready' | 'running' | 'error'>('loading')
  const [results, setResults] = useState<Map<string, boolean> | null>(null)
  const [caught, setCaught] = useState<boolean | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const runtimeRef = useRef<LabRuntime | null>(null)
  const gutterRef = useRef<HTMLDivElement | null>(null)

  const visible = useMemo(() => seedTests.filter((t) => !t.hidden), [seedTests])
  const hidden = useMemo(() => seedTests.filter((t) => t.hidden), [seedTests])

  // Boot Pyodide on demand (the same runtime the academy labs use).
  useEffect(() => {
    let cancelled = false
    loadPythonRuntime()
      .then((rt) => {
        if (cancelled) return
        runtimeRef.current = rt
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const lineCount = useMemo(() => Math.max(1, code.split('\n').length), [code])
  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop
  }

  const run = async () => {
    const rt = runtimeRef.current
    if (!rt || status !== 'ready') return
    setStatus('running')
    setRunError(null)
    try {
      const stdout = await rt.run(buildProgram(code, seedTests))
      const parsed = parseResults(stdout)
      setResults(parsed)
      // caught_the_lie: there IS a hidden test and the submission passes every one.
      const caughtLie = hidden.length > 0 && hidden.every((t) => parsed.get(t.name) === true)
      setCaught(caughtLie)

      const testResults: TestResult[] = seedTests.map((t) => ({
        name: t.name,
        passed: parsed.get(t.name) === true,
        hidden: t.hidden,
      }))
      // Persist the code artifact so the committee grader can weigh caught_the_lie.
      setSaveState('saving')
      const res = await saveArtifact({
        sessionId,
        kind: 'code',
        payload: { filename: 'solution.py', code, test_results: testResults, caught_the_lie: caughtLie },
      })
      setSaveState(res.ok ? 'saved' : 'error')
    } catch (e: unknown) {
      setRunError(e instanceof Error ? e.message : String(e))
      setResults(null)
      setCaught(null)
    } finally {
      setStatus('ready')
    }
  }

  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void run()
    }
  }

  const reset = () => {
    setCode(starter)
    setResults(null)
    setCaught(null)
    setRunError(null)
    setSaveState('idle')
  }

  const runLabel =
    status === 'loading' ? 'Loading Python…' : status === 'running' ? 'Running…' : '▶ Run tests'

  const testState = (name: string): 'pass' | 'fail' | 'pending' => {
    if (!results) return 'pending'
    return results.get(name) ? 'pass' : 'fail'
  }
  const mark = (name: string): string => {
    if (!results) return '·'
    return results.get(name) ? '✓' : '✗'
  }

  return (
    <div className={styles.editorCard}>
      <div className={styles.editorBar}>
        <span className={styles.fileName}>solution.py</span>
        <span className={styles.saveState}>
          {status === 'error'
            ? 'runtime error'
            : status === 'ready' && results
            ? saveState === 'saved'
              ? 'run saved'
              : saveState === 'saving'
              ? 'saving…'
              : saveState === 'error'
              ? 'save failed'
              : 'ran'
            : status === 'ready'
            ? 'Python ready'
            : 'booting Python…'}
        </span>
        <button type="button" className={styles.resetBtn} onClick={reset}>
          reset
        </button>
        <button type="button" className={styles.runBtn} onClick={run} disabled={status !== 'ready'}>
          {runLabel}
        </button>
      </div>

      <div className={styles.editorBody}>
        <div className={styles.gutter} ref={gutterRef} aria-hidden>
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i} className={styles.lineNo}>
              {i + 1}
            </span>
          ))}
        </div>
        <textarea
          className={styles.editor}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={onEditorKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          aria-label="Python solution"
        />
      </div>

      {runError ? (
        <pre className={styles.runOut} data-state="error">
          {runError}
        </pre>
      ) : null}

      <div className={styles.tests}>
        <div className={styles.testsHead}>
          <span className={styles.testsLabel}>Tests</span>
          <span
            className={styles.testNote}
            style={{ color: results ? 'var(--iv-gold)' : 'var(--sa-ink-ghost)' }}
          >
            {results
              ? 'a green bar is not proof — did you catch the lying test?'
              : 'run to see which tests pass'}
          </span>
        </div>

        <div className={styles.testRow}>
          {visible.map((t) => (
            <span key={t.name} className={styles.test} data-state={testState(t.name)}>
              {mark(t.name)} {t.name}
            </span>
          ))}
        </div>

        {/* HIDDEN tests: masked (count only) until a run; revealed as name + pass/fail
            afterward, labeled "hidden". The expression is never rendered. */}
        {hidden.length > 0 ? (
          <div className={styles.testRow}>
            {!results ? (
              <span className={styles.hiddenMasked}>
                🔒 {hidden.length} hidden test{hidden.length > 1 ? 's' : ''} — revealed after you run
              </span>
            ) : (
              hidden.map((t) => (
                <span key={t.name} className={styles.test} data-state={testState(t.name)}>
                  {mark(t.name)} {t.name} <span className={styles.hiddenTag}>hidden</span>
                </span>
              ))
            )}
          </div>
        ) : null}

        {caught !== null ? (
          <div className={styles.caught} data-caught={caught}>
            {caught
              ? '✓ You caught the lying test — verification held.'
              : '✗ The hidden test failed — a green visible bar fooled this solution.'}
          </div>
        ) : null}
      </div>
    </div>
  )
}
