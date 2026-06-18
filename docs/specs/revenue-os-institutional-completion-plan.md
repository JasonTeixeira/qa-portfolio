# Revenue OS Institutional Completion Plan

Date: 2026-06-17
Scope: Sage Ideas Revenue OS / Acquisition OS / Job Search OS inside `sageideas.dev`
Current rating: strong internal prototype, not yet institutional production SaaS.

## Executive Assessment

The system has a meaningful base:

- Supabase-backed acquisition accounts, outreach, website audits, job tracking, runs, email queue, and intelligence proof tables.
- Admin dashboard panels for operator workflow, daily actions, lead connectors, email prep, job pipeline, persistence proof, intelligence proof, and application packet downloads.
- Revenue OS modules for connectors, email delivery, sequences, jobs, application packets, worker planning, agent runs, AI review, inbox classification, ML scoring, tenant export, and eval gates.
- E2E proof coverage for acquisition flows and several Revenue OS proof actions.
- Unit coverage for the Revenue OS domain modules.

The gap is not "more screens." The gap is turning proof-mode code into a live, durable, observable, tenant-safe operating system that runs against real data and can be reused for Sage Ideas and future SMB/B2B clients.

## Current Category Scores

| Category | Current | Institutional Target | Main Gap |
|---|---:|---:|---|
| Core architecture | 78 | 95+ | Good module shape, but execution boundaries still mixed between server actions, proof runs, and planned workers. |
| Database/persistence | 80 | 95+ | Many tables exist, but tenant model, provenance, queue attempts, and operational retention need expansion. |
| Agent runtime | 62 | 95+ | Typed runs/tasks/traces exist; missing live scheduler, approval gates, tool registry, and replay. |
| Connector engine | 55 | 95+ | Connector abstractions exist; missing live production connectors, quota controls, source provenance, and dead-letter handling. |
| AI personalization | 58 | 95+ | Review models exist; missing real LLM structured output, evidence locks, prompt-injection handling, and eval-backed quality gates. |
| ML/learning loop | 42 | 90+ | Scoring model is lightweight/prototype; missing feature store, outcome labels, training, calibration, drift monitoring. |
| Email safety | 65 | 95+ | Queue/send path exists; missing full suppression enforcement, sequence caps, bounce/complaint policy, unsubscribe proof. |
| Deliverability | 48 | 90+ | Missing domain health, SPF/DKIM/DMARC verification, warmup/caps, provider reputation tracking. |
| Inbox intelligence | 50 | 90+ | Classifier exists; missing Gmail sync, thread linking, CRM transitions, and reply/follow-up recommendations. |
| Multi-tenant SaaS readiness | 38 | 95+ | Tenant export exists; missing tenant-scoped RLS, memberships, roles, API keys, domains, billing, isolation tests. |
| API/productization | 35 | 95+ | Admin UI exists; missing stable API, webhooks, SDK contracts, exports, rate limits, public docs. |
| Testing | 84 | 95+ | Strong local proof; needs live connector tests, queue concurrency tests, API contract tests, CI proof on clean branches. |
| Operator dashboard | 72 | 95+ | Useful panels exist; needs real-time job status, inbox, sequences, drilldowns, saved views, and audit trails. |
| Compliance/privacy | 42 | 95+ | Missing consent basis, data source provenance, retention, DSAR/delete/export, audit logs by tenant. |
| Production operations | 60 | 95+ | Sentry config exists; needs health checks, job metrics, provider costs, alerts, runbooks, rollback drills. |

## How Many Programs Are Left?

There are **12 programs** left to make this genuinely proven, tested, E2E working with real data, real dashboard controls, and real backend integrations.

Each program below is a vertical slice. A program is not complete until it has database migrations, backend code, dashboard controls, tests, E2E proof, and operational evidence.

## Program 1: Durable Worker Runtime

Objective: Replace proof-mode execution with a real queued worker system for leads, audits, enrichment, jobs, inbox sync, scoring, sequence advancement, and reporting.

Status: implemented and verified on 2026-06-17.

Verified evidence:

- Added durable worker runtime functions for claiming due jobs, leasing, completing, retrying, dead-lettering, and summarizing operations.
- Added Supabase migration `0036_revenue_os_durable_workers.sql` and applied it to the linked remote database.
- Admin proof now persists worker jobs, attempts, and dead-letter records.
- Dashboard counts include worker attempts and dead letters.
- Unit, typecheck, lint, RLS, build, production smoke, and admin acquisition E2E passed.

### Phases

1. **Queue schema expansion**
   - Add worker attempts, locks, leases, dead-letter rows, idempotency keys, priority, tenant scope, and retry/backoff metadata.
   - Outcome: every background operation has a durable run record.

2. **Worker executor**
   - Add a typed executor that claims due jobs, honors leases, executes by job kind, records traces, and releases/marks jobs.
   - Outcome: one local command and one cron route can process queued work.

3. **Retry and dead-letter handling**
   - Add exponential backoff, max attempts, error classification, and manual retry from dashboard.
   - Outcome: no silent failures.

4. **Parallel processing controls**
   - Add per-tenant and per-provider concurrency limits.
   - Outcome: safe throughput without provider abuse.

5. **Dashboard worker console**
   - Add live panels for queued/running/completed/failed/dead-letter jobs.
   - Outcome: operator can see exactly what is happening.

### Verified Deliverables

- Migration: worker attempts, locks, dead-letter, queue metrics.
- Backend: executor, registry, handlers, retry policy.
- Dashboard: job console, retry, cancel, inspect trace.
- Tests: unit tests for claim/lock/retry/dead-letter; E2E proving a queued lead import runs to completion.
- E2E proof: seed 25 real/test leads, enqueue audits/enrichment, run workers, verify dashboard counts and database traces.

## Program 2: Live Connector Engine

Objective: Connect real lead/job/data sources with provenance, quotas, dedupe, and repeatable imports.

Status: implemented and verified on 2026-06-17.

Verified evidence:

- Added a unified live connector import engine for lead and job records.
- Added quota enforcement, dedupe handling, source provenance, enrichment-chain storage, and downstream worker job planning.
- Added Supabase migration `0037_revenue_os_live_connector_engine.sql` and applied it to the linked remote database.
- Existing connector proof now persists connector import batches and provenance records.
- Dashboard counts include connector batches and provenance.
- Unit, typecheck, lint, RLS, build, content validation, migration dry-run, and full admin acquisition E2E passed.

### Phases

1. **Connector contract**
   - Standardize `discover`, `normalize`, `dedupe`, `enrich`, `persist`, and `score` methods.
   - Outcome: all lead and job connectors use one execution path.

2. **Lead connectors**
   - Add CSV, manual import, Google Places-style source, website list import, and Apollo/Clay-ready adapter boundaries.
   - Outcome: real businesses can be loaded consistently.

3. **Job connectors**
   - Add Remotive, Greenhouse, Lever, Ashby, Workable, and direct URL import where allowed.
   - Outcome: real entry/junior remote roles can be pulled into the job pipeline.

4. **Source provenance**
   - Store source URL, discovered timestamp, fields collected, consent/legal basis, and enrichment chain.
   - Outcome: every lead/job has an audit trail.

5. **Quota and rate limits**
   - Add per-source daily caps, cooldowns, credential health, and failure thresholds.
   - Outcome: connectors do not burn API limits or spam sources.

### Verified Deliverables

- Migration: source provenance, connector credentials metadata, source quotas, import batches.
- Backend: connector registry and source-specific adapters.
- Dashboard: connector health, import history, quota remaining, duplicates skipped.
- Tests: unit tests for normalization/dedupe; E2E importing real CSV fixtures and at least one live allowed public source.
- E2E proof: run a 100-record import, verify dedupe, scores, provenance, and dashboard rollups.

## Program 3: Real Website Audit Automation

Objective: Turn website audits into evidence-backed lead intelligence, not generic sales copy.

Status: implemented and verified on 2026-06-17.

Verified evidence:

- Added a real website audit automation module that turns live SEO audit output into structured evidence, findings, offer mappings, and follow-up worker jobs.
- Added Supabase migration `0038_revenue_os_website_audit_automation.sql` and applied it to the linked remote database.
- Admin audit action now stores website audit evidence, recommended offer mappings, and downstream worker jobs tied to the audited account and audit record.
- Dashboard counts include website audit evidence and audit offer mappings.
- Unit, typecheck, lint, RLS, build, content validation, migration dry-run, focused audit E2E, and full admin acquisition E2E passed.

