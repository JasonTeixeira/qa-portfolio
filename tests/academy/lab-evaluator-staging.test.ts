import assert from 'node:assert/strict'
import { generateKeyPairSync } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, it } from 'node:test'

import { evaluatorPolicyHash, EVALUATOR_VERSION } from '../../lib/academy/lab-evaluator/contract'
// @ts-expect-error RED contract: this module is intentionally absent until Step 4B GREEN.
import { masteryPersistenceEnabled } from '../../lib/academy/lab-evaluator/activation'
// @ts-expect-error RED contract: this module is intentionally absent until Step 4B GREEN.
import * as stagingCore from '../../scripts/academy/lab-evaluator/staging/core'

const {
  REQUIRED_ADVERSARIAL_PROBES,
  buildStagingProbePlan,
  evaluateStagingReadiness,
  parseFlagshipActivationManifest,
  signActivationAttestation,
  validatePrivateSpecRoot,
  verifyActivationAttestation,
} = stagingCore

const REGISTRY_VERSION = `sha256:${'a'.repeat(64)}`
const RELEASE_ID = 'flagship-labs-2026-08-27.1'
const LABS = [
  ['programming-fundamentals/input-validation', 'python'],
  ['programming-fundamentals/functions-basics', 'python'],
  ['the-llm-api/token-cost-model', 'javascript'],
  ['the-llm-api/function-tool-calling', 'javascript'],
  ['career-databases_data_modeling/query-design-joins', 'sql'],
] as const

const registry = {
  registryVersion: REGISTRY_VERSION,
  courses: [
    {
      slug: 'programming-fundamentals',
      lessons: [
        { slug: 'input-validation', labBlocks: 1 },
        { slug: 'functions-basics', labBlocks: 1 },
      ],
    },
    {
      slug: 'the-llm-api',
      lessons: [
        { slug: 'token-cost-model', labBlocks: 1 },
        { slug: 'function-tool-calling', labBlocks: 1 },
      ],
    },
    {
      slug: 'career-databases_data_modeling',
      lessons: [{ slug: 'query-design-joins', labBlocks: 1 }],
    },
  ],
}

function manifest() {
  return {
    schemaVersion: 1 as const,
    releaseId: RELEASE_ID,
    registryVersion: REGISTRY_VERSION,
    status: 'candidate' as const,
    labs: LABS.map(([labKey, language], index) => ({
      labKey,
      blockIndex: 7,
      language,
      specRevision: `2026-08-27.${index + 1}`,
      specDigest: String(index + 1).repeat(64),
    })),
  }
}

function attestationPayload() {
  return {
    schemaVersion: 1 as const,
    releaseId: RELEASE_ID,
    registryVersion: REGISTRY_VERSION,
    evaluatorVersion: EVALUATOR_VERSION,
    policyHash: evaluatorPolicyHash(),
    issuedAt: '2026-08-27T21:00:00.000Z',
    runtimeImages: {
      python: `registry.example/sage-python@sha256:${'1'.repeat(64)}`,
      javascript: `registry.example/sage-js@sha256:${'2'.repeat(64)}`,
      sql: `registry.example/sage-sql@sha256:${'3'.repeat(64)}`,
    },
    labs: manifest().labs.map((lab, index) => ({
      labKey: lab.labKey,
      blockIndex: lab.blockIndex,
      specRevision: lab.specRevision,
      specDigest: lab.specDigest,
      evaluationId: `018f47a2-4b8d-7f31-8c5a-1ccf64d58b2${index}`,
      receiptEvaluationId: `018f47a2-4b8d-7f31-8c5a-1ccf64d58b2${index}`,
      receiptId: `018f47a2-4b8d-7f31-8c5a-1ccf64d58b3${index}`,
      submissionDigest: String(index + 4).repeat(64),
      probes: Object.fromEntries([
        ['correct_reference', 'passed'],
        ...REQUIRED_ADVERSARIAL_PROBES.map((probe: string) => [probe, 'blocked']),
      ]),
    })),
  }
}

