import { RUBRIC_DIMENSIONS } from '@/lib/academy/interview/rubric'
import styles from './library.module.css'

/** Track display labels (mirrors the interview_scenarios.track CHECK enum). */
export const TRACK_LABEL: Record<string, string> = {
  coding: 'Coding',
  system_design: 'System design',
  behavioral: 'Behavioral',
  negotiation: 'Negotiation',
}

/** The track filter order shown in the sidebar. */
export const TRACK_ORDER: readonly string[] = ['coding', 'system_design', 'behavioral', 'negotiation']

/** Monospace glyph per track (from the design). */
const TRACK_GLYPH: Record<string, { glyph: string; cls: string }> = {
  coding: { glyph: '{ }', cls: styles.glyphCoding },
  system_design: { glyph: '◫', cls: styles.glyphSystem },
  behavioral: { glyph: '" "', cls: styles.glyphBehavioral },
  negotiation: { glyph: '$', cls: styles.glyphNegotiation },
}

export function trackGlyph(track: string): { glyph: string; cls: string } {
  return TRACK_GLYPH[track] ?? { glyph: '◆', cls: styles.glyphCoding }
}

/** Difficulty display labels + a colour class (mirrors the difficulty CHECK enum). */
const DIFFICULTY: Record<string, { label: string; cls: string }> = {
  all_levels: { label: 'all levels', cls: styles.diffEasy },
  mid_senior: { label: 'mid–senior', cls: styles.diffSenior },
  senior: { label: 'senior', cls: styles.diffSenior },
  senior_plus: { label: 'senior+', cls: styles.diffHard },
}

export const DIFFICULTY_ORDER: readonly string[] = ['all_levels', 'mid_senior', 'senior', 'senior_plus']

export function difficultyLabel(difficulty: string): string {
  return DIFFICULTY[difficulty]?.label ?? difficulty
}

export function difficultyClass(difficulty: string): string {
  return DIFFICULTY[difficulty]?.cls ?? ''
}

/** Short label for a dimension slug (e.g. 'verification_habit' → 'verification'). */
const DIM_SHORT: Record<string, string> = {
  problem_framing: 'framing',
  communication: 'communication',
  technical_depth: 'depth',
  tradeoff_judgment: 'tradeoffs',
  verification_habit: 'verification',
  composure: 'composure',
}

export function dimensionShort(slug: string): string {
  return DIM_SHORT[slug] ?? slug.replace('_', ' ')
}

/** Full dimension label from the rubric (e.g. 'Verification habit'). */
export function dimensionLabel(slug: string): string {
  return RUBRIC_DIMENSIONS.find((d) => d.slug === slug)?.label ?? slug
}

/** "trains:" line for a scenario card, from its real trains[] slugs. */
export function trainsLabel(trains: readonly string[]): string {
  if (trains.length === 0) return '—'
  return trains.map(dimensionShort).join(' · ')
}