### Phases

1. **Audit runner**
   - Queue audits for PageSpeed/Lighthouse, metadata, accessibility basics, SSL, sitemap, robots, indexability, contact forms, and conversion signals.
   - Outcome: each account has concrete website evidence.

2. **Evidence storage**
   - Store raw JSON, screenshots where useful, summarized findings, confidence, and source timestamps.
   - Outcome: outreach can cite real facts.

3. **Offer mapping**
   - Map audit findings to Sage Ideas offers: site rebuild, conversion cleanup, SEO foundation, automation, brand/site polish, AI workflow.
   - Outcome: every account gets a recommended offer and reason.

4. **Dashboard audit view**
   - Add account-level audit detail with findings, screenshots/links, and next action.
   - Outcome: operator can review before outreach.

### Verified Deliverables

- Migration: audit evidence, finding types, raw artifacts, offer mappings.
- Backend: audit worker handler and scoring integration.
- Dashboard: account audit detail and batch audit progress.
- Tests: deterministic audit fixtures and E2E proof against controlled test pages.
- E2E proof: import 20 sites, run audits, verify evidence-backed priorities and outreach facts.

## Program 4: AI Personalization With Evidence Locks

Objective: Generate useful, human outreach that is grounded in audit/lead evidence and blocked when evidence is insufficient.

Status: implemented and verified on 2026-06-17.

Verified evidence:

- Added evidence-locked AI personalization builder with structured draft output, cited claims, hallucination risk, spam risk, brand voice enforcement, prompt-injection checks, and manual-review-only send mode.
- Added Supabase migration `0040_revenue_os_ai_personalization_locks.sql` and applied it to the linked remote database.
- Added persistent draft versions, evidence citations, and quality gate records tied to stored website audit evidence.
- Added a Program 4 dashboard proof action and counts for draft versions, citations, quality gates, and reviews.
- Added unit, RLS, and E2E proof that approved drafts cite stored audit evidence rows before approval.

### Phases

1. **LLM provider abstraction**
   - Add provider interfaces for OpenAI/Vercel AI Gateway-ready structured output.
   - Outcome: model can be swapped without rewriting business logic.

2. **Grounded draft schema**
   - Require JSON output with subject, body, cited evidence IDs, claim list, uncertainty, spam risk, and reviewer notes.
   - Outcome: every claim is traceable.

3. **Prompt injection defense**
   - Treat website/email/source text as untrusted evidence.
   - Outcome: external content cannot control tools or override policies.

4. **Quality gates**
   - Block drafts with uncited claims, high spam risk, manipulative copy, false urgency, or missing unsubscribe/compliance requirements.
   - Outcome: not spammy by construction.

5. **Reviewer workflow**
   - Add dashboard review, edit, approve, reject, and send-to-sequence actions.
   - Outcome: human-in-the-loop quality control.

### Verified Deliverables

- Migration: draft versions, evidence citations, reviews, quality gate results.
- Backend: LLM adapter, schemas, validators, prompt-injection checks.
- Dashboard: draft review queue and evidence side panel.
- Tests: eval dataset for draft quality, hallucination, spam risk, tone, and evidence grounding.
- E2E proof: generate 25 drafts from real audit evidence; verify all approved drafts cite stored evidence.

## Program 5: Email Safety, Deliverability, and Sequences

Objective: Make outreach safe, compliant, controlled, and follow-up capable without turning into spam automation.

Status: implemented and verified on 2026-06-18.

Verified evidence:

- Added a deterministic email safety engine for suppression enforcement, deliverability caps, domain health, and sequence stops.
- Added Supabase migration `0041_revenue_os_email_safety.sql` and applied it to the linked remote database.
- Added persistent safety reports, domain health rows, suppression event proof, and sequence stop proof.
- Added a Program 5 dashboard proof action that queues 50 manual-review messages, blocks suppressed/bounced/replied contacts, and schedules only safe messages.
- Added unit, RLS, build, focused E2E, and full acquisition E2E proof that the system suppresses 5 contacts, processes 3 bounces and 2 replies, stops affected sequences, and leaves only 8 safe messages scheduled.

