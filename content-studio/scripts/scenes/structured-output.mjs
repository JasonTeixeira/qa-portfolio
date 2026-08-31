// #7 Structured output — "make the model return JSON you can trust"
export default [
  ['01', "You need the model's answer as data your code can use. Instead it says: Sure! Here's the JSON you wanted — and that friendly sentence just crashed your parser."],
  ['02', "The problem is free text. Your program needs a guaranteed shape — these fields, these types — every single time. Not usually. Every time."],
  ['03', "So you start with a schema. You declare the exact structure you expect: a name string, an amount number, a date. This is the contract."],
  ['04', "Then you use structured output — or function calling — to force the model to fill that schema. It can't ramble; it can only return JSON that fits the shape."],
  ['05', "Extract from an invoice: name, date, amount. Out comes a clean object, keys and types exactly as declared. Your code can trust the shape."],
  ['06', "But here's the trap that bites people. Valid JSON is not correct JSON. The model can return a perfectly-shaped object with the wrong amount in it. Structure isn't truth."],
  ['07', "So you still validate, and you still eval. Check the types against the schema — and check the values against reality."],
  ['08', "And when validation fails, don't crash. Feed the error back to the model — 'amount must be a number' — and let it try again. A retry loop that self-corrects."],
  ['09', "So the recipe: define a schema, constrain the model to it, validate the result, and retry on failure. Reliable data from an unreliable narrator."],
  ['10', "Make the model speak your program's language. Learn how, free → sageideas dot dev slash academy. Proof, not paper. I'll see you in the next one."],
];
