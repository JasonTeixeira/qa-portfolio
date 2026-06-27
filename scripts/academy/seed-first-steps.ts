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
    text: 'Right now, code is a black box: you have never made a computer do a single thing on purpose. In the next 20 minutes that changes. You will type one instruction, run it, and watch the machine obey — the exact moment every programmer points to as "this is when it clicked."',
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
    text: 'The quotes must match and must wrap the WHOLE piece of text: "Hello, world!" — opening quote, your text, closing quote. A missing or mismatched quote is the single most common beginner error. When something breaks, check your quotes first.',
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
    text: 'In your first program every value was typed inline and instantly forgotten. Real programs need to remember: a score that goes up, a price that gets a discount, a total that builds from parts. Today you give values names you can hold onto and reuse — the difference between a program that says one thing and one that actually keeps track.',
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
    text: 'Name variables for what they MEAN, not what they are: total_eggs, not t or x. Good names are lowercase with underscores between words (per_box, max_score). Future-you — and anyone reading your code — should understand a variable from its name alone, without hunting for where it came from.',
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
    text: 'You can store values and do math — but the moment text and numbers mix, things get weird: add two quantities from a form and you get "23" instead of 5. Today you learn what your values actually ARE, so you can do math when you mean math and build clean text when you mean text. This is the lesson that stops the most baffling beginner bugs.',
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
