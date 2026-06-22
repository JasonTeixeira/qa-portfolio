import { INTENSITIES, LOOP, REQUIRED_SECTIONS, loopStep, type SprintIntensity } from '@/lib/academy/engine'
import type { LessonBlock } from '@/data/academy/sample-course'

/**
 * Canonical default stub for every block type. One source of truth shared by the
 * authoring editor and the sprint scaffold, so "add a block" and "scaffold the
 * loop" can never drift.
 */
export function defaultBlock(type: string, intensity: SprintIntensity = 'standard'): LessonBlock {
  switch (type) {
    case 'prose': return { type: 'prose', text: '' }
    case 'code': return { type: 'code', filename: 'main.py', language: 'python', code: '' }
    case 'video': return { type: 'video', title: '', duration: '0:00' }
    case 'lab': return { type: 'lab', title: '', summary: '', language: 'python', starter: '', check: '' }
    case 'callout': return { type: 'callout', tone: 'tip', text: '' }
    case 'quiz': return { type: 'quiz', question: '', options: ['', ''], answer: 0, explanation: '' }
    case 'sprint-contract': return { type: 'sprint-contract', outcome: '', intensity, time: INTENSITIES[intensity].time, proof: '', unlock: '', doNotClaim: '' }
    case 'mission': return { type: 'mission', text: '' }
    case 'context': return { type: 'context', text: '' }
    case 'pretest': return { type: 'pretest', prompt: '', reveal: '' }
    case 'worked-example': return { type: 'worked-example', intro: '', code: '', language: 'python', steps: [''], commonMistake: '' }
    case 'concept': return { type: 'concept', title: '', text: '' }
    case 'debug': return { type: 'debug', symptom: '', brokenCode: '', language: 'python', task: '', fix: '' }
    case 'tradeoff': return { type: 'tradeoff', question: '', optionA: { label: '', text: '' }, optionB: { label: '', text: '' }, guidance: '' }
    case 'verification': return { type: 'verification', intro: '', items: [''] }
    case 'teachback': return { type: 'teachback', prompts: [''] }
    case 'calibration': return { type: 'calibration', artifact: '', weak: '', passing: '', excellent: '', note: '' }
    case 'transfer': return { type: 'transfer', text: '' }
    case 'spaced-review': return { type: 'spaced-review', schedule: [] }
    case 'unlock-gate': return { type: 'unlock-gate', criteria: [''] }
    default: return { type: 'prose', text: '' }
  }
}

/** Build the required loop sections for an intensity, in canonical loop order. */
export function scaffoldSections(intensity: SprintIntensity): LessonBlock[] {
  const required = REQUIRED_SECTIONS[intensity]
  const ordered = [...required].sort((a, b) => (loopStep(a)?.step ?? 99) - (loopStep(b)?.step ?? 99))
  return ordered.map((key) => defaultBlock(key, intensity))
}

export type Completeness = {
  required: string[]
  present: string[]
  missing: string[]
  /** missing sections labeled for display, in loop order */
  missingLabels: { key: string; label: string; step: number }[]
  complete: boolean
}

/** Which required sections for an intensity are present in the current blocks. */
export function checkCompleteness(blocks: LessonBlock[], intensity: SprintIntensity): Completeness {
  const required = REQUIRED_SECTIONS[intensity]
  const presentTypes = new Set<string>(blocks.map((b) => b.type))
  const missing = required.filter((r) => !presentTypes.has(r))
  const present = required.filter((r) => presentTypes.has(r))
  const missingLabels = missing
    .map((key) => {
      const s = loopStep(key)
      return { key, label: s?.label ?? key, step: s?.step ?? 99 }
    })
    .sort((a, b) => a.step - b.step)
  return { required, present, missing, missingLabels, complete: missing.length === 0 }
}

/** Insert any missing required sections into existing blocks, in loop order, without
 *  touching blocks the author already wrote. Returns the merged, loop-ordered list. */
export function mergeScaffold(blocks: LessonBlock[], intensity: SprintIntensity): LessonBlock[] {
  const presentTypes = new Set<string>(blocks.map((b) => b.type))
  const toAdd = REQUIRED_SECTIONS[intensity].filter((k) => !presentTypes.has(k)).map((k) => defaultBlock(k, intensity))
  return [...blocks, ...toAdd]
}

/** Every block type the editor exposes, grouped for the add-bar. */
export const SECTION_TYPES = LOOP.map((s) => s.key).filter((k) => k !== 'lab' && k !== 'quiz')
export const CONTENT_TYPES = ['prose', 'code', 'video', 'callout', 'lab', 'quiz'] as const
