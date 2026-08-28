# Academy lab evaluator Step 4B readiness

- Generated: 2026-08-28T01:29:00.383Z
- Release: `flagship-labs-2026-08-27.1`
- Registry: `sha256:6d54d95a42e89c796e7e6cd96c26107aaac298374d570bbf6888b20c66f0108a`
- Candidate labs: 5
- Status: **BLOCKED**
- Private material included: no

| Gate | Result |
| --- | --- |
| manifest_valid | PASS |
| private_pack_valid | PASS |
| rootless_runtime | BLOCKED |
| digest_pinned_images | BLOCKED |
| migrations_applied | BLOCKED |
| private_https_ingress | BLOCKED |
| reference_solutions_passed | BLOCKED |
| adversarial_probes_passed | BLOCKED |
| receipts_reconciled | BLOCKED |
| monitoring_ready | BLOCKED |
| kill_switch_ready | BLOCKED |

## Observations

- This host has not proven a rootless Docker evaluator runtime.
- All three runtime images need digest pins or a valid signed activation attestation.
- Staging has not supplied release-bound evidence that migrations 0116 and 0117 are applied.
- The evaluator private HTTPS health probe did not pass.
- No valid Ed25519 activation attestation proves private references, adversarial probes, and receipt reconciliation.
- Release-bound monitoring and alerting evidence is absent.
- Mastery writes remain disabled by the two-part release kill switch.
