/**
 * Academy topic color system — each topic/path gets one accent, used
 * consistently across course cards, paths, and the lesson player. A disciplined
 * categorical palette (cool-dominant + one warm), NOT a rainbow. Pure electric
 * (#3D5AFE) stays reserved for primary actions so "action" reads consistently.
 */
export type TopicKey = 'foundations' | 'ai-engineering' | 'ship-it' | 'growth' | 'data'

export type Topic = {
  label: string
  /** Solid accent — tags, skill bars, the lesson-player accent. */
  color: string
  /** Low-opacity wash for surfaces (cards, callouts). */
  soft: string
}

export const TOPICS: Record<TopicKey, Topic> = {
  foundations: { label: 'Foundations', color: '#5bc8e8', soft: 'rgba(91, 200, 232, 0.12)' },
  'ai-engineering': { label: 'AI Engineering', color: '#6e8bff', soft: 'rgba(110, 139, 255, 0.12)' },
  'ship-it': { label: 'Ship It', color: '#34d399', soft: 'rgba(52, 211, 153, 0.12)' },
  growth: { label: 'Growth', color: '#e8b75a', soft: 'rgba(232, 183, 90, 0.12)' },
  data: { label: 'Data', color: '#9db4d0', soft: 'rgba(157, 180, 208, 0.12)' },
}

export const ACTION = '#3d5afe' // reserved electric — primary CTAs only

export function topic(key: TopicKey): Topic {
  return TOPICS[key] ?? TOPICS.foundations
}
