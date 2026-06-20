'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './waitlist.module.css'

type Tok = { t: string; v: string }

// A real, minimal "first lab": build an AI chatbot. Tokenized so it highlights
// correctly while it types.
const LINES: Tok[][] = [
  [{ t: 'com', v: '# Your first lab — build an AI chatbot' }],
  [{ t: 'kw', v: 'from' }, { t: 'sp', v: ' ' }, { t: 'var', v: 'openai' }, { t: 'sp', v: ' ' }, { t: 'kw', v: 'import' }, { t: 'sp', v: ' ' }, { t: 'cls', v: 'OpenAI' }],
  [],
  [{ t: 'var', v: 'client' }, { t: 'sp', v: ' ' }, { t: 'op', v: '=' }, { t: 'sp', v: ' ' }, { t: 'cls', v: 'OpenAI' }, { t: 'punct', v: '()' }],
  [],
  [{ t: 'kw', v: 'def' }, { t: 'sp', v: ' ' }, { t: 'fn', v: 'chat' }, { t: 'punct', v: '(' }, { t: 'var', v: 'prompt' }, { t: 'punct', v: '):' }],
  [{ t: 'sp', v: '    ' }, { t: 'var', v: 'reply' }, { t: 'sp', v: ' ' }, { t: 'op', v: '=' }, { t: 'sp', v: ' ' }, { t: 'var', v: 'client' }, { t: 'punct', v: '.' }, { t: 'var', v: 'responses' }, { t: 'punct', v: '.' }, { t: 'fn', v: 'create' }, { t: 'punct', v: '(' }],
  [{ t: 'sp', v: '        ' }, { t: 'var', v: 'model' }, { t: 'op', v: '=' }, { t: 'str', v: '"gpt-5"' }, { t: 'punct', v: ',' }, { t: 'sp', v: ' ' }, { t: 'var', v: 'input' }, { t: 'op', v: '=' }, { t: 'var', v: 'prompt' }, { t: 'punct', v: ',' }],
  [{ t: 'sp', v: '    ' }, { t: 'punct', v: ')' }],
  [{ t: 'sp', v: '    ' }, { t: 'kw', v: 'return' }, { t: 'sp', v: ' ' }, { t: 'var', v: 'reply' }, { t: 'punct', v: '.' }, { t: 'var', v: 'output_text' }],
  [],
  [{ t: 'fn', v: 'print' }, { t: 'punct', v: '(' }, { t: 'fn', v: 'chat' }, { t: 'punct', v: '(' }, { t: 'str', v: '"Explain recursion like I’m 12"' }, { t: 'punct', v: '))' }],
]

const OUTPUT =
  'Recursion is when something is defined using a smaller copy of itself — like Russian nesting dolls. The program keeps opening a smaller doll until it reaches the tiniest one (the “base case”), then stacks them all back up. 🪆'

const lineLen = (line: Tok[]) => line.reduce((n, tok) => n + tok.v.length, 0)
const TOK_CLASS: Record<string, string> = {
  com: styles.tCom, kw: styles.tKw, cls: styles.tCls, fn: styles.tFn,
  str: styles.tStr, var: styles.tVar, op: styles.tOp, punct: styles.tPunct, sp: '',
}

function renderLine(line: Tok[], upTo: number) {
  let budget = upTo
  const out: React.ReactNode[] = []
  for (let i = 0; i < line.length; i++) {
    const tok = line[i]
    if (budget <= 0) break
    const text = budget >= tok.v.length ? tok.v : tok.v.slice(0, budget)
    budget -= text.length
    out.push(<span key={i} className={TOK_CLASS[tok.t]}>{text}</span>)
  }
  return out
}

export function CodeLab() {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [li, setLi] = useState(0)
  const [ci, setCi] = useState(0)
  const [done, setDone] = useState(false)
  const [ran, setRan] = useState(false)
  const startedRef = useRef(false)
  const hostRef = useRef<HTMLDivElement>(null)

  // Type only once the panel scrolls into view (so the reveal isn't wasted).
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (reduced) { setActive(true); return }
    const el = hostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setActive(true); io.disconnect() } }),
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  useEffect(() => {
    if (!active || startedRef.current) return
    startedRef.current = true
    if (reduced) {
      setLi(LINES.length); setDone(true); setRan(true)
      return
    }
    let cancelled = false
    let line = 0
    let char = 0
    const tick = () => {
      if (cancelled) return
      if (line >= LINES.length) {
        setDone(true)
        window.setTimeout(() => !cancelled && setRan(true), 650)
        return
      }
      const len = lineLen(LINES[line])
      if (char >= len) {
        line += 1; char = 0
        setLi(line); setCi(0)
        window.setTimeout(tick, 150)
        return
      }
      char += 1
      setLi(line); setCi(char)
      window.setTimeout(tick, 16 + Math.random() * 22)
    }
    tick()
    return () => { cancelled = true }
  }, [active, reduced])

  return (
    <div className={styles.codeLab} ref={hostRef}>
      <div className={styles.codeBar}>
        <span className={styles.codeDots} aria-hidden="true"><i /><i /><i /></span>
        <span className={styles.codeFile}>first_lab.py</span>
        <span className={styles.codeTag}>Lab 01</span>
      </div>
      <pre className={styles.codeBody} aria-label="Build an AI chatbot in 12 lines of Python">
        {LINES.map((line, idx) => {
          const show = done || idx < li
          const partial = !done && idx === li
          return (
            <span key={idx} className={styles.codeLine}>
              {show ? renderLine(line, lineLen(line)) : partial ? renderLine(line, ci) : null}
              {partial && <span className={styles.caret} aria-hidden="true" />}
              {'\n'}
            </span>
          )
        })}
      </pre>
      <div className={`${styles.codeOut} ${ran ? styles.codeOutOn : ''}`} aria-hidden={!ran}>
        <span className={styles.codeOutLine}><b>▶</b> python first_lab.py</span>
        <p>{OUTPUT}</p>
      </div>
    </div>
  )
}
