import {
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
  type KeyLike,
} from 'node:crypto'
import { isAbsolute, resolve, sep } from 'node:path'

import {
  EVALUATOR_VERSION,
  evaluatorPolicyHash,
  type LabLanguage,
} from '../../../../lib/academy/lab-evaluator/contract'

const SHA256_RE = /^[0-9a-f]{64}$/
const REGISTRY_VERSION_RE = /^sha256:[0-9a-f]{64}$/
const RELEASE_ID_RE = /^[a-z0-9][a-z0-9._-]{2,95}$/
const REVISION_RE = /^[a-zA-Z0-9._-]{1,64}$/
const LAB_KEY_RE = /^[a-z0-9][a-z0-9_-]{1,95}\/[a-z0-9][a-z0-9_-]{1,95}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const PINNED_IMAGE_RE = /^[a-zA-Z0-9][a-zA-Z0-9._/:@-]*@sha256:[0-9a-f]{64}$/

export const REQUIRED_ADVERSARIAL_PROBES = Object.freeze([
  'incorrect_submission',
  'substring_cheat',
  'timeout',
  'output_bomb',
  'memory_bomb',
  'fork_bomb',
  'filesystem_write',
  'network_access',
  'signature_tamper',
  'replay',
  'hidden_test_disclosure',
] as const)

export const STAGING_READINESS_GATES = Object.freeze([
  'manifest_valid',
  'private_pack_valid',
  'rootless_runtime',
  'digest_pinned_images',
  'migrations_applied',
  'private_https_ingress',
  'reference_solutions_passed',
  'adversarial_probes_passed',
  'receipts_reconciled',
  'monitoring_ready',
  'kill_switch_ready',
] as const)

type RegistryInput = {
  registryVersion: string
  courses: Array<{
    slug: string
    lessons: Array<{ slug: string; labBlocks?: number }>
  }>
}

export type FlagshipActivationLab = {
  labKey: string
  blockIndex: number
  language: LabLanguage
  specRevision: string
  specDigest: string
}

export type FlagshipActivationManifest = {
  schemaVersion: 1
  releaseId: string
  registryVersion: string
  status: 'candidate'
  labs: FlagshipActivationLab[]
}

export type ProbeId = 'correct_reference' | typeof REQUIRED_ADVERSARIAL_PROBES[number]

export type ActivationAttestationPayload = {
  schemaVersion: 1
  releaseId: string
  registryVersion: string
  evaluatorVersion: string
  policyHash: string
  issuedAt: string
  runtimeImages: Record<LabLanguage, string>
  labs: Array<Pick<FlagshipActivationLab, 'labKey' | 'blockIndex' | 'specRevision' | 'specDigest'> & {
    evaluationId: string
    receiptEvaluationId: string
    receiptId: string
    submissionDigest: string
    probes: Record<string, unknown>
  }>
}

