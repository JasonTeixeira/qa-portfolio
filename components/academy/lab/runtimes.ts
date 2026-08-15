'use client'

/**
 * Multi-runtime lab execution. Each runtime loads on demand and exposes the same shape —
 * `run(code, stdin?) => Promise<string>` returning the exact stdout text that gets submitted
 * to the server for `verifyLab` (substring match vs the authored `check`). The output FORMAT
 * per language is a fixed contract, mirrored byte-for-byte by the offline verifier
 * (scripts/academy/authoring/run-labs-check.mjs) so an authored `check` that passes offline
 * passes in the browser.
 *
 * - python → Pyodide (WASM, CDN). stdout as printed.
 * - sql    → sql.js (SQLite WASM, CDN). Each result set: header row then data rows, cells
 *            joined by " | " (matches `sqlite3 -cmd ".mode list" ".separator ' | '" ".headers on"`).
 * - js     → sandboxed Web Worker (no DOM/window, no external dep). console.log lines; each arg
 *            stringified (objects via JSON.stringify, else String), joined by " ".
 */

export type LabLanguage = 'python' | 'sql' | 'js'

export interface LabRuntime {
  run(code: string, stdin?: string): Promise<string>
}

export function normalizeLanguage(lang?: string): LabLanguage {
  const l = (lang ?? '').toLowerCase()
  if (l === 'sql') return 'sql'
  if (l === 'js' || l === 'ts' || l === 'javascript' || l === 'typescript') return 'js'
  return 'python'
}

export const RUNTIME_LABEL: Record<LabLanguage, string> = { python: 'Python', sql: 'SQL', js: 'JavaScript' }
export const RUNTIME_FILE: Record<LabLanguage, string> = { python: 'main.py', sql: 'query.sql', js: 'main.js' }

// ---------- Python (Pyodide) ----------

const PYODIDE_VERSION = '0.26.4'
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

const STDIN_PREAMBLE = `
import builtins as __b__
__lab_lines__ = list(__lab_stdin_lines__)
__lab_pos__ = [0]
def __lab_input__(prompt=''):
    i = __lab_pos__[0]
    __lab_pos__[0] = i + 1
    return __lab_lines__[i] if i < len(__lab_lines__) else ''
__b__.input = __lab_input__
`

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

export async function loadPythonRuntime(): Promise<LabRuntime> {
  const w = window as unknown as { loadPyodide?: (o: { indexURL: string }) => Promise<PyodideLike> }
  if (!w.loadPyodide) await loadScript(`${PYODIDE_BASE}pyodide.js`)
  const py = await w.loadPyodide!({ indexURL: PYODIDE_BASE })
  return {
    async run(code, stdin) {
      let buf = ''
      py.setStdout({ batched: (s: string) => (buf += s + '\n') })
      py.setStderr({ batched: (s: string) => (buf += s + '\n') })
      if (stdin != null) {
        py.globals.set('__lab_stdin_lines__', stdin.split('\n'))
        await py.runPythonAsync(STDIN_PREAMBLE)
      }
      await py.runPythonAsync(code)
      return buf
    },
  }
}

interface PyodideLike {
  setStdout(o: { batched: (s: string) => void }): void
  setStderr(o: { batched: (s: string) => void }): void
  globals: { set(k: string, v: unknown): void }
  runPythonAsync(code: string): Promise<unknown>
}

// ---------- SQL (sql.js) ----------

const SQLJS_BASE = 'https://cdn.jsdelivr.net/npm/sql.js@1.11.0/dist/'

interface SqlResult { columns: string[]; values: unknown[][] }
interface SqlDb { exec(sql: string): SqlResult[] }
interface SqlJsStatic { Database: new () => SqlDb }

/** Format sql.js results to match `sqlite3 .mode list / .separator " | " / .headers on`. */
export function formatSqlResults(results: SqlResult[]): string {
  const lines: string[] = []
  for (const r of results) {
    lines.push(r.columns.join(' | '))
    for (const row of r.values) lines.push(row.map((c) => (c == null ? '' : String(c))).join(' | '))
  }
  return lines.join('\n')
}

export async function loadSqlRuntime(): Promise<LabRuntime> {
  const w = window as unknown as { initSqlJs?: (o: { locateFile: (f: string) => string }) => Promise<SqlJsStatic> }
  if (!w.initSqlJs) await loadScript(`${SQLJS_BASE}sql-wasm.js`)
  const SQL = await w.initSqlJs!({ locateFile: (f: string) => `${SQLJS_BASE}${f}` })
  return {
    async run(code) {
      const db = new SQL.Database()
      const results = db.exec(code)
      return formatSqlResults(results)
    },
  }
}

// ---------- JavaScript (sandboxed Web Worker) ----------

/** Stringify a console.log argument — shared contract with the offline verifier. */
export const JS_WORKER_SRC = `
self.onmessage = (e) => {
  const lines = []
  const str = (a) => (typeof a === 'object' && a !== null) ? JSON.stringify(a) : String(a)
  const console = { log: (...a) => lines.push(a.map(str).join(' ')), error: (...a) => lines.push(a.map(str).join(' ')), warn: (...a) => lines.push(a.map(str).join(' ')), info: (...a) => lines.push(a.map(str).join(' ')) }
  try {
    const fn = new Function('console', e.data)
    fn(console)
    self.postMessage({ ok: true, out: lines.join('\\n') })
  } catch (err) {
    self.postMessage({ ok: false, out: lines.join('\\n'), error: String(err && err.message ? err.message : err) })
  }
}
`

export async function loadJsRuntime(): Promise<LabRuntime> {
  const blob = new Blob([JS_WORKER_SRC], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)
  return {
    run(code) {
      return new Promise<string>((resolve) => {
        const worker = new Worker(url)
        const timer = setTimeout(() => { worker.terminate(); resolve('(timed out after 5s)') }, 5000)
        worker.onmessage = (ev: MessageEvent<{ ok: boolean; out: string; error?: string }>) => {
          clearTimeout(timer)
          worker.terminate()
          const { ok, out, error } = ev.data
          resolve(ok ? out : (out ? out + '\n' : '') + (error ?? 'error'))
        }
        worker.onerror = (err) => { clearTimeout(timer); worker.terminate(); resolve(String(err.message ?? 'worker error')) }
        worker.postMessage(code)
      })
    },
  }
}

export function loadRuntime(language: LabLanguage): Promise<LabRuntime> {
  if (language === 'sql') return loadSqlRuntime()
  if (language === 'js') return loadJsRuntime()
  return loadPythonRuntime()
}
