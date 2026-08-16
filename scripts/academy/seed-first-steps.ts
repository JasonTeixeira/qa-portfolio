/**
 * Seed "Module 1 · First Steps" — the absolute-beginner on-ramp for the
 * Programming Fundamentals course, and re-home the existing 9 lessons as
 * "Module 2 · Foundations" so First Steps renders first.
 *
 *   tsx scripts/academy/seed-first-steps.ts                       # dry-run (default)
 *   tsx --env-file=.env.local scripts/academy/seed-first-steps.ts --apply
 *
 * Course:  programming-fundamentals  (existing — we only ADD lessons + relabel)
 * Module:  Module 1 · First Steps  (module_sort 0; existing module becomes sort 1)
 *
 * Audience: ZERO prior knowledge. Lesson 1 assumes nothing — no functions, no
 * types, no loops; each concept is introduced only when its lesson arrives.
 * Every lesson follows the per-lesson quality bar in docs/academy/COURSE_PROGRAM.md:
 *   sprint-contract → mission → context → pretest → concept → worked-example →
 *   code → callout → lab (real Pyodide starter+check; may feed input() a fixed
 *   stdin) → debug → quiz → verification → teachback → transfer → spaced-review.
 *
 * Ordering: the reader (lib/academy/content.ts — getLesson / getCourse /
 * getCourseOverview) sorts by .order('module_sort').order('sort'). First Steps
 * uses module_sort 0, so it renders before Foundations (which we move to 1).
 * Idempotent: upsert on (course_slug, slug); the relabel is an idempotent UPDATE.
 */

import { createClient } from '@supabase/supabase-js'

const shouldApply = process.argv.includes('--apply')

const COURSE_SLUG = 'programming-fundamentals'
const FIRST_STEPS_MODULE = 'Module 1 · First Steps'
const FIRST_STEPS_MODULE_SORT = 0

// The existing module, relabelled. Slugs of those 9 lessons are NEVER touched
// (learner progress + evidence reference slugs) — only module_title + module_sort.
const OLD_FOUNDATIONS_MODULE = 'Module 1 · Foundations'
const NEW_FOUNDATIONS_MODULE = 'Module 2 · Foundations'
const NEW_FOUNDATIONS_MODULE_SORT = 1

// ================================================================= LESSON 1
// "Your First Program" — running code, print(), the edit, run, see-output loop.
// Beginner-correct floor: NO variables, NO functions, NO types yet. The only
// idea is: you type an instruction, you run it, the computer does exactly it.
const FIRST_PROGRAM_LAB_STARTER = `# Make the program print this EXACT line:
#     Hello, world!
# Type your print(...) below, then press Run.

# your code here
`

const firstProgramBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Write and run your very first program: make the computer print an exact line of text on screen, and understand the edit → run → see-output loop that every programmer lives in.',
    intensity: 'micro',
    time: '15–25 min',
    proof: 'A program that prints the exact line "Hello, world!" — run it yourself and read the output it produced.',
    unlock: 'Your program runs and prints the exact required line, with no typos.',
    doNotClaim:
      "Don't claim you \"ran code\" until you've actually pressed Run and SEEN your line appear in the output — reading about it is not the same as running it.",
  },
  {
    type: 'mission',
    text: 'Right now the computer does nothing you tell it — because you have never told it anything. In the next twenty minutes you type one line, press Run, and watch a machine do exactly what you said.',
  },
  {
    type: 'context',
    text: 'Everything you will ever build is just instructions you write and the computer runs, one after another. The whole job rests on one loop: edit, run, see, adjust.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: a friend says "the computer is smart — it figures out what I mean." You type an instruction with a small typo. What do you think happens?',
    reveal:
      'The computer does NOT guess what you meant — it does exactly what you typed, or it stops and complains. That is the most important thing to learn first: the computer is precise, not smart. A typo is not "close enough"; it is wrong, and the program will tell you. This is good news — it means the rules are consistent, and you are always in control.',
  },
  {
    type: 'concept',
    title: 'A program is instructions; print() shows text on screen',
    text: 'A program runs instructions top to bottom. print(...) displays whatever is inside the parentheses; text goes in quotes so the computer shows it literally — that quoted text is a string.',
  },
  {
    type: 'code-walkthrough',
    title: 'Your first instruction, part by part',
    subtitle: 'One line of Python — read each piece, then watch the output appear.',
    filename: 'hello.py',
    language: 'python',
    code: `print("Hello, world!")
print("I just ran my first program.")`,
    steps: [
      { lines: [1], label: 'print is the instruction', note: 'It means "show this on screen". The output it produces is the line you see below the code.' },
      { lines: [1], label: 'The parentheses hold what to show', note: 'Everything between ( and ) is what print displays.' },
      { lines: [1], label: 'Quotes mark the text', note: 'The " " wrap a string — exactly what is inside them is printed: Hello, world!' },
      { lines: [2], label: 'A second instruction runs next', note: 'Programs run top to bottom, so this line prints AFTER the first. Order is something you control.' },
      { lines: [1, 2], label: 'Edit · run · see', note: 'Change the text inside the quotes, press Run, and the output changes to match. That loop is the whole job.' },
    ],
    caption: 'Output, in order: Hello, world! then I just ran my first program.',
  },
  {
    type: 'diagram',
    title: 'The loop every programmer lives in',
    subtitle: 'You edit the instruction, run it, read the output, and adjust — round and round.',
    rankdir: 'LR',
    nodes: [
      { id: 'edit', label: 'Edit', description: 'type print("...")', kind: 'process', tone: 'accent' },
      { id: 'run', label: 'Run', description: 'press Run', kind: 'process' },
      { id: 'see', label: 'See output', description: 'read what appeared', kind: 'store', tone: 'success' },
      { id: 'adjust', label: 'Adjust', description: 'fix or extend', kind: 'decision' },
    ],
    edges: [
      { from: 'edit', to: 'run', label: 'instructions', kind: 'data' },
      { from: 'run', to: 'see', label: 'produces', kind: 'data', tone: 'success' },
      { from: 'see', to: 'adjust', label: 'compare to goal', kind: 'control' },
      { from: 'adjust', to: 'edit', label: 'try again', kind: 'control', dashed: true },
    ],
    legend: [
      { tone: 'accent', label: 'where you type' },
      { tone: 'success', label: 'what the computer shows back' },
    ],
  },
  {
    type: 'compare',
    title: 'Quoted vs unquoted text',
    subtitle: 'The same word, with and without quotes — only one runs.',
    mono: true,
    left: {
      label: 'No quotes — error',
      tone: 'warning',
      lines: ['print(Hello)', 'Hello is read as a command to look up', 'there is no such command', 'NameError: name \'Hello\' is not defined'],
      verdict: 'The computer cannot find "Hello"',
    },
    right: {
      label: 'Quoted — a string',
      tone: 'success',
      lines: ['print("Hello")', '"Hello" is text to display, not a command', 'the quotes mark it as a string', 'output: Hello'],
      verdict: 'Literal text always goes in quotes',
    },
    caption: 'Text you want shown LITERALLY always goes inside quotes — the #1 beginner fix.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Here is the habit that separates people who get unstuck fast from people who panic: an error is not the computer scolding you — it is the computer telling you exactly where it got confused. Read it, do not fear it. And on day one, nine times out of ten the answer is a quote: it must wrap the WHOLE piece of text — opening quote, your text, closing quote — "Hello, world!". When something breaks, check your quotes first, then read the message.',
  },
  {
    type: 'lab',
    title: 'Print your first line',
    summary:
      'Make the program print this EXACT line — including the comma, the space, and the exclamation mark:  Hello, world!  Use print("...") with the text inside the quotes, then press Run and read your output.',
    language: 'python',
    starter: FIRST_PROGRAM_LAB_STARTER,
    check: 'Hello, world!',
  },
  {
    type: 'debug',
    symptom: 'This program is meant to print a greeting, but pressing Run gives an error instead of showing the text.',
    language: 'python',
    brokenCode: `print(Hello, world!)`,
    task: 'Find why the computer refuses to run this one line.',
    fix: 'The text is missing its quotes. Without quotes the computer cannot even read this line as code — the ! is not valid Python, so it stops with a SyntaxError before running anything. Wrap the literal text in quotes: print("Hello, world!"). Quotes turn the whole thing into a string the computer will simply display.',
  },
  {
    type: 'quiz',
    question: 'You run print("Cats") and then print("Dogs"). What appears on screen, and in what order?',
    options: [
      'Dogs, then Cats — Python runs the last line first',
      'Cats on one line, then Dogs on the next — instructions run top to bottom',
      'CatsDogs on one line — print joins them together',
      'Nothing — you need to run them at the same time',
    ],
    answer: 1,
    explanation:
      'A program runs its instructions top to bottom, in order. print() shows its text and moves to a new line, so you get Cats first, then Dogs underneath. Order is something you control — and rely on — in every program you write.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'You pressed Run and your line actually appeared in the output (you saw it, not just read about it)',
      'The output is EXACTLY:  Hello, world!  — same comma, same space, same exclamation mark',
      'Your text is wrapped in matching quotes inside print(...)',
      'You changed the text once, re-ran, and watched the output change to match (the edit, run, see loop)',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In one sentence, what does print(...) do?',
      'Why does the text you want shown go inside quotes?',
      'What are the three steps of the loop every programmer repeats? (edit, then what, then what?)',
      'A friend says "the computer figured out what I meant." Gently correct them.',
    ],
  },
  {
    type: 'transfer',
    text: 'Open the lab again and print three lines of your own: your name, your goal for learning to code, and one thing you are curious about. Run it and read all three. You just made the machine say exactly what you told it to — that is the entire job, scaled up.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
]

// ================================================================= LESSON 2
// "Variables: Names for Values" — assignment, reassignment, naming.
// New idea vs L1: a name that holds a value, so you can use it later. Still NO
// functions, NO type conversion, NO loops. Numbers used plainly (arithmetic in L3
// is formalised, but +/* on numbers is intuitive enough to introduce assignment).
const VARIABLES_LAB_STARTER = `# A box holds 12 apples per crate. You have 4 crates.
# 1. Store the apples-per-crate in a variable called  per_crate
# 2. Store the number of crates in a variable called  crates
# 3. Store the TOTAL apples (per_crate times crates) in a variable called  total
# 4. Print  total  on its own line.

# your code here
`

const variablesBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Store a value in a named variable, change it by reassigning, and use a variable in a calculation — so your programs can remember and reuse values instead of repeating them.',
    intensity: 'micro',
    time: '20–30 min',
    proof: 'A program that stores a computed total in a variable and prints it — the right number appears in the output.',
    unlock: 'Your variable holds the correct value and your program prints it.',
    doNotClaim:
      "Don't claim you \"understand variables\" until your program has STORED a value in a name and used that name again later — not just printed a number directly.",
  },
  {
    type: 'mission',
    text: 'In Lesson 1 you printed a line — then the computer forgot it instantly. Real programs remember: a score that climbs, a total built from parts. Today you give a value a name you can hold onto and reuse.',
  },
  {
    type: 'context',
    text: 'A variable is the most-used thing in all of programming — every score, total, and result lives in one. Master "store under a name, then use the name" and every later topic is just variables being read and changed.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: you write  score = 0  and later  score = 10. After both lines run, what is in  score — 0, 10, or both?',
    reveal:
      'It is 10. A variable holds ONE value at a time — the most recent one assigned to it. The second line replaces the first; the 0 is gone. A variable is a labelled box, not a list of everything ever put in it. This "the latest value wins" rule is exactly what lets a score go up or a total change as your program runs.',
  },
  {
    type: 'concept',
    title: 'A variable is a name that holds a value',
    text: 'Create one with assignment: name = value. The single = stores the right side into the name on the left (not math "equals"). Use the name to read its current value; assign again and the new value replaces the old.',
  },
  {
    type: 'code-walkthrough',
    title: 'Store, read, then reassign',
    subtitle: 'Watch the name follow its latest value as each line runs.',
    filename: 'variables.py',
    language: 'python',
    code: `price = 20          # store 20 under the name "price"
print(price)        # use the name -> shows 20
price = price - 5   # compute the right side, store it back
print(price)        # the name now holds 15 -> shows 15`,
    steps: [
      { lines: [1], label: 'Assignment stores a value', note: 'price = 20 puts the value 20 into the name price. The single = means "store", not "is equal to".' },
      { lines: [2], label: 'Read by using the name', note: 'print(price) substitutes the current value of price → shows 20.' },
      { lines: [3], label: 'Right side first, then store', note: 'Compute 20 - 5 = 15, THEN store 15 back into price. The old 20 is replaced — a variable holds only its latest value.' },
      { lines: [4], label: 'Same name, new value', note: 'print(price) now shows 15. The name followed the latest assignment.' },
    ],
    caption: 'price = price - 5 is a command, not a claim that price equals price minus five.',
  },
  {
    type: 'diagram',
    title: 'Assignment: a labelled box',
    subtitle: 'The right side is computed, then dropped into the box on the left. Reading the name reads the box.',
    rankdir: 'LR',
    nodes: [
      { id: 'value', label: 'per_box * boxes', description: 'compute the right side first', kind: 'process', tone: 'accent' },
      { id: 'box', label: 'total_eggs', description: 'the named box (the variable)', kind: 'store', tone: 'success' },
      { id: 'read', label: 'print(total_eggs)', description: 'read the box by its name', kind: 'process' },
    ],
    edges: [
      { from: 'value', to: 'box', label: 'store with =', kind: 'data', tone: 'accent' },
      { from: 'box', to: 'read', label: 'substitutes 18', kind: 'data', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'the value being stored' },
      { tone: 'success', label: 'the variable that holds it' },
    ],
  },
  {
    type: 'compare',
    title: 'Cryptic names vs meaningful names',
    subtitle: 'Same calculation, two ways to name it. One reads itself.',
    mono: true,
    left: {
      label: 'Cryptic',
      tone: 'warning',
      lines: ['p = 6', 'b = 3', 't = p * b', '# what is t? scroll back to find out'],
      verdict: 'Forces the next reader to reconstruct meaning',
    },
    right: {
      label: 'Meaningful',
      tone: 'success',
      lines: ['per_box = 6', 'boxes = 3', 'total_eggs = per_box * boxes', '# the line explains itself'],
      verdict: 'Name the value for its meaning',
    },
    caption: 'lowercase with underscores between words (per_box, max_score) — a name is the cheapest documentation you write.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Pros treat a variable name as the cheapest documentation they will ever write. total_eggs explains itself; t and x force the next reader (usually future-you, at 11pm, debugging) to scroll back and reconstruct what it meant. The rule working programmers follow: name the value for its MEANING, lowercase with underscores between words. A good name is not neatness — it is how code stays readable long after you have forgotten writing it.',
  },
  {
    type: 'lab',
    title: 'Store a total and print it',
    summary:
      'A crate holds 12 apples. You have 4 crates. Store 12 in a variable per_crate, store 4 in crates, then store per_crate times crates in a variable called total, and print total. The output should be a single line: 48. Use the variable names in your calculation — do not just print 48 directly.',
    language: 'python',
    starter: VARIABLES_LAB_STARTER,
    check: '48',
  },
  {
    type: 'debug',
    symptom: 'This program should print the final score (start 5, then add 3), but it prints the wrong number.',
    language: 'python',
    brokenCode: `score = 5
score + 3        # meant to add 3 to the score
print(score)     # prints 5, not 8`,
    task: 'Find why the 3 never sticks.',
    fix: 'The line  score + 3  computes 8 but throws it away — nothing stores the result back. To change a variable you must assign the new value to it:  score = score + 3. Now the right side (5 + 3 = 8) is stored back into score, and print(score) shows 8.',
  },
  {
    type: 'quiz',
    question: 'After these three lines run — count = 1, then count = count + 1, then count = count + 1 — what does print(count) show?',
    options: [
      '1 — assignment only happens once',
      '2 — only the last line counts',
      '3 — each line takes the current value and adds one, storing it back',
      'Error — you can\'t use count on both sides of =',
    ],
    answer: 2,
    explanation:
      'Each  count = count + 1  reads the current value, adds one, and stores the result back. So 1 → 2 → 3. Using a variable on both sides is normal and useful: it is how you grow a counter, a score, or a running total step by step.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'You created variables with  name = value  (assignment), not just printed raw numbers',
      'You used a variable in a calculation (e.g. per_crate * crates)',
      'The stored total is correct and your program prints it (output: 48)',
      'You can explain that = means "store the right side into the name on the left", not "is equal to"',
      'You reassigned a variable at least once and saw the latest value win',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In one sentence, what is a variable?',
      'What does the single = actually do, and how is it different from math "equals"?',
      'When you write  score = score + 1, what gets stored, and where does it come from?',
      'Why does a good variable name save you time later?',
    ],
  },
  {
    type: 'transfer',
    text: 'In the lab, model something from your own life: store a price in a variable, store a quantity, compute and print the total. Then reassign the quantity to a bigger number, re-run, and watch the total update. That "change an input, the result follows" is the heartbeat of every program you will build.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
]

// ================================================================= LESSON 3
// "Numbers & Strings: The Everyday Types" — int/float/str, arithmetic, f-strings,
// str/int conversion. Sets up the later type & input-validation lessons (Module 2).
// New ideas vs L2: values have TYPES; + means different things by type; convert
// with int()/str(); build text from values with an f-string. Still NO functions,
// NO loops, NO error handling (those arrive in Module 2).
const NUMBERS_STRINGS_LAB_STARTER = `# You are building one line of a receipt.
#   item   = "Coffee"     (text)
#   price  = 4            (a whole number, an int)
#   qty    = 3            (a whole number, an int)
# Compute the total (price times qty) and build EXACTLY this line, then print it:
#   Coffee x3 = $12
# Use an f-string:  f"...{qty}...{total}..."  to drop the numbers into the text.

item = "Coffee"
price = 4
qty = 3
# your code here
`

const numbersStringsBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Tell numbers and text apart, do arithmetic on numbers, convert between text and numbers when you need to, and build a clean formatted line by dropping values into text with an f-string.',
    intensity: 'standard',
    time: '30–40 min',
    proof: 'A program that combines numbers and text into one exact formatted line and prints it.',
    unlock: 'Your line matches the required output exactly, with the numbers computed (not hardcoded into the text).',
    doNotClaim:
      "Don't claim you \"get types\" until you've seen with your own eyes that \"2\" + \"3\" is \"23\" but 2 + 3 is 5 — the difference is the whole lesson.",
  },
  {
    type: 'mission',
    text: 'In Lesson 2 you added numbers and it just worked. So this will rattle you: add two quantities and get "23" instead of 5 — because your values have a hidden property called a type, and text and numbers obey different rules under the same + sign.',
  },
  {
    type: 'context',
    text: 'Every value has a type, and the type decides what an operation means: numbers add, text joins. Input from forms, files, and the keyboard arrives as TEXT even when it looks like a number — so telling them apart and converting is foundational.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: what do you think  "2" + "3"  gives — and what does  2 + 3  give? Are they the same?',
    reveal:
      '2 + 3 is 5 (numbers add). But "2" + "3" is "23" — with quotes they are TEXT, and + on text means "join end to end" (concatenation), not "add". Same symbol, different meaning, decided entirely by the TYPE of the values. Text that looks like a number is still text until you convert it.',
  },
  {
    type: 'concept',
    title: 'Values have types: int, float, and str',
    text: 'int is a whole number (4); float has a decimal (3.14); str is text in quotes ("4"). The type decides what + means — numbers add, strings join. Convert deliberately: int("4") gives 4; str(4) gives "4".',
  },
  {
    type: 'compare',
    title: 'The same + sign, two meanings',
    subtitle: 'The TYPE of the values decides what + does. This is the whole lesson.',
    mono: true,
    left: {
      label: 'Strings — joins',
      tone: 'warning',
      lines: ['"2" + "3"', 'both are text (in quotes)', '+ on text glues end to end', 'result: "23"'],
      verdict: 'Concatenation, not addition',
    },
    right: {
      label: 'Numbers — adds',
      tone: 'success',
      lines: ['2 + 3', 'both are int (no quotes)', '+ on numbers does arithmetic', 'result: 5'],
      verdict: 'Real addition',
    },
    caption: '"4" with quotes is text; 4 without is a number. They look alike and behave completely differently.',
  },
  {
    type: 'code-walkthrough',
    title: 'Compute on numbers, format with an f-string',
    subtitle: 'Do the math first, then drop the values into text with { }.',
    filename: 'receipt.py',
    language: 'python',
    code: `price = 4
qty = 3
total = price * qty          # numbers -> arithmetic -> 12 (an int)

line = f"Total for {qty} items: \${total}"
print(line)                  # -> Total for 3 items: $12`,
    steps: [
      { lines: [1, 2], label: 'These are numbers (int)', note: 'No quotes, so price and qty are ints — ready for arithmetic.' },
      { lines: [3], label: 'Multiply the numbers', note: 'price * qty does real multiplication → 12, an int.' },
      { lines: [5], label: 'An f-string starts with f', note: 'The f before the opening quote turns on substitution; anything in { } is evaluated and dropped in.' },
      { lines: [5], label: 'Only the { } parts get replaced', note: '{qty} → 3, {total} → 12. The dollar sign and words are plain text. Numbers become text automatically here.' },
      { lines: [6], label: 'Print the finished line', note: 'Output: Total for 3 items: $12 — numbers computed, then formatted.' },
    ],
    caption: 'Joining a number to text with + (like "Total: " + total) errors — use an f-string, which converts for you.',
  },
  {
    type: 'diagram',
    title: 'Converting across the type boundary',
    subtitle: 'Text that looks numeric is str until int() crosses it over; str() crosses a number back to text.',
    rankdir: 'LR',
    nodes: [
      { id: 'str', label: '"25"', description: 'str — from a form/keyboard', kind: 'store', tone: 'warning' },
      { id: 'toint', label: 'int("25")', description: 'parse text to a number', kind: 'process', tone: 'accent' },
      { id: 'num', label: '25', description: 'int — arithmetic works', kind: 'store', tone: 'success' },
      { id: 'tostr', label: 'str(25)', description: 'number back to text', kind: 'process', tone: 'accent' },
    ],
    edges: [
      { from: 'str', to: 'toint', label: 'convert', kind: 'data' },
      { from: 'toint', to: 'num', label: 'now 25 + 1 = 26', kind: 'data', tone: 'success' },
      { from: 'num', to: 'tostr', label: 'convert', kind: 'data' },
      { from: 'tostr', to: 'str', label: 'now joins with +', kind: 'data' },
    ],
    legend: [
      { tone: 'warning', label: 'text (str) — joins under +' },
      { tone: 'success', label: 'number (int) — adds under +' },
      { tone: 'accent', label: 'a deliberate conversion' },
    ],
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Reach for an f-string whenever you mix text and values: f"{name} scored {points}". It is cleaner and less error-prone than gluing pieces with + and str(), and it makes the final line obvious at a glance. Just remember the leading f — without it, the { } show up literally as characters.',
  },
  {
    type: 'lab',
    title: 'Build a receipt line',
    summary:
      'You have item = "Coffee", price = 4, qty = 3. Compute total = price * qty (do NOT hardcode 12), then build and print EXACTLY this line using an f-string: Coffee x3 = $12. The numbers must come from your variables, dropped in with { }.',
    language: 'python',
    starter: NUMBERS_STRINGS_LAB_STARTER,
    check: 'Coffee x3 = $12',
  },
  {
    type: 'debug',
    symptom: 'This is supposed to add two quantities and show 5, but it prints 23.',
    language: 'python',
    brokenCode: `a = "2"          # came from a form, so it's text
b = "3"
print(a + b)     # meant to add -> prints "23", not 5`,
    task: 'Find why it joins instead of adds.',
    fix: 'a and b are strings ("2" and "3"), and + on strings joins them → "23". They look like numbers but they are text. Convert each to an int first, then add:  print(int(a) + int(b))  → 5. Form and keyboard input is text; convert before you do math.',
  },
  {
    type: 'quiz',
    question: 'A value typed into a form arrives as  age = "25". What does  age + 1  do?',
    options: [
      'Gives 26 — Python sees a number',
      'Gives "251" — it joins 1 onto the text',
      'Raises an error — you can\'t add text and a number',
      'Gives 25 — the 1 is ignored',
    ],
    answer: 2,
    explanation:
      'age is the text "25", and you cannot + a string and an int — Python stops with an error. Convert first: int(age) + 1 gives 26. This is exactly why later lessons convert input at the boundary before doing anything numeric with it.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'You can state the type of 4 (int), 4.0 (float), and "4" (str)',
      'You computed total with arithmetic on numbers (price * qty), not by typing 12 into the text',
      'Your output line is EXACTLY:  Coffee x3 = $12',
      'You built the line with an f-string, dropping the numbers in with { }',
      'You saw the difference firsthand: "2" + "3" joins to "23", but 2 + 3 adds to 5',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Name the three everyday types and give one example of each.',
      'Why does + do different things to "2" + "3" versus 2 + 3?',
      'When would you use int(...) and when would you use str(...)?',
      'What does the f in f"..." turn on, and what do the { } do?',
    ],
  },
  {
    type: 'transfer',
    text: 'In the lab, build a one-line summary about yourself by mixing types: a name (str), an age or a count (int), maybe a height (float), combined into one sentence with an f-string. Then take a number that arrived as text (like "5"), convert it with int(), and use it in a calculation. You have just done the core move behind handling any real-world input.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
]

