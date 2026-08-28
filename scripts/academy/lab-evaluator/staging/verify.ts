import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lookup } from 'node:dns/promises'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import activationManifestJson from '../../../../data/academy/lab-evaluator/flagship-activation.json'
import registryJson from '../../../../data/academy/registry.json'
import { masteryPersistenceEnabled } from '../../../../lib/academy/lab-evaluator/activation'
import {
  STAGING_READINESS_GATES,
  type ActivationAttestationPayload,
  evaluateStagingReadiness,
  isPrivateNetworkAddress,
  parseFlagshipActivationManifest,
  resolvePrivateSpecRoot,
  validatePrivatePack,
  verifyActivationAttestation,
} from './core'

type Gate = typeof STAGING_READINESS_GATES[number]

type ReadinessReport = {
  schemaVersion: 1
  generatedAt: string
  releaseId: string
  registryVersion: string
  candidateLabCount: number
  status: 'ready' | 'blocked'
  gates: Record<Gate, boolean>
  blockedGates: string[]
  observations: string[]
  privateMaterialIncluded: false
}

const PINNED_IMAGE_RE = /@sha256:[0-9a-f]{64}$/

function identityDigest(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

async function resolvesOnlyToPrivateAddresses(hostname: string): Promise<boolean> {
  if (isPrivateNetworkAddress(hostname)) return true
  try {
    const addresses = await lookup(hostname, { all: true, verbatim: true })
    return addresses.length > 0 && addresses.every(({ address }) => isPrivateNetworkAddress(address))
  } catch {
    return false
  }
}

async function privateHealthReady(rawUrl: string | undefined, expectedOriginDigest: string): Promise<boolean> {
  if (!rawUrl) return false
  try {
    const url = new URL('/healthz', rawUrl)
    if (
      url.protocol !== 'https:' ||
      identityDigest(url.origin) !== expectedOriginDigest ||
      !await resolvesOnlyToPrivateAddresses(url.hostname)
    ) return false
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(5_000),
      headers: { accept: 'application/json' },
    })
    if (!response.ok) return false
    const body = await response.json() as { status?: unknown }
    return body.status === 'ready'
  } catch {
    return false
  }
}

function localRootlessDockerReady(): boolean {
  const result = spawnSync('docker', ['info', '--format', '{{json .SecurityOptions}}'], {
    encoding: 'utf8',
    timeout: 5_000,
    maxBuffer: 16_384,
  })
  return result.status === 0 && result.stdout.toLowerCase().includes('rootless')
}

function configuredImagesPinned(env: NodeJS.ProcessEnv): boolean {
  return ['PYTHON', 'JAVASCRIPT', 'SQL'].every((language) =>
    PINNED_IMAGE_RE.test(env[`ACADEMY_EVALUATOR_IMAGE_${language}`] ?? ''))
}

async function verifiedActivationAttestation(
  manifest: ReturnType<typeof parseFlagshipActivationManifest>,
  observations: string[],
): Promise<(ReturnType<typeof verifyActivationAttestation> & {
  environment: ActivationAttestationPayload['environment']
}) | null> {
  const attestationPath = process.env.ACADEMY_LAB_STAGING_ATTESTATION_PATH
  const publicKeyPath = process.env.ACADEMY_LAB_STAGING_PUBLIC_KEY_PATH
  if (!attestationPath && !publicKeyPath) return null
  if (!attestationPath || !publicKeyPath) {
    observations.push('Activation attestation and public key paths must be configured together.')
    return null
  }
  try {
    const [attestation, publicKey] = await Promise.all([
      readFile(resolve(attestationPath), 'utf8'),
      readFile(resolve(publicKeyPath), 'utf8'),
    ])
    const envelope = JSON.parse(attestation)
    const verified = verifyActivationAttestation(envelope, publicKey, manifest)
    return { ...verified, environment: envelope.payload.environment }
  } catch {
    observations.push('The activation attestation is missing, invalid, or does not match this release.')
    return null
  }
}

function markdown(report: ReadinessReport): string {
  const rows = STAGING_READINESS_GATES.map((gate) => `| ${gate} | ${report.gates[gate] ? 'PASS' : 'BLOCKED'} |`).join('\n')
  const notes = report.observations.map((note) => `- ${note}`).join('\n') || '- No additional observations.'
  return `# Academy lab evaluator Step 4B readiness\n\n` +
    `- Generated: ${report.generatedAt}\n` +
    `- Release: \`${report.releaseId}\`\n` +
    `- Registry: \`${report.registryVersion}\`\n` +
    `- Candidate labs: ${report.candidateLabCount}\n` +
    `- Status: **${report.status.toUpperCase()}**\n` +
    `- Private material included: no\n\n` +
    `| Gate | Result |\n| --- | --- |\n${rows}\n\n` +
    `## Observations\n\n${notes}\n`
}

