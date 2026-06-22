import type { Course, Lesson } from '@/data/academy/sample-course'

/**
 * Flagship sprint — a complete STANDARD sprint that exercises the entire Sage
 * Learning Engine V2 loop, end to end. This is the system template, not course
 * content: it shows the operating system working so real courses can be poured
 * into the same structure. Rendered statically at /academy/engine (no DB, no
 * catalog impact).
 */

export const flagshipCourse: Course = {
  slug: '_engine',
  title: 'The Learning Engine',
  subtitle: 'Sage Learning Engine V2 · 96–98 mastery template',
  topic: 'ai-engineering',
  lessonsTotal: 1,
  lessonsDone: 0,
  modules: [
    {
      title: 'How a sprint works',
      lessons: [{ slug: 'flagship', title: 'Validate at the boundary', status: 'current' }],
    },
  ],
}

export const flagshipLesson: Lesson = {
  slug: 'flagship',
  courseSlug: '_engine',
  eyebrow: 'Flagship sprint · Standard intensity · the full loop',
  title: 'Validate at the boundary',
  estMinutes: 75,
  isFreePreview: true,
  blocks: [
    {
      type: 'sprint-contract',
      outcome: 'Write a function that fails fast on bad input, with a clear error and a test that proves it.',
      intensity: 'standard',
      time: '60–90 min',
      proof: 'A passing test, a deliberately-broken case you fixed, and a one-line teach-back.',
      unlock: 'All verification items checked, transfer task attempted, review scheduled.',
      doNotClaim: '“I understand input validation” — until you’ve made a broken case pass.',
    },
    {
      type: 'mission',
      text: 'A teammate’s service crashed at 2am because a function got an empty list and divided by zero. Your job: make functions reject bad input at the boundary, loudly and early — so failures are obvious in development, not silent in production.',
    },
    {
      type: 'context',
      text: 'This shows up everywhere real: API request handlers, data pipeline steps, library functions others call. “Validate at the boundary” is the habit that separates code that fails gracefully from code that corrupts state three layers deep.',
    },
    {
      type: 'pretest',
      prompt: 'Before reading: what should average([]) do, and why is returning 0 a trap? Answer from memory.',
      reveal: 'Returning 0 for an empty list is a silent lie — the caller can’t tell “no data” from “data that averaged to 0.” Fail fast: raise a ValueError so the bug surfaces at the boundary where it’s cheap to find.',
    },
    {
      type: 'worked-example',
      intro: 'Here is the complete, guarded version. Read it, then notice what each line defends against.',
      language: 'python',
      code: 'def average(values):\n    if not values:\n        raise ValueError("average() needs at least one value")\n    return sum(values) / len(values)\n\nprint(average([2, 4, 6]))  # 4.0',
      steps: [
        'Guard first: the empty case is handled before any math runs.',
        'Raise, don’t return a sentinel — the error names the function and the requirement.',
        'The happy path stays a single, obvious line.',
      ],
      commonMistake: 'Returning None or 0 on bad input. The caller forgets to check, and the bad value flows downstream.',
    },
    {
      type: 'concept',
      title: 'Fail fast at the boundary',
      text: 'Validate inputs at the edge of a function (or a system), reject what violates the contract immediately, and make the error specific. The cost of a failure grows the further it travels from its cause — so stop it at the door.',
    },
    {
      type: 'lab',
      title: 'Build the guarded function',
      summary: 'Implement average() so it raises ValueError on an empty list and returns the mean otherwise. Run it until the checkpoint passes.',
      language: 'python',
      starter: 'def average(values):\n    # guard the empty case, then return the mean\n    return sum(values) / len(values)\n\n# prove it works:\nprint(average([10, 20, 30]))\n',
      check: '20.0',
    },
    {
      type: 'debug',
      symptom: 'This “fixed” version still crashes on average([]) with ZeroDivisionError instead of a clear message.',
      language: 'python',
      brokenCode: 'def average(values):\n    total = sum(values)\n    return total / len(values)  # crashes when values is empty',
      task: 'Spot why the guard is missing, then describe the one-line fix.',
      fix: 'Add `if not values: raise ValueError("average() needs at least one value")` as the first line — before any division.',
    },
    {
      type: 'tradeoff',
      question: 'Empty input: raise an exception, or return None?',
      optionA: { label: 'Raise ValueError', text: 'Loud, immediate, names the contract. Callers must handle it.' },
      optionB: { label: 'Return None', text: 'Quiet, “convenient” — but pushes the failure downstream and invites NoneType bugs.' },
      guidance: 'Raise for a violated contract. Return None only when “absent” is a valid, expected result the caller is designed to handle — and document it. For average([]), absence is not a valid average, so raise.',
    },
    {
      type: 'verification',
      intro: 'Prove it — don’t assume it.',
      items: [
        'average([10, 20, 30]) returns 20.0',
        'average([]) raises ValueError, not ZeroDivisionError',
        'The error message names the function and the requirement',
        'A test asserts both the happy path and the failure',
      ],
    },
    {
      type: 'quiz',
      question: 'Why prefer raising over returning a sentinel like -1 for invalid input?',
      options: [
        'It’s faster at runtime',
        'It forces the failure to surface at the boundary instead of flowing downstream',
        'It uses less memory',
        'Sentinels are not allowed in Python',
      ],
      answer: 1,
      explanation: 'A raised error stops bad data at the source; a sentinel can be silently passed along and misinterpreted later.',
    },
    {
      type: 'teachback',
      prompts: [
        'What does “validate at the boundary” mean, in one sentence?',
        'Show a concrete before/after with a real function.',
        'Name one edge case beyond the empty list (e.g. non-numeric values).',
        'When would returning None actually be the right call?',
      ],
    },
    {
      type: 'calibration',
      artifact: 'failure-handling note',
      weak: '“I added a check for empty.” — vague, unproven, no error detail, no test.',
      passing: '“average() raises ValueError on [] with a named message; test asserts the raise and the happy path.” — correct, specific, verifiable.',
      excellent: '“average() fails fast on empty input (ValueError, named); chose raise over None because absence isn’t a valid mean; also guards non-numeric values; tests cover happy path, empty, and bad type; same pattern applies to our API request validators.” — correct, specific, tradeoff- and failure-aware, transferable.',
      note: 'A score can’t exceed 4/5 without concrete evidence and one handled follow-up. “Passing” is the floor for unlock; “excellent” is what the calibration bank trains toward.',
    },
    {
      type: 'transfer',
      text: 'Far transfer: take a function from your own code that trusts its input — a request handler, a parser, a config loader — and add one boundary guard with a named error and a test. Different domain, same pattern.',
    },
    { type: 'spaced-review' },
    {
      type: 'unlock-gate',
      criteria: [
        'Lab checkpoint passed (average returns the mean)',
        'Broken case understood and the fix stated',
        'All four verification proofs checked',
        'Teach-back delivered with one concrete example + one edge case',
        'Transfer task scheduled against your own code',
      ],
    },
  ],
}