// ================================================================= LESSON 4
// "Reading Input: Make the Program Listen" — input() reads a typed line as a
// STRING (here from the lab's provided stdin); convert with int()/float() to do
// math. New idea vs L3: the program can RECEIVE data from outside instead of
// only working with values you hardcode. Beginner-correct: uses ONLY print (L1),
// variables (L2), strings/types/int()/f-strings (L3). NO if/lists/loops/functions
// (those start next lesson). Forward pull: soon the program will DECIDE based on
// what it reads (Booleans, L5).
//
// LAB MECHANICS: the runner feeds the lab's `stdin` (newline-separated) to
// input() in order; input() returns the next line each call, and '' at EOF. The
// prompt argument is NOT echoed to stdout, so `check` must equal exactly what the
// program PRINTS — not the prompts. Verified in real Python:
//   stdin "Sam\n3"  ->  correct solution prints  "Sam, you have 3 items."
const READING_INPUT_LAB_STARTER = `# This program will read TWO lines the user "types" (provided for you below):
#   line 1 = a name        (e.g. Sam)
#   line 2 = a number of items (e.g. 3)
# 1. Read the name with  input()  into a variable  name  (it comes in as text).
# 2. Read the next line with  input(), convert it with  int(), into  count.
# 3. Print EXACTLY this line, using an f-string:
#       Sam, you have 3 items.
# (input() hands you each line in order; the count must be a real number.)

# your code here
`

const readingInputBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Make your program RECEIVE data instead of only using values you typed in: read a line with input(), convert it to a number with int() when you need to do math, and print an exact line built from what you read.',
    intensity: 'standard',
    time: '25–35 min',
    proof: 'A program that reads a name and a count from input, then prints one exact formatted line built from both — the numbers used as numbers, not text.',
    unlock: 'Your program reads the provided input and prints the exact required line, with the count converted to a real number.',
    doNotClaim:
      "Don't claim you \"read input\" until your program has taken a line from input(), converted the numeric one with int(), and printed the exact line built from BOTH — printing a value you hardcoded is not reading input.",
  },
  {
    type: 'mission',
    text: 'Every program you have written already knew its answer — you typed it in. A real program does not know who is using it; it has to ask. Today your program stops talking to itself and starts listening.',
  },
  {
    type: 'context',
    text: 'Reading input is the front door of almost every program — a login form, a search box, a number from a file. The shape is always the same: pull in a value, convert it (input arrives as TEXT), then use it.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: a user types  3  and you read it with  count = input(). You then write  count + 1  to get 4. What actually happens?',
    reveal:
      'It does NOT give 4 — it errors. input() ALWAYS hands back text, so count is the string "3", not the number 3. And you cannot add a number to text, so  "3" + 1  stops with a TypeError. This is the catch that gets every beginner: a thing that LOOKS like a number on screen is still text until you convert it. Wrap it in int() first — count = int(input()) — and then count + 1 is 4. Read as text, convert before you do math.',
  },
  {
    type: 'concept',
    title: 'input() reads a line as text; convert with int() to get a number',
    text: 'input() reads one line the user provides and hands it back as a string — always text. Convert when you need a number: int(input()) turns "3" into 3. It is the "2" vs 2 type difference from Lesson 3, at the boundary.',
  },
  {
    type: 'code-walkthrough',
    title: 'Read · convert · use',
    subtitle: 'Two lines come in as text; only the numeric one is converted. Watch where int() goes.',
    filename: 'reading_input.py',
    language: 'python',
    code: `name = input()              # reads a line -> text, e.g. "Sam"
age_text = input()          # reads the next line -> text, e.g. "30"
age = int(age_text)         # convert that text to a real number -> 30

print(f"Hi {name}, next year you turn {age + 1}.")`,
    steps: [
      { lines: [1], label: 'First input() → text', note: 'Reads one line and returns it as a string; name becomes "Sam". The prompt argument, if any, is just a hint — not part of the value.' },
      { lines: [2], label: 'Second input() → next line', note: 'Each call reads the NEXT line in order; age_text becomes the text "30".' },
      { lines: [3], label: 'Convert the numeric one', note: 'int(age_text) crosses the text "30" into the number 30, stored in age.' },
      { lines: [5], label: 'Now arithmetic works', note: 'Because age is a real number, age + 1 → 31 (on text it would error). The f-string drops name and 31 into the sentence.' },
    ],
    caption: 'int(input()) is right; int(input() + 1) errors — it tries to + text and a number BEFORE converting. Convert first, then compute.',
  },
  {
    type: 'diagram',
    title: 'Input crosses the boundary as text',
    subtitle: 'Outside the program everything is text. Convert at the door, then the rest of the program can trust real numbers.',
    rankdir: 'LR',
    nodes: [
      { id: 'user', label: 'User types 3', description: 'outside the program', kind: 'external', tone: 'muted' },
      { id: 'input', label: 'input()', description: 'reads the line', kind: 'process' },
      { id: 'str', label: '"3"', description: 'str — even though it looks numeric', kind: 'store', tone: 'warning' },
      { id: 'int', label: 'int(...)', description: 'convert at the boundary', kind: 'process', tone: 'accent' },
      { id: 'num', label: '3', description: 'int — ready for math', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'user', to: 'input', label: 'one line', kind: 'async' },
      { from: 'input', to: 'str', label: 'always text', kind: 'data', tone: 'warning' },
      { from: 'str', to: 'int', label: 'convert now', kind: 'data', tone: 'accent' },
      { from: 'int', to: 'num', label: 'count + 1 = 4', kind: 'data', tone: 'success' },
    ],
    legend: [
      { tone: 'warning', label: 'text as it arrives' },
      { tone: 'accent', label: 'convert at the door' },
      { tone: 'success', label: 'a real number, trusted downstream' },
    ],
  },
  {
    type: 'compare',
    title: 'Math on raw input vs convert first',
    subtitle: 'The user types 3. Adding 1 should give 4 — only one version does.',
    mono: true,
    left: {
      label: 'Raw input — crashes',
      tone: 'warning',
      lines: ['count = input()        # "3", a string', 'count + 1', '# cannot + text and a number', 'TypeError'],
      verdict: 'Input is still text',
    },
    right: {
      label: 'Convert at the boundary',
      tone: 'success',
      lines: ['count = int(input())   # 3, a number', 'count + 1', '# real arithmetic', 'result: 4'],
      verdict: 'Convert the FIRST thing you do',
    },
    caption: 'int(input()) is right; int(input() + 1) errors — it + text and a number before converting. Convert first, then compute.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Pros convert input the instant it arrives, right at the boundary — count = int(input()) on one line — not three lines later when they have forgotten it is still text. The bug that bites beginners is letting a "number" travel through the program as a string and only exploding when they finally try to add it. Make the conversion the FIRST thing you do with numeric input. (If the user types something that is not a number, int() will error — handling that gracefully is a Foundations lesson; for now, trust the input.)',
  },
  {
    type: 'lab',
    title: 'Read a name and a count',
    summary:
      'The program is given two input lines: a name (Sam) on the first line and a number (3) on the second. Read the name with input() into name, read the next line and convert it with int() into count, then print EXACTLY this line with an f-string: Sam, you have 3 items. The count must be read from input and converted — do not hardcode the name or the number.',
    language: 'python',
    starter: READING_INPUT_LAB_STARTER,
    stdin: 'Sam\n3',
    check: 'Sam, you have 3 items.',
  },
  {
    type: 'debug',
    symptom: 'This should read a count and print "You have 4 items." (3 typed, plus 1), but it crashes with a TypeError instead.',
    language: 'python',
    brokenCode: `count = input()              # the user typed 3
print(f"You have {count + 1} items.")   # meant to add 1 -> errors`,
    task: 'Find why adding 1 to the count crashes.',
    fix: 'input() returns TEXT, so count is the string "3", not the number 3 — and  "3" + 1  cannot add a number to text, so Python raises a TypeError. Convert the input to a number first:  count = int(input()). Now count is the real number 3, count + 1 is 4, and the line prints "You have 4 items." Numeric input must be passed through int() before you do any math with it.',
  },
  {
    type: 'quiz',
    question: 'A program does  age = input()  and the user types  25. What is the type and value of  age, and what does  age + age  produce?',
    options: [
      'age is the number 25; age + age is 50',
      'age is the text "25"; age + age is "2525" (text joins, it does not add)',
      'age is the number 25; age + age errors',
      'age is the text "25"; age + age is 50',
    ],
    answer: 1,
    explanation:
      'input() always returns a string, so age is the text "25", not the number 25. And + on text joins (concatenates), so age + age is "2525", exactly like "2" + "3" was "23" in Lesson 3. To add the numbers you must convert first: int(age) + int(age) gives 50. Input is text until you convert it.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'Your program reads its values with input() — it does not hardcode the name or the number',
      'You converted the numeric input with int() (not left it as text)',
      'You built the output with an f-string, dropping name and count in with { }',
      'Your output is EXACTLY:  Sam, you have 3 items.',
      'You can explain why input() gives back text, and why count needs int() before any math',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In one sentence, what does input() do, and what TYPE does it always return?',
      'Why must you usually wrap numeric input in int() (or float()) before using it?',
      'What is the prompt argument in input("Name? "), and is it part of the value you get back?',
      'How does this connect to the "2" + "3" vs 2 + 3 lesson from Numbers & Strings?',
    ],
  },
  {
    type: 'transfer',
    text: 'In the lab, make the program ask for something real: read a person’s name and their age, convert the age with int(), and print a line that uses the age in a calculation (years until they turn 100, say). Then change the provided input and re-run — watch the SAME program produce a new, correct answer for new data. That is the leap from a program that knows its answer to one that works for anyone. Next, your program will look at what it read and DECIDE — greet differently, allow or deny, grade the number — which is exactly what Booleans & Decisions is for.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
]

