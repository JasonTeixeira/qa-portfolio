/**
 * Seed the first real Sage Academy course from the engineering-mastery-system.
 *
 *   tsx scripts/academy/seed-programming-fundamentals.ts --dry-run
 *   tsx --env-file=.env.local scripts/academy/seed-programming-fundamentals.ts --apply
 *
 * Course:  Programming Fundamentals  (topic: engineering)
 * Lesson:  Input Validation — Trust Nothing at the Boundary  (gold-standard deep sprint)
 *
 * This is the TEMPLATE for ingesting the mastery system: a scenario/cluster +
 * its concept node → a full Learning-Engine sprint (Sage's 16-step loop), grounded
 * in the source content (concepts/deep-nodes/input-validation.md) and meeting the
 * system's quality-bar + 8 polish gates. Idempotent (upsert). Re-run any time.
 */

import { createClient } from '@supabase/supabase-js'

const shouldApply = process.argv.includes('--apply')

const COURSE_SLUG = 'programming-fundamentals'

// ---------------------------------------------------------------- pre/post quiz
// Course-level Hake's-g assessment. Grounded in the input-validation node + the
// foundations cluster. Server-scored; the answer key never reaches the browser.
const pretest = [
  {
    id: 'pre1',
    prompt: 'Where should untrusted input be validated?',
    options: [
      'Only in the browser / UI',
      'At every trust boundary, especially server-side',
      'Only in the database',
      "It doesn't need validation if the user is logged in",
    ],
    answer: 1,
  },
  {
    id: 'pre2',
    prompt: "A function receives age = '-3' (a string). What is the safest behavior?",
    options: [
      'Convert it to an int and continue',
      'Reject it with a clear, actionable error',
      'Default it to 0 and continue',
      'Log it and continue',
    ],
    answer: 1,
  },
  {
    id: 'pre3',
    prompt: 'Why is client-side-only validation insufficient?',
    options: [
      "It's too slow",
      'The client is untrusted — callers can bypass the UI and hit the API directly',
      'It uses too much memory',
      "It can't display error messages",
    ],
    answer: 1,
  },
]

const posttest = [
  {
    id: 'post1',
    prompt: 'Which check belongs at the database layer as a backstop, not just the app?',
    options: [
      'Trimming whitespace from a name',
      'A critical uniqueness / not-null invariant',
      'Formatting the error message',
      'Showing a loading spinner',
    ],
    answer: 1,
  },
  {
    id: 'post2',
    prompt: 'When is normalizing input (instead of rejecting it) appropriate?',
    options: [
      "Always — it's friendlier",
      'Only when the transformation is safe and explicit (e.g. trimming whitespace)',
      'Never',
      'Only on the client',
    ],
    answer: 1,
  },
  {
    id: 'post3',
    prompt: 'Which is a validation failure that becomes a security bug?',
    options: [
      'A friendly error message',
      'No max-length check, enabling injection or resource exhaustion',
      'Validating on the server',
      'Rejecting -3 as an age',
    ],
    answer: 1,
  },
]

// ---------------------------------------------------------------- lesson blocks
// A full STANDARD sprint (+ calibration + a quick-check), every block grounded in
// concepts/deep-nodes/input-validation.md and the quality-bar required questions.
const LAB_STARTER = `def validate_age(value):
    # Accept ONLY an int in 0..120. Otherwise raise ValueError with a clear message.
    # Tip: check the TYPE first, then the range. Don't coerce — reject.
    ...  # your code here


# --- test harness (do not edit) ---
for v in [25, "25", -3, 200]:
    try:
        validate_age(v)
        print(f"accepted: {v!r}")
    except ValueError as e:
        print(f"rejected {v!r}: {e}")
`

const blocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Write a validator that rejects malformed, wrong-type, out-of-range, and hostile input at the boundary — and explain what belongs at the client, server, and database.',
    intensity: 'standard',
    time: '60–90 min',
    proof: 'A passing validate_age() plus a negative test that proves a hostile input is rejected, and a teach-back.',
    unlock: 'All verification checks confirmed and the broken case fixed.',
    doNotClaim:
      "Don't claim mastery until you've written a NEGATIVE test that proves invalid input is rejected — not just that valid input passes.",
  },
  {
    type: 'mission',
    text: 'Your signup endpoint just let a user register with an empty email, a 50,000-character name, and age = -3. That data is now in your database. Your job: stop trusting input — validate it at the boundary before the system ever believes it.',
  },
  {
    type: 'context',
    text: 'Unchecked input is the #1 cause of crashes, corrupted data, and an entire class of security bugs (injection, impossible states). Every API handler, CLI parser, config loader, and pipeline step needs this. Learn the pattern once and it pays off in every system you will ever build.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: a teammate says "the frontend already validates the form, so the API doesn\'t need to." Why is that dangerous?',
    reveal:
      'The client is untrusted. Anyone can call the API directly — curl, a script, a malicious client — and skip the UI entirely. Validation must happen server-side, at the boundary. Client validation is only a UX nicety; it is never a security control.',
  },
  {
    type: 'worked-example',
    intro:
      'The boundary pattern: parse into a known shape, then check type → presence → range → length → business rules, rejecting with an actionable error. Here it is for a signup payload:',
    language: 'python',
    code: `def validate_signup(data):
    # 1. shape: must be a dict
    if not isinstance(data, dict):
        raise ValueError("signup must be an object")
    # 2. presence + type
    email = data.get("email")
    if not isinstance(email, str) or "@" not in email:
        raise ValueError("email must be a valid address")
    # 3. length (stops DoS / overflow)
    name = data.get("name", "")
    if not isinstance(name, str) or not (1 <= len(name) <= 100):
        raise ValueError("name must be 1–100 characters")
    # 4. range
    age = data.get("age")
    if not isinstance(age, int) or not (0 <= age <= 120):
        raise ValueError("age must be an integer 0–120")
    return {"email": email, "name": name.strip(), "age": age}`,
    steps: [
      'Identify the boundary — where untrusted data first enters.',
      'Parse into a known shape before trusting anything.',
      'Check type, required fields, range, and length — in that order.',
      'Reject invalid data with an actionable error message.',
      'Normalize only when the transform is safe and explicit (e.g. trim).',
    ],
    commonMistake:
      'Validating AFTER a side effect (e.g. after the DB insert). By then the bad data is already in. Validate first, act second.',
  },
  {
    type: 'concept',
    title: 'Trust boundary: input is hostile until proven valid',
    text: 'A trust boundary is any line where untrusted data crosses into your system. Validation is the contract at that edge: confirm the shape, type, range, format, and business rules before the system trusts the data. Core models — input is hostile until proven valid; reject vs normalize; safe failure; the contract lives at the edge, not deep inside.',
  },
  {
    type: 'lab',
    title: 'Write the validator',
    summary:
      'Implement validate_age(value): accept only an int in 0–120, otherwise raise ValueError with a clear message. The harness then throws four inputs at it — including the hostile string "25". Make it reject what should be rejected.',
    language: 'python',
    starter: LAB_STARTER,
    check: "rejected '25'",
  },
  {
    type: 'debug',
    symptom: 'This "validator" accepts the string "25" and even -3 silently — bad data flows downstream.',
    language: 'python',
    brokenCode: `def validate_age(value):
    if value:                     # truthiness, not a real check
        return value
    raise ValueError("bad age")`,
    task: 'Find why hostile input slips through.',
    fix: 'Truthiness is not validation: "25" and -3 are both truthy, and 0 is falsy (a valid age!). Check the TYPE explicitly with isinstance(value, int), then the range. Reject, don\'t coerce.',
  },
  {
    type: 'tradeoff',
    question: 'Invalid input arrives at the boundary. Reject it, or normalize it?',
    optionA: {
      label: 'Reject',
      text: 'Fail fast with an actionable error. Safe, explicit, preserves the user’s intent — but adds friction.',
    },
    optionB: {
      label: 'Normalize',
      text: 'Quietly fix it (trim, coerce, default). Smoother UX — but can hide invalid input and silently change what the user meant.',
    },
    guidance:
      'Reject by default at trust boundaries. Normalize only when the transformation is safe AND explicit — like trimming whitespace. Over-normalization hides attacks and corrupts intent.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'validate_age(25) is accepted',
      "validate_age('25') is REJECTED (it is a string, not an int)",
      'validate_age(-3) is REJECTED (out of range)',
      'validate_age(200) is REJECTED (out of range)',
      'The error message names the constraint',
      'A negative test asserts a rejection — not just that valid input passes',
    ],
  },
  {
    type: 'quiz',
    question: 'Which validation belongs at the database layer, not just the application?',
    options: [
      'Formatting an error message',
      'A critical uniqueness / invariant constraint (e.g. unique email)',
      'Trimming whitespace',
      'Showing a red border on the form',
    ],
    answer: 1,
    explanation:
      'Critical invariants (uniqueness, foreign keys, not-null) should be backstopped by DB constraints. Application checks can race or be bypassed; the database is the last line of defense.',
  },
  {
    type: 'teachback',
    prompts: [
      'Explain "trust boundary" in one sentence.',
      'Why is client-side validation insufficient on its own?',
      'Name two validation failures that become security bugs.',
      'When would you normalize instead of reject?',
    ],
  },
  {
    type: 'calibration',
    artifact: 'Your validate_age() + its negative test',
    weak: '"I added a check for age." — vague, no type/range proof, no negative test.',
    passing:
      '"validate_age rejects non-ints and anything outside 0–120 with a clear ValueError; a test asserts that -3 and \'25\' are rejected." — correct and verifiable.',
    excellent:
      '"validate_age enforces type + range at the boundary and rejects (not normalizes) hostile input with an actionable error. Tests cover missing, wrong-type, out-of-range, and the boundaries 0 and 120. I added a DB CHECK constraint as a backstop and noted that client validation is UX-only. The same boundary pattern applies to our API request schemas." — specific, reasoned, transferable, production-aware.',
    note: 'Excellent requires evidence of transfer + a backstop — that is L5–L7 on the mastery scale.',
  },
  {
    type: 'transfer',
    text: 'Take one function in your own code that accepts external input (a request handler, a CLI argument, a file parser). Add a boundary validator and one negative test. Note which checks belong at the client, the server, and the database.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
  {
    type: 'unlock-gate',
    criteria: [
      'Lab checkpoint passed — the validator rejects the hostile string input',
      'Broken case understood and fixed (truthiness ≠ validation)',
      'All verification checks confirmed',
      'Teach-back delivered with a concrete example',
      'Transfer task scheduled on your own code',
    ],
  },
]

