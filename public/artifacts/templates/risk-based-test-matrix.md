# Risk-Based Test Matrix

## Scoring model
- **Impact (1–5)**: customer/business impact if broken
- **Likelihood (1–5)**: probability of defect
- **Risk score** = Impact × Likelihood

## Test depth mapping
| Risk Score | Suggested Coverage |
|-----------:|--------------------|
| 1–6        | Smoke + basic checks |
| 7–12       | Regression + negative paths |
| 13–19      | Deep regression + automation priority |
| 20–25      | Deep regression + automation + security/perf checks |

## Matrix template
| Feature/Flow | Impact | Likelihood | Score | Coverage Level | Automation? | Notes |
|--------------|--------|------------|------:|----------------|------------|------|
|              |        |            |       |                |            |      |