// ================================================================= LESSON 5
// "Booleans & Decisions" — True/False, comparisons, and/or/not, if/elif/else.
// New idea vs L4: a program can CHOOSE a path. Until now every line ran. Now a
// block runs only when a condition is True. Uses ONLY variables, numbers,
// strings, print, input (all taught). Introduces booleans + if/elif/else here for
// the first time. Still NO loops, NO lists, NO functions.
const BOOLEANS_LAB_STARTER = `# A score is stored for you below.
# Print EXACTLY ONE line, decided by the score:
#   score >= 90            -> print  Grade: A
#   score >= 70 (but < 90) -> print  Grade: B
#   anything below 70      -> print  Grade: C
# Use if / elif / else. Do NOT print more than one line.

score = 84
# your code here
`

const booleansBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Make your program CHOOSE: compare values to get a True/False answer, combine conditions with and/or/not, and run different code with if / elif / else so the program reacts instead of always doing the same thing.',
    intensity: 'standard',
    time: '30–40 min',
    proof: 'A program that prints ONE of several exact lines depending on a value — change the value, and a different (correct) branch runs.',
    unlock: 'Your program prints exactly the right line for the value it is given, via if / elif / else.',
    doNotClaim:
      "Don't claim you \"understand if\" until you've run the SAME program with two different values and watched it take two different branches — one correct line each time.",
  },
  {
    type: 'mission',
    text: 'Until now every line ran, every time, in lockstep. Real programs decide: pass or fail, in stock or sold out, logged in or kicked out. Today you hand your program a fork in the road.',
  },
  {
    type: 'context',
    text: 'Every app you use is built on decisions: show this if the password matches, warn if the field is empty. The skill is turning a question into a True/False value, then branching on it.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: you write  if age >= 18:  and age is 18. Does the line inside the if run — and is  age >= 18  asking a question or storing a value?',
    reveal:
      'It runs. age >= 18 is a question — "is age at least 18?" — and it answers with a boolean: True or False. Here 18 >= 18 is True, so the indented block runs. Note >= uses two characters and includes "equal to", so 18 counts. A comparison does NOT store anything; it produces a True/False answer that if then acts on. That answer — that yes/no value — is the whole idea today.',
  },
  {
    type: 'concept',
    title: 'Comparisons make booleans; if / elif / else branch on them',
    text: 'A comparison (==, !=, <, >, <=, >=) produces a boolean: True or False. if runs its block when its condition is True; elif checks the next only if earlier ones were False; else catches the rest. Python takes the FIRST True branch.',
  },
  {
    type: 'code-walkthrough',
    title: 'One value picks exactly one branch',
    subtitle: 'Read it top to bottom, the way Python does — the first True condition wins.',
    filename: 'decide.py',
    language: 'python',
    code: `temp = 50

if temp > 85:
    print("Hot")          # skipped: 50 > 85 is False
elif temp >= 60:
    print("Comfortable")  # skipped: 50 >= 60 is False
else:
    print("Cold")         # runs: nothing above matched -> Cold`,
    steps: [
      { lines: [1], label: 'The value under test', note: 'temp is 50. Python will check each condition against it in order.' },
      { lines: [3, 4], label: 'Check the if first', note: 'temp > 85 → 50 > 85 → False, so this block is skipped entirely.' },
      { lines: [5, 6], label: 'Then the elif', note: 'Only checked because the if was False. temp >= 60 → 50 >= 60 → False, so skipped too.' },
      { lines: [7, 8], label: 'else catches the rest', note: 'Nothing above matched, so else runs and prints Cold. Change temp to 90 and the very first branch wins instead.' },
    ],
    caption: 'Exactly ONE branch runs — the first True one, or else if none are True.',
  },
  {
    type: 'diagram',
    title: 'How if / elif / else flows',
    subtitle: 'Conditions are checked top to bottom; the first True branch runs and the rest are skipped.',
    rankdir: 'LR',
    nodes: [
      { id: 'q1', label: 'temp > 85 ?', description: 'the if', kind: 'decision', tone: 'accent' },
      { id: 'hot', label: 'print Hot', description: 'if-branch', kind: 'process' },
      { id: 'q2', label: 'temp >= 60 ?', description: 'the elif', kind: 'decision', tone: 'accent' },
      { id: 'comf', label: 'print Comfortable', description: 'elif-branch', kind: 'process' },
      { id: 'cold', label: 'print Cold', description: 'else — the catch-all', kind: 'process', tone: 'success' },
    ],
    edges: [
      { from: 'q1', to: 'hot', label: 'True', kind: 'control', tone: 'success' },
      { from: 'q1', to: 'q2', label: 'False', kind: 'control', tone: 'warning' },
      { from: 'q2', to: 'comf', label: 'True', kind: 'control', tone: 'success' },
      { from: 'q2', to: 'cold', label: 'False', kind: 'control', tone: 'warning' },
    ],
    legend: [
      { tone: 'accent', label: 'a comparison → True/False' },
      { tone: 'success', label: 'the branch that runs' },
      { tone: 'warning', label: 'condition was False — move on' },
    ],
  },
  {
    type: 'compare',
    title: '= stores, == asks',
    subtitle: 'The single most common condition bug. One equals is not the other.',
    mono: true,
    left: {
      label: 'Single = — error',
      tone: 'warning',
      lines: ['if temp = 50:', '= means "store 50 into temp"', 'you cannot store inside an if', 'SyntaxError'],
      verdict: 'A store, not a question',
    },
    right: {
      label: 'Double == — asks',
      tone: 'success',
      lines: ['if temp == 50:', '== asks "are these equal?"', 'produces True or False', 'the if can act on it'],
      verdict: 'A real comparison',
    },
    caption: 'One equals stores, two equals asks. Combine conditions with and (both True), or (either True), not (flip).',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Three small words let one condition build on another. and needs BOTH sides True: if name == "sage" and code == 1234: signs you in only when the name AND the code are right. or needs EITHER side True: if day == "Sat" or day == "Sun": catches the whole weekend. not flips a value: not is_raining is True exactly when is_raining is False. Each one takes True/False values and produces a single True/False your if can act on — try one in the lab by combining two comparisons with and.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'In most languages, curly braces { } mark what is "inside" a branch. Python deletes the braces and uses the indentation itself — which means in Python, whitespace is not style, it is syntax. The colon at the end of the line opens the branch; the four-space indent underneath says "these lines belong to it." A stray colon or a wrong indent does not look wrong, but it silently puts code in the wrong branch. When an if misbehaves, check the colon and the indentation before anything else.',
  },
  {
    type: 'lab',
    title: 'Grade the score',
    summary:
      'A variable score is set to 84. Print EXACTLY ONE line: Grade: A if score is 90 or above, Grade: B if it is 70 to 89, and Grade: C if it is below 70. Use if / elif / else so only one line prints. For score = 84 the correct output is the single line: Grade: B.',
    language: 'python',
    starter: BOOLEANS_LAB_STARTER,
    check: 'Grade: B',
  },
  {
    type: 'debug',
    symptom: 'This should print Adult for age 20, but pressing Run gives a SyntaxError instead.',
    language: 'python',
    brokenCode: `age = 20
if age = 18:
    print("Adult")`,
    task: 'Find why this if does not work.',
    fix: 'The condition uses a single =, which means "store 18 into age" — but you cannot store inside an if, so Python errors. A condition must ASK a question, which needs a comparison. Here you want "is age at least 18?", so write  if age >= 18:. (A single == would test "exactly 18"; >= is the right test for "adult".) Now the block runs and prints Adult.',
  },
  {
    type: 'quiz',
    question: 'With  x = 5, what does this print?  if x > 10: print("big")  elif x > 3: print("medium")  else: print("small")',
    options: [
      'big — the first branch always runs',
      'medium — x > 10 is False, but x > 3 is True, and it is the first True branch',
      'small — none of the conditions are True',
      'medium and small — every matching branch runs',
    ],
    answer: 1,
    explanation:
      'Python checks top to bottom and runs the FIRST branch whose condition is True. x > 10 is False (5 is not over 10), x > 3 is True (5 is over 3), so it prints medium and stops — the else is never reached. Only one branch ever runs.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'You used a comparison (==, !=, <, >, <=, or >=) to produce a True/False answer',
      'You wrote if / elif / else with a colon on each line and the body indented underneath',
      'Your program printed EXACTLY one line for the given value (Grade: B for score 84)',
      'You changed the value at least once, re-ran, and watched a DIFFERENT correct branch run',
      'You can explain why == (compare) is not the same as = (store)',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In one sentence, what is a boolean?',
      'What is the difference between = and == , and what happens if you use = in a condition?',
      'When Python has an if, an elif, and an else, how does it decide which block runs?',
      'What do and / or / not each do to True/False values?',
    ],
  },
  {
    type: 'transfer',
    text: 'In the lab, model a real rule from your life as a decision: a budget check (print "Over budget" or "OK"), a sign-in check (right name AND right code with and), or a weather call. Set the input value, run it, then change the value so a different branch wins. Making a program react to its input is the core of every interactive thing you will ever build.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
]

