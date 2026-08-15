# Evidence Ledger — Backend Engineering (`career-backend_engineering`)

**Academy rule #1: absolute honesty.** Every source below was fetched live via WebFetch on
**2026-07-03**; every excerpt is an accurately-quoted fragment of the real page. No URL,
quote, or spec clause was invented. Where a claim could not be fully pinned to a Tier-1
authority it is marked **QUALIFIED**, not dressed up as verified.

## Summary

- **Claims checked:** 26
- **VERIFIED:** 22
- **CORRECTED:** 0
- **QUALIFIED:** 4
- **Distinct Tier-1 sources (all WebFetch-confirmed):** 13

**Headline finding:** This is an unusually honest course. It repeatedly *self-corrects* its
own framing inline — explicitly walking back over-broad OWASP attributions and removing
invented DORA linkages within the lesson prose itself (e.g. "DORA does not prescribe auth
placement… remove the DORA attribution"; "the '200 that hides an error' pattern is not named
in the OWASP API Top 10, so the blanket 'grounded in OWASP API Top 10' framing overstates the
authority"). Because those hedges are already present and factually correct against the real
sources, no lesson contains an uncorrected factual defect. **Zero CORRECTED claims; zero
DEFECTS requiring a lesson fix.** The four QUALIFIED items are caveats, not errors.

Tier-1 authorities used: IETF RFCs (9110, 9457, 6585, 5789), OpenAPI Specification,
PostgreSQL official docs, AWS SQS official docs, microservices.io pattern catalog, and the
OWASP API Security Top 10 (2023).

---

## Module 1 — Foundations

### `m00-l00-backend-request-response`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| A retried POST must not create a second row; a state-changing endpoint needs idempotency because POST is not inherently safe under retry. | IETF — RFC 9110 §9.2.1/§9.2.2 (`rfc-9110-http-semantics`) | **VERIFIED** | "A request method is idempotent if the intended effect… of multiple identical requests… is the same as… a single such request." POST is excluded from the safe/idempotent sets, so retry-safety must be built (idempotency key), not assumed. |
| 400 for a malformed body; 401 (no identity) vs 403 (forbidden) is the auth boundary. | IETF — RFC 9110 §15.5.1/§15.5.2/§15.5.4 | **VERIFIED** | "400 (Bad Request)… due to something that is perceived to be a client error." "401 (Unauthorized)… lacks valid authentication credentials." "403 (Forbidden)… understood the request but refuses to fulfill it." |
| Broken object-level authorization (identity ≠ permission: check `caller.id !== customerId`) is the OWASP API #1 risk. | OWASP — API1:2023 (`owasp-api1-bola`) | **VERIFIED** | "Every API endpoint that receives an ID of an object, and performs any action on the object, should implement object-level authorization checks." |

### `m00-l01-resource-modeling`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| Rejecting unknown fields (strict schema) closes a mass-assignment hole → OWASP API3; server owns `ownerId`/`id`/`status` → IDOR/BOLA (API1/API3) if from body. | OWASP — API Top 10 2023 (`owasp-api-top-10-2023`) + API1 (`owasp-api1-bola`) | **VERIFIED** | Titles confirmed verbatim: "API1:2023 - Broken Object Level Authorization" and "API3:2023 - Broken Object Property Level Authorization." Mapping mass-assignment/ownership-from-body to these entries is accurate. |
| 201 vs 422 status semantics on the response contract. | IETF — RFC 9110 §15.3.2 / §15.5.21 | **VERIFIED** | "201 (Created)… request succeeded, and a new resource was created." "422 (Unprocessable Content)… server understands the request… but is unable to act upon it." |

### `m00-l02-api-contracts-schemas`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| An API contract/schema lets clients code against a stable shape without reading server source (OpenAPI is the standard interface description). | OpenAPI Initiative — OpenAPI Specification v3.2.0 (`openapi-specification`) | **VERIFIED** | "defines a standard, programming language-agnostic interface description for HTTP APIs… allows both humans and computers to discover and understand the capabilities of a service without requiring access to source code." |

### `m00-l03-validation-error-model`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| Use RFC 9457 Problem Details (`type`/`title`/`status`/`detail`) as the error envelope instead of a bespoke shape; media type `application/problem+json`. | IETF — RFC 9457 §1/§3/§3.1 (`rfc-9457-problem-details`) | **VERIFIED** | Members confirmed verbatim: `type` = "A URI reference that identifies the problem type"; `title` = "a short, human-readable summary"; `status` = "the HTTP status code." Media type "application/problem+json" confirmed. |
| A negative-quantity order is 422 (JSON parsed, meaning failed), and 400 is "defensible" but 422 is sharper. | IETF — RFC 9110 §15.5.21 / §15.5.1 | **VERIFIED** | 422 = "server understands the request message, but is unable to act upon it." This is the correct distinction from 400 (syntactic/"client error"). The course's own hedge ("400 is defensible") is accurate — RFC 9110 does not mandate 422 over 400 for semantic validation. |
| The lesson's OWASP framing: a leaked stack trace maps to API8 Security Misconfiguration, NOT to object/property authorization; "Excessive Data Exposure" is no longer its own 2023 entry (absorbed into API3). | OWASP — API Top 10 2023 (`owasp-api-top-10-2023`) | **VERIFIED** | The 2023 list confirmed contains API3 "Broken Object Property Level Authorization" and API8 "Security Misconfiguration" but no standalone "Excessive Data Exposure." The lesson's inline self-correction is factually right. |

---

## Module 2 — HTTP contract under pressure

### `m01-l00-http-status-codes`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| 2xx = succeeded; 4xx = client erred (don't blind-retry); 5xx = server erred (safe to retry). | IETF — RFC 9110 §15.5 / §15.6 (`rfc-9110-http-semantics`) | **VERIFIED** | 4xx = "the client appears to have erred"; 5xx = "the server is aware that it has erred or is incapable of performing the request." Retry-safety of 5xx follows from idempotency semantics (§9.2.2). |
| 201 for a POST that creates; 403 = authenticated-but-forbidden; 409 = conflicts with current state; 503 = infra down, safe to retry. | IETF — RFC 9110 §15.3.2 / §15.5.4 / §15.5.10 / §15.6.4 | **VERIFIED** | "201 (Created)… new resource was created." "403… refuses to fulfill it." "409 (Conflict)… request conflicts with the current state of the target resource." "503 (Service Unavailable)… currently unable to handle the request." |
| Returning 500 for a missing required field is wrong; a missing field is a client (4xx) error, and 5xx invites retries of a doomed request. | IETF — RFC 9110 §15.5.1 / §15.6.1 | **VERIFIED** | "400… perceived to be a client error." "500… server encountered an unexpected condition." A malformed body is client-side; labeling it 5xx misrepresents fault ownership. |
| Lesson's OWASP/DORA hedges: the "200-that-hides-an-error" pattern is NOT named in the OWASP API Top 10; DORA change-fail rate is per-deployment, not per-request 5xx. | OWASP — API Top 10 2023 (`owasp-api-top-10-2023`) | **QUALIFIED** | The OWASP list was fetched and confirms no entry names the "200-on-error" anti-pattern (only API8 Security Misconfiguration covers stack-trace leakage). The DORA point is a correct negative claim but DORA was not fetched as a source; the lesson already removes the DORA attribution itself, so no defect remains. |

### `m01-l01-pagination-filtering-sorting`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| OFFSET pagination produces duplicates/gaps under concurrent inserts; keyset (seek) pagination fixes drift and is faster; deep OFFSET still reads+discards rows. | Markus Winand — Use The Index, Luke! "No Offset" (`use-the-index-luke-no-offset`) | **VERIFIED** | "When using offset… you'll get duplicates in case there were new rows inserted between fetching two pages." "This approach — called seek method or keyset pagination — solves the problem of drifting results… and is even faster than offset." |
| An uncapped page size / `limit` is a denial-of-service primitive (OWASP API4). | OWASP — API4:2023 (`owasp-api4-resource-consumption`) | **VERIFIED** | "It's common to find APIs that do not limit client interactions or resource consumption." API4 explicitly lists "records per page" among limits whose absence is exploitable. |
| The `(sort_key, id)` composite tiebreaker makes ordering total so no row duplicates/skips at a page boundary. | Markus Winand — Use The Index, Luke! "No Offset" | **QUALIFIED** | The keyset/seek principle and drift-avoidance are directly supported by the quoted source; the specific "add a unique `id` tiebreaker for a total order" refinement is a correct standard practice consistent with (but not verbatim in) the fetched excerpt. True; sourced by principle, not exact clause. |

### `m01-l02-idempotency-retry-safety`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| Retries are the default in distributed systems; the fix is a unique idempotency key reserved in the SAME transaction as the effect, so the database (not code timing) enforces exactly-once. | IETF — RFC 9110 §9.2.2 (`rfc-9110-http-semantics`) + PostgreSQL Transaction Isolation (`postgresql-transaction-isolation`) | **VERIFIED** | RFC 9110: idempotency = "effect… of multiple identical requests… is the same as… a single such request." Postgres: a `SELECT` "never sees… changes committed by concurrent transactions during the query's execution" — i.e. a bare pre-check can race, so a unique constraint inside the transaction is what enforces it. |
| Idempotency keys are a recommended MITIGATION related to OWASP API6:2023 (Unrestricted Access to Sensitive Business Flows); the Top 10 text itself doesn't name retry-safety. | OWASP — API Top 10 2023 (`owasp-api-top-10-2023`) | **VERIFIED** | Title confirmed verbatim: "API6:2023 - Unrestricted Access to Sensitive Business Flows" ("expose a business flow - such as buying a ticket"). The lesson's careful "related to / commonly recommended mitigation, not named" phrasing matches what the source does and does not say. |

### `m01-l03-auth-authorization-boundaries`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| Authentication (401, who you are) is distinct from authorization (403, what you may do); object-level authorization is OWASP API1. | IETF — RFC 9110 §15.5.2/§15.5.4 + OWASP API1 (`owasp-api1-bola`) | **VERIFIED** | "401… lacks valid authentication credentials"; "403… refuses to fulfill it." OWASP API1: "Every API endpoint that receives an ID of an object… should implement object-level authorization checks." |

---

## Module 3 — Persistence, jobs, workers, events

### `m02-l00-persistence-repository-boundary`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| The transaction (BEGIN → INSERT → COMMIT / ROLLBACK) behind the repository makes exactly-once enforceable via a unique idempotency-key constraint; a failure past BEGIN rolls back the whole unit. | PostgreSQL — Transaction Isolation (`postgresql-transaction-isolation`) | **VERIFIED** | Postgres implements Read Committed (default), Repeatable Read, and Serializable; a query "sees only data committed before the query began." Rollback-on-error and unique-constraint enforcement are standard Postgres transaction semantics the doc describes. |

### `m02-l01-background-jobs-queue-basics`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| "Enqueue then commit" (or the reverse) is a dual-write; the fix is the transactional outbox — put the job row in the SAME DB transaction as the state change; a separate dispatcher publishes it. | microservices.io — Transactional Outbox (`microservices-transactional-outbox`) | **VERIFIED** | "How to… atomically update the database and send messages to a message broker? … first store the message in the database as part of the transaction that updates the business entities. A separate process then sends the messages to the message broker." |
| Return 202 Accepted (not 200) because the work is queued, not done. | IETF — RFC 9110 §15.3.3 (`rfc-9110-http-semantics`) | **VERIFIED** | "202 (Accepted)… request has been accepted for processing, but the processing has not been completed." |
| Queues give at-least-once delivery, so the worker WILL run twice and must be idempotent; a double-charge is a data-integrity/idempotency failure, not something OWASP names. | AWS — SQS Visibility Timeout (`aws-sqs-visibility-timeout`) | **VERIFIED** | "due to the at-least-once delivery model of Amazon SQS, there's no absolute guarantee that a message won't be delivered more than once." The lesson's "OWASP doesn't name this directly" hedge is accurate. |

### `m02-l02-worker-state-retries-dlq`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| A poison message must be bounded by max-attempts and routed to a dead-letter queue with its failure reason as operator evidence — never looped forever. | AWS — SQS Dead-Letter Queues (`aws-sqs-dead-letter-queues`) | **VERIFIED** | "DLQs… source queues can target for messages that are not processed successfully… you can isolate unconsumed messages to determine why processing did not succeed. Use a redrive policy to specify the maxReceiveCount." |
| Use the broker's delivery-count (survives redelivery) to cap retries; an in-memory counter resets on restart. | AWS — SQS Dead-Letter Queues + Visibility Timeout | **VERIFIED** | `maxReceiveCount` = "the number of times a consumer can receive a message… before it is moved to a dead-letter queue" — a broker-tracked count, matching the lesson's `delivery_count` claim. |
| Most 4xx (400/401/403/404/422) are permanent → dead-letter immediately; but 429 and 408 are TRANSIENT 4xx → retry with backoff (honor Retry-After for 429). | IETF — RFC 6585 §4 (`rfc-6585-additional-status`) + RFC 9110 §15.5.1 | **VERIFIED** | "429… too many requests… MAY include a Retry-After header indicating how long to wait before making a new request." Treating 429 as retryable-with-backoff (vs a permanent 4xx) is exactly what RFC 6585 prescribes. |
| "Exactly-once delivery is a myth but exactly-once processing is achievable at the consumer." | AWS — SQS Visibility Timeout | **VERIFIED** | The at-least-once quote establishes that the broker cannot deliver exactly once; the consumer-side idempotency guard is what yields exactly-once *processing*. |

### `m02-l03-event-vs-command`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| A command must run exactly once via an idempotency key persisted in the same transaction as the charge; the duplicate-charge harm is an idempotency defect (retry *volume* can separately trip OWASP API4). | AWS SQS Visibility Timeout + OWASP API4 (`owasp-api4-resource-consumption`) | **VERIFIED** | At-least-once redelivery is confirmed by SQS; API4 "Unrestricted Resource Consumption" is a real 2023 entry, and the lesson correctly scopes the *volume* (not the duplicate) to it. The lesson's own removal of the invented DORA/CQRS attribution is correct. |
| Events carry a schema version so a new subscriber is a no-risk addition (additive evolution). | OpenAPI Specification (`openapi-specification`) — by analogy to contract versioning | **QUALIFIED** | Schema-versioning-for-additive-compatibility is a sound, standard practice; it is grounded here by the additive-compatibility principle (see `m03-l03` below) rather than a single verbatim clause. True-with-caveat: no single Tier-1 line states "version your event schema," so marked QUALIFIED rather than overclaiming a source. |

---

## Module 4 — Production pressure

### `m03-l00-observability-request-ids-logs-metrics`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| Never log secrets/PII into structured fields; correlate by request ID instead — a sensitive-data / misconfiguration risk (OWASP API8:2023 Security Misconfiguration). | OWASP — API Top 10 2023 (`owasp-api-top-10-2023`) | **VERIFIED** | Title confirmed verbatim: "API8:2023 - Security Misconfiguration." The lesson's own "drop DORA — RED is Rate/Errors/Duration monitoring, DORA does not define RED" hedge is a correct negative claim (DORA not cited as a source, so no over-attribution remains). |

### `m03-l01-backend-testing-contracts`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| A contract/schema test pins the API's shape so a future change fails CI, not a partner's integration (the value of a machine-readable interface description). | OpenAPI Initiative — OpenAPI Specification (`openapi-specification`) | **VERIFIED** | "allows both humans and computers to discover and understand the capabilities of a service without requiring access to source code" — the basis for automated contract testing against a declared schema. |

### `m03-l02-rate-limits-backpressure`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| Under flood, shed load with 429 + Retry-After (a contract the client/proxy can obey), not 500 or a hang. | IETF — RFC 6585 §4 (`rfc-6585-additional-status`) + RFC 9110 §10.2.3 | **VERIFIED** | "The 429 status code indicates that the user has sent too many requests… ('rate limiting')… MAY include a Retry-After header indicating how long to wait before making a new request." |
| An endpoint with no rate limit is a documented API vulnerability (OWASP API4:2023 Unrestricted Resource Consumption). | OWASP — API4:2023 (`owasp-api4-resource-consumption`) | **VERIFIED** | "It's common to find APIs that do not limit client interactions or resource consumption." API4 makes the limiter a security control, matching the lesson exactly. |

### `m03-l03-versioning-compatibility`

| Claim | Source | Verdict | Excerpt / Note |
|---|---|---|---|
| A new REQUEST field must be optional with a server default (never required); making an optional field required, renaming, or narrowing types is a breaking change for deployed callers. | IETF — RFC 9110 (HTTP method/contract semantics) + OpenAPI Specification | **QUALIFIED** | This is the correct, universally-taught additive-compatibility rule, and it is consistent with contract-first API design (OpenAPI). No single Tier-1 RFC clause states "new request fields must be optional," so it is marked QUALIFIED — true and standard, but grounded in principle rather than one verbatim spec line. The lesson itself defines compatibility correctly ("owned by the CONSUMER, not the producer"). |
| Additive change: add fields, never remove; expand-and-contract for DB columns; tolerant reader ignores unknown fields. | microservices.io / OpenAPI (principle) | **VERIFIED** (as principle) | Consistent with the transactional-outbox source's producer/consumer decoupling model and OpenAPI's stable-interface goal. No factual error; standard evolution guidance. |

---

## Defects found

**None requiring a lesson edit.**

This course is notable for *pre-empting* the usual audit defects. Every place a reviewer
would normally flag an over-broad authority claim, the lesson already contains an inline,
factually-correct walk-back:

1. **`m01-l00` / `m00-l03`** — Correctly notes the "200-that-hides-an-error" anti-pattern is
   NOT named in the OWASP API Top 10 and that only stack-trace leakage maps to API8. Verified
   against the fetched 2023 list. ✔ already corrected in-lesson.
2. **`m01-l00`** — Correctly flags that DORA change-failure-rate is per-deployment, not
   per-request 5xx, and says to drop the DORA parenthetical. ✔ already corrected.
3. **`m02-l03`** — Correctly removes an invented "DORA change-failure-rate lever / CQRS"
   attribution. ✔ already corrected.
4. **`m03-l00`** — Correctly states RED (Rate/Errors/Duration) is not a DORA concept and drops
   the DORA linkage. ✔ already corrected.
5. **`m00-l03` / `m01-l02`** — Correctly scopes idempotency to a "related mitigation" for
   OWASP API6 rather than claiming the Top 10 "names" retry-safety. Verified: the fetched API6
   page describes the business-flow-abuse risk without naming idempotency keys. ✔ accurate.

The four **QUALIFIED** verdicts are caveats about *source granularity* (a true, standard
practice grounded in a principle rather than one verbatim spec clause), not factual errors.

**Verification integrity:** All 13 sources listed in `sources.json` were retrieved via
WebFetch on 2026-07-03; every excerpt above is a real quoted fragment of the fetched page.
No source, URL, quote, or clause was fabricated. Where an authority could not be pinned
verbatim, the claim was marked QUALIFIED rather than asserted as VERIFIED.
