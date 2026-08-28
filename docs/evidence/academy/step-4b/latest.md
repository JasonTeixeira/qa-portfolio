# Academy lab evaluator Step 4B readiness

- Generated: 2026-08-28T15:12:34.088Z
- Release: `flagship-labs-2026-08-27.1`
- Registry: `sha256:6d54d95a42e89c796e7e6cd96c26107aaac298374d570bbf6888b20c66f0108a`
- Candidate labs: 5
- Status: **BLOCKED**
- Private material included: no

| Gate | Result |
| --- | --- |
| manifest_valid | PASS |
| private_pack_valid | PASS |
| isolated_runtime | BLOCKED |
| digest_pinned_images | PASS |
| migrations_applied | BLOCKED |
| managed_runtime_binding | BLOCKED |
| reference_solutions_passed | BLOCKED |
| adversarial_probes_passed | BLOCKED |
| receipts_reconciled | BLOCKED |
| monitoring_ready | BLOCKED |
| kill_switch_ready | BLOCKED |

## Observations

- The reviewed signer, managed-project, and database-project authority pins are not provisioned.
- No signed activation attestation proves the managed isolated runtime.
- Staging has not supplied release-bound evidence that migrations 0116 through 0120 are applied.
- The managed Vercel Sandbox project binding is missing, mismatched, or not attested.
- No valid Ed25519 activation attestation proves private references, adversarial probes, and receipt reconciliation.
- Release-bound monitoring and alerting evidence is absent.
- Mastery writes remain disabled by the two-part release kill switch.