// ================================================================= LESSON 6
// "Lists: Hold Many Values at Once" — create, index [0], len(), append(),
// membership (in). New idea vs L5: one name can hold MANY values in order. Uses
// variables/numbers/strings/print/input/if (all taught). Indexing + a method call
// are introduced, but NO loops (next lesson) and NO functions yet.
const LISTS_LAB_STARTER = `# Below is a list of three cart items.
# 1. Add  "eggs"  to the END of the list (use .append).
# 2. Print the FIRST item in the list (index 0).
# 3. Print how many items are in the list now (use len()).
# Expected output, two lines:
#   milk
#   4

cart = ["milk", "bread", "apples"]
# your code here
`

const listsBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Hold many values under one name with a list: create one, read an item by its position, measure it with len(), add to it with append(), and ask whether something is in it.',
    intensity: 'standard',
    time: '30–40 min',
    proof: 'A program that builds or modifies a list and prints a required value from it (a specific item and the list’s length).',
    unlock: 'Your list contains the right items and your program prints the correct value(s) from it.',
    doNotClaim:
      "Don't claim you \"know lists\" until you've read an item by its index AND changed the list’s length with append, then printed both — not just typed a list literal.",
  },
  {
    type: 'mission',
    text: 'Every variable so far holds one value — useless for fifty. Nobody writes score1, score2 … score50. A list lets one name hold a whole sequence in order: grow it, read any slot, count it.',
  },
  {
    type: 'context',
    text: 'A todo app holds a list of tasks; a cart a list of items; a chart a list of numbers. Lists are how programs handle "many of something" — and next lesson, loops act on every item at once.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: you have  fruits = ["apple", "banana", "cherry"]. Which one does  fruits[0]  give you — and why might that surprise you?',
    reveal:
      'fruits[0] is "apple" — the FIRST item. Positions (indexes) start at 0, not 1: index 0 is the first, 1 is the second, 2 is the third. So the last item of a 3-item list is at index 2, not 3. Counting from zero trips up every beginner once; after that it is automatic. The number in the [ ] is "how many steps from the start", and the start is zero steps away.',
  },
  {
    type: 'concept',
    title: 'A list holds many values in order, reachable by index',
    text: 'Write values in square brackets: scores = [90, 75, 88]. Reach one by index (starting at 0): scores[0] is 90. Count with len(scores). Grow with scores.append(100) — it changes the list in place. Test membership with 75 in scores.',
  },
  {
    type: 'diagram',
    title: 'A list is slots numbered from zero',
    subtitle: 'Each value sits in a numbered slot. The index is "steps from the start" — and the start is zero steps away.',
    rankdir: 'LR',
    nodes: [
      { id: 'i0', label: 'Ann', description: 'index 0 — first', kind: 'store', tone: 'accent' },
      { id: 'i1', label: 'Ben', description: 'index 1', kind: 'store' },
      { id: 'i2', label: 'Cy', description: 'index 2 — last (len - 1)', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'i0', to: 'i1', label: 'next', kind: 'data' },
      { from: 'i1', to: 'i2', label: 'next', kind: 'data' },
    ],
    legend: [
      { tone: 'accent', label: 'names[0] — the first item' },
      { tone: 'success', label: 'names[-1] — always the last item' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'Build · read · measure · grow',
    subtitle: 'Watch the length change as the list grows in place.',
    filename: 'lists.py',
    language: 'python',
    code: `names = ["Ann", "Ben"]   # a list of two strings, in order
print(names[0])          # index 0 = the first item -> Ann
print(len(names))        # how many items -> 2

names.append("Cy")       # add "Cy" to the END (changes names in place)
print(len(names))        # the list grew -> 3
print(names[2])          # the new last item is at index 2 -> Cy`,
    steps: [
      { lines: [1], label: 'Create with [ ]', note: 'Two items in order: "Ann" at index 0, "Ben" at index 1.' },
      { lines: [2], label: 'Read by index', note: 'names[0] reads position 0 → "Ann". Indexes start at zero.' },
      { lines: [3], label: 'Count with len()', note: 'len(names) → 2, the number of items.' },
      { lines: [5], label: 'append grows it in place', note: 'The dot means append is something the list does to itself; it adds "Cy" to the END and changes the list — it does not return a new one.' },
      { lines: [6, 7], label: 'The list is now longer', note: 'len(names) → 3, and names[2] (the new last slot) is "Cy". The last valid index is always len - 1.' },
    ],
    caption: 'names[3] on a 3-item list errors ("list index out of range") — valid indexes are 0, 1, 2.',
  },
  {
    type: 'compare',
    title: 'Index from the front vs from the end',
    subtitle: 'Two ways to grab the last item of a list. One breaks when the length changes.',
    mono: true,
    left: {
      label: 'Hardcoded position — fragile',
      tone: 'warning',
      lines: ['colors = ["red", "blue", "green"]', 'colors[3]  # guessing the last index', 'list has indexes 0, 1, 2 only', 'IndexError: list index out of range'],
      verdict: 'Breaks the moment the length changes',
    },
    right: {
      label: 'Negative index — robust',
      tone: 'success',
      lines: ['colors = ["red", "blue", "green"]', 'colors[-1]  # count from the end', '-1 is always the final item', 'result: green'],
      verdict: 'Always the last, whatever the length',
    },
    caption: 'For "the last one", list[-1] beats guessing the number. Use "in" to test membership: "milk" in cart.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Indexes start at 0, so the last item is at len(list) - 1, never len(list). If a list has 5 items, the valid indexes are 0 through 4 — asking for [5] errors. When you want "the last one", a clean trick is list[-1]: negative indexes count from the end, so [-1] is always the final item no matter how long the list is.',
  },
  {
    type: 'lab',
    title: 'Grow a cart and read it',
    summary:
      'Start with cart = ["milk", "bread", "apples"]. Append "eggs" to the end with cart.append("eggs"), then print the first item with cart[0], then print the number of items with len(cart). The output must be exactly two lines: milk on the first line, then 4 on the second (the list has 4 items after the append).',
    language: 'python',
    starter: LISTS_LAB_STARTER,
    check: 'milk\n4',
  },
  {
    type: 'debug',
    symptom: 'This should print the last color, "green", but it errors with "list index out of range".',
    language: 'python',
    brokenCode: `colors = ["red", "blue", "green"]
print(colors[3])     # meant to print the last one`,
    task: 'Find why index 3 fails on this list.',
    fix: 'The list has 3 items, so the valid indexes are 0, 1, and 2 — there is no index 3. Because counting starts at 0, the LAST item lives at len(list) - 1, which is 2 here. Use  print(colors[2])  to get "green" — or, more robust, print(colors[-1]), which always grabs the final item.',
  },
  {
    type: 'quiz',
    question: 'After  nums = [10, 20]  then  nums.append(30), what do  len(nums)  and  nums[1]  give?',
    options: [
      'len is 2 and nums[1] is 30 — append replaced an item',
      'len is 3 and nums[1] is 20 — append added to the end, the middle item is unchanged',
      'len is 3 and nums[1] is 30 — append inserts at the front',
      'Error — you can\'t append to a list that already has items',
    ],
    answer: 1,
    explanation:
      'append always adds to the END, so nums becomes [10, 20, 30]: length 3, with 30 at index 2. nums[1] is still 20 — appending does not disturb the existing items or their positions. The new value lands in the new last slot.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'You created a list with square brackets and comma-separated values',
      'You read an item by its index, remembering that the first item is [0]',
      'You used len() to count the items',
      'You used .append() to add an item and saw the length increase',
      'Your output is exactly two lines: milk then 4',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In one sentence, what is a list and why is it better than ten separate variables?',
      'Why is the first item at index 0, and what index holds the last item of a 4-item list?',
      'What does .append() do, and where does the new item go?',
      'How would you check whether "milk" is somewhere in a list?',
    ],
  },
  {
    type: 'transfer',
    text: 'In the lab, build a list that means something to you — songs, tasks, weekly expenses. Print the first one with [0] and the last one with [-1], count them with len(), then append a new one and print the count again. You have just done the create → read → measure → grow cycle that sits under every list-backed feature you will build.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
]

// ================================================================= LESSON 7
// "Loops: Do Something for Every Item" — for item in list, for i in range(n),
// accumulating into a variable. New idea vs L6: REPEAT an action across a
// sequence without copy-paste. Lists had to come first (they did). Uses
// variables/numbers/if/lists (all taught). Still NO functions.
const LOOPS_LAB_STARTER = `# Below is a list of prices.
# Add them all up and print the TOTAL on its own line.
# Use a running-total variable that starts at 0, then a for-loop
# that adds each price to it. Do NOT type the answer in by hand.
# Expected output (one line):
#   60

prices = [10, 25, 5, 20]
total = 0
# your code here
`

const loopsBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Do something to every item in a sequence without copy-paste: loop over a list with for, repeat an action a fixed number of times with range(), and build up a result (a total or a count) in a variable as you go.',
    intensity: 'standard',
    time: '35–45 min',
    proof: 'A program that loops over a list and prints a single computed result — a total or a count — that is only correct if the loop actually ran over every item.',
    unlock: 'Your loop visits every item and your program prints the correct accumulated result.',
    doNotClaim:
      "Don't claim you \"understand loops\" until your program has built a running total or count across a list and printed the right answer — adding a list by hand is not looping.",
  },
  {
    type: 'mission',
    text: 'Last lesson you built a list that can hold a hundred values. Picture writing a hundred lines to add them up. That is not programming; that is typing. A loop says "do this for every item" exactly once.',
  },
  {
    type: 'context',
    text: 'Looping is how every program handles "for each": total each line of a receipt, email each user, draw each enemy. Bring along the if from Lesson 5 and you can count, filter, and decide across a whole dataset.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: you want to add up [10, 20, 30]. You write  total = 0  before a loop that does  total = total + price  for each price. Why does total have to start at 0 BEFORE the loop, not inside it?',
    reveal:
      'Because the loop body runs once per item, and you want to keep adding onto the same running total. If total = 0 were inside the loop, it would reset to 0 on every pass and wipe out your progress — you would end with just the last value. Setting it to 0 once, before the loop, gives you an empty bucket; each pass pours one more value in. Start outside, accumulate inside.',
  },
  {
    type: 'concept',
    title: 'A for-loop repeats a block once per item',
    text: 'for n in nums: runs the indented body once per item, with n set to each value in turn. The accumulator pattern: create a result (total = 0) BEFORE the loop, update it (total = total + n) INSIDE — when the loop ends, it holds the answer.',
  },
  {
    type: 'code-walkthrough',
    title: 'A running total, pass by pass',
    subtitle: 'The bucket is created once; each pass pours one more value in.',
    filename: 'loops.py',
    language: 'python',
    code: `nums = [4, 6, 10]
total = 0                # the bucket, created ONCE before the loop

for n in nums:           # n becomes 4, then 6, then 10
    total = total + n    # add the current item onto the running total

print(total)             # after all passes -> 20`,
    steps: [
      { lines: [2], label: 'Create the accumulator first', note: 'total = 0 runs ONCE, before the loop — the empty bucket.' },
      { lines: [4], label: 'The loop variable changes each pass', note: 'n becomes 4, then 6, then 10 — the next item of the list on every pass.' },
      { lines: [5], label: 'Pass 1 and 2', note: 'n=4: total = 0 + 4 → 4. n=6: total = 4 + 6 → 10. The body re-runs with the new n.' },
      { lines: [5], label: 'Pass 3', note: 'n=10: total = 10 + 10 → 20. Each pass builds on the last because total lives OUTSIDE the loop.' },
      { lines: [7], label: 'After the loop', note: 'print(total) shows 20 — the sum built one item at a time.' },
    ],
    caption: 'Put total = 0 inside the loop and it resets every pass, leaving only the last item (10). Start outside, accumulate inside.',
  },
  {
    type: 'diagram',
    title: 'Accumulate inside, initialise outside',
    subtitle: 'The accumulator is set up once, then the loop body updates the SAME bucket on every pass.',
    rankdir: 'LR',
    nodes: [
      { id: 'init', label: 'total = 0', description: 'before the loop — once', kind: 'process', tone: 'accent' },
      { id: 'loop', label: 'for n in nums', description: 'visit each item', kind: 'decision' },
      { id: 'update', label: 'total = total + n', description: 'inside — every pass', kind: 'process' },
      { id: 'result', label: 'total = 20', description: 'after the loop', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'init', to: 'loop', label: 'empty bucket', kind: 'data', tone: 'accent' },
      { from: 'loop', to: 'update', label: 'each n', kind: 'control' },
      { from: 'update', to: 'loop', label: 'next item', kind: 'control', dashed: true },
      { from: 'loop', to: 'result', label: 'when done', kind: 'data', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'set up once, outside' },
      { tone: 'success', label: 'the answer, after the loop' },
    ],
  },
  {
    type: 'compare',
    title: 'for item vs for i in range',
    subtitle: 'Two loop shapes. Reach for the one that fits what you need.',
    mono: true,
    left: {
      label: 'for item in list — the value',
      tone: 'success',
      lines: ['for score in scores:', '    if score >= 60:', '        passes = passes + 1', '# reads like English; you get each value'],
      verdict: 'Default when you want each item',
    },
    right: {
      label: 'for i in range(n) — a count',
      tone: 'accent',
      lines: ['for i in range(5):', '    print(i)', '# runs 5 times: i = 0,1,2,3,4', '# use when you need the position / a count'],
      verdict: 'When you need to repeat N times',
    },
    caption: 'A loop and an if together count matches: loop the scores, test each with if, bump a counter — passes ends at 2.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Reach for  for item in list  when you want each VALUE, and  for i in range(n)  when you want to do something a set number of times or need the position number. Beginners often default to range() with indexing (for i in range(len(list)): ... list[i]) — it works, but "for item in list" is cleaner and reads like English. Use indexes only when you actually need the index.',
  },
  {
    type: 'lab',
    title: 'Total the prices',
    summary:
      'You are given prices = [10, 25, 5, 20] and total = 0. Write a for-loop that adds each price to total, then print total on its own line. The output must be the single line 60 (10 + 25 + 5 + 20). The total must be computed by the loop — do not just print 60.',
    language: 'python',
    starter: LOOPS_LAB_STARTER,
    check: '60',
  },
  {
    type: 'debug',
    symptom: 'This should add [5, 5, 5] to get 15, but it prints 5.',
    language: 'python',
    brokenCode: `nums = [5, 5, 5]
for n in nums:
    total = 0            # meant to total the list
    total = total + n
print(total)             # prints 5, not 15`,
    task: 'Find why only the last number survives.',
    fix: 'total = 0 is INSIDE the loop, so it resets to 0 on every pass — wiping out everything added before. Each pass becomes 0 + n, so you keep only the last item. Move  total = 0  ABOVE the loop (run it once), and leave only  total = total + n  inside. Now total accumulates: 5 → 10 → 15.',
  },
  {
    type: 'quiz',
    question: 'How many times does the body run, and what is the last value of i, in:  for i in range(3): print(i)',
    options: [
      '3 times, with i ending at 3',
      '3 times, printing 0, 1, 2 — range(3) gives 0 up to but not including 3',
      '4 times, printing 0, 1, 2, 3',
      '1 time, because range(3) is a single value',
    ],
    answer: 1,
    explanation:
      'range(3) produces 0, 1, 2 — it starts at 0 and stops BEFORE 3, so the body runs 3 times and the last i is 2. "Up to but not including the number" is how range works, which also means range(len(list)) lines up perfectly with the list’s valid indexes.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'You wrote a for-loop with a colon and an indented body',
      'You created your accumulator (total = 0) BEFORE the loop, not inside it',
      'You updated the accumulator inside the loop (total = total + price)',
      'Your output is the single line 60, computed by the loop (not typed in)',
      'You can explain why the accumulator resets if you put it inside the loop',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In one sentence, what does a for-loop do?',
      'What is the difference between  for item in list  and  for i in range(n)?',
      'Why must a running total be set to 0 before the loop instead of inside it?',
      'How would you count how many items in a list pass a test (combine a loop with an if)?',
    ],
  },
  {
    type: 'transfer',
    text: 'In the lab, take a list that matters to you — daily steps, expenses, quiz scores — and use a loop to compute something real: the total, the average (total divided by len), or a count of items over a threshold using an if inside the loop. The "set up an accumulator, loop, update it, print the result" pattern is one of the most reused moves in all of programming.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
]

