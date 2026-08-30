import type { PyLabConfig } from './PyLab'

/**
 * Playable-lab configs, keyed by lab slug. Each is a real broken→fix→green
 * Python exercise, pure (no external APIs) so it runs entirely in the browser.
 * Register a slug in InteractiveLab to make its detail page playable.
 */

const EVAL_STARTER = `golden = [
    ("refund window?", "30 days"),
    ("ship time?",     "3-5 days"),
    ("cancel order?",  "before dispatch"),
    ("support hours?", "24/7"),
]

# what the model actually answered (answer #4 is wrong):
outputs = ["30 days", "3-5 days", "before dispatch", "9 to 5"]

def score(expected, got):
    # BUG: this marks every answer correct, so the eval always reports 1.0.
    # Make it actually compare expected vs got.
    return 1.0

total = sum(score(exp, got) for (_, exp), got in zip(golden, outputs))
print(round(total / len(golden), 2))
`

const RAG_STARTER = `docs = {
    "refunds":  "Refunds are processed within 30 days of the request.",
    "shipping": "Orders ship in 3 to 5 business days.",
}

def retrieve(question):
    words = set(question.lower().split())
    ranked = sorted(
        docs.values(),
        key=lambda t: len(words & set(t.lower().replace(".", "").split())),
        reverse=True,
    )
    best = ranked[0]
    hits = len(words & set(best.lower().replace(".", "").split()))
    return best, hits

def answer(question):
    context, hits = retrieve(question)
    # BUG: it answers from the "best" match even when nothing relevant was found.
    # A grounded system abstains when it has no supporting context (hits == 0).
    return context

# This question is NOT covered by the docs — a grounded system must abstain:
print(answer("do you accept crypto payments"))
`

const IDEMPOTENCY_STARTER = `seen = set()
charges = []

def charge(order_id, key):
    # A dropped connection makes the client RETRY the same request.
    # Right now every call charges. Make it idempotent:
    # one charge per key, no matter how many retries.
    charges.append(order_id)

# the connection dropped, so the client retried 3 times:
for _ in range(3):
    charge("order-42", "idem-key-1")

print(len(charges))
`

export const LAB_CONFIGS: Record<string, PyLabConfig> = {
  'idempotent-charge-api': {
    file: 'charge.py',
    ariaLabel: 'Editable Python — make charge() idempotent',
    starter: IDEMPOTENCY_STARTER,
    expected: '1',
    prompt: 'Run it — it charges 3×. Then guard charge() with the key so a retry is a no-op.',
    passMsg: 'output is 1 — three retries, one charge. That is idempotency.',
    failMsg: 'expected 1. The retries are still double-charging.',
    hint: 'track handled keys in seen, and return early on a repeat',
  },
  'llm-eval-harness': {
    file: 'eval.py',
    ariaLabel: 'Editable Python — fix the eval scorer to compare answers',
    starter: EVAL_STARTER,
    expected: '0.75',
    prompt: 'Run it — the eval reports 1.0 (perfect), but answer #4 is wrong. Fix score() to actually compare, and the honest number appears.',
    passMsg: '0.75 — the eval caught the regression a hand-check would miss. That is an eval.',
    failMsg: 'expected 0.75. score() is not comparing expected vs got yet.',
    hint: 'a correct answer scores 1.0, a wrong one 0.0',
  },
  'rag-grounded-docs-qa': {
    file: 'rag.py',
    ariaLabel: 'Editable Python — make the RAG answer abstain when ungrounded',
    starter: RAG_STARTER,
    expected: 'not in the docs',
    prompt: 'Run it — the model "answers" from a doc that has nothing to do with the question. Make answer() abstain when retrieval found nothing (hits == 0).',
    passMsg: 'not in the docs — it refused instead of hallucinating. That is grounding.',
    failMsg: 'expected "not in the docs". answer() still returns unrelated context.',
    hint: 'when hits == 0, return "not in the docs"',
  },
}
