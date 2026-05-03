// Shared types for the Pipeline visual system.
// A pipeline is the journey a customer takes for a service — from
// consultation all the way through delivery and (optionally) ongoing care.

export type PipelineRole = 'sage' | 'client' | 'shared'

export type PipelineStage = {
  /** Stable id (kebab-case). */
  id: string
  /** Short stage name shown in the node + timeline (e.g., "Discovery"). */
  title: string
  /** One-line summary used in hover tooltip. */
  tagline: string
  /** Human duration label ("Day 1", "Week 1", "Day 1–3"). */
  duration: string
  /** Concrete deliverables produced during this stage. */
  deliverables: string[]
  /** What the client needs to do during this stage (max ~4 items). */
  clientDoes: string[]
  /** What Sage does during this stage (max ~4 items). */
  sageDoes: string[]
  /** Lucide icon name (kebab-case is fine — we map in the component). */
  icon: PipelineIcon
  /** Tone — drives the node accent color. */
  tone?: 'cyan' | 'violet' | 'amber' | 'emerald'
  /** Marks an optional/branching stage (e.g., "Care retainer"). */
  optional?: boolean
}

export type PipelineDefinition = {
  /** Pipeline id — typically matches the tier slug or the journey name. */
  slug: string
  /** Display title (e.g., "Sage Audit Journey"). */
  title: string
  /** Short tagline beneath the title. */
  tagline: string
  /** Rough end-to-end duration string ("5 business days"). */
  totalDuration: string
  /** Number of stages — derived but stored for layout perf. */
  stages: PipelineStage[]
  /** Optional accent color for the connector line gradient. */
  accent?: 'cyan' | 'violet' | 'gradient'
  /** Optional caption shown above the pipeline (small label). */
  eyebrow?: string
}

export type PipelineIcon =
  | 'compass'
  | 'phone'
  | 'search'
  | 'pen-line'
  | 'palette'
  | 'layers'
  | 'wrench'
  | 'rocket'
  | 'shield-check'
  | 'sparkles'
  | 'monitor'
  | 'activity'
  | 'workflow'
  | 'bot'
  | 'bar-chart'
  | 'package'
  | 'message-square'
  | 'file-text'
  | 'check-circle'
  | 'flag'
  | 'refresh-cw'
  | 'send'
  | 'beaker'
  | 'globe'
  | 'database'
  | 'cog'
  | 'gauge'
  | 'lock'
  | 'eye'
  | 'megaphone'
  | 'mouse-pointer'
  | 'play'

export const PIPELINE_TONES = {
  cyan: {
    border: 'border-cyan-400/40',
    glow: 'shadow-[0_0_40px_rgba(6,182,212,0.25)]',
    text: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    dot: 'bg-cyan-400',
    line: 'rgba(6, 182, 212, 0.85)',
    gradient: 'from-cyan-400 to-cyan-300',
  },
  violet: {
    border: 'border-violet-400/40',
    glow: 'shadow-[0_0_40px_rgba(139,92,246,0.25)]',
    text: 'text-violet-300',
    bg: 'bg-violet-500/10',
    dot: 'bg-violet-400',
    line: 'rgba(139, 92, 246, 0.85)',
    gradient: 'from-violet-400 to-violet-300',
  },
  amber: {
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.25)]',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    dot: 'bg-amber-400',
    line: 'rgba(245, 158, 11, 0.85)',
    gradient: 'from-amber-400 to-amber-300',
  },
  emerald: {
    border: 'border-emerald-400/40',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.25)]',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    dot: 'bg-emerald-400',
    line: 'rgba(16, 185, 129, 0.85)',
    gradient: 'from-emerald-400 to-emerald-300',
  },
} as const