### Phases

1. **Suppression enforcement**
   - Enforce suppression at queue, sequence, and send time.
   - Outcome: suppressed contacts/domains can never be emailed.

2. **Unsubscribe and preference proof**
   - Store unsubscribe event, source, timestamp, email/domain, and sequence stop reason.
   - Outcome: compliance is auditable.

3. **Bounce/complaint handling**
   - Process provider webhooks and stop sequences automatically.
   - Outcome: deliverability damage is limited.

4. **Adaptive sequences**
   - Branch by persona, industry, reply, no reply, bounce, click/open when available, and stage.
   - Outcome: follow-up is contextual and stops on reply/suppression.

5. **Domain health controls**
   - Track SPF/DKIM/DMARC verification, provider health, daily caps, warmup status, bounce rate, reply rate.
   - Outcome: operators know when sending is safe.

### Verified Deliverables

- Migration: suppression events, domain health, sequence steps, provider events.
- Backend: send guards, sequence runner, webhook handlers.
- Dashboard: sequence queue, safety status, domain health, suppression manager.
- Tests: unit tests for suppression/sequence stops; E2E provider webhook simulation.
- E2E proof: enqueue 50 messages, suppress 5, bounce 3, reply 2, verify only safe emails remain active.

## Program 6: Inbox and Reply Intelligence

Objective: Connect real replies to CRM stages and next best actions.

Status: implemented and verified on 2026-06-18.

Verified evidence:

- Added a Program 6 inbox intelligence run builder that ingests Gmail-style replies, matches threads to contacts/email queue rows, classifies intent, creates CRM updates, action suggestions, and reply-based sequence stops.
- Added Supabase migration `0042_revenue_os_inbox_reply_intelligence.sql` and applied it to the linked remote database.
- Added persistent inbox runs, threads, messages, classifications, and action suggestions with admin-only RLS.
- Added a Program 6 dashboard proof action that creates a proof account/contact/sent email, ingests replies, updates CRM stage to meeting, archives the replied queue item, and stores sequence-stop proof.
- Added a real Gmail API sync adapter that builds authenticated Gmail reply queries, fetches message details, and normalizes Gmail payloads into the same inbox intelligence pipeline without storing OAuth tokens in source.
- Added unit, RLS, dashboard, and E2E proof for reply classification, thread matching, CRM updates, and stopped sequences.
- Fixed verification ergonomics: RLS scripts now load `.env.local` automatically, E2E config accepts `BASE_URL` as well as `PW_BASE_URL`, local frontmatter parsing replaces the vulnerable `gray-matter` path, dependency overrides clear the prior low/moderate npm audit findings, and local ops scripts now support clean builds plus deterministic start/stop/E2E runs on port 3042.

### Phases

1. **Gmail sync**
   - Sync sent/reply threads using Google Workspace with secure OAuth storage.
   - Outcome: inbox data lands in Revenue OS.

2. **Thread matching**
   - Match replies to account, contact, outreach message, job application, and sequence.
   - Outcome: no orphaned replies.

3. **Reply classification**
   - Classify interested, not interested, wrong person, objection, referral, meeting intent, out-of-office, bounce-like, and legal/privacy requests.
   - Outcome: CRM stage updates are meaningful.

4. **Next action suggestions**
   - Recommend reply draft, follow-up, meeting booking, suppression, or handoff.
   - Outcome: operator gets a useful queue.

5. **Dashboard inbox**
   - Add reply queue, priority filters, suggested actions, and stage update history.
   - Outcome: the system closes the loop.

### Verified Deliverables

- Migration: inbox threads, messages, classifications, action suggestions.
- Backend: Gmail sync, classifier, matching engine.
- Dashboard: reply intelligence queue.
- Tests: fixture-based Gmail sync, classification evals, E2E reply-to-stage update.
- E2E proof: ingest 25 test replies, classify, update CRM stages, and stop matching sequences.

## Program 7: Multi-Tenant SaaS Foundation

Status: **completed and verified locally against the remote Supabase database.**

