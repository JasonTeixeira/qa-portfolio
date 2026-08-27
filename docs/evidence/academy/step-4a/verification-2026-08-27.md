# Academy Step 4A — Local Verification

Date: 2026-08-27

## Proven locally

- Browser stdout is no longer an input to `verifyLab`; learner source code is submitted.
- Requests and responses use separate HMAC contexts, a 60-second freshness window, request replay rejection, and exact request/lab/digest binding.
- Private specs require a reference solution, at least two hidden cases, and a negative case.
- Exact output is required; substring output fails.
- Hidden stdin, expected output, private cases, and reference solutions do not enter Docker arguments or evaluator responses.
- Docker policy requires digest-pinned images, no network, read-only root/source, non-root UID, dropped capabilities, no-new-privileges, CPU/memory/PID/file/tmpfs/output/wall limits, and forced cleanup.
- Missing/invalid specs, missing configuration, evaluator failure, and persistence failure all fail closed to practice-only.
- Generic evidence writes reject `lab_verified`.
- The database migration makes evaluation receipts append-only and commits the receipt plus two mastery events atomically through a service-role-only function.

## Deliberately not claimed

- No evaluator service, runtime image, secret, or migration was deployed.
- No live Docker isolation probe ran in this worktree.
- No private test pack was authored for the 354 current labs.
- No live Supabase receipt was reconciled.
- Academy Certification Harness V2 must continue reporting `untrusted_current_runtime` for current labs.

Those are activation/remediation gates, not evidence that this local implementation already operates in production.
