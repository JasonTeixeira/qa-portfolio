import type { TopicKey } from '@/lib/academy/topics'

/**
 * Schema-shaped sample content for the lesson player. Payload CMS will produce
 * these exact types later — the player is written against this contract, so
 * swapping fixture → CMS is a data-source change, not a rewrite.
 */
export type LessonBlock =
  // — content blocks —
  | { type: 'prose'; text: string }
  | { type: 'code'; filename: string; language: 'python' | 'ts' | 'bash'; code: string }
  | { type: 'video'; title: string; duration: string; playbackId?: string }
  | { type: 'lab'; title: string; summary: string; href?: string; language?: string; starter?: string; check?: string; stdin?: string }
  | { type: 'callout'; tone: 'tip' | 'note'; text: string }
  | { type: 'quiz'; question: string; options: string[]; answer: number; explanation?: string }
  // — Sage Learning Engine V2 sprint sections —
  | { type: 'sprint-contract'; outcome: string; intensity: 'micro' | 'standard' | 'deep' | 'capstone'; time: string; proof: string; unlock: string; doNotClaim?: string }
  | { type: 'mission'; text: string }
  | { type: 'context'; text: string }
  | { type: 'pretest'; prompt: string; reveal: string }
  | { type: 'worked-example'; intro: string; code?: string; language?: 'python' | 'ts' | 'bash'; steps: string[]; commonMistake: string }
  | { type: 'concept'; title?: string; text: string }
  | { type: 'debug'; symptom: string; brokenCode: string; language?: 'python' | 'ts' | 'bash'; task: string; fix: string }
  | { type: 'tradeoff'; question: string; optionA: { label: string; text: string }; optionB: { label: string; text: string }; guidance: string }
  | { type: 'verification'; intro?: string; items: string[] }
  | { type: 'teachback'; prompts: string[] }
  | { type: 'calibration'; artifact: string; weak: string; passing: string; excellent: string; note: string }
  | { type: 'transfer'; text: string }
  | { type: 'spaced-review'; schedule?: string[] }
  | { type: 'unlock-gate'; criteria: string[] }
  // — visual engine blocks (declarative specs → branded SageDiagram / SageViz) —
  | {
      type: 'diagram'
      title: string
      subtitle?: string
      nodes: { id: string; label: string; description?: string; x: number; y: number; tone?: 'default' | 'accent' | 'success' | 'warning' }[]
      edges: { from: string; to: string; label?: string; dashed?: boolean; tone?: 'default' | 'accent' | 'success' | 'warning' }[]
      legend?: { tone: 'default' | 'accent' | 'success' | 'warning'; label: string }[]
      height?: number
    }
  | {
      type: 'viz'
      title: string
      subtitle?: string
      chart: 'bars' | 'line' | 'area'
      data: { label: string; value: number }[]
      unit?: string
    }

export type LessonStatus = 'done' | 'current' | 'todo'

export type CourseLesson = {
  slug: string
  title: string
  status: LessonStatus
}

export type CourseModule = {
  title: string
  lessons: CourseLesson[]
}

export type Course = {
  slug: string
  title: string
  subtitle: string
  topic: TopicKey
  lessonsTotal: number
  lessonsDone: number
  modules: CourseModule[]
}

export type Lesson = {
  slug: string
  courseSlug: string
  eyebrow: string
  title: string
  estMinutes: number
  /** True when this lesson is readable without an all-access membership. */
  isFreePreview?: boolean
  blocks: LessonBlock[]
  prevSlug?: string
  prevLabel?: string
  nextSlug?: string
  nextLabel?: string
}

export const sampleCourse: Course = {
  slug: 'code-foundations',
  title: 'Code Foundations',
  subtitle: 'Python · JS · the terminal',
  topic: 'foundations',
  lessonsTotal: 25,
  lessonsDone: 8,
  modules: [
    {
      title: 'Module 1 · Foundations',
      lessons: [
        { slug: 'first-line', title: 'Your first line', status: 'done' },
        { slug: 'variables', title: 'Variables', status: 'done' },
        { slug: 'logic-conditionals', title: 'Logic & conditionals', status: 'current' },
        { slug: 'loops', title: 'Loops', status: 'todo' },
        { slug: 'functions', title: 'Functions', status: 'todo' },
      ],
    },
    {
      title: 'Module 2 · Real programs',
      lessons: [
        { slug: 'data-structures', title: 'Data structures', status: 'todo' },
        { slug: 'files-apis', title: 'Files & APIs', status: 'todo' },
      ],
    },
  ],
}

export const sampleLesson: Lesson = {
  slug: 'logic-conditionals',
  courseSlug: 'code-foundations',
  eyebrow: 'Module 1 · Lesson 03 · 8 min',
  title: 'Logic & conditionals',
  estMinutes: 8,
  prevSlug: 'variables',
  prevLabel: 'Variables',
  nextSlug: 'loops',
  nextLabel: 'Loops',
  blocks: [
    {
      type: 'prose',
      text: 'Programs make decisions with conditionals. You’ll learn how if / elif / else branch your code — then use them to make a real terminal game react to the player.',
    },
    {
      type: 'video',
      title: 'How conditionals branch',
      duration: '2:14',
    },
    {
      type: 'prose',
      text: 'A conditional runs a block only when its check is true. Python evaluates each branch top to bottom and stops at the first match — so order matters.',
    },
    {
      type: 'code',
      filename: 'guess.py',
      language: 'python',
      code: `if guess == secret:
    print("You got it!")
elif guess < secret:
    print("Too low — try higher.")
else:  # the only path left
    print("Too high — try lower.")`,
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'elif lets you chain checks without nesting. Reach for it before stacking if statements inside each other.',
    },
    {
      type: 'lab',
      title: 'Build the number-guessing game',
      summary: 'Wire these conditionals into a real terminal game that reacts to the player — run it in the browser.',
    },
  ],
}