// ---------------------------------------------------------------- lesson 2 blocks
// "Error Handling — Make Failures Loud, Safe, and Diagnosable".
// Grounded in concepts/deep-nodes/error-handling.md (mental models, failure modes,
// implementation pattern). Standard sprint with a runnable "surface the error" lab.
const ERROR_LAB_STARTER = `def safe_divide(a, b):
    # Don't swallow it. Catch ZeroDivisionError, log operator context (print a line),
    # then chain a clear error:  raise ValueError("cannot divide by zero") from e
    ...  # your code here


# --- test harness (do not edit) ---
try:
    print("ok:", safe_divide(10, 2))
    safe_divide(10, 0)
    print("BUG: no error raised — it was swallowed!")
except ValueError as e:
    print(f"error surfaced: {e}")
`

const errorHandlingBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Handle errors so failures surface loudly, users get a safe clear message, operators get enough context to diagnose — and you never swallow an exception.',
    intensity: 'standard',
    time: '60–90 min',
    proof: 'A function that catches deliberately, logs operator context, raises a clear error, plus a test proving the error is NOT swallowed.',
    unlock: 'All verification checks confirmed and the swallowed-exception case fixed.',
    doNotClaim:
      "Don't claim mastery until you've shown a swallowed-exception bug and fixed it with a test that proves the error now surfaces.",
  },
  {
    type: 'mission',
    text: 'A background job has been "succeeding" for a week — but it wrapped everything in `except Exception: pass`. Thousands of records silently failed and no one knew. Your job: make failures loud, safe, and diagnosable.',
  },
  {
    type: 'context',
    text: 'Error handling is where junior and senior code diverge. The same try/except can hide a production outage for a week or turn it into a 30-second fix. Every job, request handler, and pipeline step lives or dies on this.',
  },
  {
    type: 'pretest',
    prompt: 'Before you read on: why is `except Exception: pass` one of the most dangerous lines you can write?',
    reveal:
      'It swallows EVERY error — including ones you never anticipated (a real bug, disk-full, a typo). The program keeps running as if nothing happened, so the failure becomes invisible and undebuggable. Catch narrowly, handle deliberately, and never silently pass.',
  },
  {
    type: 'worked-example',
    intro: 'Catch deliberately, preserve operator context, surface a safe message, and define retry behaviour:',
    language: 'python',
    code: `import logging

def charge_card(user_id, amount):
    try:
        return payment_api.charge(user_id, amount)  # illustrative API
    except TransientNetworkError as e:
        # transient -> retry ONLY if the call is idempotent (safe to repeat)
        logging.warning("charge retryable: user=%s amount=%s (%s)", user_id, amount, e)
        raise RetryableError("payment temporarily unavailable") from e
    except CardDeclinedError as e:
        # non-retryable -> surface a safe user message, log operator context
        logging.error("charge declined: user=%s amount=%s (%s)", user_id, amount, e)
        raise UserError("Your card was declined.") from e`,
    steps: [
      'Classify the error: recoverable vs unrecoverable, retryable vs not.',
      'Catch the SPECIFIC errors you can handle — never a bare `except`.',
      'Preserve operator context: log the inputs + the original error, and chain with `from e` so the operator sees the real root cause (Python keeps it as `__cause__`), not just your wrapper.',
      'Return a SAFE user message — never leak internals or stack traces to users.',
      'Retry only failures that are transient AND idempotent (safe to repeat).',
    ],
    commonMistake:
      'Overbroad `except Exception` that also catches the bugs you should let crash. Catch what you can actually handle; let the rest surface.',
  },
  {
    type: 'concept',
    title: 'Recoverable vs unrecoverable · user message vs operator context',
    text: 'Good error handling answers four questions: Is this recoverable or fatal? Is it retryable or not? What does the USER safely need to see? What does the OPERATOR need logged to diagnose? Safe failure means the system fails in a known, observable state — loudly, with context — never silently.',
  },
  {
    type: 'lab',
    title: 'Make the failure loud',
    summary:
      'Implement safe_divide(a, b) like the worked example: catch ZeroDivisionError, log operator context, and `raise ValueError("cannot divide by zero") from e` — never swallow it. The checkpoint proves the error SURFACES; the verification list below then confirms you caught, logged, and chained it.',
    language: 'python',
    starter: ERROR_LAB_STARTER,
    check: 'error surfaced: cannot divide by zero',
  },
  {
    type: 'debug',
    symptom: 'This "handles" errors — and hid a week of silent data loss.',
    language: 'python',
    brokenCode: `for record in batch:
    try:
        process(record)
    except Exception:
        pass   # "it won't crash now"`,
    task: 'Find why failures became invisible.',
    fix: 'A bare/overbroad `except` + `pass` swallows everything. Catch the specific recoverable error, log operator context (which record, the real error), and either re-raise or record the failure to a dead-letter list — never `pass`.',
  },
  {
    type: 'tradeoff',
    question: 'An external API call fails. Retry, or fail fast?',
    optionA: {
      label: 'Retry',
      text: 'Right for transient failures (a timeout or 503) — but only if the call is idempotent. Retrying a declined card (400) just fails again; the real danger is retrying a timeout that may have already charged.',
    },
    optionB: {
      label: 'Fail fast',
      text: 'Surface immediately. Safe for non-retryable errors, but gives up on transient blips a single retry would have fixed.',
    },
    guidance:
      'Classify first. Retry only failures that are transient AND idempotent — “idempotent” means safe to repeat with the same effect as once (e.g. the API dedupes on a key). The double-charge trap isn’t the declined card — it’s retrying a timeout whose real outcome you don’t know.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'safe_divide(10, 2) returns 5.0',
      'safe_divide(10, 0) RAISES — it does not return or swallow',
      'The raised error carries a clear, safe message — no stack trace or internals leaked to the user',
      'Operator context (the inputs / original error) is logged, and the cause is chained with `from e`',
      'A test ASSERTS the error is raised — proving it is not swallowed',
    ],
  },
  {
    type: 'quiz',
    question: "What is the safest way to handle an error you can't recover from?",
    options: [
      'Catch it and `pass`',
      'Catch it, log operator context, and re-raise (or fail loudly)',
      'Return None and continue',
      "Print 'error' and move on",
    ],
    answer: 1,
    explanation:
      'Unrecoverable errors must surface. Log enough context to diagnose, then re-raise or fail. Swallowing it or returning None hides the failure and corrupts everything downstream. Log once, at the boundary that has the context — re-wrapping at every layer just creates noise.',
  },
  {
    type: 'teachback',
    prompts: [
      'Explain "swallowed exception" and why it is dangerous.',
      'When should you re-raise an error vs handle it?',
      'What is the difference between the user message and the operator context?',
      'When is retrying an error the WRONG move?',
    ],
  },
  {
    type: 'calibration',
    artifact: 'Your safe_divide() + its test',
    weak: '"I added a try/except." — it might be silently swallowing the error.',
    passing:
      '"safe_divide catches ZeroDivisionError, logs the inputs, and raises ValueError with a clear message; a test asserts it raises." — correct and verifiable.',
    excellent:
      '"safe_divide distinguishes recoverable vs not, logs operator context (inputs + original error chained with `from e`), returns a safe user message, and never swallows. Tests cover the happy path AND assert the error surfaces. I classified which API errors are retryable. The same pattern hardens our job runner." — specific, reasoned, production-aware, transferable.',
    note: 'Excellent shows the user-vs-operator split + retry classification — L5–L7 on the mastery scale.',
  },
  {
    type: 'transfer',
    text: 'Find one try/except in your own code. Is it swallowing? Make it catch narrowly, log operator context, surface a safe message, and classify retryable vs not. Add a test that proves the error surfaces.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
  {
    type: 'unlock-gate',
    criteria: [
      'Lab checkpoint passed — the error surfaces, it is not swallowed',
      'Broken case understood (a bare `except` hides failures)',
      'All verification checks confirmed',
      'Teach-back delivered with a concrete example',
      'Transfer task scheduled on your own code',
    ],
  },
]