Objective: Make the system usable for Sage Ideas and future SMB/B2B clients with real isolation.

### Phases

1. **Tenant model**
   - Add workspaces, memberships, roles, invites, tenant settings, and per-tenant limits.
   - Outcome: more than one business can use the system safely.

2. **Tenant-scoped RLS**
   - Replace admin-only access for client-facing tables with workspace policies.
   - Outcome: users only see their own tenant data.

3. **Client configuration**
   - Add ICP, offers, brand voice, sending domains, lead sources, compliance settings, and dashboard preferences per tenant.
   - Outcome: the OS can be configured for different businesses.

4. **Audit logs**
   - Log user actions, agent actions, worker actions, API actions, approvals, sends, exports, and deletes.
   - Outcome: institutional accountability.

5. **Billing boundary**
   - Add plan/usage objects and Stripe-ready billing hooks.
   - Outcome: productization path exists.

### Verified Deliverables

- Migration: `0043_revenue_os_multi_tenant_saas.sql` adds workspaces, members, tenant configs, usage, billing boundaries, and audit logs.
- Security: RLS is enabled for every Program 7 table; anon read/write checks are covered in the RLS suite.
- Tenant access: `revenue_os_is_workspace_member(tenant_key)` supports tenant-scoped member reads while writes remain admin-controlled.
- Backend: `buildTenantSaasFoundation`, `canAccessTenant`, and `buildTenantIsolationProof` create deterministic tenant rows and isolation evidence.
- Dashboard: Program 7 admin panel runs the tenant proof and shows workspace, member, config, usage, billing, and audit counts.
- E2E proof: two tenants with the same business name persist separate tenant keys, configs, members, usage, billing, and audit rows.
- Verification evidence: unit suite, lint, typecheck, build, RLS suite, and focused Program 7 Playwright E2E passed.

## Program 8: Public API and Productization Layer

Objective: Let the system accept APIs, datasets, webhooks, and exports like a real product.

### Phases

1. **API key system**
   - Add hashed API keys, scopes, tenant binding, rotation, last-used, and revocation.
   - Outcome: external ingestion does not depend on admin UI.

2. **Ingestion endpoints**
   - Add `/api/revenue-os/v1/leads`, `/jobs`, `/events`, `/audits`, and `/outcomes`.
   - Outcome: clients and automation can push data in.

3. **Export endpoints**
   - Add CSV/JSON exports for accounts, contacts, jobs, outreach, metrics, and learning reports.
   - Outcome: data portability.

4. **Webhook endpoints**
   - Add signed webhooks for email provider events, lead forms, inbox events, and third-party lead sources.
   - Outcome: external systems can feed the OS.

5. **API docs and examples**
   - Add local docs, request/response schemas, curl examples, and error codes.
   - Outcome: productized developer surface.

### Verified Deliverables

- Migration: API keys, webhook events, rate limit buckets.
- Backend: versioned API routes, auth middleware, schemas, idempotency.
- Dashboard: API key management and webhook logs.
- Tests: contract tests, auth tests, rate-limit tests, webhook signature tests.
- E2E proof: external script imports leads, records outcomes, exports metrics, and fails correctly with invalid keys.

## Program 9: ML Scoring and Learning Loop

Objective: Move from hand-tuned rules to measured, improving prioritization.

### Phases

1. **Feature store**
   - Store normalized features from audits, firmographics, engagement, job fit, source, and outcomes.
   - Outcome: repeatable scoring inputs.

2. **Outcome labeling**
   - Track sent, opened/clicked when available, replied, meeting, proposal, win/loss, job screen, interview, offer.
   - Outcome: model has labels.

3. **Baseline model**
   - Train a lightweight logistic/regression or gradient model offline from stored features.
   - Outcome: learned score can be compared to rule score.

4. **Calibration and drift**
   - Track calibration by score band, source, industry, offer, and tenant.
   - Outcome: scores mean something over time.

5. **Experiment loop**
   - Compare rule score vs learned score vs blended score and log decisions.
   - Outcome: the OS learns without blindly trusting the model.

### Verified Deliverables

