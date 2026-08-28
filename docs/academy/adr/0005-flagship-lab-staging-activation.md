# ADR 0005: Flagship lab staging activation

- Status: Accepted for local implementation
- Date: 2026-08-27
- Scope: Academy Step 4B controlled-runtime activation

## Context

Step 4A established a fail-closed evaluator and mastery receipt boundary, but infrastructure alone does not prove any authored lab. Activating all 354 labs together would make private-pack defects, runtime-policy regressions, and receipt failures difficult to isolate.

## Decision

Activate one candidate release containing five canonical labs before expanding the trust boundary. The release covers Python, JavaScript, and SQL across programming foundations, applied AI, and database reasoning. Its public manifest contains only lab identity, canonical block index, language, private-spec revision, and SHA-256 digest. Private inputs, expected outputs, and reference solutions remain outside the repository.

The candidate release cannot produce mastery evidence unless all of these independent controls agree:

1. the lab is named in the public candidate manifest;
2. the private pack exactly matches the manifest and contains no extra spec;
3. a release-bound Ed25519 activation attestation proves rootless execution, digest-pinned images, migrations 0116/0117, private ingress, reference solutions, every required adversarial probe, reconciled receipts, monitoring, and the mastery kill switch;
4. the application has the two-part mastery-write switch enabled for that exact release; and
5. the evaluator returns a fresh authenticated passing result bound to the learner source digest.

Certification Harness V2 may promote only lab keys present in the verified attestation. All other labs retain `untrusted_current_runtime`, including other labs in the same course.

## Candidate release

The public release is `flagship-labs-2026-08-27.1` in `data/academy/lab-evaluator/flagship-activation.json`. It remains `candidate`; the repository does not claim a staging or production activation.

## Rollback

Unset `ACADEMY_LAB_MASTERY_WRITES_ENABLED`, change or unset `ACADEMY_LAB_ACTIVATION_RELEASE`, or remove the signed attestation paths. Each action fails closed before mastery persistence. Existing append-only receipts remain available for audit.