describe('academy Step 4B staging activation contract', () => {
  it('selects 3-5 canonical flagship labs spanning Python, JavaScript, and SQL without private material', () => {
    const parsed = parseFlagshipActivationManifest(manifest(), registry)
    assert.equal(parsed.labs.length, 5)
    assert.deepEqual(new Set(parsed.labs.map((lab: { language: string }) => lab.language)), new Set(['python', 'javascript', 'sql']))

    assert.throws(
      () => parseFlagshipActivationManifest({
        ...manifest(),
        labs: [{ ...manifest().labs[0], referenceSolution: 'print("secret")' }, ...manifest().labs.slice(1)],
      }, registry),
      /private|unexpected/i,
    )
    assert.throws(
      () => parseFlagshipActivationManifest({ ...manifest(), registryVersion: `sha256:${'b'.repeat(64)}` }, registry),
      /registry version/i,
    )
  })

  it('requires private specs to live outside the repository and rejects symlinked roots', () => {
    const repoRoot = '/srv/sageideas'
    assert.equal(validatePrivateSpecRoot(repoRoot, '/srv/private/academy-labs', { isDirectory: true, isSymbolicLink: false }), '/srv/private/academy-labs')
    assert.throws(
      () => validatePrivateSpecRoot(repoRoot, '/srv/sageideas/private-specs', { isDirectory: true, isSymbolicLink: false }),
      /outside/i,
    )
    assert.throws(
      () => validatePrivateSpecRoot(repoRoot, '/srv/private/academy-labs', { isDirectory: true, isSymbolicLink: true }),
      /symbolic link/i,
    )
  })

  it('defines a complete adversarial plan and fails readiness closed on any missing proof gate', () => {
    const plan = buildStagingProbePlan()
    assert.deepEqual(plan.map((probe: { id: string }) => probe.id), ['correct_reference', ...REQUIRED_ADVERSARIAL_PROBES])
    assert.equal(new Set(plan.map((probe: { id: string }) => probe.id)).size, plan.length)

    const allPassed = Object.fromEntries([
      'manifest_valid', 'private_pack_valid', 'rootless_runtime', 'digest_pinned_images',
      'migrations_applied', 'private_https_ingress', 'reference_solutions_passed',
      'adversarial_probes_passed', 'receipts_reconciled', 'monitoring_ready', 'kill_switch_ready',
    ].map((gate) => [gate, true]))
    assert.deepEqual(evaluateStagingReadiness(allPassed), { status: 'ready', blockedGates: [] })
    assert.deepEqual(evaluateStagingReadiness({ ...allPassed, rootless_runtime: false }), {
      status: 'blocked',
      blockedGates: ['rootless_runtime'],
    })
  })

  it('promotes only an Ed25519-attested, policy-pinned, receipt-reconciled activation release', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519')
    const envelope = signActivationAttestation(attestationPayload(), privateKey)
    const verified = verifyActivationAttestation(envelope, publicKey, manifest())
    assert.deepEqual([...verified.trustedLabKeys].sort(), LABS.map(([labKey]) => labKey).sort())
    assert.equal(verified.evidenceByLesson.get('the-llm-api/token-cost-model')?.lab?.results?.[0]?.status, 'pass')

    assert.throws(
      () => verifyActivationAttestation({
        ...envelope,
        payload: { ...envelope.payload, policyHash: 'f'.repeat(64) },
      }, publicKey, manifest()),
      /signature|policy/i,
    )
    const mismatchedReceipt = {
      ...attestationPayload(),
      labs: attestationPayload().labs.map((lab, index) => index === 0
        ? { ...lab, receiptEvaluationId: '018f47a2-4b8d-7f31-8c5a-1ccf64d58b99' }
        : lab),
    }
    assert.throws(
      () => verifyActivationAttestation(signActivationAttestation(mismatchedReceipt, privateKey), publicKey, manifest()),
      /receipt/i,
    )
  })

  it('keeps mastery writes disabled unless both the release and explicit kill switch match', () => {
    assert.equal(masteryPersistenceEnabled({}, RELEASE_ID), false)
    assert.equal(masteryPersistenceEnabled({ ACADEMY_LAB_MASTERY_WRITES_ENABLED: 'true' }, RELEASE_ID), false)
    assert.equal(masteryPersistenceEnabled({
      ACADEMY_LAB_MASTERY_WRITES_ENABLED: 'true',
      ACADEMY_LAB_ACTIVATION_RELEASE: RELEASE_ID,
    }, RELEASE_ID), true)
    assert.equal(masteryPersistenceEnabled({
      ACADEMY_LAB_MASTERY_WRITES_ENABLED: 'TRUE',
      ACADEMY_LAB_ACTIVATION_RELEASE: RELEASE_ID,
    }, RELEASE_ID), false)
  })

  it('feeds private SQL fixtures over stdin while stripping the public practice fixture', () => {
    const dir = mkdtempSync(join(tmpdir(), 'academy-sql-private-fixture-'))
    const sourcePath = join(dir, 'submission.sql')
    try {
      writeFileSync(sourcePath, [
        '-- academy-public-fixture:start',
        'CREATE TABLE values_to_sum (value INTEGER);',
        'INSERT INTO values_to_sum VALUES (999);',
        '-- academy-public-fixture:end',
        'SELECT SUM(value) AS total FROM values_to_sum;',
      ].join('\n'))
      const result = spawnSync('python3', [
        resolve('services/academy-lab-evaluator/runtimes/python-sql/run_sql.py'),
        sourcePath,
      ], {
        input: 'CREATE TABLE values_to_sum (value INTEGER); INSERT INTO values_to_sum VALUES (7), (8);',
        encoding: 'utf8',
      })
      assert.equal(result.status, 0, result.stderr)
      assert.equal(result.stdout, 'total\n15\n')
      assert.equal(result.stdout.includes('999'), false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
