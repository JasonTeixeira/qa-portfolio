# SageIdeas Local Production Candidate handoff

Local Production Candidate is not deployment approval. It proves the safe-local repository gates only.

## Local proof

- Release: `local-candidate-2026-09-05-c973f277`
- Commit: `c973f277137ae731e3e31104f6c3e47d0673a50c`
- Inventory: `sha256:64afc69a0efc3a83956c70c4c9e3fff8aaea05ec69dd68f55a014919592592be`
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

- observations: `sha256:87b113a14a4c4ebea4d76f04b4c1f3fc2f086081090580fe7c168212bea21c82` — docs/evidence/project-loop/observations-latest.json
- securityReview: `sha256:7eae1a14f09116f3e9a674a0a44182952a93503b5420177562e478706a79ba89` — docs/evidence/project-loop/security-review-latest.json
- accessibilityPerformance: `sha256:e27f0119cdc302c4e2430f45d1b3dd9c11afd3ea33b772ab56ffa3b8e097f3c5` — docs/evidence/project-loop/accessibility-performance-audit.json
- observabilityRecovery: `sha256:12542705e5e105e7eb0972293bc4a627772ef0f4d966e3258ee8e5894cf0bbdc` — docs/evidence/project-loop/observability-recovery-audit.json
