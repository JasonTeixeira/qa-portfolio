# Wave 1 — Git-Resident Lesson Gauntlet Ledger

Date: 2026-08-15 · Run: wf_395dffc0-a60 (18 agents: 6 audit / 6 rewrite / 6 independent verify)
Scope: the 34 git-resident lessons (programming-fundamentals 18 · career-engineering_judgment_foundation 16) in 6 seed files.
Gate: score ≥95 AND zero critical AND zero high, scored by an independent verify auditor who never saw the first audit.
Method: every runnable Python claim executed with python3 (labs run twice: starter must fail for the stated reason, fix must pass). Every defect carries a verbatim locating quote.

## Result: 34/34 lessons pass the gate after rewrite

| File | Lessons | Defects found | crit/high | Fixes applied | Verify pass |
|---|---|---|---|---|---|
| seed-first-steps.ts | 9 | 15 | 3 | 8 (tsc clean) | 9/9 |
| seed-programming-fundamentals.ts | 9 | 12 | 1 | 6 (tsc clean) | 9/9 |
| seed-module-1.ts | 4 | 7 | 3 | 6 (tsc clean) | 4/4 |
| seed-module-2.ts | 4 | 13 | 5 | 5 (tsc clean) | 4/4 |
| seed-module-3.ts | 4 | 11 | 1 | 4 (tsc clean) | 4/4 |
| seed-module-4.ts | 4 | 15 | 4 | 12 (tsc clean) | 4/4 |


---

## scripts/academy/seed-first-steps.ts  ·  programming-fundamentals

### your-first-program — audit 86 → verify 99 PASS

- **CRITICAL** — The debug fix teaches a false error mechanism for the exact broken code shown. `print(Hello, world!)` never reaches name lookup — the `!` makes it unparseable, so Python raises SyntaxError: invalid syntax. The learner runs it, sees SyntaxError, and the lesson (whose callout says 'read the error message') tells them it was a failed command lookup — directly contradicted by what's on their screen. The lesson's own compare block correctly shows that the name-lookup story (NameError) only applies to `print(Hello)` without the `!`.
  - quote: `Without quotes the computer reads Hello and world! as commands to look up, not text to show — and there is no such command, so it errors.`
  - fix: Either (a) change brokenCode to `print(Hello, world)` (no `!`), which genuinely produces NameError: name 'Hello' is not defined and makes the existing fix text true (adjust symptom/fix to the missing `!` in output), or (b) keep the code and rewrite the fix: without quotes Python cannot even parse the line — the `!` is not valid code, so it stops with a SyntaxError before running anything; quotes turn the whole thing into a string.
  - evidence: python3 on `print(Hello, world!)` → 'SyntaxError: invalid syntax' (caret at the `!`). python3 on `print(Hello)` → 'NameError: name 'Hello' is not defined'. Name lookup never happens for the debug snippet.

- **MEDIUM** — SYSTEMIC — appears in all 9 lab starters (grep count 9). The '# your code here' marker is indented two spaces at top level. The comment itself runs fine (starters execute with no output, so they fail the check for the intended reason), but an absolute beginner who types their code at the marker's indentation gets 'IndentationError: unexpected indent' — before indentation has been taught (Lessons 1–4 predate the indentation lesson). Small lab-integrity deduction applied to every lesson's score.
  - quote: `  # your code here`
  - fix: Remove the two leading spaces in every starter: change `  # your code here` to `# your code here` (replace_all across the file — 9 occurrences).
  - evidence: python3 on a starter with only the indented comment → runs, no error, no output. python3 on `score = 84\n  print("Grade: B")` (learner keeps the indent) → IndentationError: unexpected indent.

### variables-and-values — audit 96 → verify 98 PASS

- **LOW** — The assignment diagram's edge label says print(total_eggs) 'substitutes 18', but the diagram block itself never states per_box = 6 or boxes = 3 — those values only appear in the compare block that follows. The 18 dangles unexplained at the point the learner sees it.
  - quote: `substitutes 18`
  - fix: Add the values to the diagram (e.g. node description 'per_box * boxes → 6 * 3' or label 'substitutes 18 (6 * 3)'), or reorder so the compare block with per_box = 6, boxes = 3 precedes the diagram.
  - evidence: Verified 6 * 3 = 18 matches the compare block's values; all executed L2 snippets correct (walkthrough prints 20 then 15; debug prints 5; quiz chain prints 3; lab prints 48).

### numbers-and-strings — audit 98 → verify 99 PASS

No defects found.

### reading-input — audit 97 → verify 97 PASS

- **LOW** — The compare caption is a near-verbatim duplicate of the code-walkthrough caption three blocks earlier ('it tries to + text and a number BEFORE converting'), and this copy drops 'tries to', leaving the ungrammatical fragment 'it + text and a number'. Redundant and reads as a copy-paste slip.
  - quote: `it + text and a number before converting`
  - fix: Rewrite the compare caption to say something new (e.g. 'Convert on the same line you read: count = int(input()).'), or at minimum restore 'it tries to +' to match the walkthrough caption.
  - evidence: Both captions verified technically true: python3 `int(input() + 1)` with stdin '3' → TypeError: can only concatenate str (not "int") to str. All other L4 claims executed and correct (lab solution with stdin 'Sam\n3' prints exactly 'Sam, you have 3 items.'; debug TypeError confirmed; quiz age+age → '2525').

### booleans-and-logic — audit 92 → verify 97 PASS

- **MEDIUM** — The debug symptom claims the broken code might 'print nothing', but `if age = 18:` ALWAYS fails with SyntaxError — 'prints nothing' is impossible for the code as given. A learner who runs it sees only the error, and the hedged symptom implies a silent-failure mode that cannot occur, muddying the taught distinction (= in a condition is a syntax error, full stop).
  - quote: `but it prints nothing — or errors — instead`
  - fix: Change the symptom to: 'This should print Adult for age 20, but pressing Run gives a SyntaxError instead.'
  - evidence: python3 on `age = 20\nif age = 18:` → "SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?" — errors every time; nothing is ever printed.

- **MEDIUM** — Pedagogy gap: the sprint-contract promises 'combine conditions with and/or/not' and this teachback prompt asks learners to explain all three, but the lesson body teaches and/or/not only in a single compare-block caption sentence ('Combine conditions with and (both True), or (either True), not (flip).'). No concept coverage, no example, no lab or quiz use — learners are asked to teach back material the lesson never substantively taught.
  - quote: `What do and / or / not each do to True/False values?`
  - fix: Either add a short concept/example segment on and/or/not (e.g. a two-condition sign-in check in the walkthrough or a callout), or remove 'combine conditions with and/or/not' from the sprint-contract outcome and this teachback prompt.
  - evidence: Confirmed by reading every block of the lesson: and/or/not appears only in the compare caption, this teachback prompt, and the transfer suggestion — nowhere else.

- **LOW** — Confusing wording: '==' is the double-equals operator, so 'A single ==' reads as a contradiction in a lesson whose whole point is single-= vs double-==. The intended meaning ('using == here would test exactly 18') is muddled at the worst possible moment.
  - quote: `(A single == would test "exactly 18"`
  - fix: Change to '(== would test "exactly 18"; >= is the right test for "adult".)'.
  - evidence: Wording issue in the debug fix text; the surrounding technical claims all verified (SyntaxError confirmed; `if age >= 18:` with age 20 prints Adult; lab with score 84 prints exactly 'Grade: B'; quiz x=5 prints 'medium').

### lists — audit 96 → verify 99 PASS

- **LOW** — Sequencing: the diagram's legend uses negative indexing (names[-1]) before the lesson has introduced it — negative indexes are first explained two blocks later (compare block, then callout). A beginner hits unexplained syntax in the legend.
  - quote: `names[-1] — always the last item`
  - fix: Change the legend entry to reference what is already taught (e.g. 'names[2] — the last item is at len - 1') or move the diagram after the compare block that introduces [-1].
  - evidence: Block order read directly from the file: concept → diagram (legend with [-1]) → code-walkthrough → compare (introduces [-1]) → callout. python3 confirms colors[-1] → 'green'.

- **LOW** — The sprint-contract promises membership testing ('in'), but no lab step, verification item, or quiz question ever exercises it — it appears only in the concept sentence, a compare caption, and one teachback prompt. The contract promises slightly more than the lesson proves.
  - quote: `and ask whether something is in it`
  - fix: Either add a membership step to the lab/verification (e.g. print whether "milk" is in cart), or trim 'and ask whether something is in it' from the sprint-contract outcome.
  - evidence: Confirmed by reading all blocks. All executed L6 claims correct: lab solution prints exactly 'milk' then '4'; names[3]/colors[3] → IndexError: list index out of range; quiz — after append, len 3 and nums[1] still 20.

### loops — audit 97 → verify 96 PASS

- **LOW** — The compare caption asserts 'passes ends at 2' but the block never shows the scores data — the left column only shows `for score in scores:` with no list literal, so the claimed result is unverifiable from anything on screen.
  - quote: `passes ends at 2`
  - fix: Show the data in the compare lines (e.g. add 'scores = [45, 80, 72]' as the first line) or drop the specific count: '...bump a counter — passes ends at the number of matches.'
  - evidence: No scores list appears anywhere in the compare block (verified by reading it). All executed L7 claims correct: walkthrough [4,6,10] → 20; debug [5,5,5] with total=0 inside loop prints 5; lab sum → 60; range(3) prints 0,1,2 with last i = 2.

### functions-basics — audit 98 → verify 99 PASS

No defects found.

### build-a-tiny-program — audit 90 → verify 99 PASS