- Migration: feature snapshots, outcome labels, model versions, calibration reports.
- Backend: dataset builder, trainer script, scorer, model registry.
- Dashboard: model performance, top features, score bands, drift warnings.
- Tests: fixture training/eval, score reproducibility, decision logging.
- E2E proof: train on seeded historical outcomes, score fresh leads, verify dashboard calibration report.

## Program 10: Revenue Intelligence Dashboard

Objective: Give the operator and future clients a real command center, not scattered panels.

### Phases

1. **Unified KPI layer**
   - Leads, audits, drafts, sent, replies, meetings, proposals, wins, jobs, interviews, revenue, pipeline, cost.
   - Outcome: one source of truth.

2. **Conversion analytics**
   - Conversion rates by source, industry, offer, persona, sequence, email domain, score band, and tenant.
   - Outcome: know what is working.

3. **Daily priority queue**
   - Rank today's actions across leads, replies, stuck jobs, unsafe sends, dead-letter jobs, follow-ups, and opportunities.
   - Outcome: operator knows what to do next.

4. **Learning insights**
   - Auto-generate "what changed," "what worked," "what failed," and "recommended next experiment."
   - Outcome: continuous improvement.

5. **Client-ready views**
   - Add tenant-safe client dashboard, exports, and monthly report.
   - Outcome: reusable for SMB/B2B customers.

### Verified Deliverables

- Backend: metrics aggregation, insight generation, saved views.
- Dashboard: KPI grid, funnels, trend charts, priority queue, client report.
- Tests: metric math, empty states, tenant filtering.
- E2E proof: import/send/reply/book/win events update metrics and insights correctly.

## Program 11: Compliance, Privacy, and Governance

Objective: Make the system professionally defensible for B2B outreach and client use.

### Phases

1. **Consent and legal basis**
   - Store source, business-context reason, consent status when applicable, and allowed contact basis.
   - Outcome: outreach is not blind scraping.

2. **Data retention**
   - Add retention policies by tenant and data type.
   - Outcome: data does not live forever by accident.

3. **DSAR/export/delete**
   - Add contact/account export, suppression, delete/anonymize workflows.
   - Outcome: privacy requests can be handled.

4. **Policy gates**
   - Block prohibited industries, personal emails when policy says no, risky language, and missing unsubscribe.
   - Outcome: safer operation by default.

5. **Governance reports**
   - Add monthly compliance summary, suppression report, source report, and audit log export.
   - Outcome: clients can trust the system.

### Verified Deliverables

- Migration: consent basis, retention policy, privacy requests, governance reports.
- Backend: policy engine, delete/anonymize jobs, exports.
- Dashboard: compliance center.
- Tests: policy gate tests, privacy workflow tests.
- E2E proof: delete/suppress/export request changes data and blocks future sends.

## Program 12: Production Operations and CI Proof

Objective: Prove the system can run daily without silent breakage.

### Phases

1. **Health checks**
   - Add `/api/health/revenue-os` for DB, queues, email provider, LLM provider, lead connectors, Gmail, and storage.
   - Outcome: production readiness is machine-checkable.

2. **Observability**
   - Add Sentry traces, structured logs, job metrics, provider cost metrics, and alert thresholds.
   - Outcome: failures are visible.

3. **Runbooks**
   - Add runbooks for failed workers, bad connector credentials, high bounce rate, migration failure, provider outage, and tenant incident.
   - Outcome: operations are repeatable.

4. **CI gates**
   - Split dirty work into clean PRs and require lint, typecheck, unit, RLS, build, focused E2E, and production verify.
   - Outcome: remote CI proves changes on a clean branch.

5. **Load and scale smoke**
   - Test 1,000 leads, 10,000 queued jobs, 5 tenants, sequence caps, dashboard response time, and export performance.
   - Outcome: system can handle real daily use.

### Verified Deliverables

- Backend: health routes, metrics, structured logs.
- Docs: incident runbooks, deploy/rollback checklist.
- CI: required quality gates and artifacts.
- Tests: load smoke, queue concurrency, failure injection.
- E2E proof: daily run processes real test data and emits clean health/metrics.

## Master Verification Matrix

