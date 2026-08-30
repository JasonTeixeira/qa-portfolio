/**
 * Atlas — the first-touch onboarding concierge. Pure data + logic for the
 * "Find your path" intake: the questions, how answers map to segments, and the
 * honest path recommendation. No fabricated course matches — recommendations
 * point only at things that actually exist (Course 00 Engineering Judgment, the
 * free lesson, live tracks, the Labs workshop). Kept framework-free so it can
 * be unit-tested and reused by the API route's tagging.
 */

export type AtlasQuestionId = 'goal' | 'level' | 'time' | 'field'

export type AtlasOption = {
  /** Stable value stored + sent to Resend as a tag. */
  value: string
  /** Tap-chip label. */
  label: string
  /** One-line supporting text under the label. */
  hint?: string
}

export type AtlasQuestion = {
  id: AtlasQuestionId
  /** What Atlas "asks" — written to be spoken aloud later. */
  prompt: string
  /** Short eyebrow shown above the prompt. */
  eyebrow: string
  options: AtlasOption[]
}

export const ATLAS_QUESTIONS: readonly AtlasQuestion[] = [
  {
    id: 'goal',
    eyebrow: 'First — the honest one',
    prompt: 'What are you actually here to do?',
    options: [
      { value: 'ship', label: 'Ship a real product', hint: 'You have something to build' },
      { value: 'level-up', label: 'Level up at my job', hint: 'Get sharper, faster, promoted' },
      { value: 'switch', label: 'Break into engineering', hint: 'Change careers for real' },
      { value: 'explore', label: 'See what’s possible', hint: 'Just exploring for now' },
    ],
  },
  {
    id: 'level',
    eyebrow: 'So I calibrate',
    prompt: 'Where are you starting from?',
    options: [
      { value: 'new', label: 'New to code', hint: 'Little or no experience' },
      { value: 'some', label: 'I can code a little', hint: 'Scripts, tutorials, side projects' },
      { value: 'engineer', label: 'Working engineer', hint: 'I ship code for a living' },
    ],
  },
  {
    id: 'time',
    eyebrow: 'Be honest',
    prompt: 'How much time can you really give it each week?',
    options: [
      { value: 'light', label: 'A couple hours', hint: 'Around a busy life' },
      { value: 'steady', label: '5–8 hours', hint: 'A real habit' },
      { value: 'deep', label: '10+ hours', hint: 'All in' },
    ],
  },
  {
    id: 'field',
    eyebrow: 'Last one',
    prompt: 'What’s your world?',
    options: [
      { value: 'software', label: 'Software / eng' },
      { value: 'data-ai', label: 'Data / AI' },
      { value: 'product', label: 'Product / design' },
      { value: 'founder', label: 'Founder / operator' },
      { value: 'student', label: 'Student' },
      { value: 'other', label: 'Something else' },
    ],
  },
] as const

export type AtlasAnswers = Partial<Record<AtlasQuestionId, string>>

export type AtlasPath = {
  /** Persona-facing headline for the reveal. */
  headline: string
  /** The concrete first thing to start. */
  startTitle: string
  startHref: string
  /** Why this, in Atlas's voice — honest, specific. */
  why: string
  /** 3 ordered next moves. */
  steps: string[]
  /** Rough weekly cadence line derived from the time answer. */
  cadence: string
}

const CADENCE: Record<string, string> = {
  light: 'One lesson + a few minutes of recall most days.',
  steady: 'One sprint a week, recall daily — the intended pace.',
  deep: 'Two sprints a week; you’ll have a portfolio fast.',
}

/**
 * Map answers → an honest starting path. Level drives the entry point; goal and
 * field shape the framing. Every href here is a real, always-valid route.
 */
export function recommendPath(answers: AtlasAnswers): AtlasPath {
  const level = answers.level ?? 'some'
  const goal = answers.goal ?? 'explore'
  const cadence = CADENCE[answers.time ?? 'steady'] ?? CADENCE.steady

  if (level === 'new') {
    return {
      headline: 'Start where every real engineer starts: judgment.',
      startTitle: 'Engineering Judgment — the free first lesson',
      startHref: '/academy/signup',
      why: 'You don’t need to be fluent in code yet. Course 00 teaches you to frame a problem and defend a decision — the thing that separates engineers from tutorial-followers. You’ll ship a proof in your first 25 minutes, no card required.',
      steps: [
        'Ship your first proof in Engineering Judgment (free).',
        'Add Programming Fundamentals alongside it.',
        'Pick your first buildable Lab and put it on your résumé.',
      ],
      cadence,
    }
  }

  if (level === 'engineer') {
    return {
      headline: 'Skip the basics. Go straight to the hard, provable stuff.',
      startTitle: 'A live track — System Design or your field',
      startHref: '/academy/signup',
      why:
        goal === 'ship'
          ? 'You already ship. What moves the needle now is provable depth — system design, evaluation, the calls senior engineers get paid for. Every lesson ends in evidence a reviewer trusts, not a completion badge.'
          : 'You already ship — so we skip the fundamentals and go where the leverage is: system design and the judgment calls that get you promoted. Every lesson ends in a proof, not a certificate.',
      steps: [
        'Warm up on Engineering Judgment (one sitting).',
        'Go deep on the System Design flagship track.',
        'Turn each module into a portfolio-grade Lab.',
      ],
      cadence,
    }
  }

  // level === 'some' (default)
  return {
    headline: 'You’ve got a foundation. Let’s make it provable.',
    startTitle: 'Engineering Judgment → a live track',
    startHref: '/academy/signup',
    why:
      goal === 'switch'
        ? 'You can code a little — enough to start proving it. Course 00 gets you thinking like a senior, then a live track builds the body of work a hiring manager actually trusts. No certificate theatre — real, verifiable proofs.'
        : 'You’re past zero, which means you can start shipping proofs now. Course 00 sharpens how you think; a live track turns that into work you can point at. Everything you finish is verifiable.',
    steps: [
      'Ship your first proof in Engineering Judgment (free).',
      'Choose a live track that matches your field.',
      'Build one résumé-ready Lab a month.',
    ],
    cadence,
  }
}

/** Flatten answers into Resend-friendly tags, e.g. ["goal:ship","level:new"]. */
export function answersToTags(answers: AtlasAnswers): string[] {
  return (Object.keys(answers) as AtlasQuestionId[])
    .filter((k) => answers[k])
    .map((k) => `${k}:${answers[k]}`)
}
