# Controlled Lab Evaluator — Operator Contract

The evaluator is a separate service. Do not run it inside the Next.js/Vercel process and do not expose it directly to the public internet.

## Required deployment boundary

- Dedicated Linux host or isolated worker pool using rootless Docker and cgroup v2.
- Private ingress from the application tier, with TLS terminated before the loopback-bound service.
- No production database credentials, application secrets, cloud metadata access, or learner-data mounts on the evaluator host.
- Private specs mounted read-only outside the repository deployment and outside the writable job root.
- Runtime images built in CI, vulnerability-scanned, and configured by immutable digest.
- One service instance per replay cache. Horizontal scaling requires a shared nonce store before traffic is distributed across instances.

Docker documents that `--read-only`, `--network=none`, `--cap-drop`, `--security-opt=no-new-privileges`, memory/CPU limits, PID limits, and ulimits constrain the container boundary. The implementation pins and tests those arguments. See [Docker run](https://docs.docker.com/reference/cli/docker/container/run) and [resource constraints](https://docs.docker.com/engine/containers/resource_constraints/).

## Environment

Application tier:

```text
ACADEMY_LAB_EVALUATOR_URL=https://private-evaluator.example
ACADEMY_LAB_EVALUATOR_SECRET=<shared random secret, at least 32 bytes>
ACADEMY_LAB_MASTERY_WRITES_ENABLED=false
ACADEMY_LAB_ACTIVATION_RELEASE=flagship-labs-2026-08-27.1
ACADEMY_LAB_STAGING_ATTESTATION_PATH=/run/secrets/academy-activation.json
ACADEMY_LAB_STAGING_PUBLIC_KEY_PATH=/run/secrets/academy-activation-public.pem
ACADEMY_LAB_STAGING_DATABASE_PROJECT_REF=<exact staging Supabase project ref>
```

Evaluator tier:

```text
ACADEMY_LAB_EVALUATOR_SECRET=<same secret>
ACADEMY_EVALUATOR_PRIVATE_SPEC_ROOT=/srv/academy-evaluator/private-specs
ACADEMY_EVALUATOR_JOB_ROOT=/var/lib/academy-evaluator/jobs
ACADEMY_EVALUATOR_IMAGE_PYTHON=registry/image@sha256:<digest>
ACADEMY_EVALUATOR_IMAGE_JAVASCRIPT=registry/image@sha256:<digest>
ACADEMY_EVALUATOR_IMAGE_SQL=registry/image@sha256:<digest>
ACADEMY_EVALUATOR_HOST=127.0.0.1
ACADEMY_EVALUATOR_PORT=8787
```

Never put the shared secret in a `NEXT_PUBLIC_*` variable.

The configured host is enforced as `127.0.0.1`, `::1`, or `localhost`; startup rejects public bind addresses. Rotate the shared secret when either tier is rebuilt or an operator changes. A future asymmetric response-signing upgrade would further separate request authority from response-attestation authority.

## Private spec format

The filename for `course-slug/lesson-slug` is `course-slug--lesson-slug.json` inside the private spec root.

```json
{
  "schemaVersion": 1,
  "labKey": "python-basics/variables",
  "language": "python",
  "specRevision": "2026-08-27.1",
  "referenceSolution": "value = int(input())\nprint(value * 2)",
  "cases": [
    { "id": "happy", "kind": "happy", "stdin": "21\n", "expectedStdout": "42\n" },
    { "id": "negative", "kind": "negative", "stdin": "-2\n", "expectedStdout": "-4\n" }
  ]
}
```

Expected output is exact. Substring matching is prohibited. At least two cases and one negative case are mandatory.

## Build and run

Build runtime images with digest-pinned base images, publish them to the private registry, scan them, then configure their resulting digests. The Dockerfiles deliberately require `BASE_IMAGE` so an operator cannot silently build from a floating tag.

```bash
docker build --build-arg BASE_IMAGE=python@sha256:<digest> \
  -t registry/academy-python-sql:<release> \
  services/academy-lab-evaluator/runtimes/python-sql

docker build --build-arg BASE_IMAGE=node@sha256:<digest> \
  -t registry/academy-javascript:<release> \
  services/academy-lab-evaluator/runtimes/javascript

npm run academy:lab-evaluator:serve
```

Startup fails if Docker is not rootless, a configured image is missing, the roots are unsafe, or a required setting is absent.

## Activation gates

Do not change the academy-wide `labTrust` state or enable mastery writes in production until:

1. migrations `0116_academy_trusted_lab_evaluations.sql` and `0117_academy_lab_evaluator_policy_pin.sql` are applied in order and their RLS/execute grants are verified;
2. the application and evaluator share a rotated production secret;
3. evaluator health and a deliberately broken submission are proven through private ingress;
4. timeout, output bomb, fork bomb, filesystem write, network access, signature tamper, replay, and hidden-case failure probes all fail as designed;
5. at least one flagship lab has a reviewed private pack and a reconciled live receipt;
6. monitoring covers latency, 429s, resource-limit terminations, spec failures, and evidence-persistence errors.

Until then, the UI deliberately reports practice-only and no new `lab_verified` event can be written through the application.

## Step 4B readiness command

The first candidate is deliberately limited to five labs spanning Python, JavaScript, and SQL. Keep its private directory outside the checkout, owned by the evaluator operator, mode `0700`, and never place it in deployment artifacts.

```bash
ACADEMY_EVALUATOR_PRIVATE_SPEC_ROOT=/absolute/private/flagship-labs-2026-08-27.1 \
  npm run academy:lab-evaluator:staging-verify
```

The command writes a redacted report to `docs/evidence/academy/step-4b/`. It exits successfully when it can produce an honest readiness board; add `-- --require-ready` in a release gate to return a non-zero status while any gate is blocked. A report is ready only when the private HTTPS health check, exact release kill switch, and unexpired signed activation attestation all agree. The public key path is only a location: its SPKI SHA-256 fingerprint must match the reviewed manifest, so a caller cannot supply a self-signed trust root. The evaluator origin and database project must also hash to the manifest pins. Environment strings alone cannot assert migration, monitoring, isolation, adversarial-probe, or receipt proof.

The initial candidate manifest deliberately uses `unprovisioned` authority pins. Generate and protect the signer key, provision the private evaluator and staging database, then update the public fingerprint/origin/project digests through review. Do not enable mastery writes while any authority pin remains unprovisioned.

Certification Harness V2 reads the same attestation and public key paths. If neither is configured, every lab stays untrusted. If only one path is configured or the signature/release/registry/policy does not match, the audit fails closed.

## Policy upgrades

The application trust check and migration intentionally pin the evaluator version and the SHA-256 hash of its resource-limit policy. Changing `EVALUATOR_LIMITS` or `EVALUATOR_VERSION` requires a reviewed release that updates the application and adds a new migration/allowlist entry. A service running stale or unknown policy remains practice-only and cannot write mastery evidence.

Migration 0117 validates existing receipts while adding the pin. If a database contains receipts from an unknown policy, the migration deliberately fails so an operator can investigate and remediate those rows before retrying; do not bypass the constraint.
