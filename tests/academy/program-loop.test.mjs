import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  PROGRAM_VERSION,
  assertRegistryVersion,
  assertSafeCommands,
  buildCourseQueue,
  buildTaskPacket,
  createProgramState,
  recordAttempt,
  recordGreenCheckpoint,
  validateGreenEvidence,
  validateProgramState,
} from '../../tools/academy-program/core.mjs'

const registry = JSON.parse(readFileSync('data/academy/registry.json', 'utf8'))
const graph = JSON.parse(readFileSync('data/academy/flagship-competency-graph.json', 'utf8'))
const board = JSON.parse(
  readFileSync('docs/evidence/academy/certification-v2/academy-quality-board.json', 'utf8'),
)
const backlog = JSON.parse(
  readFileSync('docs/evidence/academy/certification-v2/remediation-backlog.json', 'utf8'),
)

const completedFoundation = [
  'career-engineering_judgment_foundation',
  'programming-fundamentals',
  'python-basics',
  'git-the-terminal',
  'data-structures',
  'career-programming_cs_foundations',
]

test('program queue covers all 32 registry courses exactly once with the flagship path first', () => {
  const queue = buildCourseQueue(registry, graph)
  const flagship = [...new Set(graph.phases.flatMap((phase) => phase.courseSlugs))]

  assert.equal(queue.length, 32)
  assert.equal(new Set(queue.map((item) => item.courseSlug)).size, 32)
  assert.deepEqual(queue.slice(0, flagship.length).map((item) => item.courseSlug), flagship)
  assert.deepEqual(
    queue.slice(flagship.length).map((item) => item.courseSlug),
    registry.courses.map((course) => course.slug).filter((slug) => !flagship.includes(slug)),
  )
  assert.equal(queue.filter((item) => item.courseSlug === 'system-design').length, 1)
})

test('initial state resumes after the proven foundation wave and selects Networking', () => {
  const state = createProgramState({
    registry,
    graph,
    completedCourseSlugs: completedFoundation,
    checkpointCommit: '9d4d71ee',
    generatedAt: '2026-08-28T17:00:00.000Z',
  })

  assert.equal(state.programVersion, PROGRAM_VERSION)
  assert.equal(state.status, 'active')
  assert.equal(state.registryVersion, registry.registryVersion)
  assert.equal(state.scope.registryCourses, 32)
  assert.equal(state.scope.flagshipCourses, 20)
  assert.equal(state.scope.registryRemainderCourses, 12)
  assert.equal(state.current.courseSlug, 'career-networking_fundamentals_advanced_networking')
  assert.equal(state.current.phaseId, 'network-security')
  assert.equal(state.certificationBoundary.courseClaim, 'uncertified')
  assert.equal(state.certificationBoundary.labEvidence, 'practice_only')
  assert.deepEqual(validateProgramState(state, registry, graph), [])
})

test('task packet is registry-bound and separates deterministic work from human review', () => {
  const state = JSON.parse(
    readFileSync('docs/evidence/academy/program-loop/state.json', 'utf8'),
  )
  const course = board.courses.find(
    (candidate) => candidate.courseSlug === state.current.courseSlug,
  )
  const packet = buildTaskPacket({
    state,
    course,
    remediationBacklog: backlog.items,
    generatedAt: '2026-08-28T17:00:00.000Z',
  })

  assert.equal(packet.registryVersion, registry.registryVersion)
  assert.equal(packet.checkpointContract.baselineRegistryVersion, registry.registryVersion)
  assert.equal(packet.checkpointContract.registryTransitionAllowed, true)
  assert.equal(packet.course.courseSlug, state.current.courseSlug)
  assert.equal(packet.course.baseline.deterministicScore, course.deterministicScore)
  assert(packet.remediation.deterministic.some((item) => /restore the standard learning loop/i.test(item.remediation)))
  assert(packet.remediation.deterministic.every((item) => !/complete required .* evidence/i.test(item.remediation)))
  assert(packet.remediation.reviewRequired.some((item) => item.category === 'pedagogy'))
  assert(packet.remediation.reviewRequired.some((item) => item.category === 'sources'))
  assert(packet.definitionOfGreen.every((gate) => gate.kind !== 'certification'))
  assert.equal(packet.trustBoundary.labEvidence, 'practice_only')
  assert.equal(packet.trustBoundary.mayClaimCertified, false)
})

test('GREEN checkpoint evidence fails closed unless every local gate is proven', () => {
  const valid = {
    courseSlug: 'career-networking_fundamentals_advanced_networking',
    baselineRegistryVersion: registry.registryVersion,
    registryVersion: registry.registryVersion,
    commit: '0123456789abcdef',
    attempts: 1,
    gates: {
      focusedTests: { status: 'pass', consecutivePasses: 3 },
      academyAudit: { status: 'pass', consecutivePasses: 1 },
      registryCheck: { status: 'pass', consecutivePasses: 1 },
      typecheck: { status: 'pass', consecutivePasses: 1 },
      build: { status: 'pass', consecutivePasses: 1 },
      diffCheck: { status: 'pass', consecutivePasses: 1 },
    },
    labTrust: 'untrusted_current_runtime',
    certificationStatus: 'uncertified',
  }

  assert.deepEqual(validateGreenEvidence(valid), [])
  assert(
    validateGreenEvidence({
      ...valid,
      gates: { ...valid.gates, focusedTests: { status: 'pass', consecutivePasses: 2 } },
    }).some((error) => error.includes('focusedTests')),
  )
  assert(
    validateGreenEvidence({ ...valid, certificationStatus: 'certified' }).some((error) =>
      error.includes('certificationStatus'),
    ),
  )
  assert(
    validateGreenEvidence({ ...valid, labTrust: 'trusted_controlled_runtime' }).some((error) =>
      error.includes('labTrust'),
    ),
  )
})