- **HIGH** — Wrong lesson cross-reference in the capstone verification checklist: functions are Lesson 8 in this module; Lesson 7 is Loops. The whole checklist uses a stale 8-lesson numbering from before Reading Input (Lesson 4) was inserted, and it contradicts the lesson's own diagram, which correctly labels functions 'L8'.
  - quote: `Your program defines a function and CALLS it (Lesson 7)`
  - fix: Change '(Lesson 7)' to '(Lesson 8)'.
  - evidence: Seed order in the file: your-first-program(1), variables(2), numbers-and-strings(3), reading-input(4), booleans(5), lists(6), loops(7), functions-basics(8), capstone(9). The capstone diagram node says 'report — L1 & L8' for print+return.

- **HIGH** — Wrong cross-references: if/elif/else is Lesson 5 and loops is Lesson 7 in the shipped 9-lesson module. Lesson 4 is Reading Input and Lesson 6 is Lists — a learner mapping skills back to lessons is sent to the wrong lessons. Contradicts the capstone diagram ('count passes — L5', 'one pass — L7').
  - quote: `It uses an if INSIDE the loop to count only the passing scores (Lessons 4 & 6)`
  - fix: Change '(Lessons 4 & 6)' to '(Lessons 5 & 7)'.
  - evidence: Lesson order verified from the seed array; capstone diagram nodes read 'if s >= 60 … count passes — L5' and 'for s in scores … one pass — L7'.

- **MEDIUM** — Stale cross-reference: under the old numbering '6' meant Loops; in the shipped module Loops is Lesson 7 (Lesson 6 is Lists). The accumulator-before-loop pattern is Lessons 2 & 7.
  - quote: `It loops over the list once, with an accumulator set up before the loop (Lessons 2 & 6)`
  - fix: Change '(Lessons 2 & 6)' to '(Lessons 2 & 7)'.
  - evidence: Same lesson-order evidence as above; the loops lesson (sort 6, 'Lesson 7' in eyebrow) is where the accumulator pattern is taught.

- **MEDIUM** — Stale cross-reference: '6' here meant Loops in the pre-insertion numbering; computing after the loop is Lesson 7 material (f-strings are correctly Lesson 3). As written it points at Lists.
  - quote: `It computes the average AFTER the loop and formats output with f-strings (Lessons 3 & 6)`
  - fix: Change '(Lessons 3 & 6)' to '(Lessons 3 & 7)'.
  - evidence: Same lesson-order evidence; the after-the-loop computation pattern is taught in the loops lesson (Lesson 7).

- **LOW** — Off-by-one from the same stale 8-lesson numbering: this is Lesson 9, and printing was taught in Lesson 1 — eight lessons ago.
  - quote: `Seven lessons ago you could not print a line.`
  - fix: Change to 'Eight lessons ago you could not print a line.'
  - evidence: Capstone is sort 8 / 'Lesson 9' in its eyebrow; printing is Lesson 1. All executed L9 code claims verified correct: lab solution prints exactly 'Passed: 3 of 5' then 'Average: 70' (350/5=70); debug prints 'Average: 17' (85/5=17); compare-block arithmetic confirmed.

**Rewrite applied:**
- your-first-program (critical): rewrote the debug fix text to the true mechanism — kept brokenCode `print(Hello, world!)` and explained that the `!` makes the line unparseable so Python stops with a SyntaxError before running anything (option b). Verified: python3 on the broken line yields 'SyntaxError: invalid syntax' with caret at `!`.
- systemic lab-integrity (medium): dedented the starter marker `  # your code here` -> `# your code here` via replace_all — all 9 occurrences (lines 47, 212, 384, 569, 744, 922, 1094, 1271, 1454 pre-edit). Inspected every starter afterward; all markers are top-level, so column-0 is the correct typing position in each. Verified: learner code at the old 2-space indent raises IndentationError.
- booleans-and-logic (medium): debug symptom changed to 'This should print Adult for age 20, but pressing Run gives a SyntaxError instead.' Verified: `if age = 18:` always raises SyntaxError (with the 'Maybe you meant ==' hint); nothing is ever printed.
- booleans-and-logic (medium, pedagogy gap): added a tip callout immediately after the =/== compare block teaching and/or/not with runnable examples (sign-in `name == "sage" and code == 1234`, weekend `or`, `not is_raining` flip) and a pointer to try `and` in the lab — this backs the sprint-contract outcome and the teachback prompt, and dovetails with the existing transfer suggestion ('right name AND right code with and'). Consistent adjacent change: none beyond the insertion; existing compare caption left as-is since it is now a summary of taught material.
- build-a-tiny-program (high): '(Lesson 7)' -> '(Lesson 8)' for define-and-call a function.
- build-a-tiny-program (high): '(Lessons 4 & 6)' -> '(Lessons 5 & 7)' for if-inside-the-loop pass counting.
- build-a-tiny-program (medium): '(Lessons 2 & 6)' -> '(Lessons 2 & 7)' for accumulator-before-loop.
- build-a-tiny-program (medium): '(Lessons 3 & 6)' -> '(Lessons 3 & 7)' for average-after-loop + f-strings.

**Verify residue (post-rewrite):**
- LOW booleans-and-logic: callout overclaims that colon mistakes fail silently — quote: "A stray colon or a wrong indent does not look wrong, but it silently puts code in the wrong branch." (a stray/missing colon is a loud SyntaxError; only indentation is silent)
- LOW loops: compare caption asserts a result for data never shown in the block — quote: "loop the scores, test each with if, bump a counter — passes ends at 2"
- LOW reading-input: near-duplicate caption on walkthrough and compare blocks, compare variant reads telegraphic — quote: "int(input() + 1) errors — it + text and a number before converting"
- LOW variables-and-values/loops: numeric-only lab checks ('48', '60') are passable by hardcoding print(48)/print(60); mitigated by explicit copy — quotes: "do not just print 48 directly", "Do NOT type the answer in by hand"

---

## scripts/academy/seed-programming-fundamentals.ts  ·  programming-fundamentals

### input-validation — audit 94 → verify 99 PASS

- **MEDIUM** — Lab checkpoint is weaker than the skill taught: a degenerate validator that rejects EVERYTHING (def validate_age(v): raise ValueError('nope')) passes the automated check, because the harness output still contains the substring "rejected '25'" even when valid input 25 is also rejected.
  - quote: `check: "rejected '25'"`
  - fix: Make the checkpoint assert both directions, e.g. change the harness to print a computed PASS line (accepted 25 AND rejected '25'/-3/200) and set check: 'PASS: True' like the other eight labs.
  - evidence: python3 run: always-raise impl produced "rejected 25: nope / rejected '25': nope / rejected -3: nope / rejected 200: nope" and the check substring "rejected '25'" was present (True). Correct impl verified separately: accepted 25, rejected the other three.

- **MEDIUM** — Course row is seeded with hours: 1 while this file seeds nine lessons at est_minutes: 75 each (~11.25 hours) — the learner-facing course card understates the course by an order of magnitude.
  - quote: `hours: 1,`
  - fix: Set hours to the real total (e.g. hours: 11) or compute it from the seeded lessons' est_minutes.
  - evidence: Internal file inconsistency: 9 upserts each with est_minutes: 75; 9 x 75 = 675 min = 11.25 h vs hours: 1.

- **LOW** — The intended fix (isinstance(value, int) + range) accepts True/False because bool is a subclass of int — validate_age(True) is accepted, contradicting 'ONLY an int'. The harness never tests a bool, so this slips through silently.
  - quote: `Accept ONLY an int in 0..120`
  - fix: Either add a bool guard to the taught pattern (isinstance(value, int) and not isinstance(value, bool)) or add a footnote; optionally add True to the harness inputs.
  - evidence: python3: validate_age(True) with the taught isinstance+range pattern printed 'True ACCEPTED (bool is int subclass)'.

- **LOW** — The --dry-run summary (and the file header comment) still describes only lesson 1, while the script now seeds 9 lessons — stale operator-facing output that misreports what --apply will do.
  - quote: `lessonSlug: 'input-validation',`
  - fix: Report all nine lesson slugs/block counts in the dry-run JSON and update the header comment to reflect the full module.

### error-handling — audit 96 → verify 100 PASS