// ================================================================= LESSON 8
// "Functions: Name and Reuse a Block of Code" — def, parameters, return, calling.
// New idea vs L7: package a block of code under a name, hand it inputs
// (parameters), get a value back (return), and call it as many times as you like.
// Uses variables/numbers/strings/if/elif/else/lists/loops (all taught). Introduces
// def/return/parameters for the FIRST time. This sets up Module 2's deeper
// "Functions & Modules: Build Small, Testable Units".
const FUNCTIONS_LAB_STARTER = `# A function packages a block of code under a name so you can reuse it.
# 1. Define a function  total_price(unit_price, qty)  that RETURNS unit_price * qty.
# 2. Call it with unit_price = 7 and qty = 6, and store the result in a variable  bill.
# 3. Print EXACTLY this line, using an f-string:
#       6 items = $42

# your code here
`

const functionsBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Define your own function with def, give it inputs (parameters), send a value back with return, and call it to reuse a block of code — so you stop copy-pasting the same steps and start naming them.',
    intensity: 'standard',
    time: '35–45 min',
    proof: 'A program that defines a function, calls it with arguments, and prints a computed result that the function returned.',
    unlock: 'Your function takes inputs, returns the right value, and your program prints it via that returned value.',
    doNotClaim:
      "Don't claim you \"understand functions\" until your program has DEFINED a function, CALLED it with arguments, and used the value it RETURNED — printing inside the function without ever returning is not the whole skill.",
  },
  {
    type: 'mission',
    text: 'Look back: a loop that totals a list, an if that grades a score. Useful — but each lives in one spot. A function lets you name a block of code once and run it on demand, with different inputs every time.',
  },
  {
    type: 'context',
    text: 'Functions are how every program stays manageable: small named pieces — calculate_total, is_valid — snapped together. Naming a step makes code readable; reusing it kills copy-paste bugs. Every library you import is just someone else\'s functions.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: a function does  print(unit_price * qty)  but has no return. You write  bill = total_price(7, 6)  and then  print(bill). What ends up in  bill — the number 42, or something else?',
    reveal:
      'bill is None — NOT 42. print() shows a value on screen but does not hand it BACK to the caller. To get a value out of a function so you can store and reuse it, the function must return it. A function that only prints can show you something; a function that returns gives you something. This difference — print vs return — is the single most important idea in this lesson.',
  },
  {
    type: 'concept',
    title: 'def names a block; parameters feed it; return hands a value back',
    text: 'def total_price(unit_price, qty): names a function; the names in parentheses are parameters. return sends a value back to the caller and ends the function. Call it with arguments — total_price(7, 6) — and the call becomes whatever was returned.',
  },
  {
    type: 'code-walkthrough',
    title: 'Define once, call many',
    subtitle: 'Watch the arguments fill the parameters and the value come back to the caller.',
    filename: 'functions.py',
    language: 'python',
    code: `def area(width, height):     # width and height are parameters (inputs)
    return width * height    # hand the result back to the caller

room = area(3, 4)            # arguments 3, 4 fill width, height -> returns 12
print(room)                  # -> 12

print(area(10, 2))           # call again with new inputs -> returns 20`,
    steps: [
      { lines: [1], label: 'def names the function', note: 'Two parameters, width and height — placeholders for the inputs the caller supplies. Nothing runs yet; defining is not calling.' },
      { lines: [2], label: 'return hands a value back', note: 'Computes width * height and sends it to whoever called the function, ending it.' },
      { lines: [4], label: 'Calling fills the parameters', note: 'area(3, 4): the arguments 3 and 4 fill width and height in order; the call becomes the returned 12.' },
      { lines: [4, 5], label: 'Store and use the result', note: 'room = area(3, 4) stores 12, so print(room) shows 12. The call evaluates to its return value.' },
      { lines: [7], label: 'Reuse with new inputs', note: 'area(10, 2) runs the SAME function again → 20. One definition, many calls — the whole point.' },
    ],
    caption: 'Defining a function does NOT run it; only calling it does.',
  },
  {
    type: 'diagram',
    title: 'How a function call works',
    subtitle: 'Arguments flow in to fill the parameters; the function runs; return flows the result back out.',
    rankdir: 'LR',
    nodes: [
      { id: 'call', label: 'area(3, 4)', description: 'the caller, with arguments', kind: 'client', tone: 'accent' },
      { id: 'params', label: 'width=3, height=4', description: 'arguments fill parameters', kind: 'process' },
      { id: 'body', label: 'width * height', description: 'the body runs', kind: 'process' },
      { id: 'ret', label: 'return 12', description: 'value flows back', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'call', to: 'params', label: 'arguments in', kind: 'data', tone: 'accent' },
      { from: 'params', to: 'body', label: 'run', kind: 'control' },
      { from: 'body', to: 'ret', label: 'compute', kind: 'data' },
      { from: 'ret', to: 'call', label: 'call becomes 12', kind: 'data', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'arguments flow in' },
      { tone: 'success', label: 'return flows the result back' },
    ],
  },
  {
    type: 'compare',
    title: 'print shows; return gives back',
    subtitle: 'Same function, one difference — only one lets the caller USE the result.',
    mono: true,
    left: {
      label: 'Only prints — bill is None',
      tone: 'warning',
      lines: ['def total_price(u, q):', '    print(u * q)   # shows 42 on screen', 'bill = total_price(7, 6)', 'print(bill)        # None — nothing was handed back'],
      verdict: 'Shows a value, gives back nothing',
    },
    right: {
      label: 'Returns — bill is 42',
      tone: 'success',
      lines: ['def total_price(u, q):', '    return u * q   # hands 42 back', 'bill = total_price(7, 6)', 'print(bill)        # 42 — stored and reusable'],
      verdict: 'The caller can store and reuse it',
    },
    caption: 'Does the caller need to USE the result? return it. Does it only need to appear on screen? print it.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'print shows a value to a human; return hands a value to the rest of your program. Ask yourself: does the caller need to USE this result (store it, do math on it, pass it on)? Then return it. Does it only need to appear on screen right now? Then print it. Most reusable functions return — and the caller decides whether to print. Mixing these up is the most common beginner function bug.',
  },
  {
    type: 'lab',
    title: 'Write and call a function',
    summary:
      'Define a function total_price(unit_price, qty) that RETURNS unit_price * qty (use return, do not just print inside it). Call it with 7 and 6, store the returned value in a variable bill, then print exactly this line with an f-string: 6 items = $42. The 42 must come from your function’s return value — do not hardcode it.',
    language: 'python',
    starter: FUNCTIONS_LAB_STARTER,
    check: '6 items = $42',
  },
  {
    type: 'debug',
    symptom: 'This should print 42, but it prints None instead.',
    language: 'python',
    brokenCode: `def total_price(unit_price, qty):
    unit_price * qty          # meant to give back the total

bill = total_price(7, 6)
print(bill)                   # prints None, not 42`,
    task: 'Find why the caller gets None instead of the total.',
    fix: 'The line  unit_price * qty  computes 42 but throws it away — the function never returns anything, so the call hands back None. Add return:  return unit_price * qty. Now total_price(7, 6) evaluates to 42, bill stores 42, and print(bill) shows 42. A function with no return gives back None.',
  },
  {
    type: 'quiz',
    question: 'What does this print?  def double(n): return n * 2  — then  x = double(5)  and  print(double(x))',
    options: [
      '10 — the function only runs once',
      '20 — double(5) returns 10 into x, then double(10) returns 20',
      'None — you can\'t call a function with a variable',
      '5 — the return value is ignored',
    ],
    answer: 1,
    explanation:
      'double(5) returns 10, which is stored in x. Then double(x) is double(10), which returns 20, and that is printed. Each call runs the same function with whatever argument you give it and hands back a fresh result — that reuse is the entire point of writing a function.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes:',
    items: [
      'You defined a function with def, a name, and parameters in parentheses',
      'Your function uses return to hand a value back (not just print inside it)',
      'You called the function with arguments and stored the returned value in a variable',
      'Your output is EXACTLY:  6 items = $42  — with the 42 coming from the function’s return',
      'You can explain the difference between print (show) and return (hand back)',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In one sentence, what is a function and why write one?',
      'What is the difference between a parameter and an argument?',
      'What does return do, and how is it different from print?',
      'If a function has no return statement, what does calling it give back?',
    ],
  },
  {
    type: 'transfer',
    text: 'In the lab, turn a repeated calculation from earlier into a function: a tip calculator tip(bill, percent), a grader grade(score) using your if/elif/else, or a total summer that loops over a list. Then call it two or three times with different inputs and print each result. The moment you reuse one definition with new inputs, you have crossed from "scripting" into "building".',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
]