async function main(): Promise<void> {
  const observations: string[] = []
  const gates = Object.fromEntries(STAGING_READINESS_GATES.map((gate) => [gate, false])) as Record<Gate, boolean>
  const repoRoot = resolve(process.cwd())
  const manifest = parseFlagshipActivationManifest(activationManifestJson, registryJson)
  gates.manifest_valid = true
  if (Object.values(manifest.authority).includes('unprovisioned')) {
    observations.push('The reviewed signer, evaluator-origin, and database-project authority pins are not provisioned.')
  }

  const privateSpecRoot = process.env.ACADEMY_EVALUATOR_PRIVATE_SPEC_ROOT
  if (privateSpecRoot) {
    try {
      const validatedRoot = await resolvePrivateSpecRoot(repoRoot, resolve(privateSpecRoot))
      await validatePrivatePack(manifest, validatedRoot)
      gates.private_pack_valid = true
    } catch {
      observations.push('The private pack is missing, invalid, symlinked, or does not match the public manifest.')
    }
  } else {
    observations.push('ACADEMY_EVALUATOR_PRIVATE_SPEC_ROOT is not configured.')
  }

  const activation = await verifiedActivationAttestation(manifest, observations)
  gates.rootless_runtime = localRootlessDockerReady() || activation?.environment.rootlessRuntime === 'passed'
  if (!gates.rootless_runtime) observations.push('This host has not proven a rootless Docker evaluator runtime.')

  const attested = activation !== null
  gates.digest_pinned_images = attested || configuredImagesPinned(process.env)
  gates.reference_solutions_passed = attested
  gates.adversarial_probes_passed = attested
  gates.receipts_reconciled = attested

  gates.private_https_ingress = activation?.environment.privateHttpsIngress === 'passed' &&
    await privateHealthReady(
      process.env.ACADEMY_LAB_EVALUATOR_URL,
      manifest.authority.evaluatorOriginSha256,
    )
  gates.migrations_applied = activation?.environment.migrations.join(',') === '0116,0117' &&
    (() => {
      try {
        return identityDigest(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').origin) === manifest.authority.databaseOriginSha256
      } catch {
        return false
      }
    })()
  gates.monitoring_ready = activation?.environment.monitoring === 'passed'
  gates.kill_switch_ready = activation?.environment.masteryWriteKillSwitch === 'passed' &&
    masteryPersistenceEnabled(process.env, manifest.releaseId)

  if (!gates.digest_pinned_images) observations.push('All three runtime images need digest pins or a valid signed activation attestation.')
  if (!gates.migrations_applied) observations.push('Staging has not supplied release-bound evidence that migrations 0116 and 0117 are applied.')
  if (!gates.private_https_ingress) observations.push('The evaluator private HTTPS health probe did not pass.')
  if (!attested) observations.push('No valid Ed25519 activation attestation proves private references, adversarial probes, and receipt reconciliation.')
  if (!gates.monitoring_ready) observations.push('Release-bound monitoring and alerting evidence is absent.')
  if (!gates.kill_switch_ready) observations.push('Mastery writes remain disabled by the two-part release kill switch.')

  const readiness = evaluateStagingReadiness(gates)
  const report: ReadinessReport = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    releaseId: manifest.releaseId,
    registryVersion: manifest.registryVersion,
    candidateLabCount: manifest.labs.length,
    status: readiness.status,
    gates,
    blockedGates: readiness.blockedGates,
    observations,
    privateMaterialIncluded: false,
  }
  const outputDir = resolve('docs/evidence/academy/step-4b')
  await mkdir(outputDir, { recursive: true })
  await Promise.all([
    writeFile(resolve(outputDir, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`, { mode: 0o640 }),
    writeFile(resolve(outputDir, 'latest.md'), markdown(report), { mode: 0o640 }),
  ])
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  if (process.argv.includes('--require-ready') && report.status !== 'ready') process.exitCode = 2
}

main().catch((error) => {
  console.error('[academy-lab-evaluator/staging] readiness verification failed:', error instanceof Error ? error.message : 'unknown error')
  process.exitCode = 1
})
