# QA Playbook (1-page)

## What I optimize for
- **Risk reduction**: focus on the highest-impact failures first.
- **Fast feedback**: shorten time-to-signal in CI and PRs.
- **Repeatability**: stable automation + deterministic test data.
- **Actionable reporting**: failures should explain *why* and *how to fix*.

## My quality model (simple + scalable)
### 1) Align on risks
- Identify critical user journeys + business risks.
- Map risks to test depth (smoke, regression, exploratory, security, performance).

### 2) Build layered coverage
- **Unit + component tests** for fast developer feedback.
- **API tests** for contract, data, auth, and business rules.
- **E2E tests** for critical workflows (thin, stable, high ROI).
- **Visual regression** for UI drift.
- **Security checks** (OWASP-focused) for exploit prevention.

### 3) Make CI trustworthy
- Quarantine noisy tests quickly.
- Triage flakiness as an engineering problem.
- Report trends: pass rate, time, known flakes, failure categories.

## Definition of Done (DoD)
- Acceptance criteria validated (happy + negative paths)
- Critical workflows covered (automation where stable)
- Logging/monitoring validated (errors observable)
- Security basics covered (authz, secrets, OWASP checks)
- Release risk documented (go/no-go)

## Metrics I track
- Flake rate, mean time to detect, mean time to fix
- Coverage of critical workflows
- CI cycle time and stability
- Escaped defect rate and incident severity

## What you get when I join
- A clear quality strategy that scales
- A practical test plan + traceability
- Reliable automation with evidence-first reporting