// ================================================================= LESSON 9
// "Build & Ship a Tiny Program" — THE CAPSTONE. Combine variables + if + a list +
// a loop + a function into one small, genuinely useful program over in-code data.
// No new syntax: this lesson is synthesis. Uses ONLY concepts from lessons 1-8.
// The capstone lab operates on in-code data (no input()) so the synthesis stays
// focused on combining the building blocks, not on I/O.
const SHIP_LAB_STARTER = `# CAPSTONE — ship a tiny gradebook in one small program.
# scores below are quiz results (0-100). Build ONE program that:
#   1. defines a function  summarize(scores)  which LOOPS over the scores and,
#      inside the loop, builds a running total AND counts how many are >= 60 (passing);
#   2. computes the average  (total divided by how many scores there are);
#   3. prints the passing-count line, then RETURNS the average.
#   4. OUTSIDE the function: call summarize(scores), store the returned average in  avg,
#      and print the average line. Print the average as a whole number with  int(avg).
# Required output — EXACTLY two lines (use f-strings):
#   Passed: 3 of 5
#   Average: 70

scores = [40, 80, 95, 50, 85]
# your code here
`

const shipBlocks = [
  {
    type: 'sprint-contract',
    outcome:
      'Combine everything from First Steps — a variable, a list, a loop, an if, and a function — into ONE small program that processes real in-code data and prints a useful result. This is your first genuinely shipped program.',
    intensity: 'capstone',
    time: '45–60 min',
    proof: 'A single working program that defines a function, loops over a list with a decision inside, and prints two exact lines computed from the data (a passing count and an average).',
    unlock: 'Your program runs end to end and prints both required lines, with every number computed from the data — nothing hardcoded.',
    doNotClaim:
      "Don't claim you \"shipped a program\" until it RUNS top to bottom and prints both correct lines from the data — a program that prints the right numbers only because you typed them in is not the skill.",
  },
  {
    type: 'mission',
    text: 'Seven lessons ago you could not print a line. Today none of it is practice: you snap print, variables, types, decisions, lists, loops, and functions into one real program — a tiny gradebook that reports how many passed and the class average.',
  },
  {
    type: 'context',
    text: 'Every real program is the basics combined: take data, loop over it, decide, compute, report. A bank statement, a leaderboard, a sales report — same shape. Holding several pieces at once and wiring them together is what "can build" means.',
  },
  {
    type: 'pretest',
    prompt:
      'Before you read on: you need a passing COUNT and a running TOTAL from one list. Do you need two separate loops over the scores, or can one loop do both jobs at the same time?',
    reveal:
      'One loop is enough — and better. On each pass you can add the score to your total AND, with an if, bump the passing count when it qualifies. Two accumulators (total = 0 and passed = 0) set up before the loop, both updated inside the same loop, both ready when it ends. Looping the data twice would work but wastes effort; real programs do as much as they can in one well-organised pass.',
  },
  {
    type: 'concept',
    title: 'A real program = data → loop → decide → accumulate → report',
    text: 'No new syntax — just arranging what you have: start with data, set up result holders before the loop, loop once (update the total, use an if to count), compute final figures after, then report. Wrap it in a function to name and reuse the whole job.',
  },
  {
    type: 'diagram',
    title: 'The shape of every data program',
    subtitle: 'Data flows into a loop that updates accumulators with a decision inside; final figures are computed after, then reported.',
    rankdir: 'LR',
    nodes: [
      { id: 'data', label: 'scores (list)', description: 'the data — L6', kind: 'store', tone: 'muted' },
      { id: 'init', label: 'total=0, passed=0', description: 'holders before the loop — L2', kind: 'process', tone: 'accent' },
      { id: 'loop', label: 'for s in scores', description: 'one pass — L7', kind: 'decision' },
      { id: 'decide', label: 'if s >= 60', description: 'count passes — L5', kind: 'decision', tone: 'warning' },
      { id: 'after', label: 'total / len', description: 'compute after — L3', kind: 'process' },
      { id: 'report', label: 'print + return', description: 'report — L1 & L8', kind: 'store', tone: 'success' },
    ],
    edges: [
      { from: 'data', to: 'loop', label: 'feeds', kind: 'data' },
      { from: 'init', to: 'loop', label: 'empty buckets', kind: 'data', tone: 'accent' },
      { from: 'loop', to: 'decide', label: 'each score', kind: 'control' },
      { from: 'decide', to: 'loop', label: 'next item', kind: 'control', dashed: true },
      { from: 'loop', to: 'after', label: 'when done', kind: 'data' },
      { from: 'after', to: 'report', label: 'figures', kind: 'data', tone: 'success' },
    ],
    legend: [
      { tone: 'accent', label: 'set up before the loop' },
      { tone: 'warning', label: 'a decision inside the loop' },
      { tone: 'success', label: 'report the result' },
    ],
  },
  {
    type: 'code-walkthrough',
    title: 'The gradebook, every line earning its place',
    subtitle: 'One program — variable, list, loop, if, function — working as a team.',
    filename: 'gradebook.py',
    language: 'python',
    code: `def summarize(scores):
    total = 0
    passed = 0
    for s in scores:             # one pass over the data
        total = total + s        # running total
        if s >= 60:              # decision
            passed = passed + 1  # count the passes
    print(f"Passed: {passed} of {len(scores)}")
    return total / len(scores)   # hand back the average

scores = [40, 80, 95, 50, 85]
avg = summarize(scores)
print(f"Average: {int(avg)}")    # -> Passed: 3 of 5 / Average: 70`,
    steps: [
      { lines: [1], label: 'Wrap the job in a function (L8)', note: 'summarize(scores) names the whole task and lets you reuse it on any list of scores.' },
      { lines: [2, 3], label: 'Two accumulators, set up first (L2 & L7)', note: 'total and passed created BEFORE the loop — the empty buckets. Inside the loop they would reset every pass.' },
      { lines: [4, 5], label: 'One loop, running total (L7)', note: 'Walk the list once; total grows on every pass.' },
      { lines: [6, 7], label: 'A decision inside the loop (L5)', note: 'The if counts only scores >= 60 — loop and if working together.' },
      { lines: [8, 9], label: 'Compute and report after (L1, L3, L8)', note: 'After the loop: print the count, then return the average (total / len). The caller prints it with an f-string and int(avg).' },
    ],
    caption: 'Output, two lines: Passed: 3 of 5 then Average: 70 — every number computed from the data.',
  },
  {
    type: 'compare',
    title: 'Accumulator outside vs inside the loop',
    subtitle: 'The capstone\'s make-or-break bug. One line\'s placement changes the answer.',
    mono: true,
    left: {
      label: 'total = 0 inside — wrong',
      tone: 'warning',
      lines: ['for s in scores:', '    total = 0          # resets every pass', '    total = total + s', 'return total / len(scores)', '# total ends as just 85 -> 85/5 = 17'],
      verdict: 'Keeps only the last score',
    },
    right: {
      label: 'total = 0 outside — right',
      tone: 'success',
      lines: ['total = 0              # once, before the loop', 'for s in scores:', '    total = total + s', 'return total / len(scores)', '# total = 350 -> 350/5 = 70'],
      verdict: 'Accumulates across every score',
    },
    caption: 'Set up accumulators once before the loop; compute final figures once after it. The loop body should only UPDATE.',
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'When a task feels big, name the steps in plain words first: "loop the scores, total them, count the passes, average it, print." That sentence IS your program’s outline — turn each clause into a line or two of code. Real engineers do exactly this: decompose the job into small steps you already know how to write, then assemble them. You are not memorising new magic; you are arranging familiar pieces.',
  },
  {
    type: 'lab',
    title: 'Ship the gradebook',
    summary:
      'Build one program over scores = [40, 80, 95, 50, 85]. Define summarize(scores) that loops once, builds a running total, counts scores >= 60, prints "Passed: 3 of 5", and RETURNS the average (total / len). Outside the function, call it, store the average in avg, and print "Average: 70" (use int(avg)). Output must be exactly two lines: Passed: 3 of 5 then Average: 70 — every number computed from the data, nothing hardcoded.',
    language: 'python',
    starter: SHIP_LAB_STARTER,
    check: 'Passed: 3 of 5\nAverage: 70',
  },
  {
    type: 'debug',
    symptom: 'This gradebook should print "Average: 70", but it prints "Average: 17" — far too low.',
    language: 'python',
    brokenCode: `def summarize(scores):
    for s in scores:
        total = 0                # meant to total the scores
        total = total + s
    return total / len(scores)

scores = [40, 80, 95, 50, 85]
print(f"Average: {int(summarize(scores))}")`,
    task: 'Find why the average comes out as 17 instead of 70.',
    fix: 'total = 0 sits INSIDE the loop, so it resets every pass — after the final pass total is just the last score (85), not the sum. The function then returns 85 / 5 = 17. Move  total = 0  ABOVE the loop so it runs once, and leave only  total = total + s  inside. Now total accumulates 40+80+95+50+85 = 350, and 350 / 5 = 70. Accumulators are created before the loop, updated inside it.',
  },
  {
    type: 'quiz',
    question: 'In the gradebook, why is  average = total / len(scores)  written AFTER the loop instead of inside it?',
    options: [
      'It must be inside the loop, or it never runs',
      'Because total is only complete once the loop has visited every score; computing it mid-loop would use a partial total',
      'It makes no difference where you put it',
      'Because len(scores) only works after a loop',
    ],
    answer: 1,
    explanation:
      'The running total is only finished after the loop has added every score. Computing the average inside the loop would divide an incomplete total and run needlessly on every pass. The pattern is: accumulate inside the loop, compute final results once the loop is done.',
  },
  {
    type: 'verification',
    intro: 'Prove it — no vibes (this is your shipped program):',
    items: [
      'Your program defines a function and CALLS it (Lesson 8)',
      'It loops over the list once, with an accumulator set up before the loop (Lessons 2 & 7)',
      'It uses an if INSIDE the loop to count only the passing scores (Lessons 5 & 7)',
      'It computes the average AFTER the loop and formats output with f-strings (Lessons 3 & 7)',
      'It prints EXACTLY two lines — Passed: 3 of 5 then Average: 70 — with every number computed from the data, nothing typed in',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'Walk through your program in plain English, one step per line of code.',
      'Why are total and passed set up before the loop, and updated inside it?',
      'Why does the average get computed after the loop, not during it?',
      'Which First Steps lesson did each part of your program come from? (variable, list, loop, if, function)',
    ],
  },
  {
    type: 'transfer',
    text: 'You just shipped a real program — stop and own that, because most people who say "I want to learn to code" never get here. Now make it yours: change the pass mark, track the "top score" by keeping the largest value as you loop, or point summarize() at a completely different list and watch it still work — that reuse is the whole payoff of a function. Then build a sibling from scratch: a tiny expense report, a step-count week, a quiz scorer. Same shape, your data. Everything ahead — files, the web, data, AI — is this exact move at larger scale: take data, process it in a loop with decisions, report a useful result. You do not just know some syntax now. You can build. Welcome.',
  },
  { type: 'spaced-review', schedule: ['1 day', '3 days', '7 days', '16 days'] },
]

