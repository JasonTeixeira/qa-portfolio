# SageIdeas Local Production Candidate handoff

Local Production Candidate is not deployment approval. It proves the safe-local repository gates only.

## Local proof

- Release: `local-candidate-2026-09-05-3eb5436a`
- Commit: `3eb5436a41873830d7c27e4ace2ef7e2f9a86e98`
- Inventory: `sha256:91c113dc3eb9630006a91fd342c2146bd31fefed83e7a3ad4d07dbaab4e74cfc`
- Status: `local_production_candidate`
- Observations: 23, failures: 0
- Dependencies: 0 known vulnerabilities
- Academy remains uncertified.
- Labs remain practice-only and `untrusted_current_runtime`.

## Pre-deploy

- [ ] Explicit external approval and named deployer/reviewer
- [ ] Target Vercel project, Supabase project, region, release commit, and environment confirmed
- [ ] Runtime variables configured from the manifest names without copying values into evidence
- [ ] Hosted migrations reviewed, backed up, and tested on an isolated target
- [ ] Rollback target and triggers agreed before mutation

## Staging

- [ ] Apply approved migrations and reconcile the hosted ledger
- [ ] Exercise auth/MFA, tenant isolation, billing/webhooks, communications/jobs, storage, and the five controlled evaluator labs
- [ ] Prove alert delivery, scrubbed Sentry traces, health/SLO signals, rate limits, and kill switches
- [ ] Run assistive-technology checks, field-like performance, rollback, and restore drills

## Post-deploy

- [ ] Verify active release identity, public health, critical customer journeys, audit events, queues, and provider receipts
- [ ] Monitor at least one agreed alert window and retain evidence
- [ ] Obtain the required human review and controlled-beta decision

## Rollback triggers

- readiness fails twice within five minutes
- a critical customer journey fails
- security or data-integrity regression
- error signals exceed the approved threshold

## External approval boundaries

- [ ] staging_deployment: approval_required
- [ ] hosted_migrations: approval_required
- [ ] live_integrations: approval_required
- [ ] controlled_lab_runtime: approval_required
- [ ] human_review_beta: approval_required

## Evidence hashes

- observations: `sha256:c16cad668f34c546581af14fd71d3d8a01c626674e8d920e10e44716733d65e7` — docs/evidence/project-loop/observations-latest.json
- securityReview: `sha256:7eae1a14f09116f3e9a674a0a44182952a93503b5420177562e478706a79ba89` — docs/evidence/project-loop/security-review-latest.json
- accessibilityPerformance: `sha256:a1381e718da976a04dd2a6bc14199078a4be8708830c1f399d53d3393f832330` — docs/evidence/project-loop/accessibility-performance-audit.json
- observabilityRecovery: `sha256:41146596808ec8df4dbacba88b9000774220cec228d10519aa6704ac05d4265a` — docs/evidence/project-loop/observability-recovery-audit.json