- **MEDIUM** — Lab checkpoint is gameable: an implementation that ALWAYS raises ValueError('cannot divide by zero') and never divides passes the check — safe_divide(10, 2) never returns 5.0 (the harness's 'ok:' line never prints), yet the checkpoint substring still appears. The verification checklist claims 'safe_divide(10, 2) returns 5.0' but the automated gate does not enforce it.
  - quote: `check: 'error surfaced: cannot divide by zero'`
  - fix: Have the harness verify the happy path too, e.g. compute ok = (safe_divide(10, 2) == 5.0) before the error case and print a combined 'PASS: True' line; set check accordingly.
  - evidence: python3 run: always-raise impl output was exactly 'error surfaced: cannot divide by zero' (the 'ok: 5.0' line absent) and the check substring matched (True). Correct impl verified: prints 'ok: 5.0' then 'error surfaced: cannot divide by zero'.

### functions-and-modules — audit 98 → verify 100 PASS

- **LOW** — Harness comment is a framing fiction: globals()["discount"] = 7 executes in the same module, not another module. Harmless as a simulation, but literally inaccurate.
  - quote: `another module changes the global mid-run`
  - fix: Reword to 'simulates another part of the app changing the global mid-run'.
  - evidence: python3 run of starter as-is: correct: True / pure: False / PASS: False (fails for exactly the stated reason). Pure fix (return price * qty): PASS: True. Walkthrough cart_total prints 30 as claimed.

### types-and-data — audit 89 → verify 100 PASS

- **HIGH** — Verification item states a claim that is literally false in Python — '2' + '3' produces '23' — and directly contradicts this lesson's own pretest reveal ("`'2' + '3'` is `'23'` (string concatenation)"), on the lesson's central concept. A learner checking this item as written would be verifying a falsehood.
  - quote: `'2' + '3' produces 5, not '23' — values are converted, not concatenated`
  - fix: Reword to: "total_quantity(['2','3']) returns 5 — elements are converted with int() before summing, never concatenated".
  - evidence: python3: repr('2' + '3') == "'23'"; 2 + 3 == 5. The pretest reveal in the same lesson states the opposite of this verification line.

- **MEDIUM** — Same literal falsehood in the lab summary: as written, the expression '2'+'3' gives '23'. Context ("Convert each to an int") softens it, but the sentence still asserts an untrue evaluation on the exact expression the lesson teaches evaluates to '23'.
  - quote: `'2'+'3' must give 5, not '23'`
  - fix: Reword to "the elements '2' and '3' must contribute 5 to the sum, not concatenate to '23'".
  - evidence: python3: '2'+'3' == '23'. Lab itself verified sound: fixed impl prints 'sum: 10 / PASS: True'; debug broken impl returns '235' as the symptom claims; quiz claim confirmed ('25' + 1 raises TypeError: can only concatenate str (not "int") to str; int('25') + 1 == 26).

### control-flow — audit 96 → verify 98 PASS

- **LOW** — Overgeneralization in the pretest reveal: 'every other item' is only true when every item matches the removal condition. In the lesson's own harness data, exactly one element (id 3) is skipped, not alternating items. The first clause of the sentence is the accurate mechanic.
  - quote: `you end up processing every other item`
  - fix: Reword to '…so the loop skips the element right after each removal — consecutive matches slip through unprocessed.'
  - evidence: python3 run of the debug broken code on the harness data: returned ids [1, 3, 4] — one cancelled order (id 3) skipped; the fixed comprehension yields [1, 4] and PASS: True with input unmutated (len(data) == 4).

- **LOW** — The unmodified starter crashes with an unhandled traceback (TypeError: 'NoneType' object is not iterable, because the stub returns None) instead of reaching the PASS: False line — every other lab in the module fails gracefully with a printed PASS/False or clear assert.
  - quote: `ids = [o["id"] for o in active_orders(data)]`
  - fix: Guard the harness, e.g. result = active_orders(data) or []; or have the stub `return orders` so the harness reports PASS: False.
  - evidence: python3: stub active_orders returned None; list comprehension over it raised TypeError: 'NoneType' object is not iterable.

### files-and-io — audit 94 → verify 99 PASS

- **MEDIUM** — Diagram teaches a false mechanic: when open(path) raises FileNotFoundError, no file handle was ever acquired, so nothing is closed — yet the edge routes 'Missing file?' to the 'Handle closed' node whose description claims 'guaranteed on every path'. `with` guarantees close only for exceptions raised AFTER the file opened; a failed open has no handle to release.
  - quote: `raises → still closes`
  - fix: Route the missing-file branch to its own outcome (e.g. 'FileNotFoundError surfaces — no handle was opened') and scope 'guaranteed on every path' to paths where open succeeded.
  - evidence: Python semantics: open() raises before the context manager's __enter__ ever runs; there is no handle to close. Lab itself verified sound: fixed read_config prints config: {'host': 'localhost', 'port': '8080'} / PASS: True; missing.conf raises FileNotFoundError; split('=', 1) preserves '=' in values as the walkthrough claims.

### testing-and-debugging — audit 98 → verify 99 PASS

- **LOW** — Verification item is contradicted by the lesson's own worked example: the test_safe_average suite in the code-walkthrough uses bare asserts with no messages, so the lesson models the opposite of what the checklist demands.
  - quote: `Each assertion has a clear message`
  - fix: Add messages to the walkthrough asserts (e.g. assert safe_average([]) == 0, 'empty list regression') or soften the checklist item.
  - evidence: python3: full harness + walkthrough suite all green ('all assertions passed / PASS: True'); sum([]) / len([]) confirmed to raise ZeroDivisionError as the lesson claims; safe_average([2,4,6]) == 4 and [-2,2] == 0 verified.

### cli-workflow — audit 99 → verify 100 PASS

No defects found.

### git-fundamentals — audit 99 → verify 99 PASS

No defects found.

**Rewrite applied:**
- input-validation lab checkpoint: harness now records accepted/rejected outcomes for [25, '25', -3, 200] and prints a computed PASS line (PASS only when 25 is accepted AND the other three rejected); check changed to 'PASS: True'. Verified: always-raise impl -> PASS: False; correct impl -> PASS: True. Adjacent consistent change: lab summary's last sentence updated to 'Accept the valid 25, reject the rest.' so the prose matches the two-directional gate.
- course hours: hours: 1 -> hours: 11 (9 lessons x est_minutes: 75 = 675 min = 11.25 h).
- error-handling lab checkpoint: harness now computes ok = (safe_divide(10, 2) == 5.0) in its own try block, then checks the error surfaces on divide-by-zero, and prints 'PASS: {ok and surfaced}'; check changed to 'PASS: True'. Verified: always-raise impl -> PASS: False; correct impl -> ok: 5.0 + error surfaced + PASS: True. Adjacent consistent change: lab summary updated to say the checkpoint proves BOTH the happy path returns 5.0 AND the error surfaces.
- types-and-data verification item: false claim reworded to "total_quantity(['2','3']) returns 5 — elements are converted with int() before summing, never concatenated". Verified with python3: '2'+'3' == '23', total_quantity(['2','3']) == 5.
- types-and-data lab summary: reworded to "the elements '2' and '3' must contribute 5 to the sum, not concatenate to '23'" (no longer asserts the expression '2'+'3' evaluates to 5).
- files-and-io diagram: missing-file branch now routes to a new 'noopen' outcome node ('FileNotFoundError surfaces — open failed, no handle was ever acquired, nothing to close') instead of 'Handle closed'; 'Handle closed' description scoped to 'guaranteed once open succeeded'. Adjacent forced changes for consistency: diagram title ('once the file is open' instead of 'on every exit'), subtitle (failed open never acquires a handle), and warning legend ('handle released only if it was acquired') — all three repeated the same false mechanic the edge encoded.

**Verify residue (post-rewrite):**
- LOW input-validation (compare block): compressed wording '"-3" silently becomes 0 or -3' — executed int("-3" or 0) which prints -3, never 0; the '0' outcome only occurs for falsy inputs like '' — line conflates two cases.
- LOW control-flow (lab starter): unimplemented starter returns None so the harness crashes with "TypeError: 'NoneType' object is not iterable" at 'ids = [o["id"] for o in active_orders(data)]' instead of printing the checkpoint's 'PASS: False' (verified by running the starter; checkpoint still correctly fails since 'PASS: True' never prints).
- LOW control-flow (pretest reveal): 'you end up processing every other item' — only strictly true when every item matches; the exact behavior (skip the element right after each removal) is stated correctly in the preceding clause.
- LOW files-and-io (debug symptom): 'silently returns {} when the file is missing' is incomplete — executed the brokenCode against the lesson's own config content and it also returns {} for the VALID file (blank line -> ValueError swallowed by 'except Exception'); the fix text does mention parse errors, but the symptom understates it.
- LOW testing-and-debugging (compare block): title 'You found a bug: just fix it vs fix it AND add a test' lists options in the opposite order of the columns (left column is 'Fix + regression test', right is 'Just fix it').
- LOW git-fundamentals (diagram node): 'rewrites others history' — missing apostrophe (should be others').

---

## scripts/academy/course00/seed-module-1.ts  ·  career-engineering_judgment_foundation

### 01-problem-frame — audit 74 → verify 99 PASS

- **CRITICAL** — The Lesson 1 code-walkthrough highlights the wrong line for 5 of its 6 steps — every step after the first is offset +2 from its target in FRAME_MEMO_TEMPLATE. The renderer (SageCodeWalkthrough.tsx) documents 'steps each highlight a set of 1-based lines'. Actual 1-based content: line 6 = '- Hard constraint...' (claimed 'Decision + deadline'), line 7 = '- Feared failure...' (claimed 'The problem line'), line 8 = '- Reversibility...' (claimed 'The hard constraint'), line 9 = BLANK (claimed 'Feared failure'), line 10 = the HTML comment (claimed 'Reversibility'). The learner watches 'Decision + deadline' light up the constraint line, 'Feared failure' light up an empty line, and 'Reversibility' light up an HTML comment — the walkthrough visually teaches false label-to-content mappings in the module's foundational artifact.
  - quote: `{ lines: [6], label: 'Decision + deadline'`
  - fix: Renumber the steps to the actual 1-based lines: 'The header' → [1] (the memo title, which the note 'This memo threads all four lessons' describes), 'Decision + deadline' → [4], 'The problem line' → [5], 'The hard constraint' → [6], 'Feared failure' → [7], 'Reversibility' → [8].
  - evidence: python3 script split FRAME_MEMO_TEMPLATE on newlines and printed each claimed line: "step 'Decision + deadline' claims line 6: '- Hard constraint (the thing that is NOT negotiable):'", "step 'The problem line' claims line 7: '- Feared failure...'", "step 'The hard constraint' claims line 8: '- Reversibility...'", "step 'Feared failure' claims line 9: ''", "step 'Reversibility' claims line 10: '<!-- Sections 2-5 are added... -->'". Contrast: the same script confirmed Lessons 2, 3, 4 walkthrough line claims all map correctly under the same 1-based convention, proving the convention and isolating the Lesson 1 offset.

- **MEDIUM** — The memo template promises five sections and implies the capstone is a fifth lesson beyond Lessons 2–4. The module has exactly four lessons, Lesson 4 IS the capstone (intensity: 'capstone', comment '(module capstone)'), and Lesson 4's own sprint-contract describes the finished memo as '(all four sections) PLUS a calibration log'. A learner following the template expects a Section 5 that never arrives.
  - quote: `Sections 2–5 are added in Lessons 2, 3, 4 and the capstone.`
  - fix: Change the comment to match reality, e.g. '<!-- Sections 2–4 are added in Lessons 2, 3 and the capstone (Lesson 4). -->'
  - evidence: Both quotes grep-verified verbatim in the file: the template comment says 'Sections 2–5' while Lesson 4's proof string says '(all four sections) PLUS a calibration log'. RETRIEVAL_PROTOCOL_SECTION contains '## 4. Retrieval Protocol' and an unnumbered '## Calibration log' — no Section 5 exists anywhere.

- **MEDIUM** — The file's own design statement promises the arc is delivered 'through tradeoff', 'flawed reasoning through debug', and 'a worked judgment call through worked-example' — yet zero 'tradeoff', 'debug', 'worked-example', or 'calibration' blocks appear in any of the four lessons, even though all four block types exist in the LessonBlock union (data/academy/sample-course.ts lines 21, 23, 24, 27). Module-wide consequence: no lesson exercises flawed reasoning (no debug), no lesson stages the real decision as an explicit tradeoff, and Lesson 4 — entirely about calibration — never uses the dedicated calibration block. This is also the gap behind Lesson 4's dangling 'worked run' reference (see 04-retrieval-protocol ledger).
  - quote: `the real decision through tradeoff; flawed`
  - fix: Either add the promised blocks (a 'debug' block with a flawed frame/route to critique, a 'tradeoff' block for the ship-vs-reindex decision, a 'worked-example' block for the worked closed-note run referenced in Lesson 4) or rewrite the header comment to describe the delivery mechanisms actually used (compare + code-walkthrough + verification).
  - evidence: grep of the file: no occurrence of type: 'tradeoff', type: 'debug', type: 'worked-example', or type: 'calibration' in any blocks array; sed of data/academy/sample-course.ts lines 10-30 confirms all four types are supported by the schema.

### 02-diagnostic-route — audit 87 → verify 99 PASS

- **HIGH** — The diagram's 'Cheapest kill-test' node attributes the timestamp-compare test to Hypothesis B, but this lesson's own memo section assigns exactly that test to Hypothesis A: 'Hypothesis A (lag): index worker is behind → kill-test: newest indexed doc vs newest DB write', while B (silent-fail) gets 'worker error-log + dead-letter count'. Lesson 4 reconfirms the A attribution ('The timestamp compare was the cheapest disqualifier' in the run where lag/A survives), and this lesson's walkthrough caption confirms the timestamp test found the lag. A learner cross-referencing the diagram against the memo they are told to write gets the module's running example's hypothesis identities scrambled — in the lesson whose whole skill is mapping kill-tests to hypotheses.
  - quote: `description: 'B: compare newest index vs DB timestamp'`
  - fix: Change the node description to "A: compare newest index vs DB timestamp" (and if B was intended, swap in B's actual kill-test, the error-log + dead-letter count — but A is correct given the diagram's 'cause' node reads '"index lags 5h"', i.e. A survives).
  - evidence: All three quotes verified verbatim in the file: ROUTE_MEMO_SECTION line 2 gives the timestamp kill-test to A; the diagram node says 'B:'; Lesson 4's walkthrough note says the timestamp compare was the cheapest disqualifier in the same worked scenario whose surviving cause is lag (A).

- **MEDIUM** — The diagram's 'Rank hypotheses' node lists four hypotheses including 'D mapping-drop', but Hypothesis D appears nowhere else: the memo section lists exactly three (A, B, C), the run order is 'A → B → C', and the walkthrough steps cover only lines for A–C. A learner tracing the diagram against the memo watches D silently vanish, and cannot tell whether the memo is incomplete or the diagram is wrong.
  - quote: `description: 'A lag · B silent-fail · C stale-cache · D mapping-drop'`
  - fix: Either drop '· D mapping-drop' from the node description, or add a fourth hypothesis line ('- Hypothesis D (mapping-drop): ...  → kill-test: ... → cost: ...') to ROUTE_MEMO_SECTION and extend the run order.
  - evidence: grep: 'mapping-drop' occurs exactly once in the file (the diagram node); ROUTE_MEMO_SECTION contains only Hypotheses A, B, C and 'Run order (cheapest disqualifier first): A → B → C'.

### 03-system-map — audit 88 → verify 98 PASS

- **HIGH** — The text System Map — the exemplar artifact learners copy into their memo — misdraws the read path. Measured columns (0-based): the caret '^' on line 5 sits at column 71, which lands inside '[Index Worker]' (columns 64–77) on line 4, not '[Search Index]' (columns 83–96); and the query line's connector '+' sits at column 39, nowhere near the caret it is supposed to meet. As drawn, the client's query points at the Index Worker and the '--query--------' line dangles into empty space. This directly contradicts the same walkthrough's step note ('The Client reads from Search, not Postgres') and the diagram block's edge (client → search, 'queries') — in the lesson whose verification item is 'A peer can trace one request end-to-end through your arrows without you narrating.' A peer cannot trace this one.
  - quote: `[Client] --query-------- + (reads here)`
  - fix: Redraw the read path so the query line's connector and caret align under [Search Index], e.g. extend line 6's dashes so its '+' sits at column 71+ and move the '^' to column ~89 (under [Search Index]), or restructure to a simpler unambiguous form such as '[Client] --query--> [Search Index]' on its own line.
  - evidence: python3 computed: line 4 = '...+--emits event--> [Index Worker] --> [Search Index]' with [Index Worker] at cols 64-77 and [Search Index] at cols 83-96; caret col = 71 (prints inside '-> [Index Worker] --' window); line 6 '+' col = 39; alignment check 'caret aligns with plus? False'.

### 04-retrieval-protocol — audit 93 → verify 97 PASS

- **LOW** — The walkthrough narrates results of "the worked run" (Map scored 3/5; the missed Analytics edge; the chosen fix-worker-plus-backfill decision) as if the learner has seen that run — but no worked-example block exists in this or any prior lesson, so the run's facts (including an Analytics consumer never present on the Lesson 3 map) surface only inside these step notes. Definite-article framing of an unshown artifact; the file header explicitly promised 'a worked judgment call through worked-example' (see 01-problem-frame ledger for the module-wide defect).
  - quote: `This is the step the worked run scored 3/5`
  - fix: Either add a worked-example block presenting the closed-note run whose results these notes reference, or reword the notes to introduce it as a fresh illustration (e.g. 'In a sample run, this step scored 3/5 — and was still too high').
  - evidence: grep: no type: 'worked-example' block anywhere in the file; 'Analytics' appears only in Lesson 4 step notes and the compare panel, never in the Lesson 3 map or diagram; the results are internally consistent across the Lesson 4 blocks (3/5 Map, Analytics miss, reusable-rule repair), so this is a framing gap, not a factual contradiction.

**Rewrite applied:**
- 01-problem-frame (critical): renumbered all six code-walkthrough steps to the actual 1-based lines of FRAME_MEMO_TEMPLATE — 'The header' [3]→[1] (memo title), 'Decision + deadline' [6]→[4], 'The problem line' [7]→[5], 'The hard constraint' [8]→[6], 'Feared failure' [9]→[7], 'Reversibility' [10]→[8]; python3 re-verified each new line number maps to the matching content.
- 01-problem-frame (medium): template comment '<!-- Sections 2–5 are added in Lessons 2, 3, 4 and the capstone. -->' rewritten to '<!-- Sections 2–4 are added in Lessons 2, 3 and the capstone (Lesson 4). -->' matching the four-lesson/four-section reality.
- 01-problem-frame (medium): header design comment rewritten to describe the delivery mechanisms actually used — grep confirmed zero 'tradeoff'/'debug'/'worked-example'/'calibration' blocks in the file; comment now cites sprint-contract + verification, compare (strong-vs-weak reasoning), and code-walkthrough (memo grown line by line). Chose the rewrite option over authoring three net-new content blocks, per surgeon scope.
- 02-diagnostic-route (high): 'Cheapest kill-test' diagram node description 'B: compare newest index vs DB timestamp' → 'A: ...' — A is confirmed correct: ROUTE_MEMO_SECTION assigns the timestamp compare to Hypothesis A, and the diagram's surviving cause is 'index lags 5h' (A).
- 02-diagnostic-route (medium): dropped '· D mapping-drop' from the 'Rank hypotheses' node description so the diagram lists exactly the memo's three hypotheses (A/B/C); matches run order 'A → B → C'.
- 03-system-map (high): redrew the read path in the text System Map — caret moved to column 89 (inside [Search Index], cols 83–96) and the '[Client] --query' line's dashes extended so its '+' also sits at column 89, directly under the caret; python3 re-verified aligned=True and under-SearchIndex=True. Line count preserved (still 9 lines) so walkthrough steps [5,6]/[7]/[8]/[9] remain correct — no adjacent change needed.

**Verify residue (post-rewrite):**
- L4 medium (pedagogy): walkthrough note narrates a worked run absent from the displayed blank template — "This is the step the worked run scored 3/5 — and still too high."
- L3 low (copy): curly quotes in mission prose, inconsistent with straight quotes elsewhere in file — "and says “the gap is here.”"
- L1 low (copy): en dash inside a code block — "<!-- Sections 2–4 are added in Lessons 2, 3 and the capstone (Lesson 4). -->"
- All lessons low (copy): markdown memo code blocks labeled language: 'bash' — "language: 'bash'"

---

## scripts/academy/course00/seed-module-2.ts  ·  career-engineering_judgment_foundation

### 05-tiny-artifact — audit 95 → verify 99 PASS

- **MEDIUM** — Quiz key is telegraphed: the correct option is index 1 in ALL four lessons of this module (grep shows `answer: 1,` x4) and is always by far the longest, most nuanced option. A learner can pass all four quizzes without reading the lessons.
  - quote: `It is shrunk to the smallest form a reviewer can inspect in about two minutes, while still carrying the decision, the rejected option, and the proof.`
  - fix: Shuffle the correct answer's position across the four lessons and balance option lengths so the key is not the visibly longest option.
  - evidence: Ran `src.count("answer: 1,")` -> 4; visually compared option lengths in all four quiz blocks — the marked answer is the longest in every case.

### 06-failure-injection — audit 94 → verify 99 PASS

- **MEDIUM** — Same module-wide quiz telegraphing: correct answer again at index 1 and again the longest option (pattern holds in all 4 lessons).
  - quote: `Because the purpose is to harden the decision: a realistic failure changes what you would watch and do, while a toy failure lets you feel thorough without improving anything.`
  - fix: Move the key to a different index for this lesson and trim the correct option to comparable length with the distractors.
  - evidence: grep `answer: 1,` -> 4 occurrences, one per lesson; option-length comparison confirms longest-option-is-correct in each.

- **LOW** — Ambiguous phrasing: the injected premise is that the cause is a DOWNSTREAM cache eviction ("NOT the release"), so the bug is not "in v2.3.9" — it persists regardless of version. As written it can momentarily read as contradicting line 5 of the same autopsy.
  - quote: `the real bug is still live in v2.3.9.`
  - fix: Reword to: "the real (downstream) bug is still live even on v2.3.9."
  - evidence: Numbered FAILURE_AUTOPSY_SECTION via python3: line 5 says cause is downstream, line 6 locates the bug 'in v2.3.9' — internal tension confirmed by direct comparison.

- **LOW** — Highlight convention drifts from Lesson 05: L05 steps include the section header line (e.g. [4,5] covers '## Context' + content); all four L06 steps highlight content only, leaving the '## Injected failure' etc. headers un-highlighted.
  - quote: `lines: [5, 6], label: 'Inject the most realistic failure'`
  - fix: Include the header lines: [4,5,6], [8,9,10], [12,13,14], [16,17,18] to match the L05 walkthrough convention.
  - evidence: python3 line-numbering of both template literals: L05 steps start at header lines (4,7,10,13,17,20); L06 steps start one line after each header (5,9,13,17).

### 07-tradeoff-decision — audit 84 → verify 99 PASS

- **HIGH** — Wrong cross-reference inside the memo exemplar: the unwired-payment-flag risk is the L05 rejected-option reason ("Rejected: flag not wired for the payment call"), NOT the L06 injected failure. L06's injected failure is the downstream cache eviction — which this very section correctly labels 8 lines later ("## Risk if wrong (reuse the L06 injected failure)"). The section contradicts itself about what L06 injected, corrupting the arc-callback the lesson explicitly teaches ("The module compounds").
  - quote: `B: flag not wired for payments (the L06 failure)`
  - fix: Change to: "B: flag not wired for payments (the L05 rejected-option risk)"
  - evidence: python3 line-numbering: TRADEOFF_SECTION line 14 attributes the flag risk to L06; lines 21-23 attribute the downstream-spike failure to L06; FAILURE_AUTOPSY_SECTION lines 4-6 confirm the injected failure is the downstream eviction; TINY_ARTIFACT_MEMO lines 13-15 confirm the flag risk originates in L05.

- **HIGH** — Stale AWS fact presented as the gold-standard repair in the compare block: Amazon SQS maximum message payload was raised from 256 KiB to 1 MiB on Aug 4, 2025 (256 KiB is now only the default/configurable setting, not the service limit). A paid learner would repeat "SQS has a 256KB limit" as fact.
  - quote: `Risk if wrong: 256KB limit -> alert at 200KB`
  - fix: Change to: "Risk if wrong: 256KiB default msg-size cap (raisable to 1MiB) -> alert at 200KB" or swap the risk to the FIFO throughput cap.
  - evidence: WebSearch confirmed AWS announcement "Amazon SQS increases maximum message payload size to 1 MiB" dated 2025-08-05 (aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib), predating this file's authoring.

- **MEDIUM** — Same module-wide quiz telegraphing: correct answer at index 1 and the longest option, third lesson in a row.
  - quote: `One option carries only upsides and the other only downsides, and a pro/con tally — not a binding constraint — does the deciding.`
  - fix: Shuffle key position and balance option lengths.
  - evidence: grep `answer: 1,` -> 4/4 lessons; length comparison of the four options.

### 08-testa-proof — audit 76 → verify 96 PASS

- **CRITICAL** — False recap of the module's own content, taught in an instructional step note. L06's injected failure — the autopsy actually appended to the shared memo — is "The latency spike was caused by a downstream cache eviction, NOT the release." Stale prices was only the L06 compare-block SIDE EXAMPLE (a teammate's caching memo). The capstone therefore claims to close a loop it does not close: the memo's real injected failure (downstream cause) is never proven absent, and "The module closes its own loop" is false as stated.
  - quote: `The Lesson 06 injected failure was stale prices. 10k sampled reads, 0 mismatches over 24h — this proves the injected failure does not occur. The module closes its own loop.`
  - fix: Either (a) rewrite the recap and PROOF_SECTION to prove the rollback memo's decision — e.g. executable check: p99 held < 350ms through the NEXT traffic peak on v2.3.9 (the exact L06 detection signal), closing the downstream-cause failure — or (b) explicitly reframe the whole L08 walkthrough as continuing the caching worked-example, and stop attributing stale prices to "the Lesson 06 injected failure".
  - evidence: python3 line-numbering: FAILURE_AUTOPSY_SECTION lines 4-6 define the injected failure as downstream cache eviction; the stale-price failure appears only in L06's compare.right lines; grep confirms "stale price" never appears in the memo-thread templates before PROOF_SECTION.

- **HIGH** — Memo storyline pivot: the file header promises "every lesson grows the same memo" and L05-L07 grow the ROLLBACK memo (v2.4.0 spike, rollback to v2.3.9), but the L08 walkthrough — still labeled filename ${MEMO} — proves the CACHING decision from the side examples ("Cut checkout p99 740ms -> 210ms with a targeted TTL cache"). The "Module roll-call — the four-part artifact, complete" is therefore false for the artifact the learner actually built: its four parts span two different scenarios.
  - quote: `Prove the caching decision. Watch the strongest available mode get selected, the L06 failure closed, and confidence calibrated to the evidence.`
  - fix: Rewrite PROOF_SECTION to prove the rollback decision (Testa executable: latency held through next peak; contract: no downstream re-spike / incident stays closed), keeping the caching numbers only in the compare block where they started.
  - evidence: python3 side-by-side of the four templates: TINY_ARTIFACT_MEMO/FAILURE_AUTOPSY_SECTION/TRADEOFF_SECTION are all the rollback scenario; PROOF_SECTION lines 5-6, 9-10, 17-18 are all the caching scenario, yet share filename MEMO and claim the roll-call is 'complete'.

- **HIGH** — Same false L06 attribution embedded in the memo text itself — the exemplar learners are told to copy asserts that L06's failure was stale prices ("## Contract check (closes the L06 failure)" two lines above makes the same false claim).
  - quote: `(Proves the L06 stale-price failure absent.)`
  - fix: If the caching scenario is kept, change to "(Proves the stale-price failure from the L06 worked example absent.)" and retitle the section "## Contract check (closes the injected failure)"; if the memo is rewritten to the rollback thread, replace with the downstream-cause contract check.
  - evidence: python3 numbering of PROOF_SECTION (lines 8-10) vs FAILURE_AUTOPSY_SECTION (lines 4-6): the two 'L06 failure' definitions are different failures.

- **MEDIUM** — Same module-wide quiz telegraphing: correct answer at index 1 and the longest option — 4 for 4 in this module.
  - quote: `It is the strongest mode the situation actually allows (executable > contract > domain check > reviewer rubric), run for real and named so its strength is legible.`
  - fix: Shuffle key position and balance option lengths.
  - evidence: grep `answer: 1,` -> 4 occurrences; option-length comparison.

- **LOW** — Three under-covering highlight ranges in the L08 walkthrough: [12,13] omits line 14 ("What would raise it: replay production traffic shape against the cache.") even though the step note explicitly cites it ("you say out loud what would raise it"); [16,17] omits line 18 (the second half of the portfolio claim, including the contract-check proof the note quotes); [20,21] omits line 22 (the L07/L08 half of the roll-call).
  - quote: `lines: [12, 13], label: 'Calibrate confidence to the proof'`
  - fix: Change the three steps to lines: [12,13,14], [16,17,18], and [20,21,22].
  - evidence: python3 numbering of PROOF_SECTION (22 lines) checked against each step's lines[] — content referenced in the notes falls on the un-highlighted lines 14, 18, 22.

- **LOW** — Time contradiction between blocks: the eyebrow and est_minutes say 25 min but the capstone sprint-contract says time: '25–35 min'.
  - quote: `eyebrow: 'Module 2 · Lesson 8 · 25 min'`
  - fix: Set eyebrow to '· 30 min' and est_minutes: 30 (or align the sprint-contract to '20–30 min' like the other lessons).
  - evidence: Direct comparison of lines 707-717 (time: '25–35 min') with lines 913-915 (eyebrow 25 min, est_minutes: 25).

**Rewrite applied:**
- 07-tradeoff-decision (high): fixed the memo cross-reference — 'B: flag not wired for payments (the L06 failure)' is now '(the L05 rejected-option risk)', matching L05's rejected-option and no longer contradicting the same section's correct L06 attribution 8 lines later. Line count of TRADEOFF_SECTION unchanged, so all walkthrough step line references still align.
- 07-tradeoff-decision (high): replaced the stale SQS fact in the compare block with 'Risk if wrong: 256KiB default msg-size cap / (raisable to 1MiB) -> alert at 200KB' (split across two lines matching the block's wrap style). Consistent with the Aug 2025 AWS payload-size increase.
- 08-testa-proof (critical + high x2): chose fix option (a) — rewrote PROOF_SECTION to prove the ROLLBACK decision the memo thread actually built: executable check = p99 < 350ms on v2.3.9 through the NEXT traffic peak (failed on v2.4.0 at 910ms, passes post-rollback at 285ms peak — reuses L05's verification threshold and L06's exact detection signal); contract check = 'if downstream cache eviction, v2.3.9 re-spikes at peak' with no re-spike through two peaks, genuinely closing L06's injected failure; calibrated confidence, portfolio claim, and roll-call all rewritten to the rollback scenario. Numbers cross-checked against L05 memo (910ms spike, 240ms recovery, 350ms threshold). Stale-price/caching content now lives ONLY in the L05/L06 compare-block side examples where it originated. Preserved the 22-line section shape so all five walkthrough step line references ([4,5,6]/[8,9,10]/[12,13]/[16,17]/[20,21]) still point at the right lines (verified with python3 numbering).
- 08-testa-proof (forced adjacent change): updated the L08 code-walkthrough subtitle ('Prove the rollback decision...') and four step notes to the rollback scenario — including replacing the false 'The Lesson 06 injected failure was stale prices' recap with the correct downstream-cache-eviction recap tied to the L06 detection signal. The roll-call step and L08 calibration rubric needed no change (still accurate).
- Module-wide quiz telegraphing (medium x4): shuffled correct-answer positions to L05→2, L06→0, L07→3, L08→2 and rebalanced all four option sets so the key is no longer the longest option (per-quiz option lengths now within ~5 chars of each other; in L08 the longest option is a distractor). Correct options were trimmed without losing the tested concept; each lesson's existing `explanation` was checked and still matches its rewritten correct option.

**Verify residue (post-rewrite):**
- L08 low (copy): walkthrough highlight cuts the portfolio claim mid-sentence — "lines: [16, 17], label: 'Portfolio claim names the PROOF'" omits line 18 ("then proved the release was the cause: no re-spike through the next two peaks.\"")
- L08 low (copy): "lines: [12, 13], label: 'Calibrate confidence to the proof'" — step note references what would raise confidence, but line 14 ("What would raise it: a clean week of peaks + the downstream eviction dashboard.") is not highlighted
- L08 low (copy): "lines: [20, 21], label: 'Module roll-call'" omits final roll-call line 22 ("Tradeoff defended with reversal (L07) -> Proven, strongest evidence (L08).")
- Module-wide low (nit): markdown memo templates tagged "language: 'bash'," in all four code-walkthroughs despite the .md filename (appears deliberate for #-comment highlighting)

---

## scripts/academy/course00/seed-module-3.ts  ·  career-engineering_judgment_foundation

### 09-explain-back — audit 96 → verify 97 PASS

- **LOW** — Maintainer-facing header comment is stale: every lesson actually has 16 blocks, and the listed sequence names 'worked-example' and 'code' blocks that do not exist (the lessons use diagram + code-walkthrough + compare). The same header also claims labs are 'wired through sprint-contract + calibration' and that a 'tradeoff' block 'carries the real decision' — no calibration or tradeoff block exists in any of the four lessons. Not learner-visible, but the file's own documentation contradicts its contents.
  - quote: `Each lesson is rebuilt as the full 15-block world-class sequence`
  - fix: Rewrite the header comment to the actual 16-block sequence (sprint-contract, mission, context, pretest, concept, diagram, code-walkthrough, compare, callout, lab, debug, quiz, verification, teachback, transfer, spaced-review) and delete the claims about calibration/tradeoff/worked-example blocks.
  - evidence: Counted block objects in each of the four *Blocks arrays in the file: 16 each; grep for type: 'calibration'|'tradeoff'|'worked-example' finds none.

- **LOW** — Ambiguous sentence in the compare caption. In the weak example the TRADEOFF was moved to the front, but the lesson's thesis (diagram legend, quiz) is that the SKIPPED moves (failure, proof) are the weakest part. A careful learner can read this as 'the move you promote to the front is your weakest part', which is the opposite of what the lesson teaches.
  - quote: `The reordered move is your weakest part.`
  - fix: Replace with something like: 'The move you skip or bury is your weakest part.'

- **LOW** — All four lessons tag Markdown artifact files (explain_back.md, review_rubric.md, repair_log.md, spacing_queue.md) with language 'bash' in code-walkthrough and debug blocks, which can produce wrong syntax highlighting (e.g. '# ...' headings styled as comments is fine, but quoted strings and numbers get shell tokenization). File-wide; quoted string appears 8 times.
  - quote: `language: 'bash',`
  - fix: Use 'markdown' (or 'text'/'plaintext' if the renderer supports it) as the language for these artifact blocks, in all four lessons.

### 10-review-rubric — audit 89 → verify 98 PASS

- **HIGH** — False arithmetic in the debug block's model answer (the 'fix' text a learner reads as the answer key). A 7.5/10 average is 75/100 — it does not 'round up to 90'. The broken reviewer note being wrong is intentional, but the fix ENDORSES the 7.5-to-90 jump as mere rounding instead of flagging it as a third error, in a lesson whose entire point is honest scoring. A learner who checks the arithmetic (as this course tells them to) finds the answer key asserting something mathematically false.
  - quote: `diluted into a 7.5 average that rounds up to 90`
  - fix: Reword the fix, e.g.: '...should CAP the artifact, not get diluted into a 7.5/10 average — which is 75/100 anyway; the reviewer inflated even their own broken average to 90.'
  - evidence: python3: scores [9,10,3,4,9,10] -> sum 45, avg 45/6 = 7.5; 7.5 on a 0-100 scale = 75.0, not 90.

- **MEDIUM** — The diagram subtitle says six dimensions, but the diagram renders only five dimension nodes (artifact, failure, proof, tradeoff, repair) — the TRANSFER dimension from the rubric is missing. The count in the copy contradicts the visual.
  - quote: `Six dimensions score against evidence, but the lowest-capping one sets the ceiling.`
  - fix: Either add a 'transfer' node (tone success, edge 'pass' to score) or change the subtitle to 'Five of the six dimensions pass on evidence...' — adding the node is better since the rubric artifact and walkthrough both teach six dimensions.
  - evidence: Node ids in the lesson-10 diagram block: artifact, failure, proof, tradeoff, repair, cap, score — no transfer node.

- **LOW** — Loose cap logic in the debug fix: when two dimensions fail (failure-case cap 82, proof cap 78), the ceiling is the minimum, 78 — 'around 78–82' implies the cap is a range. The text does correctly land on 'near 78' two sentences later, but the range phrasing softens the lesson's own hard-cap rule.
  - quote: `should CAP the artifact (around 78–82)`
  - fix: Replace with 'should CAP the artifact at 78 (the lower of the two failed caps: proof 78, failure 82)'.

### 11-repair-loop — audit 98 → verify 99 PASS

- **LOW** — Eyebrow states 25 min but the lesson's sprint-contract says time: '25–35 min'. Same mismatch exists in lessons 10 and 12 (both eyebrows say '25 min' against sprint-contract '25–35 min'); lesson 09's '25 min' sits inside its '20–30 min' range so it is fine. Minor cross-block contradiction a learner can see on the same page.
  - quote: `Lesson 3 · 25 min`
  - fix: Change the eyebrows for lessons 10-12 to '30 min' (midpoint) or align est_minutes/eyebrow with the sprint-contract range.
  - evidence: All arithmetic in this lesson verified: python3 confirms 91 - 78 = 13 (matches the walkthrough claim 'the +13 came from PROOF') and post-score 91 <= transfer cap 92 ('new ceiling is TRANSFER') — consistent with lesson 10's rubric. All six walkthrough line references land on the correct repair_log.md lines.

### 12-spacing-queue — audit 92 → verify 98 PASS

- **MEDIUM** — The filled artifact contradicts its own rules. The tax-line card (row: shaky recall, confidence 2, '→ repair') is routed to repair, but Rule 3 in the same artifact ('Calibrate: confidence 4–5 + a wrong/shaky recall → that card goes to repair') only routes HIGH-confidence misses to repair, and Rule 1 says a miss 'resets the card' (back to same-day). By the artifact's own rules a confidence-2 shaky recall should reset, not go to repair — yet the code-walkthrough note amplifies the contradiction by presenting the routing as correct. This muddies the lesson's sharpest claim (confident-but-wrong is the special repair case, per the quiz and callout).
  - quote: `recall "shaky", confidence 2 → flagged for repair`
  - fix: Either change the tax-line row to confidence 4 (making it a genuine confident-but-wrong example that Rule 3 covers), or extend Rule 3 to state what happens to low-confidence misses (reset + reschedule) and update the walkthrough note for line 8 to match.

- **MEDIUM** — The pretest reveal's closing line contradicts the lesson's own retention model. The compare caption says 'The goal is effortful retrieval, not comfortable familiarity' and the callout says 'The uncomfortable test ... is the one that actually builds durable judgment' — spaced recall at the point of forgetting is deliberately HARDER per attempt; that difficulty is the mechanism. Calling well-timed review 'easy' inverts the desirable-difficulty framing the rest of the lesson teaches, and a learner can reasonably ask which block is right.
  - quote: `Easy, well-timed effort beats hard, mistimed effort.`
  - fix: Reword to keep the total-workload point without calling the retrieval easy, e.g.: 'Fewer, well-timed, effortful reviews beat many mistimed easy ones.'

- **LOW** — The debug task asks for exactly three flaws, but the fix enumerates four ('First ... massed', 'Second ... re-reading', 'Third ... in ORDER', then 'And marking on "recognize it" with no confidence check misses the confident-but-wrong cards entirely'). A learner who found the missing-calibration flaw as one of their three is marked against an answer key that counts it as a bonus, not one of the three.
  - quote: `Name the three things it gets wrong.`
  - fix: Either ask 'Name the flaws (there are at least three)' or fold the calibration miss into the third numbered flaw.

- **LOW** — The taught schedule starts at 'same-day', but the lesson's own spaced-review block (and sprint-contract unlock) schedules '1 day' / 'same-day / day 3 / day 7 / day 30' inconsistently — the platform spaced-review block for this very lesson uses ['1 day', '3 days', '7 days', '30 days']. Defensible as two different things (artifact rule vs platform review), but the first-interval mismatch sits in the capstone lesson about interval discipline.
  - quote: `Expanding intervals: same-day → day 3 → day 7 → day 30. A miss resets the card.`
  - fix: Align on one first interval: either teach 'day 1 → 3 → 7 → 30' in the artifact rules and unlock, or note explicitly that same-day is the seeding review and day-1 is the first spaced pass.

**Rewrite applied:**
- 10-review-rubric (high, false arithmetic): reworded the debug fix at /Users/Sage/code/active/sageideas.dev/scripts/academy/course00/seed-module-3.ts to '...not get diluted into a 7.5/10 average — which is 75/100 anyway; jumping 7.5 to 90 is not rounding, it is a third error: the reviewer inflated even their own broken average.' Verified with python3: sum([9,10,3,4,9,10])=45, avg=7.5, on 0-100 scale = 75.0.
- 10-review-rubric (medium, missing sixth dimension node): added a 'transfer' node (label 'Transfer', description 'same gate elsewhere', kind process, tone success) plus a muted 'pass' data edge transfer→score to the cap diagram, matching the rubric artifact's dimension 6 (TRANSFER, line ~268) and the lesson-09 walkthrough. Adjacent consistency note: the subtitle's 'no matter how strong the other five are' now literally matches five passing nodes (artifact, failure, tradeoff, repair, transfer), so no subtitle change was needed.
- 12-spacing-queue (medium, artifact contradicts Rule 3): changed the tax-line row in the spacingQueue artifact from confidence '2  → repair' to '4  → repair' (column alignment preserved), making it a genuine confident-but-wrong case that Rule 3 covers; consistent with the lesson's quiz (confidence 4, recall incorrect → repair) and the sprint-contract's 'shaky-but-confident' framing. Forced adjacent change: updated the code-walkthrough line-8 note to 'recall "shaky", confidence 4 → flagged for repair. Confident-but-shaky is exactly the case Rule 3 exists to catch.' (old note both cited confidence 2 and misframed the routing as decay-catching).
- 12-spacing-queue (medium, desirable-difficulty inversion): replaced the pretest reveal's closing line 'Easy, well-timed effort beats hard, mistimed effort.' with 'Fewer, well-timed, effortful reviews beat many mistimed easy ones.', preserving the total-workload point while keeping retrieval framed as effortful, consistent with the compare caption and callout.

**Verify residue (post-rewrite):**
- 09-explain-back (medium): debug fix omits REPAIR from the missing-move enumeration even though the broken explain-back also lacks it — "It skips ARTIFACT (no memo, no config to inspect), skips FAILURE (no named failure mode, so nothing to watch), and fakes PROOF"
- 10-review-rubric (low): debug task promises two errors but the fix names three — "Name the two structural errors in how the rubric was applied." vs fix's "it is a third error"
- 12-spacing-queue (low): taught first interval is same-day — "Expanding intervals: same-day → day 3 → day 7 → day 30." — but the lesson's spaced-review block ships schedule: ['1 day', '3 days', '7 days', '30 days']
- file header (low, not learner-facing): "Each lesson is rebuilt as the full 15-block world-class sequence" but every lesson ships 16 blocks (diagram + code-walkthrough + compare replace worked-example + code)

---

## scripts/academy/course00/seed-module-4.ts  ·  career-engineering_judgment_foundation

### 13-transfer-challenge — audit 96 → verify 99 PASS

- **MEDIUM** — Final walkthrough step claims to show 'the two explicit sections' but the 1-based highlight stops at line 26, leaving line 27 of AUTH_CACHE_MEMO ('Privacy: auth state now lives in a second place.') dimmed even though it is part of the Domain-load section being taught; it also highlights blank line 24.
  - quote: `lines: [21, 22, 23, 24, 25, 26], label: 'Skeleton vs load, named'`
  - fix: Change to lines: [21, 22, 23, 25, 26, 27] (or [21,22,23,24,25,26,27]) so the whole Domain-load section is lit.
  - evidence: python3 line-map (renderer confirmed 1-based via SageCodeWalkthrough.tsx `const lineNo = index + 1`): line 26 = 'User: every logged-in request...'; line 27 = 'Privacy: auth state now lives in a second place.' is excluded.

- **MEDIUM** — Walkthrough subtitle says '200ms cache' while the memo it steps through says '5s TTL' (line 5: 'Cache ONLY negative results (failed lookups), 5s TTL'). A learner can read '200ms cache' as a 200ms TTL, contradicting the artifact directly below it; the 200ms figure appears nowhere else in the lesson.
  - quote: `add a 200ms cache to an AUTH endpoint`
  - fix: Reword subtitle to 'add a cache in front of a 200ms auth endpoint to cut load' or drop the number to match the memo's 5s TTL.

### 14-package-evidence — audit 80 → verify 98 PASS

- **CRITICAL** — False technical claim, taught three times (callout; walkthrough note 'the history makes "I knew that would happen" impossible to fake.'; caption 'The order of commits is the part a skeptic cannot argue with.'). Git author/committer dates are arbitrarily settable and history is rewritable, so a local commit proves nothing about when the prediction was made — the exact skepticism the lesson claims git defeats.
  - quote: `because the commit history makes it impossible to fake`
  - fix: Teach the honest version: commit AND push to a shared remote (or open a PR) — the remote's received timestamp / PR history is what makes backdating impractical; soften 'impossible to fake' to 'hard to dispute once pushed'.
  - evidence: Ran in a fresh repo: GIT_AUTHOR_DATE="2020-01-01T00:00:00" GIT_COMMITTER_DATE="2020-01-01T00:00:00" git commit --allow-empty -m 'predicted failure autopsy (backdated)'; git log printed '2020-01-01 predicted failure autopsy (backdated)' above the real 2026-08-15 commit — a fabricated pre-dated 'prediction'.

- **HIGH** — The entire hero code-walkthrough is off by one (authored 0-based; renderer is 1-based). Step 'The claim' highlights line 6 = '## auth-cache decision — 2026-06-18' (the date heading, not the claim); 'The link to the artifact' [7] highlights the claim line; 'The strongest available proof' [8] highlights the artifact line; 'The predicted failure' [9] highlights the proof line; 'The commit that makes it un-fakeable' [13,14] highlights a blank line + 'git add' and never lights the 'git commit' line (15) its note describes. Every step visually mislabels the ledger.
  - quote: `{ lines: [6], label: 'The claim — a proof, not a topic'`
  - fix: Shift every step +1: [7], [8], [9], [10], [14, 15].
  - evidence: python3 line-map of EVIDENCE_LEDGER_FILLED (1-based): 6='## auth-cache decision — 2026-06-18', 7='- claim: ...', 8='- artifact: ...', 9='- proof: ...', 10='- failure: ...', 13='', 14='git add ...', 15='git commit ...'. Renderer 1-based per SageCodeWalkthrough.tsx line 235: `const lineNo = index + 1`.

- **MEDIUM** — Near-verbatim duplication between adjacent blocks: the walkthrough step note already says 'A failure autopsy committed before the outcome is the most credible artifact you can own — the history makes ... impossible to fake' and the callout immediately after repeats the same sentence plus the same 'timestamp before the outcome / git proves the order' point. Reads as copy-paste padding.
  - quote: `A failure autopsy committed before the outcome is known is the single most credible artifact you can own`
  - fix: Cut the repeated sentences from the callout and let it carry only the net-new advice (reviewers have seen post-hoc rationalizations; a timestamped pre-mortem stops the conversation).

- **LOW** — Ledger value column misaligned: claim/artifact/proof values start at column 13 ('- claim:    "I can...'), but '- failure:' and '- status:' values start at column 12 — visibly ragged in a monospace hero artifact.
  - quote: `- failure: stale-revoked-session`
  - fix: Use '- failure:  stale-revoked-session' and '- status:   passed' (pad to the same value column).

### 15-unlock-gate — audit 93 → verify 98 PASS

- **MEDIUM** — Step highlights blank line 9 plus the '# => 4 PASS, 1 REPAIR...' comment (line 10) but never lights line 11 'GATE: CLOSED' — the payoff line of the whole artifact and the exact thing the note ('One required REPAIR closes it regardless') is about. Rest of this walkthrough is correctly 1-based, so this one step reads as an off-by-one.
  - quote: `{ lines: [9, 10], label: 'Why 4/5 does not open it'`
  - fix: Change to lines: [10, 11].
  - evidence: python3 line-map of GATE_RESULT_FILLED (1-based): 9='', 10='# => 4 PASS, 1 REPAIR...', 11='GATE: CLOSED'.

- **MEDIUM** — Adjacent-block duplication: the compare caption and the callout directly below it repeat the same two sentences nearly verbatim ('gate is most valuable exactly when it is most inconvenient' + 'the first time it forces you to hold a release you wanted to ship is the gate doing its entire job').
  - quote: `The gate is most valuable exactly when it is most inconvenient.`
  - fix: Keep the line in one block only; let the callout carry its unique content (deadline pressure, 'repair later is where evidence goes to die', reversal condition for shipping thin).

- **LOW** — The pretest's hypothetical learner names 'the explanation' as a gate criterion, but the lesson's own gate artifact defines the five criteria as retrieval / artifact / proof / failure_case / transfer — 'explanation' matches none of them, so the pretest and the hero artifact disagree on what the five criteria are.
  - quote: `I hit retrieval, the artifact, the explanation, and the transfer`
  - fix: Change 'the explanation' to 'the failure case' so the pretest uses the artifact's criterion names.

- **LOW** — The verification block names a four-route repair taxonomy that this lesson never introduces — the lesson's artifact and prose only ever route one red to 'verification'. (Possibly defined in an earlier module; not taught anywhere in this file.)
  - quote: `(concept / build / verification / oral-defense)`
  - fix: Either introduce the four repair routes in the concept/walkthrough of this lesson, or drop the parenthetical to '(a named, checkable action — not "do better")'.

### 16-capstone-rehearsal — audit 84 → verify 99 PASS

- **HIGH** — The step's note says 'Seven required lines. every_claim_names_proof is the through-line of the whole course' but the 1-based highlight covers lines 12-19 = the heading + 'gate:' + only SIX criteria, excluding line 20 '  every_claim_names_proof:  PASS | REPAIR' — the exact line the note singles out. The visual directly contradicts its own caption in the capstone's hero artifact.
  - quote: `lines: [12, 13, 14, 15, 16, 17, 18, 19], label: 'The honest gate, AND-ed'`
  - fix: Change to lines: [12, 13, 14, 15, 16, 17, 18, 19, 20] (or [13..20]).
  - evidence: python3 line-map of MASTERY_PACKET_FILLED (1-based): 14-19 = diagnostic_honest..transfer_real (6 criteria); 20 = every_claim_names_proof — excluded from the highlight.

- **HIGH** — Final two steps are also off by one (0-based authored): 'One REPAIR closes it' highlights line 20 (the every_claim_names_proof criterion) instead of line 21 '# Gate OPENS only when every line is PASS. One REPAIR closes it — fix, re-check.'; and 'Commit the whole packet' ({ lines: [22, 23] }) highlights a blank line + 'git add' while its note ('git timestamps the bundle') describes the 'git commit' on line 24, which is never lit.
  - quote: `{ lines: [20], label: 'One REPAIR closes it'`
  - fix: Change [20] to [21] and [22, 23] to [23, 24].
  - evidence: python3 line-map (1-based): 20='  every_claim_names_proof:  PASS | REPAIR', 21='# Gate OPENS only when every line is PASS...', 22='', 23='git add ...', 24='git commit -m "capstone: ..."'.

- **MEDIUM** — Module attribution contradiction: this note sits under the step labeled 'Module 4 contributes transfer + ledger' and folds 'Reviewer objection answered' (packet item 5) into Module 4's contribution, but the context block says 'Module 2 to make and defend it' and the roll-call diagram maps m2 to 'make + defend → DECISION MEMO' — the objection-answered piece belongs to Module 2 and appears nowhere in the diagram's roll-call.
  - quote: `The reviewer objection answered, the cold-domain transfer, and the evidence ledger`
  - fix: Tag packet item 5 with its module ('## 5. Reviewer objection answered — hardest pushback + my answer (Module 2)'), add it to the m2 diagram node, and relabel the step 'Modules 2 & 4: objection, transfer, ledger' (or split the highlight).

- **MEDIUM** — Count contradiction between blocks: the packet artifact has SEVEN numbered items (including '## 4. Proof') plus the gate, but the concept block enumerates only six (Diagnostic, decision memo, failure autopsy, reviewer objection answered, transfer case, evidence ledger — Proof omitted) and calls it 'six documents'; the sprint-contract proof list and the diagram subtitle ('it is not six documents') repeat the six-item framing, all omitting the Proof item the artifact and the gate criterion 'proof_concrete' require.
  - quote: `Not six documents — one defensible argument.`
  - fix: Add Proof to the concept/sprint-contract enumerations and change 'six documents' to 'seven documents' (or fold proof into the autopsy item everywhere consistently).

- **MEDIUM** — Verbatim duplication: this exact clause appears in both the final walkthrough step note and the closing transfer block of the same lesson (the quote matches two locations).
  - quote: `the template for every review, promotion, and design defense you will ever walk into`
  - fix: Keep it in the transfer block (the send-off) and rewrite the walkthrough note's last sentence, e.g. 'git timestamps the bundle — this commit is the artifact you will reuse in every future review.'

**Rewrite applied:**
- 13-transfer-challenge: final walkthrough step highlight changed [21,22,23,24,25,26] -> [21,22,23,25,26,27] so the full Domain-load section (incl. line 27) is lit and blank line 24 is skipped (verified via python3 line map)
- 13-transfer-challenge: subtitle '200ms cache' reworded to 'add a cache in front of a slow AUTH endpoint to cut load' — no TTL-contradicting number remains
- 14-package-evidence (critical): false 'commit history makes it impossible to fake' claim replaced with the honest push-to-remote version in all three locations (walkthrough note, caption, callout); verified the falsity myself with GIT_AUTHOR_DATE/GIT_COMMITTER_DATE producing a 2020-dated commit above a 2026 one. Adjacent forced changes: added 'git push' line to EVIDENCE_LEDGER_FILLED (so the artifact matches the teaching), updated the artifact's 2-line header comment, relabeled the step 'Commit, then push — the timestamp a skeptic trusts', updated diagram legend '(git proves order)' -> '(pushed before the outcome)', and updated the verification item 'git history can show it' -> pushed-before-outcome wording
- 14-package-evidence: hero walkthrough shifted +1 across all steps: [6]->[7], [7]->[8], [8]->[9], [9]->[10], and [13,14]->[14,15,16] (the extra 16 covers the new git push line the critical fix added; verified against the regenerated line map)
- 14-package-evidence: callout deduplicated — repeated 'most credible artifact / timestamp before outcome' sentences removed; callout now carries only net-new advice (backdating a local commit, remote received timestamp, reviewers' post-hoc-rationalization point)
- 15-unlock-gate: step 'Why 4/5 does not open it' highlight changed [9,10] -> [10,11] so GATE: CLOSED is lit (verified line 11 = 'GATE: CLOSED')
- 15-unlock-gate: callout deduplicated — 'most valuable exactly when it is most inconvenient' + 'entire job' sentences kept only in the compare caption; callout now carries only its unique content (decoration gate, deadline pressure, repair-later, reversal condition)
- 16-capstone-rehearsal: 'honest gate, AND-ed' highlight extended to [12..20] so every_claim_names_proof (line 20) — the criterion the note singles out — is lit
- 16-capstone-rehearsal: final steps shifted: [20] -> [21] (the One-REPAIR-closes-it comment) and [22,23] -> [23,24] (git add + git commit; blank line 22 no longer lit, commit line now lit)
- 16-capstone-rehearsal: module attribution fixed — packet item 5 tagged '(Module 2)', m2 diagram node description now 'make + defend → DECISION MEMO + OBJECTION ANSWERED', m2 edge label 'memo + objection', step relabeled 'Modules 2 & 4: objection, transfer, ledger' with note attributing the objection to Module 2
- 16-capstone-rehearsal: count contradiction fixed — 'Not six documents' -> 'Not seven documents' with Proof added to the concept enumeration, '+ proof' added to the sprint-contract proof list, diagram subtitle 'not six documents' -> 'not seven documents' (artifact has 7 numbered items; verified via line map)
- 16-capstone-rehearsal: verbatim 'template for every review, promotion, and design defense' duplication removed — kept in the closing transfer block; walkthrough note last sentence rewritten to 'this commit is the artifact you will reuse in every future review'

**Verify residue (post-rewrite):**
- [low, 14-package-evidence] Inconsistent colon padding in ledger keys: '- failure: stale-revoked-session — predicted IN ADVANCE, see commit below' vs '- claim:    "I can decide' — cosmetic misalignment in displayed artifact
- [low, 13-transfer-challenge & 16-capstone-rehearsal] Markdown artifacts labeled as shell: 'filename: DECISION_MEMO,' and 'filename: 'mastery_packet.md',' both use language: 'bash' — renders fine but language label is technically wrong
- [low, 15-unlock-gate] Diagram inputs omit failure_case and transfer criteria despite subtitle 'Every required criterion must be PASS by inspectable evidence to open.' — shows 3 of 5 criteria

---

## Post-wave manual fixes (main session, after verify)

Six residual items fixed by hand (both mediums + four objectively-wrong lows):
- course00 m1 L4: walkthrough note no longer narrates an absent worked run
- course00 m3 09-explain-back: REPAIR added to the missing-move enumeration
- course00 m3 10-review-rubric: task asks for three errors; fix renumbered first/second/third consistently
- course00 m3 12-spacing-queue: interval prose aligned to the shipped schedule (day 1 → 3 → 7 → 30)
- programming-fundamentals git-fundamentals: "others' history" apostrophe
- programming-fundamentals testing-and-debugging: compare title order matches column order

## Accepted nits (recorded, deliberately not changed)

Remaining verify notes are low-severity judgment calls (typographic quote consistency in prose, `language: bash` labels on markdown memos kept for #-comment highlighting, diagram showing 3 of 5 criteria as representative, hardcodable numeric lab checks already mitigated by explicit copy). Revisit only if a future wave touches those lessons.

## Publish status

These fixes live in git seed scripts only. Prod Supabase is paused; the corrected content reaches learners at the next reseed after restore. The public /academy/concepts previews and course-landing fallbacks read the manifest (metadata only) and are unaffected.
