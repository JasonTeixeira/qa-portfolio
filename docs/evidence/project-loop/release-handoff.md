# SageIdeas Local Production Candidate handoff

Local Production Candidate is not deployment approval. It proves the safe-local repository gates only.

## Local proof

- Release: `local-candidate-2026-09-04-a9d68a0b`
- Commit: `a9d68a0b6b749ef76f3c7b2ef848728507e2dcf9`
- Inventory: `sha256:150b09036478243b35d7a5387cf18102121935fd1eb95965236b3610042ca18a`
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

- observations: `sha256:21b2bc9a004fcd8515e9b1b252f11b3edc13fed916ff04078e0f418a04c084a9` — docs/evidence/project-loop/observations-latest.json
- securityReview: `sha256:7eae1a14f09116f3e9a674a0a44182952a93503b5420177562e478706a79ba89` — docs/evidence/project-loop/security-review-latest.json
- accessibilityPerformance: `sha256:70d9d855c7e140b4a73196429366a7df23a29b80f87bb9597d150f94fad3efbb` — docs/evidence/project-loop/accessibility-performance-audit.json
- observabilityRecovery: `sha256:5b5016f3bd487448f9a70aac0affd12b073d323d9dd473a60fb5422d23d7c8d5` — docs/evidence/project-loop/observability-recovery-audit.json