async function main() {
  if (!shouldApply) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          applyCommand:
            'tsx --env-file=.env.local scripts/academy/seed-programming-fundamentals.ts --apply',
          course: COURSE_SLUG,
          pretestQuestions: pretest.length,
          posttestQuestions: posttest.length,
          lessonSlug: 'input-validation',
          lessonBlocks: blocks.length,
        },
        null,
        2,
      ),
    )
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (load .env.local).')
    process.exit(1)
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // 1. Course (upsert on slug) + pre/post banks.
  const { error: cErr } = await sb.from('academy_courses').upsert(
    {
      slug: COURSE_SLUG,
      title: 'Programming Fundamentals',
      subtitle: 'Become fluent with code, execution, debugging, and clean input handling.',
      topic: 'engineering',
      level: 'Beginner',
      hours: 1,
      sort: 0,
      status: 'published',
      pretest,
      posttest,
    },
    { onConflict: 'slug' },
  )
  if (cErr) throw cErr

  // 2. Lesson 1 — the gold-standard sprint (upsert on course_slug+slug).
  const { error: lErr } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'input-validation',
      title: 'Input Validation: Trust Nothing at the Boundary',
      eyebrow: 'Module 1 · Lesson 1 · 75 min',
      module_title: 'Module 1 · Foundations',
      module_sort: 0,
      sort: 0,
      est_minutes: 75,
      is_free_preview: true,
      status: 'published',
      intensity: 'standard',
      blocks,
    },
    { onConflict: 'course_slug,slug' },
  )
  if (lErr) throw lErr

  // 2b. Lesson 2 — Error Handling (grounded in deep-nodes/error-handling.md).
  const { error: l2Err } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'error-handling',
      title: 'Error Handling: Make Failures Loud, Safe, and Diagnosable',
      eyebrow: 'Module 1 · Lesson 2 · 75 min',
      module_title: 'Module 1 · Foundations',
      module_sort: 0,
      sort: 1,
      est_minutes: 75,
      is_free_preview: false,
      status: 'published',
      intensity: 'standard',
      blocks: errorHandlingBlocks,
    },
    { onConflict: 'course_slug,slug' },
  )
  if (l2Err) throw l2Err

  // 3. Maintain the denormalized lesson counter.
  const { count } = await sb
    .from('academy_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_slug', COURSE_SLUG)
    .eq('status', 'published')
  await sb.from('academy_courses').update({ lessons: count ?? 0 }).eq('slug', COURSE_SLUG)

  console.log(`✓ Seeded "${COURSE_SLUG}" — ${count ?? 0} published lesson(s), ${pretest.length} pre / ${posttest.length} post questions.`)
}

main().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
