'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './waitlist.module.css'

type Lab = { id: string; label: string; lang: 'py' | 'sh'; file: string; code: string; output: string }

const LABS: Lab[] = [
  {
    id: 'chatbot',
    label: 'AI chatbot',
    lang: 'py',
    file: 'chatbot.py',
    code: `# Lab 01 — build an AI chatbot
from openai import OpenAI
client = OpenAI()

def chat(prompt):
    reply = client.responses.create(
        model="gpt-5",
        input=prompt,
    )
    return reply.output_text

print(chat("Explain recursion like I'm 12"))`,
    output:
      'Recursion is when something is defined using a smaller copy of itself — like Russian nesting dolls. The program keeps opening a smaller doll until it hits the tiniest one, then stacks them back up. 🪆',
  },
  {
    id: 'rag',
    label: 'RAG search',
    lang: 'py',
    file: 'rag.py',
    code: `# Lab 02 — answer questions from your own docs
from sage import embed, search, ask

index = embed("handbook/")            # build the vector index
hits = search(index, "refund policy")

answer = ask("gpt-5", context=hits)
print(answer)`,
    output: 'Your refund window is 30 days from purchase — see handbook §4.2. 📚',
  },
  {
    id: 'deploy',
    label: 'Ship it',
    lang: 'sh',
    file: 'deploy.sh',
    code: `# Lab 03 — ship your app to a live URL
$ git push origin main
$ vercel --prod

  Building...
  Uploading build outputs...
  Assigning production domain...`,
    output: '✓ Live at https://my-app.vercel.app — anyone in the world can use it now. 🚀',
  },
]

const PY_RE =
  /(#[^\n]*)|("[^"]*"|'[^']*'|`[^`]*`)|(\b(?:from|import|def|return|for|in|if|else|with|as|class|await|async|None|True|False)\b)|(\b[a-zA-Z_]\w*(?=\())|(\b\d+\.?\d*\b)/g
const SH_RE = /(#[^\n]*)|("[^"]*"|'[^']*')|(^\s*\$|\bgit\b|\bvercel\b|\bnpm\b|\bpush\b)|(\b\d+\b)/g

function highlight(text: string, lang: 'py' | 'sh'): ReactNode[] {
  if (!text) return []
  const re = lang === 'sh' ? new RegExp(SH_RE) : new RegExp(PY_RE)
  const out: ReactNode[] = []
  let last = 0
  let key = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<span key={key++}>{text.slice(last, m.index)}</span>)
    const cls = m[1] ? styles.tCom : m[2] ? styles.tStr : m[3] ? styles.tKw : m[4] ? styles.tFn : styles.tNum
    out.push(<span key={key++} className={cls}>{m[0]}</span>)
    last = m.index + m[0].length
    if (m.index === re.lastIndex) re.lastIndex++ // avoid zero-width loops
  }
  if (last < text.length) out.push(<span key={key++}>{text.slice(last)}</span>)
  return out
}

export function CodeLab() {
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [active, setActive] = useState(0)
  const [play, setPlay] = useState(0)
  const [visible, setVisible] = useState(false)
  const [li, setLi] = useState(0)
  const [ci, setCi] = useState(0)
  const [done, setDone] = useState(false)
  const [ran, setRan] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) { setVisible(true); return }
    const el = hostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } }),
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const lab = LABS[active]
  const lines = lab.code.split('\n')

  useEffect(() => {
    if (!visible) return
    setLi(0); setCi(0); setDone(false); setRan(false)
    if (reduced) { setLi(lines.length); setDone(true); setRan(true); return }
    let cancelled = false
    let line = 0
    let char = 0
    const tick = () => {
      if (cancelled) return
      if (line >= lines.length) {
        setDone(true)
        window.setTimeout(() => !cancelled && setRan(true), 600)
        return
      }
      const len = lines[line].length
      if (char >= len) {
        line += 1; char = 0
        setLi(line); setCi(0)
        window.setTimeout(tick, 130)
        return
      }
      char += 1
      setLi(line); setCi(char)
      window.setTimeout(tick, 15 + Math.random() * 22)
    }
    tick()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, play, visible])

  return (
    <div className={styles.codeLab} ref={hostRef}>
      <div className={styles.codeTabs}>
        {LABS.map((l, i) => (
          <button
            key={l.id}
            type="button"
            className={`${styles.codeTab} ${i === active ? styles.codeTabOn : ''}`}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
          >
            {l.label}
          </button>
        ))}
        <span className={styles.codeFile}>{lab.file}</span>
      </div>
      <pre className={styles.codeBody} aria-label={`${lab.label} lab`}>
        {lines.map((text, idx) => {
          const show = done || idx < li
          const partial = !done && idx === li
          const visibleText = show ? text : partial ? text.slice(0, ci) : ''
          return (
            <span key={idx} className={styles.codeLine}>
              {highlight(visibleText, lab.lang)}
              {partial && <span className={styles.caret} aria-hidden="true" />}
              {'\n'}
            </span>
          )
        })}
      </pre>
      <div className={`${styles.codeOut} ${ran ? styles.codeOutOn : ''}`} aria-hidden={!ran}>
        <div className={styles.codeOutHead}>
          <span className={styles.codeOutLine}><b>▶</b> running {lab.file}</span>
          <button type="button" className={styles.codeReplay} onClick={() => setPlay((p) => p + 1)}>
            ↻ Run again
          </button>
        </div>
        <p>{lab.output}</p>
      </div>
    </div>
  )
}
