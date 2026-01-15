# Flaky Test Triage Playbook

## 1) Confirm flake
- Re-run with same commit/env
- Capture logs, screenshots, network

## 2) Classify
- Timing/waits
- Test data coupling
- Environment instability
- External dependency
- Non-deterministic UI

## 3) Fix patterns
- Replace sleeps with explicit waits
- Improve selectors / page objects
- Isolate test data (unique IDs)
- Add retries only when justified (429/5xx)

## 4) Prevention
- CI quarantine label
- Flake budget + SLA
- Weekly flake review
