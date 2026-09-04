import fs from 'fs'
import path from 'path'
import { ATLAS_QUESTIONS, recommendPath, type AtlasAnswers } from '@/data/academy/atlas'

// Collect every user-facing English string Atlas can render, and merge them into
// en.json as identity keys so `npm run i18n:messages` translates them into every
// locale. Re-runnable + idempotent. Run: tsx scripts/atlas-i18n-keys.ts

const keys = new Set<string>()

// 1. Questions: eyebrow, prompt, option labels + hints.
for (const q of ATLAS_QUESTIONS) {
  keys.add(q.eyebrow)
  keys.add(q.prompt)
  for (const o of q.options) {
    keys.add(o.label)
    if (o.hint) keys.add(o.hint)
  }
}

// 2. Every reachable path recommendation (enumerate all answer combinations).
const goals = ATLAS_QUESTIONS.find((q) => q.id === 'goal')!.options.map((o) => o.value)
const levels = ATLAS_QUESTIONS.find((q) => q.id === 'level')!.options.map((o) => o.value)
const times = ATLAS_QUESTIONS.find((q) => q.id === 'time')!.options.map((o) => o.value)
const fields = ATLAS_QUESTIONS.find((q) => q.id === 'field')!.options.map((o) => o.value)
for (const goal of goals)
  for (const level of levels)
    for (const time of times)
      for (const field of fields) {
        const answers: AtlasAnswers = { goal, level, time, field }
        const p = recommendPath(answers)
        keys.add(p.headline)
        keys.add(p.startTitle)
        keys.add(p.why)
        keys.add(p.cadence)
        for (const s of p.steps) keys.add(s)
      }

// 3. UI chrome strings — must match the t('…') literals in AtlasIntake/AtlasLauncher exactly.
const UI = [
  'Atlas · your guide',
  'Goal',
  'Level',
  'Time',
  'Field',
  'Press a number, or use ↑↓ and Enter',
  '← back',
  'skip',
  'Your path',
  'Start here',
  'Save your path — and I’ll send your first lesson.',
  'Save my path',
  'Saving…',
  'Please enter a valid email.',
  'Something went wrong. Try again.',
  'Network hiccup — try again.',
  'or just start free now, no email →',
  'Your path is on its way.',
  'Path saved.',
  'Check your inbox — your first lesson and next steps are waiting. Or start right now:',
  'Saved (email isn’t wired up in this environment yet). You can start right now:',
  'You’re on the list — the email didn’t go through, but your path is saved. Start right now:',
  'Start free — no card',
  'Find your path',
]
for (const s of UI) keys.add(s)

// 4. Merge into en.json (identity), preserving existing keys/order.
const enPath = path.join(process.cwd(), 'lib', 'i18n', 'messages', 'en.json')
const en = JSON.parse(fs.readFileSync(enPath, 'utf8')) as Record<string, string>
let added = 0
for (const k of keys) {
  if (!(k in en)) {
    en[k] = k
    added += 1
  }
}
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n')
console.log(`Atlas i18n: ${keys.size} strings collected, ${added} new keys added to en.json (now ${Object.keys(en).length} total).`)
