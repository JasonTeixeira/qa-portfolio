'use client'

import { useEffect, useState } from 'react'
import styles from './waitlist.module.css'

const BUILDS = [
  {
    file: 'roast-bot',
    lines: ['const roast = await ai.chat({', "  system: 'be brutally funny',", '  messages: [{ role: \'user\',', '    content: myCode }],', '})'],
    out: 'an AI that roasts your code 🔥',
    url: 'roast-my-code.app',
  },
  {
    file: 'text-to-site',
    lines: ["const site = await ai.build(", "  'a landing page for my startup',", ')', 'await deploy(site)'],
    out: 'a website from one sentence',
    url: 'instant-site.app',
  },
  {
    file: 'trading-bot',
    lines: ["bot.on('signal', async (s) => {", '  if (s.confidence > 0.8)', '    await paperTrade(s)', '})'],
    out: 'an AI that trades — on paper',
    url: 'my-trading-bot.app',
  },
]

/** A hero terminal that types code, "ships" a project, then cycles — the page's motion hook. */
export function LiveBuild() {
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [done, setDone] = useState(false)
  const build = BUILDS[idx]
  const full = build.lines.join('\n')

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setTyped(full)
      setDone(true)
      return
    }
    setTyped('')
    setDone(false)
    let i = 0
    let advance: number | undefined
    const type = window.setInterval(() => {
      i += 1
      setTyped(full.slice(0, i))
      if (i >= full.length) {
        window.clearInterval(type)
        setDone(true)
        advance = window.setTimeout(() => setIdx((v) => (v + 1) % BUILDS.length), 2600)
      }
    }, 34)
    return () => {
      window.clearInterval(type)
      if (advance) window.clearTimeout(advance)
    }
  }, [idx, full])

  return (
    <div className={styles.live} aria-hidden="true">
      <div className={styles.liveBar}>
        <span className={styles.liveDots}><i /><i /><i /></span>
        <span className={styles.liveLabel}><span className={styles.livePulse} /> live · building</span>
        <span className={styles.liveFile}>{build.file}.ts</span>
      </div>
      <pre className={styles.livePre}>
        <code>
          {typed}
          <span className={styles.liveCaret} />
        </code>
      </pre>
      <div className={`${styles.liveOut} ${done ? styles.liveOutOn : ''}`}>
        {done ? (
          <>
            <span className={styles.liveShip}>✓ shipped</span>
            {build.out} · <b>{build.url}</b>
          </>
        ) : (
          <span className={styles.liveRun}>running…</span>
        )}
      </div>
    </div>
  )
}
