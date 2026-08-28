import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { REQUIRED_SECTIONS, type SprintIntensity } from '../../lib/academy/engine'
import {
  loadFlagshipCompetencyGraph,
  validateFlagshipCompetencyGraph,
} from '../../lib/academy/flagship-competency-graph'

const registry = JSON.parse(readFileSync('data/academy/registry.json', 'utf8'))

test('flagship competency graph is a complete, acyclic novice-to-mastery contract', () => {
  const graph = loadFlagshipCompetencyGraph(process.cwd())
  const result = validateFlagshipCompetencyGraph(graph, registry)

  assert.deepEqual(result.errors, [])
  assert.deepEqual(
    graph.levels.map((level) => level.id),
    ['novice', 'foundation', 'practitioner', 'advanced', 'mastery'],
  )
  assert.equal(graph.phases.at(-1)?.id, 'production-capstone')
  assert(graph.phases.every((phase) => phase.competencyIds.length > 0))
  assert(graph.competencies.every((competency) => competency.evidence.length >= 3))
})

test('mastery requires independent build, debugging, explanation, transfer, and spaced retrieval', () => {
  const graph = loadFlagshipCompetencyGraph(process.cwd())
  const evidenceTypes = new Set(
    graph.masteryPolicy.requiredEvidence.map((requirement) => requirement.type),
  )

  for (const required of ['build', 'debug', 'explain', 'transfer', 'retrieve'] as const) {
    assert(evidenceTypes.has(required), `missing mastery evidence type: ${required}`)
  }
  assert.deepEqual(graph.masteryPolicy.retrievalScheduleDays, [2, 7, 21, 45])
  assert.equal(graph.masteryPolicy.labEvidenceBeforeTrustedRuntime, 'practice_only')
  assert.match(graph.masteryPolicy.outcomeDisclaimer, /does not guarantee.*percentile/i)
})

test('every flagship course and mapped lesson resolves to the canonical registry', () => {
  const graph = loadFlagshipCompetencyGraph(process.cwd())
  const result = validateFlagshipCompetencyGraph(graph, registry)

  assert.deepEqual(result.missingCourseSlugs, [])
  assert.deepEqual(result.missingLessonKeys, [])
  assert(result.referencedCourseSlugs.includes('programming-fundamentals'))
  assert(result.referencedCourseSlugs.includes('career-cloud_devops_operations'))
  assert(result.referencedCourseSlugs.includes('career-ai_engineering_rag_eval'))
})

test('broken flagship graphs fail closed on cycles, orphans, and invented mappings', () => {
  const graph = structuredClone(loadFlagshipCompetencyGraph(process.cwd()))
  graph.phases[0].competencyIds = []
  graph.phases[1].prerequisitePhaseIds = ['production-capstone']
  graph.competencies[0].courseMappings = [{ courseSlug: 'invented-course' }]
  graph.competencies[1].courseMappings[0].lessonSlugs = ['invented-lesson']

  const result = validateFlagshipCompetencyGraph(graph, registry)

  assert(result.errors.some((error) => /has no competencies/.test(error)))
  assert(result.errors.some((error) => /dependency cycle/.test(error)))
  assert(result.errors.some((error) => /not assigned to a phase/.test(error)))
  assert.deepEqual(result.missingCourseSlugs, ['invented-course'])
  assert.deepEqual(result.missingLessonKeys, [
    'career-engineering_judgment_foundation/invented-lesson',
  ])
})

test('Programming Fundamentals implements its declared learning loop with proof gates', () => {
  const lessons = JSON.parse(
    readFileSync('data/academy/authoring/programming-fundamentals.lessons.json', 'utf8'),
  ) as Record<string, Array<Record<string, unknown>>>

  assert.equal(Object.keys(lessons).length, 18)
  for (const [slug, blocks] of Object.entries(lessons)) {
    const contract = blocks.find((block) => block.type === 'sprint-contract')
    assert(contract, `${slug}: missing sprint contract`)
    const intensity = contract.intensity as SprintIntensity
    const blockTypes = blocks.map((block) => block.type)

    for (const required of REQUIRED_SECTIONS[intensity]) {
      assert(blockTypes.includes(required), `${slug}: missing ${required}`)
    }

    const gate = blocks.find((block) => block.type === 'unlock-gate')
    assert(Array.isArray(gate?.criteria) && gate.criteria.length >= 3, `${slug}: weak unlock gate`)
    assert(
      (gate.criteria as string[]).some((criterion) => /test|prove|output|evidence|demonstrate/i.test(criterion)),
      `${slug}: unlock gate lacks observable proof`,
    )
  }
})
