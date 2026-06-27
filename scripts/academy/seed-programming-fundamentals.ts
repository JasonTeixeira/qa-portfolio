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
    text: 'You shipped a tiny program at the end of First Steps — a gradebook that read a clean list of scores and worked perfectly. Here is the catch nobody warned you about: real data is never clean. Hand that same gradebook a score of "ninety", or -5, or 4000, and it breaks or silently lies. Today your code grows up. Your signup endpoint just let a user register with an empty email, a 50,000-character name, and age = -3 — and that garbage is now in your database. Your job for the next nine lessons starts here: stop trusting input, and validate it at the boundary before the system ever believes a word of it.',
  },
  {
    type: 'context',
    text: 'Unchecked input is the #1 cause of crashes, corrupted data, and an entire class of security bugs — injection, impossible states, the lot. It is the through-line of this whole module: the error handling, file reading, and CLI safety lessons ahead are all the same instinct — distrust the outside world, check it at the edge. Every API handler, CLI parser, config loader, and pipeline step needs this. Learn the pattern once here and it pays off in every system you will ever build.',
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
    text: 'Last lesson you rejected bad input at the door. But some failures slip past every guard — a network blips, a disk fills, a dependency dies — and what you do at that moment decides whether you find out in 30 seconds or 30 days. Here is the 30-day version: a background job has been "succeeding" for a week, because it wrapped everything in `except Exception: pass`. Thousands of records silently failed and no one knew. Your job: make failures loud, safe, and diagnosable — the opposite of that one catastrophic line.',
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
    text: 'In First Steps you learned to write a function: inputs in, value out. Then the last two lessons leaned on that — a validator you could test, an error path you could prove. But there is a way to write a function that quietly poisons all of it. Your `calculate_total()` works perfectly when you run it by hand, then its tests fail at random for no reason you can see. The culprit: it reads a global `cart` and prints instead of returning. Today you make it a function you can actually trust — small, pure, and predictable enough that a test is just one line.',
  },
  {
    type: 'context',
    text: 'Functions are the unit of reuse AND the unit of testing. Small, single-purpose, predictable functions are why some codebases are a joy and others a minefield. Every module, API, and pipeline is built from them.',
  },
  {
    type: 'pretest',
    prompt: 'Before you read on: why is a function that reads a global variable harder to test than one that takes everything as a parameter?',
    reveal:
      'A function that depends on hidden global state behaves differently depending on what ran before it — tests become order-dependent and flaky. A function that takes its inputs as parameters and returns a value (a pure function) gives the same output for the same input every time, so a test is just `assert f(x) == expected`.',
  },
  {
    type: 'worked-example',
    intro: 'Turn a side-effecting function into a small, pure, testable one (before vs after — in one file the AFTER def would replace the BEFORE):',
    language: 'python',
    code: `# before — reads a global, prints instead of returning (hard to test)
cart = [{"price": 10, "qty": 3}]
def calculate_total():
    total = 0
    for item in cart:            # hidden dependency on a global
        total += item["price"] * item["qty"]
    print("Total:", total)       # side effect instead of a return

# after — inputs in, value out, one job (trivially testable)
def calculate_total(items):
    return sum(i["price"] * i["qty"] for i in items)`,
    steps: [
      'One job: this function computes a total — nothing else.',
      'Inputs as parameters: pass `items` in; read no globals.',
      'Return, don’t print: hand back a value the caller can use or test.',
      'No hidden state: same inputs → same output, always.',
      'Name says what it does: `calculate_total`, not `do_stuff`.',
    ],
    commonMistake:
      'Doing two things in one function (compute AND print/save). Split it: the function returns a value; a separate caller does the I/O.',
  },
  {
    type: 'concept',
    title: 'A function is a contract: name · inputs · output · one job',
    text: 'A good function is a contract: its name says what it does, its parameters declare what it needs, its return value is what it promises. PURE functions (output depends only on inputs, no side effects) are the easiest to test, reuse, and reason about. A MODULE is just a file that groups related functions behind a clear interface — other code imports the contract, not the internals.',
  },
  {
    type: 'code',
    filename: 'pricing.py  +  main.py',
    language: 'python',
    code: `# pricing.py — a MODULE: related functions, one clear interface
def line_total(price, qty):
    return price * qty

def cart_total(items):
    return sum(line_total(i["price"], i["qty"]) for i in items)


# main.py — import only what you need from the module
from pricing import cart_total

print(cart_total([{"price": 10, "qty": 3}]))   # -> 30`,
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
    type: 'tradeoff',
    question: 'Should this function do one thing, or handle the whole workflow?',
    optionA: {
      label: 'One job (compose)',
      text: 'Small pure functions: easy to test, reuse, and reason about — but you need a thin caller to wire them together.',
    },
    optionB: {
      label: 'One big function',
      text: 'Does everything in one place: fewer pieces to track — but untestable, unreusable, and every change risks the whole thing.',
    },
    guidance:
      'Default to small, single-purpose functions and compose them. The function that "does everything" is the one that breaks every time you touch it.',
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
    type: 'calibration',
    artifact: 'Your pure line_total() + its test',
    weak: '"It works when I run it." — untested, and maybe impure.',
    passing:
      '"line_total takes price + qty, returns the total, reads no globals; a test asserts it across 3 inputs." — correct and testable.',
    excellent:
      '"line_total is pure (params in, value out, no side effects), single-purpose, and named for its job. Tests cover normal, zero, and edge inputs. I pushed the printing/saving out to a thin caller so the core stays pure and reusable — the same shape as the rest of our domain functions." — specific, reasoned, transferable.',
    note: 'Excellent separates compute from I/O and tests the edges — L5+ on the mastery scale.',
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
    text: "You met this ghost once in First Steps — \"2\" + \"3\" is \"23\", not 5 — and it felt like a quirk. It is not a quirk; it is the bug that will haunt every form, file, and API you ever touch. Your form adds two quantities and shows '23' instead of 5, because the inputs arrived as strings ('2' and '3') and `+` quietly concatenated them. Now that you write functions you can trust, this is the next betrayal to defend against: know what your values actually are, and convert them deliberately at the edge — before they reach the clean code you just learned to write.",
  },
  {
    type: 'context',
    text: "Type confusion is a top source of subtle bugs: '5' + '5' = '55', `if count:` silently skipping zero, a list used where a dict belonged. Knowing types — and converting at the boundary — underpins everything from form handling to APIs to data pipelines.",
  },
  {
    type: 'pretest',
    prompt: "Before you read on: in Python, what is `'2' + '3'`? And `2 + 3`? Why does the first one surprise people?",
    reveal:
      "`'2' + '3'` is `'23'` (string concatenation); `2 + 3` is `5` (integer addition). `+` does different things depending on the operand TYPE. Input from forms, files, and APIs usually arrives as STRINGS — so you must convert deliberately (`int('2')`) before doing math.",
  },
  {
    type: 'worked-example',
    intro: 'Convert at the boundary, then compute on real types:',
    language: 'python',
    code: `def order_total(qty_str, price_str):
    # input from a form/API arrives as strings -> convert at the boundary
    try:
        qty = int(qty_str)
        price = float(price_str)
    except ValueError:
        raise ValueError("quantity and price must be numbers")
    if qty < 0 or price < 0:
        raise ValueError("quantity and price must be non-negative")
    return qty * price        # now we compute on real numeric types`,
    steps: [
      'Know the incoming type — form/file/API data is usually `str`.',
      'Convert explicitly at the edge: `int(...)`, `float(...)`.',
      'Handle conversion failure (`int("oops")` raises ValueError).',
      'Compute on the real type — never `str + int`.',
      'Pick the right structure: list (ordered), dict (keyed lookup), set (uniqueness).',
    ],
    commonMistake:
      'Assuming input is already the right type. Form/file/API data is usually a string — convert before you compute, or `+` will concatenate.',
  },
  {
    type: 'concept',
    title: 'A value has a type; the type decides what operations mean',
    text: "Python's core types: int, float, str, bool, list, dict, set, None. A value's TYPE decides what `+`, `==`, and truthiness do — `'2' + '3'` concatenates, `2 + 3` adds. Watch truthiness pitfalls: `0`, `''`, `[]`, and `{}` are all falsy, so `if count:` skips a real zero. Choose structures by access pattern: list for order, dict for keyed lookup, set for uniqueness. Using the right type makes whole classes of bad state impossible to represent.",
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
    type: 'tradeoff',
    question: 'User input arrives as a string. Convert it early, or pass the string around?',
    optionA: {
      label: 'Convert at the boundary',
      text: 'Parse to the real type (int / date) the moment it enters. The rest of the code works with real types — you just handle conversion failures at the edge.',
    },
    optionB: {
      label: 'Keep it a string',
      text: 'Pass the raw string deeper. Simpler at the edge — but every downstream caller must remember to convert, and bugs hide far from the source.',
    },
    guidance:
      'Convert at the boundary — “parse, don’t smear.” Once past the edge, code should work with real types, not stringly-typed data.',
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
    type: 'calibration',
    artifact: 'Your total_quantity() + its test',
    weak: '"It adds the numbers." — it might be concatenating strings.',
    passing:
      '"total_quantity converts each string to int and sums; it rejects non-numbers with a ValueError; a test covers both." — correct and typed.',
    excellent:
      '"total_quantity parses at the boundary (int() per value), rejects non-integers with a clear error, and returns an int. Tests cover normal, empty, and bad-input cases. I used a list for ordered values and would reach for a dict if I needed keyed lookup. The same convert-at-the-edge pattern applies to our API params." — specific, typed, structure-aware, transferable.',
    note: 'Excellent converts at the boundary AND reasons about data structures — L5+ on the mastery scale.',
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
    text: "You can write the if and the for-loop — First Steps gave you both. But knowing the syntax and writing logic a human can follow are two different skills, and the gap between them is where bugs live. A teammate's `process_order()` is five levels of nested if/else — nobody, including the author, can tell which path actually runs. And the loop that 'removes cancelled orders' silently leaves half of them behind. Your data is clean by now; today you keep the LOGIC clean too: make the path obvious with guard clauses, and make the loop correct.",
  },
  {
    type: 'context',
    text: 'Control flow is the shape of your logic. Deeply nested conditionals hide bugs; clean guard clauses make the valid path obvious. And loops have a famous set of traps that bite everyone. This is daily-driver work.',
  },
  {
    type: 'pretest',
    prompt: "Before you read on: what goes wrong if you loop over a list and remove items from it as you go?",
    reveal:
      'Removing an item shifts the later indices, so the loop skips the element right after each removal — you end up processing every other item. Iterate over a COPY, or (better) build a NEW list with the items you want to keep (a comprehension).',
  },
  {
    type: 'worked-example',
    intro: 'Flatten nesting with guard clauses — handle the invalid cases first, then the happy path runs unindented:',
    language: 'python',
    code: `# before — deep nesting; which path actually runs?
def charge(order):
    if order is not None:
        if order["total"] > 0:
            if order["status"] == "open":
                return pay(order)
            else:
                return "not open"
        else:
            return "empty"
    else:
        return "missing"

# after — guard clauses: reject the bad cases first, happy path is flat
def charge(order):
    if order is None:
        return "missing"
    if order["total"] <= 0:
        return "empty"
    if order["status"] != "open":
        return "not open"
    return pay(order)`,
    steps: [
      'Reject each invalid case early with its own `return`.',
      'Each guard is one reason to stop — read top to bottom.',
      'The happy path lands at the end, unindented and obvious.',
      'For loops: never mutate the collection you are iterating.',
      'To drop items, build a new list (filter) instead of removing in place.',
    ],
    commonMistake:
      'Deep nesting where each `if` adds another level. Invert it: `if not valid: return` early, and keep the happy path flat.',
  },
  {
    type: 'concept',
    title: 'Guard clauses flatten logic; loops have classic traps',
    text: 'A guard clause handles an invalid case and returns immediately, so the happy path stays flat (deep nesting past ~3 levels is a refactor signal). Loops have three classic traps: off-by-one (wrong `range` bounds), infinite loop (the condition never changes), and mutate-while-iterating (removing items shifts indices and skips elements). To transform or prune a list, prefer a comprehension / filter over in-place mutation.',
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
    type: 'tradeoff',
    question: 'Validate-and-act: nest the checks, or use guard clauses?',
    optionA: {
      label: 'Guard clauses',
      text: 'Reject invalid cases up front and return early; the happy path runs unindented and obvious. More return statements, but flat and readable.',
    },
    optionB: {
      label: 'Nested if/else',
      text: 'One exit point, everything inside nested blocks. Familiar — but deep nesting hides which path runs and which case you forgot.',
    },
    guidance:
      'Prefer guard clauses for validation: handle the bad cases first and return, keep the happy path flat. Deep nesting (>3 levels) is a refactor signal, not a style preference.',
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
    type: 'calibration',
    artifact: 'Your active_orders() + its test',
    weak: '"It removes the cancelled ones." — probably mutates the list and skips some.',
    passing:
      '"active_orders returns a NEW list of non-cancelled orders via a comprehension; the input is untouched; a test covers adjacent-cancelled." — correct.',
    excellent:
      '"active_orders filters with a comprehension (no mutation), so adjacent cancelled orders can\'t be skipped and the caller\'s list is preserved. Elsewhere I used guard clauses to keep validation flat. Tests cover adjacent-cancelled, all-cancelled, and empty. The same filter-don\'t-mutate rule applies anywhere we prune a collection." — specific, correct, transferable.',
    note: 'Excellent avoids mutation AND tests the edge cases — L5+ on the mastery scale.',
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
    text: 'Until now your data lived safely in memory — lists and dicts that were just THERE. The moment you reach for a file, that comfort ends: the file might be missing, locked, half-read, or gigabytes too big, and every one of those is the outside world failing in a way pure code never does. A nightly job crashed because a config file was missing — and even when it worked, it leaked open file handles until the process ran out of them entirely. Read files the safe way: always close, and handle missing explicitly. This is where the distrust-the-boundary instinct from Lesson 1 meets the physical world.',
  },
  {
    type: 'context',
    text: 'Reading and writing files (and stdin/stdout, network streams) is I/O — slow, fallible, and full of resources you must release. The `with` statement and explicit error handling are the difference between a robust job and a 3am page.',
  },
  {
    type: 'pretest',
    prompt: "Before you read on: why is `f = open('x'); data = f.read()` riskier than `with open('x') as f:`?",
    reveal:
      'If anything between `open` and `f.close()` raises, the file is never closed — you leak a file handle (and on some systems keep the file locked). `with open(...) as f:` guarantees the file closes even when an error occurs. Always use `with` for files.',
  },
  {
    type: 'worked-example',
    intro: 'Use a context manager — the file closes even if parsing fails, and a missing file surfaces:',
    language: 'python',
    code: `def read_config(path):
    config = {}
    with open(path) as f:            # raises FileNotFoundError if missing; always closes
        for line in f:               # streams line by line, not the whole file at once
            line = line.strip()
            if not line:
                continue             # skip blank lines
            key, value = line.split("=", 1)
            config[key] = value
    return config`,
    steps: [
      'Open with `with` so the file closes on every path (success or error).',
      'Iterate the file object — it streams line by line, not all into memory.',
      'Skip blanks; parse each line defensively (`split("=", 1)`).',
      "Let a missing file raise FileNotFoundError — don't swallow it.",
      'Return a real value the caller can use.',
    ],
    commonMistake:
      'A bare `open()` without `with` (or try/finally) — one exception before `close()` and the handle leaks.',
  },
  {
    type: 'concept',
    title: '`with` guarantees cleanup; I/O is slow and fallible',
    text: 'A context manager (`with`) closes its resource automatically when the block exits — even on an exception. Iterate a file object to STREAM it line by line; don\'t `.read()` a multi-gigabyte file into memory. I/O fails in ways pure code doesn\'t — missing file, permission denied, bad encoding — so handle or surface those, never silently swallow. The same `with` pattern manages network connections, locks, and DB cursors.',
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
    type: 'tradeoff',
    question: 'Reading a large file: load it all, or stream it line by line?',
    optionA: {
      label: 'Read all',
      text: '`data = f.read()` / `f.readlines()`: simple, gives random access — but loads the whole file into memory; a big file OOMs the process.',
    },
    optionB: {
      label: 'Stream',
      text: 'Iterate the file object line by line: constant memory, handles huge files — but you process sequentially, in one pass.',
    },
    guidance:
      'Stream by default (`for line in f:`). Only load the whole file when it is small and you need random access — a log or dataset can be gigabytes.',
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
    type: 'calibration',
    artifact: 'Your read_config() + its test',
    weak: '"It reads the file." — might leak the handle or swallow a missing file.',
    passing:
      '"read_config uses `with`, parses key=value into a dict, and lets a missing file raise; a test covers both." — correct.',
    excellent:
      '"read_config opens with a context manager (always closes), streams line by line, skips blanks, parses defensively, and surfaces FileNotFoundError instead of returning {}. Tests cover valid, missing, and malformed-line files. The same with-block pattern manages DB cursors and locks." — specific, robust, transferable.',
    note: 'Excellent streams, surfaces errors, AND transfers the pattern — L5+ on the mastery scale.',
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
    text: 'Every lesson so far gave you a reason to trust your code — validation, error handling, pure functions. Tests are how you EARN that trust instead of just claiming it, and a bad test is worse than none because it sells you false confidence. Your `average()` passed every test and shipped. Then it crashed in production on an empty list, because the tests only ever checked the happy path. Add the test that would have caught it, and fix the bug — then you will never confuse "the tests are green" with "the code is right" again.',
  },
  {
    type: 'context',
    text: 'Tests are how you change code without fear. But a test that only checks the happy path gives false confidence. The skill is choosing the cheapest test that catches the real risk — usually an edge or negative case — and turning every production bug into a regression test.',
  },
  {
    type: 'pretest',
    prompt: 'Before you read on: `average()` works on [2, 4, 6] and passes its test. What input might still crash it in production?',
    reveal:
      'The empty list: `sum([]) / len([])` is `0 / 0` → ZeroDivisionError. The happy-path test never tried it. Edge cases (empty, zero, negative, huge, missing) are where bugs hide — test those, not just the obvious case.',
  },
  {
    type: 'worked-example',
    intro: 'Test the risk, not just the happy path — Arrange / Act / Assert, and add the edge case that bites:',
    language: 'python',
    code: `def safe_average(numbers):
    if not numbers:          # the edge the happy path forgot
        return 0
    return sum(numbers) / len(numbers)

def test_safe_average():
    # Arrange / Act / Assert — behavior, not internals
    assert safe_average([2, 4, 6]) == 4          # normal
    assert safe_average([10]) == 10              # single
    assert safe_average([]) == 0                 # EDGE / regression
    assert safe_average([-2, 2]) == 0            # negatives`,
    steps: [
      'Identify the risk — what input could actually break this?',
      'Pick the cheapest layer that catches it — usually a fast unit test.',
      'Add the negative / edge case, not just the happy path.',
      'Assert behavior (input → output), not implementation details.',
      'Turn every production bug into a regression test.',
    ],
    commonMistake:
      "Testing only the happy path. The bug lives in the case you didn't try — empty, zero, negative, or missing.",
  },
  {
    type: 'concept',
    title: 'Cheapest test that catches the failure; behavior over implementation',
    text: 'Risk-based testing: spend test effort where a failure would actually hurt. The pyramid — many fast unit tests, fewer integration tests, a few E2E — keeps feedback fast. Write tests with Arrange/Act/Assert, and assert BEHAVIOR (inputs → outputs), not internals, so a refactor doesn’t break them. Every production bug becomes a regression test. Debugging is a loop: reproduce → isolate → fix → add the test that proves it.',
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
    type: 'tradeoff',
    question: 'You found a bug. Fix it, or fix it AND add a test?',
    optionA: {
      label: 'Fix + regression test',
      text: 'Fix the bug and add a test that fails BEFORE the fix and passes after. Slightly more work — but the bug can never silently return.',
    },
    optionB: {
      label: 'Just fix it',
      text: 'Patch the bug and move on. Faster right now — but nothing stops the same bug coming back in the next refactor.',
    },
    guidance:
      'Always turn a bug into a regression test: write the failing test first (it reproduces the bug), then fix until it’s green. That is the test most likely to catch a real failure.',
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
    type: 'calibration',
    artifact: 'Your safe_average() + its tests',
    weak: '"It computes the average." — probably crashes on an empty list.',
    passing:
      '"safe_average returns 0 for an empty list and the mean otherwise; tests cover normal, single, and empty." — correct, edge-covered.',
    excellent:
      '"safe_average handles the empty list (the prod-crash edge) and returns the mean otherwise. Tests cover normal, single, empty, and negatives, each asserting behavior with a message. I added the empty case as a regression test after reproducing the crash. The same reproduce → test → fix loop applies to any bug." — specific, edge-aware, regression-minded, transferable.',
    note: 'Excellent reproduces the bug as a failing test FIRST — L5+ on the mastery scale.',
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
    text: "You can write code that's validated, handled, typed, and tested — and still wipe a production database in one keystroke, because the TOOL around the code wasn't safe. This is the lesson where consequences get physical and irreversible. An internal cleanup script ran with its defaults and deleted production data, because 'no environment specified' quietly defaulted to prod and nothing asked the human to confirm. There is no try/except for a deleted table. Make the tool safe by default, so a forgotten flag previews instead of destroys.",
  },
  {
    type: 'context',
    text: 'Internal CLI tools are sharp: a wrong flag or a defaulted environment can delete real data with no undo. Safe defaults, dry-run previews, and confirmation for high-impact actions are the difference between a useful tool and an outage.',
  },
  {
    type: 'pretest',
    prompt: 'Before you read on: why is it dangerous for a destructive command to DEFAULT to executing — or to default the environment to production?',
    reveal:
      'Defaults are what run when someone forgets a flag. If "execute" or "production" is the default, a tired engineer who omits a flag destroys real data. Safe tools default to dry-run and require explicit opt-in for destructive, production actions.',
  },
  {
    type: 'worked-example',
    intro: 'Safe by default: dry-run unless explicitly told to execute, and production needs confirmation:',
    language: 'python',
    code: `def decide(args):
    if not args.get("execute"):
        return "dry-run"                 # default: preview, do nothing destructive
    if args.get("env") == "production" and not args.get("confirmed"):
        return "blocked: confirm production"   # never act on prod without confirmation
    return "execute"`,
    steps: [
      'Default to dry-run — a forgotten flag previews, it does not destroy.',
      'Require an explicit `execute` to take action.',
      'Never default the environment to production.',
      'Require human confirmation for production / high blast radius.',
      'Log operator + action + target + time, and preview the exact target set.',
    ],
    commonMistake:
      'Defaulting `execute=True` or `env="production"`. The default is what runs when a flag is forgotten — make it the SAFE option.',
  },
  {
    type: 'concept',
    title: 'Safe defaults · dry-run · blast radius · human confirmation',
    text: 'Safe tools default to the harmless option: a DRY-RUN that previews the exact target set before touching anything. BLAST RADIUS is how much one command can affect — limit it (explicit scope, no bare wildcards). Require HUMAN CONFIRMATION for high-impact actions, and never default the environment to production. Keep an AUDIT TRAIL (operator/action/resource/time) and make rollback possible. The default is what runs when someone forgets a flag — so it must be safe.',
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
    type: 'tradeoff',
    question: 'A destructive command: run it immediately, or dry-run first?',
    optionA: {
      label: 'Dry-run first',
      text: 'Show exactly what WOULD change, then require an explicit second step to execute. One extra step — but accidental data loss becomes very hard.',
    },
    optionB: {
      label: 'Execute immediately',
      text: "Do it in one command — fast for the happy path. But one typo or forgotten flag and there's no preview and no undo.",
    },
    guidance:
      'Default to dry-run for anything destructive. Preview the exact target set, then require an explicit execute (and confirmation for prod). The extra step is cheap; a deleted production table is not.',
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
    type: 'calibration',
    artifact: 'Your decide() safety gate + its tests',
    weak: '"It runs the command." — it probably executes by default.',
    passing:
      '"decide defaults to dry-run, requires an explicit execute, and blocks production without confirmation; tests cover each path." — correct, safe by default.',
    excellent:
      '"decide defaults to dry-run, never defaults env to production, and requires confirmation for prod; it would also preview the target set and log the action. Tests cover dry-run, staging-execute, prod-blocked, and prod-confirmed. The same safe-default + confirmation pattern applies to any high-blast-radius operation." — specific, safe, auditable, transferable.',
    note: 'Excellent previews, audits, AND confirms for prod — L5+ on the mastery scale.',
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
    text: "This is the last skill of Foundations, and it is the safety net under all the others. You can validate, handle errors, write pure functions, and test like a pro — and still lose a day's work, or ship a bug you can't trace, if your version history is a mess. Your teammate's branch is one giant commit titled 'stuff', and when a bug appeared, nobody could tell which change caused it or revert just that part. Make your history something you can actually use: small commits you can read, revert, and recover — so a mistake becomes a thirty-second undo instead of a panic.",
  },
  {
    type: 'context',
    text: 'Git history is a tool, not a chore. Small atomic commits with clear messages let you bisect a bug, revert one change, and review work sanely. Branches isolate risk. And almost nothing in git is truly lost — if you know how to recover.',
  },
  {
    type: 'pretest',
    prompt: "Before you read on: why is one giant commit titled 'wip' worse than five small commits with clear messages?",
    reveal:
      "A giant 'wip' commit can't be reviewed, can't be reverted in part, and tells you nothing about what changed or why. Small atomic commits (one logical change each, with a clear message) let you review, revert just the bad one, and bisect to find which change introduced a bug.",
  },
  {
    type: 'worked-example',
    intro: 'An atomic commit: one logical change, staged deliberately, with a message that says what and why:',
    language: 'bash',
    code: `# GOOD — one logical change, deliberate staging, clear message
git add signup.py
git commit -m "validate signup input: reject empty email and out-of-range age"

# BAD — everything blended into one unreviewable, unrevertable blob
git add .
git commit -m "wip"`,
    steps: [
      'One logical change per commit — something you could revert on its own.',
      'Stage deliberately (the related files), not a blind `git add .`.',
      'Message = what changed + why (imperative: "add", "fix", "validate").',
      'Work on a branch per task to isolate risk.',
      'Recover with `git revert` / `git reflog`; never force-push a shared branch.',
    ],
    commonMistake:
      "`git add .` + `git commit -m 'wip'` — an unreviewable, unrevertable blob. Stage the related change and describe it.",
  },
  {
    type: 'concept',
    title: 'Atomic commits · clear messages · branches · you can recover',
    text: 'An ATOMIC commit is one logical change you could revert on its own. A good MESSAGE says what changed and why (imperative mood). Use a BRANCH per task to isolate work. You can almost always recover: `git revert` undoes a commit safely (a new commit), and `git reflog` finds "lost" commits. The one rule that protects everyone: NEVER force-push a shared branch — it rewrites history other people already have.',
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
    type: 'tradeoff',
    question: 'Finished a feature: one big commit, or several small ones?',
    optionA: {
      label: 'Small atomic commits',
      text: 'Each commit is one logical change with a message. More entries — but reviewable, revertable, and bisectable.',
    },
    optionB: {
      label: 'One big commit',
      text: "Squash it all into one. Fewer entries — but you can't review, revert, or bisect a single change; it's all-or-nothing.",
    },
    guidance:
      "Prefer small atomic commits while you work. You can always squash before merging if needed — but you can never un-blend a giant 'wip' commit.",
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
    type: 'calibration',
    artifact: 'Your commit history on a real task',
    weak: '"I committed my work." — probably one big "wip" blob.',
    passing:
      '"Small commits, each one logical change with a clear message, on a feature branch." — reviewable and revertable.',
    excellent:
      '"Atomic commits with what+why messages on a feature branch; I can revert any single change and bisect a regression. I recovered a dropped commit with reflog and never force-push shared branches, squashing only obvious fixups before merge." — specific, recoverable, collaborative.',
    note: 'Excellent shows recovery (reflog / revert) AND collaboration safety — L5+ on the mastery scale.',
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

  console.log(`✓ Seeded "${COURSE_SLUG}" — ${count ?? 0} published lesson(s), ${pretest.length} pre / ${posttest.length} post questions.`)
}

main().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
