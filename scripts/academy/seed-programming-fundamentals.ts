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
// Course-spanning pre-test: samples both modules, easy → hard (First Steps basics
// → Foundations craft), so the pre/post gain measures the WHOLE course, not one topic.
const pretest = [
  {
    id: 'pre1',
    prompt: 'What does a variable do in a program?',
    options: [
      'Prints text to the screen',
      'Stores a value under a name you can reuse later',
      'Repeats an action many times',
      'Permanently changes the language',
    ],
    answer: 1,
  },
  {
    id: 'pre2',
    prompt: 'In Python, what is the result of "2" + "3" (both in quotes)?',
    options: ['5', "'23'", 'an error', '6'],
    answer: 1,
  },
  {
    id: 'pre3',
    prompt: 'To add up every number in a list, the right tool is to…',
    options: [
      'Write the addition out by hand for each item',
      'Loop over the list, accumulating a running total',
      'Convert the list to a string',
      'Use an if-statement',
    ],
    answer: 1,
  },
  {
    id: 'pre4',
    prompt: "What does a function's return value do?",
    options: [
      'Prints it to the screen',
      'Hands a result back to the code that called the function',
      'Saves it to a file',
      'Nothing — return is optional decoration',
    ],
    answer: 1,
  },
  {
    id: 'pre5',
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
    id: 'pre6',
    prompt: 'When an operation can fail (e.g. divide by zero), the safest response is to…',
    options: [
      'Let it crash silently and move on',
      'Raise or handle a clear, specific error',
      'Return 0 and continue',
      'Ignore it — failures are rare',
    ],
    answer: 1,
  },
  {
    id: 'pre7',
    prompt: 'A good automated test…',
    options: [
      'Passes no matter what the code does',
      'Fails when the code is wrong and passes when it is right',
      'Only checks that the file runs',
      'Replaces the need to read the code',
    ],
    answer: 1,
  },
]