export type SignedActivationAttestation = {
  payload: ActivationAttestationPayload
  signature: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} has unexpected or private fields`)
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function parseActivationLab(value: unknown): FlagshipActivationLab {
  if (!isRecord(value)) throw new Error('activation lab must be an object')
  exactKeys(value, ['labKey', 'blockIndex', 'language', 'specRevision', 'specDigest'], 'activation lab')
  if (typeof value.labKey !== 'string' || !LAB_KEY_RE.test(value.labKey)) throw new Error('invalid activation lab key')
  if (!Number.isSafeInteger(value.blockIndex) || (value.blockIndex as number) < 0) throw new Error('invalid activation block index')
  if (!['python', 'javascript', 'sql'].includes(String(value.language))) throw new Error('invalid activation language')
  if (typeof value.specRevision !== 'string' || !REVISION_RE.test(value.specRevision)) throw new Error('invalid spec revision')
  if (typeof value.specDigest !== 'string' || !SHA256_RE.test(value.specDigest)) throw new Error('invalid spec digest')
  return value as FlagshipActivationLab
}

export function parseFlagshipActivationManifest(
  value: unknown,
  registry: RegistryInput,
): FlagshipActivationManifest {
  if (!isRecord(value)) throw new Error('activation manifest must be an object')
  exactKeys(value, ['schemaVersion', 'releaseId', 'registryVersion', 'status', 'labs'], 'activation manifest')
  if (value.schemaVersion !== 1) throw new Error('unsupported activation manifest schema')
  if (typeof value.releaseId !== 'string' || !RELEASE_ID_RE.test(value.releaseId)) throw new Error('invalid activation release id')
  if (typeof value.registryVersion !== 'string' || value.registryVersion !== registry.registryVersion) {
    throw new Error('activation registry version mismatch')
  }
  if (value.status !== 'candidate') throw new Error('activation manifest must remain candidate until attested')
  if (!Array.isArray(value.labs) || value.labs.length < 3 || value.labs.length > 5) {
    throw new Error('activation manifest requires 3-5 labs')
  }
  const labs = value.labs.map(parseActivationLab)
  if (new Set(labs.map((lab) => lab.labKey)).size !== labs.length) throw new Error('activation labs must be unique')
  if (new Set(labs.map((lab) => lab.language)).size !== 3) throw new Error('activation labs must span Python, JavaScript, and SQL')

  const registryLabs = new Set(
    registry.courses.flatMap((course) => course.lessons
      .filter((lesson) => (lesson.labBlocks ?? 0) > 0)
      .map((lesson) => `${course.slug}/${lesson.slug}`)),
  )
  for (const lab of labs) if (!registryLabs.has(lab.labKey)) throw new Error(`activation lab is not canonical: ${lab.labKey}`)
  return { ...(value as Omit<FlagshipActivationManifest, 'labs'>), labs }
}

export function validatePrivateSpecRoot(
  repoRoot: string,
  privateSpecRoot: string,
  info: { isDirectory: boolean; isSymbolicLink: boolean },
): string {
  if (!isAbsolute(repoRoot) || !isAbsolute(privateSpecRoot)) throw new Error('private spec roots must be absolute')
  const repo = resolve(repoRoot)
  const root = resolve(privateSpecRoot)
  if (root === repo || root.startsWith(`${repo}${sep}`)) throw new Error('private spec root must live outside the repository')
  if (!info.isDirectory) throw new Error('private spec root must be a directory')
  if (info.isSymbolicLink) throw new Error('private spec root must not be a symbolic link')
  return root
}

export function buildStagingProbePlan(): Array<{ id: ProbeId; expected: 'passed' | 'blocked' }> {
  return [
    { id: 'correct_reference', expected: 'passed' },
    ...REQUIRED_ADVERSARIAL_PROBES.map((id) => ({ id, expected: 'blocked' as const })),
  ]
}

export function evaluateStagingReadiness(
  gates: Record<string, boolean>,
): { status: 'ready' | 'blocked'; blockedGates: string[] } {
  const blockedGates = STAGING_READINESS_GATES.filter((gate) => gates[gate] !== true)
  return { status: blockedGates.length ? 'blocked' : 'ready', blockedGates }
}

function normalizePrivateKey(key: KeyLike) {
  return typeof key === 'string' || Buffer.isBuffer(key) ? createPrivateKey(key) : key
}

function normalizePublicKey(key: KeyLike) {
  return typeof key === 'string' || Buffer.isBuffer(key) ? createPublicKey(key) : key
}

export function signActivationAttestation(
  payload: ActivationAttestationPayload,
  privateKey: KeyLike,
): SignedActivationAttestation {
  const signature = sign(null, Buffer.from(stableStringify(payload)), normalizePrivateKey(privateKey)).toString('base64')
  return { payload, signature }
}

function assertAttestationPayload(
  payload: ActivationAttestationPayload,
  manifest: FlagshipActivationManifest,
): void {
  if (!isRecord(payload)) throw new Error('activation attestation payload must be an object')
  exactKeys(payload, [
    'schemaVersion', 'releaseId', 'registryVersion', 'evaluatorVersion', 'policyHash',
    'issuedAt', 'runtimeImages', 'labs',
  ], 'activation attestation payload')
  if (payload.schemaVersion !== 1) throw new Error('unsupported activation attestation schema')
  if (payload.releaseId !== manifest.releaseId) throw new Error('activation release mismatch')
  if (payload.registryVersion !== manifest.registryVersion) throw new Error('activation registry version mismatch')
  if (payload.evaluatorVersion !== EVALUATOR_VERSION) throw new Error('activation evaluator version mismatch')
  if (payload.policyHash !== evaluatorPolicyHash()) throw new Error('activation policy mismatch')
  if (!Number.isFinite(Date.parse(payload.issuedAt))) throw new Error('invalid activation issuedAt')
  if (!isRecord(payload.runtimeImages)) throw new Error('activation runtime images must be an object')
  exactKeys(payload.runtimeImages, ['python', 'javascript', 'sql'], 'activation runtime images')
  for (const image of Object.values(payload.runtimeImages)) {
    if (typeof image !== 'string' || !PINNED_IMAGE_RE.test(image)) throw new Error('activation runtime image must be digest-pinned')
  }
  if (!Array.isArray(payload.labs) || payload.labs.length !== manifest.labs.length) throw new Error('activation lab proof coverage mismatch')

  const manifestByKey = new Map(manifest.labs.map((lab) => [lab.labKey, lab]))
  const observed = new Set<string>()
  for (const lab of payload.labs) {
    if (!isRecord(lab)) throw new Error('activation lab proof must be an object')
    exactKeys(lab, [
      'labKey', 'blockIndex', 'specRevision', 'specDigest', 'evaluationId',
      'receiptEvaluationId', 'receiptId', 'submissionDigest', 'probes',
    ], 'activation lab proof')
    const expected = typeof lab.labKey === 'string' ? manifestByKey.get(lab.labKey) : undefined
    if (!expected || observed.has(expected.labKey)) throw new Error('activation includes unknown or duplicate lab proof')
    observed.add(expected.labKey)
    if (lab.blockIndex !== expected.blockIndex || lab.specRevision !== expected.specRevision || lab.specDigest !== expected.specDigest) {
      throw new Error('activation lab proof does not match manifest')
    }
    if (typeof lab.evaluationId !== 'string' || !UUID_RE.test(lab.evaluationId)) throw new Error('invalid activation evaluation id')
    if (lab.receiptEvaluationId !== lab.evaluationId) throw new Error('activation receipt does not reconcile to evaluation')
    if (typeof lab.receiptId !== 'string' || !UUID_RE.test(lab.receiptId)) throw new Error('invalid activation receipt id')
    if (typeof lab.submissionDigest !== 'string' || !SHA256_RE.test(lab.submissionDigest)) throw new Error('invalid activation submission digest')
    if (!isRecord(lab.probes)) throw new Error('activation probes must be an object')
    exactKeys(lab.probes, ['correct_reference', ...REQUIRED_ADVERSARIAL_PROBES], 'activation probes')
    if (lab.probes.correct_reference !== 'passed') throw new Error('activation reference solution did not pass')
    for (const probe of REQUIRED_ADVERSARIAL_PROBES) {
      if (lab.probes[probe] !== 'blocked') throw new Error(`activation adversarial probe did not block: ${probe}`)
    }
  }
}

export function verifyActivationAttestation(
  envelope: SignedActivationAttestation,
  publicKey: KeyLike,
  manifest: FlagshipActivationManifest,
): {
  trustedLabKeys: ReadonlySet<string>
  evidenceByLesson: ReadonlyMap<string, { lab: { trust: 'controlled_evaluator'; results: Array<{ blockIndex: number; status: 'pass' }> } }>
} {
  if (!isRecord(envelope) || typeof envelope.signature !== 'string' || !isRecord(envelope.payload)) {
    throw new Error('invalid activation attestation envelope')
  }
  const authentic = verify(
    null,
    Buffer.from(stableStringify(envelope.payload)),
    normalizePublicKey(publicKey),
    Buffer.from(envelope.signature, 'base64'),
  )
  if (!authentic) throw new Error('invalid activation attestation signature')
  assertAttestationPayload(envelope.payload as ActivationAttestationPayload, manifest)
  const trustedLabKeys = new Set(envelope.payload.labs.map((lab) => lab.labKey))
  const evidenceByLesson = new Map(envelope.payload.labs.map((lab) => [lab.labKey, {
    lab: {
      trust: 'controlled_evaluator' as const,
      results: [{ blockIndex: lab.blockIndex, status: 'pass' as const }],
    },
  }]))
  return { trustedLabKeys, evidenceByLesson }
}
