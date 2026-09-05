# SageIdeas Local Production Candidate handoff

Local Production Candidate is not deployment approval. It proves the safe-local repository gates only.

## Local proof

- Release: `local-candidate-2026-09-05-e42a1492`
- Commit: `e42a1492d6a71e0fa563b355fd7a2a55ab504f2b`
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

- observations: `sha256:251bbbc06695ad4e1c4f3a05b9fb0cc626ab91a44ff4597acf9735ea2d83950e` — docs/evidence/project-loop/observations-latest.json
- securityReview: `sha256:7eae1a14f09116f3e9a674a0a44182952a93503b5420177562e478706a79ba89` — docs/evidence/project-loop/security-review-latest.json
- accessibilityPerformance: `sha256:e0ea407190bdef51fd142ccb9910e0dfb6e97beb32ee9bd1b69d1e4f637547d6` — docs/evidence/project-loop/accessibility-performance-audit.json
- observabilityRecovery: `sha256:42e18b858a2ec09af886b7331e3ee18335061eca012982068ab15bd4fc124097` — docs/evidence/project-loop/observability-recovery-audit.json