// Course-spanning post-test: same concepts as the pre-test, tested at a harder
// surface, so (post − pre) reflects genuine learning across both modules.
const posttest = [
  {
    id: 'post1',
    prompt: 'After running x = 5 then x = 9, what is the value of x?',
    options: ['5', '9', 'both 5 and 9', 'an error'],
    answer: 1,
  },
  {
    id: 'post2',
    prompt: 'What does int("25") evaluate to?',
    options: ["the string '25'", 'the integer 25', 'an error', '2.5'],
    answer: 1,
  },
  {
    id: 'post3',
    prompt: 'In a for-loop that sums a list, where must the running total be created?',
    options: [
      'Inside the loop, so it resets each pass',
      'Before the loop, so it survives across every pass',
      'After the loop',
      'It does not matter',
    ],
    answer: 1,
  },
  {
    id: 'post4',
    prompt: 'A function that has no return statement gives back…',
    options: ['0', 'None', 'the last variable used', 'an error'],
    answer: 1,
  },
  {
    id: 'post5',
    prompt: 'Why is client-side-only validation insufficient?',
    options: [
      "It's too slow",
      'The client is untrusted — callers can bypass the UI and hit the API directly',
      'It uses too much memory',
      "It can't display error messages",
    ],
    answer: 1,
  },
  {
    id: 'post6',
    prompt: 'Catching an exception and then ignoring it (a bare except that does nothing)…',
    options: [
      'Is best practice — it keeps the program running',
      'Hides bugs and produces silent, hard-to-diagnose failures',
      'Is required by Python',
      'Makes the code faster',
    ],
    answer: 1,
  },
  {
    id: 'post7',
    prompt: 'A test that passes no matter what the implementation does…',
    options: [
      'Is the safest kind of test',
      'Gives false confidence — it proves nothing',
      'Is fine if it runs quickly',
      'Counts as full coverage',
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
    text: 'Your signup endpoint just accepted an empty email, a 50,000-character name, and age = -3 — and that garbage is now in your database. The gradebook you shipped in First Steps worked only because its data was clean; real data never is. Today your code stops trusting input and checks it at the boundary first.',
  },
  {
    type: 'context',
    text: 'Unchecked input is the #1 cause of crashes, corrupted data, and a whole class of security bugs. It is the through-line of this module: distrust the outside world, check it at the edge.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: a teammate says "the frontend already validates the form, so the API doesn\'t need to." Why is that dangerous?',
    reveal:
      'The client is untrusted. Anyone can call the API directly — curl, a script, a malicious client — and skip the UI entirely. Validation must happen server-side, at the boundary. Client validation is only a UX nicety; it is never a security control.',
  },
  {
    type: 'concept',
    title: 'Input is hostile until proven valid',
    text: 'A trust boundary is any line where untrusted data crosses into your system. At that edge, confirm shape → type → presence → range → length → rules before the system believes a word of it. Reject by default; normalize only when the transform is safe and explicit.',
  },
  {
    type: 'diagram',
    title: 'Where validation lives — at the boundary, before any side effect',
    subtitle: 'Untrusted input must pass the validator before it can touch the database. Validate first, act second.',
    rankdir: 'LR',
    nodes: [
      { id: 'client', label: 'Untrusted input', description: 'form · API · curl · script', kind: 'client', tone: 'warning' },
      { id: 'boundary', label: 'Validator', description: 'shape · type · range · length', kind: 'decision', tone: 'accent' },
      { id: 'reject', label: 'Reject', description: 'actionable ValueError', kind: 'process', tone: 'warning' },
      { id: 'logic', label: 'App logic', description: 'now trusts the data', kind: 'service', tone: 'success' },
      { id: 'db', label: 'Database', description: 'CHECK backstops invariants', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'client', to: 'boundary', label: 'crosses the edge', kind: 'sync' },
      { from: 'boundary', to: 'reject', label: 'invalid', kind: 'control', tone: 'warning' },
      { from: 'boundary', to: 'logic', label: 'valid only', kind: 'data', tone: 'success' },
      { from: 'logic', to: 'db', label: 'writes', kind: 'sync', tone: 'success' },
    ],
    legend: [
      { tone: 'warning', label: 'hostile until proven valid' },
      { tone: 'accent', label: 'the boundary check' },
      { tone: 'success', label: 'trusted past the edge' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'The boundary pattern, one check at a time',
    subtitle: 'Parse into a known shape, then check type → presence → length → range, rejecting with an actionable error.',
    filename: 'signup.py',
    language: 'python',
    code: `def validate_signup(data):
    if not isinstance(data, dict):
        raise ValueError("signup must be an object")
    email = data.get("email")
    if not isinstance(email, str) or "@" not in email:
        raise ValueError("email must be a valid address")
    name = data.get("name", "")
    if not isinstance(name, str) or not (1 <= len(name) <= 100):
        raise ValueError("name must be 1-100 characters")
    age = data.get("age")
    if not isinstance(age, int) or not (0 <= age <= 120):
        raise ValueError("age must be an integer 0-120")
    return {"email": email, "name": name.strip(), "age": age}`,
    steps: [
      { lines: [2, 3], label: 'Shape first', note: 'Parse into a known shape before trusting any field. If it is not even a dict, reject immediately.' },
      { lines: [4, 5, 6], label: 'Presence + type', note: '`data.get("email")` is missing-safe; the isinstance check rejects non-strings before you ever call a string method.' },
      { lines: [7, 8, 9], label: 'Length (stops DoS / overflow)', note: 'A 50,000-char name is a denial-of-service vector. Bound it at the edge.' },
      { lines: [10, 11, 12], label: 'Range', note: 'age = -3 is the bug from the mission. isinstance(age, int) also blocks the hostile string "25".' },
      { lines: [13], label: 'Normalize only when safe', note: 'Return a clean shape; `.strip()` is an explicit, safe transform — never silently coerce a wrong type.' },
    ],
    caption: 'Common mistake: validating AFTER a side effect (e.g. after the DB insert). By then the bad data is already in.',
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
    type: 'compare',
    title: 'Invalid input at the boundary: reject vs normalize',
    subtitle: 'Both run; only one preserves what the user actually meant.',
    mono: true,
    left: {
      label: 'Reject (default)',
      tone: 'success',
      lines: [
        'isinstance + range check fails',
        'raise ValueError("age 0-120")',
        'Caller sees exactly what was wrong',
        'Hostile input never enters the system',
        'Friction: the user must resend',
      ],
      verdict: 'Safe, explicit, preserves intent',
    },
    right: {
      label: 'Over-normalize',
      tone: 'warning',
      lines: [
        'age = int(value or 0)',
        '"-3" silently becomes 0 or -3',
        'No error — looks like it worked',
        'Hides attacks; corrupts the real value',
        'Smoother UX, wrong data',
      ],
      verdict: 'Quietly changes what the user meant',
    },
    caption: 'Reject by default at trust boundaries. Normalize only when the transform is safe AND explicit — like trimming whitespace.',
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
    type: 'transfer',
    text: 'Take one function in your own code that accepts external input (a request handler, a CLI argument, a file parser). Add a boundary validator and one negative test. Note which checks belong at the client, the server, and the database. You now reject bad input cleanly — but next lesson asks the harder question: when something fails anyway, how do you fail loudly and safely instead of silently?',
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
    text: 'A background job has been "succeeding" for a week — because it wrapped everything in `except Exception: pass`. Thousands of records silently failed and no one knew. Last lesson you rejected bad input at the door; today you handle the failures that slip past every guard, making them loud, safe, and diagnosable.',
  },
  {
    type: 'context',
    text: 'Error handling is where junior and senior code diverge. The same try/except can hide a production outage for a week or turn it into a 30-second fix.',
  },
  {
    type: 'pretest',
    prompt: 'Before you read on: why is `except Exception: pass` one of the most dangerous lines you can write?',
    reveal:
      'It swallows EVERY error — including ones you never anticipated (a real bug, disk-full, a typo). The program keeps running as if nothing happened, so the failure becomes invisible and undebuggable. Catch narrowly, handle deliberately, and never silently pass.',
  },
  {
    type: 'concept',
    title: 'Recoverable vs fatal · user message vs operator context',
    text: 'Good error handling answers four questions: recoverable or fatal? retryable or not? what does the USER safely see? what does the OPERATOR need logged? Safe failure = the system fails in a known, observable state — loudly, with context — never silently.',
  },
  {
    type: 'diagram',
    title: 'An error arrives — classify, then act',
    subtitle: 'Every failure routes through the same four questions. A bare `except: pass` short-circuits all of them.',
    rankdir: 'LR',
    nodes: [
      { id: 'err', label: 'Exception raised', description: 'network · declined · bug', kind: 'client', tone: 'warning' },
      { id: 'classify', label: 'Recoverable?', description: 'can I handle this?', kind: 'decision', tone: 'accent' },
      { id: 'crash', label: 'Let it surface', description: 'unknown bug → crash loudly', kind: 'process', tone: 'warning' },
      { id: 'retry', label: 'Retryable?', description: 'transient AND idempotent', kind: 'decision', tone: 'accent' },
      { id: 'log', label: 'Log operator context', description: 'inputs + original error · chain `from e`', kind: 'store', tone: 'success' },
      { id: 'user', label: 'Safe user message', description: 'no stack trace leaked', kind: 'service', tone: 'success' },
    ],
    edges: [
      { from: 'err', to: 'classify', label: 'caught narrowly', kind: 'sync' },
      { from: 'classify', to: 'crash', label: 'no — fatal', kind: 'control', tone: 'warning' },
      { from: 'classify', to: 'retry', label: 'yes', kind: 'control', tone: 'accent' },
      { from: 'retry', to: 'log', label: 'always log', kind: 'data', tone: 'success' },
      { from: 'log', to: 'user', label: 'then surface', kind: 'data', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'classify before acting' },
      { tone: 'success', label: 'log context + safe message' },
      { tone: 'warning', label: 'let the unhandleable crash' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Catch deliberately — one branch at a time',
    subtitle: 'Specific catches, operator context logged, a safe user message, retry only where it is safe.',
    filename: 'payments.py',
    language: 'python',
    code: `import logging

def charge_card(user_id, amount):
    try:
        return payment_api.charge(user_id, amount)
    except TransientNetworkError as e:
        logging.warning("charge retryable: user=%s amount=%s (%s)", user_id, amount, e)
        raise RetryableError("payment temporarily unavailable") from e
    except CardDeclinedError as e:
        logging.error("charge declined: user=%s amount=%s (%s)", user_id, amount, e)
        raise UserError("Your card was declined.") from e`,
    steps: [
      { lines: [4, 5], label: 'The risky call', note: 'Only the line that can fail goes in the try. Wrapping more would catch bugs you meant to let crash.' },
      { lines: [6, 7, 8], label: 'Transient → retryable', note: 'A network blip is recoverable. Log operator context, then re-raise a typed RetryableError — retry only if the call is idempotent.' },
      { lines: [9, 10, 11], label: 'Declined → non-retryable', note: 'Retrying a declined card just fails again. Surface a safe user message; log the real error for the operator.' },
      { lines: [8, 11], label: 'Chain with `from e`', note: 'Python keeps the original as `__cause__`, so the operator sees the true root cause — not just your wrapper.' },
    ],
    caption: 'Common mistake: an overbroad `except Exception` that also catches the bugs you should let crash. Catch what you can actually handle.',
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
    type: 'compare',
    title: 'An external API call fails: retry vs fail fast',
    subtitle: 'Classify first — the right move depends on whether the failure is transient AND idempotent.',
    left: {
      label: 'Retry',
      tone: 'success',
      lines: [
        'Right for transient failures (timeout, 503)',
        'ONLY if the call is idempotent',
        'Idempotent = safe to repeat, same effect',
        'Trap: retrying a timeout that may have charged',
        'Wrong for a declined card (400) — fails again',
      ],
      verdict: 'Recovers blips a single retry would fix',
    },
    right: {
      label: 'Fail fast',
      tone: 'accent',
      lines: [
        'Surface the error immediately',
        'Right for non-retryable errors',
        'A declined card should NOT be retried',
        'Gives up on a transient blip too early',
        'Safe default when outcome is unknown',
      ],
      verdict: 'Safe, but abandons recoverable failures',
    },
    caption: 'The double-charge trap is not the declined card — it is retrying a timeout whose real outcome you do not know.',
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
    type: 'transfer',
    text: 'Find one try/except in your own code. Is it swallowing? Make it catch narrowly, log operator context, surface a safe message, and classify retryable vs not. Add a test that proves the error surfaces. Validation and error handling both got easier to reason about in one spot — and next lesson shows why: small, pure functions are where this clarity actually lives.',
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

// ---------------------------------------------------------------- lesson 3 blocks
// "Functions & Modules — Build Small, Testable Units". Grounded in the
// 01-programming-fundamentals cluster (Functions & modules; anchor "function works
// manually but fails in tests") + established practice. Standard sprint, runnable lab.
const FUNCTIONS_LAB_STARTER = `# This "works" in the REPL but FAILS in tests when another part of the app
# changes \`discount\`. Refactor line_total to be PURE: depend ONLY on its
# parameters (price, qty), RETURN the total, read no globals, no print.
discount = 0

def line_total(price, qty):
    return (price * qty) - discount   # <-- hidden dependency on a global; fix this


# --- test harness (do not edit) ---
cases = [(10, 3, 30), (5, 4, 20), (0, 9, 0)]
correct = all(line_total(p, q) == exp for p, q, exp in cases)
globals()["discount"] = 7             # another module changes the global mid-run
pure = all(line_total(p, q) == exp for p, q, exp in cases)  # only a PURE fn survives
print(f"correct: {correct}")
print(f"pure (survives a changed global): {pure}")
print(f"PASS: {correct and pure}")
`

const functionsBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Write a small, single-purpose, PURE function with a clear signature — and a test that proves it — then refactor a side-effecting function to be testable.',
    intensity: 'standard',
    time: '60–90 min',
    proof: 'A pure function (inputs in, value out, no hidden state) + a test asserting it across several inputs.',
    unlock: 'All verification checks confirmed and the impure function refactored.',
    doNotClaim:
      "Don't claim mastery until you've turned a function that reads a global / prints into a pure one that returns a value, with a test.",
  },
  {
    type: 'mission',
    text: 'Your `calculate_total()` works perfectly when you run it by hand, then its tests fail at random for no reason you can see — because it reads a global `cart` and prints instead of returning. Today you make it small, pure, and predictable enough that a test is just one line.',
  },
  {
    type: 'context',
    text: 'Functions are the unit of reuse AND the unit of testing. Small, single-purpose, predictable functions are why some codebases are a joy and others a minefield.',
  },
  {
    type: 'pretest',
    prompt: 'Before you read on: why is a function that reads a global variable harder to test than one that takes everything as a parameter?',
    reveal:
      'A function that depends on hidden global state behaves differently depending on what ran before it — tests become order-dependent and flaky. A function that takes its inputs as parameters and returns a value (a pure function) gives the same output for the same input every time, so a test is just `assert f(x) == expected`.',
  },
  {
    type: 'concept',
    title: 'A function is a contract: name · inputs · output · one job',
    text: 'Its name says what it does, its parameters declare what it needs, its return value is what it promises. PURE functions (output depends only on inputs, no side effects) are trivial to test and reuse. A MODULE groups related functions behind a clear interface.',
  },
  {
    type: 'diagram',
    title: 'Pure vs impure — what a test can actually pin down',
    subtitle: 'A pure function depends only on its arguments. An impure one also reads hidden state, so the same call can return different answers.',
    rankdir: 'LR',
    nodes: [
      { id: 'args', label: 'Arguments', description: 'price, qty', kind: 'client', tone: 'accent' },
      { id: 'pure', label: 'Pure function', description: 'inputs in → value out', kind: 'process', tone: 'success' },
      { id: 'out', label: 'Return value', description: 'same inputs → same output', kind: 'store', tone: 'success' },
      { id: 'global', label: 'Global state', description: 'discount, cart, tax_rate', kind: 'store', tone: 'warning' },
      { id: 'impure', label: 'Impure function', description: 'also reads hidden state', kind: 'process', tone: 'warning' },
      { id: 'flaky', label: 'Flaky result', description: 'depends on what ran first', kind: 'external', tone: 'warning' },
    ],
    edges: [
      { from: 'args', to: 'pure', label: 'all it needs', kind: 'data', tone: 'success' },
      { from: 'pure', to: 'out', label: 'deterministic', kind: 'data', tone: 'success' },
      { from: 'args', to: 'impure', label: 'declared input', kind: 'data' },
      { from: 'global', to: 'impure', label: 'hidden input', kind: 'control', dashed: true, tone: 'warning' },
      { from: 'impure', to: 'flaky', label: 'order-dependent', kind: 'async', tone: 'warning' },
    ],
    legend: [
      { tone: 'success', label: 'pure — testable in one line' },
      { tone: 'warning', label: 'hidden global → flaky test' },
    ],
  },
  {
    type: 'compare',
    title: 'Same job, side-effecting vs pure',
    subtitle: 'In one file the AFTER def replaces the BEFORE. Only one can be tested with a single assert.',
    mono: true,
    left: {
      label: 'Before — reads a global, prints',
      tone: 'warning',
      lines: [
        'cart = [{"price": 10, "qty": 3}]',
        'def calculate_total():',
        '    total = 0',
        '    for item in cart:   # hidden global',
        '        total += item["price"] * item["qty"]',
        '    print("Total:", total)   # side effect',
      ],
      verdict: 'Untestable: depends on a global, returns nothing',
    },
    right: {
      label: 'After — inputs in, value out',
      tone: 'success',
      lines: [
        'def calculate_total(items):',
        '    return sum(',
        '        i["price"] * i["qty"]',
        '        for i in items',
        '    )',
        '# assert calculate_total(cart) == 30',
      ],
      verdict: 'Pure: same inputs → same output, one assert',
    },
    caption: 'Common mistake: doing two things in one function (compute AND print/save). Split it — the function returns a value; a thin caller does the I/O.',
  },
  {
    type: 'code-walkthrough',
    title: 'A module: related functions behind one interface',
    subtitle: 'Group the pure functions in a file; other code imports the contract, not the internals.',
    filename: 'pricing.py + main.py',
    language: 'python',
    code: `# pricing.py - a MODULE: related functions, one clear interface
def line_total(price, qty):
    return price * qty

def cart_total(items):
    return sum(line_total(i["price"], i["qty"]) for i in items)


# main.py - import only what you need from the module
from pricing import cart_total

print(cart_total([{"price": 10, "qty": 3}]))   # -> 30`,
    steps: [
      { lines: [2, 3], label: 'The smallest pure unit', note: '`line_total` does one job: price * qty. Nothing hidden, nothing printed.' },
      { lines: [5, 6], label: 'Compose, do not repeat', note: '`cart_total` reuses `line_total` — small pure pieces wired together, each testable alone.' },
      { lines: [9, 10], label: 'Import the contract', note: 'main.py pulls in only `cart_total`. It depends on the interface, not the internals.' },
      { lines: [12], label: 'The caller does the I/O', note: 'Printing lives here, OUTSIDE the pure functions — so the core stays deterministic and reusable.' },
    ],
    caption: 'A module is just a file that groups related functions; the import line is the contract other code relies on.',
  },
  {
    type: 'lab',
    title: 'Refactor it to be pure',
    summary:
      '`line_total` reads a global `discount`, so it breaks when another part of the app changes it. Refactor it to depend ONLY on its parameters and RETURN the total. The harness changes the global mid-run — only a pure function survives both checks.',
    language: 'python',
    starter: FUNCTIONS_LAB_STARTER,
    check: 'PASS: True',
  },
  {
    type: 'debug',
    symptom: 'This function "works" in the REPL but its test is flaky — it passes or fails depending on what ran first.',
    language: 'python',
    brokenCode: `tax_rate = 0.0   # a global other code mutates

def price_with_tax(amount):
    return amount + amount * tax_rate   # depends on hidden global state`,
    task: 'Why does the test depend on what ran before it?',
    fix: 'It reads the global `tax_rate` — if another test changed it, this one breaks. Pass `tax_rate` as a parameter (`def price_with_tax(amount, tax_rate):`) and return the value. No hidden state → deterministic test.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'line_total(10, 3) RETURNS 30 (a value, not a print)',
      'Same inputs → same output every time (pure / deterministic)',
      'It reads no globals and keeps no hidden state',
      'It does ONE job — compute, not compute-and-print',
      'A test asserts it across several inputs (incl. an edge like qty 0)',
      'Related functions can live in a module (a .py file) and be imported where needed',
    ],
  },
  {
    type: 'quiz',
    question: 'What makes a function easiest to test?',
    options: [
      'It prints its result',
      'It takes its inputs as parameters and returns a value, reading no hidden state',
      'It reads from a global config',
      'It does several things at once',
    ],
    answer: 1,
    explanation:
      'A pure function — inputs in, value out, no hidden state — gives the same result every time, so a test is just `assert f(x) == expected`. Globals and side effects make tests order-dependent and flaky.',
  },
  {
    type: 'teachback',
    prompts: [
      'Explain "single responsibility" for a function in one sentence.',
      'What is the difference between a pure function and a side-effecting one?',
      'Why is a function that reads a global hard to test?',
      'When is a side effect unavoidable — and where should it live?',
      'Why group related functions into a module behind a clear interface?',
    ],
  },
  {
    type: 'transfer',
    text: 'Find a function in your own code that prints or saves while it computes. Split it: a pure function that returns the value + a thin caller that does the I/O. Add a test for the pure part. Your functions are clean now — but a pure function still goes wrong if you feed it the wrong KIND of value, and next lesson is about exactly that: knowing what a value really is.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
  {
    type: 'unlock-gate',
    criteria: [
      'Lab checkpoint passed — line_total is pure and correct across inputs',
      'Broken case understood (a global dependency makes tests flaky)',
      'All verification checks confirmed',
      'Teach-back delivered with a concrete example',
      'Transfer task scheduled on your own code',
    ],
  },
]

// ---------------------------------------------------------------- lesson 4 blocks
// "Types & Data — Know What a Value Really Is". Grounded in the
// 01-programming-fundamentals "Types" cluster (anchor: type-confusion bugs like
// '2' + '3' == '23', silent coercion) + established practice. Standard sprint.
const TYPES_LAB_STARTER = `def total_quantity(values):
    # values is a list of STRINGS, e.g. ["2", "3", "5"]. Convert each to an int
    # and RETURN the integer sum. If a value isn't a whole number, raise ValueError.
    ...  # your code here


# --- test harness (do not edit) ---
print("sum:", total_quantity(["2", "3", "5"]))     # must be 10 (int), not "235"
ok = total_quantity(["2", "3", "5"]) == 10
try:
    total_quantity(["2", "oops"])
    rejected = False
except ValueError:
    rejected = True
print(f"PASS: {ok and rejected}")
`

const typesBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      "Identify a value's type, convert input safely at the boundary, choose the right data structure, and write a function that can't be fooled by a string that looks like a number.",
    intensity: 'standard',
    time: '60–90 min',
    proof: 'A function that converts string input to int, rejects non-numbers, returns the right type — plus a test covering a good and a bad case.',
    unlock: 'All verification checks confirmed and the type-confusion bug fixed.',
    doNotClaim:
      "Don't claim mastery until your function turns ['2','3'] into 5 (not '23') and rejects a non-number with a clear error.",
  },
  {
    type: 'mission',
    text: "Your form adds two quantities and shows '23' instead of 5 — because the inputs arrived as strings ('2' and '3') and `+` quietly concatenated them. The \"2\" + \"3\" ghost from First Steps was not a quirk; it is the bug that haunts every form, file, and API. Today you defend against it: know what your values are, and convert them at the edge.",
  },
  {
    type: 'context',
    text: "Type confusion is a top source of subtle bugs: '5' + '5' = '55', `if count:` silently skipping zero, a list used where a dict belonged. Converting at the boundary underpins forms, APIs, and data pipelines.",
  },
  {
    type: 'pretest',
    prompt: "Before you read on: in Python, what is `'2' + '3'`? And `2 + 3`? Why does the first one surprise people?",
    reveal:
      "`'2' + '3'` is `'23'` (string concatenation); `2 + 3` is `5` (integer addition). `+` does different things depending on the operand TYPE. Input from forms, files, and APIs usually arrives as STRINGS — so you must convert deliberately (`int('2')`) before doing math.",
  },
  {
    type: 'concept',
    title: "A value's type decides what its operations mean",
    text: "Core types: int, float, str, bool, list, dict, set, None. TYPE decides `+`, `==`, truthiness — `'2'+'3'` concatenates, `2+3` adds. Truthiness traps: 0, '', [], {} are all falsy. Pick structures by access: list (order), dict (lookup), set (uniqueness).",
  },
  {
    type: 'diagram',
    title: 'Same `+`, different meaning — the type dispatches the operation',
    subtitle: 'Form/API input arrives as `str`. Until you convert, `+` concatenates instead of adding.',
    rankdir: 'LR',
    nodes: [
      { id: 'input', label: 'Raw input', description: '"2", "3" from a form', kind: 'client', tone: 'warning' },
      { id: 'strpath', label: 'str + str', description: 'no conversion', kind: 'process', tone: 'warning' },
      { id: 'concat', label: '"23"', description: 'concatenated — the bug', kind: 'store', tone: 'warning' },
      { id: 'convert', label: 'int() at the edge', description: 'parse deliberately', kind: 'decision', tone: 'accent' },
      { id: 'intpath', label: 'int + int', description: 'real numeric types', kind: 'process', tone: 'success' },
      { id: 'sum', label: '5', description: 'correct sum', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'input', to: 'strpath', label: 'left as str', kind: 'control', tone: 'warning' },
      { from: 'strpath', to: 'concat', label: '+ concatenates', kind: 'data', tone: 'warning' },
      { from: 'input', to: 'convert', label: 'convert first', kind: 'control', tone: 'accent' },
      { from: 'convert', to: 'intpath', label: 'now numbers', kind: 'data', tone: 'success' },
      { from: 'intpath', to: 'sum', label: '+ adds', kind: 'data', tone: 'success' },
    ],
    legend: [
      { tone: 'warning', label: 'stringly-typed — silent concat' },
      { tone: 'accent', label: 'convert at the boundary' },
      { tone: 'success', label: 'real types → correct math' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Convert at the boundary, then compute on real types',
    subtitle: 'Parse strings to int/float at the edge, handle the failure, then math is safe.',
    filename: 'orders.py',
    language: 'python',
    code: `def order_total(qty_str, price_str):
    try:
        qty = int(qty_str)
        price = float(price_str)
    except ValueError:
        raise ValueError("quantity and price must be numbers")
    if qty < 0 or price < 0:
        raise ValueError("quantity and price must be non-negative")
    return qty * price`,
    steps: [
      { lines: [1], label: 'Know the incoming type', note: 'qty_str and price_str are STRINGS — form/file/API data almost always is.' },
      { lines: [3, 4], label: 'Convert explicitly at the edge', note: '`int(...)` and `float(...)` parse deliberately. Past this point the code works with real numbers.' },
      { lines: [5, 6], label: 'Handle conversion failure', note: '`int("oops")` raises ValueError — catch it and reject with a clear message, exactly like Lesson 1.' },
      { lines: [7, 8], label: 'Validate the real value', note: 'Now that they are numbers, a range check makes sense (negatives rejected).' },
      { lines: [9], label: 'Compute on the real type', note: 'qty * price — never `str + int`, which would raise TypeError, or `str + str`, which would concatenate.' },
    ],
    caption: 'Common mistake: assuming input is already the right type. Convert before you compute, or `+` will concatenate.',
  },
  {
    type: 'lab',
    title: "Don't be fooled by a string",
    summary:
      "Implement total_quantity(values) where values is a list of strings like ['2','3','5']. Convert each to an int and RETURN the sum — '2'+'3' must give 5, not '23'. Reject any value that isn't a whole number.",
    language: 'python',
    starter: TYPES_LAB_STARTER,
    check: 'PASS: True',
  },
  {
    type: 'debug',
    symptom: "This sums quantities but returns '235' instead of 10.",
    language: 'python',
    brokenCode: `def total_quantity(values):
    result = values[0]
    for v in values[1:]:
        result = result + v     # values are strings -> this concatenates
    return result`,
    task: 'Why does it concatenate instead of add?',
    fix: "`values` are strings, and `+` on strings concatenates. Convert each to int first: `return sum(int(v) for v in values)` — and let `int()` reject non-numbers.",
  },
  {
    type: 'compare',
    title: 'String input: convert at the boundary vs pass it around',
    subtitle: '"Parse, don\'t smear." Where you convert decides where the bugs live.',
    left: {
      label: 'Convert at the boundary',
      tone: 'success',
      lines: [
        'Parse to int/float/date the moment it enters',
        'One place handles conversion failure',
        'Everything downstream works with real types',
        'A type error surfaces at the edge, near the cause',
        'Cost: an explicit parse + error path up front',
      ],
      verdict: 'Bugs caught at the source',
    },
    right: {
      label: 'Keep it a string',
      tone: 'warning',
      lines: [
        'Pass the raw string deeper into the code',
        'Every caller must remember to convert',
        'One forgotten int() → silent concatenation',
        'Bugs hide far from where input arrived',
        'Simpler at the edge, fragile everywhere else',
      ],
      verdict: 'Stringly-typed — bugs hide downstream',
    },
    caption: 'Convert at the boundary; once past the edge, code should work with real types, not stringly-typed data.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      "total_quantity(['2','3','5']) returns 10 (an int, not '235')",
      "'2' + '3' produces 5, not '23' — values are converted, not concatenated",
      'A non-numeric value is REJECTED with a ValueError',
      'The function returns the right TYPE (int, not str)',
      'A test covers a normal case AND a bad-input case',
    ],
  },
  {
    type: 'quiz',
    question: "Input from a web form arrives as `age = '25'`. What does `age + 1` do?",
    options: [
      'Returns 26',
      "Returns '251'",
      'Raises TypeError (can’t add str + int)',
      'Returns 25',
    ],
    answer: 2,
    explanation:
      "`age` is the string '25'. `'25' + 1` raises TypeError — you can't add a str and an int. Convert first: `int(age) + 1` → 26. Form/API input is strings; convert deliberately.",
  },
  {
    type: 'teachback',
    prompts: [
      "Why does '2' + '3' give '23' but 2 + 3 give 5?",
      'Where should you convert input types — and why there?',
      'Name a truthiness pitfall (e.g. with 0 or an empty list).',
      'When would you reach for a dict instead of a list?',
    ],
  },
  {
    type: 'transfer',
    text: 'Find a place in your own code where input crosses a boundary (a form field, CLI arg, JSON value). Convert it to its real type at the edge with explicit error handling, and pick the data structure that fits the access pattern. With clean types in hand, the next lesson tackles the SHAPE of your logic — the nested ifs and loops that turn correct data into incorrect results.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
  {
    type: 'unlock-gate',
    criteria: [
      "Lab checkpoint passed — ['2','3'] sums to 5 and a non-number is rejected",
      'Broken case understood (string `+` concatenates)',
      'All verification checks confirmed',
      'Teach-back delivered with a concrete example',
      'Transfer task scheduled on your own code',
    ],
  },
]

// ---------------------------------------------------------------- lesson 5 blocks
// "Control Flow — Guard Clauses & Clean Loops". Grounded in the 01-fundamentals
// "Data and control flow" cluster (anchors: deep nesting hides bugs; the classic
// mutate-while-iterating skip bug) + established practice. Standard sprint.
const CONTROL_LAB_STARTER = `def active_orders(orders):
    # Return only the orders whose status != 'cancelled'.
    # Do NOT remove from \`orders\` while looping over it — build a NEW list.
    ...  # your code here


# --- test harness (do not edit) ---
data = [
    {"id": 1, "status": "active"},
    {"id": 2, "status": "cancelled"},
    {"id": 3, "status": "cancelled"},   # adjacent cancelled -> trips the skip bug
    {"id": 4, "status": "active"},
]
ids = [o["id"] for o in active_orders(data)]
ids2 = [o["id"] for o in active_orders([
    {"id": 9, "status": "cancelled"},
    {"id": 8, "status": "active"},
])]
print("kept ids:", ids)
print(f"PASS: {ids == [1, 4] and ids2 == [8] and len(data) == 4}")
`

const controlFlowBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Flatten nested conditionals with guard clauses, write a correct loop, and avoid the classic loop bugs (off-by-one, infinite loop, mutate-while-iterating).',
    intensity: 'standard',
    time: '60–90 min',
    proof: 'A filter that drops items WITHOUT mutating-while-iterating, plus a test that proves adjacent matches are not skipped.',
    unlock: 'All verification checks confirmed and the skip bug fixed.',
    doNotClaim:
      "Don't claim mastery until your filter keeps the right items with two cancelled orders next to each other — the case that trips the skip bug.",
  },
  {
    type: 'mission',
    text: "A teammate's `process_order()` is five levels of nested if/else — nobody, including the author, can tell which path runs. And the loop that 'removes cancelled orders' silently leaves half of them behind. Your data is clean by now; today you keep the LOGIC clean too — guard clauses for the path, a correct loop for the filter.",
  },
  {
    type: 'context',
    text: 'Control flow is the shape of your logic. Deeply nested conditionals hide bugs; guard clauses make the valid path obvious. And loops have a famous set of traps that bite everyone.',
  },
  {
    type: 'pretest',
    prompt: "Before you read on: what goes wrong if you loop over a list and remove items from it as you go?",
    reveal:
      'Removing an item shifts the later indices, so the loop skips the element right after each removal — you end up processing every other item. Iterate over a COPY, or (better) build a NEW list with the items you want to keep (a comprehension).',
  },
  {
    type: 'concept',
    title: 'Guard clauses flatten logic; loops have classic traps',
    text: 'A guard clause handles an invalid case and returns immediately, so the happy path stays flat (nesting past ~3 levels is a refactor signal). The three loop traps: off-by-one, infinite loop, and mutate-while-iterating. To prune a list, build a new one — never remove in place.',
  },
  {
    type: 'compare',
    title: 'Same logic: deep nesting vs guard clauses',
    subtitle: 'Both return the same answers. Only one lets you see which path runs.',
    mono: true,
    left: {
      label: 'Before — deep nesting',
      tone: 'warning',
      lines: [
        'def charge(order):',
        '    if order is not None:',
        '        if order["total"] > 0:',
        '            if order["status"] == "open":',
        '                return pay(order)',
        '            else: return "not open"',
        '        else: return "empty"',
        '    else: return "missing"',
      ],
      verdict: 'Which path runs? Buried in indentation',
    },
    right: {
      label: 'After — guard clauses',
      tone: 'success',
      lines: [
        'def charge(order):',
        '    if order is None:',
        '        return "missing"',
        '    if order["total"] <= 0:',
        '        return "empty"',
        '    if order["status"] != "open":',
        '        return "not open"',
        '    return pay(order)   # happy path, flat',
      ],
      verdict: 'Reject bad cases first; the win is unindented',
    },
    caption: 'Common mistake: each `if` adding another level. Invert it — `if not valid: return` early, keep the happy path flat.',
  },
  {
    type: 'diagram',
    title: 'Why remove-while-iterating skips items',
    subtitle: 'The loop cursor advances by index. A removal shifts every later item left, so the next one slides under the cursor unseen.',
    rankdir: 'LR',
    nodes: [
      { id: 'i0', label: 'i=0 active', description: 'kept', kind: 'process', tone: 'success' },
      { id: 'i1', label: 'i=1 cancelled', description: 'removed → list shifts left', kind: 'decision', tone: 'warning' },
      { id: 'shift', label: 'index 2 → 1', description: 'next cancelled slides under cursor', kind: 'queue', tone: 'warning' },
      { id: 'skip', label: 'cursor → i=2', description: 'the shifted item is SKIPPED', kind: 'external', tone: 'warning' },
      { id: 'fix', label: 'Build a new list', description: '[o for o in orders if keep(o)]', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'i0', to: 'i1', label: 'advance', kind: 'control' },
      { from: 'i1', to: 'shift', label: 'remove()', kind: 'async', tone: 'warning' },
      { from: 'shift', to: 'skip', label: 'cursor moves on', kind: 'control', tone: 'warning' },
      { from: 'i1', to: 'fix', label: 'instead:', kind: 'data', dashed: true, tone: 'success' },
    ],
    legend: [
      { tone: 'warning', label: 'mutation shifts indices → skip' },
      { tone: 'success', label: 'filter into a new list — no mutation' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'The guard-clause version, line by line',
    subtitle: 'Each guard is one reason to stop; the happy path lands flat at the end.',
    filename: 'orders.py',
    language: 'python',
    code: `def charge(order):
    if order is None:
        return "missing"
    if order["total"] <= 0:
        return "empty"
    if order["status"] != "open":
        return "not open"
    return pay(order)`,
    steps: [
      { lines: [2, 3], label: 'Reject the bad case early', note: 'Handle missing first with its own return — no nesting, one reason to stop.' },
      { lines: [4, 5], label: 'Next invalid case', note: 'Empty order: another flat guard. Read top to bottom like a checklist.' },
      { lines: [6, 7], label: 'Last guard', note: 'Wrong status bails out here. Every failure mode is named and unindented.' },
      { lines: [8], label: 'Happy path, flat', note: 'Once the guards pass, the real work runs at the base indent — obvious and impossible to miss.' },
    ],
    caption: 'Same behavior as the five-level nest — but you can see the path, and you can see which case you forgot.',
  },
  {
    type: 'lab',
    title: 'Filter without skipping',
    summary:
      "Implement active_orders(orders): return only the orders whose status != 'cancelled'. Do NOT mutate the input while iterating. The harness puts two cancelled orders next to each other (the case that trips the skip bug) and checks none slip through — across two datasets.",
    language: 'python',
    starter: CONTROL_LAB_STARTER,
    check: 'PASS: True',
  },
  {
    type: 'debug',
    symptom: 'This loop should remove cancelled orders but leaves half of them behind.',
    language: 'python',
    brokenCode: `def active_orders(orders):
    for o in orders:
        if o["status"] == "cancelled":
            orders.remove(o)     # mutating the list we're iterating
    return orders`,
    task: 'Why does it skip some cancelled orders?',
    fix: "`remove` shifts every later index down by one, so the loop skips the item right after each removal (and it mutates the caller's list). Build a new list instead: `[o for o in orders if o['status'] != 'cancelled']`.",
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'active_orders keeps only the non-cancelled orders',
      'Two ADJACENT cancelled orders are both dropped — none skipped',
      'The input list is NOT mutated (no remove-while-iterating)',
      'The happy path is flat (guard clauses, not deep nesting)',
      'A test covers adjacent-cancelled and an all-cancelled case',
    ],
  },
  {
    type: 'quiz',
    question: "What's the safest way to drop items from a list while looping?",
    options: [
      'Call list.remove() inside a for loop over the list',
      'Build a new list with a comprehension (filter)',
      'Delete by index in a while loop',
      'Set the items to None',
    ],
    answer: 1,
    explanation:
      'Mutating a list while iterating it skips elements because the indices shift. Build a new list: `[x for x in items if keep(x)]` — correct, readable, and it leaves the original untouched.',
  },
  {
    type: 'teachback',
    prompts: [
      'What does a guard clause do, and why does it flatten logic?',
      'Why does removing items while looping skip elements?',
      'Name the three classic loop bugs.',
      'When is a while loop the right choice over a for loop?',
    ],
  },
  {
    type: 'transfer',
    text: 'Find a loop in your own code that removes or edits a collection while iterating it, or a function nested more than three levels deep. Refactor: filter into a new list, or add guard clauses. Add a test for the edge that used to break. So far every value has lived in memory, where nothing can go wrong reaching it — next lesson steps outside the program, into files, where the resource itself can leak or vanish.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
  {
    type: 'unlock-gate',
    criteria: [
      'Lab checkpoint passed — adjacent cancelled orders are both dropped, input not mutated',
      'Broken case understood (mutating while iterating skips items)',
      'All verification checks confirmed',
      'Teach-back delivered with a concrete example',
      'Transfer task scheduled on your own code',
    ],
  },
]

// ---------------------------------------------------------------- lesson 6 blocks
// "Files & I/O — Read Safely, Close Always". Grounded in the 01-fundamentals
// "Files and I/O" cluster (anchors: leaked file handle; missing-file crash;
// reading a huge file into memory) + established practice. Standard sprint.
const FILES_LAB_STARTER = `def read_config(path):
    # Open the file with a \`with\` block (it always closes), read "key=value"
    # lines into a dict, skipping blank lines. If the file is MISSING, let it
    # raise FileNotFoundError — do NOT silently return {}.
    ...  # your code here


# --- test harness (do not edit) ---
with open("app.conf", "w") as f:
    f.write("host=localhost\\n\\nport=8080\\n")
cfg = read_config("app.conf")
ok = cfg == {"host": "localhost", "port": "8080"}
try:
    read_config("missing.conf")
    missing_handled = False
except FileNotFoundError:
    missing_handled = True
print("config:", cfg)
print(f"PASS: {ok and missing_handled}")
`

const filesBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Read a file with a context manager so it always closes, parse it into a dict, stream large files instead of loading them, and handle the missing-file case explicitly.',
    intensity: 'standard',
    time: '60–90 min',
    proof: 'A reader that uses `with`, parses key=value lines, and lets a missing file raise — plus a test for a valid and a missing file.',
    unlock: 'All verification checks confirmed and the leak / swallowed-missing-file bugs fixed.',
    doNotClaim:
      "Don't claim mastery until your reader closes the file on every path and a missing file raises (not a silent empty dict).",
  },
  {
    type: 'mission',
    text: 'A nightly job crashed because a config file was missing — and even when it worked, it leaked open file handles until the process ran out of them. The moment you reach for a file, the outside world can fail in ways pure code never does. Read files the safe way: always close, and handle missing explicitly.',
  },
  {
    type: 'context',
    text: 'Files (and stdin/stdout, network streams) are I/O — slow, fallible, and full of resources you must release. The `with` statement and explicit error handling are the difference between a robust job and a 3am page.',
  },
  {
    type: 'pretest',
    prompt: "Before you read on: why is `f = open('x'); data = f.read()` riskier than `with open('x') as f:`?",
    reveal:
      'If anything between `open` and `f.close()` raises, the file is never closed — you leak a file handle (and on some systems keep the file locked). `with open(...) as f:` guarantees the file closes even when an error occurs. Always use `with` for files.',
  },
  {
    type: 'concept',
    title: '`with` guarantees cleanup; I/O is slow and fallible',
    text: 'A context manager (`with`) closes its resource when the block exits — even on an exception. Iterate a file object to STREAM line by line; never `.read()` a multi-gigabyte file into memory. Surface I/O failures (missing, permission, encoding); never swallow them.',
  },
  {
    type: 'diagram',
    title: 'The `with` block guarantees the close — on every exit',
    subtitle: 'Whether the body succeeds, raises, or hits a missing file, the context manager releases the handle. A bare `open()` only closes on the happy path.',
    rankdir: 'LR',
    nodes: [
      { id: 'open', label: 'with open(path)', description: 'acquire the handle', kind: 'process', tone: 'accent' },
      { id: 'missing', label: 'Missing file?', description: 'FileNotFoundError surfaces', kind: 'decision', tone: 'warning' },
      { id: 'stream', label: 'for line in f', description: 'stream, not .read()', kind: 'process', tone: 'success' },
      { id: 'raise', label: 'Parse error?', description: 'exception mid-read', kind: 'decision', tone: 'warning' },
      { id: 'close', label: 'Handle closed', description: 'guaranteed on every path', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'open', to: 'missing', label: 'try to open', kind: 'sync' },
      { from: 'missing', to: 'close', label: 'raises → still closes', kind: 'control', tone: 'warning' },
      { from: 'missing', to: 'stream', label: 'opened', kind: 'data', tone: 'success' },
      { from: 'stream', to: 'raise', label: 'per line', kind: 'sync' },
      { from: 'raise', to: 'close', label: 'error → still closes', kind: 'control', tone: 'warning' },
      { from: 'raise', to: 'close', label: 'done → closes', kind: 'data', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'acquire' },
      { tone: 'success', label: 'stream + guaranteed close' },
      { tone: 'warning', label: 'errors surface, handle still released' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Read a config safely, line by line',
    subtitle: 'A context manager that always closes, streams the file, and lets a missing file surface.',
    filename: 'config.py',
    language: 'python',
    code: `def read_config(path):
    config = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            key, value = line.split("=", 1)
            config[key] = value
    return config`,
    steps: [
      { lines: [3], label: 'Open with `with`', note: 'Closes the file on every path — success or error. A missing file raises FileNotFoundError here, never a silent {}.' },
      { lines: [4], label: 'Stream, do not slurp', note: 'Iterating the file object reads ONE line at a time. A `.read()` would load a multi-gigabyte file into memory.' },
      { lines: [5, 6, 7], label: 'Skip blanks defensively', note: 'Strip whitespace; ignore empty lines so a stray blank does not crash the parse.' },
      { lines: [8, 9], label: 'Parse with a bound', note: '`split("=", 1)` splits on the FIRST `=` only — a value containing `=` survives intact.' },
      { lines: [10], label: 'Return a real value', note: 'The handle is already closed by the time we return — the `with` block exited.' },
    ],
    caption: 'Common mistake: a bare `open()` without `with` — one exception before `close()` and the handle leaks. The same `with` pattern manages DB cursors and locks.',
  },
  {
    type: 'lab',
    title: 'Read it safely',
    summary:
      'Implement read_config(path): open with a `with` block, parse "key=value" lines into a dict (skip blanks), and let a MISSING file raise FileNotFoundError — never a silent {}. The harness writes a file, reads it back, and checks the missing-file case.',
    language: 'python',
    starter: FILES_LAB_STARTER,
    check: 'PASS: True',
  },
  {
    type: 'debug',
    symptom: 'This config reader leaks file handles and silently returns {} when the file is missing.',
    language: 'python',
    brokenCode: `def read_config(path):
    try:
        f = open(path)                 # no \`with\` -> never closed on error
        cfg = {}
        for line in f.readlines():     # loads the whole file into memory
            key, value = line.split("=", 1)
            cfg[key] = value
        return cfg
    except Exception:
        return {}                      # swallows missing-file / parse errors`,
    task: 'Find the two bugs.',
    fix: '(1) No `with`/close → the handle leaks if an error occurs mid-read. (2) `except Exception: return {}` swallows the missing-file (and parse) errors, so the job runs with empty config and fails mysteriously later. Use `with open(path)` and let FileNotFoundError surface.',
  },
  {
    type: 'compare',
    title: 'Reading a large file: load it all vs stream it',
    subtitle: 'Both produce the same lines; only one survives a gigabyte file.',
    mono: true,
    left: {
      label: 'Read all',
      tone: 'warning',
      lines: [
        'data = f.read()',
        '# or f.readlines()',
        'Whole file into memory at once',
        'Random access — but a big file OOMs',
        'Fine only when the file is small',
      ],
      verdict: 'Simple, but blows up on large files',
    },
    right: {
      label: 'Stream',
      tone: 'success',
      lines: [
        'for line in f:',
        '    process(line)',
        'One line in memory at a time',
        'Constant memory, handles huge files',
        'Sequential, single pass',
      ],
      verdict: 'Constant memory — the safe default',
    },
    caption: 'Stream by default (`for line in f:`). Only load the whole file when it is small and you genuinely need random access.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'read_config uses `with`, so the file always closes',
      'It parses key=value lines into a dict, skipping blanks',
      "A MISSING file raises FileNotFoundError — it does NOT silently return {}",
      'A large file would stream line-by-line, not load into memory',
      'A test covers a valid file AND a missing file',
    ],
  },
  {
    type: 'quiz',
    question: 'Why use `with open(path) as f:` instead of `f = open(path)`?',
    options: [
      "It's faster",
      'It guarantees the file closes even if an error occurs',
      'It reads the whole file at once',
      'It validates the file path',
    ],
    answer: 1,
    explanation:
      '`with` is a context manager: it closes the file automatically when the block exits — even on an exception. A manual `open()` leaks the handle if anything raises before `close()`.',
  },
  {
    type: 'teachback',
    prompts: [
      'What does the `with` statement guarantee for a file?',
      'Why stream a large file instead of reading it all at once?',
      'Why is `except: return {}` on a missing config dangerous?',
      'Name another resource (besides a file) that `with` can manage.',
    ],
  },
  {
    type: 'transfer',
    text: 'Find file handling in your own code that uses a bare `open()` or swallows a missing-file error. Switch to `with`, stream if the file can be large, and let (or log-and-raise) the missing/unreadable case surface. Add a test for the missing file. You have now written five lessons of careful code — validation, error paths, pure functions, clean loops, safe I/O. Next lesson asks the only question that proves any of it: how do you KNOW it works before production finds out for you?',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
  {
    type: 'unlock-gate',
    criteria: [
      'Lab checkpoint passed — valid file parses, missing file raises',
      'Broken case understood (no `with` leaks; swallowed missing-file hides failures)',
      'All verification checks confirmed',
      'Teach-back delivered with a concrete example',
      'Transfer task scheduled on your own code',
    ],
  },
]

// ---------------------------------------------------------------- lesson 7 blocks
// "Testing & Debugging — Catch the Bug Before Prod". Grounded in
// concepts/deep-nodes/testing-strategy.md (risk-based testing, cheapest test that
// catches the failure, behavior over implementation, bug -> regression test).
const TESTING_LAB_STARTER = `def safe_average(numbers):
    # Return the average of the numbers. EDGE CASE: an EMPTY list must return 0,
    # not crash with ZeroDivisionError (sum([]) / len([]) is 0 / 0).
    ...  # your code here


# --- test harness: a tiny suite (happy path + the edge that bites) ---
assert safe_average([2, 4, 6]) == 4, "normal case"
assert safe_average([10]) == 10, "single element"
assert safe_average([]) == 0, "EMPTY list must return 0, not crash"   # regression
print("all assertions passed")
print("PASS: True")
`

const testingBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Write the cheapest test that catches a real bug — including the edge/negative case the happy path misses — and turn a bug into a regression test.',
    intensity: 'standard',
    time: '60–90 min',
    proof: 'A function that survives its edge case + a test suite that includes the regression case, all green.',
    unlock: 'All verification checks confirmed and the empty-input crash fixed with a regression test.',
    doNotClaim:
      "Don't claim mastery until your test suite includes the edge case that crashed in prod — not just the happy path.",
  },
  {
    type: 'mission',
    text: 'Your `average()` passed every test and shipped — then crashed in production on an empty list, because the tests only ever checked the happy path. A bad test is worse than none: it sells false confidence. Add the test that would have caught it, fix the bug, and stop confusing "tests are green" with "the code is right".',
  },
  {
    type: 'context',
    text: 'Tests are how you change code without fear. The skill is choosing the cheapest test that catches the real risk — usually an edge or negative case — and turning every production bug into a regression test.',
  },
  {
    type: 'pretest',
    prompt: 'Before you read on: `average()` works on [2, 4, 6] and passes its test. What input might still crash it in production?',
    reveal:
      'The empty list: `sum([]) / len([])` is `0 / 0` → ZeroDivisionError. The happy-path test never tried it. Edge cases (empty, zero, negative, huge, missing) are where bugs hide — test those, not just the obvious case.',
  },
  {
    type: 'concept',
    title: 'Cheapest test that catches the failure; behavior over implementation',
    text: 'Spend test effort where a failure would hurt. The pyramid — many fast unit, fewer integration, a few E2E — keeps feedback fast. Assert BEHAVIOR (inputs → outputs), not internals, so a refactor does not break them. Every prod bug becomes a regression test.',
  },
  {
    type: 'diagram',
    title: 'The debug loop — every bug ends as a regression test',
    subtitle: 'A production failure is not "fixed" until a test exists that fails before the fix and passes after. That test is the deliverable.',
    rankdir: 'LR',
    nodes: [
      { id: 'bug', label: 'Prod failure', description: 'average([]) crashed', kind: 'client', tone: 'warning' },
      { id: 'repro', label: 'Reproduce', description: 'a failing test for []', kind: 'process', tone: 'accent' },
      { id: 'isolate', label: 'Isolate', description: '0 / 0 → ZeroDivisionError', kind: 'process', tone: 'accent' },
      { id: 'fix', label: 'Fix', description: 'guard the empty case', kind: 'process', tone: 'success' },
      { id: 'regress', label: 'Regression test', description: 'green forever after', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'bug', to: 'repro', label: 'first: make it fail', kind: 'sync', tone: 'accent' },
      { from: 'repro', to: 'isolate', label: 'narrow the cause', kind: 'control', tone: 'accent' },
      { from: 'isolate', to: 'fix', label: 'minimal change', kind: 'control', tone: 'success' },
      { from: 'fix', to: 'regress', label: 'test now passes', kind: 'data', tone: 'success' },
      { from: 'regress', to: 'bug', label: 'stops the return', kind: 'control', dashed: true, tone: 'muted' },
    ],
    legend: [
      { tone: 'accent', label: 'reproduce as a FAILING test first' },
      { tone: 'success', label: 'fix → regression test locks it' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Test the risk — Arrange / Act / Assert with the edge that bites',
    subtitle: 'Guard the empty case, then a tiny suite that includes the regression case.',
    filename: 'stats.py',
    language: 'python',
    code: `def safe_average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

def test_safe_average():
    assert safe_average([2, 4, 6]) == 4
    assert safe_average([10]) == 10
    assert safe_average([]) == 0
    assert safe_average([-2, 2]) == 0`,
    steps: [
      { lines: [2, 3], label: 'The edge the happy path forgot', note: 'An empty list short-circuits to 0 — `sum([]) / len([])` would be 0/0, a ZeroDivisionError.' },
      { lines: [4], label: 'The normal computation', note: 'Only reached once the edge is handled. Order matters: guard first, compute second.' },
      { lines: [7, 8], label: 'Assert behavior, not internals', note: 'Normal and single-element cases. We check input → output, so a refactor of the body cannot break the test.' },
      { lines: [9], label: 'The regression case', note: 'The empty list — the exact input that crashed prod. This line is why the bug can never silently return.' },
      { lines: [10], label: 'Negatives too', note: 'Edge inputs (empty, zero, negative, huge, missing) are where bugs hide — test those, not just the obvious case.' },
    ],
    caption: 'Common mistake: testing only the happy path. The bug lives in the case you did not try.',
  },
  {
    type: 'lab',
    title: 'Catch the edge case',
    summary:
      'Implement safe_average(numbers): return the mean, but an EMPTY list must return 0 — not crash with ZeroDivisionError. The harness is a tiny test suite that includes the empty-list regression case; make every assertion pass.',
    language: 'python',
    starter: TESTING_LAB_STARTER,
    check: 'PASS: True',
  },
  {
    type: 'debug',
    symptom: 'average() works in tests but crashed in production.',
    language: 'python',
    brokenCode: `def average(nums):
    return sum(nums) / len(nums)   # passes on [2,4,6]...

# the only test:
assert average([2, 4, 6]) == 4`,
    task: 'What input crashes it, and what test was missing?',
    fix: 'An empty list → `sum([]) / len([])` → `0 / 0` → ZeroDivisionError. The happy-path test never tried `[]`. Guard it (`if not nums: return 0`) and add `assert average([]) == 0` as a regression test.',
  },
  {
    type: 'compare',
    title: 'You found a bug: just fix it vs fix it AND add a test',
    subtitle: 'Same patch ships. Only one stops the bug from coming back.',
    left: {
      label: 'Fix + regression test',
      tone: 'success',
      lines: [
        'Write the failing test FIRST (reproduces the bug)',
        'Then fix until it is green',
        'Test fails before the fix, passes after',
        'The next refactor can never silently break it',
        'Cost: one extra test',
      ],
      verdict: 'The bug can never silently return',
    },
    right: {
      label: 'Just fix it',
      tone: 'warning',
      lines: [
        'Patch the bug and move on',
        'No test documents what was wrong',
        'Faster right now',
        'Same bug reappears in the next refactor',
        'Nobody knows it was ever fixed',
      ],
      verdict: 'Fast today, the bug returns tomorrow',
    },
    caption: 'Always turn a bug into a regression test — the failing-test-first loop produces the test most likely to catch a real failure.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'safe_average([2,4,6]) returns 4',
      'safe_average([]) returns 0 — it does NOT crash',
      'The test suite includes the empty-list edge (the regression case)',
      'The tests assert behavior (input → output), not internals',
      'Each assertion has a clear message',
    ],
  },
  {
    type: 'quiz',
    question: 'A function passes its tests but crashed in prod on an empty input. Best next step?',
    options: [
      'Delete the failing-in-prod path',
      'Add a regression test for the empty input, then fix the bug',
      'Wrap everything in try/except',
      'Only test in production',
    ],
    answer: 1,
    explanation:
      'Turn the bug into a regression test: write a test for the empty input that fails now, then fix until it’s green. It documents the bug and stops it returning. Happy-path-only tests give false confidence.',
  },
  {
    type: 'teachback',
    prompts: [
      "What is 'the cheapest test that catches the failure'?",
      'Why test behavior instead of implementation details?',
      "What's the loop for turning a bug into a regression test?",
      'Name two edge cases worth testing for a function that takes a list.',
    ],
  },
  {
    type: 'transfer',
    text: 'Take a function in your own code and write the cheapest test that catches its riskiest failure — an edge or negative case, not the happy path. If you hit a bug recently, add a regression test that fails before your fix and passes after. Tests protect your code from your future self; next lesson protects production from your present self — the command-line tools that can delete real data with a single forgotten flag.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
  {
    type: 'unlock-gate',
    criteria: [
      'Lab checkpoint passed — empty list returns 0, all assertions green',
      'Broken case understood (happy-path-only tests miss the edge)',
      'All verification checks confirmed',
      'Teach-back delivered with a concrete example',
      'Transfer task scheduled on your own code',
    ],
  },
]

// ---------------------------------------------------------------- lesson 8 blocks
// "CLI Safety — Safe Defaults & Dry Runs". Grounded in
// concepts/deep-nodes/cli-safety.md (safe defaults vs sharp tools, dry-run vs
// destructive, blast radius, human confirmation; anchors: tool deletes too much,
// wrong production environment).
const CLI_LAB_STARTER = `def decide(args):
    # args is a dict, e.g. {"execute": False, "env": "staging", "confirmed": False}
    # SAFETY RULES:
    #   - Default to "dry-run" unless execute is explicitly True.
    #   - Production requires confirmed=True (no accidental prod) -> else block it.
    #   - Otherwise -> "execute".
    # Return one of: "dry-run", "execute", "blocked: confirm production"
    ...  # your code here


# --- test harness (do not edit) ---
cases = [
    ({"execute": False, "env": "staging"}, "dry-run"),
    ({"execute": True, "env": "staging"}, "execute"),
    ({"execute": True, "env": "production"}, "blocked: confirm production"),
    ({"execute": True, "env": "production", "confirmed": True}, "execute"),
]
ok = all(decide(a) == exp for a, exp in cases)
for a, exp in cases:
    print(f"{a} -> {decide(a)!r}")
print(f"PASS: {ok}")
`

const cliBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Build a command that defaults to dry-run, never defaults to production, and requires explicit confirmation for high-blast-radius actions.',
    intensity: 'standard',
    time: '60–90 min',
    proof: 'A safety gate that previews by default and blocks an unconfirmed production action, plus tests for each path.',
    unlock: 'All verification checks confirmed and the dangerous defaults removed.',
    doNotClaim:
      "Don't claim mastery until a forgotten flag results in a dry-run, not a production deletion.",
  },
  {
    type: 'mission',
    text: "An internal cleanup script ran with its defaults and deleted production data — because 'no environment specified' quietly meant prod, and nothing asked the human to confirm. There is no try/except for a deleted table. Make the tool safe by default, so a forgotten flag previews instead of destroys.",
  },
  {
    type: 'context',
    text: 'Internal CLI tools are sharp: a wrong flag or a defaulted environment can delete real data with no undo. Safe defaults, dry-run previews, and confirmation for high-impact actions separate a useful tool from an outage.',
  },
  {
    type: 'pretest',
    prompt: 'Before you read on: why is it dangerous for a destructive command to DEFAULT to executing — or to default the environment to production?',
    reveal:
      'Defaults are what run when someone forgets a flag. If "execute" or "production" is the default, a tired engineer who omits a flag destroys real data. Safe tools default to dry-run and require explicit opt-in for destructive, production actions.',
  },
  {
    type: 'concept',
    title: 'Safe defaults · dry-run · blast radius · confirmation',
    text: 'Safe tools default to the harmless option: a DRY-RUN that previews the exact target set first. Limit BLAST RADIUS (explicit scope, no bare wildcards). Require CONFIRMATION for high-impact actions; never default env to production. Keep an AUDIT TRAIL. The default is what runs when a flag is forgotten.',
  },
  {
    type: 'diagram',
    title: 'The safety gate — a forgotten flag lands on dry-run',
    subtitle: 'Action requires explicit opt-in; production requires explicit confirmation. Every "no" routes to the safe outcome.',
    nodes: [
      { id: 'cmd', label: 'Command run', description: 'maybe a flag forgotten', kind: 'client' },
      { id: 'exec', label: 'execute = True?', description: 'explicit opt-in', kind: 'decision', tone: 'accent' },
      { id: 'dry', label: 'dry-run', description: 'preview, touch nothing', kind: 'process', tone: 'success' },
      { id: 'prod', label: 'env = production?', description: 'and confirmed?', kind: 'decision', tone: 'accent' },
      { id: 'blocked', label: 'blocked', description: 'confirm production', kind: 'process', tone: 'warning' },
      { id: 'run', label: 'execute', description: 'audited + scoped', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'cmd', to: 'exec', label: 'evaluate', kind: 'sync' },
      { from: 'exec', to: 'dry', label: 'no / missing', kind: 'control', tone: 'success' },
      { from: 'exec', to: 'prod', label: 'yes', kind: 'control', tone: 'accent' },
      { from: 'prod', to: 'blocked', label: 'prod, unconfirmed', kind: 'control', tone: 'warning' },
      { from: 'prod', to: 'run', label: 'confirmed / non-prod', kind: 'data', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'explicit opt-in required' },
      { tone: 'success', label: 'safe outcome (dry-run / audited execute)' },
      { tone: 'warning', label: 'prod blocked until confirmed' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Safe by default — the decision gate',
    subtitle: 'Dry-run unless explicitly told to execute; production needs confirmation.',
    filename: 'deploy.py',
    language: 'python',
    code: `def decide(args):
    if not args.get("execute"):
        return "dry-run"
    if args.get("env") == "production" and not args.get("confirmed"):
        return "blocked: confirm production"
    return "execute"`,
    steps: [
      { lines: [2, 3], label: 'Default to dry-run', note: 'The FIRST check: no explicit execute → preview only. A forgotten flag can never destroy data.' },
      { lines: [4, 5], label: 'Guard production', note: 'Even with execute=True, production without confirmed=True is blocked. No accidental prod, ever.' },
      { lines: [6], label: 'Execute only when earned', note: 'Reached only when the caller explicitly opted in AND (non-prod or confirmed). The safe path is the default; the dangerous path is opt-in.' },
    ],
    caption: 'Common mistake: defaulting `execute=True` or `env="production"`. The default is what runs when a flag is forgotten — make it the SAFE option.',
  },
  {
    type: 'lab',
    title: 'Make it safe by default',
    summary:
      'Implement decide(args): default to "dry-run" unless execute is True; block a production action that isn\'t confirmed ("blocked: confirm production"); otherwise "execute". The harness checks all four paths — a forgotten execute must NOT run.',
    language: 'python',
    starter: CLI_LAB_STARTER,
    check: 'PASS: True',
  },
  {
    type: 'debug',
    symptom: 'This deploy tool deleted production records when it was run with no arguments.',
    language: 'python',
    brokenCode: `def run(env="production", execute=True):   # dangerous defaults
    if execute:
        delete_records(env)`,
    task: 'Find the two dangerous defaults.',
    fix: "Both defaults are unsafe: `env='production'` means a forgotten flag targets prod, and `execute=True` means it acts with no opt-in. Default `env=None` (require an explicit choice) and `execute=False` (dry-run), and require confirmation before touching production.",
  },
  {
    type: 'compare',
    title: 'A destructive command: dry-run first vs execute immediately',
    subtitle: 'One typo decides whether you preview or delete.',
    left: {
      label: 'Dry-run first',
      tone: 'success',
      lines: [
        'Show exactly what WOULD change',
        'Require an explicit second step to execute',
        'Confirmation gate for production',
        'Accidental data loss becomes very hard',
        'Cost: one extra deliberate step',
      ],
      verdict: 'Cheap step; a deleted table is not',
    },
    right: {
      label: 'Execute immediately',
      tone: 'warning',
      lines: [
        'One command does it all',
        'Fast for the happy path',
        'No preview of the target set',
        'A typo or forgotten flag → no undo',
        'The cleanup-script outage from the mission',
      ],
      verdict: 'One mistake away from an outage',
    },
    caption: 'Default to dry-run for anything destructive: preview the exact target set, then require an explicit execute (and confirmation for prod).',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'The command defaults to dry-run — no destructive action without opt-in',
      'It never defaults the environment to production',
      'A production action requires explicit confirmation',
      'A dry-run shows the exact target set before executing',
      'The action is auditable (operator / action / target / time)',
    ],
  },
  {
    type: 'quiz',
    question: 'What should a destructive CLI command do by DEFAULT (when a flag is forgotten)?',
    options: [
      'Execute against production',
      'Dry-run / preview, taking no destructive action',
      'Delete everything matching a wildcard',
      'Pick the last-used environment',
    ],
    answer: 1,
    explanation:
      'The default is what runs when someone forgets a flag — make it the SAFE option: a dry-run that takes no destructive action and never defaults to production. Require explicit opt-in (and confirmation) to actually execute.',
  },
  {
    type: 'teachback',
    prompts: [
      "What does 'safe defaults' mean for a destructive tool?",
      'Why dry-run before executing?',
      "What is 'blast radius' and how do you limit it?",
      'Why should the environment never default to production?',
    ],
  },
  {
    type: 'transfer',
    text: 'Find a script or command in your own tooling that can destroy or overwrite data. Add a dry-run default, explicit environment selection, a preview of the target set, and confirmation for production — and log who ran what, where, and when. Safe tools protect your data from a bad command; the last lesson protects your work itself — a history you can read, revert, and recover, so almost nothing is ever truly lost.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
  {
    type: 'unlock-gate',
    criteria: [
      'Lab checkpoint passed — a forgotten execute dry-runs; unconfirmed prod is blocked',
      'Broken case understood (defaulting to prod / execute is dangerous)',
      'All verification checks confirmed',
      'Teach-back delivered with a concrete example',
      'Transfer task scheduled on your own tooling',
    ],
  },
]

// ---------------------------------------------------------------- lesson 9 blocks
// "Git Fundamentals — Atomic Commits You Can Trust". Grounded in the
// 01-programming-fundamentals "Git fundamentals" cluster + established practice
// (atomic commits, clear messages, branches, safe recovery, no force-push shared).
const GIT_LAB_STARTER = `LAZY = {"", "wip", "fix", "stuff", "update", ".", "asdf"}

def check_commit(staged_files, message):
    # A good commit is ATOMIC (has staged changes) with a clear message.
    #   - no staged files            -> "nothing to commit"
    #   - empty/lazy or < 10 chars   -> "weak message"
    #   - otherwise                  -> "ok"
    ...  # your code here


# --- test harness (do not edit) ---
cases = [
    ([], "add user validation", "nothing to commit"),
    (["a.py"], "wip", "weak message"),
    (["a.py"], "fix", "weak message"),
    (["a.py"], "add input validation to signup", "ok"),
]
ok = all(check_commit(f, m) == exp for f, m, exp in cases)
for f, m, exp in cases:
    print(f"{m!r} -> {check_commit(f, m)!r}")
print(f"PASS: {ok}")
`

const gitBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Make small atomic commits with clear messages, use branches to isolate work, and recover safely when something goes wrong — never panic-force-push a shared branch.',
    intensity: 'standard',
    time: '60–90 min',
    proof: 'A commit checker that rejects empty/lazy commits, plus a branch + revert you can demonstrate.',
    unlock: 'All verification checks confirmed and the giant-"wip"-commit habit replaced with atomic commits.',
    doNotClaim:
      "Don't claim mastery until you can revert one change without undoing the others — which only atomic commits allow.",
  },
  {
    type: 'mission',
    text: "Your teammate's branch is one giant commit titled 'stuff', and when a bug appeared, nobody could tell which change caused it or revert just that part. This is the safety net under every other skill: make your history small commits you can read, revert, and recover — so a mistake becomes a thirty-second undo instead of a panic.",
  },
  {
    type: 'context',
    text: 'Git history is a tool, not a chore. Small atomic commits with clear messages let you bisect a bug, revert one change, and review work sanely. Branches isolate risk; almost nothing in git is truly lost.',
  },
  {
    type: 'pretest',
    prompt: "Before you read on: why is one giant commit titled 'wip' worse than five small commits with clear messages?",
    reveal:
      "A giant 'wip' commit can't be reviewed, can't be reverted in part, and tells you nothing about what changed or why. Small atomic commits (one logical change each, with a clear message) let you review, revert just the bad one, and bisect to find which change introduced a bug.",
  },
  {
    type: 'concept',
    title: 'Atomic commits · clear messages · branches · you can recover',
    text: 'An ATOMIC commit is one logical change you could revert on its own. A good MESSAGE says what changed and why. Use a BRANCH per task. Recover with `git revert` (safe undo) and `git reflog` (find "lost" commits). The one rule: NEVER force-push a shared branch.',
  },
  {
    type: 'compare',
    title: 'Atomic commits vs the "wip" blob',
    subtitle: 'Same code lands. Only one history you can review, revert, and bisect.',
    mono: true,
    left: {
      label: 'Atomic — one logical change',
      tone: 'success',
      lines: [
        'git add signup.py',
        'git commit -m "validate signup:',
        '  reject empty email + bad age"',
        '# stage deliberately, describe what + why',
        '# revert THIS change alone, bisect to it',
      ],
      verdict: 'Reviewable, revertable, bisectable',
    },
    right: {
      label: 'Blob — everything at once',
      tone: 'warning',
      lines: [
        'git add .',
        'git commit -m "wip"',
        '# 12 unrelated changes in one commit',
        '# revert undoes ALL twelve',
        '# bisect can not narrow it down',
      ],
      verdict: 'Unreviewable, all-or-nothing',
    },
    caption: 'One logical change per commit, staged deliberately (not a blind `git add .`), with an imperative message: "add", "fix", "validate".',
  },
  {
    type: 'diagram',
    title: 'Why atomic commits make recovery cheap',
    subtitle: 'Each commit is one revertable unit. That is what lets revert, bisect, and reflog do their job — and a blob defeats all three.',
    rankdir: 'LR',
    nodes: [
      { id: 'atomic', label: 'Atomic commits', description: 'one logical change each', kind: 'process', tone: 'accent' },
      { id: 'revert', label: 'git revert', description: 'undo ONE change safely', kind: 'process', tone: 'success' },
      { id: 'bisect', label: 'git bisect', description: 'find the bad commit fast', kind: 'process', tone: 'success' },
      { id: 'reflog', label: 'git reflog', description: 'recover a "lost" commit', kind: 'store', tone: 'success' },
      { id: 'force', label: 'force-push shared', description: 'rewrites others history', kind: 'external', tone: 'warning' },
    ],
    edges: [
      { from: 'atomic', to: 'revert', label: 'enables', kind: 'data', tone: 'success' },
      { from: 'atomic', to: 'bisect', label: 'enables', kind: 'data', tone: 'success' },
      { from: 'atomic', to: 'reflog', label: 'recoverable', kind: 'data', tone: 'success' },
      { from: 'force', to: 'atomic', label: 'NEVER on shared', kind: 'control', dashed: true, tone: 'warning' },
    ],
    legend: [
      { tone: 'accent', label: 'one revertable unit per commit' },
      { tone: 'success', label: 'recovery you actually get' },
      { tone: 'warning', label: 'the one move that destroys it' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'A commit gate, one rule at a time',
    subtitle: 'The exact logic your lab implements: reject the empty and the lazy commit, accept the clear one.',
    filename: 'commit_check.py',
    language: 'python',
    code: `LAZY = {"", "wip", "fix", "stuff", "update", ".", "asdf"}

def check_commit(staged_files, message):
    if not staged_files:
        return "nothing to commit"
    if message in LAZY or len(message) < 10:
        return "weak message"
    return "ok"`,
    steps: [
      { lines: [1], label: 'Name the lazy messages', note: 'A set of the throwaway messages that say nothing — "wip", "fix", "stuff". Set membership is the fast, readable check.' },
      { lines: [4, 5], label: 'Atomic: there must be a change', note: 'No staged files → nothing to commit. A commit with no content is not a commit.' },
      { lines: [6, 7], label: 'Reject the weak message', note: 'Lazy text OR under 10 chars fails — that is what makes history unreviewable later.' },
      { lines: [8], label: 'Otherwise it is good', note: 'Staged change + a real message = "ok". This gate is exactly what a pre-commit hook would enforce on a team.' },
    ],
    caption: 'The same shape as the boundary validators from Lesson 1 — name the bad cases, reject them, let the good one through.',
  },
  {
    type: 'lab',
    title: 'Reject the lazy commit',
    summary:
      'Implement check_commit(staged_files, message): return "nothing to commit" with no staged files, "weak message" for an empty/lazy message (in LAZY) or under 10 chars, else "ok". The harness checks all four cases — a "wip" commit must be rejected.',
    language: 'python',
    starter: GIT_LAB_STARTER,
    check: 'PASS: True',
  },
  {
    type: 'debug',
    symptom: "A bug appeared and the team couldn't revert just the change that caused it.",
    language: 'bash',
    brokenCode: `git add .
git commit -m "wip"   # 12 unrelated changes blended into one commit`,
    task: "Why can't they isolate and revert the bad change?",
    fix: 'Everything is in one non-atomic commit, so `git revert` would undo all 12 changes and `git bisect` can\'t narrow it down. Commit one logical change at a time with a clear message — then you can revert or bisect precisely.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'Each commit is one logical change (atomic)',
      "Messages say what changed and why (not 'wip' / 'fix')",
      'Work happens on a branch, not directly on a shared main',
      'You can revert one commit and recover a lost one with reflog',
      'You never force-push a shared branch',
    ],
  },
  {
    type: 'quiz',
    question: 'What makes git history actually useful?',
    options: [
      'One big commit per feature',
      'Small atomic commits with clear messages',
      'Committing only at the end of the day',
      'Force-pushing to keep it clean',
    ],
    answer: 1,
    explanation:
      "Small atomic commits (one logical change, clear message) let you review, revert a single change, and bisect to find a bug. Giant 'wip' commits and force-pushing shared branches destroy that — and other people's work.",
  },
  {
    type: 'teachback',
    prompts: [
      "What is an 'atomic' commit and why does it matter?",
      'What makes a commit message good?',
      "How do you safely undo a commit that's already pushed?",
      'Why is force-pushing a shared branch dangerous?',
    ],
  },
  {
    type: 'transfer',
    text: 'On your next task: work on a branch and make each commit one logical change with a message that says what and why. Practice `git revert` on a throwaway commit and look at `git reflog`, so recovery is never scary. Then stop and look at the engineer you have become across this module. You distrust input and validate it at the boundary (L1). You make failures loud, safe, and diagnosable (L2). You write small, pure, testable functions (L3) and you know exactly what your values are (L4). You keep your logic flat and your loops correct (L5), read files without leaking or crashing (L6), and catch the bug before production does (L7). You build tools that protect data instead of destroying it (L8), and now you keep a history you can trust (L9). That is not nine tricks — it is one instinct, repeated: distrust the careless path, build the safe one, prove it. First Steps taught you to make a computer obey. Foundations taught you to make code that survives the real world. That is the difference between writing programs and engineering them — and you can do it now.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
  {
    type: 'unlock-gate',
    criteria: [
      'Lab checkpoint passed — a "wip"/empty commit is rejected, a clear one is "ok"',
      'Broken case understood (a giant commit can\'t be reverted or bisected)',
      'All verification checks confirmed',
      'Teach-back delivered with a concrete example',
      'Transfer task scheduled on your next real task',
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
      eyebrow: 'Module 2 · Lesson 1 · 75 min',
      module_title: 'Module 2 · Foundations',
      module_sort: 1,
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
      eyebrow: 'Module 2 · Lesson 2 · 75 min',
      module_title: 'Module 2 · Foundations',
      module_sort: 1,
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

  // 2c. Lesson 3 — Functions & Modules (grounded in the 01 fundamentals cluster).
  const { error: l3Err } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'functions-and-modules',
      title: 'Functions & Modules: Build Small, Testable Units',
      eyebrow: 'Module 2 · Lesson 3 · 75 min',
      module_title: 'Module 2 · Foundations',
      module_sort: 1,
      sort: 2,
      est_minutes: 75,
      is_free_preview: false,
      status: 'published',
      intensity: 'standard',
      blocks: functionsBlocks,
    },
    { onConflict: 'course_slug,slug' },
  )
  if (l3Err) throw l3Err

  // 2d. Lesson 4 — Types & Data (grounded in the 01 fundamentals "Types" cluster).
  const { error: l4Err } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'types-and-data',
      title: 'Types & Data: Know What a Value Really Is',
      eyebrow: 'Module 2 · Lesson 4 · 75 min',
      module_title: 'Module 2 · Foundations',
      module_sort: 1,
      sort: 3,
      est_minutes: 75,
      is_free_preview: false,
      status: 'published',
      intensity: 'standard',
      blocks: typesBlocks,
    },
    { onConflict: 'course_slug,slug' },
  )
  if (l4Err) throw l4Err

  // 2e. Lesson 5 — Control Flow (grounded in the 01 "Data and control flow" cluster).
  const { error: l5Err } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'control-flow',
      title: 'Control Flow: Guard Clauses & Clean Loops',
      eyebrow: 'Module 2 · Lesson 5 · 75 min',
      module_title: 'Module 2 · Foundations',
      module_sort: 1,
      sort: 4,
      est_minutes: 75,
      is_free_preview: false,
      status: 'published',
      intensity: 'standard',
      blocks: controlFlowBlocks,
    },
    { onConflict: 'course_slug,slug' },
  )
  if (l5Err) throw l5Err

  // 2f. Lesson 6 — Files & I/O (grounded in the 01 "Files and I/O" cluster).
  const { error: l6Err } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'files-and-io',
      title: 'Files & I/O: Read Safely, Close Always',
      eyebrow: 'Module 2 · Lesson 6 · 75 min',
      module_title: 'Module 2 · Foundations',
      module_sort: 1,
      sort: 5,
      est_minutes: 75,
      is_free_preview: false,
      status: 'published',
      intensity: 'standard',
      blocks: filesBlocks,
    },
    { onConflict: 'course_slug,slug' },
  )
  if (l6Err) throw l6Err

  // 2g. Lesson 7 — Testing & Debugging (grounded in deep-nodes/testing-strategy.md).
  const { error: l7Err } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'testing-and-debugging',
      title: 'Testing & Debugging: Catch the Bug Before Prod',
      eyebrow: 'Module 2 · Lesson 7 · 75 min',
      module_title: 'Module 2 · Foundations',
      module_sort: 1,
      sort: 6,
      est_minutes: 75,
      is_free_preview: false,
      status: 'published',
      intensity: 'standard',
      blocks: testingBlocks,
    },
    { onConflict: 'course_slug,slug' },
  )
  if (l7Err) throw l7Err

  // 2h. Lesson 8 — CLI Safety (grounded in deep-nodes/cli-safety.md).
  const { error: l8Err } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'cli-workflow',
      title: 'CLI Safety: Safe Defaults & Dry Runs',
      eyebrow: 'Module 2 · Lesson 8 · 75 min',
      module_title: 'Module 2 · Foundations',
      module_sort: 1,
      sort: 7,
      est_minutes: 75,
      is_free_preview: false,
      status: 'published',
      intensity: 'standard',
      blocks: cliBlocks,
    },
    { onConflict: 'course_slug,slug' },
  )
  if (l8Err) throw l8Err

  // 2i. Lesson 9 — Git Fundamentals (grounded in the 01 "Git fundamentals" cluster).
  const { error: l9Err } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'git-fundamentals',
      title: 'Git Fundamentals: Atomic Commits You Can Trust',
      eyebrow: 'Module 2 · Lesson 9 · 75 min',
      module_title: 'Module 2 · Foundations',
      module_sort: 1,
      sort: 8,
      est_minutes: 75,
      is_free_preview: false,
      status: 'published',
      intensity: 'standard',
      blocks: gitBlocks,
    },
    { onConflict: 'course_slug,slug' },
  )
  if (l9Err) throw l9Err

  // 3. Maintain the denormalized lesson counter.
  const { count } = await sb
    .from('academy_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_slug', COURSE_SLUG)
    .eq('status', 'published')
  await sb.from('academy_courses').update({ lessons: count ?? 0 }).eq('slug', COURSE_SLUG)

  console.log(`Seeded "${COURSE_SLUG}" — ${count ?? 0} published lesson(s), ${pretest.length} pre / ${posttest.length} post questions.`)
}

main().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
