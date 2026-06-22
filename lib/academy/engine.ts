/**
 * Sage Learning Engine V2 — the learning operating system.
 *
 * The 17-step Universal Loop, the four sprint intensities, and the registry
 * that maps each loop step to a renderable sprint-section block. Content
 * changes; this engine does not. Every sprint is, by construction, an ordered
 * set of these section blocks — so "follows the engine" is enforced by the
 * type system, not by discipline.
 */

export type SprintIntensity = 'micro' | 'standard' | 'deep' | 'capstone'

export type IntensitySpec = {
  key: SprintIntensity
  label: string
  blurb: string
  time: string
  /** accent token for the intensity badge */
  accent: string
}

export const INTENSITIES: Record<SprintIntensity, IntensitySpec> = {
  micro: { key: 'micro', label: 'Micro sprint', blurb: 'One narrow idea or repair', time: '20–40 min', accent: '#5bc8e8' },
  standard: { key: 'standard', label: 'Standard sprint', blurb: 'A normal course lesson', time: '60–90 min', accent: '#6e8bff' },
  deep: { key: 'deep', label: 'Deep sprint', blurb: 'Complex skill, multiple passes', time: '2–4 hrs', accent: '#e8b75a' },
  capstone: { key: 'capstone', label: 'Capstone', blurb: 'Synthesis & proof', time: 'Multi-day', accent: '#34d399' },
}

/**
 * The canonical loop. `key` matches the section-block `type`. `step` is the
 * loop position shown on the rail. `why` is the durable-learning mechanic the
 * step trains — surfaced to the learner so the system teaches them *how* to learn.
 */
export type LoopStep = {
  key: string
  step: number
  label: string
  why: string
  glyph: string
}

export const LOOP: LoopStep[] = [
  { key: 'sprint-contract', step: 0, label: 'Sprint contract', why: 'Set the standard before you start', glyph: '⬡' },
  { key: 'mission', step: 1, label: 'Mission', why: 'A real problem, not a topic', glyph: '◎' },
  { key: 'context', step: 2, label: 'Where this fits', why: 'Anchor the skill to real work', glyph: '⊹' },
  { key: 'pretest', step: 3, label: 'Pretest', why: 'Retrieval & productive failure before reading', glyph: '◇' },
  { key: 'worked-example', step: 4, label: 'Worked example', why: 'See a complete model first', glyph: '▤' },
  { key: 'concept', step: 5, label: 'Concept capsule', why: 'The smallest idea needed to act', glyph: '◈' },
  { key: 'lab', step: 6, label: 'Tiny build', why: 'Apply it in a small real task', glyph: '⬢' },
  { key: 'debug', step: 7, label: 'Broken case', why: 'Handle failure, not just success', glyph: '⚠' },
  { key: 'tradeoff', step: 8, label: 'Tradeoff decision', why: 'Choose under constraints', glyph: '⇄' },
  { key: 'verification', step: 9, label: 'Verification', why: 'Prove the result — no vibes', glyph: '✓' },
  { key: 'quiz', step: 10, label: 'Quick check', why: 'Calibrate recall', glyph: '?' },
  { key: 'teachback', step: 11, label: 'Teach-back', why: 'Explain it to lock it in', glyph: '◍' },
  { key: 'calibration', step: 12, label: 'Calibration', why: 'Compare to weak / passing / excellent', glyph: '▥' },
  { key: 'transfer', step: 13, label: 'Transfer challenge', why: 'Use the pattern somewhere new', glyph: '⤳' },
  { key: 'spaced-review', step: 14, label: 'Spaced review', why: 'Review over time, not in one cram', glyph: '↻' },
  { key: 'unlock-gate', step: 15, label: 'Unlock gate', why: 'Advance only with proof', glyph: '⏻' },
]

const LOOP_BY_KEY = new Map(LOOP.map((s) => [s.key, s]))

export function loopStep(key: string): LoopStep | undefined {
  return LOOP_BY_KEY.get(key)
}

/** Required sections per intensity — used by the authoring scaffold + completeness check. */
export const REQUIRED_SECTIONS: Record<SprintIntensity, string[]> = {
  micro: ['mission', 'pretest', 'concept', 'lab', 'verification', 'unlock-gate'],
  standard: [
    'sprint-contract', 'mission', 'context', 'pretest', 'worked-example', 'concept',
    'lab', 'debug', 'tradeoff', 'verification', 'teachback', 'transfer', 'spaced-review', 'unlock-gate',
  ],
  deep: [
    'sprint-contract', 'mission', 'context', 'pretest', 'worked-example', 'concept',
    'lab', 'debug', 'tradeoff', 'verification', 'teachback', 'calibration', 'transfer', 'spaced-review', 'unlock-gate',
  ],
  capstone: [
    'sprint-contract', 'mission', 'context', 'lab', 'debug', 'tradeoff',
    'verification', 'teachback', 'calibration', 'transfer', 'unlock-gate',
  ],
}

/** Which loop keys are interactive sprint sections (vs. legacy content blocks). */
export const SECTION_BLOCK_TYPES = new Set([
  'sprint-contract', 'mission', 'context', 'pretest', 'worked-example', 'concept',
  'debug', 'tradeoff', 'verification', 'teachback', 'calibration', 'transfer',
  'spaced-review', 'unlock-gate',
])