| Verification Gate | Required Command/Evidence | Required Result |
|---|---|---|
| Type safety | `npm run typecheck` | Pass |
| Lint | `npm run lint` | Pass |
| Unit tests | `npm run test:unit` | Pass, Revenue OS modules covered |
| Content validation | `npm run validate` | Pass |
| RLS/security policies | `npm run test:rls` | Pass tenant/admin isolation |
| Build | `npm run build` | Pass with production env placeholders or real staging env |
| Focused E2E | `npx playwright test tests/e2e/admin/acquisition.spec.ts --config=playwright.e2e.config.ts --project=chromium` | Pass |
| Full E2E | `npm run test:e2e` | Pass or documented unrelated failure |
| Production verify | `npm run verify:prod` | Pass |
| Security audit | `npm audit --audit-level=high` | No high/critical advisories |
| Migration proof | `supabase db push --dry-run` then controlled apply | Clean migration history, no drift |
| Dashboard proof | Playwright screenshot/evidence of admin dashboard | KPI, queue, connector, email, inbox, tenant views render |
| Real data proof | Seed/import real or staging-safe records | Metrics, scores, drafts, jobs, and sequences update correctly |
| Worker proof | Run worker executor on queued jobs | Completed jobs, retries, traces, no orphaned locks |
| API proof | Curl/Postman/local script imports/exports data | Auth, validation, idempotency, rate limits verified |
| Email proof | Provider sandbox/manual-review send + webhook simulation | Suppression, unsubscribe, bounce, reply stops verified |
| ML proof | Train/evaluate fixture model | Model version, calibration, score decisions stored |
| Tenant proof | Two-tenant E2E and RLS tests | Cross-tenant access blocked |

## Final Institutional Definition of Done

The Revenue OS is institutional-grade only when all of these are true:

1. Real sources can import leads/jobs into tenant-scoped tables.
2. Durable workers process audits, enrichment, scoring, outreach drafting, inbox sync, and sequences with retries and dead-letter handling.
3. Every generated outreach draft is grounded in stored evidence and reviewable before send.
4. Email sending enforces suppression, unsubscribe, bounce, complaint, and domain health rules.
5. Gmail/inbox replies update CRM stages and stop sequences automatically.
6. The dashboard shows live operational status, daily priority actions, revenue metrics, and learning insights.
7. Tenants, roles, API keys, RLS, audit logs, exports, and billing boundaries are in place.
8. APIs accept external datasets and events safely with validation, idempotency, rate limits, and signed webhooks.
9. ML scoring uses stored outcomes and reports calibration/drift instead of pretending to know.
10. Compliance records prove source provenance, contact basis, suppression, unsubscribe, retention, and privacy workflows.
11. Health checks, logs, traces, costs, alerts, runbooks, CI, and rollback are active.
12. Full verification passes against staging-safe real data, not only mocks.

## Recommended Build Order

1. Program 1: Durable Worker Runtime
2. Program 2: Live Connector Engine
3. Program 3: Real Website Audit Automation
4. Program 4: AI Personalization With Evidence Locks
5. Program 5: Email Safety, Deliverability, and Sequences
6. Program 6: Inbox and Reply Intelligence
7. Program 7: Multi-Tenant SaaS Foundation — completed
8. Program 8: Public API and Productization Layer — next
9. Program 9: ML Scoring and Learning Loop
10. Program 10: Revenue Intelligence Dashboard
11. Program 11: Compliance, Privacy, and Governance
12. Program 12: Production Operations and CI Proof

This order is intentional. Durable execution comes before more integrations. Live data comes before AI/ML optimization. Safety and tenancy come before client-facing SaaS. Observability and CI proof come last as the institutional lock.

## Expected Score Movement

| Milestone | Expected Score |
|---|---:|
| After Programs 1-3 | 75-82 internal ops; real lead/job data begins flowing |
| After Programs 4-6 | 82-88 acquisition engine; usable daily with human review |
| After Programs 7-8 | 85-90 productized SaaS foundation |
| After Programs 9-10 | 88-93 intelligence and dashboard maturity |
| After Programs 11-12 | 92-96 institutional production readiness |

Getting to a true 100/100 requires live usage over time: real replies, meetings, wins/losses, bounce rates, provider reputation, tenant incidents, and calibration data. The build can create the system; sustained operation proves it.
