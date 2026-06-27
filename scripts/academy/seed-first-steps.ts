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
 *   code → callout → lab (real Pyodide starter+check) → debug → quiz →
 *   verification → teachback → transfer → spaced-review.
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
// "Your First Program" — running code, print(), the edit→run→see-output loop.
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
    text: 'Right now the computer does nothing you tell it — because you have never told it anything. In the next twenty minutes that ends. You will type one line, press Run, and watch a machine do exactly what you said. Every programmer alive remembers this moment. After today, so will you.',
  },
  {
    type: 'context',
    text: 'Everything you will ever build — games, websites, data tools, AI — is just instructions you write and the computer runs, one after another. The whole job rests on a single loop: you EDIT the instructions, you RUN them, you SEE what happened, and you adjust. Master that loop on day one and nothing later feels like magic — just more instructions.',
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
    text: 'A program is a list of instructions the computer runs from top to bottom, in order. The most basic instruction is print(...): it displays whatever you put inside the parentheses on screen (called the "output"). To show literal text, you wrap it in quotes — "like this" — so the computer knows it is text to display, not a command to run. That wrapped text is called a string. One idea today: you write print("..."), you run it, the text appears.',
  },
  {
    type: 'worked-example',
    intro: 'Let us print a line, step by step. Read each part of this one instruction:',
    language: 'python',
    code: `print("Hello, world!")`,
    steps: [
      'print is the instruction — it means "show this on screen".',
      'The parentheses ( ) hold what you want to show.',
      'The quotes " " mark the text (the string) you want printed — exactly what is inside them appears.',
      'Run it, and the output is the line:  Hello, world!',
      'Change the text inside the quotes, run again, and the output changes to match — that is the edit→run→see loop.',
    ],
    commonMistake:
      'Forgetting the quotes — writing print(Hello) instead of print("Hello"). Without quotes the computer thinks Hello is a command to look up (and there is none), so it errors. Text you want shown LITERALLY always goes inside quotes.',
  },
  {
    type: 'code',
    filename: 'hello.py',
    language: 'python',
    code: `print("Hello, world!")
print("I just ran my first program.")`,
    // Two instructions, run top to bottom — proves order matters and you can have more than one line.
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Here is the habit that separates people who get unstuck fast from people who panic: an error is not the computer scolding you — it is the computer telling you exactly where it got confused. Read it, do not fear it. And on day one, nine times out of ten the answer is a quote: it must wrap the WHOLE piece of text — opening quote, your text, closing quote — "Hello, world!". Mismatched or missing quotes is the #1 beginner error. When something breaks, check your quotes first, then read the message.',
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
    fix: 'The text is missing its quotes. Without quotes the computer reads Hello and world! as commands to look up, not text to show — and there is no such command, so it errors. Wrap the literal text in quotes: print("Hello, world!"). Quotes turn it into a string the computer will simply display.',
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
      'You changed the text once, re-ran, and watched the output change to match (the edit→run→see loop)',
    ],
  },
  {
    type: 'teachback',
    prompts: [
      'In one sentence, what does print(...) do?',
      'Why does the text you want shown go inside quotes?',
      'What are the three steps of the loop every programmer repeats? (edit → ? → ?)',
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
    text: 'In Lesson 1 you printed a line — then the computer forgot it the instant it ran. But real programs remember: a score that climbs, a price that drops at checkout, a total built from parts. Today you give a value a name you can hold onto and reuse. That is the leap from a program that says something once to a program that actually keeps track — and next lesson, those remembered values start doing math.',
  },
  {
    type: 'context',
    text: 'A variable is the most-used thing in all of programming. Every score, total, username, setting, and result you will ever work with lives in one. Get comfortable with "store a value under a name, then use the name" now, and every later topic — calculations, decisions, loops — is just variables being read and changed.',
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
    text: 'A variable is a name you attach to a value so you can use it later. You create one with assignment: name = value. The single = means "put the value on the right into the name on the left" (it is NOT the "equals" from math). Read the variable just by using its name — anywhere you write the name, the computer substitutes its current value. Assign to it again and the new value replaces the old one (reassignment). One value at a time, always the latest.',
  },
  {
    type: 'worked-example',
    intro: 'Store a value, use it, then change it — watch the name follow the latest value:',
    language: 'python',
    code: `price = 20          # store 20 under the name "price"
print(price)        # use the name -> shows 20
price = price - 5   # take the current price (20), subtract 5, store the result back
print(price)        # the name now holds 15 -> shows 15`,
    steps: [
      'price = 20 puts the value 20 into the name price.',
      'print(price) reads the name and shows its current value, 20.',
      'price = price - 5 is read right-side first: compute 20 - 5 = 15, THEN store 15 back into price.',
      'The old 20 is replaced — a variable holds only its latest value.',
      'print(price) now shows 15. Same name, new value.',
    ],
    commonMistake:
      'Reading  price = price - 5  as a math equation (which would be impossible) instead of an instruction. It is not a claim that price equals price-minus-5; it is a command: "work out the right side, then store that into the name on the left."',
  },
  {
    type: 'code',
    filename: 'variables.py',
    language: 'python',
    code: `per_box = 6          # eggs in one box
boxes = 3            # number of boxes
total_eggs = per_box * boxes   # use both names in a calculation
print(total_eggs)              # -> 18`,
    // Names make the calculation readable: total_eggs = per_box * boxes says what it MEANS.
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'Pros treat a variable name as the cheapest documentation they will ever write. total_eggs explains itself; t and x force the next reader (usually future-you, at 11pm, debugging) to scroll back and reconstruct what it meant. The rule working programmers follow: name the value for its MEANING, lowercase with underscores between words (per_box, max_score). A good name is not neatness — it is how code stays readable long after you have forgotten writing it.',
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
    text: 'In Lesson 2 you added numbers and it just worked. So this will rattle you: ask a user for two quantities, add them, and you get "23" instead of 5 — and nothing looks wrong. The culprit is that your values have a hidden property called a type, and text and numbers obey different rules under the same + sign. Today you learn to see that hidden property. This single lesson kills more baffling beginner bugs than any other — and it is the groundwork for every form, file, and keyboard input you will ever handle.',
  },
  {
    type: 'context',
    text: 'Every value in a program has a type — and the type decides what operations mean. Numbers add; text joins. Input from forms, files, and the keyboard almost always arrives as TEXT, even when it looks like a number — so knowing how to tell them apart and convert between them is the foundation under input handling, validation, and clean output for everything you build later.',
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
    text: 'Three everyday types: int is a whole number (4, -7, 0); float is a number with a decimal point (4.0, 3.14); str is text — anything in quotes ("Coffee", "4"). The type decides what + does: on numbers it adds (2 + 3 = 5); on strings it joins ("2" + "3" = "23"). Note "4" (with quotes) is text, while 4 is a number — they look alike but behave completely differently. To switch between them you convert deliberately: int("4") turns the text "4" into the number 4; str(4) turns the number 4 into the text "4".',
  },
  {
    type: 'worked-example',
    intro: 'Do the math on numbers, then build the text with an f-string. Read how the pieces fit:',
    language: 'python',
    code: `price = 4
qty = 3
total = price * qty          # numbers -> arithmetic -> 12 (an int)

# An f-string starts with f"..." and runs whatever is inside { } and drops the
# result into the text. Numbers are turned into text automatically here.
line = f"Total for {qty} items: \${total}"
print(line)                  # -> Total for 3 items: $12`,
    steps: [
      'price and qty are ints, so price * qty does real multiplication → 12.',
      'An f-string is text that starts with the letter f before the opening quote.',
      'Inside the f-string, anything in { } is evaluated and its value dropped in: {qty} → 3, {total} → 12.',
      'The dollar sign and the words are plain text; only the { } parts get replaced.',
      'print(line) shows the finished line: Total for 3 items: $12.',
    ],
    commonMistake:
      'Trying to join a number and text with +, like "Total: " + total — that errors, because you cannot + text and a number. Either convert the number with str(total), or (better) use an f-string: f"Total: {total}". F-strings handle the conversion for you.',
  },
  {
    type: 'code',
    filename: 'convert.py',
    language: 'python',
    code: `typed = "25"           # text from a form/keyboard — looks like a number, but it's a str
print(typed + typed)   # text + text JOINS -> "2525"

age = int(typed)       # convert the text to a real number
print(age + 1)         # now arithmetic works -> 26

label = "Age: " + str(age)   # convert a number back to text to join it
print(label)                 # -> Age: 25`,
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
// "Booleans & Decisions" — True/False, comparisons, and/or/not, if/elif/else.
// New idea vs L3: a program can CHOOSE a path. Until now every line ran. Now a
// block runs only when a condition is True. Uses ONLY variables, numbers,
// strings, print (all taught). Introduces booleans + if/elif/else here for the
// first time. Still NO loops, NO lists, NO functions.
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
    text: 'Until now every line of your program ran, every time, no matter what — print, store, compute, in lockstep. But real programs decide: pass or fail, in stock or sold out, logged in or kicked out. Today you hand your program a fork in the road: it looks at a value, answers a yes/no question, and runs different code depending on the answer. This is the moment your code stops reciting and starts reacting — and soon you will run these same decisions across a whole list of values at once.',
  },
  {
    type: 'context',
    text: 'Every app you have ever used is built on decisions: show this if the password matches, charge less if there is a discount, warn the user if the field is empty. The whole skill is: turn a question into a True/False value, then branch on it. Get comfortable with if / elif / else now and every later topic — loops, validation, game logic — is just decisions repeated and combined.',
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
    text: 'A boolean is a value that is either True or False — the answer to a yes/no question. You make one by comparing: == (equal to), != (not equal), < (less than), > (greater than), <= (at most), >= (at least). Watch the trap: == asks "are these equal?", while a single = stores a value — never mix them. Combine conditions with and (both must be True), or (at least one True), and not (flips True↔False). Then if runs its indented block only when its condition is True; elif ("else if") checks the next condition only if the ones above were False; else runs when none matched. Python checks them top to bottom and takes the FIRST branch that is True — so order matters.',
  },
  {
    type: 'worked-example',
    intro: 'Watch one value pick exactly one branch. Read it top to bottom, the way Python does:',
    language: 'python',
    code: `temp = 50

if temp > 85:
    print("Hot")          # skipped: 50 > 85 is False
elif temp >= 60:
    print("Comfortable")  # skipped: 50 >= 60 is False
else:
    print("Cold")         # runs: nothing above matched -> Cold`,
    steps: [
      'temp is 50.',
      'Python checks the if first: temp > 85 → 50 > 85 → False, so that block is skipped.',
      'It checks the elif: temp >= 60 → 50 >= 60 → False, so that block is skipped too.',
      'Nothing matched, so the else block runs and prints Cold.',
      'Exactly ONE branch runs — the first True one, or else if none are True. Change temp to 90 and the very first branch wins instead.',
    ],
    commonMistake:
      'Using a single = in a condition, like  if temp = 50:  — that is a store, not a question, and Python errors. To COMPARE you need ==:  if temp == 50:. One equals stores, two equals asks.',
  },
  {
    type: 'code',
    filename: 'decide.py',
    language: 'python',
    code: `age = 20
has_ticket = True

# "and" needs BOTH sides True; this is True only for a ticketed adult.
if age >= 18 and has_ticket:
    print("Enjoy the show")
else:
    print("Entry denied")     # -> for age 20 with a ticket, prints "Enjoy the show"`,
    // Two conditions joined with and: the block runs only when both are True.
  },
  {
    type: 'callout',
    tone: 'tip',
    text: 'In most languages, curly braces { } mark what is "inside" a branch. Python deletes the braces and uses the indentation itself — which means in Python, whitespace is not style, it is syntax. The colon at the end of the line opens the branch; the four-space indent underneath says "these lines belong to it." Pros internalize this once and never fight it again: a stray colon or a wrong indent does not look wrong, but it silently puts code in the wrong branch. When an if misbehaves, check the colon and the indentation before anything else.',
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
    symptom: 'This should print Adult for age 20, but it prints nothing — or errors — instead.',
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

// ================================================================= LESSON 5
// "Lists: Hold Many Values at Once" — create, index [0], len(), append(),
// membership (in). New idea vs L4: one name can hold MANY values in order. Uses
// variables/numbers/strings/print/if (all taught). Indexing + a method call are
// introduced, but NO loops (next lesson) and NO functions yet.
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
    text: 'Every variable you have made so far holds exactly one value — perfect for a single score, useless for fifty. Nobody writes score1, score2, score3 … score50. A list lets one name hold a whole sequence of values in order: grow it, read any slot by position, count it. It is the container almost every real program is built around — and the moment you have many values under one name, the next lesson hands you a way to act on all of them in a single stroke.',
  },
  {
    type: 'context',
    text: 'A todo app holds a list of tasks; a cart holds a list of items; a chart holds a list of numbers. Lists are how programs handle "many of something" — and next lesson, loops will let you do something to every item at once. Master "store many under one name, reach any one by position, add more" today, and loops become almost free.',
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
    text: 'A list is an ordered collection of values written in square brackets, separated by commas: scores = [90, 75, 88]. The values keep their order. Reach any one by its index in square brackets — and indexes start at 0, so scores[0] is 90 and scores[2] is 88. Ask how many items there are with len(scores). Add a new item to the end with scores.append(100) — note the dot: append is something the list does to itself, and it changes the list in place (it does not return a new one). Ask whether a value is present with the word in: 75 in scores is True. Lists can hold numbers, strings, anything — and you can mix them.',
  },
  {
    type: 'worked-example',
    intro: 'Build a list, read it, measure it, grow it. Watch the length change:',
    language: 'python',
    code: `names = ["Ann", "Ben"]   # a list of two strings, in order
print(names[0])          # index 0 = the first item -> Ann
print(len(names))        # how many items -> 2

names.append("Cy")       # add "Cy" to the END (changes names in place)
print(len(names))        # the list grew -> 3
print(names[2])          # the new last item is at index 2 -> Cy`,
    steps: [
      'names starts with two items: "Ann" at index 0, "Ben" at index 1.',
      'names[0] reads the item at position 0 → "Ann".',
      'len(names) counts the items → 2.',
      'names.append("Cy") adds "Cy" to the end; the list is now ["Ann", "Ben", "Cy"].',
      'len(names) is now 3, and names[2] (the new last slot) is "Cy".',
    ],
    commonMistake:
      'Reaching past the end, like names[3] on a 3-item list. The valid indexes are 0, 1, 2 — index 3 does not exist, so Python errors with "list index out of range". The last valid index is always len(list) - 1, because counting starts at 0.',
  },
  {
    type: 'code',
    filename: 'lists.py',
    language: 'python',
    code: `cart = ["milk", "bread"]
cart.append("eggs")          # cart is now ["milk", "bread", "eggs"]

print(cart[0])               # first item -> milk
print(len(cart))             # how many items -> 3

if "eggs" in cart:           # membership: is "eggs" somewhere in the list?
    print("Got the eggs")    # -> Got the eggs`,
    // .append grows the list; [0] reads by position; len() counts; "in" tests membership.
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

// ================================================================= LESSON 6
// "Loops: Do Something for Every Item" — for item in list, for i in range(n),
// accumulating into a variable. New idea vs L5: REPEAT an action across a
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
    text: 'Last lesson you built a list that can hold a hundred values. Now picture writing a hundred lines to add them up — and rewriting all hundred the moment the list changes size. That is not programming; that is typing. A loop says "do this for every item" exactly once, and it runs whether the list holds 3 values or 3,000. This is the instruction that turns a list from a pile of data into something you can actually process — and bring along the if from Lesson 4 and you can count, filter, and decide across the whole pile.',
  },
  {
    type: 'context',
    text: 'Looping is how every real program handles "for each": total every line of a receipt, send each user an email, check each answer on a quiz, draw each enemy on screen. Combine a loop with the if from earlier and you can count, filter, and decide across a whole dataset. Almost every program you will ever write has a loop near its heart.',
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
    text: 'A for-loop runs its indented block once for each item in a sequence. Write  for price in prices:  — on each pass, the loop variable (price) is set to the next item of the list, and the indented body runs with that value. To repeat a fixed number of times instead, loop over range(n): for i in range(5): runs 5 times with i going 0, 1, 2, 3, 4. The most useful pattern is accumulation: create a result variable BEFORE the loop (total = 0 or count = 0), then update it INSIDE the loop (total = total + price). When the loop finishes, the variable holds the answer built across every item. Like if, the colon and the indentation mark what is "inside" the loop.',
  },
  {
    type: 'worked-example',
    intro: 'Add up a list with a running total. Watch total grow on each pass:',
    language: 'python',
    code: `nums = [4, 6, 10]
total = 0                # the bucket, created ONCE before the loop

for n in nums:           # n becomes 4, then 6, then 10
    total = total + n    # add the current item onto the running total

print(total)             # after all passes -> 20`,
    steps: [
      'total starts at 0 before the loop — the empty bucket.',
      'Pass 1: n is 4, total = 0 + 4 → 4.',
      'Pass 2: n is 6, total = 4 + 6 → 10.',
      'Pass 3: n is 10, total = 10 + 10 → 20.',
      'The loop ends; print(total) shows 20 — the sum built one item at a time.',
    ],
    commonMistake:
      'Putting  total = 0  INSIDE the loop. Then it resets to 0 every pass, and you end up with only the last item (10 here) instead of the sum. The accumulator must be created once, BEFORE the loop, and only updated inside.',
  },
  {
    type: 'code',
    filename: 'loops.py',
    language: 'python',
    code: `scores = [55, 80, 42, 91]
passes = 0                   # counter starts at 0, before the loop

for score in scores:
    if score >= 60:          # a loop and an if working together
        passes = passes + 1  # count only the scores that pass

print(passes)                # how many scores were 60+ -> 2`,
    // Loop over the list, use if to test each item, count the matches in a variable.
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

// ================================================================= LESSON 7
// "Functions: Name and Reuse a Block of Code" — def, parameters, return, calling.
// New idea vs L6: package a block of code under a name, hand it inputs
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
    text: 'Look back at what you have built: a loop that totals a list, an if that grades a score. Useful — but each lives in one spot, and to reuse it you would copy-paste and pray. A function lets you name a block of code once and run it on demand, with different inputs every time. Fix it in one place and it is fixed everywhere it is used. This is the move that turns a wall of repeated lines into a handful of named, reusable tools — and it is the last piece you need before you wire everything together into a real program.',
  },
  {
    type: 'context',
    text: 'Functions are how every real program stays manageable. Instead of one giant script, you build small named pieces — calculate_total, is_valid, format_line — and snap them together. Naming a step makes code readable; reusing it kills copy-paste bugs (fix it in one place, it is fixed everywhere). Every library you will ever import is just someone else’s functions. Learn to write your own and the whole ecosystem opens up.',
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
    text: 'A function is a named block of code you can run on demand. You define it with def: def total_price(unit_price, qty): — the names in the parentheses are parameters, placeholders for the inputs the caller will supply. The indented lines underneath are the body (the colon + indentation mark what is "inside", just like if and for). return value sends a value back to whoever called the function and ends it. You call the function by writing its name with real values — total_price(7, 6) — and those values (the arguments) fill the parameters in order. The call evaluates to whatever was returned, so you can store it: bill = total_price(7, 6). Defining a function does NOT run it; only calling it does.',
  },
  {
    type: 'worked-example',
    intro: 'Define once, call twice with different inputs. Watch the arguments fill the parameters and the value come back:',
    language: 'python',
    code: `def area(width, height):     # width and height are parameters (inputs)
    return width * height    # hand the result back to the caller

room = area(3, 4)            # arguments 3, 4 fill width, height -> returns 12
print(room)                  # -> 12

print(area(10, 2))           # call again with new inputs -> returns 20 -> prints 20`,
    steps: [
      'def area(width, height): names a function with two parameters; nothing runs yet.',
      'return width * height computes the value and sends it back, ending the function.',
      'area(3, 4) calls it: 3 fills width, 4 fills height; the call becomes the returned 12.',
      'room = area(3, 4) stores that 12, so print(room) shows 12.',
      'area(10, 2) reuses the SAME function with new inputs → 20. One definition, many calls.',
    ],
    commonMistake:
      'Printing inside the function but forgetting to return, then trying to use the result: the function shows a number but hands back None, so bill = total_price(7, 6) stores None, not 42. If the caller needs the value, the function must return it — printing is not returning.',
  },
  {
    type: 'code',
    filename: 'functions.py',
    language: 'python',
    code: `def grade(score):            # one input: a score
    if score >= 90:
        return "A"           # return ends the function immediately
    elif score >= 70:
        return "B"
    else:
        return "C"

print(grade(95))             # -> A
print(grade(84))             # reuse the same logic with a new input -> B`,
    // def packages the if/elif/else once; each call reuses it with a different score. return ends the function.
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

// ================================================================= LESSON 8
// "Build & Ship a Tiny Program" — THE CAPSTONE. Combine variables + if + a list +
// a loop + a function into one small, genuinely useful program over in-code data.
// No new syntax: this lesson is synthesis. Uses ONLY concepts from lessons 1-7.
// NO input() (Pyodide labs are non-interactive — operate on in-code data).
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
    text: 'Seven lessons ago you could not make a computer print a line. Look at what you carry now: you can print (L1), name and reuse values (L2), tell numbers from text and format them (L3), make decisions (L4), hold many values in a list (L5), loop over them (L6), and package logic into a function (L7). Today none of it is practice. You snap all of it together into one real program — a tiny gradebook that reads a set of scores and reports how many passed and the class average. This is the line between "I am learning to code" and "I built a working program." It is small. It is entirely yours. And when you press Run, it actually works.',
  },
  {
    type: 'context',
    text: 'Every real program is just the basics you already know, combined: take some data, loop over it, make decisions, compute results, report them. A bank statement, a leaderboard, a fitness summary, a sales report — same shape. The skill that separates someone who "knows syntax" from someone who "can build" is exactly this: holding several pieces in your head at once and wiring them into one program that does a real job. That is what you practice here.',
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
    text: 'Building a program is not a new skill — it is arranging the ones you have into a sensible order. The classic shape: (1) start with your data (a list); (2) set up your result holders BEFORE the loop (total = 0, passed = 0); (3) loop over the data once; (4) inside the loop, update the total every pass and use an if to update the count only when a condition is met; (5) after the loop, compute any final figures (average = total / len(scores)); (6) report the results (print, or return them from a function so the rest of the program can use them). Wrapping that in a function — summarize(scores) — names the whole job and lets you reuse it on any list of scores. No new syntax today: this is everything from lessons 1–7, working as a team.',
  },
  {
    type: 'worked-example',
    intro: 'A complete tiny program — same shape as the lab, different data. Read how the pieces combine:',
    language: 'python',
    code: `def report(temps):           # a function that takes a list of temperatures
    total = 0                # accumulator set up BEFORE the loop
    hot_days = 0             # a second accumulator
    for t in temps:          # one loop, doing two jobs
        total = total + t    # build the running total every pass
        if t >= 80:          # a decision inside the loop
            hot_days = hot_days + 1   # count only the hot days
    average = total / len(temps)      # compute after the loop
    print(f"Hot days: {hot_days}")
    return average           # hand the average back to the caller

readings = [72, 85, 90, 68]  # the data
avg = report(readings)       # call the function, capture what it returns
print(f"Average: {int(avg)}")`,
    steps: [
      'report(temps) wraps the whole job in one named, reusable function (Lesson 7).',
      'total and hot_days are created BEFORE the loop — the empty buckets (Lessons 2 & 6).',
      'One for-loop walks the list once (Lesson 6), reading each temperature.',
      'Inside, total grows every pass; the if counts only hot days (Lessons 4 & 6 together).',
      'After the loop, average = total / len(temps) computes the result, the function prints the count and RETURNS the average, and the caller prints it with an f-string (Lessons 3 & 7).',
    ],
    commonMistake:
      'Resetting an accumulator inside the loop (total = 0 on every pass) or computing the average inside the loop instead of after it — both give wrong numbers. Set up accumulators once before the loop; compute final figures once after it. The loop body should only UPDATE, not re-initialise.',
  },
  {
    type: 'code',
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
    // Variable + list + loop + if + function, combined into one working program.
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
      'Your program defines a function and CALLS it (Lesson 7)',
      'It loops over the list once, with an accumulator set up before the loop (Lessons 2 & 6)',
      'It uses an if INSIDE the loop to count only the passing scores (Lessons 4 & 6)',
      'It computes the average AFTER the loop and formats output with f-strings (Lessons 3 & 6)',
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
            { slug: 'booleans-and-logic', sort: 3, blocks: booleansBlocks.length },
            { slug: 'lists', sort: 4, blocks: listsBlocks.length },
            { slug: 'loops', sort: 5, blocks: loopsBlocks.length },
            { slug: 'functions-basics', sort: 6, blocks: functionsBlocks.length },
            { slug: 'build-a-tiny-program', sort: 7, blocks: shipBlocks.length },
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
      slug: 'booleans-and-logic',
      title: 'Booleans & Decisions: Make the Program Choose',
      eyebrow: 'Module 1 · Lesson 4 · 35 min',
      sort: 3,
      est_minutes: 35,
      is_free_preview: false,
      intensity: 'standard',
      blocks: booleansBlocks,
    },
    {
      slug: 'lists',
      title: 'Lists: Hold Many Values at Once',
      eyebrow: 'Module 1 · Lesson 5 · 35 min',
      sort: 4,
      est_minutes: 35,
      is_free_preview: false,
      intensity: 'standard',
      blocks: listsBlocks,
    },
    {
      slug: 'loops',
      title: 'Loops: Do Something for Every Item',
      eyebrow: 'Module 1 · Lesson 6 · 40 min',
      sort: 5,
      est_minutes: 40,
      is_free_preview: false,
      intensity: 'standard',
      blocks: loopsBlocks,
    },
    {
      slug: 'functions-basics',
      title: 'Functions: Name and Reuse a Block of Code',
      eyebrow: 'Module 1 · Lesson 7 · 40 min',
      sort: 6,
      est_minutes: 40,
      is_free_preview: false,
      intensity: 'standard',
      blocks: functionsBlocks,
    },
    {
      slug: 'build-a-tiny-program',
      title: 'Build & Ship a Tiny Program',
      eyebrow: 'Module 1 · Lesson 8 · 50 min',
      sort: 7,
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
    `✓ Seeded "${FIRST_STEPS_MODULE}" (${firstSteps.length} lessons) + relabelled Foundations -> "${NEW_FOUNDATIONS_MODULE}". Course now has ${count ?? 0} published lesson(s).`,
  )
}

main().catch((err) => {
  console.error('seed failed:', err)
  process.exit(1)
})
