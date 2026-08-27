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

1. migration `0116_academy_trusted_lab_evaluations.sql` is applied and its RLS/execute grants are verified;
2. the application and evaluator share a rotated production secret;
3. evaluator health and a deliberately broken submission are proven through private ingress;
4. timeout, output bomb, fork bomb, filesystem write, network access, signature tamper, replay, and hidden-case failure probes all fail as designed;
5. at least one flagship lab has a reviewed private pack and a reconciled live receipt;
6. monitoring covers latency, 429s, resource-limit terminations, spec failures, and evidence-persistence errors.

Until then, the UI deliberately reports practice-only and no new `lab_verified` event can be written through the application.
