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
    text: 'Your `calculate_total()` works perfectly when you run it by hand — but the tests fail at random. The culprit: it reads a global `cart` and prints instead of returning. Make it a function you can actually trust.',
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
    text: 'Find a function in your own code that prints or saves while it computes. Split it: a pure function that returns the value + a thin caller that does the I/O. Add a test for the pure part.',
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
    text: "Your form adds two quantities and shows '23' instead of 5. The inputs arrived as strings ('2' and '3'), and `+` concatenated them. Your job: know what your values actually are, and convert them deliberately.",
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
    text: 'Find a place in your own code where input crosses a boundary (a form field, CLI arg, JSON value). Convert it to its real type at the edge with explicit error handling, and pick the data structure that fits the access pattern.',
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
    text: "A teammate's `process_order()` is five levels of nested if/else — nobody can tell which path runs. And the loop that 'removes cancelled orders' silently leaves half of them. Make the path obvious and the loop correct.",
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
    text: 'Find a loop in your own code that removes or edits a collection while iterating it, or a function nested more than three levels deep. Refactor: filter into a new list, or add guard clauses. Add a test for the edge that used to break.',
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

  // 2c. Lesson 3 — Functions & Modules (grounded in the 01 fundamentals cluster).
  const { error: l3Err } = await sb.from('academy_lessons').upsert(
    {
      course_slug: COURSE_SLUG,
      slug: 'functions-and-modules',
      title: 'Functions & Modules: Build Small, Testable Units',
      eyebrow: 'Module 1 · Lesson 3 · 75 min',
      module_title: 'Module 1 · Foundations',
      module_sort: 0,
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
      eyebrow: 'Module 1 · Lesson 4 · 75 min',
      module_title: 'Module 1 · Foundations',
      module_sort: 0,
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
      eyebrow: 'Module 1 · Lesson 5 · 75 min',
      module_title: 'Module 1 · Foundations',
      module_sort: 0,
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
