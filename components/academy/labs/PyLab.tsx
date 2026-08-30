'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { loadRuntime, type LabRuntime } from '@/components/academy/lab/runtimes'

/**
 * A config-driven in-browser Python lab (generalizes the proven IdempotencyLab):
 * a real Pyodide runtime, an editable starter that fails a check, and a green/red
 * verdict when the printed output matches `expected`. Pyodide lazy-loads on the
 * first Run, so nothing downloads until the learner acts. Add a playable lab =
 * one config object — no new component.
 */
export type PyLabConfig = {
  /** Shown in the header, e.g. "eval.py". */
  file: string
  /** Accessible label for the editor. */
  ariaLabel: string
  /** Starter code — should FAIL the check until the learner fixes it. */
  starter: string
  /** The trimmed stdout that means "passed". */
  expected: string
  /** One-line instruction shown before the first run. */
  prompt: string
  /** Shown on pass (after "✓ "). */
  passMsg: string
  /** Shown on fail (after "✗ got <output> · "). */
  failMsg: string
  /** Small mono hint shown bottom-right before passing. */
  hint: string
}

const C = {
  ink: '#F2EFE9',
  dim: '#9598A2',
  faint: '#5A5A64',
  line: '#1E1E24',
  panel: '#111115',
  code: '#0B0B0E',
  accent: '#3D5AFE',
  accentInk: '#8FA0FF',
  green: '#18B663',
  red: '#E5484D',
} as const
const mono = { fontFamily: 'var(--font-mono), monospace' } as const

type Phase = 'idle' | 'booting' | 'ready' | 'running'

export function PyLab({ config }: { config: PyLabConfig }) {
  const [code, setCode] = useState(config.starter)
  const [phase, setPhase] = useState<Phase>('idle')
  const [output, setOutput] = useState<string | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)
  const runtimeRef = useRef<LabRuntime | null>(null)

  const run = async () => {
    if (phase === 'booting' || phase === 'running') return
    if (!runtimeRef.current) {
      setPhase('booting')
      try {
        runtimeRef.current = await loadRuntime('python')
      } catch {
        setPhase('idle')
        setOutput('Could not start the runtime — refresh and try again.')
        return
      }
    }
    setPhase('running')
    let buf = ''
    try {
      buf = await runtimeRef.current.run(code)
    } catch (e: unknown) {
      buf = e instanceof Error ? e.message : String(e)
    }
    const clean = buf.trim()
    setOutput(clean.length ? clean : '(ran with no output)')
    setPassed(clean === config.expected)
    setPhase('ready')
  }

  const reset = () => {
    setCode(config.starter)
    setOutput(null)
    setPassed(null)
  }

  const status =
    phase === 'booting' ? 'starting python…' : phase === 'running' ? 'running…' : passed === true ? '✓ check passed' : passed === false ? '✗ check failed' : 'ready'
  const statusColor = passed === true ? C.green : passed === false ? C.red : C.dim

  return (
    <figure
      style={{
        margin: 0,
        border: `1px solid ${passed === true ? 'rgba(24,182,99,0.5)' : C.line}`,
        borderRadius: 16,
        background: C.panel,
        overflow: 'hidden',
        boxShadow: passed === true ? '0 0 0 1px rgba(24,182,99,0.3), 0 30px 70px -30px rgba(24,182,99,0.35)' : '0 24px 60px -30px rgba(0,0,0,0.8)',
        transition: 'box-shadow 300ms ease, border-color 300ms ease',
      }}
    >
      <figcaption style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: `1px solid ${C.line}` }}>
        <span style={{ ...mono, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.dim }}>lab · {config.file} · in-browser</span>
        <span style={{ ...mono, fontSize: 10.5, color: statusColor }}>{status}</span>
      </figcaption>
      <textarea
        value={code}
        onChange={(e) => { setCode(e.target.value); if (passed !== null) setPassed(null) }}
        spellCheck={false}
        aria-label={config.ariaLabel}
        style={{ ...mono, display: 'block', width: '100%', minHeight: 300, resize: 'vertical', border: 'none', outline: 'none', background: C.code, color: '#B6B6C0', padding: '16px 20px', fontSize: 13, lineHeight: 1.7, tabSize: 4 }}
      />
      <div style={{ padding: '13px 18px', borderTop: `1px solid ${C.line}`, background: C.code }}>
        {output !== null ? (
          <div style={{ ...mono, fontSize: 12.5, lineHeight: 1.6 }}>
            {passed === true ? (
              <span style={{ color: C.green }}>✓ {config.passMsg}</span>
            ) : (
              <span style={{ color: C.red }}>✗ got <b style={{ color: C.ink }}>{output}</b> · {config.failMsg}</span>
            )}
          </div>
        ) : (
          <div style={{ ...mono, fontSize: 12.5, color: C.dim }}>{config.prompt}</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderTop: `1px solid ${C.line}`, flexWrap: 'wrap' }}>
        <button type="button" onClick={run} disabled={phase === 'booting' || phase === 'running'} style={{ ...mono, display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, padding: '9px 18px', borderRadius: 18, cursor: phase === 'booting' || phase === 'running' ? 'wait' : 'pointer', opacity: phase === 'booting' || phase === 'running' ? 0.7 : 1 }}>
          {phase === 'booting' ? 'starting…' : phase === 'running' ? 'running…' : '▸ Run'}
        </button>
        {passed !== null ? (
          <button type="button" onClick={reset} style={{ ...mono, background: 'transparent', border: `1px solid ${C.line}`, color: C.dim, fontSize: 11.5, padding: '8px 14px', borderRadius: 18, cursor: 'pointer' }}>reset</button>
        ) : null}
        {passed === true ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <span style={{ ...mono, fontSize: 11, color: C.green }}>you just shipped a real fix.</span>
            <Link href="/academy/signup" style={{ ...mono, fontSize: 11.5, fontWeight: 600, color: C.accentInk, textDecoration: 'underline', textUnderlineOffset: 3 }}>keep going, free →</Link>
          </span>
        ) : (
          <span style={{ ...mono, fontSize: 10.5, color: C.faint, marginLeft: 'auto' }}>real python · {config.hint}</span>
        )}
      </div>
    </figure>
  )
}