// ================================================================= apply
async function main() {
  if (!shouldApply) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          applyCommand: 'tsx --env-file=.env.local scripts/academy/seed-first-steps.ts --apply',
          course: COURSE_SLUG,
          newModule: FIRST_STEPS_MODULE,
          newModuleSort: FIRST_STEPS_MODULE_SORT,
          lessons: [
            { slug: 'your-first-program', sort: 0, blocks: firstProgramBlocks.length },
            { slug: 'variables-and-values', sort: 1, blocks: variablesBlocks.length },
            { slug: 'numbers-and-strings', sort: 2, blocks: numbersStringsBlocks.length },
            { slug: 'reading-input', sort: 3, blocks: readingInputBlocks.length },
            { slug: 'booleans-and-logic', sort: 4, blocks: booleansBlocks.length },
            { slug: 'lists', sort: 5, blocks: listsBlocks.length },
            { slug: 'loops', sort: 6, blocks: loopsBlocks.length },
            { slug: 'functions-basics', sort: 7, blocks: functionsBlocks.length },
            { slug: 'build-a-tiny-program', sort: 8, blocks: shipBlocks.length },
          ],
          relabel: {
            from: `${OLD_FOUNDATIONS_MODULE} (module_sort 0)`,
            to: `${NEW_FOUNDATIONS_MODULE} (module_sort ${NEW_FOUNDATIONS_MODULE_SORT})`,
            note: 'slugs + per-lesson sort untouched',
          },
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

  // 0. Guard: the course must already exist (seeded by seed-programming-fundamentals.ts).
  const { data: course, error: courseErr } = await sb
    .from('academy_courses')
    .select('slug')
    .eq('slug', COURSE_SLUG)
    .maybeSingle()
  if (courseErr) throw courseErr
  if (!course) {
    console.error(
      `Course "${COURSE_SLUG}" not found. Run seed-programming-fundamentals.ts --apply first, then re-run this seed.`,
    )
    process.exit(1)
  }

  // 1. Re-home the existing module FIRST so the two modules never collide on a
  //    re-run: shift Module 1 · Foundations -> Module 2 · Foundations (sort 1).
  //    Idempotent: matching on the OLD label means a second run is a no-op.
  //    Slugs + per-lesson sort are deliberately left untouched (progress refs slugs).
  const { error: relabelErr } = await sb
    .from('academy_lessons')
    .update({ module_title: NEW_FOUNDATIONS_MODULE, module_sort: NEW_FOUNDATIONS_MODULE_SORT })
    .eq('course_slug', COURSE_SLUG)
    .eq('module_title', OLD_FOUNDATIONS_MODULE)
  if (relabelErr) throw relabelErr

  // 2. First Steps lessons (upsert on course_slug+slug) — module_sort 0 puts the
  //    whole module ahead of Foundations in the reader's (module_sort, sort) order.
  const firstSteps = [
    {
      slug: 'your-first-program',
      title: 'Your First Program',
      eyebrow: 'Module 1 · Lesson 1 · 20 min',
      sort: 0,
      est_minutes: 20,
      is_free_preview: true,
      intensity: 'micro',
      blocks: firstProgramBlocks,
    },
    {
      slug: 'variables-and-values',
      title: 'Variables: Names for Values',
      eyebrow: 'Module 1 · Lesson 2 · 25 min',
      sort: 1,
      est_minutes: 25,
      is_free_preview: true,
      intensity: 'micro',
      blocks: variablesBlocks,
    },
    {
      slug: 'numbers-and-strings',
      title: 'Numbers & Strings: The Everyday Types',
      eyebrow: 'Module 1 · Lesson 3 · 35 min',
      sort: 2,
      est_minutes: 35,
      is_free_preview: false,
      intensity: 'standard',
      blocks: numbersStringsBlocks,
    },
    {
      slug: 'reading-input',
      title: 'Reading Input: Make the Program Listen',
      eyebrow: 'Module 1 · Lesson 4 · 30 min',
      sort: 3,
      est_minutes: 30,
      is_free_preview: false,
      intensity: 'standard',
      blocks: readingInputBlocks,
    },
    {
      slug: 'booleans-and-logic',
      title: 'Booleans & Decisions: Make the Program Choose',
      eyebrow: 'Module 1 · Lesson 5 · 35 min',
      sort: 4,
      est_minutes: 35,
      is_free_preview: false,
      intensity: 'standard',
      blocks: booleansBlocks,
    },
    {
      slug: 'lists',
      title: 'Lists: Hold Many Values at Once',
      eyebrow: 'Module 1 · Lesson 6 · 35 min',
      sort: 5,
      est_minutes: 35,
      is_free_preview: false,
      intensity: 'standard',
      blocks: listsBlocks,
    },
    {
      slug: 'loops',
      title: 'Loops: Do Something for Every Item',
      eyebrow: 'Module 1 · Lesson 7 · 40 min',
      sort: 6,
      est_minutes: 40,
      is_free_preview: false,
      intensity: 'standard',
      blocks: loopsBlocks,
    },
    {
      slug: 'functions-basics',
      title: 'Functions: Name and Reuse a Block of Code',
      eyebrow: 'Module 1 · Lesson 8 · 40 min',
      sort: 7,
      est_minutes: 40,
      is_free_preview: false,
      intensity: 'standard',
      blocks: functionsBlocks,
    },
    {
      slug: 'build-a-tiny-program',
      title: 'Build & Ship a Tiny Program',
      eyebrow: 'Module 1 · Lesson 9 · 50 min',
      sort: 8,
      est_minutes: 50,
      is_free_preview: false,
      intensity: 'capstone',
      blocks: shipBlocks,
    },
  ]

  for (const l of firstSteps) {
    const { error } = await sb.from('academy_lessons').upsert(
      {
        course_slug: COURSE_SLUG,
        slug: l.slug,
        title: l.title,
        eyebrow: l.eyebrow,
        module_title: FIRST_STEPS_MODULE,
        module_sort: FIRST_STEPS_MODULE_SORT,
        sort: l.sort,
        est_minutes: l.est_minutes,
        is_free_preview: l.is_free_preview,
        status: 'published',
        intensity: l.intensity,
        blocks: l.blocks,
      },
      { onConflict: 'course_slug,slug' },
    )
    if (error) throw error
  }

  // 3. Maintain the denormalized lesson counter on the course.
  const { count } = await sb
    .from('academy_lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_slug', COURSE_SLUG)
    .eq('status', 'published')
  await sb.from('academy_courses').update({ lessons: count ?? 0 }).eq('slug', COURSE_SLUG)

  console.log(
    `Seeded "${FIRST_STEPS_MODULE}" (${firstSteps.length} lessons) + relabelled Foundations -> "${NEW_FOUNDATIONS_MODULE}". Course now has ${count ?? 0} published lesson(s).`,
  )
}

main().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
