import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { auditAcademy } from './core'
import { writeAuditArtifacts } from './artifacts'

function main(): void {
  const repoRoot = process.cwd()
  const registryPath = resolve(repoRoot, 'data/academy/registry.json')
  const outputDir = resolve(repoRoot, 'docs/evidence/academy/certification-v2')
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'))
  const generatedAt = new Date().toISOString()
  const report = auditAcademy({ registry, repoRoot, generatedAt })
  const artifacts = writeAuditArtifacts(report, outputDir)

  console.log('Academy Certification Harness V2')
  console.log(`registry: ${report.registryVersion}`)
  console.log(`coverage: ${report.summary.coursesAudited} courses / ${report.summary.lessonsAudited} lessons`)
  console.log(`decisions: ${report.summary.coursesEligible} eligible / ${report.summary.coursesBlocked} blocked / ${report.summary.coursesNeedsRemediation} remediation / ${report.summary.coursesPendingReview} pending`)
  console.log(`certified: ${report.summary.coursesCertified}`)
  console.log(`lab trust: ${report.labTrust}`)
  console.log(`artifacts: ${artifacts.outputDir}`)
}

main()