test('a GREEN checkpoint reconciles an audited registry transition and advances the queue', () => {
  const state = createProgramState({
    registry,
    graph,
    completedCourseSlugs: completedFoundation,
    checkpointCommit: '9d4d71ee',
    generatedAt: '2026-08-28T17:00:00.000Z',
  })
  state.registryVersion = 'sha256:baseline-networking'
  const evidence = {
    courseSlug: state.current.courseSlug,
    baselineRegistryVersion: 'sha256:baseline-networking',
    registryVersion: registry.registryVersion,
    commit: '0123456789abcdef',
    attempts: 1,
    gates: {
      focusedTests: { status: 'pass', consecutivePasses: 3 },
      academyAudit: { status: 'pass', consecutivePasses: 1 },
      registryCheck: { status: 'pass', consecutivePasses: 1 },
      typecheck: { status: 'pass', consecutivePasses: 1 },
      build: { status: 'pass', consecutivePasses: 1 },
      diffCheck: { status: 'pass', consecutivePasses: 1 },
    },
    labTrust: 'not_applicable',
    certificationStatus: 'uncertified',
  }

  const next = recordGreenCheckpoint(state, evidence, '2026-08-28T18:00:00.000Z')

  assert.equal(next.registryVersion, registry.registryVersion)
  assert.equal(next.completed.at(-1).courseSlug, 'career-networking_fundamentals_advanced_networking')
  assert.equal(next.current.courseSlug, 'career-security_identity')
  assert.equal(next.current.phaseId, 'network-security')
  assert.equal(next.certificationBoundary.labEvidence, 'practice_only')
})

test('three identical failed attempts stop the loop while a changed failure resets repetition', () => {
  const initial = createProgramState({
    registry,
    graph,
    completedCourseSlugs: completedFoundation,
    checkpointCommit: '9d4d71ee',
    generatedAt: '2026-08-28T17:00:00.000Z',
  })
  const first = recordAttempt(initial, {
    status: 'fail',
    failures: ['pedagogy:missing-debug'],
    generatedAt: '2026-08-28T17:01:00.000Z',
  })
  const changed = recordAttempt(first, {
    status: 'fail',
    failures: ['pedagogy:missing-transfer'],
    generatedAt: '2026-08-28T17:02:00.000Z',
  })
  const second = recordAttempt(changed, {
    status: 'fail',
    failures: ['pedagogy:missing-transfer'],
    generatedAt: '2026-08-28T17:03:00.000Z',
  })
  const third = recordAttempt(second, {
    status: 'fail',
    failures: ['pedagogy:missing-transfer'],
    generatedAt: '2026-08-28T17:04:00.000Z',
  })

  assert.equal(first.current.repeatedFailureCount, 1)
  assert.equal(changed.current.repeatedFailureCount, 1)
  assert.equal(third.current.repeatedFailureCount, 3)
  assert.equal(third.status, 'blocked')
  assert.equal(third.stopReason, 'repeated_failure_fingerprint')
})

test('registry drift and unsafe external commands fail closed', () => {
  assert.throws(
    () => assertRegistryVersion('sha256:stale', registry.registryVersion),
    /registry version drift/i,
  )
  assert.doesNotThrow(() =>
    assertSafeCommands([
      'npm run academy:audit:all',
      'npm run academy:registry:check',
      'npm run typecheck',
    ]),
  )
  assert.throws(() => assertSafeCommands(['git push origin main']), /unsafe command/i)
  assert.throws(() => assertSafeCommands(['npm run db:push']), /unsafe command/i)
})

test('public scripts expose the complete Academy Program Loop V1 surface', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))

  for (const name of [
    'academy:program:plan',
    'academy:program:once',
    'academy:program:verify',
    'academy:program:status',
    'academy:program:dry-run',
  ]) {
    assert.equal(typeof packageJson.scripts[name], 'string', `missing ${name}`)
  }
})

test('operator documentation describes the current 32-course persistent loop', () => {
  const program = readFileSync('docs/academy/LMS_BUILD_PROGRAM.md', 'utf8')
  const scorecard = readFileSync('docs/academy/LMS_BUILD_SCORECARD.md', 'utf8')
  const state = JSON.parse(readFileSync('docs/evidence/academy/program-loop/state.json', 'utf8'))

  assert.match(program, /32 canonical courses/)
  assert.match(program, /academy:program:once/)
  assert.match(program, /three consecutive/i)
  assert.doesNotMatch(program, /21-course|all 21 courses/)
  assert(scorecard.includes(`${state.completed.length}/${state.scope.registryCourses}`))
  assert(scorecard.includes(state.current.courseSlug))
  assert.doesNotMatch(scorecard, /01 programming_cs_foundations.*pending/)
})
